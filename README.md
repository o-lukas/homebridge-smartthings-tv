# Homebridge SmartThings TV

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![NPM Version](https://badgen.net/npm/v/@o-lukas/homebridge-smartthings-tv?label=stable)
![NPM Node Version](https://badgen.net/npm/node/@o-lukas/homebridge-smartthings-tv)
![NPM Total Downloads](https://badgen.net/npm/dt/@o-lukas/homebridge-smartthings-tv)
![GitHub issues](https://img.shields.io/github/issues/o-lukas/homebridge-smartthings-tv?label=Issues)
[![Build and Lint](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/build.yml/badge.svg)](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/build.yml)

This is a plugin for [Homebridge](https://github.com/homebridge/homebridge). It offers some basic functions to control Samsung TVs using the SmartThings API.

# Configuration

The easiest way to configure the plugin is to use [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x) which should contain a description for every needed property. The only property needed to make the plugin work is the SmartThings API token. The other properties enable some additional functions but are not mandatory for the plugin to work.

## Configuration example

The following snippet shows the most simple configuration you can use for the plugin:

```json
{
    "bridge": {
    },
    "accessories": [],
    "platforms": [
        {
            "name": "SmartThings TV",
            "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "platform": "smartthings-tv"
        }
    ]
}
```

The following snippets shows all available properties you can use for the plugin:

```json
{
    "bridge": {
    },
    "accessories": [],
    "platforms": [
        {
            "name": "SmartThings TV",
            "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "capabilityLogging": true,
            "cyclicCallsLogging": true,
            "registerApplications": true,
            "registerPictureModes": true,
            "registerSoundModes": true,
            "registerVolumeSlider": true,
            "pollInterval": 5000,
            "deviceBlocklist": [
                "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            ],
            "deviceMappings": [
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "wol": true,
                    "macAddress": "xx:xx:xx:xx:xx:xx",
                    "ping": true,
                    "ipAddress": "xx:xx:xx:xx:xx:xx",
                    "inputSources": [
                      {
                        "name": "xxxx",
                        "id": "xxxx"
                      }
                    ],
                    "applications": [
                        {
                            "name": "xxxx",
                            "ids": [
                                "xxxx",
                                "xxxx"
                            ]
                        }
                    ]
                },
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "wol": true,
                    "macAddress": "xx:xx:xx:xx:xx:xx",
                    "ping": false
                },
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "wol": false,
                    "ping": true,
                    "ipAddress": "xx:xx:xx:xx:xx:xx"
                }
            ],
            "platform": "smartthings-tv"
        }
    ]
}
```

## Available configuration properties

### token

The SmartThings API token is needed to authenticate the requests sent to the SmartThings API. To generate a token open [SmartThings website]( https://account.smartthings.com/tokens) and generate a new one (make sure at least devices is selected).

### capabilityLogging

The SmartThings API returns the list of supported actions of a device as capabilities. For implementing new features it is neccessary to know the scheme the capability uses. Enable this property to log all capabilities of supported SmartThings devices.

### cyclicCallsLogging

Enable debug logging for cyclic calls (e.g. polling).

### registerApplications

To use installed application as input sources, a [predefined list of applications](./src/res/apps.json) will be used. This list will be checked for availability at the TV(s) and eventually be registered as input sources. Make sure to have the TV(s) turned on when starting your instance as this functionality requires your TV(s) be turned on to determine whether an application is installed or not. On startup the applications will be opened to determine if they are available. Do not use your TV until the input source is being changed back to the first one (usually Live TV).

### registerPictureModes

Registers all available picture modes as separate switches that can be toggled to enable/disable a picture mode. Uses the names as exposed from the SmartThings API.

### registerSoundModes

Registers all available sound modes as separate switches that can be toggled to enable/disable a sound mode. Uses the names as exposed from the SmartThings API.

### registerVolumeSlider

Registers a separate volume slider accessorry that will be exposed as a light bulb accessory (because there is currently no option to change a speaker volume directly using Home).

### pollInterval

Some characteristics are not updated automatically (e.g. power state). To enable polling these characteristics automatically set this value to the desired polling interval in milliseconds. Leave empty to disable this functionality.

### deviceBlocklist

Devices not to be registered.

### deviceMappings

Use the device mappings when e.g. turning on the accessory does not work as expected. When a device mapping is available the wake-on-lan functionality is used to turn on the device instead of the SmartThings API. To make use of the functionality you must enter the mapping using the SmartThings device ID and the mac address of the device. If status does not show up properly you can use the ping functionality to determine the device status. To make use of it you must enter the SmartThings device ID and the ip address of the device.

#### deviceId

The SmartThings device id. Check the log or go to https://account.smartthings.com/ and get the device id.

### wol

Enables usage of wake-on-lan functionality to turn the device on. Use only if using the SmartThings API does not work for your device.

### macAddress

The mac address of the device to turn device on using wake-on-lan functionality.

### ping

Enables usage of ping functionality to determine if device is turned on. Use only if using the SmartThings API does not work for your device.

### ipAddress

The IP address of the device (assign a static IP address to make sure it does not change) to determine the status using ping.

### inputSources

Overrides the device's default input sources map to add custom input sources. Check the log for information about the default input sources.

#### name

The input source's name.

#### id

The input source's id.

### applications

Overrides the default application mapping list to add custom applications. See [registerApplications](#registerapplications) for more details about application registration.

#### name

The application's name.

#### ids

The application's possible ids. Since some applications have different ids for different versions of TVs you can provide a list here so the plugin will try every id and use the one that's working.

# Common issues

## TV does not show in HomeKit

After starting you have to add the TV manually to HomeKit because they are published as external accessory to get over the limit of only one TV per bridge.

## TV does not turn on

The command to turn the TV on using the SmartThings API does not work for some TVs. To solve this problem you can use the built-in wake-on-lan functionality. To activate this functionality add a device mapping containing the device id and the mac address of your TV.

```json
{
    "bridge": {
    },
    "accessories": [],
    "platforms": [
        {
            "name": "SmartThings TV",
            "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "deviceMappings": [
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "macAddress": "xx:xx:xx:xx:xx:xx"
                }
            ],
            "platform": "smartthings-tv"
        }
    ]
}
```

## TV state does not match actual state

Some TVs report a false active state using the SmartThings API. To get the actual state of the television you can use the build-in ping functionality. To activate this functionality add a device mapping containing the device id and the IP address of your TV.

```json
{
    "bridge": {
    },
    "accessories": [],
    "platforms": [
        {
            "name": "SmartThings TV",
            "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "deviceMappings": [
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "ipAddress": "xx:xx:xx:xx:xx:xx"
                }
            ],
            "platform": "smartthings-tv"
        }
    ]
}
```

## Picture/sound mode switches do not match TV picture mode settings

Some TVs always report the same picture & sound mode. This will cause the exposed switches to not match the actual picture/sound mode state. I have not found a proper solution for this problem yet. But toggling the buttons will still work.

## Error `invalid device state`

Sometimes the SmartThings API seems to loose the contact to the device and does not update it's state so every request will end up with an error message like `invalid device state`. To fix this try to remove the device from your SmartThings account and add it again. This seems to fix the problem.

## DisplayPort input sources do not show up

For some TVs display port sources do not show up. When having the same problem you might try to use [inputSources](#inputsources). `Id` might be something like `Display Port` but you will have to experiment a bit trying different ids until you find the the right one.

***

Since this is my first plugin it may contain some problems. Feel free to create an issue or pull request and I will try to help and fix the problems.

But since this plugin is developed in my spare time don't expect a quick fix.
