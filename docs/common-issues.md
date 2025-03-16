

# Common issues

## TV does not show in HomeKit

After starting you have to add the TV manually to HomeKit because they are published as external accessory to get over the limit of only one TV per bridge.

If your TV is lost after an update/restart/etc. you might need to reset the connection. To do so reset the externally published accessories in Homebridge using: Unpair Bridges / Cameras / TVs / External Accessories in the Homebridge settings.

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

For some TVs display port sources do not show up. When having the same problem you might try to use `inputSource`. `Id` might be something like `Display Port` but you will have to experiment a bit trying different ids until you find the the right one.

## Name of TV gets reset in HomeKit after HomeBridge restart

The configured name can not be cached because TV is published as external accessory. To permanently change the name use `nameOverride`.

## Device does not get registered

TVs do have different device types returned from SmartThings API. If your TV does not get registered, activate debug logging and look for a log entry like `Ignoring SmartThings device ... because device type ... is not in list of implemented/configured types [...]`. Use the device type stated here and add it to the matching configuration property `tvDeviceTypes` or `soundbarDeviceType`.

Currently only the default values have been tested. So please create a ticket if you're running into any problems with your device type. If everything is working well please create a ticket as well so the device type can be added to the default configuration.

## Personal access tokens expire after 24h

Since the end of 2024 all new SmartThings personal access tokens do expire after 24h. This is a change Samsung announced pretty unexpected in december 2024 in the [SmartThings forum](https://community.smartthings.com/t/changes-to-personal-access-tokens-pat/292019). If your token has been created before 30.12.2024 your token can still be used but all tokens created after that date will expire and will not be usable after 24h.

To fix this please change the `tokenType` to `OAuth` and use the setup wizard to enable OAuth integration.

## Request failed with status code 429

Since the end of 2024 all new SmartThings persoanl access tokens have a rate limit. This is a change Samsung announced pretty unexpected in december 2024 in the [SmartThings forum](https://community.smartthings.com/t/changes-to-personal-access-tokens-pat/292019). If your token has been created before 30.12.2024 your token can still be used but all tokens created after that date will probably have problems with this plugin because the rate limit is pretty low.

To fix this please change the `tokenType` to `OAuth` and use the setup wizard to enable OAuth integration because it looks like there is no rate limit for this token type.
