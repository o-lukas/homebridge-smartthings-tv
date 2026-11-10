import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform.js';
import { SmartThingsClient, Device, Component } from '@smartthings/core-sdk';
import { SmartThingsAccessory } from './smartThingsAccessory.js';
import { TvAccessory } from './tvAccessory.js';

/**
 * Class implements a stateful switch accessory that turns "Art mode" on and off.
 */
export class ArtModeSwitchAccessory extends SmartThingsAccessory {
  private readonly service: Service;

  constructor(
    device: Device,
    component: Component,
    client: SmartThingsClient,
    log: Logger,
    platform: SmartThingsPlatform,
    accessory: PlatformAccessory,
    private readonly pollingInterval: number | undefined,
    private readonly cyclicCallsLogging: boolean,
    private readonly tv: TvAccessory,
  ) {
    super(device, component, client, platform, accessory, log);

    this.service = this.accessory.getService(this.platform.Service.Switch) ??
      this.accessory.addService(this.platform.Service.Switch);
    this.service.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.handleGet.bind(this))
      .onSet(this.handleSet.bind(this));

    this.startStatusPolling('tvChannel', this.service, this.platform.Characteristic.On,
      this.handleGet.bind(this, this.cyclicCallsLogging), this.pollingInterval);
  }

  private async handleGet(log = true): Promise<CharacteristicValue> {
    return await this.tv.isInArtMode(log);
  }

  private async handleSet(value: CharacteristicValue) {
    this.logDebug('Set art mode to: %s', value);
    if (value) {
      await this.tv.enterArtMode();
    } else if (await this.tv.isInArtMode()) {
      // Only act while in art mode so this never changes input on a TV that is showing something else
      await this.tv.leaveArtMode();
    }
  }
}
