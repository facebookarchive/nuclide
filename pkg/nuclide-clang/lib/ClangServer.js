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
    var result = yield (0, _nuclideCommons.checkOutput)('xcode-select', ['--print-path']);
    if (result.exitCode === 0) {
      libClangLibraryFile = result.stdout.trim() + '/Toolchains/XcodeDefault.xctoolchain/usr/lib/libclang.dylib';
    }
  }

  var clangServerArgs = {
    libClangLibraryFile: libClangLibraryFile,
    pythonExecutable: 'python',
    pythonPathEnv: _path2['default'].join(__dirname, '../pythonpath')
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _events = require('events');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

// Do not tie up the Buck server continuously retrying for flags.
var FLAGS_RETRY_LIMIT = 2;

// Mac OS X (El Capitan) prints this warning when loading the libclang library.
// It's not silenceable and has no effect, so just ignore it.
var DYLD_WARNING = 'dyld: warning, LC_RPATH';

var logger = (0, _nuclideLogging.getLogger)();
var pathToLibClangServer = _path2['default'].join(__dirname, '../python/clang_server.py');

var getDefaultFlags = undefined;

var ClangServer = (function () {
  function ClangServer(clangFlagsManager, src) {
    _classCallCheck(this, ClangServer);

    this._src = src;
    this._clangFlagsManager = clangFlagsManager;
    this._emitter = new _events.EventEmitter();
    this._nextRequestId = 0;
    this._lastProcessedRequestId = -1;
    this._pendingCompileRequests = 0;
    this._getAsyncConnection = _nuclideCommons.promises.serializeAsyncCall(this._getAsyncConnectionImpl.bind(this));
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

      var _ref = yield (0, _nuclideCommons.checkOutput)('ps', ['-p', this._asyncConnection.process.pid.toString(), '-o', 'rss=']);

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
  }, {
    key: 'makeRequest',
    value: _asyncToGenerator(function* (method, defaultFlags, params) {
      (0, _assert2['default'])(!this._disposed, 'calling makeRequest on a disposed ClangServer');
      if (method === 'compile') {
        this._pendingCompileRequests++;
      } else if (this._pendingCompileRequests) {
        // All other requests should instantly fail.
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
          connection.readableStream.pipe((0, _split2['default'])(JSON.parse)).on('data', function (response) {
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
          cwd: _path2['default'].dirname(pathToLibClangServer),
          // The process should use its ordinary stderr for errors.
          stdio: ['pipe', null, 'pipe', 'pipe'],
          detached: false, // When Atom is killed, clang_server.py should be killed, too.
          env: env
        };

        // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
        // options.env is undefined (which is not the case here). This will only be an issue if the
        // system cannot find `pythonExecutable`.
        var child = yield (0, _nuclideCommons.safeSpawn)(pythonExecutable, /* args */[pathToLibClangServer], options);

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

exports['default'] = ClangServer;
module.exports = exports['default'];

// Cache the flags-fetching promise so we don't end up invoking Buck twice.

// Detect when flags have changed so we can alert the client.
//# sourceMappingURL=data:application/json;base64,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QUNELHFCQUFPLEVBQUUsS0FBSztBQUNkLDRCQUFjLEVBQUUsS0FBSyxDQUFDLE1BQU07QUFDNUIsNEJBQWMsRUFBZCxjQUFjO2FBQ2YsQ0FBQztBQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDakIsTUFBTTtBQUNMLGtCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDZDtTQUNGLENBQUMsQ0FBQztBQUNILHNCQUFjLENBQUMsS0FBSyxXQUFTLEdBQUcsUUFBSyxDQUFDO09BQ3ZDLEVBQUMsQ0FBQztLQUNKOzs7U0FuU2tCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6IkNsYW5nU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgQ2xhbmdGbGFnc01hbmFnZXIgZnJvbSAnLi9DbGFuZ0ZsYWdzTWFuYWdlcic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHNwbGl0IGZyb20gJ3NwbGl0JztcblxuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge2NoZWNrT3V0cHV0LCBzYWZlU3Bhd24sIHByb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbi8vIERvIG5vdCB0aWUgdXAgdGhlIEJ1Y2sgc2VydmVyIGNvbnRpbnVvdXNseSByZXRyeWluZyBmb3IgZmxhZ3MuXG5jb25zdCBGTEFHU19SRVRSWV9MSU1JVCA9IDI7XG5cbi8vIE1hYyBPUyBYIChFbCBDYXBpdGFuKSBwcmludHMgdGhpcyB3YXJuaW5nIHdoZW4gbG9hZGluZyB0aGUgbGliY2xhbmcgbGlicmFyeS5cbi8vIEl0J3Mgbm90IHNpbGVuY2VhYmxlIGFuZCBoYXMgbm8gZWZmZWN0LCBzbyBqdXN0IGlnbm9yZSBpdC5cbmNvbnN0IERZTERfV0FSTklORyA9ICdkeWxkOiB3YXJuaW5nLCBMQ19SUEFUSCc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3QgcGF0aFRvTGliQ2xhbmdTZXJ2ZXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHl0aG9uL2NsYW5nX3NlcnZlci5weScpO1xuXG5hc3luYyBmdW5jdGlvbiBfZmluZENsYW5nU2VydmVyQXJncygpOiBQcm9taXNlPHtcbiAgbGliQ2xhbmdMaWJyYXJ5RmlsZTogP3N0cmluZztcbiAgcHl0aG9uRXhlY3V0YWJsZTogc3RyaW5nO1xuICBweXRob25QYXRoRW52OiA/c3RyaW5nO1xufT4ge1xuICBsZXQgZmluZENsYW5nU2VydmVyQXJncztcbiAgdHJ5IHtcbiAgICBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID0gcmVxdWlyZSgnLi9mYi9maW5kLWNsYW5nLXNlcnZlci1hcmdzJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZ25vcmUuXG4gIH1cblxuICBsZXQgbGliQ2xhbmdMaWJyYXJ5RmlsZTtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3hjb2RlLXNlbGVjdCcsIFsnLS1wcmludC1wYXRoJ10pO1xuICAgIGlmIChyZXN1bHQuZXhpdENvZGUgPT09IDApIHtcbiAgICAgIGxpYkNsYW5nTGlicmFyeUZpbGUgPSByZXN1bHQuc3Rkb3V0LnRyaW0oKSArXG4gICAgICAgICcvVG9vbGNoYWlucy9YY29kZURlZmF1bHQueGN0b29sY2hhaW4vdXNyL2xpYi9saWJjbGFuZy5keWxpYic7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzID0ge1xuICAgIGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgcHl0aG9uRXhlY3V0YWJsZTogJ3B5dGhvbicsXG4gICAgcHl0aG9uUGF0aEVudjogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3B5dGhvbnBhdGgnKSxcbiAgfTtcbiAgaWYgKHR5cGVvZiBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzT3ZlcnJpZGVzID0gYXdhaXQgZmluZENsYW5nU2VydmVyQXJncygpO1xuICAgIHJldHVybiB7Li4uY2xhbmdTZXJ2ZXJBcmdzLCAuLi5jbGFuZ1NlcnZlckFyZ3NPdmVycmlkZXN9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbGFuZ1NlcnZlckFyZ3M7XG4gIH1cbn1cblxubGV0IGdldERlZmF1bHRGbGFncztcbmFzeW5jIGZ1bmN0aW9uIGF1Z21lbnREZWZhdWx0RmxhZ3Moc3JjOiBzdHJpbmcsIGZsYWdzOiBBcnJheTxzdHJpbmc+KTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIGlmIChnZXREZWZhdWx0RmxhZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgIGdldERlZmF1bHRGbGFncyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGdldERlZmF1bHRGbGFncyA9IHJlcXVpcmUoJy4vZmIvZ2V0LWRlZmF1bHQtZmxhZ3MnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBPcGVuLXNvdXJjZSB2ZXJzaW9uXG4gICAgfVxuICB9XG4gIGlmIChnZXREZWZhdWx0RmxhZ3MgIT0gbnVsbCkge1xuICAgIHJldHVybiBmbGFncy5jb25jYXQoYXdhaXQgZ2V0RGVmYXVsdEZsYWdzKHNyYykpO1xuICB9XG4gIHJldHVybiBmbGFncztcbn1cblxudHlwZSBDb25uZWN0aW9uID0ge1xuICBkaXNwb3NlOiAoKSA9PiBhbnk7XG4gIHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICByZWFkYWJsZVN0cmVhbTogc3RyZWFtJFJlYWRhYmxlO1xuICB3cml0YWJsZVN0cmVhbTogc3RyZWFtJFdyaXRhYmxlO1xufTtcblxuLy8gTGlzdCBvZiBzdXBwb3J0ZWQgbWV0aG9kcy4gS2VlcCBpbiBzeW5jIHdpdGggdGhlIFB5dGhvbiBzZXJ2ZXIuXG50eXBlIENsYW5nU2VydmVyUmVxdWVzdCA9XG4gICdjb21waWxlJyB8ICdnZXRfY29tcGxldGlvbnMnIHwgJ2dldF9kZWNsYXJhdGlvbicgfCAnZ2V0X2RlY2xhcmF0aW9uX2luZm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFuZ1NlcnZlciB7XG5cbiAgX3NyYzogc3RyaW5nO1xuICBfY2xhbmdGbGFnc01hbmFnZXI6IENsYW5nRmxhZ3NNYW5hZ2VyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfbmV4dFJlcXVlc3RJZDogbnVtYmVyO1xuICBfbGFzdFByb2Nlc3NlZFJlcXVlc3RJZDogbnVtYmVyO1xuICBfYXN5bmNDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX3BlbmRpbmdDb21waWxlUmVxdWVzdHM6IG51bWJlcjtcbiAgX2dldEFzeW5jQ29ubmVjdGlvbjogKCkgPT4gUHJvbWlzZTw/Q29ubmVjdGlvbj47XG4gIF9kaXNwb3NlZDogYm9vbGVhbjtcblxuICAvLyBDYWNoZSB0aGUgZmxhZ3MtZmV0Y2hpbmcgcHJvbWlzZSBzbyB3ZSBkb24ndCBlbmQgdXAgaW52b2tpbmcgQnVjayB0d2ljZS5cbiAgX2ZsYWdzUHJvbWlzZTogP1Byb21pc2U8P0FycmF5PHN0cmluZz4+O1xuICBfZmxhZ3NSZXRyaWVzOiBudW1iZXI7XG5cbiAgLy8gRGV0ZWN0IHdoZW4gZmxhZ3MgaGF2ZSBjaGFuZ2VkIHNvIHdlIGNhbiBhbGVydCB0aGUgY2xpZW50LlxuICBfZmxhZ3NDaGFuZ2VkOiBib29sZWFuO1xuICBfZmxhZ3NDaGFuZ2VkU3Vic2NyaXB0aW9uOiA/cngkSVN1YnNjcmlwdGlvbjtcblxuICBjb25zdHJ1Y3RvcihjbGFuZ0ZsYWdzTWFuYWdlcjogQ2xhbmdGbGFnc01hbmFnZXIsIHNyYzogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3JjID0gc3JjO1xuICAgIHRoaXMuX2NsYW5nRmxhZ3NNYW5hZ2VyID0gY2xhbmdGbGFnc01hbmFnZXI7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9uZXh0UmVxdWVzdElkID0gMDtcbiAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gLTE7XG4gICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy5fZ2V0QXN5bmNDb25uZWN0aW9uID0gcHJvbWlzZXMuc2VyaWFsaXplQXN5bmNDYWxsKHRoaXMuX2dldEFzeW5jQ29ubmVjdGlvbkltcGwuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZGlzcG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9mbGFnc1JldHJpZXMgPSAwO1xuICAgIHRoaXMuX2ZsYWdzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2ZsYWdzQ2hhbmdlZFN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICB0aGlzLl9jbGVhbnVwKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBSU1Mgb2YgdGhlIGNoaWxkIHByb2Nlc3MgaW4gYnl0ZXMuXG4gICAqIFdvcmtzIG9uIFVuaXggYW5kIE1hYyBPUyBYLlxuICAgKi9cbiAgYXN5bmMgZ2V0TWVtb3J5VXNhZ2UoKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgICBpZiAodGhpcy5fYXN5bmNDb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBjb25zdCB7ZXhpdENvZGUsIHN0ZG91dH0gPSBhd2FpdCBjaGVja091dHB1dChcbiAgICAgICdwcycsXG4gICAgICBbJy1wJywgdGhpcy5fYXN5bmNDb25uZWN0aW9uLnByb2Nlc3MucGlkLnRvU3RyaW5nKCksICctbycsICdyc3M9J10sXG4gICAgKTtcbiAgICBpZiAoZXhpdENvZGUgIT09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VJbnQoc3Rkb3V0LCAxMCkgKiAxMDI0OyAvLyBwcyByZXR1cm5zIEtCXG4gIH1cblxuICBfY2xlYW51cCgpIHtcbiAgICAvLyBGYWlsIGFsbCBwZW5kaW5nIHJlcXVlc3RzLlxuICAgIC8vIFRoZSBDbGFuZyBzZXJ2ZXIgcmVjZWl2ZXMgcmVxdWVzdHMgc2VyaWFsbHkgdmlhIHN0ZGluIChhbmQgcHJvY2Vzc2VzIHRoZW0gaW4gdGhhdCBvcmRlcilcbiAgICAvLyBzbyBpdCdzIHF1aXRlIHNhZmUgdG8gYXNzdW1lIHRoYXQgcmVxdWVzdHMgYXJlIHByb2Nlc3NlZCBpbiBvcmRlci5cbiAgICBmb3IgKGxldCByZXFpZCA9IHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgKyAxOyByZXFpZCA8IHRoaXMuX25leHRSZXF1ZXN0SWQ7IHJlcWlkKyspIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChyZXFpZC50b1N0cmluZygxNiksIHtlcnJvcjogJ1NlcnZlciB3YXMga2lsbGVkLid9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2FzeW5jQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgICBpZiAodGhpcy5fZmxhZ3NDaGFuZ2VkU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2ZsYWdzQ2hhbmdlZFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgdGhpcy5fZmxhZ3NDaGFuZ2VkU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBnZXRGbGFncygpOiBQcm9taXNlPD9BcnJheTxzdHJpbmc+PiB7XG4gICAgaWYgKHRoaXMuX2ZsYWdzUHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmxhZ3NQcm9taXNlO1xuICAgIH1cbiAgICB0aGlzLl9mbGFnc1Byb21pc2UgPSB0aGlzLl9jbGFuZ0ZsYWdzTWFuYWdlci5nZXRGbGFnc0ZvclNyYyh0aGlzLl9zcmMpXG4gICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgdGhpcy5fZmxhZ3NDaGFuZ2VkU3Vic2NyaXB0aW9uID0gcmVzdWx0LmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2ZsYWdzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgLy8gV2lsbCBiZSBhdXRvbWF0aWNhbGx5IHVuc3Vic2NyaWJlZCBoZXJlLlxuICAgICAgICAgICAgdGhpcy5fZmxhZ3NDaGFuZ2VkU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0LmZsYWdzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSwgZSA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICBgY2xhbmctc2VydmVyOiBDb3VsZCBub3QgZ2V0IGZsYWdzIGZvciAke3RoaXMuX3NyY30gKHJldHJ5ICR7dGhpcy5fZmxhZ3NSZXRyaWVzfSlgLCBlKTtcbiAgICAgICAgaWYgKHRoaXMuX2ZsYWdzUmV0cmllcyA8IEZMQUdTX1JFVFJZX0xJTUlUKSB7XG4gICAgICAgICAgdGhpcy5fZmxhZ3NQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9mbGFnc1JldHJpZXMrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2ZsYWdzUHJvbWlzZTtcbiAgfVxuXG4gIGdldEZsYWdzQ2hhbmdlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZmxhZ3NDaGFuZ2VkO1xuICB9XG5cbiAgYXN5bmMgbWFrZVJlcXVlc3QoXG4gICAgbWV0aG9kOiBDbGFuZ1NlcnZlclJlcXVlc3QsXG4gICAgZGVmYXVsdEZsYWdzOiA/QXJyYXk8c3RyaW5nPixcbiAgICBwYXJhbXM6IE9iamVjdCxcbiAgKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgaW52YXJpYW50KCF0aGlzLl9kaXNwb3NlZCwgJ2NhbGxpbmcgbWFrZVJlcXVlc3Qgb24gYSBkaXNwb3NlZCBDbGFuZ1NlcnZlcicpO1xuICAgIGlmIChtZXRob2QgPT09ICdjb21waWxlJykge1xuICAgICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cysrO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cykge1xuICAgICAgLy8gQWxsIG90aGVyIHJlcXVlc3RzIHNob3VsZCBpbnN0YW50bHkgZmFpbC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX21ha2VSZXF1ZXN0SW1wbChtZXRob2QsIGRlZmF1bHRGbGFncywgcGFyYW1zKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKG1ldGhvZCA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMtLTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBfbWFrZVJlcXVlc3RJbXBsKFxuICAgIG1ldGhvZDogQ2xhbmdTZXJ2ZXJSZXF1ZXN0LFxuICAgIGRlZmF1bHRGbGFnczogP0FycmF5PHN0cmluZz4sXG4gICAgcGFyYW1zOiBPYmplY3QsXG4gICk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIGxldCBmbGFncyA9IGF3YWl0IHRoaXMuZ2V0RmxhZ3MoKTtcbiAgICBsZXQgYWNjdXJhdGVGbGFncyA9IHRydWU7XG4gICAgaWYgKGZsYWdzID09IG51bGwpIHtcbiAgICAgIGlmIChkZWZhdWx0RmxhZ3MgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGZsYWdzID0gYXdhaXQgYXVnbWVudERlZmF1bHRGbGFncyh0aGlzLl9zcmMsIGRlZmF1bHRGbGFncyk7XG4gICAgICBhY2N1cmF0ZUZsYWdzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IHRoaXMuX2dldEFzeW5jQ29ubmVjdGlvbigpO1xuICAgIGlmIChjb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJlcWlkID0gdGhpcy5fZ2V0TmV4dFJlcXVlc3RJZCgpO1xuICAgIGNvbnN0IHJlcXVlc3QgPSB7cmVxaWQsIG1ldGhvZCwgZmxhZ3MsIC4uLnBhcmFtc307XG4gICAgY29uc3QgbG9nRGF0YSA9IEpTT04uc3RyaW5naWZ5KHJlcXVlc3QsIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAvLyBGaWxlIGNvbnRlbnRzIGFyZSB0b28gbGFyZ2UgYW5kIGNsdXR0ZXIgdXAgdGhlIGxvZ3MsIHNvIGV4Y2x1ZGUgdGhlbS5cbiAgICAgIC8vIFdlIGdlbmVyYWxseSBvbmx5IHdhbnQgdG8gc2VlIHRoZSBmbGFncyBmb3IgJ2NvbXBpbGUnIGNvbW1hbmRzLCBzaW5jZSB0aGV5J2xsIHVzdWFsbHlcbiAgICAgIC8vIGJlIHRoZSBzYW1lIGZvciBhbGwgb3RoZXIgY29tbWFuZHMgKGJhcnJpbmcgYW4gdW5leHBlY3RlZCByZXN0YXJ0KS5cbiAgICAgIGlmIChrZXkgPT09ICdjb250ZW50cycgfHwgKG1ldGhvZCAhPT0gJ2NvbXBpbGUnICYmIGtleSA9PT0gJ2ZsYWdzJykpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGxvZ2dlci5kZWJ1ZygnTGliQ2xhbmcgcmVxdWVzdDogJyArIGxvZ0RhdGEpO1xuICAgIC8vIEJlY2F1c2UgTm9kZSB1c2VzIGFuIGV2ZW50LWxvb3AsIHdlIGRvIG5vdCBoYXZlIHRvIHdvcnJ5IGFib3V0IGEgY2FsbCB0b1xuICAgIC8vIHdyaXRlKCkgY29taW5nIGluIGZyb20gYW5vdGhlciB0aHJlYWQgYmV0d2VlbiBvdXIgdHdvIGNhbGxzIGhlcmUuXG4gICAgY29uc3Qge3dyaXRhYmxlU3RyZWFtfSA9IGNvbm5lY3Rpb247XG4gICAgd3JpdGFibGVTdHJlYW0ud3JpdGUoSlNPTi5zdHJpbmdpZnkocmVxdWVzdCkpO1xuICAgIHdyaXRhYmxlU3RyZWFtLndyaXRlKCdcXG4nKTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLm9uY2UocmVxaWQsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdMaWJDbGFuZyByZXNwb25zZTogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgICAgIGNvbnN0IGlzRXJyb3IgPSAnZXJyb3InIGluIHJlc3BvbnNlO1xuICAgICAgICBpZiAoaXNFcnJvciAmJiAhdGhpcy5fZGlzcG9zZWQpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ2Vycm9yIHJlY2VpdmVkIGZyb20gY2xhbmdfc2VydmVyLnB5IGZvciByZXF1ZXN0OicsXG4gICAgICAgICAgICBsb2dEYXRhLFxuICAgICAgICAgICAgcmVzcG9uc2VbJ2Vycm9yJ10pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSBwYXJzZUludChyZXFpZCwgMTYpO1xuICAgICAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAvLyBVc2luZyBkZWZhdWx0IGZsYWdzIHR5cGljYWxseSByZXN1bHRzIGluIHBvb3IgZGlhZ25vc3RpY3MsIHNvIGxldCB0aGUgY2FsbGVyIGtub3cuXG4gICAgICAgICAgcmVzcG9uc2UuYWNjdXJhdGVGbGFncyA9IGFjY3VyYXRlRmxhZ3M7XG4gICAgICAgIH1cbiAgICAgICAgKGlzRXJyb3IgPyByZWplY3QgOiByZXNvbHZlKShyZXNwb25zZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9nZXROZXh0UmVxdWVzdElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLl9uZXh0UmVxdWVzdElkKyspLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRBc3luY0Nvbm5lY3Rpb25JbXBsKCk6IFByb21pc2U8P0Nvbm5lY3Rpb24+IHtcbiAgICBpZiAodGhpcy5fYXN5bmNDb25uZWN0aW9uID09IG51bGwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLmNyZWF0ZUFzeW5jQ29ubmVjdGlvbih0aGlzLl9zcmMpO1xuICAgICAgICBjb25uZWN0aW9uLnJlYWRhYmxlU3RyZWFtXG4gICAgICAgICAgLnBpcGUoc3BsaXQoSlNPTi5wYXJzZSkpXG4gICAgICAgICAgLm9uKCdkYXRhJywgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSByZXNwb25zZVsncmVxaWQnXTtcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChpZCwgcmVzcG9uc2UpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fZGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gaGFuZGxlIGxpYmNsYW5nIG91dHB1dCwgbW9zdCBsaWtlbHkgdGhlIGxpYmNsYW5nIHB5dGhvbidcbiAgICAgICAgICAgICAgICArICcgc2VydmVyIGNyYXNoZWQuJyxcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSB0aGlzLl9uZXh0UmVxdWVzdElkIC0gMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBDbGFuZyBzZXJ2ZXInLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FzeW5jQ29ubmVjdGlvbjtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUFzeW5jQ29ubmVjdGlvbihzcmM6IHN0cmluZyk6IFByb21pc2U8Q29ubmVjdGlvbj4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB7bGliQ2xhbmdMaWJyYXJ5RmlsZSwgcHl0aG9uUGF0aEVudiwgcHl0aG9uRXhlY3V0YWJsZX0gPSBhd2FpdCBfZmluZENsYW5nU2VydmVyQXJncygpO1xuICAgICAgY29uc3QgZW52OiBhbnkgPSB7XG4gICAgICAgIFBZVEhPTlBBVEg6IHB5dGhvblBhdGhFbnYsXG4gICAgICB9O1xuICAgICAgLy8gTm90ZTogdW5kZWZpbmVkIHZhbHVlcyBpbiBgZW52YCBnZXQgc2VyaWFsaXplZCB0byB0aGUgc3RyaW5nIFwidW5kZWZpbmVkXCIuXG4gICAgICAvLyBUaHVzIHdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoZSBrZXkgb25seSBnZXRzIHNldCBmb3IgdmFsaWQgdmFsdWVzLlxuICAgICAgaWYgKGxpYkNsYW5nTGlicmFyeUZpbGUgIT0gbnVsbCkge1xuICAgICAgICAvLyBPbiBNYWMgT1NYIEVsIENhcGl0YW4sIGJhc2ggc2VlbXMgdG8gd2lwZSBvdXQgdGhlIGBMRF9MSUJSQVJZX1BBVEhgIGFuZFxuICAgICAgICAvLyBgRFlMRF9MSUJSQVJZX1BBVEhgIGVudmlyb25tZW50IHZhcmlhYmxlcy4gU28sIHNldCB0aGlzIGVudiB2YXIgd2hpY2ggaXMgcmVhZCBieVxuICAgICAgICAvLyBjbGFuZ19zZXJ2ZXIucHkgdG8gZXhwbGljaXRseSBzZXQgdGhlIGZpbGUgcGF0aCB0byBsb2FkLlxuICAgICAgICBlbnYuTElCX0NMQU5HX0xJQlJBUllfRklMRSA9IGxpYkNsYW5nTGlicmFyeUZpbGU7XG4gICAgICB9XG4gICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICBjd2Q6IHBhdGguZGlybmFtZShwYXRoVG9MaWJDbGFuZ1NlcnZlciksXG4gICAgICAgIC8vIFRoZSBwcm9jZXNzIHNob3VsZCB1c2UgaXRzIG9yZGluYXJ5IHN0ZGVyciBmb3IgZXJyb3JzLlxuICAgICAgICBzdGRpbzogWydwaXBlJywgbnVsbCwgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgICBkZXRhY2hlZDogZmFsc2UsIC8vIFdoZW4gQXRvbSBpcyBraWxsZWQsIGNsYW5nX3NlcnZlci5weSBzaG91bGQgYmUga2lsbGVkLCB0b28uXG4gICAgICAgIGVudixcbiAgICAgIH07XG5cbiAgICAgIC8vIE5vdGUgdGhhdCBzYWZlU3Bhd24oKSBvZnRlbiBvdmVycmlkZXMgb3B0aW9ucy5lbnYuUEFUSCwgYnV0IHRoYXQgb25seSBoYXBwZW5zIHdoZW5cbiAgICAgIC8vIG9wdGlvbnMuZW52IGlzIHVuZGVmaW5lZCAod2hpY2ggaXMgbm90IHRoZSBjYXNlIGhlcmUpLiBUaGlzIHdpbGwgb25seSBiZSBhbiBpc3N1ZSBpZiB0aGVcbiAgICAgIC8vIHN5c3RlbSBjYW5ub3QgZmluZCBgcHl0aG9uRXhlY3V0YWJsZWAuXG4gICAgICBjb25zdCBjaGlsZCA9IGF3YWl0IHNhZmVTcGF3bihweXRob25FeGVjdXRhYmxlLCAvKiBhcmdzICovIFtwYXRoVG9MaWJDbGFuZ1NlcnZlcl0sIG9wdGlvbnMpO1xuXG4gICAgICBjaGlsZC5vbignY2xvc2UnLCBleGl0Q29kZSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5fZGlzcG9zZWQpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoYCR7cGF0aFRvTGliQ2xhbmdTZXJ2ZXJ9IGV4aXRlZCB3aXRoIGNvZGUgJHtleGl0Q29kZX1gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBlcnJvciA9PiB7XG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgIGVycm9yID0gZXJyb3IudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXJyb3IuaW5kZXhPZihEWUxEX1dBUk5JTkcpID09PSAtMSkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgcmVjZWl2aW5nIGRhdGEnLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLyogJEZsb3dGaXhNZSAtIHVwZGF0ZSBGbG93IGRlZnMgZm9yIENoaWxkUHJvY2VzcyAqL1xuICAgICAgY29uc3Qgd3JpdGFibGVTdHJlYW0gPSBjaGlsZC5zdGRpb1szXTtcbiAgICAgIHdyaXRhYmxlU3RyZWFtLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciB3cml0aW5nIGRhdGEnLCBlcnJvcik7XG4gICAgICB9KTtcblxuICAgICAgbGV0IGNoaWxkUnVubmluZyA9IHRydWU7XG4gICAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHtcbiAgICAgICAgY2hpbGRSdW5uaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgYmlkaXJlY3Rpb25hbCBjb21tdW5pY2F0aW9uIGNoYW5uZWwgaXMgc2V0IHVwIGJlZm9yZVxuICAgICAgLy8gcmVzb2x2aW5nIHRoaXMgUHJvbWlzZS5cbiAgICAgIGNoaWxkLnN0ZG91dC5vbmNlKCdkYXRhJywgZnVuY3Rpb24oZGF0YTogQnVmZmVyKSB7XG4gICAgICAgIGlmIChkYXRhLnRvU3RyaW5nKCkudHJpbSgpID09PSAnYWNrJykge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgaWYgKGNoaWxkUnVubmluZykge1xuICAgICAgICAgICAgICAgIGNoaWxkLmtpbGwoKTtcbiAgICAgICAgICAgICAgICBjaGlsZFJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGNoaWxkLFxuICAgICAgICAgICAgcmVhZGFibGVTdHJlYW06IGNoaWxkLnN0ZG91dCxcbiAgICAgICAgICAgIHdyaXRhYmxlU3RyZWFtLFxuICAgICAgICAgIH07XG4gICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChkYXRhKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB3cml0YWJsZVN0cmVhbS53cml0ZShgaW5pdDoke3NyY31cXG5gKTtcbiAgICB9KTtcbiAgfVxuXG59XG4iXX0=