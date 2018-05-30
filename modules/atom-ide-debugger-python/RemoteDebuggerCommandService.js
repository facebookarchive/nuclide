'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.observeRemoteDebugCommands = observeRemoteDebugCommands;
exports.observeAttachDebugTargets = observeAttachDebugTargets;

var _http = _interopRequireDefault(require('http'));

var _net = _interopRequireDefault(require('net'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _promise;

function _load_promise() {
  return _promise = require('../nuclide-commons/promise');
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

let isServerSetup = false;

const debugRequests = new _rxjsBundlesRxMinJs.Subject();
const attachReady = new Map();
const DEBUGGER_REGISTRY_PORT = 9615;

function observeRemoteDebugCommands() {
  let setupStep;
  if (!isServerSetup) {
    setupStep = _rxjsBundlesRxMinJs.Observable.fromPromise(setupServer()).ignoreElements();
  } else {
    setupStep = _rxjsBundlesRxMinJs.Observable.empty();
  }
  return setupStep.concat(debugRequests).publish();
}

function observeAttachDebugTargets() {
  // Validate attach-ready values with the processes with used ports (ready to attach).
  // Note: we can't use process ids because we could be debugging processes inside containers
  // where the process ids don't map to the host running this code.
  return _rxjsBundlesRxMinJs.Observable.interval(3000).startWith(0).switchMap(() => Promise.all(Array.from(attachReady.values()).map(async target => {
    if (!(await isPortUsed(target.port))) {
      attachReady.delete(target.port);
    }
  }))).map(() => Array.from(attachReady.values())).publish();
}

function isPortUsed(port) {
  const tryConnectPromise = new Promise((resolve, reject) => {
    const client = new _net.default.Socket();
    client.once('connect', () => {
      cleanUp();
      resolve(true);
    }).once('error', err => {
      cleanUp();
      resolve(err.code !== 'ECONNREFUSED');
    });

    function cleanUp() {
      client.removeAllListeners('connect');
      client.removeAllListeners('error');
      client.end();
      client.destroy();
      client.unref();
    }

    client.connect({ port, host: '127.0.0.1' });
  });
  // Trying to connect can take multiple seconds, then times out (if the server is busy).
  // Hence, we need to fallback to `true`.
  const connectTimeoutPromise = (0, (_promise || _load_promise()).sleep)(1000).then(() => true);
  return Promise.race([tryConnectPromise, connectTimeoutPromise]);
}

function setupServer() {
  return new Promise((resolve, reject) => {
    _http.default.createServer((req, res) => {
      if (req.method !== 'POST') {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('Invalid request');
      } else {
        let body = '';
        req.on('data', data => {
          body += data;
        });
        req.on('end', () => {
          handleJsonRequest(JSON.parse(body), res);
        });
      }
    }).on('error', reject).listen(DEBUGGER_REGISTRY_PORT, () => {
      isServerSetup = true;
      resolve();
    });
  });
}

function handleJsonRequest(body, res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const { domain, command, type } = body;
  let success = false;
  if (domain !== 'debug' || type !== 'python') {
    res.end(JSON.stringify({ success }));
    return;
  }
  if (command === 'enable-attach') {
    const port = Number(body.port);
    const { options } = body;
    const target = {
      port,
      id: options.id,
      localRoot: options.localRoot,
      remoteRoot: options.remoteRoot,
      debugOptions: options.debugOptions
    };
    attachReady.set(port, target);
    (0, (_log4js || _load_log4js()).getLogger)().info('Remote debug target is ready to attach', target);
    success = true;
  } else if (command === 'attach') {
    const port = Number(body.port);
    (0, (_log4js || _load_log4js()).getLogger)().info('Remote debug target attach request', body);
    const target = attachReady.get(port);
    if (target != null) {
      debugRequests.next({
        type,
        command,
        target
      });
      success = true;
    }
  }
  res.end(JSON.stringify({ success }));
}