/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import * as prodZip from './production';
import * as devZip from './development';
import {__DEV__} from '../dev';
import {getLogger} from 'log4js';

const logger = getLogger('deploy');

/**
 * In case modules are only loaded on demand, call `init` to start background tasks.
 */
export function devInit() {
  devZip.init();
}

/**
 * @return The version string of the server.
 */
export async function serverPackageZipVersion(): Promise<string> {
  if (__DEV__) {
    try {
      return await devZip.packageVersion();
    } catch (error) {}
  }
  return prodZip.packageVersion();
}

/**
 * Creates a zip archive containing the server and all of its dependencies.
 */
export async function packageServerZip(existingVersion: ?string) {
  if (__DEV__) {
    logger.info('Preparing server package for deployment [DEV]');
    try {
      return await devZip.createServerPackage(existingVersion);
    } catch (error) {
      /* fall through */
    }
    logger.warn(
      'Could not generate development delta package; creating full package',
    );
  } else {
    logger.info('Preparing server package for deployment');
  }
  return prodZip.createServerPackage();
}
