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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var getInstance = _asyncToGenerator(function* (file) {
  if (merlinProcessInstance && merlinProcessInstance.isRunning()) {
    return merlinProcessInstance;
  }

  var merlinPath = getPathToMerlin();
  var flags = getMerlinFlags();

  if (!(yield isInstalled(merlinPath))) {
    return null;
  }

  var dotMerlinPath = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.merlin', file);

  var options = {
    cwd: dotMerlinPath ? (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(dotMerlinPath) : '.'
  };

  logger.info('Spawning new ocamlmerlin process');
  var process = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)(merlinPath, flags, options);
  merlinProcessInstance = new MerlinProcess(process);

  if (dotMerlinPath) {
    // TODO(pieter) add support for multiple .dotmerlin files
    yield merlinProcessInstance.pushDotMerlinPath(dotMerlinPath);
    logger.debug('Added .merlin path: ' + dotMerlinPath);
  }

  return merlinProcessInstance;
}

/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */
);

exports.getInstance = getInstance;

var isInstalled = _asyncToGenerator(function* (merlinPath) {
  if (isInstalledCache == null) {
    var result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)('which', [merlinPath]);
    isInstalledCache = result.exitCode === 0;
    if (!isInstalledCache) {
      logger.info('ocamlmerlin not installed');
    }
  }
  return isInstalledCache;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _readline2;

function _readline() {
  return _readline2 = _interopRequireDefault(require('readline'));
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _commonsNodePromiseExecutors2;

function _commonsNodePromiseExecutors() {
  return _commonsNodePromiseExecutors2 = require('../../commons-node/promise-executors');
}

var logger = require('../../nuclide-logging').getLogger();

var ERROR_RESPONSES = new Set(['failure', 'error', 'exception']);

/**
 * Wraps an ocamlmerlin process; provides api access to
 * ocamlmerlin's json-over-stdin/stdout protocol.
 *
 * This is based on the protocol description at:
 *   https://github.com/the-lambda-church/merlin/blob/master/doc/dev/PROTOCOL.md
 *   https://github.com/the-lambda-church/merlin/tree/master/src/frontend
 */

var MerlinProcess = (function () {
  function MerlinProcess(proc) {
    var _this = this;

    _classCallCheck(this, MerlinProcess);

    this._proc = proc;
    this._promiseQueue = new (_commonsNodePromiseExecutors2 || _commonsNodePromiseExecutors()).PromiseQueue();
    this._running = true;
    this._proc.on('exit', function (code, signal) {
      _this._running = false;
    });
  }

  _createClass(MerlinProcess, [{
    key: 'isRunning',
    value: function isRunning() {
      return this._running;
    }

    /**
     * Tell merlin where to find its per-repo .merlin config file.
     *
     * Configuration file format description:
     *   https://github.com/the-lambda-church/merlin/wiki/project-configuration
     *
     * @return a dummy cursor position on success
     */
  }, {
    key: 'pushDotMerlinPath',
    value: _asyncToGenerator(function* (file) {
      var _this2 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        var result = yield _this2.runSingleCommand(['reset', 'dot_merlin', [file], 'auto']);
        resolve(result);
      }));
    })

    /**
     * Set the buffer content to query against. Merlin uses an internal
     * buffer (name + content) that is independent from file content on
     * disk.
     *
     * @return on success: a cursor position pointed at the end of the buffer
     */
  }, {
    key: 'pushNewBuffer',
    value: _asyncToGenerator(function* (name, content) {
      var _this3 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        yield _this3.runSingleCommand(['reset', 'auto', // one of {ml, mli, auto}
        name]);

        // Clear the buffer.
        yield _this3.runSingleCommand(['seek', 'exact', { line: 1, col: 0 }]);
        yield _this3.runSingleCommand(['drop']);

        var result = yield _this3.runSingleCommand(['tell', 'source-eof', content]);
        resolve(result);
      }));
    })

    /**
     * Find definition
     *
     * `kind` is one of 'ml' or 'mli'
     *
     * Note: ocamlmerlin line numbers are 1-based.
     * @return null if nothing was found; a position of the form
     *   {"file": "somepath", "pos": {"line": 41, "col": 5}}.
     */
  }, {
    key: 'locate',
    value: _asyncToGenerator(function* (file, line, col, kind) {
      var _this4 = this;

      return yield this._promiseQueue.submit(_asyncToGenerator(function* (resolve, reject) {
        var location = yield _this4.runSingleCommand(['locate',
        /* identifier name */'', kind, 'at', { line: line + 1, col: col }]);

        if (typeof location === 'string') {
          return reject(Error(location));
        }

        // Ocamlmerlin doesn't include a `file` field at all if the destination is
        // in the same file.
        if (!location.file) {
          location.file = file;
        }

        resolve(location);
      }));
    })
  }, {
    key: 'enclosingType',
    value: _asyncToGenerator(function* (file, line, col) {
      var _this5 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this5.runSingleCommand(['type', 'enclosing', 'at', { line: line + 1, col: col }]).then(resolve).catch(reject);
      });
    })
  }, {
    key: 'complete',
    value: _asyncToGenerator(function* (file, line, col, prefix) {
      var _this6 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this6.runSingleCommand(['complete', 'prefix', prefix, 'at', { line: line + 1, col: col + 1 }]).then(resolve).catch(reject);
      });
    })
  }, {
    key: 'errors',
    value: _asyncToGenerator(function* () {
      var _this7 = this;

      return yield this._promiseQueue.submit(function (resolve, reject) {
        _this7.runSingleCommand(['errors']).then(resolve).catch(reject);
      });
    })

    /**
     * Run a command; parse the json output, return an object. This assumes
     * that merlin's protocol is line-based (results are json objects rendered
     * on a single line).
     */
  }, {
    key: 'runSingleCommand',
    value: function runSingleCommand(command) {
      var commandString = JSON.stringify(command);
      var stdin = this._proc.stdin;
      var stdout = this._proc.stdout;

      return new Promise(function (resolve, reject) {
        var reader = (_readline2 || _readline()).default.createInterface({
          input: stdout,
          terminal: false
        });

        reader.on('line', function (line) {
          reader.close();
          var response = undefined;
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

          var status = response[0];
          var content = response[1];

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
  }, {
    key: 'dispose',
    value: function dispose() {
      this._proc.kill();
    }
  }]);

  return MerlinProcess;
})();

exports.MerlinProcess = MerlinProcess;

var merlinProcessInstance = undefined;

function getPathToMerlin() {
  return global.atom && global.atom.config.get('nuclide.nuclide-ocaml.pathToMerlin') || 'ocamlmerlin';
}

/**
 * @return The set of arguments to pass to ocamlmerlin.
 */
function getMerlinFlags() {
  var configVal = global.atom && global.atom.config.get('nuclide.nuclide-ocaml.merlinFlags');
  // To split while stripping out any leading/trailing space, we match on all
  // *non*-whitespace.
  var configItems = configVal && configVal.match(/\S+/g);
  return configItems || [];
}

var isInstalledCache = null;