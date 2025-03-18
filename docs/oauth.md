# SmartThings OAuth setup

Samsung has made some significant changes to the [Personal Access Tokens (PAT)](https://community.smartthings.com/t/changes-to-personal-access-tokens-pat/292019) authentication workflow.  The most significant of these is the 24 hour expiration, making this auth workflow practically unusable for our purposes.  Samsung has encouraged developers to migrate to an [OAuth flow](https://developer.smartthings.com/docs/connected-services/oauth-integrations) instead.

## Installing the SmartThings CLI

Configuring our OAuth workflow requires the installation of the [SmartThings CLI](https://github.com/SmartThingsCommunity/smartthings-cli).

#### macOS (Homebrew)

```bash
brew install smartthingscommunity/smartthings/smartthings
```

#### Windows

Download and install the `smartthings.msi` installer from the [releases](https://github.com/SmartThingsCommunity/smartthings-cli/releases) page.

#### Linux

If your distribution's package manager does not yet have a package available, you may download and install the binaries from the [releases](https://github.com/SmartThingsCommunity/smartthings-cli/releases) page.

## Create an app using the SmartThings CLI

Once you have the `smartthings` CLI installed, you may proceed to create and register an app for Samsung OAuth.

### Create the app
```bash
> smartthings apps:create
? What kind of app do you want to create? (Currently, only OAuth-In apps are supported.) (Use arrow keys)
❯ OAuth-In App  ## select and hit Enter

More information on writing SmartApps can be found at
  https://developer.smartthings.com/docs/connected-services/smartapp-basics

? Display Name              ## Required: can be anything informative, like "Homebridge SmartThings TV"
? Description               ## Required: can be any string
? Icon Image URL (optional) ## leave blank
? Target URL (optional)     ## leave blank
```

More information on OAuth 2 Scopes can be found at:
  https://www.oauth.com/oauth2-servers/scope/

To determine which scopes you need for the application, see documentation for the individual endpoints you will use in your app:
  https://developer.smartthings.com/docs/api/public/

### Select scopes

You must add read, write, execute scopes on `devices` for the plugin to work.

```bash
? Select Scopes. (Press <space> to select, <a> to toggle all, <i> to invert selection, and <enter> to proceed)
❯◉ r:devices:*  ## be sure to select this
 ◉ w:devices:*  ## be sure to select this
 ◉ x:devices:*  ## be sure to select this
 ◯ r:hubs:*
 ◯ r:locations:*
 ◯ w:locations:*
 ◯ x:locations:*
 ◯ r:scenes:*
 ◯ x:scenes:*
 ◯ r:rules:*
 ◯ w:rules:*
 ◯ r:installedapps
 ◯ w:installedapps
```

### Add redirect URI

We use (by default) the free `httpbin.org` HTTP request/response service to handle the redirect, which allows us to receive an authentication code from Samsung OAuth as plain text.  You may use another service, but the `OAuth redirect URL` and the URI you paste into the CLI as shownn below must match.

```bash
? Add or edit Redirect URIs.
  Help
❯ Add Redirect URI. ## select and hit Enter
  Finish editing Redirect URIs.
  Cancel

? Redirect URI (? for help) https://httpbin.org/get

? Add or edit Redirect URIs. (Use arrow keys)
  Edit https://httpbin.org/get.
  ──────────────
  Help
  Add Redirect URI.
❯ Finish editing Redirect URIs. ## we are finished, so select and hit Enter
  Cancel
```

```bash
? Choose an action. (Use arrow keys)
  Edit OAuth-In SmartApp.
  Preview JSON.
  Preview YAML.
❯ Finish and create OAuth-In SmartApp.  ## select and hit Enter
  Cancel creation of OAuth-In SmartApp.
```

You will be presented with a summary of the app you have created, as shown below:

```bash
Basic App Data:
───────────────────────────────────────────────────────────────────
 Display Name     Homebridge
 App Id           ************************************
 App Name         ahomebridge-************************************
 Description      Homebridge
 Single Instance  true
 Classifications  CONNECTED_SERVICE
 App Type         API_ONLY
───────────────────────────────────────────────────────────────────


OAuth Info (you will not be able to see the OAuth info again so please save it now!):
───────────────────────────────────────────────────────────
 OAuth Client Id      ************************************
 OAuth Client Secret  ************************************
───────────────────────────────────────────────────────────
```

The critical values you need to proceed are the `OAuth Client Id` and `OAuth Client Secret`.  You will enter these into the first page of the wizard as described in the next section.

## OAuth Wizard

1. In Homebridge > Plugins > Homebridge SmartThings TV, choose `Plugin Config` from the settings menu.
1. Switch the `SmartThings authentication type` from `PAT` to `OAuth`.  This enables the `Open OAuth Wizard` button above.
1. Click `Open OAuth Wizard`
  - **SmartThings App**: We recommend leaving the `OAuth redirect URL` and `OAuth scopes` as default.  Copy/paste the client ID and secret from the CLI output you generated.
  - **Redirection**: When you click "Next", the browser should open and ask you to log in with your Samsung account.  Once you do, you should see a redirect to `https://httpbin.org/get` with some JSON parameters:

    ```json
    {
    "args": {
        "code": "xxxxxx"
    },
    "headers": {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "en-US,en;q=0.5",
        "Dnt": "1",
        "Host": "httpbin.org",
        "Priority": "u=0, i",
        "Referer": "https://api.smartthings.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0",
        "X-Amzn-Trace-Id": "Root=***********************************"
    },
    "origin": "xxx.xxx.xxx.xxx",
    "url": "https://httpbin.org/get?code=xxxxxx"
    }
    ```
    The six character `args:code` value should be copied and pasted for the next step of the wizard.

  - **Authorization code**: Paste the authorization code and hit "Next"
  - **Authorization token**: At this stage, the access token and refresh token fields should be populated for you.  Click "Submit" and "Save" to finish the OAuth process.
