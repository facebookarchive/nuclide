Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

    return pidToCommand.has(pid) && !(name.startsWith('(') && name.endsWith(')')) && (name.length < 9 || name.slice(-9) !== '<defunct>');
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

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _default = (_utils2 || _utils()).default;

var log = _default.log;
var logTrace = _default.logTrace;
var logError = _default.logError;
var logInfo = _default.logInfo;
var setLogLevel = _default.setLogLevel;

var _nuclideDebuggerCommonLibClientCallback2;

function _nuclideDebuggerCommonLibClientCallback() {
  return _nuclideDebuggerCommonLibClientCallback2 = require('../../nuclide-debugger-common/lib/ClientCallback');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var DebuggerConnection = (function () {
  function DebuggerConnection(clientCallback, lldbWebSocket, lldbProcess, subscriptions) {
    _classCallCheck(this, DebuggerConnection);

    this._clientCallback = clientCallback;
    this._lldbWebSocket = lldbWebSocket;
    this._lldbProcess = lldbProcess;
    this._subscriptions = subscriptions;
    lldbWebSocket.on('message', this._handleLLDBMessage.bind(this));
    lldbProcess.on('exit', this._handleLLDBExit.bind(this));
  }

  _createClass(DebuggerConnection, [{
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._clientCallback.getServerMessageObservable();
    }
  }, {
    key: '_handleLLDBMessage',
    value: function _handleLLDBMessage(message) {
      logTrace('lldb message: ' + message);
      this._clientCallback.sendChromeMessage(message);
    }
  }, {
    key: '_handleLLDBExit',
    value: function _handleLLDBExit() {
      // Fire and forget.
      this.dispose();
    }
  }, {
    key: 'sendCommand',
    value: _asyncToGenerator(function* (message) {
      var lldbWebSocket = this._lldbWebSocket;
      if (lldbWebSocket) {
        logTrace('forward client message to lldb: ' + message);
        lldbWebSocket.send(message);
      } else {
        logError('Why is not lldb socket available?');
      }
    })
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      log('DebuggerConnection disposed');
      this._subscriptions.dispose();
    })
  }]);

  return DebuggerConnection;
})();

exports.DebuggerConnection = DebuggerConnection;

var DebuggerRpcService = (function () {
  function DebuggerRpcService(config) {
    var _this = this;

    _classCallCheck(this, DebuggerRpcService);

    this._clientCallback = new (_nuclideDebuggerCommonLibClientCallback2 || _nuclideDebuggerCommonLibClientCallback()).ClientCallback();
    this._config = config;
    setLogLevel(config.logLevel);
    this._subscriptions = new (_eventKit2 || _eventKit()).CompositeDisposable(new (_eventKit2 || _eventKit()).Disposable(function () {
      return _this._clientCallback.dispose();
    }));
  }

  _createClass(DebuggerRpcService, [{
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      return this._clientCallback.getOutputWindowObservable();
    }
  }, {
    key: 'attach',
    value: _asyncToGenerator(function* (attachInfo) {
      log('attach process: ' + JSON.stringify(attachInfo));
      var inferiorArguments = {
        pid: String(attachInfo.pid),
        basepath: attachInfo.basepath ? attachInfo.basepath : this._config.buckConfigRootFile
      };
      return yield this._startDebugging(inferiorArguments);
    })
  }, {
    key: 'launch',
    value: _asyncToGenerator(function* (launchInfo) {
      log('launch process: ' + JSON.stringify(launchInfo));
      var inferiorArguments = {
        executable_path: launchInfo.executablePath,
        launch_arguments: launchInfo.arguments,
        working_directory: launchInfo.workingDirectory,
        basepath: launchInfo.basepath ? launchInfo.basepath : this._config.buckConfigRootFile
      };
      return yield this._startDebugging(inferiorArguments);
    })
  }, {
    key: '_startDebugging',
    value: _asyncToGenerator(function* (inferiorArguments) {
      var lldbProcess = this._spawnPythonBackend();
      this._registerIpcChannel(lldbProcess);
      this._sendArgumentsToPythonBackend(lldbProcess, inferiorArguments);
      var lldbWebSocket = yield this._connectWithLLDB(lldbProcess);
      this._subscriptions.add(new (_eventKit2 || _eventKit()).Disposable(function () {
        return lldbWebSocket.terminate();
      }));
      return new DebuggerConnection(this._clientCallback, lldbWebSocket, lldbProcess, this._subscriptions);
    })
  }, {
    key: '_registerIpcChannel',
    value: function _registerIpcChannel(lldbProcess) {
      var IPC_CHANNEL_FD = 4;
      /* $FlowFixMe - update Flow defs for ChildProcess */
      var ipcStream = lldbProcess.stdio[IPC_CHANNEL_FD];
      this._subscriptions.add(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((0, (_commonsNodeStream2 || _commonsNodeStream()).splitStream)((0, (_commonsNodeStream2 || _commonsNodeStream()).observeStream)(ipcStream)).subscribe(this._handleIpcMessage.bind(this, ipcStream), function (error) {
        return logError('ipcStream error: ' + JSON.stringify(error));
      })));
    }
  }, {
    key: '_handleIpcMessage',
    value: function _handleIpcMessage(ipcStream, message) {
      logTrace('ipc message: ' + message);
      var messageJson = JSON.parse(message);
      if (messageJson.type === 'Nuclide.userOutput') {
        // Write response message to ipc for sync message.
        if (messageJson.isSync) {
          ipcStream.write(JSON.stringify({
            message_id: messageJson.id
          }) + '\n');
        }
        this._clientCallback.sendUserOutputMessage(JSON.stringify(messageJson.message));
      } else {
        logError('Unknown message: ' + message);
      }
    }
  }, {
    key: '_spawnPythonBackend',
    value: function _spawnPythonBackend() {
      var lldbPythonScriptPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../scripts/main.py');
      var python_args = [lldbPythonScriptPath, '--arguments_in_json'];
      var options = {
        cwd: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(lldbPythonScriptPath),
        // FD[3] is used for sending arguments JSON blob.
        // FD[4] is used as a ipc channel for output/atom notifications.
        stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
        detached: false };
      // When Atom is killed, clang_server.py should be killed, too.
      logInfo('spawn child_process: ' + JSON.stringify(python_args));
      var lldbProcess = (_child_process2 || _child_process()).default.spawn(this._config.pythonBinaryPath, python_args, options);
      this._subscriptions.add(new (_eventKit2 || _eventKit()).Disposable(function () {
        return lldbProcess.kill();
      }));
      return lldbProcess;
    }
  }, {
    key: '_sendArgumentsToPythonBackend',
    value: function _sendArgumentsToPythonBackend(child, args) {
      var ARGUMENT_INPUT_FD = 3;
      /* $FlowFixMe - update Flow defs for ChildProcess */
      var argumentsStream = child.stdio[ARGUMENT_INPUT_FD];
      // Make sure the bidirectional communication channel is set up before
      // sending data.
      argumentsStream.write('init\n');
      this._subscriptions.add(new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((0, (_commonsNodeStream2 || _commonsNodeStream()).observeStream)(argumentsStream).first().subscribe(function (text) {
        if (text.startsWith('ready')) {
          var args_in_json = JSON.stringify(args);
          logInfo('Sending ' + args_in_json + ' to child_process');
          argumentsStream.write(args_in_json + '\n');
        } else {
          logError('Get unknown initial data: ' + text + '.');
          child.kill();
        }
      }, function (error) {
        return logError('argumentsStream error: ' + JSON.stringify(error));
      })));
    }
  }, {
    key: '_connectWithLLDB',
    value: function _connectWithLLDB(lldbProcess) {
      var _this2 = this;

      log('connecting with lldb');
      return new Promise(function (resolve, reject) {
        // Async handle parsing websocket address from the stdout of the child.
        lldbProcess.stdout.on('data', function (chunk) {
          // stdout should hopefully be set to line-buffering, in which case the

          var block = chunk.toString();
          log('child process(' + lldbProcess.pid + ') stdout: ' + block);
          var result = /Port: (\d+)\n/.exec(block);
          if (result != null) {
            (function () {
              // $FlowIssue - flow has wrong typing for it(t9649946).
              lldbProcess.stdout.removeAllListeners(['data', 'error', 'exit']);
              // TODO[jeffreytan]: explicitly use ipv4 address 127.0.0.1 for now.
              // Investigate if we can use localhost and match protocol version between client/server.
              var lldbWebSocketAddress = 'ws://127.0.0.1:' + result[1] + '/';
              log('Connecting lldb with address: ' + lldbWebSocketAddress);
              var ws = new (_ws2 || _ws()).default(lldbWebSocketAddress);
              ws.on('open', function () {
                // Successfully connected with lldb python process, fulfill the promise.
                resolve(ws);
              });
            })();
          }
        });
        lldbProcess.stderr.on('data', function (chunk) {
          var errorMessage = chunk.toString();
          _this2._clientCallback.sendUserOutputMessage(JSON.stringify({
            level: 'error',
            text: errorMessage
          }));
          logError('child process(' + lldbProcess.pid + ') stderr: ' + errorMessage);
        });
        lldbProcess.on('error', function () {
          reject('lldb process error');
        });
        lldbProcess.on('exit', function () {
          reject('lldb process exit');
        });
      });
    }
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      logInfo('DebuggerRpcService disposed');
    })
  }]);

  return DebuggerRpcService;
})();

exports.DebuggerRpcService = DebuggerRpcService;
// -o pid,comm: custom format the output to be two columns(pid and process name)
// string would come on one line.