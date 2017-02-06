'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeDebuggerService = exports.getAttachTargetInfoList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAttachTargetInfoList = exports.getAttachTargetInfoList = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    // Get processes list from ps utility.
    // -e: include all processes, does not require -ww argument since truncation of process names is
    //     done by the OS, not the ps utility
    const pidToName = new Map();
    const processes = yield (0, (_process || _load_process()).checkOutput)('ps', ['-e', '-o', 'pid,comm'], {});
    processes.stdout.toString().split('\n').slice(1).forEach(function (line) {
      const words = line.trim().split(' ');
      const pid = Number(words[0]);
      const command = words.slice(1).join(' ');
      const components = command.split('/');
      const name = components[components.length - 1];
      pidToName.set(pid, name);
    });
    // Get processes list from ps utility.
    // -e: include all processes
    // -ww: provides unlimited width for output and prevents the truncating of command names by ps.
    // -o pid,args: custom format the output to be two columns(pid and command name)
    const pidToCommand = new Map();
    const commands = yield (0, (_process || _load_process()).checkOutput)('ps', ['-eww', '-o', 'pid,args'], {});
    commands.stdout.toString().split('\n').slice(1).forEach(function (line) {
      const words = line.trim().split(' ');
      const pid = Number(words[0]);
      const command = words.slice(1).join(' ');
      pidToCommand.set(pid, command);
    });
    // Filter out processes that have died in between ps calls and zombiue processes.
    // Place pid, process, and command info into AttachTargetInfo objects and return in an array.
    return Array.from(pidToName.entries()).filter(function (arr) {
      const [pid, name] = arr;
      // Filter out current process and only return node processes.
      return pidToCommand.has(pid) && pid !== process.pid && name === 'node';
    }).map(function (arr) {
      const [pid, name] = arr;
      const commandName = pidToCommand.get(pid);

      if (!(commandName != null)) {
        throw new Error('Invariant violation: "commandName != null"');
      }

      return {
        pid,
        name,
        commandName
      };
    });
  });

  return function getAttachTargetInfoList() {
    return _ref.apply(this, arguments);
  };
})();

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

var _NodeDebuggerHost;

function _load_NodeDebuggerHost() {
  return _NodeDebuggerHost = require('./NodeDebuggerHost');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const { logInfo } = (_utils || _load_utils()).default; /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        */

class NodeDebuggerService {

  constructor() {
    this._clientCallback = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).ClientCallback();
    this._debuggerHost = new (_NodeDebuggerHost || _load_NodeDebuggerHost()).NodeDebuggerHost();
    this._webSocketClientToNode = null;
    this._subscriptions = new (_eventKit || _load_eventKit()).CompositeDisposable(this._clientCallback, this._debuggerHost);
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  sendCommand(message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const nodeWebSocket = _this._webSocketClientToNode;
      if (nodeWebSocket != null) {
        logInfo(`forward client message to node debugger: ${message}`);
        nodeWebSocket.send(message);
      } else {
        logInfo(`Nuclide sent message to node debugger after socket closed: ${message}`);
      }
    })();
  }

  attach(attachInfo) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Enable debugging in the process.
      process.kill(attachInfo.pid, 'SIGUSR1');
      const serverAddress = _this2._debuggerHost.start();
      const websocket = yield _this2._connectWithDebuggerHost(serverAddress);
      websocket.on('message', _this2._handleNodeDebuggerMessage.bind(_this2));
      websocket.on('close', _this2._handleNodeDebuggerClose.bind(_this2));
      _this2._webSocketClientToNode = websocket;
    })();
  }

  _connectWithDebuggerHost(serverAddress) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      logInfo(`Connecting debugger host with address: ${serverAddress}`);
      const ws = new (_ws || _load_ws()).default(serverAddress);
      _this3._subscriptions.add(new (_eventKit || _load_eventKit()).Disposable(function () {
        return ws.close();
      }));
      return new Promise(function (resolve, reject) {
        ws.on('open', function () {
          // Successfully connected with debugger host, fulfill the promise.
          resolve(ws);
        });
        ws.on('error', function (error) {
          return reject(error);
        });
      });
    })();
  }

  _handleNodeDebuggerMessage(message) {
    logInfo(`Node debugger message: ${message}`);
    this._clientCallback.sendChromeMessage(message);
  }

  _handleNodeDebuggerClose() {
    this.dispose();
  }

  dispose() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this4._subscriptions.dispose();
    })();
  }
}
exports.NodeDebuggerService = NodeDebuggerService;