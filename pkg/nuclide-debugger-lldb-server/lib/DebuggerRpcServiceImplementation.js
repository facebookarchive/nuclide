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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getAttachTargetInfoList = _asyncToGenerator(function* () {
  var _require = require('../../nuclide-commons');

  var asyncExecute = _require.asyncExecute;

  // Get processes list from ps utility.
  // -e: include all processes
  // -o pid,comm: custom format the output to be two columns(pid and command name)
  var result = yield asyncExecute('ps', ['-e', '-o', 'pid,comm'], {});
  return result.stdout.toString().split('\n').slice(1).map(function (line) {
    var words = line.trim().split(' ');
    var pid = Number(words[0]);
    var command = words.slice(1).join(' ');
    var components = command.split('/');
    var name = components[components.length - 1];
    return {
      pid: pid,
      name: name
    };
  }).filter(function (item) {
    return !item.name.startsWith('(') || !item.name.endsWith(')');
  });
});

exports.getAttachTargetInfoList = getAttachTargetInfoList;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _eventKit = require('event-kit');

var _rx = require('rx');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

var _nuclideDebuggerCommonLibClientCallback = require('../../nuclide-debugger-common/lib/ClientCallback');

var _nuclideCommons = require('../../nuclide-commons');

var log = _utils2['default'].log;
var logTrace = _utils2['default'].logTrace;
var logError = _utils2['default'].logError;
var logInfo = _utils2['default'].logInfo;
var setLogLevel = _utils2['default'].setLogLevel;

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
  function DebuggerRpcService() {
    var _this = this;

    _classCallCheck(this, DebuggerRpcService);

    this._clientCallback = new _nuclideDebuggerCommonLibClientCallback.ClientCallback();
    this._subscriptions = new _eventKit.CompositeDisposable(new _eventKit.Disposable(function () {
      return _this._clientCallback.dispose();
    }));
  }

  _createClass(DebuggerRpcService, [{
    key: 'setSettings',
    value: function setSettings(settings) {
      setLogLevel(settings.logLevel);
      return Promise.resolve();
    }
  }, {
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
        basepath: attachInfo.basepath ? attachInfo.basepath : '.'
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
        basepath: launchInfo.basepath ? launchInfo.basepath : '.'
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
      this._subscriptions.add(new _eventKit.Disposable(function () {
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
      this._subscriptions.add((0, _nuclideCommons.splitStream)((0, _nuclideCommons.observeStream)(ipcStream)).subscribe(this._handleIpcMessage.bind(this, ipcStream), function (error) {
        return logError('ipcStream error: ' + JSON.stringify(error));
      }));
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
      var lldbPythonScriptPath = _path2['default'].join(__dirname, '../scripts/main.py');
      var python_args = [lldbPythonScriptPath, '--arguments_in_json'];
      var options = {
        cwd: _path2['default'].dirname(lldbPythonScriptPath),
        // FD[3] is used for sending arguments JSON blob.
        // FD[4] is used as a ipc channel for output/atom notifications.
        stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
        detached: false };
      // When Atom is killed, clang_server.py should be killed, too.
      logInfo('spawn child_process: ' + JSON.stringify(python_args));
      var lldbProcess = _child_process2['default'].spawn('python', python_args, options);
      this._subscriptions.add(new _eventKit.Disposable(function () {
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
      this._subscriptions.add((0, _nuclideCommons.observeStream)(argumentsStream).first().subscribe(function (text) {
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
      }));
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
              var ws = new _ws2['default'](lldbWebSocketAddress);
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
// string would come on one line.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUnBjU2VydmljZUltcGxlbWVudGF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0lBeUNzQix1QkFBdUIscUJBQXRDLGFBQTJFO2lCQUN6RCxPQUFPLENBQUMsdUJBQXVCLENBQUM7O01BQWhELFlBQVksWUFBWixZQUFZOzs7OztBQUluQixNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLFNBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMvRCxRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLFFBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixRQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QyxRQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFFBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFdBQU87QUFDTCxTQUFHLEVBQUgsR0FBRztBQUNILFVBQUksRUFBSixJQUFJO0tBQ0wsQ0FBQztHQUNILENBQUMsQ0FDRCxNQUFNLENBQUMsVUFBQSxJQUFJO1dBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztHQUFBLENBQUMsQ0FBQztDQUN6RTs7Ozs7Ozs7Ozt3QkExQzZDLFdBQVc7O2tCQUNoQyxJQUFJOzs2QkFDSCxlQUFlOzs7O29CQUN4QixNQUFNOzs7O3FCQUNMLFNBQVM7Ozs7a0JBQ0wsSUFBSTs7OztzREFFRyxrREFBa0Q7OzhCQUN0Qyx1QkFBdUI7O0lBRnpELEdBQUcsc0JBQUgsR0FBRztJQUFFLFFBQVEsc0JBQVIsUUFBUTtJQUFFLFFBQVEsc0JBQVIsUUFBUTtJQUFFLE9BQU8sc0JBQVAsT0FBTztJQUFFLFdBQVcsc0JBQVgsV0FBVzs7SUFzQ3ZDLGtCQUFrQjtBQU1sQixXQU5BLGtCQUFrQixDQU8zQixjQUE4QixFQUM5QixhQUF3QixFQUN4QixXQUF1QyxFQUN2QyxhQUFrQyxFQUNsQzswQkFYUyxrQkFBa0I7O0FBWTNCLFFBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQ3RDLFFBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0FBQ3BDLFFBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0FBQ2hDLFFBQUksQ0FBQyxjQUFjLEdBQUcsYUFBYSxDQUFDO0FBQ3BDLGlCQUFhLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDaEUsZUFBVyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN6RDs7ZUFsQlUsa0JBQWtCOztXQW9CSCxzQ0FBdUI7QUFDL0MsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLDBCQUEwQixFQUFFLENBQUM7S0FDMUQ7OztXQUVpQiw0QkFBQyxPQUFlLEVBQVE7QUFDeEMsY0FBUSxvQkFBa0IsT0FBTyxDQUFHLENBQUM7QUFDckMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNqRDs7O1dBRWMsMkJBQVM7O0FBRXRCLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7OzZCQUVnQixXQUFDLE9BQWUsRUFBaUI7QUFDaEQsVUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztBQUMxQyxVQUFJLGFBQWEsRUFBRTtBQUNqQixnQkFBUSxzQ0FBb0MsT0FBTyxDQUFHLENBQUM7QUFDdkQscUJBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7T0FDN0IsTUFBTTtBQUNMLGdCQUFRLHFDQUFxQyxDQUFDO09BQy9DO0tBQ0Y7Ozs2QkFFWSxhQUFrQjtBQUM3QixTQUFHLCtCQUErQixDQUFDO0FBQ25DLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQS9DVSxrQkFBa0I7Ozs7O0lBa0RsQixrQkFBa0I7QUFJbEIsV0FKQSxrQkFBa0IsR0FJZjs7OzBCQUpILGtCQUFrQjs7QUFLM0IsUUFBSSxDQUFDLGVBQWUsR0FBRyw0REFBb0IsQ0FBQztBQUM1QyxRQUFJLENBQUMsY0FBYyxHQUFHLGtDQUNwQix5QkFBZTthQUFNLE1BQUssZUFBZSxDQUFDLE9BQU8sRUFBRTtLQUFBLENBQUMsQ0FDckQsQ0FBQztHQUNIOztlQVRVLGtCQUFrQjs7V0FXbEIscUJBQUMsUUFBMEIsRUFBaUI7QUFDckQsaUJBQVcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDL0IsYUFBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDMUI7OztXQUV3QixxQ0FBdUI7QUFDOUMsYUFBTyxJQUFJLENBQUMsZUFBZSxDQUFDLHlCQUF5QixFQUFFLENBQUM7S0FDekQ7Ozs2QkFFVyxXQUFDLFVBQTRCLEVBQStCO0FBQ3RFLFNBQUcsc0JBQW9CLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUcsQ0FBQzs7QUFFckQsVUFBTSxpQkFBaUIsR0FBRztBQUN4QixXQUFHLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUM7QUFDM0IsZ0JBQVEsRUFBRSxVQUFVLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxRQUFRLEdBQUcsR0FBRztPQUMxRCxDQUFDO0FBQ0YsYUFBTyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQztLQUN0RDs7OzZCQUVXLFdBQUMsVUFBNEIsRUFBK0I7QUFDdEUsU0FBRyxzQkFBb0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBRyxDQUFDO0FBQ3JELFVBQU0saUJBQWlCLEdBQUc7QUFDeEIsdUJBQWUsRUFBRSxVQUFVLENBQUMsY0FBYztBQUMxQyx3QkFBZ0IsRUFBRSxVQUFVLENBQUMsU0FBUztBQUN0Qyx5QkFBaUIsRUFBRSxVQUFVLENBQUMsZ0JBQWdCO0FBQzlDLGdCQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxHQUFHLEdBQUc7T0FDMUQsQ0FBQztBQUNGLGFBQU8sTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDdEQ7Ozs2QkFFb0IsV0FDbkIsaUJBQXVDLEVBQ1Y7QUFDN0IsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDL0MsVUFBSSxDQUFDLG1CQUFtQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3RDLFVBQUksQ0FBQyw2QkFBNkIsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztBQUNuRSxVQUFNLGFBQWEsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUMvRCxVQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyx5QkFBZTtlQUFNLGFBQWEsQ0FBQyxTQUFTLEVBQUU7T0FBQSxDQUFDLENBQUMsQ0FBQztBQUN6RSxhQUFPLElBQUksa0JBQWtCLENBQzNCLElBQUksQ0FBQyxlQUFlLEVBQ3BCLGFBQWEsRUFDYixXQUFXLEVBQ1gsSUFBSSxDQUFDLGNBQWMsQ0FDcEIsQ0FBQztLQUNIOzs7V0FFa0IsNkJBQUMsV0FBdUMsRUFBUTtBQUNqRSxVQUFNLGNBQWMsR0FBRyxDQUFDLENBQUM7O0FBRXpCLFVBQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDcEQsVUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsaUNBQVksbUNBQWMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQ3JFLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUM1QyxVQUFBLEtBQUs7ZUFBSSxRQUFRLHVCQUFxQixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFHO09BQUEsQ0FDL0QsQ0FBQyxDQUFDO0tBQ0o7OztXQUVnQiwyQkFBQyxTQUFpQixFQUFFLE9BQWUsRUFBUTtBQUMxRCxjQUFRLG1CQUFpQixPQUFPLENBQUcsQ0FBQztBQUNwQyxVQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hDLFVBQUksV0FBVyxDQUFDLElBQUksS0FBSyxvQkFBb0IsRUFBRTs7QUFFN0MsWUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQ3RCLG1CQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDN0Isc0JBQVUsRUFBRSxXQUFXLENBQUMsRUFBRTtXQUMzQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDWjtBQUNELFlBQUksQ0FBQyxlQUFlLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUNqRixNQUFNO0FBQ0wsZ0JBQVEsdUJBQXFCLE9BQU8sQ0FBRyxDQUFDO09BQ3pDO0tBQ0Y7OztXQUVrQiwrQkFBK0I7QUFDaEQsVUFBTSxvQkFBb0IsR0FBRyxrQkFBSyxJQUFJLENBQUMsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7QUFDeEUsVUFBTSxXQUFXLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxxQkFBcUIsQ0FBQyxDQUFDO0FBQ2xFLFVBQU0sT0FBTyxHQUFHO0FBQ2QsV0FBRyxFQUFFLGtCQUFLLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQzs7O0FBR3ZDLGFBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7QUFDL0MsZ0JBQVEsRUFBRSxLQUFLLEVBQ2hCLENBQUM7O0FBQ0YsYUFBTywyQkFBeUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBRyxDQUFDO0FBQy9ELFVBQU0sV0FBVyxHQUFHLDJCQUFjLEtBQUssQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3hFLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLHlCQUFlO2VBQU0sV0FBVyxDQUFDLElBQUksRUFBRTtPQUFBLENBQUMsQ0FBQyxDQUFDO0FBQ2xFLGFBQU8sV0FBVyxDQUFDO0tBQ3BCOzs7V0FFNEIsdUNBQzNCLEtBQWlDLEVBQ2pDLElBQTBCLEVBQ3BCO0FBQ04sVUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7O0FBRTVCLFVBQU0sZUFBZSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7O0FBR3ZELHFCQUFlLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLG1DQUFjLGVBQWUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFNBQVMsQ0FDdEUsVUFBQSxJQUFJLEVBQUk7QUFDTixZQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDNUIsY0FBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQyxpQkFBTyxjQUFZLFlBQVksdUJBQW9CLENBQUM7QUFDcEQseUJBQWUsQ0FBQyxLQUFLLENBQUksWUFBWSxRQUFLLENBQUM7U0FDNUMsTUFBTTtBQUNMLGtCQUFRLGdDQUE4QixJQUFJLE9BQUksQ0FBQztBQUMvQyxlQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZDtPQUNGLEVBQ0QsVUFBQSxLQUFLO2VBQUksUUFBUSw2QkFBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBRztPQUFBLENBQ3JFLENBQUMsQ0FBQztLQUNKOzs7V0FFZSwwQkFBQyxXQUF1QyxFQUFzQjs7O0FBQzVFLFNBQUcsd0JBQXdCLENBQUM7QUFDNUIsYUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7O0FBRXRDLG1CQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxLQUFLLEVBQUk7OztBQUdyQyxjQUFNLEtBQWEsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDdkMsYUFBRyxvQkFBa0IsV0FBVyxDQUFDLEdBQUcsa0JBQWEsS0FBSyxDQUFHLENBQUM7QUFDMUQsY0FBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUMzQyxjQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7OztBQUVsQix5QkFBVyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQzs7O0FBR2pFLGtCQUFNLG9CQUFvQix1QkFBcUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFHLENBQUM7QUFDNUQsaUJBQUcsb0NBQWtDLG9CQUFvQixDQUFHLENBQUM7QUFDN0Qsa0JBQU0sRUFBRSxHQUFHLG9CQUFjLG9CQUFvQixDQUFDLENBQUM7QUFDL0MsZ0JBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQU07O0FBRWxCLHVCQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7ZUFDYixDQUFDLENBQUM7O1dBQ0o7U0FDRixDQUFDLENBQUM7QUFDSCxtQkFBVyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQ3JDLGNBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUN0QyxpQkFBSyxlQUFlLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUN4RCxpQkFBSyxFQUFFLE9BQU87QUFDZCxnQkFBSSxFQUFFLFlBQVk7V0FDbkIsQ0FBQyxDQUFDLENBQUM7QUFDSixrQkFBUSxvQkFBa0IsV0FBVyxDQUFDLEdBQUcsa0JBQWEsWUFBWSxDQUFHLENBQUM7U0FDdkUsQ0FBQyxDQUFDO0FBQ0gsbUJBQVcsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDNUIsZ0JBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQzlCLENBQUMsQ0FBQztBQUNILG1CQUFXLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQzNCLGdCQUFNLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUM3QixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7OzZCQUVZLGFBQWtCO0FBQzdCLGFBQU8sK0JBQStCLENBQUM7S0FDeEM7OztTQXZLVSxrQkFBa0IiLCJmaWxlIjoiRGVidWdnZXJScGNTZXJ2aWNlSW1wbGVtZW50YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEF0dGFjaFRhcmdldEluZm8sXG4gIExhdW5jaFRhcmdldEluZm8sXG4gIERlYnVnZ2VyU2V0dGluZ3MsXG59IGZyb20gJy4vRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IFdlYlNvY2tldCBmcm9tICd3cyc7XG5jb25zdCB7bG9nLCBsb2dUcmFjZSwgbG9nRXJyb3IsIGxvZ0luZm8sIHNldExvZ0xldmVsfSA9IHV0aWxzO1xuaW1wb3J0IHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1jb21tb24vbGliL0NsaWVudENhbGxiYWNrJztcbmltcG9ydCB7b2JzZXJ2ZVN0cmVhbSwgc3BsaXRTdHJlYW19IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbnR5cGUgQXR0YWNoSW5mb0FyZ3NUeXBlID0ge1xuICBwaWQ6IHN0cmluZztcbiAgYmFzZXBhdGg6IHN0cmluZztcbn07XG5cbnR5cGUgTGF1bmNoSW5mb0FyZ3NUeXBlID0ge1xuICBleGVjdXRhYmxlX3BhdGg6IHN0cmluZztcbiAgbGF1bmNoX2FyZ3VtZW50czogc3RyaW5nO1xuICB3b3JraW5nX2RpcmVjdG9yeTogc3RyaW5nO1xuICBiYXNlcGF0aDogc3RyaW5nO1xufTtcblxudHlwZSBMYXVuY2hBdHRhY2hBcmdzVHlwZSA9IEF0dGFjaEluZm9BcmdzVHlwZSB8IExhdW5jaEluZm9BcmdzVHlwZTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEF0dGFjaFRhcmdldEluZm9MaXN0KCk6IFByb21pc2U8QXJyYXk8QXR0YWNoVGFyZ2V0SW5mbz4+IHtcbiAgY29uc3Qge2FzeW5jRXhlY3V0ZX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbiAgLy8gR2V0IHByb2Nlc3NlcyBsaXN0IGZyb20gcHMgdXRpbGl0eS5cbiAgLy8gLWU6IGluY2x1ZGUgYWxsIHByb2Nlc3Nlc1xuICAvLyAtbyBwaWQsY29tbTogY3VzdG9tIGZvcm1hdCB0aGUgb3V0cHV0IHRvIGJlIHR3byBjb2x1bW5zKHBpZCBhbmQgY29tbWFuZCBuYW1lKVxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBhc3luY0V4ZWN1dGUoJ3BzJywgWyctZScsICctbycsICdwaWQsY29tbSddLCB7fSk7XG4gIHJldHVybiByZXN1bHQuc3Rkb3V0LnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpLnNsaWNlKDEpLm1hcChsaW5lID0+IHtcbiAgICBjb25zdCB3b3JkcyA9IGxpbmUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgY29uc3QgcGlkID0gTnVtYmVyKHdvcmRzWzBdKTtcbiAgICBjb25zdCBjb21tYW5kID0gd29yZHMuc2xpY2UoMSkuam9pbignICcpO1xuICAgIGNvbnN0IGNvbXBvbmVudHMgPSBjb21tYW5kLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgbmFtZSA9IGNvbXBvbmVudHNbY29tcG9uZW50cy5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4ge1xuICAgICAgcGlkLFxuICAgICAgbmFtZSxcbiAgICB9O1xuICB9KVxuICAuZmlsdGVyKGl0ZW0gPT4gIWl0ZW0ubmFtZS5zdGFydHNXaXRoKCcoJykgfHwgIWl0ZW0ubmFtZS5lbmRzV2l0aCgnKScpKTtcbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyQ29ubmVjdGlvbiB7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9sbGRiV2ViU29ja2V0OiBXZWJTb2NrZXQ7XG4gIF9sbGRiUHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjayxcbiAgICBsbGRiV2ViU29ja2V0OiBXZWJTb2NrZXQsXG4gICAgbGxkYlByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLFxuICAgIHN1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGUsXG4gICkge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrID0gY2xpZW50Q2FsbGJhY2s7XG4gICAgdGhpcy5fbGxkYldlYlNvY2tldCA9IGxsZGJXZWJTb2NrZXQ7XG4gICAgdGhpcy5fbGxkYlByb2Nlc3MgPSBsbGRiUHJvY2VzcztcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gc3Vic2NyaXB0aW9ucztcbiAgICBsbGRiV2ViU29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5faGFuZGxlTExEQk1lc3NhZ2UuYmluZCh0aGlzKSk7XG4gICAgbGxkYlByb2Nlc3Mub24oJ2V4aXQnLCB0aGlzLl9oYW5kbGVMTERCRXhpdC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2NsaWVudENhbGxiYWNrLmdldFNlcnZlck1lc3NhZ2VPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBfaGFuZGxlTExEQk1lc3NhZ2UobWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nVHJhY2UoYGxsZGIgbWVzc2FnZTogJHttZXNzYWdlfWApO1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRDaHJvbWVNZXNzYWdlKG1lc3NhZ2UpO1xuICB9XG5cbiAgX2hhbmRsZUxMREJFeGl0KCk6IHZvaWQge1xuICAgIC8vIEZpcmUgYW5kIGZvcmdldC5cbiAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIGFzeW5jIHNlbmRDb21tYW5kKG1lc3NhZ2U6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxsZGJXZWJTb2NrZXQgPSB0aGlzLl9sbGRiV2ViU29ja2V0O1xuICAgIGlmIChsbGRiV2ViU29ja2V0KSB7XG4gICAgICBsb2dUcmFjZShgZm9yd2FyZCBjbGllbnQgbWVzc2FnZSB0byBsbGRiOiAke21lc3NhZ2V9YCk7XG4gICAgICBsbGRiV2ViU29ja2V0LnNlbmQobWVzc2FnZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZ0Vycm9yKGBXaHkgaXMgbm90IGxsZGIgc29ja2V0IGF2YWlsYWJsZT9gKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZyhgRGVidWdnZXJDb25uZWN0aW9uIGRpc3Bvc2VkYCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnZ2VyUnBjU2VydmljZSB7XG4gIF9jbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2s7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrID0gbmV3IENsaWVudENhbGxiYWNrKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fY2xpZW50Q2FsbGJhY2suZGlzcG9zZSgpKSxcbiAgICApO1xuICB9XG5cbiAgc2V0U2V0dGluZ3Moc2V0dGluZ3M6IERlYnVnZ2VyU2V0dGluZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBzZXRMb2dMZXZlbChzZXR0aW5ncy5sb2dMZXZlbCk7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG5cbiAgZ2V0T3V0cHV0V2luZG93T2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnRDYWxsYmFjay5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBhc3luYyBhdHRhY2goYXR0YWNoSW5mbzogQXR0YWNoVGFyZ2V0SW5mbyk6IFByb21pc2U8RGVidWdnZXJDb25uZWN0aW9uPiB7XG4gICAgbG9nKGBhdHRhY2ggcHJvY2VzczogJHtKU09OLnN0cmluZ2lmeShhdHRhY2hJbmZvKX1gKTtcblxuICAgIGNvbnN0IGluZmVyaW9yQXJndW1lbnRzID0ge1xuICAgICAgcGlkOiBTdHJpbmcoYXR0YWNoSW5mby5waWQpLFxuICAgICAgYmFzZXBhdGg6IGF0dGFjaEluZm8uYmFzZXBhdGggPyBhdHRhY2hJbmZvLmJhc2VwYXRoIDogJy4nLFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3N0YXJ0RGVidWdnaW5nKGluZmVyaW9yQXJndW1lbnRzKTtcbiAgfVxuXG4gIGFzeW5jIGxhdW5jaChsYXVuY2hJbmZvOiBMYXVuY2hUYXJnZXRJbmZvKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICBsb2coYGxhdW5jaCBwcm9jZXNzOiAke0pTT04uc3RyaW5naWZ5KGxhdW5jaEluZm8pfWApO1xuICAgIGNvbnN0IGluZmVyaW9yQXJndW1lbnRzID0ge1xuICAgICAgZXhlY3V0YWJsZV9wYXRoOiBsYXVuY2hJbmZvLmV4ZWN1dGFibGVQYXRoLFxuICAgICAgbGF1bmNoX2FyZ3VtZW50czogbGF1bmNoSW5mby5hcmd1bWVudHMsXG4gICAgICB3b3JraW5nX2RpcmVjdG9yeTogbGF1bmNoSW5mby53b3JraW5nRGlyZWN0b3J5LFxuICAgICAgYmFzZXBhdGg6IGxhdW5jaEluZm8uYmFzZXBhdGggPyBsYXVuY2hJbmZvLmJhc2VwYXRoIDogJy4nLFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3N0YXJ0RGVidWdnaW5nKGluZmVyaW9yQXJndW1lbnRzKTtcbiAgfVxuXG4gIGFzeW5jIF9zdGFydERlYnVnZ2luZyhcbiAgICBpbmZlcmlvckFyZ3VtZW50czogTGF1bmNoQXR0YWNoQXJnc1R5cGVcbiAgKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBsbGRiUHJvY2VzcyA9IHRoaXMuX3NwYXduUHl0aG9uQmFja2VuZCgpO1xuICAgIHRoaXMuX3JlZ2lzdGVySXBjQ2hhbm5lbChsbGRiUHJvY2Vzcyk7XG4gICAgdGhpcy5fc2VuZEFyZ3VtZW50c1RvUHl0aG9uQmFja2VuZChsbGRiUHJvY2VzcywgaW5mZXJpb3JBcmd1bWVudHMpO1xuICAgIGNvbnN0IGxsZGJXZWJTb2NrZXQgPSBhd2FpdCB0aGlzLl9jb25uZWN0V2l0aExMREIobGxkYlByb2Nlc3MpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IGxsZGJXZWJTb2NrZXQudGVybWluYXRlKCkpKTtcbiAgICByZXR1cm4gbmV3IERlYnVnZ2VyQ29ubmVjdGlvbihcbiAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLFxuICAgICAgbGxkYldlYlNvY2tldCxcbiAgICAgIGxsZGJQcm9jZXNzLFxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyxcbiAgICApO1xuICB9XG5cbiAgX3JlZ2lzdGVySXBjQ2hhbm5lbChsbGRiUHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MpOiB2b2lkIHtcbiAgICBjb25zdCBJUENfQ0hBTk5FTF9GRCA9IDQ7XG4gICAgLyogJEZsb3dGaXhNZSAtIHVwZGF0ZSBGbG93IGRlZnMgZm9yIENoaWxkUHJvY2VzcyAqL1xuICAgIGNvbnN0IGlwY1N0cmVhbSA9IGxsZGJQcm9jZXNzLnN0ZGlvW0lQQ19DSEFOTkVMX0ZEXTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChzcGxpdFN0cmVhbShvYnNlcnZlU3RyZWFtKGlwY1N0cmVhbSkpLnN1YnNjcmliZShcbiAgICAgIHRoaXMuX2hhbmRsZUlwY01lc3NhZ2UuYmluZCh0aGlzLCBpcGNTdHJlYW0pLFxuICAgICAgZXJyb3IgPT4gbG9nRXJyb3IoYGlwY1N0cmVhbSBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlcnJvcil9YCksXG4gICAgKSk7XG4gIH1cblxuICBfaGFuZGxlSXBjTWVzc2FnZShpcGNTdHJlYW06IE9iamVjdCwgbWVzc2FnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nVHJhY2UoYGlwYyBtZXNzYWdlOiAke21lc3NhZ2V9YCk7XG4gICAgY29uc3QgbWVzc2FnZUpzb24gPSBKU09OLnBhcnNlKG1lc3NhZ2UpO1xuICAgIGlmIChtZXNzYWdlSnNvbi50eXBlID09PSAnTnVjbGlkZS51c2VyT3V0cHV0Jykge1xuICAgICAgLy8gV3JpdGUgcmVzcG9uc2UgbWVzc2FnZSB0byBpcGMgZm9yIHN5bmMgbWVzc2FnZS5cbiAgICAgIGlmIChtZXNzYWdlSnNvbi5pc1N5bmMpIHtcbiAgICAgICAgaXBjU3RyZWFtLndyaXRlKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBtZXNzYWdlX2lkOiBtZXNzYWdlSnNvbi5pZCxcbiAgICAgICAgfSkgKyAnXFxuJyk7XG4gICAgICB9XG4gICAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck91dHB1dE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkobWVzc2FnZUpzb24ubWVzc2FnZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dFcnJvcihgVW5rbm93biBtZXNzYWdlOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgX3NwYXduUHl0aG9uQmFja2VuZCgpOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyB7XG4gICAgY29uc3QgbGxkYlB5dGhvblNjcmlwdFBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vc2NyaXB0cy9tYWluLnB5Jyk7XG4gICAgY29uc3QgcHl0aG9uX2FyZ3MgPSBbbGxkYlB5dGhvblNjcmlwdFBhdGgsICctLWFyZ3VtZW50c19pbl9qc29uJ107XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogcGF0aC5kaXJuYW1lKGxsZGJQeXRob25TY3JpcHRQYXRoKSxcbiAgICAgIC8vIEZEWzNdIGlzIHVzZWQgZm9yIHNlbmRpbmcgYXJndW1lbnRzIEpTT04gYmxvYi5cbiAgICAgIC8vIEZEWzRdIGlzIHVzZWQgYXMgYSBpcGMgY2hhbm5lbCBmb3Igb3V0cHV0L2F0b20gbm90aWZpY2F0aW9ucy5cbiAgICAgIHN0ZGlvOiBbJ3BpcGUnLCAncGlwZScsICdwaXBlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgZGV0YWNoZWQ6IGZhbHNlLCAvLyBXaGVuIEF0b20gaXMga2lsbGVkLCBjbGFuZ19zZXJ2ZXIucHkgc2hvdWxkIGJlIGtpbGxlZCwgdG9vLlxuICAgIH07XG4gICAgbG9nSW5mbyhgc3Bhd24gY2hpbGRfcHJvY2VzczogJHtKU09OLnN0cmluZ2lmeShweXRob25fYXJncyl9YCk7XG4gICAgY29uc3QgbGxkYlByb2Nlc3MgPSBjaGlsZF9wcm9jZXNzLnNwYXduKCdweXRob24nLCBweXRob25fYXJncywgb3B0aW9ucyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4gbGxkYlByb2Nlc3Mua2lsbCgpKSk7XG4gICAgcmV0dXJuIGxsZGJQcm9jZXNzO1xuICB9XG5cbiAgX3NlbmRBcmd1bWVudHNUb1B5dGhvbkJhY2tlbmQoXG4gICAgY2hpbGQ6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLFxuICAgIGFyZ3M6IExhdW5jaEF0dGFjaEFyZ3NUeXBlXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IEFSR1VNRU5UX0lOUFVUX0ZEID0gMztcbiAgICAvKiAkRmxvd0ZpeE1lIC0gdXBkYXRlIEZsb3cgZGVmcyBmb3IgQ2hpbGRQcm9jZXNzICovXG4gICAgY29uc3QgYXJndW1lbnRzU3RyZWFtID0gY2hpbGQuc3RkaW9bQVJHVU1FTlRfSU5QVVRfRkRdO1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgYmlkaXJlY3Rpb25hbCBjb21tdW5pY2F0aW9uIGNoYW5uZWwgaXMgc2V0IHVwIGJlZm9yZVxuICAgIC8vIHNlbmRpbmcgZGF0YS5cbiAgICBhcmd1bWVudHNTdHJlYW0ud3JpdGUoJ2luaXRcXG4nKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChvYnNlcnZlU3RyZWFtKGFyZ3VtZW50c1N0cmVhbSkuZmlyc3QoKS5zdWJzY3JpYmUoXG4gICAgICB0ZXh0ID0+IHtcbiAgICAgICAgaWYgKHRleHQuc3RhcnRzV2l0aCgncmVhZHknKSkge1xuICAgICAgICAgIGNvbnN0IGFyZ3NfaW5fanNvbiA9IEpTT04uc3RyaW5naWZ5KGFyZ3MpO1xuICAgICAgICAgIGxvZ0luZm8oYFNlbmRpbmcgJHthcmdzX2luX2pzb259IHRvIGNoaWxkX3Byb2Nlc3NgKTtcbiAgICAgICAgICBhcmd1bWVudHNTdHJlYW0ud3JpdGUoYCR7YXJnc19pbl9qc29ufVxcbmApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvZ0Vycm9yKGBHZXQgdW5rbm93biBpbml0aWFsIGRhdGE6ICR7dGV4dH0uYCk7XG4gICAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZXJyb3IgPT4gbG9nRXJyb3IoYGFyZ3VtZW50c1N0cmVhbSBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlcnJvcil9YClcbiAgICApKTtcbiAgfVxuXG4gIF9jb25uZWN0V2l0aExMREIobGxkYlByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKTogUHJvbWlzZTxXZWJTb2NrZXQ+IHtcbiAgICBsb2coYGNvbm5lY3Rpbmcgd2l0aCBsbGRiYCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEFzeW5jIGhhbmRsZSBwYXJzaW5nIHdlYnNvY2tldCBhZGRyZXNzIGZyb20gdGhlIHN0ZG91dCBvZiB0aGUgY2hpbGQuXG4gICAgICBsbGRiUHJvY2Vzcy5zdGRvdXQub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgIC8vIHN0ZG91dCBzaG91bGQgaG9wZWZ1bGx5IGJlIHNldCB0byBsaW5lLWJ1ZmZlcmluZywgaW4gd2hpY2ggY2FzZSB0aGVcbiAgICAgICAgLy8gc3RyaW5nIHdvdWxkIGNvbWUgb24gb25lIGxpbmUuXG4gICAgICAgIGNvbnN0IGJsb2NrOiBzdHJpbmcgPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICBsb2coYGNoaWxkIHByb2Nlc3MoJHtsbGRiUHJvY2Vzcy5waWR9KSBzdGRvdXQ6ICR7YmxvY2t9YCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IC9Qb3J0OiAoXFxkKylcXG4vLmV4ZWMoYmxvY2spO1xuICAgICAgICBpZiAocmVzdWx0ICE9IG51bGwpIHtcbiAgICAgICAgICAvLyAkRmxvd0lzc3VlIC0gZmxvdyBoYXMgd3JvbmcgdHlwaW5nIGZvciBpdCh0OTY0OTk0NikuXG4gICAgICAgICAgbGxkYlByb2Nlc3Muc3Rkb3V0LnJlbW92ZUFsbExpc3RlbmVycyhbJ2RhdGEnLCAnZXJyb3InLCAnZXhpdCddKTtcbiAgICAgICAgICAvLyBUT0RPW2plZmZyZXl0YW5dOiBleHBsaWNpdGx5IHVzZSBpcHY0IGFkZHJlc3MgMTI3LjAuMC4xIGZvciBub3cuXG4gICAgICAgICAgLy8gSW52ZXN0aWdhdGUgaWYgd2UgY2FuIHVzZSBsb2NhbGhvc3QgYW5kIG1hdGNoIHByb3RvY29sIHZlcnNpb24gYmV0d2VlbiBjbGllbnQvc2VydmVyLlxuICAgICAgICAgIGNvbnN0IGxsZGJXZWJTb2NrZXRBZGRyZXNzID0gYHdzOi8vMTI3LjAuMC4xOiR7cmVzdWx0WzFdfS9gO1xuICAgICAgICAgIGxvZyhgQ29ubmVjdGluZyBsbGRiIHdpdGggYWRkcmVzczogJHtsbGRiV2ViU29ja2V0QWRkcmVzc31gKTtcbiAgICAgICAgICBjb25zdCB3cyA9IG5ldyBXZWJTb2NrZXQobGxkYldlYlNvY2tldEFkZHJlc3MpO1xuICAgICAgICAgIHdzLm9uKCdvcGVuJywgKCkgPT4ge1xuICAgICAgICAgICAgLy8gU3VjY2Vzc2Z1bGx5IGNvbm5lY3RlZCB3aXRoIGxsZGIgcHl0aG9uIHByb2Nlc3MsIGZ1bGZpbGwgdGhlIHByb21pc2UuXG4gICAgICAgICAgICByZXNvbHZlKHdzKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBsbGRiUHJvY2Vzcy5zdGRlcnIub24oJ2RhdGEnLCBjaHVuayA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IGNodW5rLnRvU3RyaW5nKCk7XG4gICAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnNlbmRVc2VyT3V0cHV0TWVzc2FnZShKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgbGV2ZWw6ICdlcnJvcicsXG4gICAgICAgICAgdGV4dDogZXJyb3JNZXNzYWdlLFxuICAgICAgICB9KSk7XG4gICAgICAgIGxvZ0Vycm9yKGBjaGlsZCBwcm9jZXNzKCR7bGxkYlByb2Nlc3MucGlkfSkgc3RkZXJyOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgICAgIH0pO1xuICAgICAgbGxkYlByb2Nlc3Mub24oJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICByZWplY3QoJ2xsZGIgcHJvY2VzcyBlcnJvcicpO1xuICAgICAgfSk7XG4gICAgICBsbGRiUHJvY2Vzcy5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgcmVqZWN0KCdsbGRiIHByb2Nlc3MgZXhpdCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGxvZ0luZm8oYERlYnVnZ2VyUnBjU2VydmljZSBkaXNwb3NlZGApO1xuICB9XG59XG4iXX0=