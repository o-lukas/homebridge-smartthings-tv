import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform.js';
import { SmartThingsClient, Device, Component } from '@smartthings/core-sdk';
import { SmartThingsAccessory } from './smartThingsAccessory.js';

/**
 * Class implements a stateless switch accessory to execute a capability commmand.
 */
export class SwitchAccessory extends SmartThingsAccessory {
  private readonly service: Service;

  constructor(
    device: Device,
    component: Component,
    client: SmartThingsClient,
    log: Logger,
    platform: SmartThingsPlatform,
    accessory: PlatformAccessory,
    private readonly capability: string,
    private readonly command: string,
    private readonly value: string,
  ) {
    super(device, component, client, platform, accessory, log);

    this.service = this.accessory.getService(this.platform.Service.Switch) ??
      this.accessory.addService(this.platform.Service.Switch);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleGet.bind(this))
      .onSet(this.handleSet.bind(this));
  }

  private handleGet(): CharacteristicValue {
    return false;
  }

  private async handleSet(value: CharacteristicValue) {
    if (value === true) {
      this.logDebug('Set %s mode to: %s', this.capability, this.value);
      await this.executeCommand(this.capability, this.command, [this.value]);

      setTimeout(() => {
        this.service.setCharacteristic(this.platform.Characteristic.On, false);
      }, 500);
    }
  }
}
