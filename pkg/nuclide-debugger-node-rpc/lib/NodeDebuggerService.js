Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getAttachTargetInfoList = _asyncToGenerator(function* () {
  // Get processes list from ps utility.
  // -e: include all processes, does not require -ww argument since truncation of process names is
  //     done by the OS, not the ps utility

  var pidToName = new Map();
  var processes = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)('ps', ['-e', '-o', 'pid,comm'], {});
  processes.stdout.toString().split('\n').slice(1).forEach(function (line) {
    var words = line.trim().split(' ');
    var pid = Number(words[0]);
    var command = words.slice(1).join(' ');
    var components = command.split('/');
    var name = components[components.length - 1];
    pidToName.set(pid, name);
  });
  // Get processes list from ps utility.
  // -e: include all processes
  // -ww: provides unlimited width for output and prevents the truncating of command names by ps.
  // -o pid,args: custom format the output to be two columns(pid and command name)
  var pidToCommand = new Map();
  var commands = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).checkOutput)('ps', ['-eww', '-o', 'pid,args'], {});
  commands.stdout.toString().split('\n').slice(1).forEach(function (line) {
    var words = line.trim().split(' ');
    var pid = Number(words[0]);
    var command = words.slice(1).join(' ');
    pidToCommand.set(pid, command);
  });
  // Filter out processes that have died in between ps calls and zombiue processes.
  // Place pid, process, and command info into AttachTargetInfo objects and return in an array.
  return Array.from(pidToName.entries()).filter(function (arr) {
    var _arr = _slicedToArray(arr, 2);

    var pid = _arr[0];
    var name = _arr[1];

    // Filter out current process and only return node processes.
    return pidToCommand.has(pid) && pid !== process.pid && name === 'node';
  }).map(function (arr) {
    var _arr2 = _slicedToArray(arr, 2);

    var pid = _arr2[0];
    var name = _arr2[1];

    var commandName = pidToCommand.get(pid);
    (0, (_assert2 || _assert()).default)(commandName != null);
    return {
      pid: pid,
      name: name,
      commandName: commandName
    };
  });
});

exports.getAttachTargetInfoList = getAttachTargetInfoList;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var logInfo = (_utils2 || _utils()).default.logInfo;

var _nuclideDebuggerCommon2;

function _nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon2 = require('../../nuclide-debugger-common');
}

var _NodeDebuggerHost2;

function _NodeDebuggerHost() {
  return _NodeDebuggerHost2 = require('./NodeDebuggerHost');
}

var NodeDebuggerService = (function () {
  function NodeDebuggerService() {
    _classCallCheck(this, NodeDebuggerService);

    this._clientCallback = new (_nuclideDebuggerCommon2 || _nuclideDebuggerCommon()).ClientCallback();
    this._debuggerHost = new (_NodeDebuggerHost2 || _NodeDebuggerHost()).NodeDebuggerHost();
    this._webSocketClientToNode = null;
    this._subscriptions = new (_eventKit2 || _eventKit()).CompositeDisposable(this._clientCallback, this._debuggerHost);
  }

  _createClass(NodeDebuggerService, [{
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._clientCallback.getServerMessageObservable().publish();
    }
  }, {
    key: 'sendCommand',
    value: _asyncToGenerator(function* (message) {
      var nodeWebSocket = this._webSocketClientToNode;
      if (nodeWebSocket != null) {
        logInfo('forward client message to node debugger: ' + message);
        nodeWebSocket.send(message);
      } else {
        logInfo('Nuclide sent message to node debugger after socket closed: ' + message);
      }
    })
  }, {
    key: 'attach',
    value: _asyncToGenerator(function* (attachInfo) {
      // Enable debugging in the process.
      process.kill(attachInfo.pid, 'SIGUSR1');
      var serverAddress = this._debuggerHost.start();
      var websocket = yield this._connectWithDebuggerHost(serverAddress);
      websocket.on('message', this._handleNodeDebuggerMessage.bind(this));
      websocket.on('close', this._handleNodeDebuggerClose.bind(this));
      this._webSocketClientToNode = websocket;
    })
  }, {
    key: '_connectWithDebuggerHost',
    value: _asyncToGenerator(function* (serverAddress) {
      logInfo('Connecting debugger host with address: ' + serverAddress);
      var ws = new (_ws2 || _ws()).default(serverAddress);
      this._subscriptions.add(new (_eventKit2 || _eventKit()).Disposable(function () {
        return ws.terminate();
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
    })
  }, {
    key: '_handleNodeDebuggerMessage',
    value: function _handleNodeDebuggerMessage(message) {
      logInfo('Node debugger message: ' + message);
      this._clientCallback.sendChromeMessage(message);
    }
  }, {
    key: '_handleNodeDebuggerClose',
    value: function _handleNodeDebuggerClose() {
      this.dispose();
    }
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      this._subscriptions.dispose();
    })
  }]);

  return NodeDebuggerService;
})();

exports.NodeDebuggerService = NodeDebuggerService;
// -o pid,comm: custom format the output to be two columns(pid and process name)