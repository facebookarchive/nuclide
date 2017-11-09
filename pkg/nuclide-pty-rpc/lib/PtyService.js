'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PtyImplementation = exports.spawn = undefined;

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

let spawn = exports.spawn = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (info, client) {
    return new PtyImplementation(info, client, (yield getCommand(info, client)), (yield getEnvironment(info)));
  });

  return function spawn(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getCommand = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (info, client) {
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
      client.onOutput(`Error reading ~/.nuclide-terminal.json:\r\n${error}\r\nStarting default '/bin/bash --login -i'\r\n`);
    }

    if (process.platform === 'win32') {
      return {
        file: 'cmd.exe',
        args: []
      };
    }

    // If no command and no local settings, default to /bin/bash --login -i.
    return {
      file: '/bin/bash',
      args: ['--login', '-i']
    };
  });

  return function getCommand(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

// variable defined in the original atom environment we want
// erased.


let getEnvironment = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (info) {
    const newEnv = Object.assign({}, (yield (0, (_process || _load_process()).getOriginalEnvironment)()));
    for (const x of filteredVariables) {
      delete newEnv[x];
    }
    return Object.assign({}, newEnv, info.environment != null ? (0, (_collection || _load_collection()).objectFromMap)(info.environment) : {}, {
      TERM_PROGRAM: 'nuclide'
    });
  });

  return function getEnvironment(_x5) {
    return _ref3.apply(this, arguments);
  };
})();

var _pty;

function _load_pty() {
  return _pty = _interopRequireWildcard(require('nuclide-prebuilt-libs/pty'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('nuclide-commons/performanceNow'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _shellConfig;

function _load_shellConfig() {
  return _shellConfig = require('./shellConfig');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const filteredVariables = ['NODE_ENV', 'NODE_PATH'];

class PtyImplementation {

  constructor(info, client, command, env) {
    this._startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    this._bytesIn = 0;
    this._bytesOut = 0;
    this._initialization = {
      command: [command.file, ...command.args].join(' '),
      cwd: info.cwd != null ? info.cwd : ''
    };
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-pty-rpc.spawn', this._initialization);

    const subscriptions = this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const pty = this._pty = (_pty || _load_pty()).spawn(command.file, command.args, {
      name: info.terminalType,
      cwd: info.cwd != null ? (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(info.cwd) : (_nuclideUri || _load_nuclideUri()).default.expandHomeDir('~'),
      env
    });
    subscriptions.add(() => pty.destroy());
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
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-pty-rpc.on-exit', Object.assign({}, this._initialization, {
      bytesIn: String(this._bytesIn),
      bytesOut: String(this._bytesOut),
      duration: String(((0, (_performanceNow || _load_performanceNow()).default)() - this._startTime) / 1000),
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