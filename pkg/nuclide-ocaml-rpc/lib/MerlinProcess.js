'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInstance = exports.MerlinProcessV2_5 = exports.MerlinProcessV2_3_1 = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getInstance = exports.getInstance = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (file) {
    if (yield (0, (_OCamlService || _load_OCamlService()).getUseLspConnection)()) {
      return null;
    }

    if (merlinProcessInstance && merlinProcessInstance.isRunning()) {
      return merlinProcessInstance;
    }

    const merlinPath = getPathToMerlin();
    const flags = getMerlinFlags();

    const version = yield getMerlinVersion(merlinPath);
    if (version === null) {
      return null;
    }

    const dotMerlinPath = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.merlin', file);

    const options = {
      // flowlint-next-line sketchy-null-string:off
      cwd: dotMerlinPath ? (_nuclideUri || _load_nuclideUri()).default.dirname(dotMerlinPath) : '.',
      // Starts the process with the user's bashrc, which might contain a
      // different ocamlmerlin. See `getMerlinVersion` for the same consistent
      // logic. This also implies .nucliderc isn't considered, if there's any
      // extra override; to simulate the same behavior, do this in your bashrc:
      // if [ "$TERM" = "nuclide"]; then someOverrideLogic if
      env: yield (0, (_process || _load_process()).getOriginalEnvironment)()
    };

    logger.info('Spawning new ocamlmerlin process version ' + version);
    const processStream = (0, (_process || _load_process()).spawn)(merlinPath, flags, options).publish();
    const processPromise = processStream.take(1).toPromise();
    processStream.connect();
    const process = yield processPromise;
    // Turns 2.5.1 into 2.5
    const majorMinor = version.split('.').slice(0, 2).join('.');
    switch (majorMinor) {
      case '2.5':
        merlinProcessInstance = new MerlinProcessV2_5(process);
        break;
      case '2.3':
        merlinProcessInstance = new MerlinProcessV2_3_1(process);
        break;
      default:
        logger.error(`Unsupported merlin version: ${version}`);
        return null;
    }

    // flowlint-next-line sketchy-null-string:off
    if (dotMerlinPath) {
      // TODO(pieter) add support for multiple .dotmerlin files
      yield merlinProcessInstance.pushDotMerlinPath(dotMerlinPath);
      logger.debug('Added .merlin path: ' + dotMerlinPath);
    }

    return merlinProcessInstance;
  });

  return function getInstance(_x) {
    return _ref4.apply(this, arguments);
  };
})();

/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */


let getMerlinVersion = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (merlinPath) {
    if (merlinVersionCache === undefined) {
      let stdout;
      try {
        stdout = yield (0, (_process || _load_process()).runCommand)(merlinPath, ['-version'], {
          env: yield (0, (_process || _load_process()).getOriginalEnvironment)()
        }).toPromise();
      } catch (err) {
        logger.info('ocamlmerlin not installed');
        merlinVersionCache = null;
        return merlinVersionCache;
      }
      const match = stdout.match(/^The Merlin toolkit version (\d+(?:\.\d)*),/);
      if (match != null && match[1] != null) {
        merlinVersionCache = match[1];
      } else {
        logger.info('unable to determine ocamlmerlin version');
        merlinVersionCache = null;
      }
    }
    return merlinVersionCache;
  });

  return function getMerlinVersion(_x2) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * Run a command; parse the json output, return an object. This assumes
 * that merlin's protocol is line-based (results are json objects rendered
 * on a single line).
 */


var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _readline = _interopRequireDefault(require('readline'));

var _OCamlService;

function _load_OCamlService() {
  return _OCamlService = require('./OCamlService');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-ocaml-rpc'); /**
                                                                                 * Copyright (c) 2015-present, Facebook, Inc.
                                                                                 * All rights reserved.
                                                                                 *
                                                                                 * This source code is licensed under the license found in the LICENSE file in
                                                                                 * the root directory of this source tree.
                                                                                 *
                                                                                 * 
                                                                                 * @format
                                                                                 */

const ERROR_RESPONSES = new Set(['failure', 'error', 'exception']);

/**
 * Wraps an ocamlmerlin process; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 * Derived classes spec which version of the protocol to speak.
 */


class MerlinProcessBase {

  constructor(proc) {
    this._proc = proc;
    this._promiseQueue = new (_promiseExecutors || _load_promiseExecutors()).PromiseQueue();
    this._running = true;
    this._proc.on('exit', (code, signal) => {
      this._running = false;
    });
  }

  isRunning() {
    return this._running;
  }

  dispose() {
    this._proc.kill();
  }
}

/**
 * Wraps an ocamlmerlin process which talks v1 protocol; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 *
 * This is based on the protocol description at:
 *   https://github.com/the-lambda-church/merlin/blob/merlin1/PROTOCOL.md
 *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
 */
class MerlinProcessV2_3_1 extends MerlinProcessBase {
  constructor(proc) {
    super(proc);
  }

  runSingleCommand(command, file) {
    // v2.3.x don't support Reason, so the file path isn't used; it's used by
    // v2.5.1+ though, so we have the variable here for typing consistency
    // purpose.
    return runSingleCommandImpl(this._proc, command);
  }

  pushDotMerlinPath(file) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._promiseQueue.submit(function () {
        return _this.runSingleCommand(['reset', 'dot_merlin', [file], 'auto'], file);
      });
    })();
  }

  pushNewBuffer(name, content) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this2._promiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        yield _this2.runSingleCommand(['reset', 'auto', name], name);
        // Clear the buffer.
        yield _this2.runSingleCommand(['seek', 'exact', { line: 1, col: 0 }], name);
        yield _this2.runSingleCommand(['drop'], name);

        const result = yield _this2.runSingleCommand(['tell', 'source-eof', content], name);

        return result;
      }));
    })();
  }

  locate(file, line, col, kind) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this3._promiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        const location = yield _this3.runSingleCommand(['locate', /* identifier name */'', kind, 'at', { line: line + 1, col }], file);

        if (typeof location === 'string') {
          throw new Error(location);
        }

        // Ocamlmerlin doesn't include a `file` field at all if the destination is
        // in the same file.
        if (!location.file) {
          location.file = file;
        }

        return location;
      }));
    })();
  }

  enclosingType(file, line, col) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this4._promiseQueue.submit(function () {
        return _this4.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col }], file);
      });
    })();
  }

  complete(file, line, col, prefix) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this5._promiseQueue.submit(function () {
        return _this5.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }], file);
      });
    })();
  }

  errors(path) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this6._promiseQueue.submit(function () {
        return _this6.runSingleCommand(['errors'], path);
      });
    })();
  }

  outline(path) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this7._promiseQueue.submit(function () {
        return _this7.runSingleCommand(['outline'], path);
      });
    })();
  }

  cases(path, start, end) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this8._promiseQueue.submit(function () {
        return _this8.runSingleCommand(['case', 'analysis', 'from', start, 'to', end], path);
      });
    })();
  }

  occurrences(path, line, col) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this9._promiseQueue.submit(function () {
        return _this9.runSingleCommand(['occurrences', 'ident', 'at', { line: line + 1, col: col + 1 }], path);
      });
    })();
  }
}

exports.MerlinProcessV2_3_1 = MerlinProcessV2_3_1; /**
                                                    * Wraps an ocamlmerlin process which talks v2 protocol; provides api access to
                                                    * ocamlmerlin's json-over-stdin/stdout protocol.
                                                    *
                                                    * This is based on the protocol description at:
                                                    *   https://github.com/the-lambda-church/merlin/blob/master/doc/dev/PROTOCOL.md
                                                    *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
                                                    */

class MerlinProcessV2_5 extends MerlinProcessBase {
  constructor(proc) {
    super(proc);
  }

  runSingleCommand(command, file, wrapForContext) {
    // contextify is important needed for Reason support.
    // https://github.com/the-lambda-church/merlin/blob/d98a08d318ca14d9c702bbd6eeadbb762d325ce7/doc/dev/PROTOCOL.md#contextual-commands
    const wrappedCommand = wrapForContext === false ? command : { query: command, context: ['auto', file] };
    return runSingleCommandImpl(this._proc, wrappedCommand);
  }

  pushDotMerlinPath(file) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this10._promiseQueue.submit(function () {
        return _this10.runSingleCommand(['reset', 'dot_merlin', [file], 'auto'], file, false);
      });
    })();
  }

  /**
   * Set the buffer content to query against. Merlin uses an internal
   * buffer (name + content) that is independent from file content on
   * disk.
   *
   * @return on success: a cursor position pointed at the end of the buffer
   */
  pushNewBuffer(name, content) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this11._promiseQueue.submit(function () {
        return _this11.runSingleCommand(['tell', 'start', 'end', content], name);
      });
    })();
  }

  /**
   * Find definition
   *
   * `kind` is one of 'ml' or 'mli'
   *
   * Note: ocamlmerlin line numbers are 1-based.
   * @return null if nothing was found; a position of the form
   *   {"file": "somepath", "pos": {"line": 41, "col": 5}}.
   */
  locate(file, line, col, kind) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this12._promiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        const location = yield _this12.runSingleCommand(['locate', /* identifier name */'', kind, 'at', { line: line + 1, col }], file);

        if (typeof location === 'string') {
          throw new Error(location);
        }

        // Ocamlmerlin doesn't include a `file` field at all if the destination is
        // in the same file.
        if (!location.file) {
          location.file = file;
        }

        return location;
      }));
    })();
  }

  enclosingType(file, line, col) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this13._promiseQueue.submit(function () {
        return _this13.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col }], file);
      });
    })();
  }

  complete(file, line, col, prefix) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this14._promiseQueue.submit(function () {
        return _this14.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }], file);
      });
    })();
  }

  errors(path) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this15._promiseQueue.submit(function () {
        return _this15.runSingleCommand(['errors'], path);
      });
    })();
  }

  outline(path) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this16._promiseQueue.submit(function () {
        return _this16.runSingleCommand(['outline'], path);
      });
    })();
  }

  cases(path, start, end) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this17._promiseQueue.submit(function () {
        return _this17.runSingleCommand(['case', 'analysis', 'from', start, 'to', end], path);
      });
    })();
  }

  occurrences(path, line, col) {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // $FlowFixMe: runSingleCommand returns `Promise<Object>`, should me mixed.
      return _this18._promiseQueue.submit(function () {
        return _this18.runSingleCommand(['occurrences', 'ident', 'at', { line: line + 1, col: col + 1 }], path);
      });
    })();
  }
}

exports.MerlinProcessV2_5 = MerlinProcessV2_5;
let merlinProcessInstance;

function getPathToMerlin() {
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToMerlin') || 'ocamlmerlin';
}

/**
 * @return The set of arguments to pass to ocamlmerlin.
 */
function getMerlinFlags() {
  const configVal = global.atom && global.atom.config.get('nuclide.nuclide-ocaml.merlinFlags');
  // To split while stripping out any leading/trailing space, we match on all
  // *non*-whitespace.
  const configItems = configVal && configVal.match(/\S+/g);
  return configItems || [];
}

let merlinVersionCache;
function runSingleCommandImpl(process, command) {
  const commandString = JSON.stringify(command);
  const stdin = process.stdin;
  const stdout = process.stdout;

  return new Promise((resolve, reject) => {
    const reader = _readline.default.createInterface({
      input: stdout,
      terminal: false
    });

    reader.on('line', line => {
      reader.close();
      let response;
      try {
        response = JSON.parse(line);
      } catch (err) {
        response = null;
      }
      if (!response || !Array.isArray(response) || response.length !== 2) {
        logger.error('Unexpected response from ocamlmerlin: ${line}');
        reject(Error('Unexpected ocamlmerlin output format'));
        return;
      }

      const status = response[0];
      const content = response[1];

      if (ERROR_RESPONSES.has(status)) {
        logger.error(`Ocamlmerlin raised an error: ${line}\n  command: ${commandString}`);
        reject(Error('Ocamlmerlin returned an error'));
        return;
      }

      resolve(content);
    });

    stdin.write(commandString);
  });
}