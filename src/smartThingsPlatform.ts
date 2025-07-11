import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
  CharacteristicValue,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { TvAccessory } from './tvAccessory.js';
import {
  SmartThingsClient,
  Device,
  Component,
  CapabilityStatus,
  RefreshTokenAuthenticator,
  RefreshTokenStore,
  AuthData,
  RefreshData,
  Authenticator,
  BearerTokenAuthenticator,
} from '@smartthings/core-sdk';
import { SwitchAccessory } from './switchAccessory.js';
import { SliderAccessory } from './sliderAccessory.js';
import { SoundbarAccessory } from './soundbarAccessory.js';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

/**
 * Class implements the configured Device to mac and ip address mappings.
 */
class DeviceMapping {
  constructor(public readonly deviceId: string,
    public readonly nameOverride: string,
    public readonly macAddress: string,
    public readonly ipAddress: string,
    public readonly inputSources: [{ name: string; id: string }],
    public readonly applications: [{ name: string; ids: [string] }],
    public readonly validateApplications: boolean,
    public readonly infoKey: string,
    public readonly category: number) {
  }
}

/**
 * Class implements the plugin platform.
 */
export class SmartThingsPlatform implements DynamicPlatformPlugin, RefreshTokenStore {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  private configPath = process.env.UIX_CONFIG_PATH || path.join('./', 'config.json');
  private authData: AuthData | undefined;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform: %s', this.config.name);

    this.Service = this.api.hap.Service;
    this.Characteristic = this.api.hap.Characteristic;

    if (!this.validateConfig(config)) {
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      let deviceBlocklist = config.deviceBlocklist as [string];
      if (this.config.deviceBlacklist) {
        deviceBlocklist = config.deviceBlacklist as [string];
        this.log.warn('Config property deviceBlacklist has been renamed to deviceBlocklist \
 - adjust your configuration because deviceBlacklist will be removed in future versions');
      }

      let authenticator = undefined;
      switch (this.config.tokenType) {
        case 'oauth':
          authenticator = new RefreshTokenAuthenticator(config.oauthRefreshToken as string, this);
          break;

        case 'pat':
        default:
          authenticator = new BearerTokenAuthenticator(config.token as string);
      }

      this.discoverDevices(authenticator,
        deviceBlocklist ?? [],
        config.deviceMappings as [DeviceMapping] ?? [],
        config.tvDeviceTypes as [string] ?? ['oic.d.tv', 'x.com.st.d.monitor'],
        config.soundbarDeviceTypes as [string] ?? ['oic.d.networkaudio']);
    });
  }

  /**
   * @inheritdoc
   */
  async getRefreshData(): Promise<RefreshData> {
    const config = this.getPlatformConfig();
    return {
      refreshToken: this.authData?.refreshToken ?? config.oauthRefreshToken,
      clientId: config.oauthClientId,
      clientSecret: config.oauthClientSecret,
    };
  }

  /**
   * @inheritdoc
   */
  async putAuthData(data: AuthData): Promise<void> {
    this.log.debug('Updating auth data: %s', JSON.stringify(data, null, 4));
    this.authData = data;

    const config = this.getPlatformConfig();
    config.oauthRefreshToken = data.refreshToken;
    this.savePlatformConfig(config);
  }

  /**
   * @inheritdoc
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache: %s', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * Reads the platform configuration from the file system.
   *
   * @returns the platform configuration
   */
  getPlatformConfig() {
    try {
      const readConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      return readConfig.platforms.find((p: { platform: string; }) => p.platform === this.config.platform);
    } catch (error) {
      console.error('Error when reading configuration:', error);
      return null;
    }
  }

  /**
   * Writes the platform configuration passed in to the file system.
   *
   * @param platformConfig the new platform configuration
   */
  savePlatformConfig(platformConfig: unknown) {
    try {
      const newConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      const platform = newConfig.platforms.find((p: { platform: string; }) => p.platform === this.config.platform);
      newConfig.platforms[newConfig.platforms.indexOf(platform)] = platformConfig;
      fs.writeFileSync(this.configPath, JSON.stringify(newConfig, null, 4), 'utf8');
    } catch (error) {
      console.error('Error when writing configuration:', error);
    }
  }

  /**
   * Uses the SmartThings API to discover and register the available devices.
   *
   * @param token the SmartThings API token
   * @param deviceBlocklist the device ids to be ignored
   * @param deviceMappings the array of configured DeviceMapping
   * @param tvDeviceTypes the array of configured TV device types
   * @param soundbarDeviceTypes the array of configured SoundBar device types
   */
  async discoverDevices(authenticator: Authenticator, deviceBlocklist: [string], deviceMappings: [DeviceMapping],
    tvDeviceTypes: [string], soundbarDeviceTypes: [string]) {
    const client = new SmartThingsClient(authenticator);

    let externalAccessories: PlatformAccessory[] = [];

    try {
      const devices = await client.devices.list();
      this.log.debug('SmartThings API returned %i devices', devices.length);

      for (const device of devices) {
        if (deviceBlocklist.includes(device.deviceId)) {
          this.log.debug('Ignoring SmartThings device %s because it is on the blocklist',
            device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId);
        } else {
          externalAccessories = externalAccessories.concat(
            await this.registerDevice(client, device, deviceMappings, tvDeviceTypes, soundbarDeviceTypes));
        }
      }
    } catch (error) {
      let errorMessage = 'unknown';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      let statusCode = -1;
      if (axios.isAxiosError(error)) {
        statusCode = error.response?.status ?? -1;
      }

      this.log.error('Error when getting devices: [%s] %s', statusCode, errorMessage);
    }

    this.log.debug('Publishing %s external accessories', externalAccessories.length);
    this.api.publishExternalAccessories(PLUGIN_NAME, externalAccessories);
  }

  /**
   * Registers a SmartThings Device for Homebridge.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param deviceMappings the array of configured DeviceMapping
   * @param tvDeviceTypes the array of configured TV device types
   * @param soundbarDeviceTypes the array of configured SoundBar device types
   * @returns the PlatformAccessory that must be published as external accessory or undefined
   * if accessory must not be published as external accessory
   */
  async registerDevice(client: SmartThingsClient, device: Device, deviceMappings: [DeviceMapping],
    tvDeviceTypes: [string], soundbarDeviceTypes: [string]): Promise<PlatformAccessory[]> {
    const deviceType = device.ocf?.ocfDeviceType;

    if (!deviceType) {
      this.log.error('Ignoring SmartThings device %s because it has no device type',
        device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId);
      return [];
    }

    const deviceMapping = deviceMappings.find(mapping => mapping.deviceId === device.deviceId);

    if (tvDeviceTypes.includes(deviceType)) {
      return await this.registerTvDevice(client, device, deviceMapping);
    } else if (soundbarDeviceTypes.includes(deviceType)) {
      return await this.registerSoundbarDevice(client, device, deviceMapping);
    }

    this.log.debug('Ignoring SmartThings device %s because device type %s is not in list of implemented/configured types (%s): %s',
      device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId,
      device.ocf?.ocfDeviceType, tvDeviceTypes.concat(soundbarDeviceTypes).join(', '),
      JSON.stringify(device, null, 2));
    return [];
  }

  /**
   * Registers a SmartThings TV Device for Homebridge.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param accessory the cached PlatformAccessory or undefined if no cached PlatformAccessory exists
   * @param deviceMappings the array of configured DeviceMapping
   * @returns the PlatformAccessory that must be published as external accessory or undefined
   * if device could not be registered
   */
  async registerTvDevice(client: SmartThingsClient, device: Device, deviceMapping: DeviceMapping | undefined): Promise<PlatformAccessory[]> {
    this.log.info('Adding new TV accessory: %s', device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId);
    this.log.debug('New TV accessory\'s properties: %s', JSON.stringify(device, null, 4));

    const component = device.components?.at(0);
    if (!component) {
      this.log.info('Can\'t register TV accessory because (main) component does not exist');
      return [];
    }

    let displayName = device.name ?? device.deviceId;
    if (deviceMapping?.nameOverride) {
      this.log.info('Overriding device default name \'%s\' with configured display name \'%s\'', device.name, deviceMapping.nameOverride);
      displayName = deviceMapping.nameOverride;
    }

    const accessory = new this.api.platformAccessory(displayName, device.deviceId);
    accessory.context.device = device;
    accessory.category = deviceMapping?.category ?? this.api.hap.Categories.TELEVISION;

    const tv = new TvAccessory(displayName, device, component, client, this.log, this, accessory,
      this.config.capabilityLogging as boolean ?? false,
      this.config.registerApplications as boolean ?? false,
      deviceMapping?.validateApplications as boolean ?? true,
      this.config.pollInterval as number ?? undefined,
      this.config.cyclicCallsLogging as boolean ?? false,
      deviceMapping?.macAddress,
      deviceMapping?.ipAddress,
      deviceMapping?.inputSources,
      deviceMapping?.applications,
      deviceMapping?.infoKey,
    );
    await tv.registerCapabilities();

    if (this.config.registerPictureModes) {
      const modes = await tv.getPictureModes();
      if (modes) {
        this.registerModeSwitches(client, device, component, false, modes);
      } else {
        this.log.warn('Picture mode switches can not be registered because required capability is missing or there are no picture modes');
      }
    }

    if (this.config.registerSoundModes) {
      const modes = await tv.getSoundModes();
      if (modes) {
        this.registerModeSwitches(client, device, component, false, modes);
      } else {
        this.log.warn('Sound mode switches can not be registered because required capability is missing or there are no sound modes');
      }
    }

    if (this.config.registerAmbientSwitch) {
      if (tv.validateCapability('samsungvd.ambient')) {
        const name = 'Ambient mode';
        this.registerSwitch(client, device, component, name, this.api.hap.uuid.generate(`${device.deviceId}${name}`), 'samsungvd.ambient',
          'setAmbientOn', undefined, false);
      } else {
        this.log.warn('Ambient mode switch can not be registered because required capability is missing');
      }
    }

    if (this.config.registerAmbientModes) {
      const modes = await tv.getAmbientModes();
      if (modes) {
        this.registerModeSwitches(client, device, component, false, modes);
      } else {
        this.log.warn('Ambient mode switches can not be registered because required capability is missing or there are no ambient modes');
      }
    }

    if (this.config.registerInputSwitches) {
      const sources = await tv.getInputSources();
      if (sources) {
        this.registerModeSwitches(client, device, component, true, sources);
      }
    }

    if (this.config.registerVolumeSlider) {
      if (tv.hasSpeakerService()) {
        this.registerVolumeSlider(client, device, component);
      } else {
        this.log.warn('Volume slider can not be registered because TV has no volume capabilities');
      }
    }

    return [accessory];
  }

  /**
   * Registers a SmartThings Soundbar Device for Homebridge.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param accessory the cached PlatformAccessory or undefined if no cached PlatformAccessory exists
   * @param deviceMappings the array of configured DeviceMapping
   * @returns the PlatformAccessory that must be published as external accessory or undefined
   * if device could not be registered
   */
  async registerSoundbarDevice(client: SmartThingsClient, device: Device, deviceMapping: DeviceMapping | undefined): Promise<PlatformAccessory[]> {
    this.log.info('Adding new soundbar accessory: %s', device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId);
    this.log.debug('New Soundbar accessory\'s properties: %s', JSON.stringify(device, null, 4));

    const component = device.components?.at(0);
    if (!component) {
      this.log.info('Can\'t register soundbar accessory because (main) component does not exist');
      return [];
    }

    let displayName = device.name ?? device.deviceId;
    if (deviceMapping?.nameOverride) {
      this.log.info('Overriding device default name \'%s\' with configured display name \'%s\'', device.name, deviceMapping.nameOverride);
      displayName = deviceMapping.nameOverride;
    }

    const accessory = new this.api.platformAccessory(displayName, device.deviceId);
    accessory.context.device = device;
    accessory.category = deviceMapping?.category ?? this.api.hap.Categories.TV_SET_TOP_BOX;

    const soundbar = new SoundbarAccessory(displayName, device, component, client, this.log, this, accessory,
      this.config.capabilityLogging as boolean ?? false,
      this.config.pollInterval as number ?? undefined,
      this.config.cyclicCallsLogging as boolean ?? false,
      deviceMapping?.macAddress,
      deviceMapping?.ipAddress,
      deviceMapping?.inputSources,
    );
    await soundbar.registerCapabilities();

    if (this.config.registerVolumeSlider) {
      this.registerVolumeSlider(client, device, component);
    }

    return [accessory];
  }

  /**
   * Register the modes of the device passed in as platform accessories.
   * Handles caching of accessories as well.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param component the SmartThings Device's Component
   * @param stateful flag if switch will be stateful (set to TRUE to get capability status and reflect changes in switch)
   * @param modes the modes to register
   */
  registerModeSwitches(client: SmartThingsClient, device: Device, component: Component, stateful: boolean,
    modes: {
      capability: string; command: string; prefix: string; values: { id: string; name: string; value: string }[];
    }) {
    for (const mode of modes.values) {
      const id = this.api.hap.uuid.generate(`${device.deviceId}${modes.prefix}${mode.id}`);
      const name = `${modes.prefix} ${mode.name}`;
      this.registerSwitch(client, device, component, name, id, modes.capability, modes.command, mode.value, stateful);
    }
  }

  /**
   * Registers a switch for parameters passed in.
   * Handles caching of accessories as well.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param component the SmartThings Device's Component
   * @param name the switch's name
   * @param id the switch's id
   * @param capability the capability identifier
   * @param command the command identifier
   * @param value the value to set
   * @param stateful flag if switch will be stateful (set to TRUE to get capability status and reflect changes in switch)
   */
  registerSwitch(client: SmartThingsClient, device: Device, component: Component, name: string, id: string, capability: string,
    command: string, value: string | undefined, stateful: boolean) {
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === id);
    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache: %s', existingAccessory.displayName);

      new SwitchAccessory(device, component, client, this.log, this, existingAccessory, capability, command, value, stateful);
    } else {
      const accessory = new this.api.platformAccessory(name, id);
      accessory.context.device = device;
      accessory.category = this.api.hap.Categories.SWITCH;

      new SwitchAccessory(device, component, client, this.log, this, accessory, capability, command, value, stateful);

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  /**
   * Register the volume of the device passed in as platform accessory.
   * Handles caching of accessories as well.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param component the SmartThings Device's Component
   */
  registerVolumeSlider(client: SmartThingsClient, device: Device, component: Component) {
    const id = this.api.hap.uuid.generate(`${device.deviceId}volume`);
    const name = 'Volume';

    const existingAccessory = this.accessories.find(accessory => accessory.UUID === id);
    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache: %s', existingAccessory.displayName);

      new SliderAccessory(device, component, client, this.log, this, existingAccessory, 'audioVolume', 'setVolume',
        (value: CapabilityStatus | null): CharacteristicValue => {
          return value?.volume.value as number ?? 0;
        },
        (value: CharacteristicValue): (string | number | object)[] => {
          return [value as number ?? 0];
        },
        this.config.pollInterval as number ?? undefined,
        this.config.cyclicCallsLogging as boolean ?? false,
      );
    } else {
      const accessory = new this.api.platformAccessory(name, id);
      accessory.context.device = device;
      accessory.category = this.api.hap.Categories.LIGHTBULB;

      new SliderAccessory(device, component, client, this.log, this, accessory, 'audioVolume', 'setVolume',
        (value: CapabilityStatus | null): CharacteristicValue => {
          return value?.volume.value as number ?? 0;
        },
        (value: CharacteristicValue): (string | number | object)[] => {
          return [value as number ?? 0];
        },
        this.config.pollInterval as number ?? undefined,
        this.config.cyclicCallsLogging as boolean ?? false,
      );

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  /**
   * Validates the config and returns validation result.
   * Basically checks that authentication token setup is correct.
   *
   * @param config the PlatformConfig
   * @returns TRUE in case config is valid - FALSE otherwise
   */
  private validateConfig(config: PlatformConfig) {
    switch (this.config.tokenType) {
      case 'oauth':
        if (!config.oauthClientId) {
          this.log.error('OAuth client id must be set for OAuth token type');
          return false;
        }
        if (!config.oauthClientSecret) {
          this.log.error('OAuth client secret must be set for OAuth token type');
          return false;
        }
        if (!config.oauthRefreshToken) {
          this.log.error('OAuth refresh token must be set for OAuth token type');
          return false;
        }
        break;

      case 'pat':
      default:
        if (!config.token) {
          this.log.error('SmartThings personal access token must be set for PAT token type');
          return false;
        }
    }

    return true;
  }
}
