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
exports.getInstance = exports.MerlinProcessV2_5 = exports.MerlinProcessV2_3_1 = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getInstance = exports.getInstance = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (file) {
    if (merlinProcessInstance && merlinProcessInstance.isRunning()) {
      return merlinProcessInstance;
    }

    const merlinPath = getPathToMerlin();
    const flags = getMerlinFlags();

    if (!(yield isInstalled(merlinPath))) {
      return null;
    }

    const dotMerlinPath = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.merlin', file);

    const options = {
      cwd: dotMerlinPath ? (_nuclideUri || _load_nuclideUri()).default.dirname(dotMerlinPath) : '.'
    };

    logger.info('Spawning new ocamlmerlin process');
    const process = yield (0, (_process || _load_process()).safeSpawn)(merlinPath, flags, options);
    const version = yield getVersion(process);
    switch (version) {
      case '2.5.0':
        merlinProcessInstance = new MerlinProcessV2_5(process);
        break;
      case '2.3.1':
        merlinProcessInstance = new MerlinProcessV2_3_1(process);
        break;
      default:
        logger.error(`Unsupported merlin version: ${ version }`);
        return null;
    }

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

let getVersion = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (proc) {
    try {
      // TODO: Support version 3
      const result = yield runSingleCommand(proc, ['protocol', 'version', 2]);
      const match = result.merlin.match(/^The Merlin toolkit version (\d+(\.\d)*),/);
      return match != null && match[1] != null ? match[1] : '2.3.1';
    } catch (e) {
      // version 2.3.1 doesn't have a 'protocol' command and will throw
      return '2.3.1';
    }
  });

  return function getVersion(_x2) {
    return _ref5.apply(this, arguments);
  };
})();

/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */


let isInstalled = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (merlinPath) {
    if (isInstalledCache == null) {
      const result = yield (0, (_process || _load_process()).asyncExecute)('which', [merlinPath]);
      isInstalledCache = result.exitCode === 0;
      if (!isInstalledCache) {
        logger.info('ocamlmerlin not installed');
      }
    }
    return isInstalledCache;
  });

  return function isInstalled(_x3) {
    return _ref6.apply(this, arguments);
  };
})();

/**
 * Run a command; parse the json output, return an object. This assumes
 * that merlin's protocol is line-based (results are json objects rendered
 * on a single line).
 */


var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _readline = _interopRequireDefault(require('readline'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _promiseExecutors;

function _load_promiseExecutors() {
  return _promiseExecutors = require('../../commons-node/promise-executors');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

const ERROR_RESPONSES = new Set(['failure', 'error', 'exception']);

/**
 * Wraps an ocamlmerlin process; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 * Derived classes spec which version of the protocol to speak.
 */
let MerlinProcessBase = class MerlinProcessBase {

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

  runSingleCommand(command) {
    return runSingleCommand(this._proc, command);
  }

  dispose() {
    this._proc.kill();
  }
};

/**
 * Wraps an ocamlmerlin process which talks v1 protocol; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 *
 * This is based on the protocol description at:
 *   https://github.com/the-lambda-church/merlin/blob/merlin1/PROTOCOL.md
 *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
 */

let MerlinProcessV2_3_1 = exports.MerlinProcessV2_3_1 = class MerlinProcessV2_3_1 extends MerlinProcessBase {

  constructor(proc) {
    super(proc);
  }

  pushDotMerlinPath(file) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this._promiseQueue.submit(function () {
        return _this.runSingleCommand(['reset', 'dot_merlin', [file], 'auto']);
      });
    })();
  }

  pushNewBuffer(name, content) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this2._promiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        yield _this2.runSingleCommand(['reset', 'auto', // one of {ml, mli, auto}
        name]);

        // Clear the buffer.
        yield _this2.runSingleCommand(['seek', 'exact', { line: 1, col: 0 }]);
        yield _this2.runSingleCommand(['drop']);

        const result = yield _this2.runSingleCommand(['tell', 'source-eof', content]);

        return result;
      }));
    })();
  }

  locate(file, line, col, kind) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this3._promiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        const location = yield _this3.runSingleCommand(['locate',
        /* identifier name */'', kind, 'at', { line: line + 1, col: col }]);

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
      return yield _this4._promiseQueue.submit(function () {
        return _this4.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col: col }]);
      });
    })();
  }

  complete(file, line, col, prefix) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this5._promiseQueue.submit(function () {
        return _this5.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }]);
      });
    })();
  }

  errors() {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this6._promiseQueue.submit(function () {
        return _this6.runSingleCommand(['errors']);
      });
    })();
  }

  outline(path) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this7._promiseQueue.submit(function () {
        return _this7.runSingleCommand(['outline']);
      });
    })();
  }
};

/**
 * Wraps an ocamlmerlin process which talks v2 protocol; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 *
 * This is based on the protocol description at:
 *   https://github.com/the-lambda-church/merlin/blob/master/doc/dev/PROTOCOL.md
 *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
 */

let MerlinProcessV2_5 = exports.MerlinProcessV2_5 = class MerlinProcessV2_5 extends MerlinProcessBase {

  constructor(proc) {
    super(proc);
  }

  pushDotMerlinPath(file) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this8._promiseQueue.submit(function () {
        return _this8.runSingleCommand(['reset', 'dot_merlin', [file], 'auto']);
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
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this9._promiseQueue.submit(function () {
        return _this9.runSingleCommand(['tell', 'start', 'end', content]);
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
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this10._promiseQueue.submit((0, _asyncToGenerator.default)(function* () {
        const location = yield _this10.runSingleCommand(['locate',
        /* identifier name */'', kind, 'at', { line: line + 1, col: col }]);

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
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this11._promiseQueue.submit(function () {
        return _this11.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col: col }]);
      });
    })();
  }

  complete(file, line, col, prefix) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this12._promiseQueue.submit(function () {
        return _this12.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }]);
      });
    })();
  }

  errors() {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this13._promiseQueue.submit(function () {
        return _this13.runSingleCommand(['errors']);
      });
    })();
  }

  outline(path) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return yield _this14._promiseQueue.submit(function () {
        return _this14.runSingleCommand(['outline']);
      });
    })();
  }
};


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

let isInstalledCache = null;
function runSingleCommand(process, command) {
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
        logger.error('Ocamlmerlin raised an error: ' + line);
        reject(Error('Ocamlmerlin returned an error'));
        return;
      }

      resolve(content);
    });

    stdin.write(commandString);
  });
}