import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform.js';
import { SmartThingsClient, Device, Component, Capability } from '@smartthings/core-sdk';
import { wake } from 'wol';
import ping from 'ping';
import { SmartThingsAccessory } from './smartThingsAccessory.js';
import axios from 'axios';

/**
 * Class implements a SmartThings soundbar accessory.
 */
export class SoundbarAccessory extends SmartThingsAccessory {
  private service: Service;
  private speakerService: Service;
  private inputSourceServices: Service[] = [];
  private capabilities: string[] = [];
  private activeIdentifierChangeTime = 0;
  private activeIdentifierChangeValue = 0;

  constructor(
    name: string,
    device: Device,
    component: Component,
    client: SmartThingsClient,
    log: Logger,
    platform: SmartThingsPlatform,
    accessory: PlatformAccessory,
    private readonly logCapabilities: boolean,
    private readonly pollingInterval: number | undefined,
    private readonly cyclicCallsLogging: boolean,
    private readonly macAddress: string | undefined = undefined,
    private readonly ipAddress: string | undefined = undefined,
    private readonly inputSources: [{ name: string; id: string }] | undefined = undefined,
  ) {
    super(device, component, client, platform, accessory, log);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Name, name);

    this.service = this.accessory.getService(this.platform.Service.Television)
      ?? this.accessory.addService(this.platform.Service.Television);
    this.service
      .setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, name);
    this.service.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet(this.setRemoteKey.bind(this));

    this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
      ?? this.accessory.addService(this.platform.Service.TelevisionSpeaker);
    this.service.addLinkedService(this.speakerService);
  }

  /**
   * Registers all available capabilities of the SmartThings Component.
   */
  public async registerCapabilities() {
    this.logInfo('Registering capabilities for component %s', this.component.id);

    for (const reference of this.component.capabilities) {
      try {
        await this.registerCapability(await this.client.capabilities.get(reference.id, reference.version ?? 0));
      } catch (error) {
        let errorMessage = 'unknown';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        let statusCode = -1;
        if (axios.isAxiosError(error)) {
          statusCode = error.response?.status ?? -1;
        }

        this.logError('Registering capability \'%s\' failed: [%s] %s', reference.id, statusCode, errorMessage);
      }
    }

    if (this.capabilities.find(s => s === 'samsungvd.audioInputSource') &&
      !this.capabilities.find(s => s === 'mediaInputSource')) {
      this.logWarn('Capability %s might not work as expected because capability %s is missing which is needed to set input sources',
        'samsungvd.audioInputSource', 'mediaInputSource');
    }
  }

  /**
   * Registers the SmartThings Capablity if it's functionality is implemented.
   *
   * @param capability the Capability
   */
  private async registerCapability(capability: Capability) {
    let inputSourcePollingStarted = false;

    if (this.logCapabilities) {
      this.logDebug('Available capability: %s', JSON.stringify(capability, null, 2));
    }

    if (capability.id && !this.capabilities.includes(capability.id)) {
      this.capabilities.push(capability.id);
    }

    switch (capability.id) {
      case 'switch':
        this.logCapabilityRegistration(capability);
        this.service.getCharacteristic(this.platform.Characteristic.Active)
          .onSet(this.setActive.bind(this))
          .onGet(this.getActive.bind(this));
        this.startStatusPolling(capability.name, this.service, this.platform.Characteristic.Active,
          this.getActive.bind(this, this.cyclicCallsLogging), this.pollingInterval);
        break;

      case 'audioVolume':
        this.logCapabilityRegistration(capability);
        this.speakerService
          .setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.ACTIVE);
        this.speakerService
          .setCharacteristic(this.platform.Characteristic.VolumeControlType, this.platform.Characteristic.VolumeControlType.ABSOLUTE);
        this.speakerService
          .getCharacteristic(this.platform.Characteristic.Volume)
          .onGet(this.getVolume.bind(this))
          .onSet(this.setVolume.bind(this));
        this.speakerService.getCharacteristic(this.platform.Characteristic.VolumeSelector)
          .onSet(this.setVolumeSelector.bind(this));
        this.startStatusPolling(capability.name, this.speakerService, this.platform.Characteristic.Volume,
          this.getVolume.bind(this, this.cyclicCallsLogging), this.pollingInterval);
        break;

      case 'audioMute':
        this.logCapabilityRegistration(capability);
        this.speakerService.getCharacteristic(this.platform.Characteristic.Mute)
          .onSet(this.setMute.bind(this))
          .onGet(this.getMute.bind(this));
        this.startStatusPolling(capability.name, this.speakerService, this.platform.Characteristic.Mute,
          this.getMute.bind(this, this.cyclicCallsLogging), this.pollingInterval);
        break;

      case 'samsungvd.audioInputSource':
        this.logCapabilityRegistration(capability);
        await this.registerAvailableInputSources();
        if (this.inputSourceServices.length > 0) {
          this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onSet(this.setActiveIdentifier.bind(this))
            .onGet(this.getActiveIdentifier.bind(this));

          if (!inputSourcePollingStarted) {
            inputSourcePollingStarted = true;
            this.startStatusPolling('activeIdentifier', this.service, this.platform.Characteristic.ActiveIdentifier,
              this.getActiveIdentifier.bind(this, this.cyclicCallsLogging), this.pollingInterval);
          }
        }
        break;
    }
  }

  /**
   * Setter for Homebridge accessory Active property.
   *
   * @param value the CharacteristicValue
   */
  private async setActive(value: CharacteristicValue) {
    this.logDebug('Set active to: %s', value);
    if (value) {
      if (this.macAddress) {
        this.logDebug('Use wake-on-lan functionality because mac-address has been configured');

        if (await wake(this.macAddress)) {
          this.logDebug('Successfully woke device');
        } else {
          this.logError('Could not wake device - if this error keeps occuring try to disable wake-on-lan functionality');
        }
      } else {
        await this.executeCommand('switch', 'on');
      }
    } else {
      await this.executeCommand('switch', 'off');
    }
  }

  /**
   * Getter for Homebridge accessory Active property.
   *
   * @param log flag to turn logging on/off
   * @returns the CharacteristicValue
   */
  private async getActive(log = true): Promise<CharacteristicValue> {
    if (this.ipAddress) {
      try {
        const status = await ping.promise.probe(this.ipAddress);
        if (log) {
          this.logDebug('ping status: %s', status);
        }

        return status?.alive;
      } catch (exc) {
        this.logError('error when pinging device: %s\n\
ping command fails mostly because of permission issues - falling back to SmartThings API for getting active state', exc);
        return false;
      }
    }

    const status = await this.getCapabilityStatus('switch', log);
    return status?.switch.value === 'on' ? true : false;
  }

  /**
   * Setter for Homebridge accessory VolumeSelector property.
   *
   * @param value the CharacteristicValue
   */
  private async setVolumeSelector(value: CharacteristicValue) {
    const increment = value === this.platform.Characteristic.VolumeSelector.INCREMENT;
    this.logDebug('%s volume', increment ? 'Increasing' : 'Decreasing');
    await this.executeCommand('audioVolume', increment ? 'volumeUp' : 'volumeDown');
  }

  /**
   * Setter for Homebridge accessory Volume property.
   *
   * @param value the CharacteristicValue
   */
  private async setVolume(value: CharacteristicValue) {
    this.logDebug('Set volume to: %s', value);
    await this.executeCommand('audioVolume', 'setVolume', [value as number ?? 0]);
  }

  /**
   * Getter for Homebridge accessory Volume property.
   *
   * @param log flag to turn logging on/off
   * @returns the CharacteristicValue
   */
  private async getVolume(log = true): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('audioVolume', log);
    return status?.volume.value as number ?? 0;
  }

  /**
   * Setter for Homebridge accessory Mute property.
   *
   * @param value the CharacteristicValue
   */
  private async setMute(value: CharacteristicValue) {
    this.logDebug('Set mute to: %s', value);
    await this.executeCommand('audioMute', value as boolean ? 'mute' : 'unmute');
  }

  /**
   * Getter for Homebridge accessory Mute property.
   *
   * @param log flag to turn logging on/off
   * @returns the CharacteristicValue
   */
  private async getMute(log = true): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('audioMute', log);
    return status?.mute.value === 'muted' ? true : false;
  }

  /**
   * Setter for Homebridge accessory ActiveIdentifier property.
   *
   * @param value the CharacteristicValue
   */
  private async setActiveIdentifier(value: CharacteristicValue) {
    this.logDebug('Set active identifier to: %s', value);
    const inputSource = this.inputSourceServices[value as number];

    this.activeIdentifierChangeTime = Date.now();
    this.activeIdentifierChangeValue = value as number;

    // HACK: because samsungvd.audioInputSource does not support setting input source use
    // mediaInputSource samsungvd.audioInputSource to get list of supported sources
    await this.executeCommand('mediaInputSource', 'setInputSource', [inputSource.name ?? '']);
  }

  /**
   * Getter for Homebridge accessory ActiveIdentifier property.
   *
   * @param log flag to turn logging on/off
   * @returns the CharacteristicValue
   */
  private async getActiveIdentifier(log = true): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('samsungvd.audioInputSource', log);

    if (Date.parse(status?.inputSource.timestamp ?? '') > this.activeIdentifierChangeTime) {
      const id = this.inputSourceServices.findIndex(inputSource => inputSource.name === status?.inputSource.value);
      if (log) {
        this.logDebug('ActiveIdentifier has been changed on the device - using API result: %s', id);
      }

      if (id < 0) {
        this.logWarn('Could not find input source for name \'%s\' - using first input source \'%s\' as active identifier',
          status?.inputSource.value, this.inputSourceServices[0].name);
        return 0;
      }

      return id;
    } else {
      if (log) {
        this.logDebug('ActiveIdentifier has not been changed on the device - using temporary result: %s',
          this.activeIdentifierChangeValue);
      }
      return this.activeIdentifierChangeValue;
    }
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
          await this.executeCommand('mediaPlayback', 'rewind');
        }
        break;

      case this.platform.Characteristic.RemoteKey.FAST_FORWARD:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'FAST_FORWARD')) {
          await this.executeCommand('mediaPlayback', 'fastForward');
        }
        break;

      case this.platform.Characteristic.RemoteKey.PLAY_PAUSE:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'PLAY_PAUSE')) {
          await this.executeCommand('mediaPlayback', 'play');
        }
        break;

      case this.platform.Characteristic.RemoteKey.EXIT:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'EXIT')) {
          await this.executeCommand('mediaPlayback', 'stop');
        }
        break;

      case this.platform.Characteristic.RemoteKey.BACK:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'BACK')) {
          await this.executeCommand('mediaPlayback', 'stop');
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
      this.logError('can\'t handle RemoteKey %s because %s capability is not available', remoteKey, capabilityId);
      return false;
    }
  }

  /**
   * Registers all available media input sources (e.g. HDMI inputs).
   */
  private async registerAvailableInputSources() {
    const status = await this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'samsungvd.audioInputSource');
    const supportedInputSources = [...new Set(status.supportedInputSources.value as string[])].map((s) => {
      return {
        name: s,
        id: s,
      };
    });
    if (this.inputSources) {
      this.logInfo('Overriding default input sources map "%s" with custom map "%s"',
        JSON.stringify(supportedInputSources, null, 2),
        JSON.stringify(this.inputSources, null, 2));
    }
    for (const inputSource of this.inputSources ?? supportedInputSources) {
      this.registerInputSource(inputSource.id, inputSource.name);
    }
  }

  /**
   * Registers a Homebridge input source.
   *
   * @param id the input source id
   * @param name the input source display name
   * @param inputSource the InputSourceType or @code undefined @endcode to use @link guessInputSourceType @endlink
   * to determine InputSourceType
   */
  private registerInputSource(id: string, name: string, inputSource: number | undefined = undefined) {
    this.logInfo('Registering input source: %s (%s)', name, id);

    let inputSourceType = inputSource;
    if (inputSourceType === undefined) {
      inputSourceType = this.guessInputSourceType(id);
      this.logDebug('Guessed input source type for %s is: %i', name, inputSourceType);
    }

    const inputSourceService = this.accessory.getService(id)
      ?? this.accessory.addService(this.platform.Service.InputSource, id, id);
    inputSourceService.name = id;
    inputSourceService
      .setCharacteristic(this.platform.Characteristic.Identifier, this.inputSourceServices.length)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, name)
      .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
      .setCharacteristic(this.platform.Characteristic.InputSourceType, inputSourceType);
    this.service.addLinkedService(inputSourceService);

    this.inputSourceServices.push(inputSourceService);
  }

  /**
   * Guesses the InputSourceType from the identifier of the input source.
   *
   * @param inputSourceId the identifier of the input source
   * @returns the InputSourceType (HDMI|TUNER|OTHER)
   */
  private guessInputSourceType(inputSourceId: string): number {
    if (inputSourceId.startsWith('HDMI')) {
      return this.platform.Characteristic.InputSourceType.HDMI;
    } else {
      return this.platform.Characteristic.InputSourceType.OTHER;
    }
  }
}
