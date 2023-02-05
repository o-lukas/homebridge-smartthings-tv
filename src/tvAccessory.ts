import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { SmartThingsPlatform } from './platform';
import { SmartThingsClient, Device, Component, Capability } from '@smartthings/core-sdk';
import { wake } from 'wol';
import ping from 'ping';

class SamsungVdMediaInputSource {
  public readonly id: string;
  public readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

/**
 * Class implements a SmartThings TV accessory.
 */
export class TvAccessory {
  private service: Service;
  private speakerService: Service;
  private inputSources: Service[] = [];
  private capabilities: string[] = [];

  constructor(
    private readonly platform: SmartThingsPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device,
    private readonly component: Component,
    private readonly client: SmartThingsClient,
    private readonly macAddress: string | undefined = undefined,
    private readonly ipAddress: string | undefined = undefined,
  ) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Name, device.name ?? device.deviceId)
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, device.ocf?.firmwareVersion ?? 'Unknown')
      .setCharacteristic(this.platform.Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(this.platform.Characteristic.Model, device.ocf?.modelNumber ?? 'Unknown');

    this.service = this.accessory.getService(this.platform.Service.Television)
      || this.accessory.addService(this.platform.Service.Television);
    this.service
      .setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, device.name ?? device.deviceId);
    this.service.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet(this.setRemoteKey.bind(this));

    this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
      || this.accessory.addService(this.platform.Service.TelevisionSpeaker);
    this.service.addLinkedService(this.speakerService);

    this.registerCapabilities(component);
  }

  /**
   * Registers all available capabilities of the SmartThings Component.
   *
   * @param component the SmartThings Component
   */
  private async registerCapabilities(component: Component) {
    this.platform.log.info('Registering capabilities for component:', component.id);

    component.capabilities.forEach(reference => {
      this.client.capabilities.get(reference.id, reference.version ?? 0)
        .then(capability => this.registerCapability(capability));
    });
  }

  /**
   * Registers the SmartThings Capablity if it's functionality is implemented.
   *
   * @param capability the Capability
   */
  private registerCapability(capability: Capability) {
    if (capability.id && !this.capabilities.includes(capability.id)) {
      this.capabilities.push(capability.id);
    }

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
        this.registerInputSources();
        this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
          .onSet(this.setActiveIdentifier.bind(this))
          .onGet(this.getActiveIdentifier.bind(this));
        break;
    }
  }

  /**
   * Setter for Homebridge accessory Active property.
   *
   * @param value the CharacteristicValue
   */
  private async setActive(value: CharacteristicValue) {
    this.platform.log.debug('Set active to:', value);
    if (value) {
      if (this.macAddress) {
        this.platform.log.debug('Use wake-on-lan functionality because mac-address has been configured');
        wake(this.macAddress);
      } else {
        this.client.devices.executeCommand(this.device.deviceId, {
          capability: 'switch',
          command: 'on',
        });
      }
    } else {
      this.client.devices.executeCommand(this.device.deviceId, {
        capability: 'switch',
        command: 'off',
      });
    }
  }

  /**
   * Getter for Homebridge accessory Active property.
   *
   * @returns the CharacteristicValue
   */
  private async getActive(): Promise<CharacteristicValue> {
    if (this.ipAddress) {
      try {
        return ping.promise.probe(this.ipAddress).then(status => {
          this.platform.log.debug('ping status:', status);
          return status?.alive;
        });
      } catch (exc) {
        this.platform.log.error('error when pinging device:', exc
          , '\nping command fails mostly because of permission issues - falling back to SmartThings API for getting active state');
      }
    }

    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'switch').then(status => {
      this.platform.log.debug('switch status:', status);
      return status.switch.value === 'on' ? true : false;
    });
  }

  /**
   * Setter for Homebridge accessory Volume property.
   *
   * @param value the CharacteristicValue
   */
  private async setVolume(value: CharacteristicValue) {
    this.platform.log.debug('Set volume to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'audioVolume',
      command: 'setVolume',
      arguments: [value as number],
    });
  }

  /**
   * Getter for Homebridge accessory Volume property.
   *
   * @returns the CharacteristicValue
   */
  private async getVolume(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'audioVolume')
      .then(status => {
        this.platform.log.debug('audioVolume status:', status);
        return status.volume.value as number;
      });
  }

  /**
   * Setter for Homebridge accessory Mute property.
   *
   * @param value the CharacteristicValue
   */
  private async setMute(value: CharacteristicValue) {
    this.platform.log.debug('Set mute to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'audioMute',
      command: value as boolean ? 'mute' : 'unmute',
    });
  }

  /**
   * Getter for Homebridge accessory Mute property.
   *
   * @returns the CharacteristicValue
   */
  private async getMute(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'audioMute')
      .then(status => {
        this.platform.log.debug('audioMute status:', status);
        return status.mute.value === 'muted' ? true : false;
      });
  }

  /**
   * Setter for Homebridge accessory ActiveIdentifier property.
   *
   * @param value the CharacteristicValue
   */
  private async setActiveIdentifier(value: CharacteristicValue) {
    this.platform.log.debug('Set active identifier to:', value);
    this.client.devices.executeCommand(this.device.deviceId, {
      capability: 'samsungvd.mediaInputSource',
      command: 'setInputSource',
      arguments: [this.inputSources[value as number].name ?? ''],
    });
  }

  /**
   * Getter for Homebridge accessory ActiveIdentifier property.
   *
   * @returns the CharacteristicValue
   */
  private async getActiveIdentifier(): Promise<CharacteristicValue> {
    return this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'samsungvd.mediaInputSource')
      .then(status => {
        this.platform.log.debug('samsungvd.mediaInputSource status:', status);
        return this.inputSources.findIndex(inputSource => inputSource.name === status.inputSource.value);
      });
  }

  /**
   * Setter for Homebridge accessory RemoteKey property.
   *
   * @param value the CharacteristicValue
   */
  private async setRemoteKey(value: CharacteristicValue) {
    switch (value) {
      case this.platform.Characteristic.RemoteKey.REWIND:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'REWIND')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'mediaPlayback',
            command: 'rewind',
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.FAST_FORWARD:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'FAST_FORWARD')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'mediaPlayback',
            command: 'fastForward',
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.NEXT_TRACK:
        if (this.validateRemoteKeyCapability('mediaTrackControl', 'NEXT_TRACK')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'mediaTrackControl',
            command: 'nextTrack',
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK:
        if (this.validateRemoteKeyCapability('mediaTrackControl', 'PREVIOUS_TRACK')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'mediaTrackControl',
            command: 'previousTrack',
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_UP:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_UP')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['UP'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_DOWN:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_DOWN')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['DOWN'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_LEFT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_LEFT')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['LEFT'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_RIGHT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_RIGHT')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['RIGHT'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.SELECT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'SELECT')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['OK'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.BACK:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'BACK')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['BACK'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.EXIT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'EXIT')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['HOME'],
          });
        }
        break;

      case this.platform.Characteristic.RemoteKey.PLAY_PAUSE:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'PLAY_PAUSE')) {
          this.client.devices.executeCommand(this.device.deviceId,
            {
              capability: 'mediaPlayback',
              command: 'play',
            });
        }
        break;

      case this.platform.Characteristic.RemoteKey.INFORMATION:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'INFORMATION')) {
          this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'samsungvd.remoteControl',
            command: 'send',
            arguments: ['MENU'],
          });
        }
        break;
    }
  }

  /**
   * Validates that the SmartThings Capability needed to execute the remote key is available.
   *
   * @param capabilityId the identifier of the SmartThings Capablity
   * @param remoteKey the remote key
   * @returns TRUE in case capability is available - FALSE otherwise
   */
  private validateRemoteKeyCapability(capabilityId: string, remoteKey: string): boolean {
    if (this.capabilities.includes(capabilityId)) {
      return true;
    } else {
      this.platform.log.error('can\'t handle RemoteKey', remoteKey, 'because', capabilityId, 'capability is not available');
      return false;
    }
  }

  /**
   * Registers all available input sources.
   */
  private async registerInputSources() {
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

  /**
   * Guesses the InputSourceType from the identifier of the input source.
   *
   * @param inputSourceId the identifier of the input source
   * @returns the InputSourceType (HDMI|TUNER|APPLICATION)
   */
  private guessInputSourceType(inputSourceId: string): number {
    if (inputSourceId.startsWith('HDMI')) {
      return this.platform.Characteristic.InputSourceType.HDMI;
    } else if (inputSourceId === 'dtv') {
      return this.platform.Characteristic.InputSourceType.TUNER;
    } else {
      return this.platform.Characteristic.InputSourceType.APPLICATION;
    }
  }
}
