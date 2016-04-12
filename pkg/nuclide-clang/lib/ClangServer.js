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
    }
  }, {
    key: 'getFlags',
    value: function getFlags() {
      var _this = this;

      if (this._flagsPromise != null) {
        return this._flagsPromise;
      }
      this._flagsPromise = this._clangFlagsManager.getFlagsForSrc(this._src)['catch'](function (e) {
        logger.error('clang-server: Could not get flags for ' + _this._src + ' (retry ' + _this._flagsRetries + ')', e);
        if (_this._flagsRetries < FLAGS_RETRY_LIMIT) {
          _this._flagsPromise = null;
          _this._flagsRetries++;
        }
      });
      return this._flagsPromise;
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDOztBQUVILFlBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixhQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3JCLHNCQUFZLEdBQUcsS0FBSyxDQUFDO1NBQ3RCLENBQUMsQ0FBQzs7O0FBR0gsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVMsSUFBWSxFQUFFO0FBQy9DLGNBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEtBQUssRUFBRTtBQUNwQyxnQkFBTSxNQUFNLEdBQUc7QUFDYixxQkFBTyxFQUFFLG1CQUFNO0FBQ2Isb0JBQUksWUFBWSxFQUFFO0FBQ2hCLHVCQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDYiw4QkFBWSxHQUFHLEtBQUssQ0FBQztpQkFDdEI7ZUFDRjtBQUNELHFCQUFPLEVBQUUsS0FBSztBQUNkLDRCQUFjLEVBQUUsS0FBSyxDQUFDLE1BQU07QUFDNUIsNEJBQWMsRUFBZCxjQUFjO2FBQ2YsQ0FBQztBQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDakIsTUFBTTtBQUNMLGtCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDZDtTQUNGLENBQUMsQ0FBQztBQUNILHNCQUFjLENBQUMsS0FBSyxXQUFTLEdBQUcsUUFBSyxDQUFDO09BQ3ZDLEVBQUMsQ0FBQztLQUNKOzs7U0ExUWtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6IkNsYW5nU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgQ2xhbmdGbGFnc01hbmFnZXIgZnJvbSAnLi9DbGFuZ0ZsYWdzTWFuYWdlcic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHNwbGl0IGZyb20gJ3NwbGl0JztcblxuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge2NoZWNrT3V0cHV0LCBzYWZlU3Bhd24sIHByb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbi8vIERvIG5vdCB0aWUgdXAgdGhlIEJ1Y2sgc2VydmVyIGNvbnRpbnVvdXNseSByZXRyeWluZyBmb3IgZmxhZ3MuXG5jb25zdCBGTEFHU19SRVRSWV9MSU1JVCA9IDI7XG5cbi8vIE1hYyBPUyBYIChFbCBDYXBpdGFuKSBwcmludHMgdGhpcyB3YXJuaW5nIHdoZW4gbG9hZGluZyB0aGUgbGliY2xhbmcgbGlicmFyeS5cbi8vIEl0J3Mgbm90IHNpbGVuY2VhYmxlIGFuZCBoYXMgbm8gZWZmZWN0LCBzbyBqdXN0IGlnbm9yZSBpdC5cbmNvbnN0IERZTERfV0FSTklORyA9ICdkeWxkOiB3YXJuaW5nLCBMQ19SUEFUSCc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3QgcGF0aFRvTGliQ2xhbmdTZXJ2ZXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHl0aG9uL2NsYW5nX3NlcnZlci5weScpO1xuXG5hc3luYyBmdW5jdGlvbiBfZmluZENsYW5nU2VydmVyQXJncygpOiBQcm9taXNlPHtcbiAgbGliQ2xhbmdMaWJyYXJ5RmlsZTogP3N0cmluZztcbiAgcHl0aG9uRXhlY3V0YWJsZTogc3RyaW5nO1xuICBweXRob25QYXRoRW52OiA/c3RyaW5nO1xufT4ge1xuICBsZXQgZmluZENsYW5nU2VydmVyQXJncztcbiAgdHJ5IHtcbiAgICBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID0gcmVxdWlyZSgnLi9mYi9maW5kLWNsYW5nLXNlcnZlci1hcmdzJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZ25vcmUuXG4gIH1cblxuICBsZXQgbGliQ2xhbmdMaWJyYXJ5RmlsZTtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3hjb2RlLXNlbGVjdCcsIFsnLS1wcmludC1wYXRoJ10pO1xuICAgIGlmIChyZXN1bHQuZXhpdENvZGUgPT09IDApIHtcbiAgICAgIGxpYkNsYW5nTGlicmFyeUZpbGUgPSByZXN1bHQuc3Rkb3V0LnRyaW0oKSArXG4gICAgICAgICcvVG9vbGNoYWlucy9YY29kZURlZmF1bHQueGN0b29sY2hhaW4vdXNyL2xpYi9saWJjbGFuZy5keWxpYic7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzID0ge1xuICAgIGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgcHl0aG9uRXhlY3V0YWJsZTogJ3B5dGhvbicsXG4gICAgcHl0aG9uUGF0aEVudjogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3B5dGhvbnBhdGgnKSxcbiAgfTtcbiAgaWYgKHR5cGVvZiBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzT3ZlcnJpZGVzID0gYXdhaXQgZmluZENsYW5nU2VydmVyQXJncygpO1xuICAgIHJldHVybiB7Li4uY2xhbmdTZXJ2ZXJBcmdzLCAuLi5jbGFuZ1NlcnZlckFyZ3NPdmVycmlkZXN9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbGFuZ1NlcnZlckFyZ3M7XG4gIH1cbn1cblxubGV0IGdldERlZmF1bHRGbGFncztcbmFzeW5jIGZ1bmN0aW9uIGF1Z21lbnREZWZhdWx0RmxhZ3Moc3JjOiBzdHJpbmcsIGZsYWdzOiBBcnJheTxzdHJpbmc+KTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIGlmIChnZXREZWZhdWx0RmxhZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgIGdldERlZmF1bHRGbGFncyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGdldERlZmF1bHRGbGFncyA9IHJlcXVpcmUoJy4vZmIvZ2V0LWRlZmF1bHQtZmxhZ3MnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBPcGVuLXNvdXJjZSB2ZXJzaW9uXG4gICAgfVxuICB9XG4gIGlmIChnZXREZWZhdWx0RmxhZ3MgIT0gbnVsbCkge1xuICAgIHJldHVybiBmbGFncy5jb25jYXQoYXdhaXQgZ2V0RGVmYXVsdEZsYWdzKHNyYykpO1xuICB9XG4gIHJldHVybiBmbGFncztcbn1cblxudHlwZSBDb25uZWN0aW9uID0ge1xuICBkaXNwb3NlOiAoKSA9PiBhbnk7XG4gIHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICByZWFkYWJsZVN0cmVhbTogc3RyZWFtJFJlYWRhYmxlO1xuICB3cml0YWJsZVN0cmVhbTogc3RyZWFtJFdyaXRhYmxlO1xufTtcblxuLy8gTGlzdCBvZiBzdXBwb3J0ZWQgbWV0aG9kcy4gS2VlcCBpbiBzeW5jIHdpdGggdGhlIFB5dGhvbiBzZXJ2ZXIuXG50eXBlIENsYW5nU2VydmVyUmVxdWVzdCA9XG4gICdjb21waWxlJyB8ICdnZXRfY29tcGxldGlvbnMnIHwgJ2dldF9kZWNsYXJhdGlvbicgfCAnZ2V0X2RlY2xhcmF0aW9uX2luZm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFuZ1NlcnZlciB7XG5cbiAgX3NyYzogc3RyaW5nO1xuICBfY2xhbmdGbGFnc01hbmFnZXI6IENsYW5nRmxhZ3NNYW5hZ2VyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfbmV4dFJlcXVlc3RJZDogbnVtYmVyO1xuICBfbGFzdFByb2Nlc3NlZFJlcXVlc3RJZDogbnVtYmVyO1xuICBfYXN5bmNDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX3BlbmRpbmdDb21waWxlUmVxdWVzdHM6IG51bWJlcjtcbiAgX2dldEFzeW5jQ29ubmVjdGlvbjogKCkgPT4gUHJvbWlzZTw/Q29ubmVjdGlvbj47XG4gIF9kaXNwb3NlZDogYm9vbGVhbjtcblxuICAvLyBDYWNoZSB0aGUgZmxhZ3MtZmV0Y2hpbmcgcHJvbWlzZSBzbyB3ZSBkb24ndCBlbmQgdXAgaW52b2tpbmcgQnVjayB0d2ljZS5cbiAgX2ZsYWdzUHJvbWlzZTogP1Byb21pc2U8P0FycmF5PHN0cmluZz4+O1xuICBfZmxhZ3NSZXRyaWVzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoY2xhbmdGbGFnc01hbmFnZXI6IENsYW5nRmxhZ3NNYW5hZ2VyLCBzcmM6IHN0cmluZykge1xuICAgIHRoaXMuX3NyYyA9IHNyYztcbiAgICB0aGlzLl9jbGFuZ0ZsYWdzTWFuYWdlciA9IGNsYW5nRmxhZ3NNYW5hZ2VyO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fbmV4dFJlcXVlc3RJZCA9IDA7XG4gICAgdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCA9IC0xO1xuICAgIHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMgPSAwO1xuICAgIHRoaXMuX2dldEFzeW5jQ29ubmVjdGlvbiA9IHByb21pc2VzLnNlcmlhbGl6ZUFzeW5jQ2FsbCh0aGlzLl9nZXRBc3luY0Nvbm5lY3Rpb25JbXBsLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Rpc3Bvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fZmxhZ3NSZXRyaWVzID0gMDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NsZWFudXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIFJTUyBvZiB0aGUgY2hpbGQgcHJvY2VzcyBpbiBieXRlcy5cbiAgICogV29ya3Mgb24gVW5peCBhbmQgTWFjIE9TIFguXG4gICAqL1xuICBhc3luYyBnZXRNZW1vcnlVc2FnZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGNvbnN0IHtleGl0Q29kZSwgc3Rkb3V0fSA9IGF3YWl0IGNoZWNrT3V0cHV0KFxuICAgICAgJ3BzJyxcbiAgICAgIFsnLXAnLCB0aGlzLl9hc3luY0Nvbm5lY3Rpb24ucHJvY2Vzcy5waWQudG9TdHJpbmcoKSwgJy1vJywgJ3Jzcz0nXSxcbiAgICApO1xuICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZUludChzdGRvdXQsIDEwKSAqIDEwMjQ7IC8vIHBzIHJldHVybnMgS0JcbiAgfVxuXG4gIF9jbGVhbnVwKCkge1xuICAgIC8vIEZhaWwgYWxsIHBlbmRpbmcgcmVxdWVzdHMuXG4gICAgLy8gVGhlIENsYW5nIHNlcnZlciByZWNlaXZlcyByZXF1ZXN0cyBzZXJpYWxseSB2aWEgc3RkaW4gKGFuZCBwcm9jZXNzZXMgdGhlbSBpbiB0aGF0IG9yZGVyKVxuICAgIC8vIHNvIGl0J3MgcXVpdGUgc2FmZSB0byBhc3N1bWUgdGhhdCByZXF1ZXN0cyBhcmUgcHJvY2Vzc2VkIGluIG9yZGVyLlxuICAgIGZvciAobGV0IHJlcWlkID0gdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCArIDE7IHJlcWlkIDwgdGhpcy5fbmV4dFJlcXVlc3RJZDsgcmVxaWQrKykge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KHJlcWlkLnRvU3RyaW5nKDE2KSwge2Vycm9yOiAnU2VydmVyIHdhcyBraWxsZWQuJ30pO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYXN5bmNDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9hc3luY0Nvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB9XG5cbiAgZ2V0RmxhZ3MoKTogUHJvbWlzZTw/QXJyYXk8c3RyaW5nPj4ge1xuICAgIGlmICh0aGlzLl9mbGFnc1Byb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsYWdzUHJvbWlzZTtcbiAgICB9XG4gICAgdGhpcy5fZmxhZ3NQcm9taXNlID0gdGhpcy5fY2xhbmdGbGFnc01hbmFnZXIuZ2V0RmxhZ3NGb3JTcmModGhpcy5fc3JjKVxuICAgICAgLmNhdGNoKGUgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgYGNsYW5nLXNlcnZlcjogQ291bGQgbm90IGdldCBmbGFncyBmb3IgJHt0aGlzLl9zcmN9IChyZXRyeSAke3RoaXMuX2ZsYWdzUmV0cmllc30pYCwgZSk7XG4gICAgICAgIGlmICh0aGlzLl9mbGFnc1JldHJpZXMgPCBGTEFHU19SRVRSWV9MSU1JVCkge1xuICAgICAgICAgIHRoaXMuX2ZsYWdzUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fZmxhZ3NSZXRyaWVzKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9mbGFnc1Byb21pc2U7XG4gIH1cblxuICBhc3luYyBtYWtlUmVxdWVzdChcbiAgICBtZXRob2Q6IENsYW5nU2VydmVyUmVxdWVzdCxcbiAgICBkZWZhdWx0RmxhZ3M6ID9BcnJheTxzdHJpbmc+LFxuICAgIHBhcmFtczogT2JqZWN0LFxuICApOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgICBpbnZhcmlhbnQoIXRoaXMuX2Rpc3Bvc2VkLCAnY2FsbGluZyBtYWtlUmVxdWVzdCBvbiBhIGRpc3Bvc2VkIENsYW5nU2VydmVyJyk7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzKys7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzKSB7XG4gICAgICAvLyBBbGwgb3RoZXIgcmVxdWVzdHMgc2hvdWxkIGluc3RhbnRseSBmYWlsLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbWFrZVJlcXVlc3RJbXBsKG1ldGhvZCwgZGVmYXVsdEZsYWdzLCBwYXJhbXMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cy0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9tYWtlUmVxdWVzdEltcGwoXG4gICAgbWV0aG9kOiBDbGFuZ1NlcnZlclJlcXVlc3QsXG4gICAgZGVmYXVsdEZsYWdzOiA/QXJyYXk8c3RyaW5nPixcbiAgICBwYXJhbXM6IE9iamVjdCxcbiAgKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgbGV0IGZsYWdzID0gYXdhaXQgdGhpcy5nZXRGbGFncygpO1xuICAgIGxldCBhY2N1cmF0ZUZsYWdzID0gdHJ1ZTtcbiAgICBpZiAoZmxhZ3MgPT0gbnVsbCkge1xuICAgICAgaWYgKGRlZmF1bHRGbGFncyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZmxhZ3MgPSBhd2FpdCBhdWdtZW50RGVmYXVsdEZsYWdzKHRoaXMuX3NyYywgZGVmYXVsdEZsYWdzKTtcbiAgICAgIGFjY3VyYXRlRmxhZ3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5fZ2V0QXN5bmNDb25uZWN0aW9uKCk7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxaWQgPSB0aGlzLl9nZXROZXh0UmVxdWVzdElkKCk7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtyZXFpZCwgbWV0aG9kLCBmbGFncywgLi4ucGFyYW1zfTtcbiAgICBjb25zdCBsb2dEYXRhID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdCwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIC8vIEZpbGUgY29udGVudHMgYXJlIHRvbyBsYXJnZSBhbmQgY2x1dHRlciB1cCB0aGUgbG9ncywgc28gZXhjbHVkZSB0aGVtLlxuICAgICAgLy8gV2UgZ2VuZXJhbGx5IG9ubHkgd2FudCB0byBzZWUgdGhlIGZsYWdzIGZvciAnY29tcGlsZScgY29tbWFuZHMsIHNpbmNlIHRoZXknbGwgdXN1YWxseVxuICAgICAgLy8gYmUgdGhlIHNhbWUgZm9yIGFsbCBvdGhlciBjb21tYW5kcyAoYmFycmluZyBhbiB1bmV4cGVjdGVkIHJlc3RhcnQpLlxuICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnRzJyB8fCAobWV0aG9kICE9PSAnY29tcGlsZScgJiYga2V5ID09PSAnZmxhZ3MnKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbG9nZ2VyLmRlYnVnKCdMaWJDbGFuZyByZXF1ZXN0OiAnICsgbG9nRGF0YSk7XG4gICAgLy8gQmVjYXVzZSBOb2RlIHVzZXMgYW4gZXZlbnQtbG9vcCwgd2UgZG8gbm90IGhhdmUgdG8gd29ycnkgYWJvdXQgYSBjYWxsIHRvXG4gICAgLy8gd3JpdGUoKSBjb21pbmcgaW4gZnJvbSBhbm90aGVyIHRocmVhZCBiZXR3ZWVuIG91ciB0d28gY2FsbHMgaGVyZS5cbiAgICBjb25zdCB7d3JpdGFibGVTdHJlYW19ID0gY29ubmVjdGlvbjtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgd3JpdGFibGVTdHJlYW0ud3JpdGUoJ1xcbicpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShyZXFpZCwgcmVzcG9uc2UgPT4ge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ0xpYkNsYW5nIHJlc3BvbnNlOiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgICAgY29uc3QgaXNFcnJvciA9ICdlcnJvcicgaW4gcmVzcG9uc2U7XG4gICAgICAgIGlmIChpc0Vycm9yICYmICF0aGlzLl9kaXNwb3NlZCkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignZXJyb3IgcmVjZWl2ZWQgZnJvbSBjbGFuZ19zZXJ2ZXIucHkgZm9yIHJlcXVlc3Q6JyxcbiAgICAgICAgICAgIGxvZ0RhdGEsXG4gICAgICAgICAgICByZXNwb25zZVsnZXJyb3InXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCA9IHBhcnNlSW50KHJlcWlkLCAxNik7XG4gICAgICAgIGlmIChtZXRob2QgPT09ICdjb21waWxlJykge1xuICAgICAgICAgIC8vIFVzaW5nIGRlZmF1bHQgZmxhZ3MgdHlwaWNhbGx5IHJlc3VsdHMgaW4gcG9vciBkaWFnbm9zdGljcywgc28gbGV0IHRoZSBjYWxsZXIga25vdy5cbiAgICAgICAgICByZXNwb25zZS5hY2N1cmF0ZUZsYWdzID0gYWNjdXJhdGVGbGFncztcbiAgICAgICAgfVxuICAgICAgICAoaXNFcnJvciA/IHJlamVjdCA6IHJlc29sdmUpKHJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2dldE5leHRSZXF1ZXN0SWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMuX25leHRSZXF1ZXN0SWQrKykudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgYXN5bmMgX2dldEFzeW5jQ29ubmVjdGlvbkltcGwoKTogUHJvbWlzZTw/Q29ubmVjdGlvbj4ge1xuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IHRoaXMuY3JlYXRlQXN5bmNDb25uZWN0aW9uKHRoaXMuX3NyYyk7XG4gICAgICAgIGNvbm5lY3Rpb24ucmVhZGFibGVTdHJlYW1cbiAgICAgICAgICAucGlwZShzcGxpdChKU09OLnBhcnNlKSlcbiAgICAgICAgICAub24oJ2RhdGEnLCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHJlc3BvbnNlWydyZXFpZCddO1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KGlkLCByZXNwb25zZSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9kaXNwb3NlZCkge1xuICAgICAgICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBoYW5kbGUgbGliY2xhbmcgb3V0cHV0LCBtb3N0IGxpa2VseSB0aGUgbGliY2xhbmcgcHl0aG9uJ1xuICAgICAgICAgICAgICAgICsgJyBzZXJ2ZXIgY3Jhc2hlZC4nLFxuICAgICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB0aGlzLl9jbGVhbnVwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCA9IHRoaXMuX25leHRSZXF1ZXN0SWQgLSAxO1xuICAgICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPSBjb25uZWN0aW9uO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ0NvdWxkIG5vdCBjb25uZWN0IHRvIENsYW5nIHNlcnZlcicsIGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYXN5bmNDb25uZWN0aW9uO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlQXN5bmNDb25uZWN0aW9uKHNyYzogc3RyaW5nKTogUHJvbWlzZTxDb25uZWN0aW9uPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHtsaWJDbGFuZ0xpYnJhcnlGaWxlLCBweXRob25QYXRoRW52LCBweXRob25FeGVjdXRhYmxlfSA9IGF3YWl0IF9maW5kQ2xhbmdTZXJ2ZXJBcmdzKCk7XG4gICAgICBjb25zdCBlbnY6IGFueSA9IHtcbiAgICAgICAgUFlUSE9OUEFUSDogcHl0aG9uUGF0aEVudixcbiAgICAgIH07XG4gICAgICAvLyBOb3RlOiB1bmRlZmluZWQgdmFsdWVzIGluIGBlbnZgIGdldCBzZXJpYWxpemVkIHRvIHRoZSBzdHJpbmcgXCJ1bmRlZmluZWRcIi5cbiAgICAgIC8vIFRodXMgd2UgaGF2ZSB0byBtYWtlIHN1cmUgdGhlIGtleSBvbmx5IGdldHMgc2V0IGZvciB2YWxpZCB2YWx1ZXMuXG4gICAgICBpZiAobGliQ2xhbmdMaWJyYXJ5RmlsZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIE9uIE1hYyBPU1ggRWwgQ2FwaXRhbiwgYmFzaCBzZWVtcyB0byB3aXBlIG91dCB0aGUgYExEX0xJQlJBUllfUEFUSGAgYW5kXG4gICAgICAgIC8vIGBEWUxEX0xJQlJBUllfUEFUSGAgZW52aXJvbm1lbnQgdmFyaWFibGVzLiBTbywgc2V0IHRoaXMgZW52IHZhciB3aGljaCBpcyByZWFkIGJ5XG4gICAgICAgIC8vIGNsYW5nX3NlcnZlci5weSB0byBleHBsaWNpdGx5IHNldCB0aGUgZmlsZSBwYXRoIHRvIGxvYWQuXG4gICAgICAgIGVudi5MSUJfQ0xBTkdfTElCUkFSWV9GSUxFID0gbGliQ2xhbmdMaWJyYXJ5RmlsZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICAgIGN3ZDogcGF0aC5kaXJuYW1lKHBhdGhUb0xpYkNsYW5nU2VydmVyKSxcbiAgICAgICAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIHVzZSBpdHMgb3JkaW5hcnkgc3RkZXJyIGZvciBlcnJvcnMuXG4gICAgICAgIHN0ZGlvOiBbJ3BpcGUnLCBudWxsLCAncGlwZScsICdwaXBlJ10sXG4gICAgICAgIGRldGFjaGVkOiBmYWxzZSwgLy8gV2hlbiBBdG9tIGlzIGtpbGxlZCwgY2xhbmdfc2VydmVyLnB5IHNob3VsZCBiZSBraWxsZWQsIHRvby5cbiAgICAgICAgZW52LFxuICAgICAgfTtcblxuICAgICAgLy8gTm90ZSB0aGF0IHNhZmVTcGF3bigpIG9mdGVuIG92ZXJyaWRlcyBvcHRpb25zLmVudi5QQVRILCBidXQgdGhhdCBvbmx5IGhhcHBlbnMgd2hlblxuICAgICAgLy8gb3B0aW9ucy5lbnYgaXMgdW5kZWZpbmVkICh3aGljaCBpcyBub3QgdGhlIGNhc2UgaGVyZSkuIFRoaXMgd2lsbCBvbmx5IGJlIGFuIGlzc3VlIGlmIHRoZVxuICAgICAgLy8gc3lzdGVtIGNhbm5vdCBmaW5kIGBweXRob25FeGVjdXRhYmxlYC5cbiAgICAgIGNvbnN0IGNoaWxkID0gYXdhaXQgc2FmZVNwYXduKHB5dGhvbkV4ZWN1dGFibGUsIC8qIGFyZ3MgKi8gW3BhdGhUb0xpYkNsYW5nU2VydmVyXSwgb3B0aW9ucyk7XG5cbiAgICAgIGNoaWxkLm9uKCdjbG9zZScsIGV4aXRDb2RlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9kaXNwb3NlZCkge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcihgJHtwYXRoVG9MaWJDbGFuZ1NlcnZlcn0gZXhpdGVkIHdpdGggY29kZSAke2V4aXRDb2RlfWApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIGVycm9yID0+IHtcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgICAgZXJyb3IgPSBlcnJvci50b1N0cmluZygndXRmOCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlcnJvci5pbmRleE9mKERZTERfV0FSTklORykgPT09IC0xKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciByZWNlaXZpbmcgZGF0YScsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvKiAkRmxvd0ZpeE1lIC0gdXBkYXRlIEZsb3cgZGVmcyBmb3IgQ2hpbGRQcm9jZXNzICovXG4gICAgICBjb25zdCB3cml0YWJsZVN0cmVhbSA9IGNoaWxkLnN0ZGlvWzNdO1xuICAgICAgd3JpdGFibGVTdHJlYW0ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHdyaXRpbmcgZGF0YScsIGVycm9yKTtcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgY2hpbGRSdW5uaW5nID0gdHJ1ZTtcbiAgICAgIGNoaWxkLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgICBjaGlsZFJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgLy8gTWFrZSBzdXJlIHRoZSBiaWRpcmVjdGlvbmFsIGNvbW11bmljYXRpb24gY2hhbm5lbCBpcyBzZXQgdXAgYmVmb3JlXG4gICAgICAvLyByZXNvbHZpbmcgdGhpcyBQcm9taXNlLlxuICAgICAgY2hpbGQuc3Rkb3V0Lm9uY2UoJ2RhdGEnLCBmdW5jdGlvbihkYXRhOiBCdWZmZXIpIHtcbiAgICAgICAgaWYgKGRhdGEudG9TdHJpbmcoKS50cmltKCkgPT09ICdhY2snKSB7XG4gICAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoY2hpbGRSdW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgICAgICAgICAgIGNoaWxkUnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogY2hpbGQsXG4gICAgICAgICAgICByZWFkYWJsZVN0cmVhbTogY2hpbGQuc3Rkb3V0LFxuICAgICAgICAgICAgd3JpdGFibGVTdHJlYW0sXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHdyaXRhYmxlU3RyZWFtLndyaXRlKGBpbml0OiR7c3JjfVxcbmApO1xuICAgIH0pO1xuICB9XG5cbn1cbiJdfQ==