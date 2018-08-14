"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _string() {
  const data = require("../../../modules/nuclide-commons/string");

  _string = function () {
    return data;
  };

  return data;
}

var _console = require("console");

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
// Redirect `console` to output through to stdout/stderr.
const outputConsole = new _console.Console(process.stdout, process.stderr);

var runTest = async function runTest(params) {
  let exitCode = 0;

  try {
    const atomGlobal = params.buildAtomEnvironment({
      applicationDelegate: params.buildDefaultApplicationDelegate(),
      document,
      window
    }); // This is the spec runner but Nuclide code shouldn't think this is a spec.
    // (This ensures that `atom.inSpecMode()` returns false.)

    atomGlobal.specMode = false;
    atomGlobal.atomScriptMode = true;

    if (!(typeof process.env.FILE_ATOM_SCRIPT === 'string')) {
      throw new Error("Invariant violation: \"typeof process.env.FILE_ATOM_SCRIPT === 'string'\"");
    }

    const fileAtomScript = process.env.FILE_ATOM_SCRIPT;

    if (!(typeof process.env.ARGS_ATOM_SCRIPT === 'string')) {
      throw new Error("Invariant violation: \"typeof process.env.ARGS_ATOM_SCRIPT === 'string'\"");
    }

    const argsAtomScript = process.env.ARGS_ATOM_SCRIPT;

    const scriptPath = _nuclideUri().default.resolve(fileAtomScript);

    const scriptArgs = argsAtomScript === "''" ? [] : (0, _string().shellParse)(argsAtomScript); // Unfortunately we have to pollute our environment if we want to take
    // advantage of Atom's v8 cache. Ideally, we'd run the script file using
    // `vm.runInNewContext`, with the ipc bridged `console` in the new context.
    // The v8 cache is activated via a monkey-patched `Module.prototype.load`,
    // which executes code with `vm.runInThisContext`. So if you want the cache
    // you have to run in this context.
    // https://github.com/atom/atom/blob/v1.7.3/src/native-compile-cache.js#L71

    global.atom = atomGlobal;
    global.console = outputConsole; // $FlowIgnore

    const handler = require(scriptPath);

    if (handler.__esModule && typeof handler.default === 'function') {
      // `(0, a.b)` so that `this` is undefined, like babel does.
      exitCode = await (0, handler.default)(scriptArgs);
    } else {
      exitCode = await handler(scriptArgs);
    }
  } catch (e) {
    outputConsole.error(e);
    exitCode = 1;
  } // process.stdout may be asynchronous if we're piping the output somewhere else.
  // Make sure we've finished writing everything before exiting.


  await new Promise(resolve => {
    // $FlowIssue
    process.stdout.end(() => resolve());
  });
  return exitCode;
};

exports.default = runTest;