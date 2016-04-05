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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDOztBQUVILFlBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixhQUFLLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFNO0FBQ3JCLHNCQUFZLEdBQUcsS0FBSyxDQUFDO1NBQ3RCLENBQUMsQ0FBQzs7O0FBR0gsYUFBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVMsSUFBWSxFQUFFO0FBQy9DLGNBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLEtBQUssRUFBRTtBQUNwQyxnQkFBTSxNQUFNLEdBQUc7QUFDYixxQkFBTyxFQUFFLG1CQUFNO0FBQ2Isb0JBQUksWUFBWSxFQUFFO0FBQ2hCLHVCQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDYiw4QkFBWSxHQUFHLEtBQUssQ0FBQztpQkFDdEI7ZUFDRjtBQUNELHFCQUFPLEVBQUUsS0FBSztBQUNkLDRCQUFjLEVBQUUsS0FBSyxDQUFDLE1BQU07QUFDNUIsNEJBQWMsRUFBZCxjQUFjO2FBQ2YsQ0FBQztBQUNGLG1CQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDakIsTUFBTTtBQUNMLGtCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7V0FDZDtTQUNGLENBQUMsQ0FBQztBQUNILHNCQUFjLENBQUMsS0FBSyxXQUFTLEdBQUcsUUFBSyxDQUFDO09BQ3ZDLEVBQUMsQ0FBQztLQUNKOzs7U0ExUWtCLFdBQVc7OztxQkFBWCxXQUFXIiwiZmlsZSI6IkNsYW5nU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgQ2xhbmdGbGFnc01hbmFnZXIgZnJvbSAnLi9DbGFuZ0ZsYWdzTWFuYWdlcic7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHNwbGl0IGZyb20gJ3NwbGl0JztcblxuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQge2NoZWNrT3V0cHV0LCBzYWZlU3Bhd24sIHByb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5cbi8vIERvIG5vdCB0aWUgdXAgdGhlIEJ1Y2sgc2VydmVyIGNvbnRpbnVvdXNseSByZXRyeWluZyBmb3IgZmxhZ3MuXG5jb25zdCBGTEFHU19SRVRSWV9MSU1JVCA9IDI7XG5cbi8vIE1hYyBPUyBYIChFbCBDYXBpdGFuKSBwcmludHMgdGhpcyB3YXJuaW5nIHdoZW4gbG9hZGluZyB0aGUgbGliY2xhbmcgbGlicmFyeS5cbi8vIEl0J3Mgbm90IHNpbGVuY2VhYmxlIGFuZCBoYXMgbm8gZWZmZWN0LCBzbyBqdXN0IGlnbm9yZSBpdC5cbmNvbnN0IERZTERfV0FSTklORyA9ICdkeWxkOiB3YXJuaW5nLCBMQ19SUEFUSCc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3QgcGF0aFRvTGliQ2xhbmdTZXJ2ZXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHl0aG9uL2NsYW5nX3NlcnZlci5weScpO1xuXG5hc3luYyBmdW5jdGlvbiBfZmluZENsYW5nU2VydmVyQXJncygpOiBQcm9taXNlPHtcbiAgbGliQ2xhbmdMaWJyYXJ5RmlsZTogP3N0cmluZztcbiAgcHl0aG9uRXhlY3V0YWJsZTogc3RyaW5nO1xuICBweXRob25QYXRoRW52OiA/c3RyaW5nO1xufT4ge1xuICBsZXQgZmluZENsYW5nU2VydmVyQXJncztcbiAgdHJ5IHtcbiAgICBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID0gcmVxdWlyZSgnLi9mYi9maW5kLWNsYW5nLXNlcnZlci1hcmdzJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZ25vcmUuXG4gIH1cblxuICBsZXQgbGliQ2xhbmdMaWJyYXJ5RmlsZTtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3hjb2RlLXNlbGVjdCcsIFsnLS1wcmludC1wYXRoJ10pO1xuICAgIGlmIChyZXN1bHQuZXhpdENvZGUgPT09IDApIHtcbiAgICAgIGxpYkNsYW5nTGlicmFyeUZpbGUgPSByZXN1bHQuc3Rkb3V0LnRyaW0oKSArXG4gICAgICAgICcvVG9vbGNoYWlucy9YY29kZURlZmF1bHQueGN0b29sY2hhaW4vdXNyL2xpYi9saWJjbGFuZy5keWxpYic7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzID0ge1xuICAgIGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgcHl0aG9uRXhlY3V0YWJsZTogJ3B5dGhvbicsXG4gICAgcHl0aG9uUGF0aEVudjogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3B5dGhvbnBhdGgnKSxcbiAgfTtcbiAgaWYgKHR5cGVvZiBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzT3ZlcnJpZGVzID0gYXdhaXQgZmluZENsYW5nU2VydmVyQXJncygpO1xuICAgIHJldHVybiB7Li4uY2xhbmdTZXJ2ZXJBcmdzLCAuLi5jbGFuZ1NlcnZlckFyZ3NPdmVycmlkZXN9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbGFuZ1NlcnZlckFyZ3M7XG4gIH1cbn1cblxubGV0IGdldERlZmF1bHRGbGFncztcbmFzeW5jIGZ1bmN0aW9uIGF1Z21lbnREZWZhdWx0RmxhZ3Moc3JjOiBzdHJpbmcsIGZsYWdzOiBBcnJheTxzdHJpbmc+KTogUHJvbWlzZTxBcnJheTxzdHJpbmc+PiB7XG4gIGlmIChnZXREZWZhdWx0RmxhZ3MgPT09IHVuZGVmaW5lZCkge1xuICAgIGdldERlZmF1bHRGbGFncyA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGdldERlZmF1bHRGbGFncyA9IHJlcXVpcmUoJy4vZmIvZ2V0LWRlZmF1bHQtZmxhZ3MnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBPcGVuLXNvdXJjZSB2ZXJzaW9uXG4gICAgfVxuICB9XG4gIGlmIChnZXREZWZhdWx0RmxhZ3MgIT0gbnVsbCkge1xuICAgIHJldHVybiBmbGFncy5jb25jYXQoYXdhaXQgZ2V0RGVmYXVsdEZsYWdzKHNyYykpO1xuICB9XG4gIHJldHVybiBmbGFncztcbn1cblxudHlwZSBDb25uZWN0aW9uID0ge1xuICBkaXNwb3NlOiAoKSA9PiBhbnk7XG4gIHByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICByZWFkYWJsZVN0cmVhbTogc3RyZWFtJFJlYWRhYmxlO1xuICB3cml0YWJsZVN0cmVhbTogc3RyZWFtJFdyaXRhYmxlO1xufVxuXG4vLyBMaXN0IG9mIHN1cHBvcnRlZCBtZXRob2RzLiBLZWVwIGluIHN5bmMgd2l0aCB0aGUgUHl0aG9uIHNlcnZlci5cbnR5cGUgQ2xhbmdTZXJ2ZXJSZXF1ZXN0ID1cbiAgJ2NvbXBpbGUnIHwgJ2dldF9jb21wbGV0aW9ucycgfCAnZ2V0X2RlY2xhcmF0aW9uJyB8ICdnZXRfZGVjbGFyYXRpb25faW5mbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENsYW5nU2VydmVyIHtcblxuICBfc3JjOiBzdHJpbmc7XG4gIF9jbGFuZ0ZsYWdzTWFuYWdlcjogQ2xhbmdGbGFnc01hbmFnZXI7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9uZXh0UmVxdWVzdElkOiBudW1iZXI7XG4gIF9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkOiBudW1iZXI7XG4gIF9hc3luY0Nvbm5lY3Rpb246ID9Db25uZWN0aW9uO1xuICBfcGVuZGluZ0NvbXBpbGVSZXF1ZXN0czogbnVtYmVyO1xuICBfZ2V0QXN5bmNDb25uZWN0aW9uOiAoKSA9PiBQcm9taXNlPD9Db25uZWN0aW9uPjtcbiAgX2Rpc3Bvc2VkOiBib29sZWFuO1xuXG4gIC8vIENhY2hlIHRoZSBmbGFncy1mZXRjaGluZyBwcm9taXNlIHNvIHdlIGRvbid0IGVuZCB1cCBpbnZva2luZyBCdWNrIHR3aWNlLlxuICBfZmxhZ3NQcm9taXNlOiA/UHJvbWlzZTw/QXJyYXk8c3RyaW5nPj47XG4gIF9mbGFnc1JldHJpZXM6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihjbGFuZ0ZsYWdzTWFuYWdlcjogQ2xhbmdGbGFnc01hbmFnZXIsIHNyYzogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3JjID0gc3JjO1xuICAgIHRoaXMuX2NsYW5nRmxhZ3NNYW5hZ2VyID0gY2xhbmdGbGFnc01hbmFnZXI7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9uZXh0UmVxdWVzdElkID0gMDtcbiAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gLTE7XG4gICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy5fZ2V0QXN5bmNDb25uZWN0aW9uID0gcHJvbWlzZXMuc2VyaWFsaXplQXN5bmNDYWxsKHRoaXMuX2dldEFzeW5jQ29ubmVjdGlvbkltcGwuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fZGlzcG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9mbGFnc1JldHJpZXMgPSAwO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NlZCA9IHRydWU7XG4gICAgdGhpcy5fY2xlYW51cCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgUlNTIG9mIHRoZSBjaGlsZCBwcm9jZXNzIGluIGJ5dGVzLlxuICAgKiBXb3JrcyBvbiBVbml4IGFuZCBNYWMgT1MgWC5cbiAgICovXG4gIGFzeW5jIGdldE1lbW9yeVVzYWdlKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgY29uc3Qge2V4aXRDb2RlLCBzdGRvdXR9ID0gYXdhaXQgY2hlY2tPdXRwdXQoXG4gICAgICAncHMnLFxuICAgICAgWyctcCcsIHRoaXMuX2FzeW5jQ29ubmVjdGlvbi5wcm9jZXNzLnBpZC50b1N0cmluZygpLCAnLW8nLCAncnNzPSddLFxuICAgICk7XG4gICAgaWYgKGV4aXRDb2RlICE9PSAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIHBhcnNlSW50KHN0ZG91dCwgMTApICogMTAyNDsgLy8gcHMgcmV0dXJucyBLQlxuICB9XG5cbiAgX2NsZWFudXAoKSB7XG4gICAgLy8gRmFpbCBhbGwgcGVuZGluZyByZXF1ZXN0cy5cbiAgICAvLyBUaGUgQ2xhbmcgc2VydmVyIHJlY2VpdmVzIHJlcXVlc3RzIHNlcmlhbGx5IHZpYSBzdGRpbiAoYW5kIHByb2Nlc3NlcyB0aGVtIGluIHRoYXQgb3JkZXIpXG4gICAgLy8gc28gaXQncyBxdWl0ZSBzYWZlIHRvIGFzc3VtZSB0aGF0IHJlcXVlc3RzIGFyZSBwcm9jZXNzZWQgaW4gb3JkZXIuXG4gICAgZm9yIChsZXQgcmVxaWQgPSB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkICsgMTsgcmVxaWQgPCB0aGlzLl9uZXh0UmVxdWVzdElkOyByZXFpZCsrKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQocmVxaWQudG9TdHJpbmcoMTYpLCB7ZXJyb3I6ICdTZXJ2ZXIgd2FzIGtpbGxlZC4nfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2FzeW5jQ29ubmVjdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICBnZXRGbGFncygpOiBQcm9taXNlPD9BcnJheTxzdHJpbmc+PiB7XG4gICAgaWYgKHRoaXMuX2ZsYWdzUHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmxhZ3NQcm9taXNlO1xuICAgIH1cbiAgICB0aGlzLl9mbGFnc1Byb21pc2UgPSB0aGlzLl9jbGFuZ0ZsYWdzTWFuYWdlci5nZXRGbGFnc0ZvclNyYyh0aGlzLl9zcmMpXG4gICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICBgY2xhbmctc2VydmVyOiBDb3VsZCBub3QgZ2V0IGZsYWdzIGZvciAke3RoaXMuX3NyY30gKHJldHJ5ICR7dGhpcy5fZmxhZ3NSZXRyaWVzfSlgLCBlKTtcbiAgICAgICAgaWYgKHRoaXMuX2ZsYWdzUmV0cmllcyA8IEZMQUdTX1JFVFJZX0xJTUlUKSB7XG4gICAgICAgICAgdGhpcy5fZmxhZ3NQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9mbGFnc1JldHJpZXMrKztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2ZsYWdzUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIG1ha2VSZXF1ZXN0KFxuICAgIG1ldGhvZDogQ2xhbmdTZXJ2ZXJSZXF1ZXN0LFxuICAgIGRlZmF1bHRGbGFnczogP0FycmF5PHN0cmluZz4sXG4gICAgcGFyYW1zOiBPYmplY3QsXG4gICk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIGludmFyaWFudCghdGhpcy5fZGlzcG9zZWQsICdjYWxsaW5nIG1ha2VSZXF1ZXN0IG9uIGEgZGlzcG9zZWQgQ2xhbmdTZXJ2ZXInKTtcbiAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMrKztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMpIHtcbiAgICAgIC8vIEFsbCBvdGhlciByZXF1ZXN0cyBzaG91bGQgaW5zdGFudGx5IGZhaWwuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9tYWtlUmVxdWVzdEltcGwobWV0aG9kLCBkZWZhdWx0RmxhZ3MsIHBhcmFtcyk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChtZXRob2QgPT09ICdjb21waWxlJykge1xuICAgICAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzLS07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgX21ha2VSZXF1ZXN0SW1wbChcbiAgICBtZXRob2Q6IENsYW5nU2VydmVyUmVxdWVzdCxcbiAgICBkZWZhdWx0RmxhZ3M6ID9BcnJheTxzdHJpbmc+LFxuICAgIHBhcmFtczogT2JqZWN0LFxuICApOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgICBsZXQgZmxhZ3MgPSBhd2FpdCB0aGlzLmdldEZsYWdzKCk7XG4gICAgbGV0IGFjY3VyYXRlRmxhZ3MgPSB0cnVlO1xuICAgIGlmIChmbGFncyA9PSBudWxsKSB7XG4gICAgICBpZiAoZGVmYXVsdEZsYWdzID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBmbGFncyA9IGF3YWl0IGF1Z21lbnREZWZhdWx0RmxhZ3ModGhpcy5fc3JjLCBkZWZhdWx0RmxhZ3MpO1xuICAgICAgYWNjdXJhdGVGbGFncyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLl9nZXRBc3luY0Nvbm5lY3Rpb24oKTtcbiAgICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXFpZCA9IHRoaXMuX2dldE5leHRSZXF1ZXN0SWQoKTtcbiAgICBjb25zdCByZXF1ZXN0ID0ge3JlcWlkLCBtZXRob2QsIGZsYWdzLCAuLi5wYXJhbXN9O1xuICAgIGNvbnN0IGxvZ0RhdGEgPSBKU09OLnN0cmluZ2lmeShyZXF1ZXN0LCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgLy8gRmlsZSBjb250ZW50cyBhcmUgdG9vIGxhcmdlIGFuZCBjbHV0dGVyIHVwIHRoZSBsb2dzLCBzbyBleGNsdWRlIHRoZW0uXG4gICAgICAvLyBXZSBnZW5lcmFsbHkgb25seSB3YW50IHRvIHNlZSB0aGUgZmxhZ3MgZm9yICdjb21waWxlJyBjb21tYW5kcywgc2luY2UgdGhleSdsbCB1c3VhbGx5XG4gICAgICAvLyBiZSB0aGUgc2FtZSBmb3IgYWxsIG90aGVyIGNvbW1hbmRzIChiYXJyaW5nIGFuIHVuZXhwZWN0ZWQgcmVzdGFydCkuXG4gICAgICBpZiAoa2V5ID09PSAnY29udGVudHMnIHx8IChtZXRob2QgIT09ICdjb21waWxlJyAmJiBrZXkgPT09ICdmbGFncycpKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsb2dnZXIuZGVidWcoJ0xpYkNsYW5nIHJlcXVlc3Q6ICcgKyBsb2dEYXRhKTtcbiAgICAvLyBCZWNhdXNlIE5vZGUgdXNlcyBhbiBldmVudC1sb29wLCB3ZSBkbyBub3QgaGF2ZSB0byB3b3JyeSBhYm91dCBhIGNhbGwgdG9cbiAgICAvLyB3cml0ZSgpIGNvbWluZyBpbiBmcm9tIGFub3RoZXIgdGhyZWFkIGJldHdlZW4gb3VyIHR3byBjYWxscyBoZXJlLlxuICAgIGNvbnN0IHt3cml0YWJsZVN0cmVhbX0gPSBjb25uZWN0aW9uO1xuICAgIHdyaXRhYmxlU3RyZWFtLndyaXRlKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZSgnXFxuJyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKHJlcWlkLCByZXNwb25zZSA9PiB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnTGliQ2xhbmcgcmVzcG9uc2U6ICcgKyBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgICBjb25zdCBpc0Vycm9yID0gJ2Vycm9yJyBpbiByZXNwb25zZTtcbiAgICAgICAgaWYgKGlzRXJyb3IgJiYgIXRoaXMuX2Rpc3Bvc2VkKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdlcnJvciByZWNlaXZlZCBmcm9tIGNsYW5nX3NlcnZlci5weSBmb3IgcmVxdWVzdDonLFxuICAgICAgICAgICAgbG9nRGF0YSxcbiAgICAgICAgICAgIHJlc3BvbnNlWydlcnJvciddKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gcGFyc2VJbnQocmVxaWQsIDE2KTtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgICAgLy8gVXNpbmcgZGVmYXVsdCBmbGFncyB0eXBpY2FsbHkgcmVzdWx0cyBpbiBwb29yIGRpYWdub3N0aWNzLCBzbyBsZXQgdGhlIGNhbGxlciBrbm93LlxuICAgICAgICAgIHJlc3BvbnNlLmFjY3VyYXRlRmxhZ3MgPSBhY2N1cmF0ZUZsYWdzO1xuICAgICAgICB9XG4gICAgICAgIChpc0Vycm9yID8gcmVqZWN0IDogcmVzb2x2ZSkocmVzcG9uc2UpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBfZ2V0TmV4dFJlcXVlc3RJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy5fbmV4dFJlcXVlc3RJZCsrKS50b1N0cmluZygxNik7XG4gIH1cblxuICBhc3luYyBfZ2V0QXN5bmNDb25uZWN0aW9uSW1wbCgpOiBQcm9taXNlPD9Db25uZWN0aW9uPiB7XG4gICAgaWYgKHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5jcmVhdGVBc3luY0Nvbm5lY3Rpb24odGhpcy5fc3JjKTtcbiAgICAgICAgY29ubmVjdGlvbi5yZWFkYWJsZVN0cmVhbVxuICAgICAgICAgIC5waXBlKHNwbGl0KEpTT04ucGFyc2UpKVxuICAgICAgICAgIC5vbignZGF0YScsIHJlc3BvbnNlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlkID0gcmVzcG9uc2VbJ3JlcWlkJ107XG4gICAgICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoaWQsIHJlc3BvbnNlKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuX2Rpc3Bvc2VkKSB7XG4gICAgICAgICAgICAgIGxvZ2dlci5lcnJvcihcbiAgICAgICAgICAgICAgICAnRmFpbGVkIHRvIGhhbmRsZSBsaWJjbGFuZyBvdXRwdXQsIG1vc3QgbGlrZWx5IHRoZSBsaWJjbGFuZyBweXRob24nXG4gICAgICAgICAgICAgICAgKyAnIHNlcnZlciBjcmFzaGVkLicsXG4gICAgICAgICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIHRoaXMuX2NsZWFudXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gdGhpcy5fbmV4dFJlcXVlc3RJZCAtIDE7XG4gICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gQ2xhbmcgc2VydmVyJywgZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hc3luY0Nvbm5lY3Rpb247XG4gIH1cblxuICBhc3luYyBjcmVhdGVBc3luY0Nvbm5lY3Rpb24oc3JjOiBzdHJpbmcpOiBQcm9taXNlPENvbm5lY3Rpb24+IHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qge2xpYkNsYW5nTGlicmFyeUZpbGUsIHB5dGhvblBhdGhFbnYsIHB5dGhvbkV4ZWN1dGFibGV9ID0gYXdhaXQgX2ZpbmRDbGFuZ1NlcnZlckFyZ3MoKTtcbiAgICAgIGNvbnN0IGVudjogYW55ID0ge1xuICAgICAgICBQWVRIT05QQVRIOiBweXRob25QYXRoRW52LFxuICAgICAgfTtcbiAgICAgIC8vIE5vdGU6IHVuZGVmaW5lZCB2YWx1ZXMgaW4gYGVudmAgZ2V0IHNlcmlhbGl6ZWQgdG8gdGhlIHN0cmluZyBcInVuZGVmaW5lZFwiLlxuICAgICAgLy8gVGh1cyB3ZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGUga2V5IG9ubHkgZ2V0cyBzZXQgZm9yIHZhbGlkIHZhbHVlcy5cbiAgICAgIGlmIChsaWJDbGFuZ0xpYnJhcnlGaWxlICE9IG51bGwpIHtcbiAgICAgICAgLy8gT24gTWFjIE9TWCBFbCBDYXBpdGFuLCBiYXNoIHNlZW1zIHRvIHdpcGUgb3V0IHRoZSBgTERfTElCUkFSWV9QQVRIYCBhbmRcbiAgICAgICAgLy8gYERZTERfTElCUkFSWV9QQVRIYCBlbnZpcm9ubWVudCB2YXJpYWJsZXMuIFNvLCBzZXQgdGhpcyBlbnYgdmFyIHdoaWNoIGlzIHJlYWQgYnlcbiAgICAgICAgLy8gY2xhbmdfc2VydmVyLnB5IHRvIGV4cGxpY2l0bHkgc2V0IHRoZSBmaWxlIHBhdGggdG8gbG9hZC5cbiAgICAgICAgZW52LkxJQl9DTEFOR19MSUJSQVJZX0ZJTEUgPSBsaWJDbGFuZ0xpYnJhcnlGaWxlO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgY3dkOiBwYXRoLmRpcm5hbWUocGF0aFRvTGliQ2xhbmdTZXJ2ZXIpLFxuICAgICAgICAvLyBUaGUgcHJvY2VzcyBzaG91bGQgdXNlIGl0cyBvcmRpbmFyeSBzdGRlcnIgZm9yIGVycm9ycy5cbiAgICAgICAgc3RkaW86IFsncGlwZScsIG51bGwsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgICAgZGV0YWNoZWQ6IGZhbHNlLCAvLyBXaGVuIEF0b20gaXMga2lsbGVkLCBjbGFuZ19zZXJ2ZXIucHkgc2hvdWxkIGJlIGtpbGxlZCwgdG9vLlxuICAgICAgICBlbnYsXG4gICAgICB9O1xuXG4gICAgICAvLyBOb3RlIHRoYXQgc2FmZVNwYXduKCkgb2Z0ZW4gb3ZlcnJpZGVzIG9wdGlvbnMuZW52LlBBVEgsIGJ1dCB0aGF0IG9ubHkgaGFwcGVucyB3aGVuXG4gICAgICAvLyBvcHRpb25zLmVudiBpcyB1bmRlZmluZWQgKHdoaWNoIGlzIG5vdCB0aGUgY2FzZSBoZXJlKS4gVGhpcyB3aWxsIG9ubHkgYmUgYW4gaXNzdWUgaWYgdGhlXG4gICAgICAvLyBzeXN0ZW0gY2Fubm90IGZpbmQgYHB5dGhvbkV4ZWN1dGFibGVgLlxuICAgICAgY29uc3QgY2hpbGQgPSBhd2FpdCBzYWZlU3Bhd24ocHl0aG9uRXhlY3V0YWJsZSwgLyogYXJncyAqLyBbcGF0aFRvTGliQ2xhbmdTZXJ2ZXJdLCBvcHRpb25zKTtcblxuICAgICAgY2hpbGQub24oJ2Nsb3NlJywgZXhpdENvZGUgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX2Rpc3Bvc2VkKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKGAke3BhdGhUb0xpYkNsYW5nU2VydmVyfSBleGl0ZWQgd2l0aCBjb2RlICR7ZXhpdENvZGV9YCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZXJyb3IgPT4ge1xuICAgICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICBlcnJvciA9IGVycm9yLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yLmluZGV4T2YoRFlMRF9XQVJOSU5HKSA9PT0gLTEpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHJlY2VpdmluZyBkYXRhJywgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8qICRGbG93Rml4TWUgLSB1cGRhdGUgRmxvdyBkZWZzIGZvciBDaGlsZFByb2Nlc3MgKi9cbiAgICAgIGNvbnN0IHdyaXRhYmxlU3RyZWFtID0gY2hpbGQuc3RkaW9bM107XG4gICAgICB3cml0YWJsZVN0cmVhbS5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd3JpdGluZyBkYXRhJywgZXJyb3IpO1xuICAgICAgfSk7XG5cbiAgICAgIGxldCBjaGlsZFJ1bm5pbmcgPSB0cnVlO1xuICAgICAgY2hpbGQub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgIGNoaWxkUnVubmluZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICAvLyBNYWtlIHN1cmUgdGhlIGJpZGlyZWN0aW9uYWwgY29tbXVuaWNhdGlvbiBjaGFubmVsIGlzIHNldCB1cCBiZWZvcmVcbiAgICAgIC8vIHJlc29sdmluZyB0aGlzIFByb21pc2UuXG4gICAgICBjaGlsZC5zdGRvdXQub25jZSgnZGF0YScsIGZ1bmN0aW9uKGRhdGE6IEJ1ZmZlcikge1xuICAgICAgICBpZiAoZGF0YS50b1N0cmluZygpLnRyaW0oKSA9PT0gJ2FjaycpIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChjaGlsZFJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC5raWxsKCk7XG4gICAgICAgICAgICAgICAgY2hpbGRSdW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBjaGlsZCxcbiAgICAgICAgICAgIHJlYWRhYmxlU3RyZWFtOiBjaGlsZC5zdGRvdXQsXG4gICAgICAgICAgICB3cml0YWJsZVN0cmVhbSxcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZWplY3QoZGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgd3JpdGFibGVTdHJlYW0ud3JpdGUoYGluaXQ6JHtzcmN9XFxuYCk7XG4gICAgfSk7XG4gIH1cblxufVxuIl19