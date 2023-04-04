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
            "token": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
            "capabilityLogging": true,
            "registerApplications": true,
            "registerPictureModes": true,
            "registerSoundModes": true,
            "deviceMappings": [
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "macAddress": "xx:xx:xx:xx:xx:xx",
                    "ipAddress": "xx:xx:xx:xx:xx:xx"
                },
                {
                    "deviceId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                    "macAddress": "xx:xx:xx:xx:xx:xx",
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

### registerApplications

To use installed application as input sources, a [predefined list of applications](./src/res/apps.json) will be used. This list will be checked for availability at the TV(s) and eventually be registered as input sources. Make sure to have the TV(s) turned on when starting your instance as this functionality requires your TV(s) be turned on to determine whether an application is installed or not. On startup the applications will be opened to determine if they are available. Do not use your TV until the input source is being changed back to the first one (usually Live TV).

### registerPictureModes

Registers all available picture modes as separate switches that can be toggled to enable/disable a picture mode. Uses the names as exposed from the SmartThings API.

### registerSoundModes

Registers all available sound modes as separate switches that can be toggled to enable/disable a sound mode. Uses the names as exposed from the SmartThings API.

### deviceMappings

Use the device mappings when e.g. turning on the accessory does not work as expected. When a device mapping is available the wake-on-lan functionality is used to turn on the device instead of the SmartThings API. To make use of the functionality you must enter the mapping using the SmartThings device ID and the mac address of the device. If status does not show up properly you can use the ping functionality to determine the device status. To make use of it you must enter the SmartThings device ID and the ip address of the device.

#### deviceId

The SmartThings device id. Check the log or go to https://account.smartthings.com/ and get the device id.

### macAddress

The mac address of the device to turn device on using wake-on-lan functionality.

### ipAddress

The IP address of the device (assign a static IP address to make sure it does not change) to determine the status using ping.

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

***

Since this is my first plugin it may contain some problems. Feel free to create an issue or pull request and I will try to help and fix the problems. 

But since this plugin is developed in my spare time don't expect a quick fix. 
