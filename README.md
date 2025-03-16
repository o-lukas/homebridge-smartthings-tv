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

If you have any problems please make sure to check the [common issues pages](./docs/common-issues.md) before creating a new issue.

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

To get information about all supported properties please check the [config schema file](./config.schema.json).

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by any of the companies or products mentioned herein. All product names, trademarks, and registered trademarks are the property of their respective owners. The use of these names, logos, or brands is for identification purposes only and does not imply any association or endorsement.
