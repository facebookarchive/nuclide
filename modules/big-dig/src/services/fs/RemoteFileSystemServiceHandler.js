/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import filesystem_types from './gen-nodejs/filesystem_types';
import fsPromise from 'nuclide-commons/fsPromise';

/**
 * Create a service handler class to manage server methods
 */
export class RemoteFileSystemServiceHandler {
  // We need to initialize necessary server handler state later
  constructor() {}

  async createDirectory(uri: string): Promise<void> {
    try {
      return await fsPromise.mkdir(uri);
    } catch (err) {
      throw this._createThriftError(err);
    }
  }

  _createThriftError(err: Object): filesystem_types.Error {
    const error = new filesystem_types.Error();
    error.code = err.code;
    error.message =
      filesystem_types.ERROR_MAP[filesystem_types.ErrorCode[err.code]];
    return error;
  }
}
