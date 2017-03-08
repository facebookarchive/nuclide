'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = require('./ClientCallback');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class Handler {

  constructor(domain, clientCallback) {
    this._domain = domain;
    this._clientCallback = clientCallback;
  }

  getDomain() {
    return this._domain;
  }

  handleMethod(id, method, params) {
    throw new Error('absrtact');
  }

  unknownMethod(id, method, params) {
    const message = 'Unknown chrome dev tools method: ' + this.getDomain() + '.' + method;
    (_utils || _load_utils()).default.log(message);
    this.replyWithError(id, message);
  }

  replyWithError(id, error) {
    this._clientCallback.replyWithError(id, error);
  }

  replyToCommand(id, result, error) {
    this._clientCallback.replyToCommand(id, result, error);
  }

  sendMethod(method, params) {
    this._clientCallback.sendServerMethod(method, params);
  }

  sendUserMessage(type, message) {
    this._clientCallback.sendUserMessage(type, message);
  }
}
exports.default = Handler;