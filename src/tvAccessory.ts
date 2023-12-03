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
  private speakerService: Service | undefined = undefined;
  private inputSourceServices: Service[] = [];
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
    private readonly pollingInterval: number | undefined,
    private readonly cyclicCallsLogging: boolean,
    private readonly macAddress: string | undefined = undefined,
    private readonly ipAddress: string | undefined = undefined,
    private readonly inputSources: [{name: string; id: string}] | undefined = undefined,
    private readonly applications: [{name: string; ids: [string]}] | undefined = undefined,
  ) {
    super(device, component, client, platform, accessory, log);

    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Name, device.name ?? device.deviceId);

    this.service = this.accessory.getService(this.platform.Service.Television)
      ?? this.accessory.addService(this.platform.Service.Television);
    this.service
      .setCharacteristic(this.platform.Characteristic.SleepDiscoveryMode,
        this.platform.Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, device.name ?? device.deviceId);
    this.service.getCharacteristic(this.platform.Characteristic.RemoteKey)
      .onSet(this.setRemoteKey.bind(this));
  }

  /**
   * Registers all available capabilities of the SmartThings Component.
   */
  public async registerCapabilities() {
    this.logInfo('Registering capabilities for component %s', this.component.id);

    for (const reference of this.component.capabilities) {
      await this.registerCapability(await this.client.capabilities.get(reference.id, reference.version ?? 0));
    }

    if (this.registerApplications && this.inputSourceServices.length > 0) {
      this.logInfo('Resetting active identifier to %s because application registration needed to open all applications',
        this.inputSourceServices[0].getCharacteristic(this.platform.Characteristic.ConfiguredName).value);
      await this.setActiveIdentifier(0);
    }
  }

  /**
   * Returns all available picture modes for the current device.
   *
   * @returns the available picture modes or undefined
   */
  public async getPictureModes(): Promise<{
    capability: string; command: string; prefix: string; modes: { id: string; name: string }[];
  } | undefined> {
    const status = await this.getCapabilityStatus('custom.picturemode', true);
    if (!status) {
      return undefined;
    }

    return {
      capability: 'custom.picturemode',
      command: 'setPictureMode',
      prefix: 'Picture',
      modes: [...new Set(status?.supportedPictureModesMap.value as { id: string; name: string }[])],
    };
  }

  /**
   * Returns all available sound modes for the current device.
   *
   * @returns the available sound modes or undefined
   */
  public async getSoundModes(): Promise<{
    capability: string; command: string; prefix: string; modes: { id: string; name: string }[];
  } | undefined> {
    const status = await this.getCapabilityStatus('custom.soundmode', true);
    if (!status) {
      return undefined;
    }

    return {
      capability: 'custom.soundmode',
      command: 'setSoundMode',
      prefix: 'Sound',
      modes: [...new Set(status?.supportedSoundModesMap.value as { id: string; name: string }[])],
    };
  }

  /**
   * Returns whether the speaker service is available.
   *
   * @returns TRUE in case speaker service is available - FALSE otherwise
   */
  public hasSpeakerService(): boolean {
    return this.speakerService !== undefined;
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
        if(!this.speakerService){
          this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
            ?? this.accessory.addService(this.platform.Service.TelevisionSpeaker);
          this.service.addLinkedService(this.speakerService);
        }

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
        if(!this.speakerService){
          this.speakerService = this.accessory.getService(this.platform.Service.TelevisionSpeaker)
            ?? this.accessory.addService(this.platform.Service.TelevisionSpeaker);
          this.service.addLinkedService(this.speakerService);
        }

        this.logCapabilityRegistration(capability);
        this.speakerService.getCharacteristic(this.platform.Characteristic.Mute)
          .onSet(this.setMute.bind(this))
          .onGet(this.getMute.bind(this));
        this.startStatusPolling(capability.name, this.speakerService, this.platform.Characteristic.Mute,
          this.getMute.bind(this, this.cyclicCallsLogging), this.pollingInterval);
        break;

      case 'samsungvd.mediaInputSource':
        this.logCapabilityRegistration(capability);
        await this.registerAvailableMediaInputSources();
        if (this.inputSourceServices.length > 0) {
          this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
            .onSet(this.setActiveIdentifier.bind(this))
            .onGet(this.getActiveIdentifier.bind(this));

          if(!inputSourcePollingStarted){
            inputSourcePollingStarted = true;
            this.startStatusPolling('activeIdentifier', this.service, this.platform.Characteristic.ActiveIdentifier,
              this.getActiveIdentifier.bind(this, this.cyclicCallsLogging), this.pollingInterval);
          }
        }
        break;

      case 'custom.launchapp':
        if (this.registerApplications) {
          this.logCapabilityRegistration(capability);
          await this.registerAvailableLaunchApplications();
          if (this.inputSourceServices.length > 0) {
            this.service.getCharacteristic(this.platform.Characteristic.ActiveIdentifier)
              .onSet(this.setActiveIdentifier.bind(this))
              .onGet(this.getActiveIdentifier.bind(this));

            if(!inputSourcePollingStarted){
              inputSourcePollingStarted = true;
              this.startStatusPolling('activeIdentifier', this.service, this.platform.Characteristic.ActiveIdentifier,
                this.getActiveIdentifier.bind(this, this.cyclicCallsLogging), this.pollingInterval);
            }
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
        if(log) {
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
    await this.executeCommand('audioVolume', 'setVolume', [value as number]);
  }

  /**
   * Getter for Homebridge accessory Volume property.
   *
   * @param log flag to turn logging on/off
   * @returns the CharacteristicValue
   */
  private async getVolume(log = true): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('audioVolume', log);
    return status?.volume.value as number;
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
    const inputSourceType = inputSource.getCharacteristic(this.platform.Characteristic.InputSourceType).value as number;

    this.activeIdentifierChangeTime = Date.now();
    this.activeIdentifierChangeValue = value as number;

    if (inputSourceType === this.platform.Characteristic.InputSourceType.APPLICATION) {
      await this.executeCommand('custom.launchapp', 'launchApp', [inputSource.name ?? '']);
    } else {
      await this.executeCommand('samsungvd.mediaInputSource', 'setInputSource', [inputSource.name ?? '']);
    }
  }

  /**
   * Getter for Homebridge accessory ActiveIdentifier property.
   *
   * @param log flag to turn logging on/off
   * @returns the CharacteristicValue
   */
  private async getActiveIdentifier(log = true): Promise<CharacteristicValue> {
    const status = await this.getCapabilityStatus('samsungvd.mediaInputSource', log);

    if (Date.parse(status?.inputSource.timestamp ?? '') > this.activeIdentifierChangeTime) {
      const id = this.inputSourceServices.findIndex(inputSource => inputSource.name === status?.inputSource.value);
      if(log){
        this.logDebug('ActiveIdentifier has been changed on the device - using API result: %s', id);
      }

      if (id < 0) {
        this.logWarn('Could not find input source for name \'%s\' - using first input source \'%s\' as active identifier',
          status?.inputSource.value, this.inputSourceServices[0].name);
        return 0;
      }

      return id;
    } else {
      if(log){
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

      case this.platform.Characteristic.RemoteKey.NEXT_TRACK:
        if (this.validateRemoteKeyCapability('mediaTrackControl', 'NEXT_TRACK')) {
          await this.executeCommand('mediaTrackControl', 'nextTrack');
        }
        break;

      case this.platform.Characteristic.RemoteKey.PREVIOUS_TRACK:
        if (this.validateRemoteKeyCapability('mediaTrackControl', 'PREVIOUS_TRACK')) {
          await this.executeCommand('mediaTrackControl', 'previousTrack');
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_UP:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_UP')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['UP']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_DOWN:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_DOWN')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['DOWN']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_LEFT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_LEFT')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['LEFT']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.ARROW_RIGHT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'ARROW_RIGHT')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['RIGHT']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.SELECT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'SELECT')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['OK']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.BACK:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'BACK')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['BACK']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.EXIT:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'EXIT')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['HOME']);
        }
        break;

      case this.platform.Characteristic.RemoteKey.PLAY_PAUSE:
        if (this.validateRemoteKeyCapability('mediaPlayback', 'PLAY_PAUSE')) {
          await this.executeCommand('mediaPlayback', 'play');
        }
        break;

      case this.platform.Characteristic.RemoteKey.INFORMATION:
        if (this.validateRemoteKeyCapability('samsungvd.remoteControl', 'INFORMATION')) {
          await this.executeCommand('samsungvd.remoteControl', 'send', ['MENU']);
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
    const supportedInputSources = [...new Set(status.supportedInputSourcesMap.value as { id: string; name: string }[])];
    if(this.inputSources){
      this.logInfo('Overriding default input sources map "%s" with custom map "%s"',
        JSON.stringify(supportedInputSources, null, 2),
        JSON.stringify(this.inputSources, null, 2));
    }
    for (const inputSource of this.inputSources ?? supportedInputSources) {
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
    if (!await this.getActive(false)) {
      this.logWarn('Registering applications will probably not work because TV is not turned on');
    }

    for (const app of this.applications ?? data.apps) {
      this.logDebug('Try to register application %s with ids: %s', app.name, app.ids.join(', '));

      for (const appId of app.ids) {
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
    this.logInfo('Registering input source: %s (%s)', name, id);

    const inputSourceService = this.accessory.getService(id)
      ?? this.accessory.addService(this.platform.Service.InputSource, id, id);
    inputSourceService.name = id;
    inputSourceService
      .setCharacteristic(this.platform.Characteristic.Identifier, this.inputSourceServices.length)
      .setCharacteristic(this.platform.Characteristic.ConfiguredName, name)
      .setCharacteristic(this.platform.Characteristic.IsConfigured, this.platform.Characteristic.IsConfigured.CONFIGURED)
      .setCharacteristic(this.platform.Characteristic.InputSourceType, this.guessInputSourceType(id));
    this.service.addLinkedService(inputSourceService);

    this.inputSourceServices.push(inputSourceService);
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
