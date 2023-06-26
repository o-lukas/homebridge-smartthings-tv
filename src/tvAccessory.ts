import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform';
import { SmartThingsClient, Device, Component, Capability } from '@smartthings/core-sdk';
import { wake } from 'wol';
import ping from 'ping';
import { SmartThingsAccessory } from './smartThingsAccessory';

import data from './res/apps.json';

/**
 * Class implements a SmartThings TV accessory.
 */
export class TvAccessory extends SmartThingsAccessory {
  private service: Service;
  private speakerService: Service;
  private inputSources: Service[] = [];
  private capabilities: string[] = [];
  private activeIdentifierChangeTime = 0;
  private activeIdentifierChangeValue = 0;

  constructor(
    device: Device,
    component: Component,
    client: SmartThingsClient,
    log: Logger,
    platform: SmartThingsPlatform,
    accessory: PlatformAccessory,
    private readonly logCapabilities: boolean,
    private readonly registerApplications: boolean,
    private readonly macAddress: string | undefined = undefined,
    private readonly ipAddress: string | undefined = undefined,
  ) {
    super(device, component, client, platform, accessory, log);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Name, device.name ?? device.deviceId);

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
  }

  /**
   * Registers all available capabilities of the SmartThings Component.
   */
  public async registerCapabilities() {
    this.logInfo('Registering capabilities for component %s', this.component.id);

    for (const reference of this.component.capabilities) {
      await this.registerCapability(await this.client.capabilities.get(reference.id, reference.version ?? 0));
    }

    if (this.registerApplications && this.inputSources.length > 0) {
      this.logInfo('Resetting active identifier to %s because application registration needed to open all applications',
        this.inputSources[0].getCharacteristic(this.platform.Characteristic.ConfiguredName).value);
      await this.setActiveIdentifier(0);
    }
  }

  /**
   * Returns all available picture modes for the current device.
   *
   * @returns the available picture modes or undefined
   */
  public async getPictureModes(): Promise<{
    capability: string; command: string; prefix: string; modes: Array<{ id: string; name: string }>;
  } | undefined> {
    const status = await this.getCapabilityStatus('custom.picturemode');
    if (!status) {
      return undefined;
    }

    return {
      capability: 'custom.picturemode',
      command: 'setPictureMode',
      prefix: 'Picture',
      modes: [...new Set(status?.supportedPictureModesMap.value as Array<{ id: string; name: string }>)],
    };
  }

  /**
   * Returns all available sound modes for the current device.
   *
   * @returns the available sound modes or undefined
   */
  public async getSoundModes(): Promise<{
    capability: string; command: string; prefix: string; modes: Array<{ id: string; name: string }>;
  } | undefined> {
    const status = await this.getCapabilityStatus('custom.soundmode');
    if (!status) {
      return undefined;
    }

    return {
      capability: 'custom.soundmode',
      command: 'setSoundMode',
      prefix: 'Sound',
      modes: [...new Set(status?.supportedSoundModesMap.value as Array<{ id: string; name: string }>)],
    };
  }

  /**
   * Registers the SmartThings Capablity if it's functionality is implemented.
   *
   * @param capability the Capability
   */
  private async registerCapability(capability: Capability) {
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
        break;

      case 'audioMute':
        this.logCapabilityRegistration(capability);
        this.speakerService.getCharacteristic(this.platform.Characteristic.Mute)
          .onSet(this.setMute.bind(this))
          .onGet(this.getMute.bind(this));
        break;

      case 'samsungvd.mediaInputSource':
        this.logCapabilityRegistration(capability);
        await this.registerAvailableMediaInputSources();
        if (this.inputSources.length > 0) {
          this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onSet(this.setActiveIdentifier.bind(this))
            .onGet(this.getActiveIdentifier.bind(this));
        }
        break;

      case 'custom.launchapp':
        if (this.registerApplications) {
          this.logCapabilityRegistration(capability);
          await this.registerAvailableLaunchApplications();
          if (this.inputSources.length > 0) {
            this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
              .onSet(this.setActiveIdentifier.bind(this))
              .onGet(this.getActiveIdentifier.bind(this));
          }
        } else {
          this.logInfo('Not registering capability because registering of applications has been disabled: %s', capability.name);
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
        this.executeCommand('switch', 'on');
      }
    } else {
      this.executeCommand('switch', 'off');
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
        const status = await ping.promise.probe(this.ipAddress);
        this.logDebug('ping status: %s', status);
        return status?.alive;
      } catch (exc) {
        this.logError('error when pinging device: %s\n\
ping command fails mostly because of permission issues - falling back to SmartThings API for getting active state', exc);
        return false;
      }
    }

    const status = await this.getCapabilityStatus('switch');
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
    this.executeCommand('audioVolume', increment ? 'volumeUp' : 'volumeDown');
  }

  /**
   * Setter for Homebridge accessory Volume property.
   *
   * @param value the CharacteristicValue
   */
  private async setVolume(value: CharacteristicValue) {
    this.logDebug('Set volume to: %s', value);
    this.executeCommand('audioVolume', 'setVolume', [value as number]);
  }

  /**
   * Getter for Homebridge accessory Volume property.
   *
   * @returns the CharacteristicValue
   */
  private async getVolume(): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('audioVolume');
    return status?.volume.value as number;
  }

  /**
   * Setter for Homebridge accessory Mute property.
   *
   * @param value the CharacteristicValue
   */
  private async setMute(value: CharacteristicValue) {
    this.logDebug('Set mute to: %s', value);
    this.executeCommand('audioMute', value as boolean ? 'mute' : 'unmute');
  }

  /**
   * Getter for Homebridge accessory Mute property.
   *
   * @returns the CharacteristicValue
   */
  private async getMute(): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('audioMute');
    return status?.mute.value === 'muted' ? true : false;
  }

  /**
   * Setter for Homebridge accessory ActiveIdentifier property.
   *
   * @param value the CharacteristicValue
   */
  private async setActiveIdentifier(value: CharacteristicValue) {
    this.logDebug('Set active identifier to: %s', value);
    const inputSource = this.inputSources[value as number];
    const inputSourceType = inputSource.getCharacteristic(this.platform.Characteristic.InputSourceType).value as number;

    this.activeIdentifierChangeTime = Date.now();
    this.activeIdentifierChangeValue = value as number;

    if (inputSourceType === this.platform.Characteristic.InputSourceType.APPLICATION) {
      this.executeCommand('custom.launchapp', 'launchApp', [inputSource.name ?? '']);
    } else {
      this.executeCommand('samsungvd.mediaInputSource', 'setInputSource', [inputSource.name ?? '']);
    }
  }

  /**
   * Getter for Homebridge accessory ActiveIdentifier property.
   *
   * @returns the CharacteristicValue
   */
  private async getActiveIdentifier(): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('samsungvd.mediaInputSource');

    if (Date.parse(status?.inputSource.timestamp ?? '') > this.activeIdentifierChangeTime) {
      const id = this.inputSources.findIndex(inputSource => inputSource.name === status?.inputSource.value);
      this.logDebug('ActiveIdentifier has been changed on the device - using API result: %s', id);

      if (id < 0) {
        this.logWarn('Could not find input source for name \'%s\' - using first input source \'%s\' as active identifier',
          status?.inputSource.value, this.inputSources[0].name);
        return 0;
      }

      return id;
    } else {
      this.logDebug('ActiveIdentifier has not been changed on the device - using temporary result: %s', this.activeIdentifierChangeValue);
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
          this.executeCommand('mediaPlayback', 'rewind');
        }
        break;

      case this.platform.Characteristic.RemoteKey.FAST_FORWARD:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'FAST_FORWARD')) {
          this.executeCommand('mediaPlayback', 'fastForward');
        }
        break;

      case this.platform.Characteristic.RemoteKey.NEXT_TRACK:
        if (this.validateRemoteKeyCapability('mediaTrackControl', 'NEXT_TRACK')) {
          this.executeCommand('mediaTrackControl', 'nextTrack');
        }
        break;

      case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK:
        if (this.validateRemoteKeyCapability('mediaTrackControl', 'PREVIOUS_TRACK')) {
          this.executeCommand('mediaTrackControl', 'previousTrack');
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_UP:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_UP')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['UP']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_DOWN:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_DOWN')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['DOWN']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_LEFT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_LEFT')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['LEFT']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_RIGHT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_RIGHT')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['RIGHT']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.SELECT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'SELECT')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['OK']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.BACK:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'BACK')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['BACK']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.EXIT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'EXIT')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['HOME']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.PLAY_PAUSE:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'PLAY_PAUSE')) {
          this.executeCommand('mediaPlayback', 'play');
        }
        break;

      case this.platform.Characteristic.RemoteKey.INFORMATION:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'INFORMATION')) {
          this.executeCommand('samsungvd.remoteControl', 'send', ['MENU']);
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
  private async registerAvailableMediaInputSources() {
    const status = await this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'samsungvd.mediaInputSource');
    const supportedInputSources = [...new Set(status.supportedInputSourcesMap.value as Array<{ id: string; name: string }>)];
    for (const inputSource of supportedInputSources) {
      this.registerInputSource(inputSource.id, inputSource.name);
    }
  }

  /**
   * Registers all installed applications.
   *
   * Tests a list of known application ids by trying to open them. If opening succeeded the application is registered
   * as an input source. If it fails the application will not be added. If multiple ids for an application are available
   * the first successfully tested id will be used.
   */
  private async registerAvailableLaunchApplications() {
    if (!await this.getActive()) {
      this.logWarn('Registering applications will probably not work because TV is not turned on');
    }

    for (const i in data.apps) {
      const app = data.apps[i];
      for (const j in app.ids) {
        const appId = app.ids[j];
        try {
          await this.client.devices.executeCommand(this.device.deviceId, {
            capability: 'custom.launchapp',
            command: 'launchApp',
            arguments: [appId],
          });

          this.registerInputSource(appId, app.name);
          break;
        } catch (exc) {
          continue;
        }
      }
    }
  }

  /**
   * Registers a Homebridge input source.
   *
   * @param id the input source id
   * @param name the input source display name
   */
  private registerInputSource(id: string, name: string) {
    this.logInfo('Registering input source: %s', name);

    const inputSourceService = this.accessory.getService(id)
      || this.accessory.addService(this.platform.Service.InputSource, id, id);
    inputSourceService.name = id;
    inputSourceService
      .setCharacteristic(this.platform.Characteristic.Identifier, this.inputSources.length)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, name)
      .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
      .setCharacteristic(this.platform.Characteristic.InputSourceType, this.guessInputSourceType(id));
    this.service.addLinkedService(inputSourceService);

    this.inputSources.push(inputSourceService);
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
