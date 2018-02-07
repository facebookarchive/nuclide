'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSourceMaps = exports.buildBundle = exports.reloadApp = exports.getStartCommand = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Get the command that would be used if you asked to start Metro at the given URI.
 * Returns null if Metro cannot be started there.
 * TODO: We need to have a solid concept of an "active project" that's consistent across Nuclide
 *       (i.e. where we should look for commands like this) and use that here. The current behavior
 *       of everything having its own algorithm is bad.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

let getStartCommand = exports.getStartCommand = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (projectRoot) {
    return (yield (0, (_StartCommand || _load_StartCommand()).getStartCommandFromBuck)(projectRoot)) || (0, (_StartCommand || _load_StartCommand()).getStartCommandFromNodePackage)(projectRoot);
  });

  return function getStartCommand(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * Create an observable that runs Metro and collects it output.
 * IMPORTANT: You likely want to start Metro via the Atom service provided by nuclide-metro,
 * as it sets up Console integration and correctly shares its state across all of Nuclide.
 */


let reloadApp = exports.reloadApp = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return new Promise(function (resolve, reject) {
      const url = 'ws://localhost:8081/message?role=interface&name=Nuclide';
      const message = {
        version: 2,
        method: 'reload'
      };

      const ws = new (_ws || _load_ws()).default(url);
      ws.onopen = function () {
        ws.send(JSON.stringify(message));
        ws.close();
        resolve();
      };
      ws.onerror = function (error) {
        reject(error);
      };
    });
  });

  return function reloadApp() {
    return _ref2.apply(this, arguments);
  };
})();

let buildBundle = exports.buildBundle = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (bundleName, platform) {
    const url = `http://localhost:8081/${bundleName}.bundle?platform=${platform}&dev=true&minify=false`;
    yield (0, (_xfetch || _load_xfetch()).default)(url, { method: 'HEAD' });
  });

  return function buildBundle(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
})();

let buildSourceMaps = exports.buildSourceMaps = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (bundleName, platform) {
    const url = `http://localhost:8081/${bundleName}.map?platform=${platform}&dev=true&minify=false`;
    yield (0, (_xfetch || _load_xfetch()).default)(url, { method: 'HEAD' });
  });

  return function buildSourceMaps(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
})();

exports.startMetro = startMetro;

var _StartCommand;

function _load_StartCommand() {
  return _StartCommand = require('./StartCommand');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _parseMessages;

function _load_parseMessages() {
  return _parseMessages = require('./parseMessages');
}

var _xfetch;

function _load_xfetch() {
  return _xfetch = _interopRequireDefault(require('../../commons-node/xfetch'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _types;

function _load_types() {
  return _types = require('./types');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startMetro(projectRoot, editorArgs) {
  const stdout = _rxjsBundlesRxMinJs.Observable.defer(() => getStartCommand(projectRoot)).switchMap(commandInfo => commandInfo == null ? _rxjsBundlesRxMinJs.Observable.throw(noMetroProjectError()) : _rxjsBundlesRxMinJs.Observable.of(commandInfo)).switchMap(commandInfo => {
    const { command, cwd, args } = commandInfo;
    return (0, (_process || _load_process()).observeProcess)(command, args, {
      cwd,
      env: Object.assign({}, process.env, {
        REACT_EDITOR: (0, (_string || _load_string()).shellQuote)(editorArgs),
        // We don't want to pass the NODE_PATH from this process
        NODE_PATH: null
      }),
      killTreeWhenDone: true
    }).catch(error => {
      if (error.exitCode === 11) {
        return _rxjsBundlesRxMinJs.Observable.throw(metroPortBusyError());
      } else {
        return _rxjsBundlesRxMinJs.Observable.throw(error);
      }
    });
  }).filter(event => event.kind === 'stdout').map(event => {
    if (!(event.kind === 'stdout')) {
      throw new Error('Invariant violation: "event.kind === \'stdout\'"');
    }

    return event.data;
  });

  return (0, (_parseMessages || _load_parseMessages()).parseMessages)(stdout).publish();
}

function noMetroProjectError() {
  const error = new Error('No Metro project found');
  error.code = (_types || _load_types()).NO_METRO_PROJECT_ERROR;
  return error;
}

function metroPortBusyError() {
  const error = new Error('Cannot start Metro because the port is busy');
  error.code = (_types || _load_types()).METRO_PORT_BUSY_ERROR;
  return error;
}