"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
class RemoteControlService {
  constructor(service) {
    this._service = service;
  }

  startVspDebugging(config) {
    return this._service.startDebugging(config);
  }

  onDidChangeDebuggerSessions(callback) {
    return this._service.getModel().onDidChangeProcesses(() => {
      callback(this._service.getModel().getProcesses().map(p => p.configuration));
    });
  }

  getDebugSessions() {
    return this._service.getModel().getProcesses().map(p => p.configuration);
  }

}

exports.default = RemoteControlService;