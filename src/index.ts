import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { SmartThingsPlatform } from './platform';

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, SmartThingsPlatform);
};
