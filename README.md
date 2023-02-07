# Homebridge SmartThings TV

![NPM Version](https://badgen.net/npm/v/@o-lukas/homebridge-smartthings-tv?label=stable)
![NPM Version](https://badgen.net/npm/node/@o-lukas/homebridge-smartthings-tv)
![GitHub issues](https://img.shields.io/github/issues/o-lukas/homebridge-smartthings-tv?label=Issues)
[![Build and Lint](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/build.yml/badge.svg)](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/build.yml)
[![Publish to NPM](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/publish.yml/badge.svg)](https://github.com/o-lukas/homebridge-smartthings-tv/actions/workflows/publish.yml)

This is a plugin for [Homebridge](https://github.com/homebridge/homebridge). It offers some basic functions to control Samsung TVs using the SmartThings API.

# Configuration

The easiest way to configure the plugin is to use [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x) which should contain a description for every needed property. The only property needed to make the plugin work is the SmartThings API token. The other properties enable some additional functions but are not mandatory for the plugin to work.

If you don't use the [Homebridge Config UI X](https://github.com/oznu/homebridge-config-ui-x) see the following example for configuration:

```json
{
    "bridge": {
        ...
    },
    "accessories": [],
    "platforms": [
        ...
        {
            "token": "your SmartThings API token",
            "deviceMappings": [
                {
                    "deviceId": "the SmartThings device ID",
                    "macAddress": "the mac address of the device (needed for wake-on-lan functionality)",
                    "ipAddress": "the ip address of the device (needed for ping functionality)"
                }
            ],
            "platform": "smartthings-tv"
        }
        ...
    ]
}
```

***

Since this is my first plugin it may contain some problems. Feel free to create an issue or pull request and I will try to help and fix the problems. 

But since this plugin is developed in my spare time don't expect a quick fix. 
