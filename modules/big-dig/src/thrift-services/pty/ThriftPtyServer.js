"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThriftPtyServer = void 0;

function _thrift() {
  const data = _interopRequireDefault(require("thrift"));

  _thrift = function () {
    return data;
  };

  return data;
}

function _ThriftPtyService() {
  const data = _interopRequireDefault(require("./gen-nodejs/ThriftPtyService"));

  _ThriftPtyService = function () {
    return data;
  };

  return data;
}

function _ThriftPtyServiceHandler() {
  const data = require("./ThriftPtyServiceHandler");

  _ThriftPtyServiceHandler = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
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
 *  strict-local
 * @format
 */
// $FlowIgnore
// $FlowIgnore
const logger = (0, _log4js().getLogger)('thrift-pty-server');

class ThriftPtyServer {
  constructor(_portOrPath) {
    this._portOrPath = _portOrPath;
    this._server = null;
  }

  async initialize() {
    logger.info('initializing thrift pty service');

    if (this._server != null) {
      return;
    }

    this._handler = new (_ThriftPtyServiceHandler().ThriftPtyServiceHandler)();
    this._server = _thrift().default.createServer(_ThriftPtyService().default, this._handler);

    this._server.on('error', error => {
      logger.info('got error');
      throw error;
    });

    this._server.listen(this._portOrPath);
  }

  close() {
    logger.info('Closing Thrift Pty Server');
    this._server = null;

    this._handler.dispose();
  }

}

exports.ThriftPtyServer = ThriftPtyServer;