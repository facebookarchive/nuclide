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

// PRO-TIP: To debug this file, open it in Atom, and from the console, run:
//
// ```
// require('electron').ipcRenderer.send('run-package-specs',
//    atom.workspace.getActivePaneItem().getPath());
// ```
//
// This will open it in the spec runner window. Keep in mind that the main
// process will have production options set - not test options like
// `--user-data-dir`.

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _console2;

function _console() {
  return _console2 = require('console');
}

var _electron2;

function _electron() {
  return _electron2 = require('electron');
}

var _shellQuote2;

function _shellQuote() {
  return _shellQuote2 = require('shell-quote');
}

var STDOUT_FILTERS = [
// Always shows:
/^window load time: \d+ms\n$/i];

var STDERR_FILTERS = [
// If the script takes ~1sec or more, and there's another Atom window open,
// then this error gets logged. It's because we set `--user-data-dir`, and
// our process can't get a lock on the IndexedDB file.
// https://github.com/atom/atom/blob/v1.7.3/src/state-store.js#L16
/^Could not connect to indexedDB Event { isTrusted: \[Getter\] }\n$/i];

// eslint-disable-next-line no-unused-vars
var debugConsole = global.console;

// https://github.com/nodejs/node/blob/v5.1.1/lib/console.js
var outputConsole = new (_console2 || _console()).Console({ /*stdout*/
  write: function write(chunk) {
    if (!STDOUT_FILTERS.some(function (re) {
      return re.test(chunk);
    })) {
      (_electron2 || _electron()).ipcRenderer.send('write-to-stdout', chunk);
    }
  }
}, { /*stderr*/
  write: function write(chunk) {
    if (!STDERR_FILTERS.some(function (re) {
      return re.test(chunk);
    })) {
      (_electron2 || _electron()).ipcRenderer.send('write-to-stderr', chunk);
    }
  }
});

exports.default = _asyncToGenerator(function* (params) {
  var exitCode = 0;
  try {
    var atomGlobal = params.buildAtomEnvironment({
      applicationDelegate: params.buildDefaultApplicationDelegate(),
      document: document,
      window: window
    });
    atomGlobal.atomScriptMode = true;

    (0, (_assert2 || _assert()).default)(typeof process.env.FILE_ATOM_SCRIPT === 'string');
    var fileAtomScript = process.env.FILE_ATOM_SCRIPT;

    (0, (_assert2 || _assert()).default)(typeof process.env.ARGS_ATOM_SCRIPT === 'string');
    var argsAtomScript = process.env.ARGS_ATOM_SCRIPT;

    var scriptPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.resolve(fileAtomScript);
    var scriptArgs = argsAtomScript === "''" ? [] : (0, (_shellQuote2 || _shellQuote()).parse)(argsAtomScript);

    // Unfortunately we have to pollute our environment if we want to take
    // advantage of Atom's v8 cache. Ideally, we'd run the script file using
    // `vm.runInNewContext`, with the ipc bridged `console` in the new context.
    // The v8 cache is activated via a monkey-patched `Module.prototype.load`,
    // which executes code with `vm.runInThisContext`. So if you want the cache
    // you have to run in this context.
    // https://github.com/atom/atom/blob/v1.7.3/src/native-compile-cache.js#L71

    global.atom = atomGlobal;
    global.console = outputConsole;

    // $FlowIgnore
    var handler = require(scriptPath);
    exitCode = yield handler(scriptArgs);
  } catch (e) {
    outputConsole.error(e);
    exitCode = 1;
  }

  return exitCode;
});
module.exports = exports.default;