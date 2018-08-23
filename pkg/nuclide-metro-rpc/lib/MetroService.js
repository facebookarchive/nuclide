"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStartCommand = getStartCommand;
exports.startMetro = startMetro;
exports.reloadApp = reloadApp;
exports.buildBundle = buildBundle;
exports.buildSourceMaps = buildSourceMaps;

function _StartCommand() {
  const data = require("./StartCommand");

  _StartCommand = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

function _parseMessages() {
  const data = require("./parseMessages");

  _parseMessages = function () {
    return data;
  };

  return data;
}

function _xfetch() {
  const data = _interopRequireDefault(require("../../commons-node/xfetch"));

  _xfetch = function () {
    return data;
  };

  return data;
}

function _ws() {
  const data = _interopRequireDefault(require("ws"));

  _ws = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("./types");

  _types = function () {
    return data;
  };

  return data;
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
 * @format
 */

/**
 * Get the command that would be used if you asked to start Metro at the given URI.
 * Returns null if Metro cannot be started there.
 * TODO: We need to have a solid concept of an "active project" that's consistent across Nuclide
 *       (i.e. where we should look for commands like this) and use that here. The current behavior
 *       of everything having its own algorithm is bad.
 */
async function getStartCommand(projectRoot) {
  return (await (0, _StartCommand().getStartCommandFromBuck)(projectRoot)) || (0, _StartCommand().getStartCommandFromNodePackage)(projectRoot);
}
/**
 * Create an observable that runs Metro and collects it output.
 * IMPORTANT: You likely want to start Metro via the Atom service provided by nuclide-metro,
 * as it sets up Console integration and correctly shares its state across all of Nuclide.
 */


function startMetro(projectRoot, editorArgs, port = 8081, extraArgs = []) {
  const output = _RxMin.Observable.defer(() => getStartCommand(projectRoot)).switchMap(commandInfo => commandInfo == null ? _RxMin.Observable.throw(noMetroProjectError()) : _RxMin.Observable.of(commandInfo)).switchMap(commandInfo => {
    const {
      command,
      cwd
    } = commandInfo;
    return (0, _process().observeProcess)(command, extraArgs.concat(commandInfo.args || []).concat([`--port=${port}`]), {
      cwd,
      env: Object.assign({}, process.env, {
        REACT_EDITOR: (0, _string().shellQuote)(editorArgs),
        // We don't want to pass the NODE_PATH from this process
        NODE_PATH: null
      }),
      killTreeWhenDone: true
    }).catch(error => {
      if (error.exitCode === 11) {
        return _RxMin.Observable.throw(metroPortBusyError());
      } else {
        return _RxMin.Observable.throw(error);
      }
    });
  }).filter(event => event.kind === 'stdout' || event.kind === 'stderr').map(event => {
    if (!(event.kind === 'stdout' || event.kind === 'stderr')) {
      throw new Error("Invariant violation: \"event.kind === 'stdout' || event.kind === 'stderr'\"");
    }

    return event.data;
  });

  return (0, _parseMessages().parseMessages)(output).publish();
}

function noMetroProjectError() {
  const error = new Error('No Metro project found');
  error.code = _types().NO_METRO_PROJECT_ERROR;
  return error;
}

function metroPortBusyError() {
  const error = new Error('Cannot start Metro because the port is busy');
  error.code = _types().METRO_PORT_BUSY_ERROR;
  return error;
}

async function reloadApp(port = 8081) {
  return new Promise((resolve, reject) => {
    const url = `ws://localhost:${port}/message?role=interface&name=Nuclide`;
    const message = {
      version: 2,
      method: 'reload'
    };
    const ws = new (_ws().default)(url);

    ws.onopen = () => {
      ws.send(JSON.stringify(message));
      ws.close();
      resolve();
    };

    ws.onerror = error => {
      reject(error);
    };
  });
}

async function buildBundle(bundleName, platform, port = 8081) {
  const url = `http://localhost:${port}/${bundleName}.bundle?platform=${platform}&dev=true&minify=false`;
  await (0, _xfetch().default)(url, {
    method: 'HEAD'
  });
}

async function buildSourceMaps(bundleName, platform, port = 8081) {
  const url = `http://localhost:${port}/${bundleName}.map?platform=${platform}&dev=true&minify=false`;
  await (0, _xfetch().default)(url, {
    method: 'HEAD'
  });
}