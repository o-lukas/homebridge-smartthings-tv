# Homebridge SmartThings TV

[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![semantic-release](https://img.shields.io/badge/semantic--release-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)
![NPM Version](https://badgen.net/npm/v/@o-lukas/homebridge-smartthings-tv?label=stable)
![NPM Node Version](https://badgen.net/npm/node/@o-lukas/homebridge-smartthings-tv)
![NPM Total Downloads](https://badgen.net/npm/dt/@o-lukas/homebridge-smartthings-tv)
![GitHub issues](https://img.shields.io/github/issues/o-lukas/homebridge-smartthings-tv?label=Issues)
[![Build and Lint](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/build.yml/badge.svg)](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/build.yml)

This is a plugin for [Homebridge](https://github.com/homebridge/homebridge). It offers some basic functions to control Samsung TVs and SoundBars using the SmartThings API.

Both device types will be registered as TVs because this is the only device type that is able to control input sources at the moment.

## Configuration

The easiest way to configure the plugin is to use [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x) which should contain a description for every needed property. The only property needed to make the plugin work is the SmartThings API token. The other properties enable some additional functions but are not mandatory for the plugin to work.

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
                    "nameOverride": "xxxx",
                    "wol": true,
                    "macAddress": "xx:xx:xx:xx:xx:xx",
                    "ping": true,
                    "ipAddress": "xx:xx:xx:xx:xx:xx",
                    "infoKey": "MENU",
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
                    ],
                    "validateApplications": false
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
            "tvDeviceTypes": [
                "oic.d.tv",
                "x.com.st.d.monitor"
            ],
            "soundbarDeviceTypes": [
                "oic.d.networkaudio"
            ],
            "platform": "smartthings-tv"
        }
    ]
}
```

### token

The SmartThings API token is needed to authenticate the requests sent to the SmartThings API. To generate a token open [SmartThings website]( https://account.smartthings.com/tokens) and generate a new one (make sure at least devices is selected).

### capabilityLogging

The SmartThings API returns the list of supported actions of a device as capabilities. For implementing new features it is neccessary to know the scheme the capability uses. Enable this property to log all capabilities of supported SmartThings devices.

### cyclicCallsLogging

Enable debug logging for cyclic calls (e.g. polling).

### registerApplications

To use installed application as input sources, a [predefined list of applications](./src/tvApps.ts) will be used.

> [!NOTE]
> Not implemented for SoundBars.

### registerPictureModes

Registers all available picture modes as separate switches that can be toggled to enable/disable a picture mode. Uses the names as exposed from the SmartThings API.

> [!NOTE]
> Not implemented for SoundBars.

### registerSoundModes

Registers all available sound modes as separate switches that can be toggled to enable/disable a sound mode. Uses the names as exposed from the SmartThings API.

> [!NOTE]
> Not implemented for SoundBars.

### registerVolumeSlider

Registers a separate volume slider accessorry that will be exposed as a light bulb accessory (because there is currently no option to change a speaker volume directly using Home).

### pollInterval

Some characteristics are not updated automatically (e.g. power state). To enable polling these characteristics automatically set this value to the desired polling interval in milliseconds. Leave empty to disable this functionality.

### deviceBlocklist

Devices not to be registered.

### deviceMappings

Use the device mappings when e.g. turning on the accessory does not work as expected. When a device mapping is available the wake-on-lan functionality is used to turn on the device instead of the SmartThings API. To make use of the functionality you must enter the mapping using the SmartThings device ID and the mac address of the device. If status does not show up properly you can use the ping functionality to determine the device status. To make use of it you must enter the SmartThings device ID and the ip address of the device.

The following table gives an overview which properties do work for the device types:

| Configuration property | TV                 | SoundBar           |
| ---------------------- | ------------------ | ------------------ |
| deviceId               | :white_check_mark: | :white_check_mark: |
| nameOverride           | :white_check_mark: | :white_check_mark: |
| wol                    | :white_check_mark: | :white_check_mark: |
| macAddress             | :white_check_mark: | :white_check_mark: |
| ping                   | :white_check_mark: | :white_check_mark: |
| ipAddress              | :white_check_mark: | :white_check_mark: |
| infoKey                | :white_check_mark: | :x:                |
| inputSources           | :white_check_mark: | :white_check_mark: |
| applications           | :white_check_mark: | :x:                |
| category               | :white_check_mark: | :white_check_mark: |

#### deviceId

The SmartThings device id. Check the log or go to <https://account.smartthings.com/> and get the device id.

#### nameOverride

Use this to override the default display name of the device. Must be configured here because name configured in HomeKit will get lost after restart.

#### wol

Enables usage of wake-on-lan functionality to turn the device on. Use only if using the SmartThings API does not work for your device.

#### macAddress

The mac address of the device to turn device on using wake-on-lan functionality.

#### ping

Enables usage of ping functionality to determine if device is turned on. Use only if using the SmartThings API does not work for your device.

#### ipAddress

The IP address of the device (assign a static IP address to make sure it does not change) to determine the status using ping.

#### infoKey

The key to be emulated when pressing info button in HomeKit remote. The list of valid values must be read from the log as it differs per device. To do so enable capabilityLogging and look for log entry containing the possible values.

#### inputSources

Overrides the device's default input sources map to add custom input sources. Check the log for information about the default input sources.

##### name

The input source's name.

##### id

The input source's id.

#### applications

Overrides the default application mapping list to add custom applications. See [registerApplications](#registerapplications) for more details about application registration.

##### name

The application's name.

##### ids

The application's possible ids. Since some applications have different ids for different versions of TVs you can provide a list here so the plugin will try every id and use the one that's working.

#### validateApplications

Validates the list of applications by trying to open them when starting the plugin. This list will be checked for availability at the TV(s) and eventually be registered as input sources. Make sure to have the TV(s) turned on when starting your instance as this functionality requires your TV(s) be turned on to determine whether an application is installed or not. On startup the applications will be opened to determine if they are available. Do not use your TV until the input source is being changed back to the first one (usually Live TV). Afterwards the list of working applications will be written to this device list of applications. Note that this flag will be set to off after validation the application list. So check will only run on first start or manual reset.

#### category

The icon to be used as a hint to iOS clients about what type of Accessory this represents. Can be used to override default values.

## tvDeviceTypes

List of SmartThings device types that should be registered as TVs (leave empty to use default values).

## soundbarDeviceTypes

List of SmartThings device types that should be registered as Soundbar (leave empty to use default values).

## Common issues

### TV does not show in HomeKit

After starting you have to add the TV manually to HomeKit because they are published as external accessory to get over the limit of only one TV per bridge.

If your TV is lost after an update/restart/etc. you might need to reset the connection. To do so reset the externally published accessories in Homebridge using: Unpair Bridges / Cameras / TVs / External Accessories in the Homebridge settings.

### TV does not turn on

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

### TV state does not match actual state

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

### Picture/sound mode switches do not match TV picture mode settings

Some TVs always report the same picture & sound mode. This will cause the exposed switches to not match the actual picture/sound mode state. I have not found a proper solution for this problem yet. But toggling the buttons will still work.

### Error `invalid device state`

Sometimes the SmartThings API seems to loose the contact to the device and does not update it's state so every request will end up with an error message like `invalid device state`. To fix this try to remove the device from your SmartThings account and add it again. This seems to fix the problem.

### DisplayPort input sources do not show up

For some TVs display port sources do not show up. When having the same problem you might try to use [inputSources](#inputsources). `Id` might be something like `Display Port` but you will have to experiment a bit trying different ids until you find the the right one.

### Name of TV gets reset in HomeKit after HomeBridge restart

The configured name can not be cached because TV is published as external accessory. To permanently change the name use [nameOverride](#nameoverride).

### Device does not get registered

TVs do have different device types returned from SmartThings API. If your TV does not get registered, activate debug logging and look for a log entry like `Ignoring SmartThings device ... because device type ... is not in list of implemented/configured types [...]`. Use the device type stated here and add it to the matching configuration property [tvDeviceTypes](#tvdevicetypes) or [soundbarDeviceType](#soundbardevicetypes).

Currently only the default values have been tested. So please create a ticket if you're running into any problems with your device type. If everything is working well please create a ticket as well so the device type can be added to the default configuration.

***

Since this is my first plugin it may contain some problems. Feel free to create an issue or pull request and I will try to help and fix the problems.

But since this plugin is developed in my spare time don't expect a quick fix.
