import { Service, PlatformAccessory, CharacteristicValue, Logger } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform';
import { SmartThingsClient, Device, Component, Capability, CapabilityStatus } from '@smartthings/core-sdk';
import { wake } from 'wol';
import ping from 'ping';

import data from './res/apps.json';

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
  private activeIdentifierChangeTime = 0;
  private activeIdentiiferChangeValue = 0;
  private pictureModes: Service[] = [];
  private soundModes: Service[] = [];

  constructor(
    private readonly platform: SmartThingsPlatform,
    private readonly accessory: PlatformAccessory,
    private readonly device: Device,
    private readonly component: Component,
    private readonly client: SmartThingsClient,
    private readonly log: Logger,
    private readonly logCapabilities: boolean,
    private readonly registerApplications: boolean,
    private readonly registerPictureModes: boolean,
    private readonly registerSoundModes: boolean,
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
    this.logInfo('Registering capabilities for component %s', component.id);

    component.capabilities.forEach(async reference => {
      await this.registerCapability(await this.client.capabilities.get(reference.id, reference.version ?? 0));
    });
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
        this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
          .onSet(this.setActiveIdentifier.bind(this))
          .onGet(this.getActiveIdentifier.bind(this));
        break;

      case 'custom.launchapp':
        if (this.registerApplications) {
          this.logCapabilityRegistration(capability);
          await this.registerAvailableLaunchApplications();
          this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onSet(this.setActiveIdentifier.bind(this))
            .onGet(this.getActiveIdentifier.bind(this));
        } else {
          this.logInfo('Not registering capability because registering of applications has been disabled: %s', capability.name);
        }
        break;

      case 'custom.picturemode':
        if (this.registerPictureModes) {
          this.logCapabilityRegistration(capability);
          await this.registerAvailablePictureModes();
        } else {
          this.logInfo('Not register capability because registering of picture modes has been disabled: %s', capability.name);
        }
        break;

      case 'custom.soundmode':
        if (this.registerSoundModes) {
          this.logCapabilityRegistration(capability);
          await this.registerAvailableSoundModes();
        } else {
          this.logInfo('Not register capability because registering of sound modes has been disabled: %s', capability.name);
        }
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
    this.activeIdentiiferChangeValue = value as number;

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
      return id;
    } else {
      this.logDebug('ActiveIdentifier has not been changed on the device - using temporary result: %s', this.activeIdentiiferChangeValue);
      return this.activeIdentiiferChangeValue;
    }
  }

  /**
   * Setter for Homebridge accessory PictureMode property.
   *
   * @param value the CharacteristicValue
   */
  private async setPictureMode(value: CharacteristicValue) {
    this.logDebug('Set picture mode to: %s', value);
    this.executeCommand('custom.picturemode', 'setPictureMode', [value as string]);

    this.pictureModes.forEach(pictureModeService => {
      pictureModeService.updateCharacteristic(this.platform.Characteristic.On,
        pictureModeService.name === value as string);
    });
  }

  /**
   * Getter for Homebridge accessory PictureMode property.
   *
   * @returns the CharacteristicValue
   */
  private async getPictureMode(name: string): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('custom.picturemode');
    return status?.pictureMode.value as string === name;
  }

  /**
   * Setter for Homebridge accessory SoundMode property.
   *
   * @param value the CharacteristicValue
   */
  private async setSoundMode(value: CharacteristicValue) {
    this.logDebug('Set sound mode to: %s', value);
    this.executeCommand('custom.soundmode', 'setSoundMode', [value as string]);

    this.soundModes.forEach(soundModeService => {
      soundModeService.updateCharacteristic(this.platform.Characteristic.On,
        soundModeService.name === value as string);
    });
  }

  /**
   * Getter for Homebridge accessory SoundMode property.
   *
   * @returns the CharacteristicValue
   */
  private async getSoundMode(name: string): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('custom.soundmode');
    return status?.soundMode.value as string === name;
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
        const supportedInputSources = [...new Set(status.supportedInputSourcesMap.value as Array<SamsungVdMediaInputSource>)];
        supportedInputSources.forEach(inputSource => this.registerInputSource(inputSource.id, inputSource.name));
  }

  /**
   * Registers all installed applications.
   *
   * Tests a list of known application ids by trying to open them. If opening succeeded the application is registered
   * as an input source. If it fails the application will not be added. If multiple ids for an application are available
   * the first successfully tested id will be used.
   */
  private async registerAvailableLaunchApplications() {
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

    this.setActiveIdentifier(0);
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

  /**
   * Registers all available picture modes.
   */
  private async registerAvailablePictureModes() {
    const status = await this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'custom.picturemode');
        const supportedPictureModes = [...new Set(status.supportedPictureModesMap.value as Array<SamsungVdMediaInputSource>)];
        supportedPictureModes.forEach(pictureMode => {
          this.registerPictureMode(pictureMode.id, pictureMode.name, 'Picture: ' + pictureMode.name);
        });
  }

  /**
   * Registers a picture mode as Homebridge switch.
   *
   * @param id the picture mode id
   * @param name the picture mode name
   * @param name the picture mode display name
   */
  private async registerPictureMode(id: string, name: string, displayName: string) {
    this.logInfo('Registering picture mode: %s', name);

    const pictureModeService = this.accessory.getService(id)
      || this.accessory.addService(this.platform.Service.Switch, id, id);
    pictureModeService.name = name;
    pictureModeService.displayName = name;
    pictureModeService.setCharacteristic(this.platform.Characteristic.Name, displayName);
    pictureModeService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setPictureMode.bind(this, name))
      .onGet(this.getPictureMode.bind(this, name));
    this.service.addLinkedService(pictureModeService);

    this.pictureModes.push(pictureModeService);
  }

  /**
   * Registers all available sound modes.
   */
  private async registerAvailableSoundModes() {
    const status = await this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, 'custom.soundmode');
        const supportedSoundModes = [...new Set(status.supportedSoundModesMap.value as Array<SamsungVdMediaInputSource>)];
        supportedSoundModes.forEach(soundMode => {
          this.registerSoundMode(soundMode.id, soundMode.name, 'Sound: ' + soundMode.name);
        });
  }

  /**
   * Registers a sound mode as Homebridge switch.
   *
   * @param id the sound mode id
   * @param name the sound mode name
   * @param name the sound mode display name
   */
  private async registerSoundMode(id: string, name: string, displayName: string) {
    this.logInfo('Registering sound mode: %s', name);

    const soundModeService = this.accessory.getService(id)
      || this.accessory.addService(this.platform.Service.Switch, id, id);
    soundModeService.name = name;
    soundModeService.displayName = name;
    soundModeService.setCharacteristic(this.platform.Characteristic.Name, displayName);
    soundModeService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setSoundMode.bind(this, name))
      .onGet(this.getSoundMode.bind(this, name));
    this.service.addLinkedService(soundModeService);

    this.pictureModes.push(soundModeService);
  }

  /**
   * Executes the command of the capability passed in using the arguments passed in.
   * Handles error values returned by api.
   *
   * @param capability the capability identifier
   * @param command the command identifier
   * @param args the command arguments
   */
  private async executeCommand(capability: string, command: string, args: Array<string | number | object> = []) {
    try {
      await this.client.devices.executeCommand(this.device.deviceId, {
      capability: capability,
      command: command,
      arguments: args,
      });
      this.logDebug('Successfully executed command %s of capability %s', command, capability);
    } catch (error) {
      let errorMessage = 'unknown';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logError('Error when executing %s of capability %s: %s', command, capability, errorMessage);
    }
  }

  /**
   * Returns the status of the capability passed in.
   * Handles error values returned by api.
   *
   * @param capability the capability identifier
   * @returns the capability status or undefined for errors returned by API
   */
  private async getCapabilityStatus(capability: string): Promise<CapabilityStatus | null> {
    try {
      const status = await this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, capability);
        this.logDebug('Successfully get status of %s: %s', capability, JSON.stringify(status, null, 4));
        return status;
    } catch (error) {
      let errorMessage = 'unknown';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      this.logError('Error when getting status of %s: %s', capability, errorMessage);
      return null;
    }
  }

  private logCapabilityRegistration(capability: Capability) {
    this.logInfo('Registering capability:', capability.name);
    if (capability.status !== 'live') {
      this.logWarn('Capability %s might not work as expected because it\'s status is: %s', capability.name, capability.status);
    }
  }

  private logInfo(message: string, ...parameters: unknown[]): void {
    this.log.info('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }

  private logWarn(message: string, ...parameters: unknown[]): void {
    this.log.warn('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }

  private logError(message: string, ...parameters: unknown[]): void {
    this.log.error('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }

  private logDebug(message: string, ...parameters: unknown[]): void {
    this.log.debug('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }
}
