import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform';
import { SmartThingsClient, Device, Component, CapabilityStatus } from '@smartthings/core-sdk';
import { SmartThingsAccessory } from './smartThingsAccessory';

/**
 * Class implements a slider accessory to execute a capability commmand.
 */
export class SliderAccessory extends SmartThingsAccessory {
  private readonly service: Service;
  // stores the last value before the off functionality has been used
  // so this value can be restored when turning back on
  private lastValueBeforeOff = 0;

  constructor(
    device: Device,
    component: Component,
    client: SmartThingsClient,
    log: Logger,
    platform: SmartThingsPlatform,
    accessory: PlatformAccessory,
    private readonly capability: string,
    private readonly command: string,
    private readonly onGet: (value: CapabilityStatus | null) => CharacteristicValue,
    private readonly onSet: (value: CharacteristicValue) => (string | number | object)[],
  ) {
    super(device, component, client, platform, accessory, log);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) ??
      this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleGetOn.bind(this))
      .onSet(this.handleSetOn.bind(this));
    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .onGet(this.handleGetBrightness.bind(this))
      .onSet(this.handleSetBrightness.bind(this));
  }

  private async handleGetOn() : Promise<CharacteristicValue> {
    return (await this.handleGetBrightness() as number) > 0;
  }

  private async handleSetOn(value: CharacteristicValue) {
    if(value as boolean) {
      this.logDebug('Turning back on - set %s to: %s', this.capability, this.lastValueBeforeOff);
      await this.executeCommand(this.capability, this.command, [this.lastValueBeforeOff]);
    }else{
      this.lastValueBeforeOff = await this.handleGetBrightness() as number;
      this.logDebug('Turning off - saving %s last value %s and setting value to: %s', this.capability, this.lastValueBeforeOff, 0);
      await this.executeCommand(this.capability, this.command, [0]);
    }
  }

  private async handleGetBrightness(): Promise<CharacteristicValue> {
    const apiValue = await this.getCapabilityStatus(this.capability);
    this.logDebug('Get %s value: %s', this.capability, apiValue);
    return this.onGet(apiValue);
  }

  private async handleSetBrightness(value: CharacteristicValue) {
    const apiValue = this.onSet(value);
    this.logDebug('Set %s to: %s', this.capability, apiValue);
    await this.executeCommand(this.capability, this.command, apiValue);
  }
}
