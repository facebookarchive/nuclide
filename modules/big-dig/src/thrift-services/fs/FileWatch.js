"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileWatch = void 0;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _filesystem_types() {
  const data = _interopRequireDefault(require("./gen-nodejs/filesystem_types"));

  _filesystem_types = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('remote-fs');
const POLLING_INTERVAL_MS = 3000;

class FileWatch {
  constructor(getClientWrapper, watchPath, options, handler) {
    this._getClientWrapper = getClientWrapper;
    this._watchPath = watchPath;
    this._watchOptions = options;
    this._pollingInterval = null;
    this._fileChangesHandler = handler;

    this._startWatching();
  }

  async _startWatching() {
    try {
      const client = await this._getClient();
      this._watchId = await client.watch(this._watchPath, this._watchOptions);
      this._pollingInterval = setInterval(async () => {
        const thriftClient = await this._getClient();
        const changes = await thriftClient.pollFileChanges(this._watchId);

        this._fileChangesHandler(this._watchPath, changes);
      }, POLLING_INTERVAL_MS);
    } catch (err) {
      logger.error('Unable to watch target directory', err);
      return Promise.reject(err);
    }
  }

  getWatchPath() {
    return this._watchPath;
  }

  getWatchOptions() {
    return this._watchOptions;
  }

  async _getClient() {
    const clientWrapper = await this._getClientWrapper();
    return clientWrapper.getClient();
  }

  async _unwatch() {
    try {
      const client = await this._getClient();
      await client.unwatch(this._watchId);
    } catch (error) {
      logger.error('Unable to unwatch ', this._watchPath, this._watchOptions);
    }
  }

  _disposePollingInterval() {
    if (this._pollingInterval) {
      clearInterval(this._pollingInterval);
      this._pollingInterval = null;
    }
  }

  dispose() {
    this._unwatch();

    this._disposePollingInterval();
  }

}

exports.FileWatch = FileWatch;