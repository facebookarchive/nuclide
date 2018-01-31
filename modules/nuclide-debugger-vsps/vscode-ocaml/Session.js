'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Session = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _OCamlDebugProxy;

function _load_OCamlDebugProxy() {
  return _OCamlDebugProxy = require('./OCamlDebugProxy');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _url = _interopRequireDefault(require('url'));

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

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

function uriToModuleName(uri) {
  const pathname = uri.startsWith('file://') ? _url.default.parse(uri).pathname : uri;

  if (!(pathname != null && pathname !== '')) {
    throw new Error('Invariant violation: "pathname != null && pathname !== \'\'"');
  }

  const fileName = (_nuclideUri || _load_nuclideUri()).default.basename(pathname).replace(/\.[^.]+$/, '');
  return fileName.charAt(0).toUpperCase() + fileName.substr(1);
}

function extractList(text, prefix, keepLines, empty, f) {
  const i = text.indexOf(prefix);
  if (i < 0) {
    return empty;
  }
  const t = text.substr(i + prefix.length);
  const parts = keepLines ? t.split(/\r?\n/g) : t.replace(/[\s\r\n]+/g, ' ').split(' ');
  const list = parts.map(s => s.trim()).filter(s => s.length > 0);
  return f(list);
}

class Lock {

  constructor() {
    this._inner = Promise.resolve(0);
    this._expected = 0;
  }

  enter() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const curCount = yield _this._inner;
      if (curCount !== _this._expected) {
        // Sometimes we get multiple Promises waiting on the same _inner, so if we
        // detect that we're stale start waiting again.
        return _this.enter();
      }

      let e;
      _this._inner = new Promise(function (resolve) {
        _this._expected++;
        e = function () {
          return resolve(_this._expected);
        };
      });
      return { exitLock: function () {
          return e();
        } };
    })();
  }
}

class Session {

  constructor(debugProxy, modules, onBreakpointHit, onProgramExit) {
    this._debugProxy = debugProxy;
    this._modules = modules;
    this._onProgramExit = onProgramExit;
    this._onBreakpointHit = onBreakpointHit;

    this._shortNamesToPaths = new Map();
    this._breakpoints = new Map();
    this._paused = true;
    this._lock = new Lock();
  }

  getStack() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const output = yield _this2._send('backtrace');
      return extractList(output, 'Backtrace:', true, [], function (lines) {
        const frames = [];
        for (const line of lines) {
          const m = /#(\d+) ([^\s]+) ([^:]+):(\d+):(\d+)/.exec(line);
          if (m) {
            // We generally have a result for _shortNamesToPaths when running
            // locally, and generally don't when running remotely.
            const path = _this2._shortNamesToPaths.get(m[3]) || m[3];
            frames.push({
              id: Number(m[1]),
              name: m[2],
              moduleId: m[2],
              line: Number(m[4]),
              column: Number(m[5]),
              source: {
                path
              }
            });
          }
        }
        return frames;
      });
    })();
  }

  stepOver() {
    return this._step('next');
  }

  stepOut() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this3._step('finish');
    })();
  }

  stepInto() {
    return this._step('step 1');
  }

  evaluate(frameId, expr) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this4._runWithLock((0, _asyncToGenerator.default)(function* () {
        if (frameId != null) {
          yield _this4._send(`frame ${frameId}`);
        }

        const result = yield _this4._send(`print (${expr})`);
        const i = result.indexOf(':');
        return i >= 0 ? result.substr(i + 1).trim() : result;
      }));
    })();
  }

  _step(command) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this5._send(command);
    })();
  }

  setBreakpointsByUri(breakpoints, uri, shortname) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const mapFailedBreakpoint = function (bp) {
        return {
          line: bp.line,
          column: bp.column,
          verified: false
        };
      };

      // The count of returned breakpoints must always equal the count of
      // requested breakpoints, so instead of returning an empty list if something
      // goes wrong we just have to return a bunch of unverified breakpoints.
      if (uri == null || shortname == null) {
        (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.error(`Could not set breakpoint: ${JSON.stringify({ uri, shortname })}.`);
        return breakpoints.map(mapFailedBreakpoint);
      }

      const moduleName = uriToModuleName(uri);
      if (!_this6._modules.has(moduleName)) {
        (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.error(`Could not set breakpoint: ${moduleName} is not part of the executable.`);
        return breakpoints.map(mapFailedBreakpoint);
      }

      const existingBreakpoints = _this6._breakpoints.get(uri);
      if (existingBreakpoints) {
        yield Promise.all(existingBreakpoints.map(_this6.deleteBreakpoint.bind(_this6)));
      }

      _this6._shortNamesToPaths.set(shortname, uri);
      const breakpointsPromise = breakpoints.map((() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (bp) {
          return _this6._pauseAndLock((0, _asyncToGenerator.default)(function* () {
            const result = yield _this6._send(`break @${moduleName} ${bp.line}`);
            (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(result);
            const m = /^Breakpoint (\d+) at \d+: file (.+), line (\d+), characters (\d+)-(\d+)$/m.exec(result);
            if (m) {
              return {
                id: Number(m[1]),
                line: Number(m[3]),
                column: Number(m[4]),
                verified: true
              };
            }

            return mapFailedBreakpoint(bp);
          }));
        });

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      })());

      const breakpointsToReturn = yield Promise.all(breakpointsPromise);
      _this6._breakpoints.set(uri, breakpointsToReturn);

      return breakpointsToReturn;
    })();
  }

  deleteBreakpoint(breakpoint) {
    var _this7 = this;

    const breakpointId = breakpoint.id;
    if (breakpointId != null) {
      return this._pauseAndLock((0, _asyncToGenerator.default)(function* () {
        yield _this7._send(`delete ${breakpointId}`);
      }));
    }

    return Promise.resolve();
  }

  pause() {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this8._paused) {
        return true;
      }
      if (_this8._disposeOnBreakListener) {
        _this8._disposeOnBreakListener();
        _this8._disposeOnBreakListener = null;
      }
      yield _this8._debugProxy.pause();
      _this8._paused = true;
      return false;
    })();
  }

  resume() {
    this._paused = false;
    this._disposeOnBreakListener = this._debugProxy.attachOnPromptListener(output => {
      const lines = output.replace(/\r?\n/g, '\n').split('\n').filter(l => l.length > 0).reverse();
      const handleEvent = (breakpointId, error) => {
        this._runWithLock(() => {
          this._paused = true;
          if (breakpointId != null) {
            return this._onBreakpointHit(breakpointId);
          } else {
            return this._onProgramExit(error);
          }
        });
      };
      for (const line of lines) {
        let m = /^Unhandled exception: (.+)$/.exec(line);
        if (m) {
          return handleEvent(undefined, m[1]);
        }
        if (line === 'Program end.') {
          return handleEvent(undefined, undefined);
        }
        m = /^Breakpoint: (\d+)/.exec(line);
        if (m) {
          return handleEvent(m[1], undefined);
        }
      }
    });
    this._debugProxy.resume();
  }

  dispose() {
    if (this._debugProxy) {
      this._debugProxy.kill();
    }
  }

  _runWithLock(f) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { exitLock } = yield _this9._lock.enter();
      try {
        return yield f();
      } finally {
        exitLock();
      }
    })();
  }

  _pauseAndLock(f) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this10._runWithLock((0, _asyncToGenerator.default)(function* () {
        const wasPaused = yield _this10.pause();
        try {
          return yield f();
        } finally {
          if (!wasPaused) {
            _this10.resume();
          }
        }
      }));
    })();
  }

  static _startOcamlDebug(startInfo, onProgramExit) {
    return (0, _asyncToGenerator.default)(function* () {
      const debuggerArguments = [];
      for (const includeDir of startInfo.includeDirectories) {
        debuggerArguments.push('-I', includeDir);
      }

      if (startInfo.workingDirectory) {
        debuggerArguments.push('-cd', startInfo.workingDirectory);
      }

      // Path of the executable to debug is optional because there are some
      // scripts in fbcode that execute ocamldebug with the correct arguments and
      // executable path, and we want to support executing those directly.
      if (startInfo.executablePath.trim().length > 0) {
        const executablePath = startInfo.executablePath;
        debuggerArguments.push(executablePath);
      }

      const command = startInfo.ocamldebugExecutable !== '' ? startInfo.ocamldebugExecutable : 'ocamldebug';
      debuggerArguments.push(...startInfo.arguments);

      const ocamlDebug = new (_OCamlDebugProxy || _load_OCamlDebugProxy()).OCamlDebugProxy(command, debuggerArguments, function (result) {
        onProgramExit(result.kind === 'finished' ? null : result.message);
      });

      yield ocamlDebug.waitForPrompt();
      yield ocamlDebug.send('goto 0');
      return ocamlDebug;
    })();
  }

  static start(startInfo, onBreakpointHit, onProgramExit) {
    return (0, _asyncToGenerator.default)(function* () {
      const ocamlDebug = yield Session._startOcamlDebug(startInfo, onProgramExit);

      const modulesText = yield ocamlDebug.send('info modules');
      (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.verbose(`MODULES ${modulesText}`);
      return new Session(ocamlDebug, Session._extractModules(modulesText), onBreakpointHit, onProgramExit);
    })();
  }

  _send(command) {
    return this._debugProxy.send(command);
  }

  static _extractModules(modulesText) {
    return extractList(modulesText, 'Used modules:', false, new Set(), l => l.reduce((acc, v) => {
      acc.add(v);
      return acc;
    }, new Set()));
  }
}
exports.Session = Session;