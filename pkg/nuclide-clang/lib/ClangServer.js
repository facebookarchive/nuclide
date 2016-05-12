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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _findClangServerArgs = _asyncToGenerator(function* () {
  var findClangServerArgs = undefined;
  try {
    findClangServerArgs = require('./fb/find-clang-server-args');
  } catch (e) {
    // Ignore.
  }

  var libClangLibraryFile = undefined;
  if (process.platform === 'darwin') {
    var result = yield (0, (_nuclideCommons2 || _nuclideCommons()).checkOutput)('xcode-select', ['--print-path']);
    if (result.exitCode === 0) {
      libClangLibraryFile = result.stdout.trim() + '/Toolchains/XcodeDefault.xctoolchain/usr/lib/libclang.dylib';
    }
  }

  var clangServerArgs = {
    libClangLibraryFile: libClangLibraryFile,
    pythonExecutable: 'python',
    pythonPathEnv: (_path2 || _path()).default.join(__dirname, '../pythonpath')
  };
  if (typeof findClangServerArgs === 'function') {
    var clangServerArgsOverrides = yield findClangServerArgs();
    return _extends({}, clangServerArgs, clangServerArgsOverrides);
  } else {
    return clangServerArgs;
  }
});

var augmentDefaultFlags = _asyncToGenerator(function* (src, flags) {
  if (getDefaultFlags === undefined) {
    getDefaultFlags = null;
    try {
      getDefaultFlags = require('./fb/get-default-flags');
    } catch (e) {
      // Open-source version
    }
  }
  if (getDefaultFlags != null) {
    return flags.concat((yield getDefaultFlags(src)));
  }
  return flags;
});

// List of supported methods. Keep in sync with the Python server.

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

var _split2;

function _split() {
  return _split2 = _interopRequireDefault(require('split'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _nuclideCommons2;

function _nuclideCommons() {
  return _nuclideCommons2 = require('../../nuclide-commons');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

// Do not tie up the Buck server continuously retrying for flags.
var FLAGS_RETRY_LIMIT = 2;

// Mac OS X (El Capitan) prints this warning when loading the libclang library.
// It's not silenceable and has no effect, so just ignore it.
var DYLD_WARNING = 'dyld: warning, LC_RPATH';

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();
var pathToLibClangServer = (_path2 || _path()).default.join(__dirname, '../python/clang_server.py');

var getDefaultFlags = undefined;

var ClangServer = (function () {
  function ClangServer(clangFlagsManager, src) {
    _classCallCheck(this, ClangServer);

    this._src = src;
    this._clangFlagsManager = clangFlagsManager;
    this._emitter = new (_events2 || _events()).EventEmitter();
    this._nextRequestId = 0;
    this._lastProcessedRequestId = -1;
    this._pendingCompileRequests = 0;
    this._getAsyncConnection = (_nuclideCommons2 || _nuclideCommons()).promises.serializeAsyncCall(this._getAsyncConnectionImpl.bind(this));
    this._disposed = false;
    this._flagsRetries = 0;
    this._flagsChanged = false;
    this._flagsChangedSubscription = null;
  }

  _createClass(ClangServer, [{
    key: 'dispose',
    value: function dispose() {
      this._disposed = true;
      this._cleanup();
    }

    /**
     * Returns RSS of the child process in bytes.
     * Works on Unix and Mac OS X.
     */
  }, {
    key: 'getMemoryUsage',
    value: _asyncToGenerator(function* () {
      if (this._asyncConnection == null) {
        return 0;
      }

      var _ref = yield (0, (_nuclideCommons2 || _nuclideCommons()).checkOutput)('ps', ['-p', this._asyncConnection.process.pid.toString(), '-o', 'rss=']);

      var exitCode = _ref.exitCode;
      var stdout = _ref.stdout;

      if (exitCode !== 0) {
        return 0;
      }
      return parseInt(stdout, 10) * 1024; // ps returns KB
    })
  }, {
    key: '_cleanup',
    value: function _cleanup() {
      // Fail all pending requests.
      // The Clang server receives requests serially via stdin (and processes them in that order)
      // so it's quite safe to assume that requests are processed in order.
      for (var reqid = this._lastProcessedRequestId + 1; reqid < this._nextRequestId; reqid++) {
        this._emitter.emit(reqid.toString(16), { error: 'Server was killed.' });
      }
      if (this._asyncConnection) {
        this._asyncConnection.dispose();
      }
      this._emitter.removeAllListeners();
      if (this._flagsChangedSubscription != null) {
        this._flagsChangedSubscription.unsubscribe();
        this._flagsChangedSubscription = null;
      }
    }
  }, {
    key: 'getFlags',
    value: function getFlags() {
      var _this = this;

      if (this._flagsPromise != null) {
        return this._flagsPromise;
      }
      this._flagsPromise = this._clangFlagsManager.getFlagsForSrc(this._src).then(function (result) {
        if (result) {
          _this._flagsChangedSubscription = result.changes.subscribe(function () {
            _this._flagsChanged = true;
          }, function () {
            // Will be automatically unsubscribed here.
            _this._flagsChangedSubscription = null;
          });
          return result.flags;
        }
        return null;
      }, function (e) {
        logger.error('clang-server: Could not get flags for ' + _this._src + ' (retry ' + _this._flagsRetries + ')', e);
        if (_this._flagsRetries < FLAGS_RETRY_LIMIT) {
          _this._flagsPromise = null;
          _this._flagsRetries++;
        }
      });
      return this._flagsPromise;
    }
  }, {
    key: 'getFlagsChanged',
    value: function getFlagsChanged() {
      return this._flagsChanged;
    }

    /**
     * Send a request to the Clang server.
     * Requests are processed serially and strictly in order.
     * If the server is currently compiling, all other requests will automatically return null
     * (unless the `blocking` parameter is explicitly provided).
     */
  }, {
    key: 'makeRequest',
    value: _asyncToGenerator(function* (method, defaultFlags, params, blocking) {
      (0, (_assert2 || _assert()).default)(!this._disposed, 'calling makeRequest on a disposed ClangServer');
      if (method === 'compile') {
        this._pendingCompileRequests++;
      } else if (!blocking && this._pendingCompileRequests) {
        // All non-blocking requests should instantly fail.
        // This allows the client to fall back to default autocomplete, ctags, etc.
        return null;
      }
      try {
        return yield this._makeRequestImpl(method, defaultFlags, params);
      } finally {
        if (method === 'compile') {
          this._pendingCompileRequests--;
        }
      }
    })
  }, {
    key: '_makeRequestImpl',
    value: _asyncToGenerator(function* (method, defaultFlags, params) {
      var _this2 = this;

      var flags = yield this.getFlags();
      var accurateFlags = true;
      if (flags == null) {
        if (defaultFlags == null) {
          return null;
        }
        flags = yield augmentDefaultFlags(this._src, defaultFlags);
        accurateFlags = false;
      }

      var connection = yield this._getAsyncConnection();
      if (connection == null) {
        return null;
      }

      var reqid = this._getNextRequestId();
      var request = _extends({ reqid: reqid, method: method, flags: flags }, params);
      var logData = JSON.stringify(request, function (key, value) {
        // File contents are too large and clutter up the logs, so exclude them.
        // We generally only want to see the flags for 'compile' commands, since they'll usually
        // be the same for all other commands (barring an unexpected restart).
        if (key === 'contents' || method !== 'compile' && key === 'flags') {
          return undefined;
        } else {
          return value;
        }
      });

      logger.debug('LibClang request: ' + logData);
      // Because Node uses an event-loop, we do not have to worry about a call to
      // write() coming in from another thread between our two calls here.
      var writableStream = connection.writableStream;

      writableStream.write(JSON.stringify(request));
      writableStream.write('\n');

      return new Promise(function (resolve, reject) {
        _this2._emitter.once(reqid, function (response) {
          logger.debug('LibClang response: ' + JSON.stringify(response));
          var isError = ('error' in response);
          if (isError && !_this2._disposed) {
            logger.error('error received from clang_server.py for request:', logData, response['error']);
          }
          _this2._lastProcessedRequestId = parseInt(reqid, 16);
          if (method === 'compile') {
            // Using default flags typically results in poor diagnostics, so let the caller know.
            response.accurateFlags = accurateFlags;
          }
          (isError ? reject : resolve)(response);
        });
      });
    })
  }, {
    key: '_getNextRequestId',
    value: function _getNextRequestId() {
      return (this._nextRequestId++).toString(16);
    }
  }, {
    key: '_getAsyncConnectionImpl',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      if (this._asyncConnection == null) {
        try {
          var connection = yield this.createAsyncConnection(this._src);
          connection.readableStream.pipe((0, (_split2 || _split()).default)(JSON.parse)).on('data', function (response) {
            var id = response['reqid'];
            _this3._emitter.emit(id, response);
          }).on('error', function (error) {
            if (!_this3._disposed) {
              logger.error('Failed to handle libclang output, most likely the libclang python' + ' server crashed.', error);
              _this3._cleanup();
            }
            _this3._asyncConnection = null;
            _this3._lastProcessedRequestId = _this3._nextRequestId - 1;
          });
          this._asyncConnection = connection;
        } catch (e) {
          logger.error('Could not connect to Clang server', e);
        }
      }
      return this._asyncConnection;
    })
  }, {
    key: 'createAsyncConnection',
    value: _asyncToGenerator(function* (src) {
      var _this4 = this;

      return yield new Promise(_asyncToGenerator(function* (resolve, reject) {
        var _ref2 = yield _findClangServerArgs();

        var libClangLibraryFile = _ref2.libClangLibraryFile;
        var pythonPathEnv = _ref2.pythonPathEnv;
        var pythonExecutable = _ref2.pythonExecutable;

        var env = {
          PYTHONPATH: pythonPathEnv
        };
        // Note: undefined values in `env` get serialized to the string "undefined".
        // Thus we have to make sure the key only gets set for valid values.
        if (libClangLibraryFile != null) {
          // On Mac OSX El Capitan, bash seems to wipe out the `LD_LIBRARY_PATH` and
          // `DYLD_LIBRARY_PATH` environment variables. So, set this env var which is read by
          // clang_server.py to explicitly set the file path to load.
          env.LIB_CLANG_LIBRARY_FILE = libClangLibraryFile;
        }
        var options = {
          cwd: (_path2 || _path()).default.dirname(pathToLibClangServer),
          // The process should use its ordinary stderr for errors.
          stdio: ['pipe', null, 'pipe', 'pipe'],
          detached: false, // When Atom is killed, clang_server.py should be killed, too.
          env: env
        };

        // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
        // options.env is undefined (which is not the case here). This will only be an issue if the
        // system cannot find `pythonExecutable`.
        var child = yield (0, (_nuclideCommons2 || _nuclideCommons()).safeSpawn)(pythonExecutable, /* args */[pathToLibClangServer], options);

        child.on('close', function (exitCode) {
          if (!_this4._disposed) {
            logger.error(pathToLibClangServer + ' exited with code ' + exitCode);
          }
        });
        child.stderr.on('data', function (error) {
          if (error instanceof Buffer) {
            error = error.toString('utf8');
          }
          if (error.indexOf(DYLD_WARNING) === -1) {
            logger.error('Error receiving data', error);
          }
        });
        /* $FlowFixMe - update Flow defs for ChildProcess */
        var writableStream = child.stdio[3];
        writableStream.on('error', function (error) {
          logger.error('Error writing data', error);
        });

        var childRunning = true;
        child.on('exit', function () {
          childRunning = false;
        });
        // Make sure the bidirectional communication channel is set up before
        // resolving this Promise.
        child.stdout.once('data', function (data) {
          if (data.toString().trim() === 'ack') {
            var result = {
              dispose: function dispose() {
                if (childRunning) {
                  child.kill();
                  childRunning = false;
                }
              },
              process: child,
              readableStream: child.stdout,
              writableStream: writableStream
            };
            resolve(result);
          } else {
            reject(data);
          }
        });
        writableStream.write('init:' + src + '\n');
      }));
    })
  }]);

  return ClangServer;
})();

exports.default = ClangServer;
module.exports = exports.default;

// Cache the flags-fetching promise so we don't end up invoking Buck twice.

// Detect when flags have changed so we can alert the client.