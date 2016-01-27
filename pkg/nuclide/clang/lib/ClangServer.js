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
      logger.error('%s exited with code %s', pathToLibClangServer, exitCode);
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

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _split = require('split');

var _split2 = _interopRequireDefault(_split);

var _events = require('events');

var _commons = require('../../commons');

var _logging = require('../../logging');

var logger = (0, _logging.getLogger)();
var pathToLibClangServer = _path2['default'].join(__dirname, '../python/clang_server.py');

var ClangServer = (function () {
  function ClangServer(clangFlagsManager, src) {
    _classCallCheck(this, ClangServer);

    this._src = src;
    this._clangFlagsManager = clangFlagsManager;
    this._emitter = new _events.EventEmitter();
    this._nextRequestId = 0;
    this._lastProcessedRequestId = -1;
    this._pendingCompileRequests = 0;
  }

  _createClass(ClangServer, [{
    key: 'dispose',
    value: function dispose() {
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
        logger.error('clang-server: Could not get flags for ' + _this._src + ':', e);
        // Make sure this gets a retry.
        _this._flagsPromise = null;
      });
      return this._flagsPromise;
    }
  }, {
    key: 'makeRequest',
    value: _asyncToGenerator(function* (method, defaultFlags, params) {
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
        flags = defaultFlags;
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
    key: '_getAsyncConnection',
    value: _asyncToGenerator(function* () {
      var _this3 = this;

      if (this._asyncConnection == null) {
        try {
          var connection = yield createAsyncConnection(this._src);
          connection.readableStream.pipe((0, _split2['default'])(JSON.parse)).on('data', function (response) {
            var id = response['reqid'];
            _this3._emitter.emit(id, response);
          }).on('error', function (error) {
            logger.error('Failed to handle libclang output, most likely the libclang python' + ' server crashed.', error);
            _this3.dispose();
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
//# sourceMappingURL=data:application/json;base64,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Iid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIENsYW5nRmxhZ3NNYW5hZ2VyIGZyb20gJy4vQ2xhbmdGbGFnc01hbmFnZXInO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzcGxpdCBmcm9tICdzcGxpdCc7XG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHtjaGVja091dHB1dCwgc2FmZVNwYXdufSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCBwYXRoVG9MaWJDbGFuZ1NlcnZlciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9weXRob24vY2xhbmdfc2VydmVyLnB5Jyk7XG5cbmFzeW5jIGZ1bmN0aW9uIF9maW5kQ2xhbmdTZXJ2ZXJBcmdzKCk6IFByb21pc2U8e1xuICBsaWJDbGFuZ0xpYnJhcnlGaWxlOiA/c3RyaW5nO1xuICBweXRob25FeGVjdXRhYmxlOiBzdHJpbmc7XG4gIHB5dGhvblBhdGhFbnY6ID9zdHJpbmc7XG59PiB7XG4gIGxldCBmaW5kQ2xhbmdTZXJ2ZXJBcmdzO1xuICB0cnkge1xuICAgIGZpbmRDbGFuZ1NlcnZlckFyZ3MgPSByZXF1aXJlKCcuL2ZiL2ZpbmQtY2xhbmctc2VydmVyLWFyZ3MnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElnbm9yZS5cbiAgfVxuXG4gIGxldCBsaWJDbGFuZ0xpYnJhcnlGaWxlO1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dCgneGNvZGUtc2VsZWN0JywgWyctLXByaW50LXBhdGgnXSk7XG4gICAgaWYgKHJlc3VsdC5leGl0Q29kZSA9PT0gMCkge1xuICAgICAgbGliQ2xhbmdMaWJyYXJ5RmlsZSA9IHJlc3VsdC5zdGRvdXQudHJpbSgpICtcbiAgICAgICAgJy9Ub29sY2hhaW5zL1hjb2RlRGVmYXVsdC54Y3Rvb2xjaGFpbi91c3IvbGliL2xpYmNsYW5nLmR5bGliJztcbiAgICB9XG4gIH1cblxuICBjb25zdCBjbGFuZ1NlcnZlckFyZ3MgPSB7XG4gICAgbGliQ2xhbmdMaWJyYXJ5RmlsZSxcbiAgICBweXRob25FeGVjdXRhYmxlOiAncHl0aG9uJyxcbiAgICBweXRob25QYXRoRW52OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHl0aG9ucGF0aCcpLFxuICB9O1xuICBpZiAodHlwZW9mIGZpbmRDbGFuZ1NlcnZlckFyZ3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBjbGFuZ1NlcnZlckFyZ3NPdmVycmlkZXMgPSBhd2FpdCBmaW5kQ2xhbmdTZXJ2ZXJBcmdzKCk7XG4gICAgcmV0dXJuIHsuLi5jbGFuZ1NlcnZlckFyZ3MsIC4uLmNsYW5nU2VydmVyQXJnc092ZXJyaWRlc307XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNsYW5nU2VydmVyQXJncztcbiAgfVxufVxuXG50eXBlIENvbm5lY3Rpb24gPSB7XG4gIGRpc3Bvc2U6ICgpID0+IGFueSxcbiAgcmVhZGFibGVTdHJlYW06IHN0cmVhbSRSZWFkYWJsZSxcbiAgd3JpdGFibGVTdHJlYW06IHN0cmVhbSRXcml0YWJsZSxcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQXN5bmNDb25uZWN0aW9uKHNyYzogc3RyaW5nKTogUHJvbWlzZTxDb25uZWN0aW9uPiB7XG4gIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qge2xpYkNsYW5nTGlicmFyeUZpbGUsIHB5dGhvblBhdGhFbnYsIHB5dGhvbkV4ZWN1dGFibGV9ID0gYXdhaXQgX2ZpbmRDbGFuZ1NlcnZlckFyZ3MoKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY3dkOiBwYXRoLmRpcm5hbWUocGF0aFRvTGliQ2xhbmdTZXJ2ZXIpLFxuICAgICAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIHVzZSBpdHMgb3JkaW5hcnkgc3RkZXJyIGZvciBlcnJvcnMuXG4gICAgICBzdGRpbzogWydwaXBlJywgbnVsbCwgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgZGV0YWNoZWQ6IGZhbHNlLCAvLyBXaGVuIEF0b20gaXMga2lsbGVkLCBjbGFuZ19zZXJ2ZXIucHkgc2hvdWxkIGJlIGtpbGxlZCwgdG9vLlxuICAgICAgZW52OiB7XG4gICAgICAgIC8vIE9uIE1hYyBPU1ggRWwgQ2FwaXRhbiwgYmFzaCBzZWVtcyB0byB3aXBlIG91dCB0aGUgYExEX0xJQlJBUllfUEFUSGAgYW5kXG4gICAgICAgIC8vIGBEWUxEX0xJQlJBUllfUEFUSGAgZW52aXJvbm1lbnQgbGV0aWFibGVzLiBTbywgc2V0IHRoaXMgZW52IGxldCB3aGljaCBpcyByZWFkIGJ5XG4gICAgICAgIC8vIGNsYW5nX3NlcnZlci5weSB0byBleHBsaWNpdGx5IHNldCB0aGUgZmlsZSBwYXRoIHRvIGxvYWQuXG4gICAgICAgIExJQl9DTEFOR19MSUJSQVJZX0ZJTEU6IGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgICAgIFBZVEhPTlBBVEg6IHB5dGhvblBhdGhFbnYsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBOb3RlIHRoYXQgc2FmZVNwYXduKCkgb2Z0ZW4gb3ZlcnJpZGVzIG9wdGlvbnMuZW52LlBBVEgsIGJ1dCB0aGF0IG9ubHkgaGFwcGVucyB3aGVuXG4gICAgLy8gb3B0aW9ucy5lbnYgaXMgdW5kZWZpbmVkICh3aGljaCBpcyBub3QgdGhlIGNhc2UgaGVyZSkuIFRoaXMgd2lsbCBvbmx5IGJlIGFuIGlzc3VlIGlmIHRoZVxuICAgIC8vIHN5c3RlbSBjYW5ub3QgZmluZCBgcHl0aG9uRXhlY3V0YWJsZWAuXG4gICAgY29uc3QgY2hpbGQgPSBhd2FpdCBzYWZlU3Bhd24ocHl0aG9uRXhlY3V0YWJsZSwgLyogYXJncyAqLyBbcGF0aFRvTGliQ2xhbmdTZXJ2ZXJdLCBvcHRpb25zKTtcblxuICAgIGNoaWxkLm9uKCdjbG9zZScsIGZ1bmN0aW9uKGV4aXRDb2RlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJyVzIGV4aXRlZCB3aXRoIGNvZGUgJXMnLCBwYXRoVG9MaWJDbGFuZ1NlcnZlciwgZXhpdENvZGUpO1xuICAgIH0pO1xuICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgZXJyb3IgPSBlcnJvci50b1N0cmluZygndXRmOCcpO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciByZWNlaXZpbmcgZGF0YScsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvKiAkRmxvd0ZpeE1lIC0gdXBkYXRlIEZsb3cgZGVmcyBmb3IgQ2hpbGRQcm9jZXNzICovXG4gICAgY29uc3Qgd3JpdGFibGVTdHJlYW0gPSBjaGlsZC5zdGRpb1szXTtcbiAgICB3cml0YWJsZVN0cmVhbS5vbignZXJyb3InLCAoZXJyb3IpID0+IHtcbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3Igd3JpdGluZyBkYXRhJywgZXJyb3IpO1xuICAgIH0pO1xuXG4gICAgbGV0IGNoaWxkUnVubmluZyA9IHRydWU7XG4gICAgY2hpbGQub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICBjaGlsZFJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgICAvLyBNYWtlIHN1cmUgdGhlIGJpZGlyZWN0aW9uYWwgY29tbXVuaWNhdGlvbiBjaGFubmVsIGlzIHNldCB1cCBiZWZvcmVcbiAgICAvLyByZXNvbHZpbmcgdGhpcyBQcm9taXNlLlxuICAgIGNoaWxkLnN0ZG91dC5vbmNlKCdkYXRhJywgZnVuY3Rpb24oZGF0YTogQnVmZmVyKSB7XG4gICAgICBpZiAoZGF0YS50b1N0cmluZygpID09PSAnYWNrXFxuJykge1xuICAgICAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNoaWxkUnVubmluZykge1xuICAgICAgICAgICAgICBjaGlsZC5raWxsKCk7XG4gICAgICAgICAgICAgIGNoaWxkUnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgcmVhZGFibGVTdHJlYW06IGNoaWxkLnN0ZG91dCxcbiAgICAgICAgICB3cml0YWJsZVN0cmVhbSxcbiAgICAgICAgfTtcbiAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHdyaXRhYmxlU3RyZWFtLndyaXRlKGBpbml0OiR7c3JjfVxcbmApO1xuICB9KTtcbn1cblxuLy8gTGlzdCBvZiBzdXBwb3J0ZWQgbWV0aG9kcy4gS2VlcCBpbiBzeW5jIHdpdGggdGhlIFB5dGhvbiBzZXJ2ZXIuXG50eXBlIENsYW5nU2VydmVyUmVxdWVzdCA9XG4gICdjb21waWxlJyB8ICdnZXRfY29tcGxldGlvbnMnIHwgJ2dldF9kZWNsYXJhdGlvbicgfCAnZ2V0X2RlY2xhcmF0aW9uX2luZm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDbGFuZ1NlcnZlciB7XG5cbiAgX3NyYzogc3RyaW5nO1xuICBfY2xhbmdGbGFnc01hbmFnZXI6IENsYW5nRmxhZ3NNYW5hZ2VyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfbmV4dFJlcXVlc3RJZDogbnVtYmVyO1xuICBfbGFzdFByb2Nlc3NlZFJlcXVlc3RJZDogbnVtYmVyO1xuICBfYXN5bmNDb25uZWN0aW9uOiA/Q29ubmVjdGlvbjtcbiAgX3BlbmRpbmdDb21waWxlUmVxdWVzdHM6IG51bWJlcjtcblxuICAvLyBDYWNoZSB0aGUgZmxhZ3MtZmV0Y2hpbmcgcHJvbWlzZSBzbyB3ZSBkb24ndCBlbmQgdXAgaW52b2tpbmcgQnVjayB0d2ljZS5cbiAgX2ZsYWdzUHJvbWlzZTogP1Byb21pc2U8P0FycmF5PHN0cmluZz4+O1xuXG4gIGNvbnN0cnVjdG9yKGNsYW5nRmxhZ3NNYW5hZ2VyOiBDbGFuZ0ZsYWdzTWFuYWdlciwgc3JjOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zcmMgPSBzcmM7XG4gICAgdGhpcy5fY2xhbmdGbGFnc01hbmFnZXIgPSBjbGFuZ0ZsYWdzTWFuYWdlcjtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX25leHRSZXF1ZXN0SWQgPSAwO1xuICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSAtMTtcbiAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzID0gMDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgLy8gRmFpbCBhbGwgcGVuZGluZyByZXF1ZXN0cy5cbiAgICAvLyBUaGUgQ2xhbmcgc2VydmVyIHJlY2VpdmVzIHJlcXVlc3RzIHNlcmlhbGx5IHZpYSBzdGRpbiAoYW5kIHByb2Nlc3NlcyB0aGVtIGluIHRoYXQgb3JkZXIpXG4gICAgLy8gc28gaXQncyBxdWl0ZSBzYWZlIHRvIGFzc3VtZSB0aGF0IHJlcXVlc3RzIGFyZSBwcm9jZXNzZWQgaW4gb3JkZXIuXG4gICAgZm9yIChsZXQgcmVxaWQgPSB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkICsgMTsgcmVxaWQgPCB0aGlzLl9uZXh0UmVxdWVzdElkOyByZXFpZCsrKSB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQocmVxaWQudG9TdHJpbmcoMTYpLCB7ZXJyb3I6ICdTZXJ2ZXIgd2FzIGtpbGxlZC4nfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24pIHtcbiAgICAgIHRoaXMuX2FzeW5jQ29ubmVjdGlvbi5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX2VtaXR0ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gIH1cblxuICBnZXRGbGFncygpOiBQcm9taXNlPD9BcnJheTxzdHJpbmc+PiB7XG4gICAgaWYgKHRoaXMuX2ZsYWdzUHJvbWlzZSAhPSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZmxhZ3NQcm9taXNlO1xuICAgIH1cbiAgICB0aGlzLl9mbGFnc1Byb21pc2UgPSB0aGlzLl9jbGFuZ0ZsYWdzTWFuYWdlci5nZXRGbGFnc0ZvclNyYyh0aGlzLl9zcmMpXG4gICAgICAuY2F0Y2goKGUpID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKGBjbGFuZy1zZXJ2ZXI6IENvdWxkIG5vdCBnZXQgZmxhZ3MgZm9yICR7dGhpcy5fc3JjfTpgLCBlKTtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoaXMgZ2V0cyBhIHJldHJ5LlxuICAgICAgICB0aGlzLl9mbGFnc1Byb21pc2UgPSBudWxsO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2ZsYWdzUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIG1ha2VSZXF1ZXN0KFxuICAgIG1ldGhvZDogQ2xhbmdTZXJ2ZXJSZXF1ZXN0LFxuICAgIGRlZmF1bHRGbGFnczogP0FycmF5PHN0cmluZz4sXG4gICAgcGFyYW1zOiBPYmplY3QsXG4gICk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIGlmIChtZXRob2QgPT09ICdjb21waWxlJykge1xuICAgICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cysrO1xuICAgIH0gZWxzZSBpZiAodGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cykge1xuICAgICAgLy8gQWxsIG90aGVyIHJlcXVlc3RzIHNob3VsZCBpbnN0YW50bHkgZmFpbC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX21ha2VSZXF1ZXN0SW1wbChtZXRob2QsIGRlZmF1bHRGbGFncywgcGFyYW1zKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKG1ldGhvZCA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICAgIHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMtLTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBfbWFrZVJlcXVlc3RJbXBsKFxuICAgIG1ldGhvZDogQ2xhbmdTZXJ2ZXJSZXF1ZXN0LFxuICAgIGRlZmF1bHRGbGFnczogP0FycmF5PHN0cmluZz4sXG4gICAgcGFyYW1zOiBPYmplY3QsXG4gICk6IFByb21pc2U8P09iamVjdD4ge1xuICAgIGxldCBmbGFncyA9IGF3YWl0IHRoaXMuZ2V0RmxhZ3MoKTtcbiAgICBsZXQgYWNjdXJhdGVGbGFncyA9IHRydWU7XG4gICAgaWYgKGZsYWdzID09IG51bGwpIHtcbiAgICAgIGlmIChkZWZhdWx0RmxhZ3MgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIGZsYWdzID0gZGVmYXVsdEZsYWdzO1xuICAgICAgYWNjdXJhdGVGbGFncyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLl9nZXRBc3luY0Nvbm5lY3Rpb24oKTtcbiAgICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXFpZCA9IHRoaXMuX2dldE5leHRSZXF1ZXN0SWQoKTtcbiAgICBjb25zdCByZXF1ZXN0ID0ge3JlcWlkLCBtZXRob2QsIGZsYWdzLCAuLi5wYXJhbXN9O1xuICAgIGNvbnN0IGxvZ0RhdGEgPSBKU09OLnN0cmluZ2lmeShyZXF1ZXN0LCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgLy8gRmlsZSBjb250ZW50cyBhcmUgdG9vIGxhcmdlIGFuZCBjbHV0dGVyIHVwIHRoZSBsb2dzLCBzbyBleGNsdWRlIHRoZW0uXG4gICAgICBpZiAoa2V5ID09PSAnY29udGVudHMnKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBsb2dnZXIuZGVidWcoJ0xpYkNsYW5nIHJlcXVlc3Q6ICcgKyBsb2dEYXRhKTtcbiAgICAvLyBCZWNhdXNlIE5vZGUgdXNlcyBhbiBldmVudC1sb29wLCB3ZSBkbyBub3QgaGF2ZSB0byB3b3JyeSBhYm91dCBhIGNhbGwgdG9cbiAgICAvLyB3cml0ZSgpIGNvbWluZyBpbiBmcm9tIGFub3RoZXIgdGhyZWFkIGJldHdlZW4gb3VyIHR3byBjYWxscyBoZXJlLlxuICAgIGNvbnN0IHt3cml0YWJsZVN0cmVhbX0gPSBjb25uZWN0aW9uO1xuICAgIHdyaXRhYmxlU3RyZWFtLndyaXRlKEpTT04uc3RyaW5naWZ5KHJlcXVlc3QpKTtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZSgnXFxuJyk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKHJlcWlkLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKCdMaWJDbGFuZyByZXNwb25zZTogJyArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgICAgIGNvbnN0IGlzRXJyb3IgPSAnZXJyb3InIGluIHJlc3BvbnNlO1xuICAgICAgICBpZiAoaXNFcnJvcikge1xuICAgICAgICAgIGxvZ2dlci5lcnJvcignZXJyb3IgcmVjZWl2ZWQgZnJvbSBjbGFuZ19zZXJ2ZXIucHkgZm9yIHJlcXVlc3Q6XFxuJW9cXG5FcnJvcjolcycsXG4gICAgICAgICAgICBsb2dEYXRhLFxuICAgICAgICAgICAgcmVzcG9uc2VbJ2Vycm9yJ10pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSBwYXJzZUludChyZXFpZCwgMTYpO1xuICAgICAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgICAvLyBVc2luZyBkZWZhdWx0IGZsYWdzIHR5cGljYWxseSByZXN1bHRzIGluIHBvb3IgZGlhZ25vc3RpY3MsIHNvIGxldCB0aGUgY2FsbGVyIGtub3cuXG4gICAgICAgICAgcmVzcG9uc2UuYWNjdXJhdGVGbGFncyA9IGFjY3VyYXRlRmxhZ3M7XG4gICAgICAgIH1cbiAgICAgICAgKGlzRXJyb3IgPyByZWplY3QgOiByZXNvbHZlKShyZXNwb25zZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9nZXROZXh0UmVxdWVzdElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLl9uZXh0UmVxdWVzdElkKyspLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRBc3luY0Nvbm5lY3Rpb24oKTogUHJvbWlzZTw/Q29ubmVjdGlvbj4ge1xuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGNyZWF0ZUFzeW5jQ29ubmVjdGlvbih0aGlzLl9zcmMpO1xuICAgICAgICBjb25uZWN0aW9uLnJlYWRhYmxlU3RyZWFtXG4gICAgICAgICAgLnBpcGUoc3BsaXQoSlNPTi5wYXJzZSkpXG4gICAgICAgICAgLm9uKCdkYXRhJywgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHJlc3BvbnNlWydyZXFpZCddO1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KGlkLCByZXNwb25zZSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICdGYWlsZWQgdG8gaGFuZGxlIGxpYmNsYW5nIG91dHB1dCwgbW9zdCBsaWtlbHkgdGhlIGxpYmNsYW5nIHB5dGhvbidcbiAgICAgICAgICAgICAgKyAnIHNlcnZlciBjcmFzaGVkLicsXG4gICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSB0aGlzLl9uZXh0UmVxdWVzdElkIC0gMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBDbGFuZyBzZXJ2ZXInLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FzeW5jQ29ubmVjdGlvbjtcbiAgfVxuXG59XG4iXX0=