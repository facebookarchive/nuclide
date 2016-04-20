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

var _reactivexRxjs = require('@reactivex/rxjs');

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
  function DebuggerRpcService(config) {
    var _this = this;

    _classCallCheck(this, DebuggerRpcService);

    this._clientCallback = new _nuclideDebuggerCommonLibClientCallback.ClientCallback();
    this._config = config;
    setLogLevel(config.logLevel);
    this._subscriptions = new _eventKit.CompositeDisposable(new _eventKit.Disposable(function () {
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
      this._subscriptions.add(new _nuclideCommons.DisposableSubscription((0, _nuclideCommons.splitStream)((0, _nuclideCommons.observeStream)(ipcStream)).subscribe(this._handleIpcMessage.bind(this, ipcStream), function (error) {
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
      var lldbProcess = _child_process2['default'].spawn(this._config.pythonBinaryPath, python_args, options);
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
      this._subscriptions.add(new _nuclideCommons.DisposableSubscription((0, _nuclideCommons.observeStream)(argumentsStream).first().subscribe(function (text) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlYnVnZ2VyUnBjU2VydmljZUltcGxlbWVudGF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0lBeUNzQix1QkFBdUIscUJBQXRDLGFBQTJFO2lCQUN6RCxPQUFPLENBQUMsdUJBQXVCLENBQUM7O01BQWhELFlBQVksWUFBWixZQUFZOzs7OztBQUluQixNQUFNLE1BQU0sR0FBRyxNQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLFNBQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMvRCxRQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3JDLFFBQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM3QixRQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QyxRQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFFBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQy9DLFdBQU87QUFDTCxTQUFHLEVBQUgsR0FBRztBQUNILFVBQUksRUFBSixJQUFJO0tBQ0wsQ0FBQztHQUNILENBQUMsQ0FDRCxNQUFNLENBQUMsVUFBQSxJQUFJO1dBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUks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Qzs7V0FDSjtTQUNGLENBQUMsQ0FBQztBQUNILG1CQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxLQUFLLEVBQUk7QUFDckMsY0FBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3RDLGlCQUFLLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ3hELGlCQUFLLEVBQUUsT0FBTztBQUNkLGdCQUFJLEVBQUUsWUFBWTtXQUNuQixDQUFDLENBQUMsQ0FBQztBQUNKLGtCQUFRLG9CQUFrQixXQUFXLENBQUMsR0FBRyxrQkFBYSxZQUFZLENBQUcsQ0FBQztTQUN2RSxDQUFDLENBQUM7QUFDSCxtQkFBVyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUM1QixnQkFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDOUIsQ0FBQyxDQUFDO0FBQ0gsbUJBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFlBQU07QUFDM0IsZ0JBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzdCLENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKOzs7NkJBRVksYUFBa0I7QUFDN0IsYUFBTywrQkFBK0IsQ0FBQztLQUN4Qzs7O1NBMUtVLGtCQUFrQiIsImZpbGUiOiJEZWJ1Z2dlclJwY1NlcnZpY2VJbXBsZW1lbnRhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgQXR0YWNoVGFyZ2V0SW5mbyxcbiAgTGF1bmNoVGFyZ2V0SW5mbyxcbiAgRGVidWdnZXJDb25maWcsXG59IGZyb20gJy4vRGVidWdnZXJScGNTZXJ2aWNlSW50ZXJmYWNlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdldmVudC1raXQnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB1dGlscyBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSAnd3MnO1xuY29uc3Qge2xvZywgbG9nVHJhY2UsIGxvZ0Vycm9yLCBsb2dJbmZvLCBzZXRMb2dMZXZlbH0gPSB1dGlscztcbmltcG9ydCB7Q2xpZW50Q2FsbGJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItY29tbW9uL2xpYi9DbGllbnRDYWxsYmFjayc7XG5pbXBvcnQge29ic2VydmVTdHJlYW0sIHNwbGl0U3RyZWFtLCBEaXNwb3NhYmxlU3Vic2NyaXB0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG50eXBlIEF0dGFjaEluZm9BcmdzVHlwZSA9IHtcbiAgcGlkOiBzdHJpbmc7XG4gIGJhc2VwYXRoOiBzdHJpbmc7XG59O1xuXG50eXBlIExhdW5jaEluZm9BcmdzVHlwZSA9IHtcbiAgZXhlY3V0YWJsZV9wYXRoOiBzdHJpbmc7XG4gIGxhdW5jaF9hcmd1bWVudHM6IHN0cmluZztcbiAgd29ya2luZ19kaXJlY3Rvcnk6IHN0cmluZztcbiAgYmFzZXBhdGg6IHN0cmluZztcbn07XG5cbnR5cGUgTGF1bmNoQXR0YWNoQXJnc1R5cGUgPSBBdHRhY2hJbmZvQXJnc1R5cGUgfCBMYXVuY2hJbmZvQXJnc1R5cGU7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBdHRhY2hUYXJnZXRJbmZvTGlzdCgpOiBQcm9taXNlPEFycmF5PEF0dGFjaFRhcmdldEluZm8+PiB7XG4gIGNvbnN0IHthc3luY0V4ZWN1dGV9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG4gIC8vIEdldCBwcm9jZXNzZXMgbGlzdCBmcm9tIHBzIHV0aWxpdHkuXG4gIC8vIC1lOiBpbmNsdWRlIGFsbCBwcm9jZXNzZXNcbiAgLy8gLW8gcGlkLGNvbW06IGN1c3RvbSBmb3JtYXQgdGhlIG91dHB1dCB0byBiZSB0d28gY29sdW1ucyhwaWQgYW5kIGNvbW1hbmQgbmFtZSlcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXN5bmNFeGVjdXRlKCdwcycsIFsnLWUnLCAnLW8nLCAncGlkLGNvbW0nXSwge30pO1xuICByZXR1cm4gcmVzdWx0LnN0ZG91dC50b1N0cmluZygpLnNwbGl0KCdcXG4nKS5zbGljZSgxKS5tYXAobGluZSA9PiB7XG4gICAgY29uc3Qgd29yZHMgPSBsaW5lLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGNvbnN0IHBpZCA9IE51bWJlcih3b3Jkc1swXSk7XG4gICAgY29uc3QgY29tbWFuZCA9IHdvcmRzLnNsaWNlKDEpLmpvaW4oJyAnKTtcbiAgICBjb25zdCBjb21wb25lbnRzID0gY29tbWFuZC5zcGxpdCgnLycpO1xuICAgIGNvbnN0IG5hbWUgPSBjb21wb25lbnRzW2NvbXBvbmVudHMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIHtcbiAgICAgIHBpZCxcbiAgICAgIG5hbWUsXG4gICAgfTtcbiAgfSlcbiAgLmZpbHRlcihpdGVtID0+ICFpdGVtLm5hbWUuc3RhcnRzV2l0aCgnKCcpIHx8ICFpdGVtLm5hbWUuZW5kc1dpdGgoJyknKSk7XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlckNvbm5lY3Rpb24ge1xuICBfY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrO1xuICBfbGxkYldlYlNvY2tldDogV2ViU29ja2V0O1xuICBfbGxkYlByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnRDYWxsYmFjazogQ2xpZW50Q2FsbGJhY2ssXG4gICAgbGxkYldlYlNvY2tldDogV2ViU29ja2V0LFxuICAgIGxsZGJQcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyxcbiAgICBzdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlLFxuICApIHtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjayA9IGNsaWVudENhbGxiYWNrO1xuICAgIHRoaXMuX2xsZGJXZWJTb2NrZXQgPSBsbGRiV2ViU29ja2V0O1xuICAgIHRoaXMuX2xsZGJQcm9jZXNzID0gbGxkYlByb2Nlc3M7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IHN1YnNjcmlwdGlvbnM7XG4gICAgbGxkYldlYlNvY2tldC5vbignbWVzc2FnZScsIHRoaXMuX2hhbmRsZUxMREJNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIGxsZGJQcm9jZXNzLm9uKCdleGl0JywgdGhpcy5faGFuZGxlTExEQkV4aXQuYmluZCh0aGlzKSk7XG4gIH1cblxuICBnZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnRDYWxsYmFjay5nZXRTZXJ2ZXJNZXNzYWdlT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgX2hhbmRsZUxMREJNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ1RyYWNlKGBsbGRiIG1lc3NhZ2U6ICR7bWVzc2FnZX1gKTtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kQ2hyb21lTWVzc2FnZShtZXNzYWdlKTtcbiAgfVxuXG4gIF9oYW5kbGVMTERCRXhpdCgpOiB2b2lkIHtcbiAgICAvLyBGaXJlIGFuZCBmb3JnZXQuXG4gICAgdGhpcy5kaXNwb3NlKCk7XG4gIH1cblxuICBhc3luYyBzZW5kQ29tbWFuZChtZXNzYWdlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBsbGRiV2ViU29ja2V0ID0gdGhpcy5fbGxkYldlYlNvY2tldDtcbiAgICBpZiAobGxkYldlYlNvY2tldCkge1xuICAgICAgbG9nVHJhY2UoYGZvcndhcmQgY2xpZW50IG1lc3NhZ2UgdG8gbGxkYjogJHttZXNzYWdlfWApO1xuICAgICAgbGxkYldlYlNvY2tldC5zZW5kKG1lc3NhZ2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2dFcnJvcihgV2h5IGlzIG5vdCBsbGRiIHNvY2tldCBhdmFpbGFibGU/YCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2coYERlYnVnZ2VyQ29ubmVjdGlvbiBkaXNwb3NlZGApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z2dlclJwY1NlcnZpY2Uge1xuICBfY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrO1xuICBfY29uZmlnOiBEZWJ1Z2dlckNvbmZpZztcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoY29uZmlnOiBEZWJ1Z2dlckNvbmZpZykge1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrID0gbmV3IENsaWVudENhbGxiYWNrKCk7XG4gICAgdGhpcy5fY29uZmlnID0gY29uZmlnO1xuICAgIHNldExvZ0xldmVsKGNvbmZpZy5sb2dMZXZlbCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4gdGhpcy5fY2xpZW50Q2FsbGJhY2suZGlzcG9zZSgpKSxcbiAgICApO1xuICB9XG5cbiAgZ2V0T3V0cHV0V2luZG93T2JzZXJ2YWJsZSgpOiBPYnNlcnZhYmxlPHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnRDYWxsYmFjay5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCk7XG4gIH1cblxuICBhc3luYyBhdHRhY2goYXR0YWNoSW5mbzogQXR0YWNoVGFyZ2V0SW5mbyk6IFByb21pc2U8RGVidWdnZXJDb25uZWN0aW9uPiB7XG4gICAgbG9nKGBhdHRhY2ggcHJvY2VzczogJHtKU09OLnN0cmluZ2lmeShhdHRhY2hJbmZvKX1gKTtcbiAgICBjb25zdCBpbmZlcmlvckFyZ3VtZW50cyA9IHtcbiAgICAgIHBpZDogU3RyaW5nKGF0dGFjaEluZm8ucGlkKSxcbiAgICAgIGJhc2VwYXRoOiBhdHRhY2hJbmZvLmJhc2VwYXRoID8gYXR0YWNoSW5mby5iYXNlcGF0aCA6IHRoaXMuX2NvbmZpZy5idWNrQ29uZmlnUm9vdEZpbGUsXG4gICAgfTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5fc3RhcnREZWJ1Z2dpbmcoaW5mZXJpb3JBcmd1bWVudHMpO1xuICB9XG5cbiAgYXN5bmMgbGF1bmNoKGxhdW5jaEluZm86IExhdW5jaFRhcmdldEluZm8pOiBQcm9taXNlPERlYnVnZ2VyQ29ubmVjdGlvbj4ge1xuICAgIGxvZyhgbGF1bmNoIHByb2Nlc3M6ICR7SlNPTi5zdHJpbmdpZnkobGF1bmNoSW5mbyl9YCk7XG4gICAgY29uc3QgaW5mZXJpb3JBcmd1bWVudHMgPSB7XG4gICAgICBleGVjdXRhYmxlX3BhdGg6IGxhdW5jaEluZm8uZXhlY3V0YWJsZVBhdGgsXG4gICAgICBsYXVuY2hfYXJndW1lbnRzOiBsYXVuY2hJbmZvLmFyZ3VtZW50cyxcbiAgICAgIHdvcmtpbmdfZGlyZWN0b3J5OiBsYXVuY2hJbmZvLndvcmtpbmdEaXJlY3RvcnksXG4gICAgICBiYXNlcGF0aDogbGF1bmNoSW5mby5iYXNlcGF0aCA/IGxhdW5jaEluZm8uYmFzZXBhdGggOiB0aGlzLl9jb25maWcuYnVja0NvbmZpZ1Jvb3RGaWxlLFxuICAgIH07XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuX3N0YXJ0RGVidWdnaW5nKGluZmVyaW9yQXJndW1lbnRzKTtcbiAgfVxuXG4gIGFzeW5jIF9zdGFydERlYnVnZ2luZyhcbiAgICBpbmZlcmlvckFyZ3VtZW50czogTGF1bmNoQXR0YWNoQXJnc1R5cGVcbiAgKTogUHJvbWlzZTxEZWJ1Z2dlckNvbm5lY3Rpb24+IHtcbiAgICBjb25zdCBsbGRiUHJvY2VzcyA9IHRoaXMuX3NwYXduUHl0aG9uQmFja2VuZCgpO1xuICAgIHRoaXMuX3JlZ2lzdGVySXBjQ2hhbm5lbChsbGRiUHJvY2Vzcyk7XG4gICAgdGhpcy5fc2VuZEFyZ3VtZW50c1RvUHl0aG9uQmFja2VuZChsbGRiUHJvY2VzcywgaW5mZXJpb3JBcmd1bWVudHMpO1xuICAgIGNvbnN0IGxsZGJXZWJTb2NrZXQgPSBhd2FpdCB0aGlzLl9jb25uZWN0V2l0aExMREIobGxkYlByb2Nlc3MpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IGxsZGJXZWJTb2NrZXQudGVybWluYXRlKCkpKTtcbiAgICByZXR1cm4gbmV3IERlYnVnZ2VyQ29ubmVjdGlvbihcbiAgICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLFxuICAgICAgbGxkYldlYlNvY2tldCxcbiAgICAgIGxsZGJQcm9jZXNzLFxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucyxcbiAgICApO1xuICB9XG5cbiAgX3JlZ2lzdGVySXBjQ2hhbm5lbChsbGRiUHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3MpOiB2b2lkIHtcbiAgICBjb25zdCBJUENfQ0hBTk5FTF9GRCA9IDQ7XG4gICAgLyogJEZsb3dGaXhNZSAtIHVwZGF0ZSBGbG93IGRlZnMgZm9yIENoaWxkUHJvY2VzcyAqL1xuICAgIGNvbnN0IGlwY1N0cmVhbSA9IGxsZGJQcm9jZXNzLnN0ZGlvW0lQQ19DSEFOTkVMX0ZEXTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihcbiAgICAgIHNwbGl0U3RyZWFtKG9ic2VydmVTdHJlYW0oaXBjU3RyZWFtKSkuc3Vic2NyaWJlKFxuICAgICAgICB0aGlzLl9oYW5kbGVJcGNNZXNzYWdlLmJpbmQodGhpcywgaXBjU3RyZWFtKSxcbiAgICAgICAgZXJyb3IgPT4gbG9nRXJyb3IoYGlwY1N0cmVhbSBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlcnJvcil9YCksXG4gICAgKSkpO1xuICB9XG5cbiAgX2hhbmRsZUlwY01lc3NhZ2UoaXBjU3RyZWFtOiBPYmplY3QsIG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ1RyYWNlKGBpcGMgbWVzc2FnZTogJHttZXNzYWdlfWApO1xuICAgIGNvbnN0IG1lc3NhZ2VKc29uID0gSlNPTi5wYXJzZShtZXNzYWdlKTtcbiAgICBpZiAobWVzc2FnZUpzb24udHlwZSA9PT0gJ051Y2xpZGUudXNlck91dHB1dCcpIHtcbiAgICAgIC8vIFdyaXRlIHJlc3BvbnNlIG1lc3NhZ2UgdG8gaXBjIGZvciBzeW5jIG1lc3NhZ2UuXG4gICAgICBpZiAobWVzc2FnZUpzb24uaXNTeW5jKSB7XG4gICAgICAgIGlwY1N0cmVhbS53cml0ZShKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgbWVzc2FnZV9pZDogbWVzc2FnZUpzb24uaWQsXG4gICAgICAgIH0pICsgJ1xcbicpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY2xpZW50Q2FsbGJhY2suc2VuZFVzZXJPdXRwdXRNZXNzYWdlKEpTT04uc3RyaW5naWZ5KG1lc3NhZ2VKc29uLm1lc3NhZ2UpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nRXJyb3IoYFVua25vd24gbWVzc2FnZTogJHttZXNzYWdlfWApO1xuICAgIH1cbiAgfVxuXG4gIF9zcGF3blB5dGhvbkJhY2tlbmQoKTogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3Mge1xuICAgIGNvbnN0IGxsZGJQeXRob25TY3JpcHRQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3NjcmlwdHMvbWFpbi5weScpO1xuICAgIGNvbnN0IHB5dGhvbl9hcmdzID0gW2xsZGJQeXRob25TY3JpcHRQYXRoLCAnLS1hcmd1bWVudHNfaW5fanNvbiddO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IHBhdGguZGlybmFtZShsbGRiUHl0aG9uU2NyaXB0UGF0aCksXG4gICAgICAvLyBGRFszXSBpcyB1c2VkIGZvciBzZW5kaW5nIGFyZ3VtZW50cyBKU09OIGJsb2IuXG4gICAgICAvLyBGRFs0XSBpcyB1c2VkIGFzIGEgaXBjIGNoYW5uZWwgZm9yIG91dHB1dC9hdG9tIG5vdGlmaWNhdGlvbnMuXG4gICAgICBzdGRpbzogWydwaXBlJywgJ3BpcGUnLCAncGlwZScsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgIGRldGFjaGVkOiBmYWxzZSwgLy8gV2hlbiBBdG9tIGlzIGtpbGxlZCwgY2xhbmdfc2VydmVyLnB5IHNob3VsZCBiZSBraWxsZWQsIHRvby5cbiAgICB9O1xuICAgIGxvZ0luZm8oYHNwYXduIGNoaWxkX3Byb2Nlc3M6ICR7SlNPTi5zdHJpbmdpZnkocHl0aG9uX2FyZ3MpfWApO1xuICAgIGNvbnN0IGxsZGJQcm9jZXNzID0gY2hpbGRfcHJvY2Vzcy5zcGF3bihcbiAgICAgIHRoaXMuX2NvbmZpZy5weXRob25CaW5hcnlQYXRoLFxuICAgICAgcHl0aG9uX2FyZ3MsXG4gICAgICBvcHRpb25zLFxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobmV3IERpc3Bvc2FibGUoKCkgPT4gbGxkYlByb2Nlc3Mua2lsbCgpKSk7XG4gICAgcmV0dXJuIGxsZGJQcm9jZXNzO1xuICB9XG5cbiAgX3NlbmRBcmd1bWVudHNUb1B5dGhvbkJhY2tlbmQoXG4gICAgY2hpbGQ6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLFxuICAgIGFyZ3M6IExhdW5jaEF0dGFjaEFyZ3NUeXBlXG4gICk6IHZvaWQge1xuICAgIGNvbnN0IEFSR1VNRU5UX0lOUFVUX0ZEID0gMztcbiAgICAvKiAkRmxvd0ZpeE1lIC0gdXBkYXRlIEZsb3cgZGVmcyBmb3IgQ2hpbGRQcm9jZXNzICovXG4gICAgY29uc3QgYXJndW1lbnRzU3RyZWFtID0gY2hpbGQuc3RkaW9bQVJHVU1FTlRfSU5QVVRfRkRdO1xuICAgIC8vIE1ha2Ugc3VyZSB0aGUgYmlkaXJlY3Rpb25hbCBjb21tdW5pY2F0aW9uIGNoYW5uZWwgaXMgc2V0IHVwIGJlZm9yZVxuICAgIC8vIHNlbmRpbmcgZGF0YS5cbiAgICBhcmd1bWVudHNTdHJlYW0ud3JpdGUoJ2luaXRcXG4nKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChuZXcgRGlzcG9zYWJsZVN1YnNjcmlwdGlvbihcbiAgICAgIG9ic2VydmVTdHJlYW0oYXJndW1lbnRzU3RyZWFtKS5maXJzdCgpLnN1YnNjcmliZShcbiAgICAgICAgdGV4dCA9PiB7XG4gICAgICAgICAgaWYgKHRleHQuc3RhcnRzV2l0aCgncmVhZHknKSkge1xuICAgICAgICAgICAgY29uc3QgYXJnc19pbl9qc29uID0gSlNPTi5zdHJpbmdpZnkoYXJncyk7XG4gICAgICAgICAgICBsb2dJbmZvKGBTZW5kaW5nICR7YXJnc19pbl9qc29ufSB0byBjaGlsZF9wcm9jZXNzYCk7XG4gICAgICAgICAgICBhcmd1bWVudHNTdHJlYW0ud3JpdGUoYCR7YXJnc19pbl9qc29ufVxcbmApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dFcnJvcihgR2V0IHVua25vd24gaW5pdGlhbCBkYXRhOiAke3RleHR9LmApO1xuICAgICAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3IgPT4gbG9nRXJyb3IoYGFyZ3VtZW50c1N0cmVhbSBlcnJvcjogJHtKU09OLnN0cmluZ2lmeShlcnJvcil9YClcbiAgICApKSk7XG4gIH1cblxuICBfY29ubmVjdFdpdGhMTERCKGxsZGJQcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcyk6IFByb21pc2U8V2ViU29ja2V0PiB7XG4gICAgbG9nKGBjb25uZWN0aW5nIHdpdGggbGxkYmApO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBBc3luYyBoYW5kbGUgcGFyc2luZyB3ZWJzb2NrZXQgYWRkcmVzcyBmcm9tIHRoZSBzdGRvdXQgb2YgdGhlIGNoaWxkLlxuICAgICAgbGxkYlByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgICAvLyBzdGRvdXQgc2hvdWxkIGhvcGVmdWxseSBiZSBzZXQgdG8gbGluZS1idWZmZXJpbmcsIGluIHdoaWNoIGNhc2UgdGhlXG4gICAgICAgIC8vIHN0cmluZyB3b3VsZCBjb21lIG9uIG9uZSBsaW5lLlxuICAgICAgICBjb25zdCBibG9jazogc3RyaW5nID0gY2h1bmsudG9TdHJpbmcoKTtcbiAgICAgICAgbG9nKGBjaGlsZCBwcm9jZXNzKCR7bGxkYlByb2Nlc3MucGlkfSkgc3Rkb3V0OiAke2Jsb2NrfWApO1xuICAgICAgICBjb25zdCByZXN1bHQgPSAvUG9ydDogKFxcZCspXFxuLy5leGVjKGJsb2NrKTtcbiAgICAgICAgaWYgKHJlc3VsdCAhPSBudWxsKSB7XG4gICAgICAgICAgLy8gJEZsb3dJc3N1ZSAtIGZsb3cgaGFzIHdyb25nIHR5cGluZyBmb3IgaXQodDk2NDk5NDYpLlxuICAgICAgICAgIGxsZGJQcm9jZXNzLnN0ZG91dC5yZW1vdmVBbGxMaXN0ZW5lcnMoWydkYXRhJywgJ2Vycm9yJywgJ2V4aXQnXSk7XG4gICAgICAgICAgLy8gVE9ET1tqZWZmcmV5dGFuXTogZXhwbGljaXRseSB1c2UgaXB2NCBhZGRyZXNzIDEyNy4wLjAuMSBmb3Igbm93LlxuICAgICAgICAgIC8vIEludmVzdGlnYXRlIGlmIHdlIGNhbiB1c2UgbG9jYWxob3N0IGFuZCBtYXRjaCBwcm90b2NvbCB2ZXJzaW9uIGJldHdlZW4gY2xpZW50L3NlcnZlci5cbiAgICAgICAgICBjb25zdCBsbGRiV2ViU29ja2V0QWRkcmVzcyA9IGB3czovLzEyNy4wLjAuMToke3Jlc3VsdFsxXX0vYDtcbiAgICAgICAgICBsb2coYENvbm5lY3RpbmcgbGxkYiB3aXRoIGFkZHJlc3M6ICR7bGxkYldlYlNvY2tldEFkZHJlc3N9YCk7XG4gICAgICAgICAgY29uc3Qgd3MgPSBuZXcgV2ViU29ja2V0KGxsZGJXZWJTb2NrZXRBZGRyZXNzKTtcbiAgICAgICAgICB3cy5vbignb3BlbicsICgpID0+IHtcbiAgICAgICAgICAgIC8vIFN1Y2Nlc3NmdWxseSBjb25uZWN0ZWQgd2l0aCBsbGRiIHB5dGhvbiBwcm9jZXNzLCBmdWxmaWxsIHRoZSBwcm9taXNlLlxuICAgICAgICAgICAgcmVzb2x2ZSh3cyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbGxkYlByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgY2h1bmsgPT4ge1xuICAgICAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBjaHVuay50b1N0cmluZygpO1xuICAgICAgICB0aGlzLl9jbGllbnRDYWxsYmFjay5zZW5kVXNlck91dHB1dE1lc3NhZ2UoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIGxldmVsOiAnZXJyb3InLFxuICAgICAgICAgIHRleHQ6IGVycm9yTWVzc2FnZSxcbiAgICAgICAgfSkpO1xuICAgICAgICBsb2dFcnJvcihgY2hpbGQgcHJvY2Vzcygke2xsZGJQcm9jZXNzLnBpZH0pIHN0ZGVycjogJHtlcnJvck1lc3NhZ2V9YCk7XG4gICAgICB9KTtcbiAgICAgIGxsZGJQcm9jZXNzLm9uKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgcmVqZWN0KCdsbGRiIHByb2Nlc3MgZXJyb3InKTtcbiAgICAgIH0pO1xuICAgICAgbGxkYlByb2Nlc3Mub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgIHJlamVjdCgnbGxkYiBwcm9jZXNzIGV4aXQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBsb2dJbmZvKGBEZWJ1Z2dlclJwY1NlcnZpY2UgZGlzcG9zZWRgKTtcbiAgfVxufVxuIl19