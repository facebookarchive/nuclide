"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawn = spawn;
exports.useTitleAsPath = useTitleAsPath;
exports.PtyImplementation = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function ptyFactory() {
  const data = _interopRequireWildcard(require("nuclide-prebuilt-libs/pty"));

  ptyFactory = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _process() {
  const data = require("../../../../../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../../../../../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _shellConfig() {
  const data = require("./shellConfig");

  _shellConfig = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
async function spawn(info, client) {
  return new PtyImplementation(info, client, (await getCommand(info, client)), (await getEnvironment(info)));
}

async function useTitleAsPath(client) {
  try {
    const config = await (0, _shellConfig().readConfig)(); // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)

    if (config != null && config.useTitleAsPath != null) {
      return config.useTitleAsPath;
    }
  } catch (error) {
    client.onOutput(`Error reading ~/.nuclide-terminal.json:\r\n${error}\r\n`);
  }

  return false;
}

async function getCommand(info, client) {
  // Client-specified command is highest precedence.
  if (info.command != null) {
    return info.command;
  } // If no command, fall back to shell command specified in local
  // (server) config file.  This cannot be Atom config/preference,
  // since the default shell path varies between client and server.


  try {
    const config = await (0, _shellConfig().readConfig)();

    if (config != null && config.command != null) {
      return config.command;
    }
  } catch (error) {
    client.onOutput(`Error reading ~/.nuclide-terminal.json:\r\n${error}\r\n`);
  }

  try {
    const defaultShellCommand = await getDefaultShellCommand();

    if (defaultShellCommand != null) {
      return defaultShellCommand;
    }
  } catch (error) {
    client.onOutput(`Error getting default shell:\r\n${error}\r\n`);
  } // If no command and no local settings, default to /bin/bash


  return {
    file: '/bin/bash',
    args: ['-l']
  };
}

async function getDefaultShellCommand() {
  if (process.platform === 'win32') {
    return {
      file: 'cmd.exe',
      args: []
    };
  }

  const userInfo = _os.default.userInfo();

  const username = userInfo.username;
  let defaultShell = null;

  if (process.platform === 'darwin') {
    const homedir = userInfo.homedir;
    const output = await (0, _process().runCommand)('dscl', ['.', '-read', homedir, 'UserShell']).toPromise(); // Expected output looks like:
    //   UserShell: /bin/bash

    const prefix = 'UserShell: ';

    if (output != null && output.startsWith(prefix)) {
      defaultShell = output.substring(prefix.length).trim();
    }
  } else if (process.platform === 'linux') {
    const output = await (0, _process().runCommand)('getent', ['passwd', username]).toPromise(); // Expected output looks like:
    //   userid:*:1000:1000:Full Name:/home/userid:/bin/bash

    defaultShell = output.substring(output.lastIndexOf(':') + 1).trim();
  }

  if (defaultShell == null || defaultShell === '') {
    return null;
  } // Sanity check that the file exists and is executable


  const stat = await _fsPromise().default.stat(defaultShell); // eslint-disable-next-line no-bitwise

  if ((stat.mode & _fs.default.constants.S_IXOTH) === 0) {
    return null;
  }

  return {
    file: defaultShell,
    args: ['-l']
  };
} // variable defined in the original atom environment we want
// erased.


const filteredVariables = ['NODE_ENV', 'NODE_PATH'];

async function getEnvironment(info) {
  const newEnv = Object.assign({}, (await (0, _process().getOriginalEnvironment)()));

  for (const x of filteredVariables) {
    delete newEnv[x];
  }

  return Object.assign({}, newEnv, info.environment != null ? (0, _collection().objectFromMap)(info.environment) : {}, {
    TERM_PROGRAM: 'nuclide'
  });
}

class PtyImplementation {
  constructor(info, client, command, env) {
    this._startTime = (0, _performanceNow().default)();
    this._bytesIn = 0;
    this._bytesOut = 0;
    this._initialization = {
      command: [command.file, ...command.args].join(' '),
      cwd: info.cwd != null ? info.cwd : ''
    };
    (0, _analytics().track)('nuclide-pty-rpc.spawn', this._initialization);
    const subscriptions = this._subscriptions = new (_UniversalDisposable().default)();
    const pty = this._pty = ptyFactory().spawn(command.file, command.args, {
      name: info.terminalType,
      cwd: info.cwd != null ? _nuclideUri().default.expandHomeDir(info.cwd) : _nuclideUri().default.expandHomeDir('~'),
      env
    });
    subscriptions.add(() => pty.destroy()); // We need to dispose PtyClient here so that the client can GC the client.
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
    (0, _analytics().track)('nuclide-pty-rpc.on-exit', Object.assign({}, this._initialization, {
      bytesIn: String(this._bytesIn),
      bytesOut: String(this._bytesOut),
      duration: String(((0, _performanceNow().default)() - this._startTime) / 1000),
      exitCode: String(code),
      signal: String(code)
    }));

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
  }

}

exports.PtyImplementation = PtyImplementation;