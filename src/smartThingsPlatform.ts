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

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { TvAccessory } from './tvAccessory';
import { SmartThingsClient, BearerTokenAuthenticator, Device, Component, CapabilityStatus } from '@smartthings/core-sdk';
import { SwitchAccessory } from './switchAccessory';
import { SliderAccessory } from './sliderAccessory';

/**
 * Class implements the configured Device to mac and ip address mappings.
 */
class DeviceMapping {
  constructor(public readonly deviceId: string, public readonly macAddress: string, public readonly ipAddress: string) {
  }
}

/**
 * Class implements the plugin platform.
 */
export class SmartThingsPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform: %s', this.config.name);

    if (!config.token) {
      this.log.error('SmartThings API token must be configured');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      this.log.debug('Executed didFinishLaunching callback');
      void this.discoverDevices(config.token as string, config.deviceMappings as [DeviceMapping] ?? []);
    });
  }

  /**
   * @inheritdoc
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache: %s', accessory.displayName);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * Uses the SmartThings API to discover and register the available devices.
   *
   * @param token the SmartThings API token
   * @param deviceMappings the array of configured DeviceMapping
   */
  async discoverDevices(token: string, deviceMappings: [DeviceMapping]) {
    const client = new SmartThingsClient(new BearerTokenAuthenticator(token));

    try {
      for (const device of await client.devices.list()) {
        await this.registerDevice(client, device, deviceMappings);
      }
    } catch (error) {
      let errorMessage = 'unknown';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.log.error('Error when getting devices: %s', errorMessage);
    }
  }

  /**
   * Registers a SmartThings Device for Homebridge.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param deviceMappings the array of configured DeviceMapping
   */
  async registerDevice(client: SmartThingsClient, device: Device, deviceMappings: [DeviceMapping]) {
    switch (device.ocf?.ocfDeviceType) {
      case 'oic.d.tv':
      case 'x.com.st.d.monitor':
        await this.registerTvDevice(client, device, deviceMappings.find(mapping => mapping.deviceId === device.deviceId));
        break;

      default:
        this.log.debug('Ignoring SmartThings device %s because device type %s is not implemented: %s',
          device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId,
          device.ocf?.ocfDeviceType, JSON.stringify(device, null, 2));
        break;
    }
  }

  /**
   * Registers a SmartThings TV Device for Homebridge.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param accessory the cached PlatformAccessory or undefined if no cached PlatformAccessory exists
   * @param deviceMappings the array of configured DeviceMapping
   */
  async registerTvDevice(client: SmartThingsClient, device: Device, deviceMapping: DeviceMapping | undefined) {
    this.log.info('Adding new accessory: %s', device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId);

    const component = device.components?.at(0);
    if (!component) {
      this.log.info('Can\'t register TV accessory because (main) component does not exist');
      return;
    }

    const accessory = new this.api.platformAccessory(device.name ?? device.deviceId, device.deviceId);
    accessory.context.device = device;
    accessory.category = this.api.hap.Categories.TELEVISION;
    this.api.publishExternalAccessories(PLUGIN_NAME, [accessory]);

    const tv = new TvAccessory(device, component, client, this.log, this, accessory,
      this.config.capabilityLogging as boolean, this.config.registerApplications as boolean,
      deviceMapping?.macAddress, deviceMapping?.ipAddress);
    await tv.registerCapabilities();

    if (this.config.registerPictureModes) {
      const modes = await tv.getPictureModes();
      if (modes) {
        this.registerModeSwitches(client, device, component, modes);
      }
    }

    if (this.config.registerSoundModes) {
      const modes = await tv.getSoundModes();
      if (modes) {
        this.registerModeSwitches(client, device, component, modes);
      }
    }

    if(this.config.registerVolumeSlider){
      if(tv.hasSpeakerService()){
        this.registerVolumeSlider(client, device, component);
      } else {
        this.log.warn('Volume slider can not be registered because TV has no volume capabilities');
      }
    }
  }

  /**
   * Register the modes of the device passed in as platform accessories.
   * Handles caching of accessories as well.
   *
   * @param client the SmartThingsClient used to send API calls
   * @param device the SmartThings Device
   * @param component the SmartThings Device's Component
   * @param modes the modes to register
   */
  registerModeSwitches(client: SmartThingsClient, device: Device, component: Component,
    modes: {
      capability: string; command: string; prefix: string; modes: { id: string; name: string }[];
    }) {
    for (const mode of modes.modes) {
      const id = this.api.hap.uuid.generate(`${device.deviceId}${modes.prefix}${mode.id}`);
      const name = `${modes.prefix} ${mode.name}`;

      const existingAccessory = this.accessories.find(accessory => accessory.UUID === id);
      if (existingAccessory) {
        this.log.info('Restoring existing accessory from cache: %s', existingAccessory.displayName);

        new SwitchAccessory(device, component, client, this.log, this, existingAccessory, modes.capability,
          modes.command, mode.name);
      } else {
        const accessory = new this.api.platformAccessory(name, id);
        accessory.context.device = device;
        accessory.category = this.api.hap.Categories.SWITCH;

        new SwitchAccessory(device, component, client, this.log, this, accessory, modes.capability,
          modes.command, mode.name);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
      }
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
        (value: CapabilityStatus | null) : CharacteristicValue => {
          return value?.volume.value as number;
        },
        (value: CharacteristicValue) : (string | number | object)[]=> {
          return [value as number];
        },
      );
    } else {
      const accessory = new this.api.platformAccessory(name, id);
      accessory.context.device = device;
      accessory.category = this.api.hap.Categories.LIGHTBULB;

      new SliderAccessory(device, component, client, this.log, this, accessory, 'audioVolume', 'setVolume',
        (value: CapabilityStatus | null) : CharacteristicValue => {
          return value?.volume.value as number;
        },
        (value: CharacteristicValue) : (string | number | object)[]=> {
          return [value as number];
        },
      );

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }
}
