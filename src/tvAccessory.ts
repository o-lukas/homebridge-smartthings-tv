import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { SmartThingsPlatform } from './platform';
import { SmartThingsClient, Device, Component, Capability } from '@smartthings/core-sdk';

class SamsungVdMediaInputSource {
  public readonly id: string;
  public readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class TvAccessory {
  private service: Service;
  private speakerService: Service;
  private inputSources: Service[] = [];

  constructor(
    private readonly platform: SmartThingsPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device,
    private readonly component: Component,
    private readonly client: SmartThingsClient,
  ) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Name, device.name ?? device.deviceId)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, device.ocf?.firmwareVersion ?? 'Unknown')
      .setCharacteristic(this.platform.Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(this.platform.Characteristic.Model, device.ocf?.modelNumber ?? 'Unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.deviceId)
      .setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

    this.service = this.accessory.getService(this.platform.Service.Television)
      || this.accessory.addService(this.platform.Service.Television);
    this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
      || this.accessory.addService(this.platform.Service.TelevisionSpeaker);
    this.service.addLinkedService(this.speakerService);

    this.registerCapabilities(component);
  }

  async registerCapabilities(component: Component) {
    this.platform.log.info('Registering capabilities for component:', component.id);

    component.capabilities.forEach(reference => {
      this.client.capabilities.get(reference.id, reference.version ?? 0)
        .then(capability => this.registerCapability(capability));
    });
  }

  registerCapability(capability: Capability) {
    switch (capability.id) {
      case 'switch':
        this.platform.log.info('Registering capability:', capability.name);
        this.service.getCharacteristic(this.platform.Characteristic.Active)
          .onSet(this.setActive.bind(this))
          .onGet(this.getActive.bind(this));
        break;

      case 'audioVolume':
        this.platform.log.info('Registering capability:', capability.name);
        this.speakerService
          .setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE)
          .setCharacteristic(this.platform.Characteristic.VolumeControlType, this.platform.Characteristic.VolumeControlType.ABSOLUTE);
        this.speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
          .onSet(this.setVolume.bind(this))
          .onGet(this.getVolume.bind(this));
        break;

      case 'audioMute':
        this.platform.log.info('Registering capability:', capability.name);
        this.speakerService.getCharacteristic(this.platform.Characteristic.Mute)
          .onSet(this.setMute.bind(this))
          .onGet(this.getMute.bind(this));
        break;

      case 'samsungvd.mediaInputSource':
        this.platform.log.info('Registering capability:', capability.name);
        this.registerInputSource();
        this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
          .onSet(this.setActiveIdentifier.bind(this))
          .onGet(this.getActiveIdentifier.bind(this));
        break;
    }
  }

  guessInputSourceType(inputSourceId: string): number {
    if (inputSourceId.startsWith('HDMI')) {
      return this.platform.Characteristic.InputSourceType.HDMI;
    } else if (inputSourceId === 'dtv') {
      return this.platform.Characteristic.InputSourceType.TUNER;
    } else {
      return this.platform.Characteristic.InputSourceType.APPLICATION;
    }
  }

  async registerInputSource() {
    this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'samsungvd.mediaInputSource')
      .then(status => {
        const supportedInputSources = [...new Set(status.supportedInputSourcesMap.value as Array<SamsungVdMediaInputSource>)];

        this.inputSources.forEach(inputSource => this.service.removeLinkedService(inputSource));
        this.inputSources = [];

        for (let i = 0; i < supportedInputSources.length; i++) {
          const inputSource = supportedInputSources[i];
          this.platform.log.info('Registering input source:', inputSource.name);

          const inputSourceService = this.accessory.getService(inputSource.id)
            || this.accessory.addService(this.platform.Service.InputSource, inputSource.id, inputSource.id);
          inputSourceService.name = inputSource.id;
          inputSourceService
            .setCharacteristic(this.platform.Characteristic.Identifier, i)
            .setCharacteristic(this.platform.Characteristic.ConfiguredName, inputSource.name)
            .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
            .setCharacteristic(this.platform.Characteristic.InputSourceType, this.guessInputSourceType(inputSource.id));
          this.service.addLinkedService(inputSourceService);
          this.inputSources[i] = inputSourceService;
        }
      });
  }

  async setActive(value: CharacteristicValue) {
    this.platform.log.debug('Set active to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'switch',
      command: value as boolean ? 'on' : 'off',
    });
  }

  async getActive(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'switch').then(status => {
      this.platform.log.debug('switch status:', status);
      return status.switch.value === 'on' ? true : false;
    });
  }

  async setVolume(value: CharacteristicValue) {
    this.platform.log.debug('Set volume to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'audioVolume',
      command: 'setVolume',
      arguments: [value as number],
    });
  }

  async getVolume(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'audioVolume')
      .then(status => {
        this.platform.log.debug('audioVolume status:', status);
        return 0;
      });
  }

  async setMute(value: CharacteristicValue) {
    this.platform.log.debug('Set mute to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'audioMute',
      command: value as boolean ? 'mute' : 'unmute',
    });
  }

  async getMute(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'audioMute')
      .then(status => {
        this.platform.log.debug('audioMute status:', status);
        return status.mute.value === 'muted' ? true : false;
      });
  }

  async setActiveIdentifier(value: CharacteristicValue) {
    this.platform.log.debug('Set active identifier to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'samsungvd.mediaInputSource',
      command: 'setInputSource',
      arguments: [this.inputSources[value as number].name ?? ''],
    });
  }

  async getActiveIdentifier(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'samsungvd.mediaInputSource')
      .then(status => {
        this.platform.log.debug('samsungvd.mediaInputSource status:', status);
        return this.inputSources.findIndex(inputSource => inputSource.name === status.inputSource.value);
      });
  }
}
