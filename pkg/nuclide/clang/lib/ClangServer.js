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
    var result = yield (0, _commons.checkOutput)('xcode-select', ['--print-path']);
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

var createAsyncConnection = _asyncToGenerator(function* (src) {
  return yield new Promise(_asyncToGenerator(function* (resolve, reject) {
    var _ref = yield _findClangServerArgs();

    var libClangLibraryFile = _ref.libClangLibraryFile;
    var pythonPathEnv = _ref.pythonPathEnv;
    var pythonExecutable = _ref.pythonExecutable;

    var options = {
      cwd: _path2['default'].dirname(pathToLibClangServer),
      // The process should use its ordinary stderr for errors.
      stdio: ['pipe', null, 'pipe', 'pipe'],
      detached: false, // When Atom is killed, clang_server.py should be killed, too.
      env: {
        // On Mac OSX El Capitan, bash seems to wipe out the `LD_LIBRARY_PATH` and
        // `DYLD_LIBRARY_PATH` environment letiables. So, set this env let which is read by
        // clang_server.py to explicitly set the file path to load.
        LIB_CLANG_LIBRARY_FILE: libClangLibraryFile,
        PYTHONPATH: pythonPathEnv
      }
    };

    // Note that safeSpawn() often overrides options.env.PATH, but that only happens when
    // options.env is undefined (which is not the case here). This will only be an issue if the
    // system cannot find `pythonExecutable`.
    var child = yield (0, _commons.safeSpawn)(pythonExecutable, /* args */[pathToLibClangServer], options);

    child.on('close', function (exitCode) {
      if (!this._disposed) {
        logger.error('%s exited with code %s', pathToLibClangServer, exitCode);
      }
    });
    child.stderr.on('data', function (error) {
      if (error instanceof Buffer) {
        error = error.toString('utf8');
      }
      logger.error('Error receiving data', error);
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
      if (data.toString() === 'ack\n') {
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
}

// List of supported methods. Keep in sync with the Python server.
);

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

var _commons = require('../../commons');

var _logging = require('../../logging');

// Do not tie up the Buck server continuously retrying for flags.
var FLAGS_RETRY_LIMIT = 2;

var logger = (0, _logging.getLogger)();
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
    this._getAsyncConnection = _commons.promises.serializeAsyncCall(this._getAsyncConnectionImpl.bind(this));
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

      var _ref2 = yield (0, _commons.checkOutput)('ps', ['-p', this._asyncConnection.process.pid.toString(), '-o', 'rss=']);

      var exitCode = _ref2.exitCode;
      var stdout = _ref2.stdout;

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
        if (key === 'contents') {
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
          if (isError) {
            logger.error('error received from clang_server.py for request:\n%o\nError:%s', logData, response['error']);
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
          var connection = yield createAsyncConnection(this._src);
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
  }]);

  return ClangServer;
})();

exports['default'] = ClangServer;
module.exports = exports['default'];

// Cache the flags-fetching promise so we don't end up invoking Buck twice.
//# sourceMappingURL=data:application/json;base64,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QU0sQ0FBQyxLQUFLLENBQ1YsbUVBQW1FLEdBQ2pFLGtCQUFrQixFQUNwQixLQUFLLENBQ04sQ0FBQztBQUNGLHFCQUFLLFFBQVEsRUFBRSxDQUFDO2FBQ2pCO0FBQ0QsbUJBQUssZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLG1CQUFLLHVCQUF1QixHQUFHLE9BQUssY0FBYyxHQUFHLENBQUMsQ0FBQztXQUN4RCxDQUFDLENBQUM7QUFDTCxjQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO1NBQ3BDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixnQkFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0RDtPQUNGO0FBQ0QsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztTQTlMa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiQ2xhbmdTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBDbGFuZ0ZsYWdzTWFuYWdlciBmcm9tICcuL0NsYW5nRmxhZ3NNYW5hZ2VyJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7Y2hlY2tPdXRwdXQsIHNhZmVTcGF3biwgcHJvbWlzZXN9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG4vLyBEbyBub3QgdGllIHVwIHRoZSBCdWNrIHNlcnZlciBjb250aW51b3VzbHkgcmV0cnlpbmcgZm9yIGZsYWdzLlxuY29uc3QgRkxBR1NfUkVUUllfTElNSVQgPSAyO1xuXG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcbmNvbnN0IHBhdGhUb0xpYkNsYW5nU2VydmVyID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3B5dGhvbi9jbGFuZ19zZXJ2ZXIucHknKTtcblxuYXN5bmMgZnVuY3Rpb24gX2ZpbmRDbGFuZ1NlcnZlckFyZ3MoKTogUHJvbWlzZTx7XG4gIGxpYkNsYW5nTGlicmFyeUZpbGU6ID9zdHJpbmcsXG4gIHB5dGhvbkV4ZWN1dGFibGU6IHN0cmluZyxcbiAgcHl0aG9uUGF0aEVudjogP3N0cmluZyxcbn0+IHtcbiAgbGV0IGZpbmRDbGFuZ1NlcnZlckFyZ3M7XG4gIHRyeSB7XG4gICAgZmluZENsYW5nU2VydmVyQXJncyA9IHJlcXVpcmUoJy4vZmIvZmluZC1jbGFuZy1zZXJ2ZXItYXJncycpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlLlxuICB9XG5cbiAgbGV0IGxpYkNsYW5nTGlicmFyeUZpbGU7XG4gIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnZGFyd2luJykge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrT3V0cHV0KCd4Y29kZS1zZWxlY3QnLCBbJy0tcHJpbnQtcGF0aCddKTtcbiAgICBpZiAocmVzdWx0LmV4aXRDb2RlID09PSAwKSB7XG4gICAgICBsaWJDbGFuZ0xpYnJhcnlGaWxlID0gcmVzdWx0LnN0ZG91dC50cmltKCkgK1xuICAgICAgICAnL1Rvb2xjaGFpbnMvWGNvZGVEZWZhdWx0LnhjdG9vbGNoYWluL3Vzci9saWIvbGliY2xhbmcuZHlsaWInO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNsYW5nU2VydmVyQXJncyA9IHtcbiAgICBsaWJDbGFuZ0xpYnJhcnlGaWxlLFxuICAgIHB5dGhvbkV4ZWN1dGFibGU6ICdweXRob24nLFxuICAgIHB5dGhvblBhdGhFbnY6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9weXRob25wYXRoJyksXG4gIH07XG4gIGlmICh0eXBlb2YgZmluZENsYW5nU2VydmVyQXJncyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnN0IGNsYW5nU2VydmVyQXJnc092ZXJyaWRlcyA9IGF3YWl0IGZpbmRDbGFuZ1NlcnZlckFyZ3MoKTtcbiAgICByZXR1cm4gey4uLmNsYW5nU2VydmVyQXJncywgLi4uY2xhbmdTZXJ2ZXJBcmdzT3ZlcnJpZGVzfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY2xhbmdTZXJ2ZXJBcmdzO1xuICB9XG59XG5cbmxldCBnZXREZWZhdWx0RmxhZ3M7XG5hc3luYyBmdW5jdGlvbiBhdWdtZW50RGVmYXVsdEZsYWdzKHNyYzogc3RyaW5nLCBmbGFnczogQXJyYXk8c3RyaW5nPik6IFByb21pc2U8QXJyYXk8c3RyaW5nPj4ge1xuICBpZiAoZ2V0RGVmYXVsdEZsYWdzID09PSB1bmRlZmluZWQpIHtcbiAgICBnZXREZWZhdWx0RmxhZ3MgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBnZXREZWZhdWx0RmxhZ3MgPSByZXF1aXJlKCcuL2ZiL2dldC1kZWZhdWx0LWZsYWdzJyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gT3Blbi1zb3VyY2UgdmVyc2lvblxuICAgIH1cbiAgfVxuICBpZiAoZ2V0RGVmYXVsdEZsYWdzICE9IG51bGwpIHtcbiAgICByZXR1cm4gZmxhZ3MuY29uY2F0KGF3YWl0IGdldERlZmF1bHRGbGFncyhzcmMpKTtcbiAgfVxuICByZXR1cm4gZmxhZ3M7XG59XG5cbnR5cGUgQ29ubmVjdGlvbiA9IHtcbiAgZGlzcG9zZTogKCkgPT4gYW55LFxuICBwcm9jZXNzOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcyxcbiAgcmVhZGFibGVTdHJlYW06IHN0cmVhbSRSZWFkYWJsZSxcbiAgd3JpdGFibGVTdHJlYW06IHN0cmVhbSRXcml0YWJsZSxcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQXN5bmNDb25uZWN0aW9uKHNyYzogc3RyaW5nKTogUHJvbWlzZTxDb25uZWN0aW9uPiB7XG4gIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qge2xpYkNsYW5nTGlicmFyeUZpbGUsIHB5dGhvblBhdGhFbnYsIHB5dGhvbkV4ZWN1dGFibGV9ID0gYXdhaXQgX2ZpbmRDbGFuZ1NlcnZlckFyZ3MoKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY3dkOiBwYXRoLmRpcm5hbWUocGF0aFRvTGliQ2xhbmdTZXJ2ZXIpLFxuICAgICAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIHVzZSBpdHMgb3JkaW5hcnkgc3RkZXJyIGZvciBlcnJvcnMuXG4gICAgICBzdGRpbzogWydwaXBlJywgbnVsbCwgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgZGV0YWNoZWQ6IGZhbHNlLCAvLyBXaGVuIEF0b20gaXMga2lsbGVkLCBjbGFuZ19zZXJ2ZXIucHkgc2hvdWxkIGJlIGtpbGxlZCwgdG9vLlxuICAgICAgZW52OiB7XG4gICAgICAgIC8vIE9uIE1hYyBPU1ggRWwgQ2FwaXRhbiwgYmFzaCBzZWVtcyB0byB3aXBlIG91dCB0aGUgYExEX0xJQlJBUllfUEFUSGAgYW5kXG4gICAgICAgIC8vIGBEWUxEX0xJQlJBUllfUEFUSGAgZW52aXJvbm1lbnQgbGV0aWFibGVzLiBTbywgc2V0IHRoaXMgZW52IGxldCB3aGljaCBpcyByZWFkIGJ5XG4gICAgICAgIC8vIGNsYW5nX3NlcnZlci5weSB0byBleHBsaWNpdGx5IHNldCB0aGUgZmlsZSBwYXRoIHRvIGxvYWQuXG4gICAgICAgIExJQl9DTEFOR19MSUJSQVJZX0ZJTEU6IGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgICAgIFBZVEhPTlBBVEg6IHB5dGhvblBhdGhFbnYsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBOb3RlIHRoYXQgc2FmZVNwYXduKCkgb2Z0ZW4gb3ZlcnJpZGVzIG9wdGlvbnMuZW52LlBBVEgsIGJ1dCB0aGF0IG9ubHkgaGFwcGVucyB3aGVuXG4gICAgLy8gb3B0aW9ucy5lbnYgaXMgdW5kZWZpbmVkICh3aGljaCBpcyBub3QgdGhlIGNhc2UgaGVyZSkuIFRoaXMgd2lsbCBvbmx5IGJlIGFuIGlzc3VlIGlmIHRoZVxuICAgIC8vIHN5c3RlbSBjYW5ub3QgZmluZCBgcHl0aG9uRXhlY3V0YWJsZWAuXG4gICAgY29uc3QgY2hpbGQgPSBhd2FpdCBzYWZlU3Bhd24ocHl0aG9uRXhlY3V0YWJsZSwgLyogYXJncyAqLyBbcGF0aFRvTGliQ2xhbmdTZXJ2ZXJdLCBvcHRpb25zKTtcblxuICAgIGNoaWxkLm9uKCdjbG9zZScsIGZ1bmN0aW9uKGV4aXRDb2RlKSB7XG4gICAgICBpZiAoIXRoaXMuX2Rpc3Bvc2VkKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignJXMgZXhpdGVkIHdpdGggY29kZSAlcycsIHBhdGhUb0xpYkNsYW5nU2VydmVyLCBleGl0Q29kZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICBlcnJvciA9IGVycm9yLnRvU3RyaW5nKCd1dGY4Jyk7XG4gICAgICB9XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHJlY2VpdmluZyBkYXRhJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8qICRGbG93Rml4TWUgLSB1cGRhdGUgRmxvdyBkZWZzIGZvciBDaGlsZFByb2Nlc3MgKi9cbiAgICBjb25zdCB3cml0YWJsZVN0cmVhbSA9IGNoaWxkLnN0ZGlvWzNdO1xuICAgIHdyaXRhYmxlU3RyZWFtLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd3JpdGluZyBkYXRhJywgZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgbGV0IGNoaWxkUnVubmluZyA9IHRydWU7XG4gICAgY2hpbGQub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICBjaGlsZFJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGJpZGlyZWN0aW9uYWwgY29tbXVuaWNhdGlvbiBjaGFubmVsIGlzIHNldCB1cCBiZWZvcmVcbiAgICAvLyByZXNvbHZpbmcgdGhpcyBQcm9taXNlLlxuICAgIGNoaWxkLnN0ZG91dC5vbmNlKCdkYXRhJywgZnVuY3Rpb24oZGF0YTogQnVmZmVyKSB7XG4gICAgICBpZiAoZGF0YS50b1N0cmluZygpID09PSAnYWNrXFxuJykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNoaWxkUnVubmluZykge1xuICAgICAgICAgICAgICBjaGlsZC5raWxsKCk7XG4gICAgICAgICAgICAgIGNoaWxkUnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcHJvY2VzczogY2hpbGQsXG4gICAgICAgICAgcmVhZGFibGVTdHJlYW06IGNoaWxkLnN0ZG91dCxcbiAgICAgICAgICB3cml0YWJsZVN0cmVhbSxcbiAgICAgICAgfTtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHdyaXRhYmxlU3RyZWFtLndyaXRlKGBpbml0OiR7c3JjfVxcbmApO1xuICB9KTtcbn1cblxuLy8gTGlzdCBvZiBzdXBwb3J0ZWQgbWV0aG9kcy4gS2VlcCBpbiBzeW5jIHdpdGggdGhlIFB5dGhvbiBzZXJ2ZXIuXG50eXBlIENsYW5nU2VydmVyUmVxdWVzdCA9XG4gICdjb21waWxlJyB8ICdnZXRfY29tcGxldGlvbnMnIHwgJ2dldF9kZWNsYXJhdGlvbicgfCAnZ2V0X2RlY2xhcmF0aW9uX2luZm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFuZ1NlcnZlciB7XG5cbiAgX3NyYzogc3RyaW5nO1xuICBfY2xhbmdGbGFnc01hbmFnZXI6IENsYW5nRmxhZ3NNYW5hZ2VyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfbmV4dFJlcXVlc3RJZDogbnVtYmVyO1xuICBfbGFzdFByb2Nlc3NlZFJlcXVlc3RJZDogbnVtYmVyO1xuICBfYXN5bmNDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX3BlbmRpbmdDb21waWxlUmVxdWVzdHM6IG51bWJlcjtcbiAgX2dldEFzeW5jQ29ubmVjdGlvbjogKCkgPT4gUHJvbWlzZTw/Q29ubmVjdGlvbj47XG4gIF9kaXNwb3NlZDogYm9vbGVhbjtcblxuICAvLyBDYWNoZSB0aGUgZmxhZ3MtZmV0Y2hpbmcgcHJvbWlzZSBzbyB3ZSBkb24ndCBlbmQgdXAgaW52b2tpbmcgQnVjayB0d2ljZS5cbiAgX2ZsYWdzUHJvbWlzZTogP1Byb21pc2U8P0FycmF5PHN0cmluZz4+O1xuICBfZmxhZ3NSZXRyaWVzOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoY2xhbmdGbGFnc01hbmFnZXI6IENsYW5nRmxhZ3NNYW5hZ2VyLCBzcmM6IHN0cmluZykge1xuICAgIHRoaXMuX3NyYyA9IHNyYztcbiAgICB0aGlzLl9jbGFuZ0ZsYWdzTWFuYWdlciA9IGNsYW5nRmxhZ3NNYW5hZ2VyO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fbmV4dFJlcXVlc3RJZCA9IDA7XG4gICAgdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCA9IC0xO1xuICAgIHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMgPSAwO1xuICAgIHRoaXMuX2dldEFzeW5jQ29ubmVjdGlvbiA9IHByb21pc2VzLnNlcmlhbGl6ZUFzeW5jQ2FsbCh0aGlzLl9nZXRBc3luY0Nvbm5lY3Rpb25JbXBsLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX2Rpc3Bvc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fZmxhZ3NSZXRyaWVzID0gMDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NsZWFudXAoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIFJTUyBvZiB0aGUgY2hpbGQgcHJvY2VzcyBpbiBieXRlcy5cbiAgICogV29ya3Mgb24gVW5peCBhbmQgTWFjIE9TIFguXG4gICAqL1xuICBhc3luYyBnZXRNZW1vcnlVc2FnZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGNvbnN0IHtleGl0Q29kZSwgc3Rkb3V0fSA9IGF3YWl0IGNoZWNrT3V0cHV0KFxuICAgICAgJ3BzJyxcbiAgICAgIFsnLXAnLCB0aGlzLl9hc3luY0Nvbm5lY3Rpb24ucHJvY2Vzcy5waWQudG9TdHJpbmcoKSwgJy1vJywgJ3Jzcz0nXSxcbiAgICApO1xuICAgIGlmIChleGl0Q29kZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBwYXJzZUludChzdGRvdXQsIDEwKSAqIDEwMjQ7IC8vIHBzIHJldHVybnMgS0JcbiAgfVxuXG4gIF9jbGVhbnVwKCkge1xuICAgIC8vIEZhaWwgYWxsIHBlbmRpbmcgcmVxdWVzdHMuXG4gICAgLy8gVGhlIENsYW5nIHNlcnZlciByZWNlaXZlcyByZXF1ZXN0cyBzZXJpYWxseSB2aWEgc3RkaW4gKGFuZCBwcm9jZXNzZXMgdGhlbSBpbiB0aGF0IG9yZGVyKVxuICAgIC8vIHNvIGl0J3MgcXVpdGUgc2FmZSB0byBhc3N1bWUgdGhhdCByZXF1ZXN0cyBhcmUgcHJvY2Vzc2VkIGluIG9yZGVyLlxuICAgIGZvciAobGV0IHJlcWlkID0gdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCArIDE7IHJlcWlkIDwgdGhpcy5fbmV4dFJlcXVlc3RJZDsgcmVxaWQrKykge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KHJlcWlkLnRvU3RyaW5nKDE2KSwge2Vycm9yOiAnU2VydmVyIHdhcyBraWxsZWQuJ30pO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYXN5bmNDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9hc3luY0Nvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB9XG5cbiAgZ2V0RmxhZ3MoKTogUHJvbWlzZTw/QXJyYXk8c3RyaW5nPj4ge1xuICAgIGlmICh0aGlzLl9mbGFnc1Byb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsYWdzUHJvbWlzZTtcbiAgICB9XG4gICAgdGhpcy5fZmxhZ3NQcm9taXNlID0gdGhpcy5fY2xhbmdGbGFnc01hbmFnZXIuZ2V0RmxhZ3NGb3JTcmModGhpcy5fc3JjKVxuICAgICAgLmNhdGNoKGUgPT4ge1xuICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgYGNsYW5nLXNlcnZlcjogQ291bGQgbm90IGdldCBmbGFncyBmb3IgJHt0aGlzLl9zcmN9IChyZXRyeSAke3RoaXMuX2ZsYWdzUmV0cmllc30pYCwgZSk7XG4gICAgICAgIGlmICh0aGlzLl9mbGFnc1JldHJpZXMgPCBGTEFHU19SRVRSWV9MSU1JVCkge1xuICAgICAgICAgIHRoaXMuX2ZsYWdzUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgdGhpcy5fZmxhZ3NSZXRyaWVzKys7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9mbGFnc1Byb21pc2U7XG4gIH1cblxuICBhc3luYyBtYWtlUmVxdWVzdChcbiAgICBtZXRob2Q6IENsYW5nU2VydmVyUmVxdWVzdCxcbiAgICBkZWZhdWx0RmxhZ3M6ID9BcnJheTxzdHJpbmc+LFxuICAgIHBhcmFtczogT2JqZWN0LFxuICApOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgICBpbnZhcmlhbnQoIXRoaXMuX2Rpc3Bvc2VkLCAnY2FsbGluZyBtYWtlUmVxdWVzdCBvbiBhIGRpc3Bvc2VkIENsYW5nU2VydmVyJyk7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzKys7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzKSB7XG4gICAgICAvLyBBbGwgb3RoZXIgcmVxdWVzdHMgc2hvdWxkIGluc3RhbnRseSBmYWlsLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbWFrZVJlcXVlc3RJbXBsKG1ldGhvZCwgZGVmYXVsdEZsYWdzLCBwYXJhbXMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cy0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9tYWtlUmVxdWVzdEltcGwoXG4gICAgbWV0aG9kOiBDbGFuZ1NlcnZlclJlcXVlc3QsXG4gICAgZGVmYXVsdEZsYWdzOiA/QXJyYXk8c3RyaW5nPixcbiAgICBwYXJhbXM6IE9iamVjdCxcbiAgKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgbGV0IGZsYWdzID0gYXdhaXQgdGhpcy5nZXRGbGFncygpO1xuICAgIGxldCBhY2N1cmF0ZUZsYWdzID0gdHJ1ZTtcbiAgICBpZiAoZmxhZ3MgPT0gbnVsbCkge1xuICAgICAgaWYgKGRlZmF1bHRGbGFncyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZmxhZ3MgPSBhd2FpdCBhdWdtZW50RGVmYXVsdEZsYWdzKHRoaXMuX3NyYywgZGVmYXVsdEZsYWdzKTtcbiAgICAgIGFjY3VyYXRlRmxhZ3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5fZ2V0QXN5bmNDb25uZWN0aW9uKCk7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxaWQgPSB0aGlzLl9nZXROZXh0UmVxdWVzdElkKCk7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtyZXFpZCwgbWV0aG9kLCBmbGFncywgLi4ucGFyYW1zfTtcbiAgICBjb25zdCBsb2dEYXRhID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdCwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIC8vIEZpbGUgY29udGVudHMgYXJlIHRvbyBsYXJnZSBhbmQgY2x1dHRlciB1cCB0aGUgbG9ncywgc28gZXhjbHVkZSB0aGVtLlxuICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnRzJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbG9nZ2VyLmRlYnVnKCdMaWJDbGFuZyByZXF1ZXN0OiAnICsgbG9nRGF0YSk7XG4gICAgLy8gQmVjYXVzZSBOb2RlIHVzZXMgYW4gZXZlbnQtbG9vcCwgd2UgZG8gbm90IGhhdmUgdG8gd29ycnkgYWJvdXQgYSBjYWxsIHRvXG4gICAgLy8gd3JpdGUoKSBjb21pbmcgaW4gZnJvbSBhbm90aGVyIHRocmVhZCBiZXR3ZWVuIG91ciB0d28gY2FsbHMgaGVyZS5cbiAgICBjb25zdCB7d3JpdGFibGVTdHJlYW19ID0gY29ubmVjdGlvbjtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgd3JpdGFibGVTdHJlYW0ud3JpdGUoJ1xcbicpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShyZXFpZCwgcmVzcG9uc2UgPT4ge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ0xpYkNsYW5nIHJlc3BvbnNlOiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgICAgY29uc3QgaXNFcnJvciA9ICdlcnJvcicgaW4gcmVzcG9uc2U7XG4gICAgICAgIGlmIChpc0Vycm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdlcnJvciByZWNlaXZlZCBmcm9tIGNsYW5nX3NlcnZlci5weSBmb3IgcmVxdWVzdDpcXG4lb1xcbkVycm9yOiVzJyxcbiAgICAgICAgICAgIGxvZ0RhdGEsXG4gICAgICAgICAgICByZXNwb25zZVsnZXJyb3InXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCA9IHBhcnNlSW50KHJlcWlkLCAxNik7XG4gICAgICAgIGlmIChtZXRob2QgPT09ICdjb21waWxlJykge1xuICAgICAgICAgIC8vIFVzaW5nIGRlZmF1bHQgZmxhZ3MgdHlwaWNhbGx5IHJlc3VsdHMgaW4gcG9vciBkaWFnbm9zdGljcywgc28gbGV0IHRoZSBjYWxsZXIga25vdy5cbiAgICAgICAgICByZXNwb25zZS5hY2N1cmF0ZUZsYWdzID0gYWNjdXJhdGVGbGFncztcbiAgICAgICAgfVxuICAgICAgICAoaXNFcnJvciA/IHJlamVjdCA6IHJlc29sdmUpKHJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2dldE5leHRSZXF1ZXN0SWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMuX25leHRSZXF1ZXN0SWQrKykudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgYXN5bmMgX2dldEFzeW5jQ29ubmVjdGlvbkltcGwoKTogUHJvbWlzZTw/Q29ubmVjdGlvbj4ge1xuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGNyZWF0ZUFzeW5jQ29ubmVjdGlvbih0aGlzLl9zcmMpO1xuICAgICAgICBjb25uZWN0aW9uLnJlYWRhYmxlU3RyZWFtXG4gICAgICAgICAgLnBpcGUoc3BsaXQoSlNPTi5wYXJzZSkpXG4gICAgICAgICAgLm9uKCdkYXRhJywgcmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSByZXNwb25zZVsncmVxaWQnXTtcbiAgICAgICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChpZCwgcmVzcG9uc2UpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5fZGlzcG9zZWQpIHtcbiAgICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAgICdGYWlsZWQgdG8gaGFuZGxlIGxpYmNsYW5nIG91dHB1dCwgbW9zdCBsaWtlbHkgdGhlIGxpYmNsYW5nIHB5dGhvbidcbiAgICAgICAgICAgICAgICArICcgc2VydmVyIGNyYXNoZWQuJyxcbiAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgdGhpcy5fY2xlYW51cCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSB0aGlzLl9uZXh0UmVxdWVzdElkIC0gMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBDbGFuZyBzZXJ2ZXInLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FzeW5jQ29ubmVjdGlvbjtcbiAgfVxuXG59XG4iXX0=