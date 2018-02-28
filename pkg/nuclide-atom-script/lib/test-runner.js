'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _console = require('console');

var _electron = _interopRequireDefault(require('electron'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const { ipcRenderer } = _electron.default;

if (!(ipcRenderer != null)) {
  throw new Error('Invariant violation: "ipcRenderer != null"');
}

const STDOUT_FILTERS = [
// Always shows:
/^window load time: \d+ms\n$/i];

const STDERR_FILTERS = [
// If the script takes ~1sec or more, and there's another Atom window open,
// then this error gets logged. It's because we set `--user-data-dir`, and
// our process can't get a lock on the IndexedDB file.
// https://github.com/atom/atom/blob/v1.7.3/src/state-store.js#L16
/^Could not connect to indexedDB Event { isTrusted: \[Getter] }\n$/i];

// eslint-disable-next-line no-unused-vars
const debugConsole = global.console;

// https://github.com/nodejs/node/blob/v5.1.1/lib/console.js
const outputConsole = new _console.Console({
  /* stdout */
  write(chunk) {
    if (!STDOUT_FILTERS.some(re => re.test(chunk))) {
      ipcRenderer.send('write-to-stdout', chunk);
    }
  }
}, {
  /* stderr */
  write(chunk) {
    if (!STDERR_FILTERS.some(re => re.test(chunk))) {
      ipcRenderer.send('write-to-stderr', chunk);
    }
  }
});

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (params) {
    let exitCode = 0;
    try {
      const atomGlobal = params.buildAtomEnvironment({
        applicationDelegate: params.buildDefaultApplicationDelegate(),
        document,
        window
      });
      // This is the spec runner but Nuclide code shouldn't think this is a spec.
      // (This ensures that `atom.inSpecMode()` returns false.)
      atomGlobal.specMode = false;
      atomGlobal.atomScriptMode = true;

      if (!(typeof process.env.FILE_ATOM_SCRIPT === 'string')) {
        throw new Error('Invariant violation: "typeof process.env.FILE_ATOM_SCRIPT === \'string\'"');
      }

      const fileAtomScript = process.env.FILE_ATOM_SCRIPT;

      if (!(typeof process.env.ARGS_ATOM_SCRIPT === 'string')) {
        throw new Error('Invariant violation: "typeof process.env.ARGS_ATOM_SCRIPT === \'string\'"');
      }

      const argsAtomScript = process.env.ARGS_ATOM_SCRIPT;

      const scriptPath = (_nuclideUri || _load_nuclideUri()).default.resolve(fileAtomScript);
      const scriptArgs = argsAtomScript === "''" ? [] : (0, (_string || _load_string()).shellParse)(argsAtomScript);

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
      const handler = require(scriptPath);
      if (handler.__esModule && typeof handler.default === 'function') {
        // `(0, a.b)` so that `this` is undefined, like babel does.
        exitCode = yield (0, handler.default)(scriptArgs);
      } else {
        exitCode = yield handler(scriptArgs);
      }
    } catch (e) {
      outputConsole.error(e);
      exitCode = 1;
    }

    return exitCode;
  });

  function runTest(_x) {
    return _ref.apply(this, arguments);
  }

  return runTest;
})();