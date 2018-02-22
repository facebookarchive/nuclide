'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NativeDebuggerService = exports.getAttachTargetInfoList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

let getAttachTargetInfoList = exports.getAttachTargetInfoList = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (targetPid) {
    // Get processes list from ps utility.
    // -e: include all processes, does not require -ww argument since truncation of process names is
    //     done by the OS, not the ps utility
    const pidToName = new Map();
    const processes = yield (0, (_process || _load_process()).runCommand)('ps', ['-e', '-o', 'pid,comm'], {}).toPromise();
    processes.toString().split('\n').slice(1).forEach(function (line) {
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
    const commands = yield (0, (_process || _load_process()).runCommand)('ps', ['-eww', '-o', 'pid,args'], {}).toPromise();
    commands.toString().split('\n').slice(1).forEach(function (line) {
      const words = line.trim().split(' ');
      const pid = Number(words[0]);
      const command = words.slice(1).join(' ');
      pidToCommand.set(pid, command);
    });
    // Filter out processes that have died in between ps calls and zombiue processes.
    // Place pid, process, and command info into AttachTargetInfo objects and return in an array.
    return Array.from(pidToName.entries()).filter(function (arr) {
      const [pid, name] = arr;
      if (targetPid != null) {
        return pid === targetPid;
      }
      return pidToCommand.has(pid) && !(name.startsWith('(') && name.endsWith(')')) && (name.length < 9 || name.slice(-9) !== '<defunct>');
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

  return function getAttachTargetInfoList(_x) {
    return _ref.apply(this, arguments);
  };
})();

let _getDefaultLLDBConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    try {
      // $FlowFB
      const fbPaths = require('./fb-Paths');
      return {
        pythonPath: yield fbPaths.getFBPythonPath(),
        lldbModulePath: yield fbPaths.getFBLLDBModulePath()
      };
    } catch (_) {}

    /*
     * Default is to use the system python and let the python scripts figure out
     * which lldb to use.
     */
    return { pythonPath: '/usr/bin/python', lldbModulePath: '' };
  });

  return function _getDefaultLLDBConfig() {
    return _ref2.apply(this, arguments);
  };
})();

var _child_process = _interopRequireDefault(require('child_process'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _main;

function _load_main() {
  return _main = require('nuclide-debugger-common/main');
}

var _stream;

function _load_stream() {
  return _stream = require('nuclide-commons/stream');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _net = _interopRequireDefault(require('net'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NativeDebuggerService extends (_main || _load_main()).DebuggerRpcWebSocketService {

  constructor(config) {
    super('native');
    this._config = config;
    this.getLogger().setLevel(config.logLevel);
  }

  _expandPath(path, cwd) {
    // Expand a path to interpret ~/ as home and ./ as relative
    // to the current working directory.
    return path.startsWith('./') ? (_nuclideUri || _load_nuclideUri()).default.resolve(cwd != null ? (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(cwd) : '', path.substring(2)) : (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path);
  }

  attach(attachInfo) {
    this.getLogger().debug(`attach process: ${JSON.stringify(attachInfo)}`);
    const inferiorArguments = {
      pid: String(attachInfo.pid),
      basepath: this._expandPath(attachInfo.basepath != null ? attachInfo.basepath : this._config.buckConfigRootFile, null),
      lldb_python_path: this._expandPath(this._config.lldbPythonPath || '', null)
    };
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._startDebugging(inferiorArguments)).publish();
  }

  launch(launchInfo) {
    this.getLogger().debug(`launch process: ${JSON.stringify(launchInfo)}`);
    const exePath = launchInfo.executablePath.trim();
    const inferiorArguments = {
      executable_path: this._expandPath(exePath, launchInfo.workingDirectory),
      launch_arguments: launchInfo.arguments,
      launch_environment_variables: launchInfo.environmentVariables,
      working_directory: launchInfo.workingDirectory,
      stdin_filepath: this._expandPath(launchInfo.stdinFilePath != null ? launchInfo.stdinFilePath : '', launchInfo.workingDirectory),
      basepath: this._expandPath(launchInfo.basepath != null ? launchInfo.basepath : this._config.buckConfigRootFile, launchInfo.workingDirectory),
      lldb_python_path: this._expandPath(this._config.lldbPythonPath || '', launchInfo.workingDirectory),
      core_dump_path: this._expandPath(launchInfo.coreDump || '', launchInfo.workingDirectory)
    };

    if (launchInfo.coreDump != null && launchInfo.coreDump !== '') {
      // Track feature usage of core dump debugging.
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-debugger-debug-coredump-start');
    }

    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._startDebugging(inferiorArguments)).publish();
  }

  bootstrap(bootstrapInfo) {
    this.getLogger().debug(`bootstrap lldb: ${JSON.stringify(bootstrapInfo)}`);
    const inferiorArguments = {
      lldb_bootstrap_files: bootstrapInfo.lldbBootstrapFiles,
      basepath: this._expandPath(bootstrapInfo.basepath != null ? bootstrapInfo.basepath : this._config.buckConfigRootFile),
      lldb_python_path: this._config.lldbPythonPath
    };
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._startDebugging(inferiorArguments)).publish();
  }

  _startDebugging(inferiorArguments) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pythonBinaryPath =
      // flowlint-next-line sketchy-null-string:off
      _this._config.pythonBinaryPath || (yield _getDefaultLLDBConfig()).pythonPath;
      const lldbPythonPath =
      // flowlint-next-line sketchy-null-mixed:off
      inferiorArguments.lldb_python_path || (yield _getDefaultLLDBConfig()).lldbModulePath;

      const lldbProcess = _this._spawnPythonBackend(pythonBinaryPath);
      lldbProcess.on('exit', _this._handleLLDBExit.bind(_this));
      _this._registerIpcChannel(lldbProcess);
      // $FlowIgnore typecast
      _this._sendArgumentsToPythonBackend(lldbProcess, Object.assign({}, inferiorArguments, {
        lldb_python_path: lldbPythonPath
      }));
      const lldbWebSocketListeningPort = yield _this._connectWithLLDB(lldbProcess);

      // TODO[jeffreytan]: explicitly use ipv4 address 127.0.0.1 for now.
      // Investigate if we can use localhost and match protocol version between client/server.
      const lldbWebSocketAddress = `ws://127.0.0.1:${lldbWebSocketListeningPort}/`;
      yield _this.connectToWebSocketServer(lldbWebSocketAddress);
      _this.getLogger().debug(`Connected with lldb at address: ${lldbWebSocketAddress}`);
    })();
  }

  _registerIpcChannel(lldbProcess) {
    const IPC_CHANNEL_FD = 4;
    const ipcStream = lldbProcess.stdio[IPC_CHANNEL_FD];
    this.getSubscriptions().add((0, (_observable || _load_observable()).splitStream)((0, (_stream || _load_stream()).observeStream)(ipcStream)).subscribe(this._handleIpcMessage.bind(this, ipcStream), error => this.getLogger().error(`ipcStream error: ${JSON.stringify(error)}`)));
  }

  _handleIpcMessage(ipcStream, message) {
    this.getLogger().trace(`ipc message: ${message}`);
    const messageJson = JSON.parse(message);
    if (messageJson.type === 'Nuclide.userOutput') {
      // Write response message to ipc for sync message.
      if (messageJson.isSync) {
        ipcStream.write(JSON.stringify({
          message_id: messageJson.id
        }) + '\n');
      }
      this.getClientCallback().sendUserOutputMessage(JSON.stringify(messageJson.message));
    } else {
      this.getLogger().error(`Unknown message: ${message}`);
    }
  }

  _spawnPythonBackend(pythonPath) {
    const lldbPythonScriptPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../scripts/main.py');
    const python_args = [lldbPythonScriptPath, '--arguments_in_json'];
    const environ = process.env;
    environ.PYTHONPATH = this._config.envPythonPath;
    const options = {
      cwd: (_nuclideUri || _load_nuclideUri()).default.dirname(lldbPythonScriptPath),
      // FD[3] is used for sending arguments JSON blob.
      // FD[4] is used as a ipc channel for output/atom notifications.
      stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'],
      detached: false, // When Atom is killed, clang_server.py should be killed, too.
      env: environ
    };
    this.getLogger().info(`spawn child_process: ${JSON.stringify(python_args)}`);
    const lldbProcess = _child_process.default.spawn(pythonPath, python_args, options);
    this.getSubscriptions().add(() => lldbProcess.kill());
    return lldbProcess;
  }

  _sendArgumentsToPythonBackend(child, args) {
    const ARGUMENT_INPUT_FD = 3;
    const argumentsStream = child.stdio[ARGUMENT_INPUT_FD];
    // Make sure the bidirectional communication channel is set up before
    // sending data.
    argumentsStream.write('init\n');
    this.getSubscriptions().add((0, (_stream || _load_stream()).observeStream)(argumentsStream).first().subscribe(text => {
      if (text.startsWith('ready')) {
        const args_in_json = JSON.stringify(args);
        this.getLogger().info(`Sending ${args_in_json} to child_process`);
        argumentsStream.write(`${args_in_json}\n`);
      } else {
        this.getLogger().error(`Get unknown initial data: ${text}.`);
        child.kill();
      }
    }, error => this.getLogger().error(`argumentsStream error: ${JSON.stringify(error)}`)));
  }

  _connectWithLLDB(lldbProcess) {
    this.getLogger().debug('connecting with lldb');
    return new Promise((resolve, reject) => {
      // Async handle parsing websocket address from the stdout of the child.
      lldbProcess.stdout.on('data', chunk => {
        // stdout should hopefully be set to line-buffering, in which case the
        const block = chunk.toString();
        this.getLogger().debug(`child process(${lldbProcess.pid}) stdout: ${block}`);
        const result = /Port: (\d+)\n/.exec(block);
        if (result != null) {
          // $FlowIssue - flow has wrong typing for it(t9649946).
          lldbProcess.stdout.removeAllListeners(['data', 'error', 'exit']);
          resolve(result[1]);
        }
      });
      lldbProcess.stderr.on('data', chunk => {
        const errorMessage = chunk.toString();
        this.getClientCallback().sendUserOutputMessage(JSON.stringify({
          level: 'error',
          text: errorMessage
        }));
        this.getLogger().error(`child process(${lldbProcess.pid}) stderr: ${errorMessage}`);
      });
      lldbProcess.on('error', err => {
        reject(new Error(`debugger server error: ${JSON.stringify(err)}`));
      });
      lldbProcess.on('exit', (code, signal) => {
        let message = `debugger server exits with code: ${code}`;
        if (signal != null) {
          message += `, because of signal ${signal}`;
        }
        reject(message);
      });
    });
  }

  _handleLLDBExit() {
    // Fire and forget.
    this.dispose();
  }

  // Spawns a TCP socket server to be used to communicate with the python
  // launch wrapper when launching a process in the terminal. The wrapper
  // will use this socket to communicate its pid, and wait for us to attach
  // a debugger before calling execv to load the target image into the process.
  _spawnIpcServer(onConnectCallback) {
    return (0, _asyncToGenerator.default)(function* () {
      return new Promise(function (resolve, reject) {
        const server = _net.default.createServer();
        server.on('error', reject);
        server.on('connection', function (socket) {
          socket.on('error', function () {
            return server.close;
          });
          socket.on('end', function () {
            return server.close;
          });
          onConnectCallback(socket);
          server.close();
        });

        try {
          server.listen({ host: '127.0.0.1', port: 0 }, function () {
            return resolve(server.address().port);
          });
        } catch (e) {
          reject(e);
        }
      });
    })();
  }

  // This callback is invoked when the wrapper process starts up and connects
  // to our TCP socket. It will send its own pid into the socket and then block
  // on a read of the socket. We will then attach the debugger to the specified
  // pid, and issue a write to the socket to indicate to the wrapper that the
  // attach is complete, and it's now OK to resume execution of the target.
  _launchWrapperConnected(socket, data, launchInfo) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Expect the python wrapper to send us a pid.
      const pid = parseInt(data.trim(), 10);
      if (Number.isNaN(pid)) {
        throw new Error('Failed to start debugger: Received invalid process ID from target wrapper');
      }

      try {
        // Attach the debugger to the wrapper script process.
        yield _this2.attach({
          pid,
          name: launchInfo.executablePath,
          commandName: launchInfo.executablePath,
          basepath: launchInfo.basepath
        }).refCount().toPromise();

        // Send any data into the socket to unblock the target wrapper
        // and let it know it's safe to proceed with launching now.
        socket.end('continue');
      } catch (e) {
        _this2._handleLLDBExit();
      }
    })();
  }

  prepareForTerminalLaunch(launchInfo) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Expand home directory if the launch executable starts with ~/
      launchInfo.executablePath = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(launchInfo.executablePath);

      const pythonBinaryPath =
      // flowlint-next-line sketchy-null-string:off
      _this3._config.pythonBinaryPath || (yield _getDefaultLLDBConfig()).pythonPath;

      // Find the launch wrapper.
      const wrapperScriptPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../scripts/launch.py');

      const ipcPort = yield _this3._spawnIpcServer(function (socket) {
        socket.once('data', (() => {
          var _ref3 = (0, _asyncToGenerator.default)(function* (data) {
            _this3._launchWrapperConnected(socket, data.toString(), launchInfo);
          });

          return function (_x2) {
            return _ref3.apply(this, arguments);
          };
        })());
      });

      return {
        launchCommand: pythonBinaryPath,
        targetExecutable: launchInfo.executablePath,
        launchCwd: (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(launchInfo.workingDirectory !== '' ? launchInfo.workingDirectory : '~'),
        launchArgs: [wrapperScriptPath, String(ipcPort), launchInfo.executablePath, ...launchInfo.arguments]
      };
    })();
  }
}
exports.NativeDebuggerService = NativeDebuggerService;