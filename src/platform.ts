import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic, UnknownContext } from 'homebridge';

import { PLUGIN_NAME } from './settings';
import { TvAccessory } from './tvAccessory';
import { SmartThingsClient, BearerTokenAuthenticator, Device } from '@smartthings/core-sdk';

class DeviceMapping {
  constructor(public readonly deviceId: string, public readonly macAddress: string, public readonly ipAddress: string) {
  }
}

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
    this.log.debug('Finished initializing platform:', this.config.name);

    if (!config.token) {
      this.log.error('SmartThings API token must be configured');
      return;
    }

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      this.discoverDevices(config.token, config.deviceMappings);
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  discoverDevices(token: string, deviceMappings: [DeviceMapping]) {
    const client = new SmartThingsClient(new BearerTokenAuthenticator(token));

    client.devices.list().then(devices => {
      devices.forEach(device => {
        this.registerDevice(client, device, deviceMappings);
      });
    });
  }

  registerDevice(client: SmartThingsClient, device: Device, deviceMappings: [DeviceMapping]) {
    const existingAccessory = this.accessories.find(a => a.UUID === device.deviceId);

    switch (device.ocf?.ocfDeviceType) {
      case 'oic.d.tv':
        this.registerTvDevice(client, device, existingAccessory, deviceMappings.find(mapping => mapping.deviceId === device.deviceId));
        break;

      default:
        this.log.info('Ignoring SmartThingsDevice:', device, 'because device type', device.ocf?.ocfDeviceType, 'is not implemented');
        break;
    }
  }

  registerTvDevice(client: SmartThingsClient, device: Device, accessory: PlatformAccessory<UnknownContext> | undefined,
    deviceMapping: DeviceMapping | undefined) {
    const component = device.components?.at(0);
    if (!component) {
      this.log.info('Can\'t register TV accessory because (main) component does not exist');
      return;
    }

    this.log.info(accessory ? 'Restoring existing accessory from cache:' : 'Adding new accessory:',
      device.name ? device.name + ' (' + device.deviceId + ')' : device.deviceId);

    if (!accessory) {
      accessory = new this.api.platformAccessory(device.name ?? device.deviceId, device.deviceId);
      accessory.context.device = device;
      accessory.category = this.api.hap.Categories.TELEVISION;
      this.api.publishExternalAccessories(PLUGIN_NAME, [accessory]);
    }

    new TvAccessory(this, accessory, device, component, client, deviceMapping?.macAddress, deviceMapping?.ipAddress);
  }
}
