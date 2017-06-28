'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


const CONNECTION_EVENT = 'nuclide-remote-connection'; /**
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

class ConnectionTracker {

  constructor(config) {
    this._config = config;
    this._expired = false;
    this._connectionStartTime = Date.now();
    this._promptYubikeyTime = 0;
    this._finishYubikeyTime = 0;
  }

  trackPromptYubikeyInput() {
    this._promptYubikeyTime = Date.now();
  }

  trackFinishYubikeyInput() {
    this._finishYubikeyTime = Date.now();
  }

  trackSuccess() {
    this._trackConnectionResult(true);
  }

  trackFailure(errorType, e) {
    this._trackConnectionResult(false, errorType, e);
  }

  _trackConnectionResult(succeed, errorType, e) {
    if (this._expired) {
      return;
    }

    const preYubikeyDuration = this._promptYubikeyTime > 0 ? this._promptYubikeyTime - this._connectionStartTime : 0;
    const postYubikeyDuration = this._finishYubikeyTime > 0 ? Date.now() - this._finishYubikeyTime : 0;
    const realDuration = preYubikeyDuration > 0 && postYubikeyDuration > 0 ? preYubikeyDuration + postYubikeyDuration : 0;

    track(CONNECTION_EVENT, {
      error: succeed ? '0' : '1',
      errorType: errorType || '',
      exception: e ? `name: ${e.name}, message: ${e.message}, stack: ${e.stack}.` : '',
      duration: (Date.now() - this._connectionStartTime).toString(),
      preYubikeyDuration: preYubikeyDuration.toString(),
      postYubikeyDuration: postYubikeyDuration.toString(),
      realDuration: realDuration.toString(),
      host: this._config.host,
      sshPort: this._config.sshPort.toString(),
      username: this._config.username,
      remoteServerCommand: this._config.remoteServerCommand,
      authMethod: this._config.authMethod
    });

    this._expired = true;
  }
}

exports.default = ConnectionTracker;
function track(eventName, metaData) {}