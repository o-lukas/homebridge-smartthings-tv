import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLUGIN_NAME } from './settings';
import { TvAccessory } from './tvAccessory';
import { SmartThingsClient, BearerTokenAuthenticator, Device } from '@smartthings/core-sdk';

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

    this.api.on('didFinishLaunching', async () => {
      this.log.debug('Executed didFinishLaunching callback');
      await this.discoverDevices(config.token, config.deviceMappings);
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
        await this.registerTvDevice(client, device, deviceMappings?.find(mapping => mapping.deviceId === device.deviceId));
        break;

      default:
        this.log.debug('Ignoring SmartThingsDevice %s because device type %s is not implemented',
          device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId,
          device.ocf?.ocfDeviceType);
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

    const tv = new TvAccessory(device, component, client, this.log, this, accessory, this.config.capabilityLogging,
      this.config.registerApplications, this.config.registerPictureModes, this.config.registerSoundModes,
      deviceMapping?.macAddress, deviceMapping?.ipAddress);
    await tv.registerCapabilities();
  }
}
