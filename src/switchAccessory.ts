import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform.js';
import { SmartThingsClient, Device, Component } from '@smartthings/core-sdk';
import { SmartThingsAccessory } from './smartThingsAccessory.js';

/**
 * Class implements a switch accessory to execute a capability commmand and get capability status.
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
    private readonly stateful: boolean = false,
  ) {
    super(device, component, client, platform, accessory, log);

    this.service = this.accessory.getService(this.platform.Service.Switch) ??
      this.accessory.addService(this.platform.Service.Switch);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleGet.bind(this))
      .onSet(this.handleSet.bind(this));
  }

  private async handleGet(): Promise<CharacteristicValue> {
    if (!this.stateful) {
      return false;
    }

    const status = await this.getCapabilityStatus(this.capability, true);
    this.logDebug('Get %s mode: %s %s %s', this.capability, this.value, this.value === status?.inputSource.value ? '==' : '!=', status?.inputSource.value);
    return status?.inputSource.value as string === this.value;
  }

  private async handleSet(value: CharacteristicValue) {
    if (this.stateful || value === true) {
      this.logDebug('Set %s mode to: %s', this.capability, this.value);
      await this.executeCommand(this.capability, this.command, [this.value]);

      setTimeout(() => {
        this.service.setCharacteristic(this.platform.Characteristic.On, false);
      }, 500);
    }
  }
}
