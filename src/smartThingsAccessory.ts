import { Characteristic, CharacteristicValue, Logger, PlatformAccessory, Service, WithUUID } from 'homebridge';

import { SmartThingsPlatform } from './smartThingsPlatform';
import { SmartThingsClient, Device, Component, CapabilityStatus, Capability } from '@smartthings/core-sdk';
import { CustomCapabilityStatus } from '@smartthings/core-sdk';

/**
 * Class implements a base class for SmartThings accessories.
 */
export abstract class SmartThingsAccessory {
  protected constructor(
    protected readonly device: Device,
    protected readonly component: Component,
    protected readonly client: SmartThingsClient,
    protected readonly platform: SmartThingsPlatform,
    protected readonly accessory: PlatformAccessory,
    private readonly log: Logger,
  ) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.FirmwareRevision, device.ocf?.firmwareVersion ?? 'Unknown')
      .setCharacteristic(this.platform.Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(this.platform.Characteristic.Model, device.ocf?.modelNumber ?? 'Unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, device.deviceId);
  }

  /**
   * Executes the command of the capability passed in using the arguments passed in.
   * Handles error values returned by api.
   *
   * @param capability the capability identifier
   * @param command the command identifier
   * @param args the command arguments
   */
  protected async executeCommand(capability: string, command: string, args: (string | number | object)[] = []) {
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
      throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
    }
  }

  /**
   * Returns the status of the capability passed in.
   * Handles error values returned by api.
   *
   * @param capability the capability identifier
   * @param log flag to turn logging on/off
   * @returns the capability status or undefined for errors returned by API
   */
  protected async getCapabilityStatus(capability: string, log = true): Promise<CapabilityStatus | null> {
    try {
      const status = await this.client.devices.getCapabilityStatus(this.device.deviceId, this.component.id, capability);
      if(log){
        this.logDebug('Successfully get status of %s: %s', capability, JSON.stringify(status, null, 2));
      }
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

  /**
   * Starts polling the status of the capability passed in using the parameters passed in.
   * Must only be used on capabilities that are not updated cyclical automatically.
   *
   * @param capability the capability that will be updated
   * @param service the service containing the characteristic
   * @param characteristic the characteristic that will be updated
   * @param getter the function to be used to get the new value
   * @param interval the interval in milliseconds (if set to undefined polling will not be started)
   */
  protected startStatusPolling<T extends WithUUID<new () => Characteristic>>(
    capability: string, service: Service,
    characteristic: T, getter: () => Promise<CharacteristicValue>, interval: number | undefined) {
    if(interval === undefined) {
      return;
    }

    this.logInfo('Start status polling for %s with interval of %ims', capability, interval);

    setInterval(() => {
      getter()
        .then((value) => {
          service.updateCharacteristic(characteristic, value);
        })
        .catch((reason) => {
          this.logError('Error in cyclic update of capability %s: %s', capability, reason);
        });
      service.updateCharacteristic(characteristic, 1);
    }, interval);
  }

  protected logCapabilityRegistration(capability: Capability) {
    this.logInfo('Registering capability:', capability.name);
    if (capability.status !== CustomCapabilityStatus.LIVE) {
      this.logWarn('Capability %s might not work as expected because it\'s status is: %s', capability.name, capability.status);
    }
  }

  protected logInfo(message: string, ...parameters: unknown[]): void {
    this.log.info('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }

  protected logWarn(message: string, ...parameters: unknown[]): void {
    this.log.warn('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }

  protected logError(message: string, ...parameters: unknown[]): void {
    this.log.error('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }

  protected logDebug(message: string, ...parameters: unknown[]): void {
    this.log.debug('[' + (this.device.name ?? this.device.deviceId) + '] ' + message, ...parameters);
  }
}
