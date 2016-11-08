'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NativeDebuggerService = exports.getAttachTargetInfoList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let getAttachTargetInfoList = exports.getAttachTargetInfoList = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (targetPid) {
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
      var _arr = _slicedToArray(arr, 2);

      const pid = _arr[0],
            name = _arr[1];

      if (targetPid != null) {
        return pid === targetPid;
      }
      return pidToCommand.has(pid) && !(name.startsWith('(') && name.endsWith(')')) && (name.length < 9 || name.slice(-9) !== '<defunct>');
    }).map(function (arr) {
      var _arr2 = _slicedToArray(arr, 2);

      const pid = _arr2[0],
            name = _arr2[1];

      const commandName = pidToCommand.get(pid);

      if (!(commandName != null)) {
        throw new Error('Invariant violation: "commandName != null"');
      }

      return {
        pid: pid,
        name: name,
        commandName: commandName
      };
    });
  });

  return function getAttachTargetInfoList(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _child_process = _interopRequireDefault(require('child_process'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

var _stream;

function _load_stream() {
  return _stream = require('../../commons-node/stream');
}

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (_utils || _load_utils()).default.log,
      logTrace = (_utils || _load_utils()).default.logTrace,
      logError = (_utils || _load_utils()).default.logError,
      logInfo = (_utils || _load_utils()).default.logInfo,
      setLogLevel = (_utils || _load_utils()).default.setLogLevel;

let NativeDebuggerService = exports.NativeDebuggerService = class NativeDebuggerService {

  constructor(config) {
    this._clientCallback = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).ClientCallback();
    this._config = config;
    setLogLevel(config.logLevel);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._clientCallback);
  }

  getOutputWindowObservable() {
    return this._clientCallback.getOutputWindowObservable().publish();
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  attach(attachInfo) {
    log(`attach process: ${ JSON.stringify(attachInfo) }`);
    const inferiorArguments = {
      pid: String(attachInfo.pid),
      basepath: attachInfo.basepath ? attachInfo.basepath : this._config.buckConfigRootFile
    };
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._startDebugging(inferiorArguments)).publish();
  }

  launch(launchInfo) {
    log(`launch process: ${ JSON.stringify(launchInfo) }`);
    const inferiorArguments = {
      executable_path: launchInfo.executablePath,
      launch_arguments: launchInfo.arguments,
      launch_environment_variables: launchInfo.environmentVariables,
      working_directory: launchInfo.workingDirectory,
      stdin_filepath: launchInfo.stdinFilePath ? launchInfo.stdinFilePath : '',
      basepath: launchInfo.basepath ? launchInfo.basepath : this._config.buckConfigRootFile
    };
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._startDebugging(inferiorArguments)).publish();
  }

  _startDebugging(inferiorArguments) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const lldbProcess = _this._spawnPythonBackend();
      lldbProcess.on('exit', _this._handleLLDBExit.bind(_this));
      _this._registerIpcChannel(lldbProcess);
      _this._sendArgumentsToPythonBackend(lldbProcess, inferiorArguments);
      const lldbWebSocket = yield _this._connectWithLLDB(lldbProcess);
      _this._lldbWebSocket = lldbWebSocket;
      _this._subscriptions.add(function () {
        return lldbWebSocket.terminate();
      });
      lldbWebSocket.on('message', _this._handleLLDBMessage.bind(_this));
    })();
  }

  _registerIpcChannel(lldbProcess) {
    const IPC_CHANNEL_FD = 4;
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const ipcStream = lldbProcess.stdio[IPC_CHANNEL_FD];
    this._subscriptions.add((0, (_observable || _load_observable()).splitStream)((0, (_stream || _load_stream()).observeStream)(ipcStream)).subscribe(this._handleIpcMessage.bind(this, ipcStream), error => logError(`ipcStream error: ${ JSON.stringify(error) }`)));
  }

  _handleIpcMessage(ipcStream, message) {
    logTrace(`ipc message: ${ message }`);
    const messageJson = JSON.parse(message);
    if (messageJson.type === 'Nuclide.userOutput') {
      // Write response message to ipc for sync message.
      if (messageJson.isSync) {
        ipcStream.write(JSON.stringify({
          message_id: messageJson.id
        }) + '\n');
      }
      this._clientCallback.sendUserOutputMessage(JSON.stringify(messageJson.message));
    } else {
      logError(`Unknown message: ${ message }`);
    }
  }

  _spawnPythonBackend() {
    const lldbPythonScriptPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../scripts/main.py');
    const python_args = [lldbPythonScriptPath, '--arguments_in_json'];
    const options = {
      cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(lldbPythonScriptPath),
      // FD[3] is used for sending arguments JSON blob.
      // FD[4] is used as a ipc channel for output/atom notifications.
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
      detached: false };
    logInfo(`spawn child_process: ${ JSON.stringify(python_args) }`);
    const lldbProcess = _child_process.default.spawn(this._config.pythonBinaryPath, python_args, options);
    this._subscriptions.add(() => lldbProcess.kill());
    return lldbProcess;
  }

  _sendArgumentsToPythonBackend(child, args) {
    const ARGUMENT_INPUT_FD = 3;
    /* $FlowFixMe - update Flow defs for ChildProcess */
    const argumentsStream = child.stdio[ARGUMENT_INPUT_FD];
    // Make sure the bidirectional communication channel is set up before
    // sending data.
    argumentsStream.write('init\n');
    this._subscriptions.add((0, (_stream || _load_stream()).observeStream)(argumentsStream).first().subscribe(text => {
      if (text.startsWith('ready')) {
        const args_in_json = JSON.stringify(args);
        logInfo(`Sending ${ args_in_json } to child_process`);
        argumentsStream.write(`${ args_in_json }\n`);
      } else {
        logError(`Get unknown initial data: ${ text }.`);
        child.kill();
      }
    }, error => logError(`argumentsStream error: ${ JSON.stringify(error) }`)));
  }

  _connectWithLLDB(lldbProcess) {
    log('connecting with lldb');
    return new Promise((resolve, reject) => {
      // Async handle parsing websocket address from the stdout of the child.
      lldbProcess.stdout.on('data', chunk => {
        // stdout should hopefully be set to line-buffering, in which case the
        const block = chunk.toString();
        log(`child process(${ lldbProcess.pid }) stdout: ${ block }`);
        const result = /Port: (\d+)\n/.exec(block);
        if (result != null) {
          // $FlowIssue - flow has wrong typing for it(t9649946).
          lldbProcess.stdout.removeAllListeners(['data', 'error', 'exit']);
          // TODO[jeffreytan]: explicitly use ipv4 address 127.0.0.1 for now.
          // Investigate if we can use localhost and match protocol version between client/server.
          const lldbWebSocketAddress = `ws://127.0.0.1:${ result[1] }/`;
          log(`Connecting lldb with address: ${ lldbWebSocketAddress }`);
          const ws = new (_ws || _load_ws()).default(lldbWebSocketAddress);
          ws.on('open', () => {
            // Successfully connected with lldb python process, fulfill the promise.
            resolve(ws);
          });
        }
      });
      lldbProcess.stderr.on('data', chunk => {
        const errorMessage = chunk.toString();
        this._clientCallback.sendUserOutputMessage(JSON.stringify({
          level: 'error',
          text: errorMessage
        }));
        logError(`child process(${ lldbProcess.pid }) stderr: ${ errorMessage }`);
      });
      lldbProcess.on('error', () => {
        reject('lldb process error');
      });
      lldbProcess.on('exit', () => {
        reject('lldb process exit');
      });
    });
  }

  _handleLLDBMessage(message) {
    logTrace(`lldb message: ${ message }`);
    this._clientCallback.sendChromeMessage(message);
  }

  _handleLLDBExit() {
    // Fire and forget.
    this.dispose();
  }

  sendCommand(message) {
    const lldbWebSocket = this._lldbWebSocket;
    if (lldbWebSocket != null) {
      logTrace(`forward client message to lldb: ${ message }`);
      lldbWebSocket.send(message);
    } else {
      logInfo(`Nuclide sent message to LLDB after socket closed: ${ message }`);
    }
    return Promise.resolve();
  }

  dispose() {
    logInfo('NativeDebuggerService disposed');
    this._subscriptions.dispose();
    return Promise.resolve();
  }
};