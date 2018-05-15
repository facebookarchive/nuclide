'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.PtyImplementation = exports.useTitleAsPath = exports.spawn = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator')); /**
                                                                                                                                                                                                                                          * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                          * All rights reserved.
                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                          * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                          * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                          * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                          * 
                                                                                                                                                                                                                                          * @format
                                                                                                                                                                                                                                          */let spawn = exports.spawn = (() => {var _ref = (0, _asyncToGenerator.default)(


















  function* (info, client) {
    return new PtyImplementation(
    info,
    client, (
    yield getCommand(info, client)), (
    yield getEnvironment(info)));

  });return function spawn(_x, _x2) {return _ref.apply(this, arguments);};})();let useTitleAsPath = exports.useTitleAsPath = (() => {var _ref2 = (0, _asyncToGenerator.default)(

  function* (client) {
    try {
      const config = yield (0, (_shellConfig || _load_shellConfig()).readConfig)();
      // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      if (config != null && config.useTitleAsPath != null) {
        return config.useTitleAsPath;
      }
    } catch (error) {
      client.onOutput(`Error reading ~/.nuclide-terminal.json:\r\n${error}\r\n`);
    }

    return false;
  });return function useTitleAsPath(_x3) {return _ref2.apply(this, arguments);};})();let getCommand = (() => {var _ref3 = (0, _asyncToGenerator.default)(

  function* (info, client) {
    // Client-specified command is highest precedence.
    if (info.command != null) {
      return info.command;
    }

    // If no command, fall back to shell command specified in local
    // (server) config file.  This cannot be Atom config/preference,
    // since the default shell path varies between client and server.
    try {
      const config = yield (0, (_shellConfig || _load_shellConfig()).readConfig)();
      if (config != null && config.command != null) {
        return config.command;
      }
    } catch (error) {
      client.onOutput(`Error reading ~/.nuclide-terminal.json:\r\n${error}\r\n`);
    }

    try {
      const defaultShellCommand = yield getDefaultShellCommand();
      if (defaultShellCommand != null) {
        return defaultShellCommand;
      }
    } catch (error) {
      client.onOutput(`Error getting default shell:\r\n${error}\r\n`);
    }

    // If no command and no local settings, default to /bin/bash
    return {
      file: '/bin/bash',
      args: ['-l'] };

  });return function getCommand(_x4, _x5) {return _ref3.apply(this, arguments);};})();let getDefaultShellCommand = (() => {var _ref4 = (0, _asyncToGenerator.default)(

  function* () {
    if (process.platform === 'win32') {
      return {
        file: 'cmd.exe',
        args: [] };

    }

    const userInfo = _os.default.userInfo();
    const username = userInfo.username;
    let defaultShell = null;
    if (process.platform === 'darwin') {
      const homedir = userInfo.homedir;
      const output = yield (0, (_process || _load_process()).runCommand)('dscl', [
      '.',
      '-read',
      homedir,
      'UserShell']).
      toPromise();
      // Expected output looks like:
      //   UserShell: /bin/bash
      const prefix = 'UserShell: ';
      if (output != null && output.startsWith(prefix)) {
        defaultShell = output.substring(prefix.length).trim();
      }
    } else if (process.platform === 'linux') {
      const output = yield (0, (_process || _load_process()).runCommand)('getent', ['passwd', username]).toPromise();
      // Expected output looks like:
      //   userid:*:1000:1000:Full Name:/home/userid:/bin/bash
      defaultShell = output.substring(output.lastIndexOf(':') + 1).trim();
    }
    if (defaultShell == null || defaultShell === '') {
      return null;
    }

    // Sanity check that the file exists and is executable
    const stat = yield (_fsPromise || _load_fsPromise()).default.stat(defaultShell);
    // eslint-disable-next-line no-bitwise
    if ((stat.mode & _fs.default.constants.S_IXOTH) === 0) {
      return null;
    }

    return {
      file: defaultShell,
      args: ['-l'] };

  });return function getDefaultShellCommand() {return _ref4.apply(this, arguments);};})();

// variable defined in the original atom environment we want
// erased.
let getEnvironment = (() => {var _ref5 = (0, _asyncToGenerator.default)(

  function* (info) {
    const newEnv = Object.assign({}, (yield (0, (_process || _load_process()).getOriginalEnvironment)()));
    for (const x of filteredVariables) {
      delete newEnv[x];
    }
    return Object.assign({},
    newEnv,
    info.environment != null ? (0, (_collection || _load_collection()).objectFromMap)(info.environment) : {}, {
      TERM_PROGRAM: 'nuclide' });

  });return function getEnvironment(_x6) {return _ref5.apply(this, arguments);};})();var _fs = _interopRequireDefault(require('fs'));var _fsPromise;function _load_fsPromise() {return _fsPromise = _interopRequireDefault(require('../../../../../nuclide-commons/fsPromise'));}var _pty;function _load_pty() {return _pty = _interopRequireWildcard(require('nuclide-prebuilt-libs/pty'));}var _os = _interopRequireDefault(require('os'));var _process;function _load_process() {return _process = require('../../../../../nuclide-commons/process');}var _nuclideUri;function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../../../nuclide-commons/nuclideUri'));}var _collection;function _load_collection() {return _collection = require('../../../../../nuclide-commons/collection');}var _performanceNow;function _load_performanceNow() {return _performanceNow = _interopRequireDefault(require('../../../../../nuclide-commons/performanceNow'));}var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../../nuclide-commons/UniversalDisposable'));}var _analytics;function _load_analytics() {return _analytics = require('../../../../../nuclide-commons/analytics');}var _shellConfig;function _load_shellConfig() {return _shellConfig = require('./shellConfig');}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const filteredVariables = ['NODE_ENV', 'NODE_PATH'];

class PtyImplementation {








  constructor(info, client, command, env) {
    this._startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    this._bytesIn = 0;
    this._bytesOut = 0;
    this._initialization = {
      command: [command.file, ...command.args].join(' '),
      cwd: info.cwd != null ? info.cwd : '' };

    (0, (_analytics || _load_analytics()).track)('nuclide-pty-rpc.spawn', this._initialization);

    const subscriptions = this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const pty = this._pty = (_pty || _load_pty()).spawn(command.file, command.args, {
      name: info.terminalType,
      cwd:
      info.cwd != null ?
      (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(info.cwd) :
      (_nuclideUri || _load_nuclideUri()).default.expandHomeDir('~'),
      env });

    subscriptions.add(() => pty.destroy());
    // We need to dispose PtyClient here so that the client can GC the client.
    // (Otherwise, Nuclide's RPC framework will keep it around forever).
    // This is a bit of a weird flow where
    // 1) PtyClient gets disposed, which triggers this.dispose
    // 2) this.dispose triggers PtyClient.dispose
    // so make sure that double-disposing PtyClient is OK.
    subscriptions.add(client);
    this._client = client;

    const onOutput = this._onOutput.bind(this);
    pty.addListener('data', onOutput);
    subscriptions.add(() => pty.removeListener('data', onOutput));

    const onExit = this._onExit.bind(this);
    pty.addListener('exit', onExit);
    subscriptions.add(() => pty.removeListener('exit', onExit));
  }

  _onOutput(data) {
    this._bytesOut += data.length;
    this._client.onOutput(data);
  }

  _onExit(code, signal) {
    (0, (_analytics || _load_analytics()).track)('nuclide-pty-rpc.on-exit', Object.assign({},
    this._initialization, {
      bytesIn: String(this._bytesIn),
      bytesOut: String(this._bytesOut),
      duration: String(((0, (_performanceNow || _load_performanceNow()).default)() - this._startTime) / 1000),
      exitCode: String(code),
      signal: String(code) }));

    this._client.onExit(code, signal);
  }

  dispose() {
    this._subscriptions.dispose();
  }

  resize(columns, rows) {
    if (this._pty.writable) {
      this._pty.resize(columns, rows);
    }
  }

  writeInput(data) {
    if (this._pty.writable) {
      this._bytesIn += data.length;
      this._pty.write(data);
    }
  }}exports.PtyImplementation = PtyImplementation;