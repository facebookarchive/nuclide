"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CliRpcMethods = void 0;

var path = _interopRequireWildcard(require("path"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _net = _interopRequireDefault(require("net"));

function _string() {
  const data = require("../nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function proto() {
  const data = _interopRequireWildcard(require("./Protocol"));

  proto = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const CLI_SOCKET = '/tmp/big-dig-vscode';
const logger = (0, _log4js().getLogger)('cli');

class CliRpcMethods {
  register(registrar) {
    if (this._observer == null) {
      this._observer = this._observeCli();
    }

    registrar.registerObservable('cli/listen', this._listen.bind(this));
  }

  _observeCli() {
    return _RxMin.Observable.create(observer => {
      try {
        const cliServer = _net.default.createServer(cliSocket => this._onCliConnection(observer, cliSocket));

        _fsPromise().default.rimraf(CLI_SOCKET).then(() => cliServer.listen(CLI_SOCKET), error => observer.error(error));
      } catch (error) {
        observer.error(error);
      }
    });
  }

  _onCliConnection(observer, cliSocket) {
    let data = '';
    cliSocket.on('data', msg => {
      data += String(msg).trim();
    });
    cliSocket.on('error', error => {
      logger.warn(error);
    });
    cliSocket.on('end', () => {
      observer.next(data);
    });
  }

  _listen(params) {
    return this._observer.concatMap(async msg => {
      logger.info(msg);
      const args = (0, _string().shellParse)(msg);

      if (args.length > 2 && args[0] === params.session) {
        const cwd = args[1];
        const files = args.slice(2).map(file => path.resolve(cwd, file));
        return {
          cwd,
          files
        };
      } else {
        return null;
      }
    }).concatMap(v => v == null ? [] : [v]);
  }

}

exports.CliRpcMethods = CliRpcMethods;