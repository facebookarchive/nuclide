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
    this._flagsRetries = 0;
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixtQkFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztXQUNsQyxDQUFDLENBQ0QsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEtBQUssRUFBSTtBQUNwQixrQkFBTSxDQUFDLEtBQUssQ0FDVixtRUFBbUUsR0FDakUsa0JBQWtCLEVBQ3BCLEtBQUssQ0FDTixDQUFDO0FBQ0YsbUJBQUssT0FBTyxFQUFFLENBQUM7QUFDZixtQkFBSyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7QUFDN0IsbUJBQUssdUJBQXVCLEdBQUcsT0FBSyxjQUFjLEdBQUcsQ0FBQyxDQUFDO1dBQ3hELENBQUMsQ0FBQztBQUNMLGNBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUM7U0FDcEMsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGdCQUFNLENBQUMsS0FBSyxDQUFDLG1DQUFtQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ3REO09BQ0Y7QUFDRCxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7O1NBaEtrQixXQUFXOzs7cUJBQVgsV0FBVyIsImZpbGUiOiJDbGFuZ1NlcnZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIENsYW5nRmxhZ3NNYW5hZ2VyIGZyb20gJy4vQ2xhbmdGbGFnc01hbmFnZXInO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBzcGxpdCBmcm9tICdzcGxpdCc7XG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IHtjaGVja091dHB1dCwgc2FmZVNwYXdufSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcblxuLy8gRG8gbm90IHRpZSB1cCB0aGUgQnVjayBzZXJ2ZXIgY29udGludW91c2x5IHJldHJ5aW5nIGZvciBmbGFncy5cbmNvbnN0IEZMQUdTX1JFVFJZX0xJTUlUID0gMjtcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5jb25zdCBwYXRoVG9MaWJDbGFuZ1NlcnZlciA9IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9weXRob24vY2xhbmdfc2VydmVyLnB5Jyk7XG5cbmFzeW5jIGZ1bmN0aW9uIF9maW5kQ2xhbmdTZXJ2ZXJBcmdzKCk6IFByb21pc2U8e1xuICBsaWJDbGFuZ0xpYnJhcnlGaWxlOiA/c3RyaW5nO1xuICBweXRob25FeGVjdXRhYmxlOiBzdHJpbmc7XG4gIHB5dGhvblBhdGhFbnY6ID9zdHJpbmc7XG59PiB7XG4gIGxldCBmaW5kQ2xhbmdTZXJ2ZXJBcmdzO1xuICB0cnkge1xuICAgIGZpbmRDbGFuZ1NlcnZlckFyZ3MgPSByZXF1aXJlKCcuL2ZiL2ZpbmQtY2xhbmctc2VydmVyLWFyZ3MnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElnbm9yZS5cbiAgfVxuXG4gIGxldCBsaWJDbGFuZ0xpYnJhcnlGaWxlO1xuICBpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2RhcndpbicpIHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjaGVja091dHB1dCgneGNvZGUtc2VsZWN0JywgWyctLXByaW50LXBhdGgnXSk7XG4gICAgaWYgKHJlc3VsdC5leGl0Q29kZSA9PT0gMCkge1xuICAgICAgbGliQ2xhbmdMaWJyYXJ5RmlsZSA9IHJlc3VsdC5zdGRvdXQudHJpbSgpICtcbiAgICAgICAgJy9Ub29sY2hhaW5zL1hjb2RlRGVmYXVsdC54Y3Rvb2xjaGFpbi91c3IvbGliL2xpYmNsYW5nLmR5bGliJztcbiAgICB9XG4gIH1cblxuICBjb25zdCBjbGFuZ1NlcnZlckFyZ3MgPSB7XG4gICAgbGliQ2xhbmdMaWJyYXJ5RmlsZSxcbiAgICBweXRob25FeGVjdXRhYmxlOiAncHl0aG9uJyxcbiAgICBweXRob25QYXRoRW52OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHl0aG9ucGF0aCcpLFxuICB9O1xuICBpZiAodHlwZW9mIGZpbmRDbGFuZ1NlcnZlckFyZ3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBjbGFuZ1NlcnZlckFyZ3NPdmVycmlkZXMgPSBhd2FpdCBmaW5kQ2xhbmdTZXJ2ZXJBcmdzKCk7XG4gICAgcmV0dXJuIHsuLi5jbGFuZ1NlcnZlckFyZ3MsIC4uLmNsYW5nU2VydmVyQXJnc092ZXJyaWRlc307XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNsYW5nU2VydmVyQXJncztcbiAgfVxufVxuXG5sZXQgZ2V0RGVmYXVsdEZsYWdzO1xuYXN5bmMgZnVuY3Rpb24gYXVnbWVudERlZmF1bHRGbGFncyhzcmM6IHN0cmluZywgZmxhZ3M6IEFycmF5PHN0cmluZz4pOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgaWYgKGdldERlZmF1bHRGbGFncyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZ2V0RGVmYXVsdEZsYWdzID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgZ2V0RGVmYXVsdEZsYWdzID0gcmVxdWlyZSgnLi9mYi9nZXQtZGVmYXVsdC1mbGFncycpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIE9wZW4tc291cmNlIHZlcnNpb25cbiAgICB9XG4gIH1cbiAgaWYgKGdldERlZmF1bHRGbGFncyAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGZsYWdzLmNvbmNhdChhd2FpdCBnZXREZWZhdWx0RmxhZ3Moc3JjKSk7XG4gIH1cbiAgcmV0dXJuIGZsYWdzO1xufVxuXG50eXBlIENvbm5lY3Rpb24gPSB7XG4gIGRpc3Bvc2U6ICgpID0+IGFueSxcbiAgcmVhZGFibGVTdHJlYW06IHN0cmVhbSRSZWFkYWJsZSxcbiAgd3JpdGFibGVTdHJlYW06IHN0cmVhbSRXcml0YWJsZSxcbn1cblxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlQXN5bmNDb25uZWN0aW9uKHNyYzogc3RyaW5nKTogUHJvbWlzZTxDb25uZWN0aW9uPiB7XG4gIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZShhc3luYyAocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qge2xpYkNsYW5nTGlicmFyeUZpbGUsIHB5dGhvblBhdGhFbnYsIHB5dGhvbkV4ZWN1dGFibGV9ID0gYXdhaXQgX2ZpbmRDbGFuZ1NlcnZlckFyZ3MoKTtcbiAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgY3dkOiBwYXRoLmRpcm5hbWUocGF0aFRvTGliQ2xhbmdTZXJ2ZXIpLFxuICAgICAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIHVzZSBpdHMgb3JkaW5hcnkgc3RkZXJyIGZvciBlcnJvcnMuXG4gICAgICBzdGRpbzogWydwaXBlJywgbnVsbCwgJ3BpcGUnLCAncGlwZSddLFxuICAgICAgZGV0YWNoZWQ6IGZhbHNlLCAvLyBXaGVuIEF0b20gaXMga2lsbGVkLCBjbGFuZ19zZXJ2ZXIucHkgc2hvdWxkIGJlIGtpbGxlZCwgdG9vLlxuICAgICAgZW52OiB7XG4gICAgICAgIC8vIE9uIE1hYyBPU1ggRWwgQ2FwaXRhbiwgYmFzaCBzZWVtcyB0byB3aXBlIG91dCB0aGUgYExEX0xJQlJBUllfUEFUSGAgYW5kXG4gICAgICAgIC8vIGBEWUxEX0xJQlJBUllfUEFUSGAgZW52aXJvbm1lbnQgbGV0aWFibGVzLiBTbywgc2V0IHRoaXMgZW52IGxldCB3aGljaCBpcyByZWFkIGJ5XG4gICAgICAgIC8vIGNsYW5nX3NlcnZlci5weSB0byBleHBsaWNpdGx5IHNldCB0aGUgZmlsZSBwYXRoIHRvIGxvYWQuXG4gICAgICAgIExJQl9DTEFOR19MSUJSQVJZX0ZJTEU6IGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgICAgIFBZVEhPTlBBVEg6IHB5dGhvblBhdGhFbnYsXG4gICAgICB9LFxuICAgIH07XG5cbiAgICAvLyBOb3RlIHRoYXQgc2FmZVNwYXduKCkgb2Z0ZW4gb3ZlcnJpZGVzIG9wdGlvbnMuZW52LlBBVEgsIGJ1dCB0aGF0IG9ubHkgaGFwcGVucyB3aGVuXG4gICAgLy8gb3B0aW9ucy5lbnYgaXMgdW5kZWZpbmVkICh3aGljaCBpcyBub3QgdGhlIGNhc2UgaGVyZSkuIFRoaXMgd2lsbCBvbmx5IGJlIGFuIGlzc3VlIGlmIHRoZVxuICAgIC8vIHN5c3RlbSBjYW5ub3QgZmluZCBgcHl0aG9uRXhlY3V0YWJsZWAuXG4gICAgY29uc3QgY2hpbGQgPSBhd2FpdCBzYWZlU3Bhd24ocHl0aG9uRXhlY3V0YWJsZSwgLyogYXJncyAqLyBbcGF0aFRvTGliQ2xhbmdTZXJ2ZXJdLCBvcHRpb25zKTtcblxuICAgIGNoaWxkLm9uKCdjbG9zZScsIGZ1bmN0aW9uKGV4aXRDb2RlKSB7XG4gICAgICBsb2dnZXIuZXJyb3IoJyVzIGV4aXRlZCB3aXRoIGNvZGUgJXMnLCBwYXRoVG9MaWJDbGFuZ1NlcnZlciwgZXhpdENvZGUpO1xuICAgIH0pO1xuICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgZXJyb3IgPSBlcnJvci50b1N0cmluZygndXRmOCcpO1xuICAgICAgfVxuICAgICAgbG9nZ2VyLmVycm9yKCdFcnJvciByZWNlaXZpbmcgZGF0YScsIGVycm9yKTtcbiAgICB9KTtcbiAgICAvKiAkRmxvd0ZpeE1lIC0gdXBkYXRlIEZsb3cgZGVmcyBmb3IgQ2hpbGRQcm9jZXNzICovXG4gICAgY29uc3Qgd3JpdGFibGVTdHJlYW0gPSBjaGlsZC5zdGRpb1szXTtcbiAgICB3cml0YWJsZVN0cmVhbS5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHdyaXRpbmcgZGF0YScsIGVycm9yKTtcbiAgICB9KTtcblxuICAgIGxldCBjaGlsZFJ1bm5pbmcgPSB0cnVlO1xuICAgIGNoaWxkLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgY2hpbGRSdW5uaW5nID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWFrZSBzdXJlIHRoZSBiaWRpcmVjdGlvbmFsIGNvbW11bmljYXRpb24gY2hhbm5lbCBpcyBzZXQgdXAgYmVmb3JlXG4gICAgLy8gcmVzb2x2aW5nIHRoaXMgUHJvbWlzZS5cbiAgICBjaGlsZC5zdGRvdXQub25jZSgnZGF0YScsIGZ1bmN0aW9uKGRhdGE6IEJ1ZmZlcikge1xuICAgICAgaWYgKGRhdGEudG9TdHJpbmcoKSA9PT0gJ2Fja1xcbicpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZFJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgICAgICAgICBjaGlsZFJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlYWRhYmxlU3RyZWFtOiBjaGlsZC5zdGRvdXQsXG4gICAgICAgICAgd3JpdGFibGVTdHJlYW0sXG4gICAgICAgIH07XG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZShgaW5pdDoke3NyY31cXG5gKTtcbiAgfSk7XG59XG5cbi8vIExpc3Qgb2Ygc3VwcG9ydGVkIG1ldGhvZHMuIEtlZXAgaW4gc3luYyB3aXRoIHRoZSBQeXRob24gc2VydmVyLlxudHlwZSBDbGFuZ1NlcnZlclJlcXVlc3QgPVxuICAnY29tcGlsZScgfCAnZ2V0X2NvbXBsZXRpb25zJyB8ICdnZXRfZGVjbGFyYXRpb24nIHwgJ2dldF9kZWNsYXJhdGlvbl9pbmZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xhbmdTZXJ2ZXIge1xuXG4gIF9zcmM6IHN0cmluZztcbiAgX2NsYW5nRmxhZ3NNYW5hZ2VyOiBDbGFuZ0ZsYWdzTWFuYWdlcjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX25leHRSZXF1ZXN0SWQ6IG51bWJlcjtcbiAgX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQ6IG51bWJlcjtcbiAgX2FzeW5jQ29ubmVjdGlvbjogP0Nvbm5lY3Rpb247XG4gIF9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzOiBudW1iZXI7XG5cbiAgLy8gQ2FjaGUgdGhlIGZsYWdzLWZldGNoaW5nIHByb21pc2Ugc28gd2UgZG9uJ3QgZW5kIHVwIGludm9raW5nIEJ1Y2sgdHdpY2UuXG4gIF9mbGFnc1Byb21pc2U6ID9Qcm9taXNlPD9BcnJheTxzdHJpbmc+PjtcbiAgX2ZsYWdzUmV0cmllczogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKGNsYW5nRmxhZ3NNYW5hZ2VyOiBDbGFuZ0ZsYWdzTWFuYWdlciwgc3JjOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zcmMgPSBzcmM7XG4gICAgdGhpcy5fY2xhbmdGbGFnc01hbmFnZXIgPSBjbGFuZ0ZsYWdzTWFuYWdlcjtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIHRoaXMuX25leHRSZXF1ZXN0SWQgPSAwO1xuICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSAtMTtcbiAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLl9mbGFnc1JldHJpZXMgPSAwO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICAvLyBGYWlsIGFsbCBwZW5kaW5nIHJlcXVlc3RzLlxuICAgIC8vIFRoZSBDbGFuZyBzZXJ2ZXIgcmVjZWl2ZXMgcmVxdWVzdHMgc2VyaWFsbHkgdmlhIHN0ZGluIChhbmQgcHJvY2Vzc2VzIHRoZW0gaW4gdGhhdCBvcmRlcilcbiAgICAvLyBzbyBpdCdzIHF1aXRlIHNhZmUgdG8gYXNzdW1lIHRoYXQgcmVxdWVzdHMgYXJlIHByb2Nlc3NlZCBpbiBvcmRlci5cbiAgICBmb3IgKGxldCByZXFpZCA9IHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgKyAxOyByZXFpZCA8IHRoaXMuX25leHRSZXF1ZXN0SWQ7IHJlcWlkKyspIHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChyZXFpZC50b1N0cmluZygxNiksIHtlcnJvcjogJ1NlcnZlciB3YXMga2lsbGVkLid9KTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2FzeW5jQ29ubmVjdGlvbikge1xuICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgfVxuXG4gIGdldEZsYWdzKCk6IFByb21pc2U8P0FycmF5PHN0cmluZz4+IHtcbiAgICBpZiAodGhpcy5fZmxhZ3NQcm9taXNlICE9IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9mbGFnc1Byb21pc2U7XG4gICAgfVxuICAgIHRoaXMuX2ZsYWdzUHJvbWlzZSA9IHRoaXMuX2NsYW5nRmxhZ3NNYW5hZ2VyLmdldEZsYWdzRm9yU3JjKHRoaXMuX3NyYylcbiAgICAgIC5jYXRjaChlID0+IHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgIGBjbGFuZy1zZXJ2ZXI6IENvdWxkIG5vdCBnZXQgZmxhZ3MgZm9yICR7dGhpcy5fc3JjfSAocmV0cnkgJHt0aGlzLl9mbGFnc1JldHJpZXN9KWAsIGUpO1xuICAgICAgICBpZiAodGhpcy5fZmxhZ3NSZXRyaWVzIDwgRkxBR1NfUkVUUllfTElNSVQpIHtcbiAgICAgICAgICB0aGlzLl9mbGFnc1Byb21pc2UgPSBudWxsO1xuICAgICAgICAgIHRoaXMuX2ZsYWdzUmV0cmllcysrO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fZmxhZ3NQcm9taXNlO1xuICB9XG5cbiAgYXN5bmMgbWFrZVJlcXVlc3QoXG4gICAgbWV0aG9kOiBDbGFuZ1NlcnZlclJlcXVlc3QsXG4gICAgZGVmYXVsdEZsYWdzOiA/QXJyYXk8c3RyaW5nPixcbiAgICBwYXJhbXM6IE9iamVjdCxcbiAgKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgaWYgKG1ldGhvZCA9PT0gJ2NvbXBpbGUnKSB7XG4gICAgICB0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzKys7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzKSB7XG4gICAgICAvLyBBbGwgb3RoZXIgcmVxdWVzdHMgc2hvdWxkIGluc3RhbnRseSBmYWlsLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5fbWFrZVJlcXVlc3RJbXBsKG1ldGhvZCwgZGVmYXVsdEZsYWdzLCBwYXJhbXMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cy0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9tYWtlUmVxdWVzdEltcGwoXG4gICAgbWV0aG9kOiBDbGFuZ1NlcnZlclJlcXVlc3QsXG4gICAgZGVmYXVsdEZsYWdzOiA/QXJyYXk8c3RyaW5nPixcbiAgICBwYXJhbXM6IE9iamVjdCxcbiAgKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgbGV0IGZsYWdzID0gYXdhaXQgdGhpcy5nZXRGbGFncygpO1xuICAgIGxldCBhY2N1cmF0ZUZsYWdzID0gdHJ1ZTtcbiAgICBpZiAoZmxhZ3MgPT0gbnVsbCkge1xuICAgICAgaWYgKGRlZmF1bHRGbGFncyA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgZmxhZ3MgPSBhd2FpdCBhdWdtZW50RGVmYXVsdEZsYWdzKHRoaXMuX3NyYywgZGVmYXVsdEZsYWdzKTtcbiAgICAgIGFjY3VyYXRlRmxhZ3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgdGhpcy5fZ2V0QXN5bmNDb25uZWN0aW9uKCk7XG4gICAgaWYgKGNvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxaWQgPSB0aGlzLl9nZXROZXh0UmVxdWVzdElkKCk7XG4gICAgY29uc3QgcmVxdWVzdCA9IHtyZXFpZCwgbWV0aG9kLCBmbGFncywgLi4ucGFyYW1zfTtcbiAgICBjb25zdCBsb2dEYXRhID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdCwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIC8vIEZpbGUgY29udGVudHMgYXJlIHRvbyBsYXJnZSBhbmQgY2x1dHRlciB1cCB0aGUgbG9ncywgc28gZXhjbHVkZSB0aGVtLlxuICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnRzJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbG9nZ2VyLmRlYnVnKCdMaWJDbGFuZyByZXF1ZXN0OiAnICsgbG9nRGF0YSk7XG4gICAgLy8gQmVjYXVzZSBOb2RlIHVzZXMgYW4gZXZlbnQtbG9vcCwgd2UgZG8gbm90IGhhdmUgdG8gd29ycnkgYWJvdXQgYSBjYWxsIHRvXG4gICAgLy8gd3JpdGUoKSBjb21pbmcgaW4gZnJvbSBhbm90aGVyIHRocmVhZCBiZXR3ZWVuIG91ciB0d28gY2FsbHMgaGVyZS5cbiAgICBjb25zdCB7d3JpdGFibGVTdHJlYW19ID0gY29ubmVjdGlvbjtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgd3JpdGFibGVTdHJlYW0ud3JpdGUoJ1xcbicpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShyZXFpZCwgcmVzcG9uc2UgPT4ge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ0xpYkNsYW5nIHJlc3BvbnNlOiAnICsgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UpKTtcbiAgICAgICAgY29uc3QgaXNFcnJvciA9ICdlcnJvcicgaW4gcmVzcG9uc2U7XG4gICAgICAgIGlmIChpc0Vycm9yKSB7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdlcnJvciByZWNlaXZlZCBmcm9tIGNsYW5nX3NlcnZlci5weSBmb3IgcmVxdWVzdDpcXG4lb1xcbkVycm9yOiVzJyxcbiAgICAgICAgICAgIGxvZ0RhdGEsXG4gICAgICAgICAgICByZXNwb25zZVsnZXJyb3InXSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCA9IHBhcnNlSW50KHJlcWlkLCAxNik7XG4gICAgICAgIGlmIChtZXRob2QgPT09ICdjb21waWxlJykge1xuICAgICAgICAgIC8vIFVzaW5nIGRlZmF1bHQgZmxhZ3MgdHlwaWNhbGx5IHJlc3VsdHMgaW4gcG9vciBkaWFnbm9zdGljcywgc28gbGV0IHRoZSBjYWxsZXIga25vdy5cbiAgICAgICAgICByZXNwb25zZS5hY2N1cmF0ZUZsYWdzID0gYWNjdXJhdGVGbGFncztcbiAgICAgICAgfVxuICAgICAgICAoaXNFcnJvciA/IHJlamVjdCA6IHJlc29sdmUpKHJlc3BvbnNlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgX2dldE5leHRSZXF1ZXN0SWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gKHRoaXMuX25leHRSZXF1ZXN0SWQrKykudG9TdHJpbmcoMTYpO1xuICB9XG5cbiAgYXN5bmMgX2dldEFzeW5jQ29ubmVjdGlvbigpOiBQcm9taXNlPD9Db25uZWN0aW9uPiB7XG4gICAgaWYgKHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgY3JlYXRlQXN5bmNDb25uZWN0aW9uKHRoaXMuX3NyYyk7XG4gICAgICAgIGNvbm5lY3Rpb24ucmVhZGFibGVTdHJlYW1cbiAgICAgICAgICAucGlwZShzcGxpdChKU09OLnBhcnNlKSlcbiAgICAgICAgICAub24oJ2RhdGEnLCByZXNwb25zZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHJlc3BvbnNlWydyZXFpZCddO1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KGlkLCByZXNwb25zZSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIGhhbmRsZSBsaWJjbGFuZyBvdXRwdXQsIG1vc3QgbGlrZWx5IHRoZSBsaWJjbGFuZyBweXRob24nXG4gICAgICAgICAgICAgICsgJyBzZXJ2ZXIgY3Jhc2hlZC4nLFxuICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICB0aGlzLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gdGhpcy5fbmV4dFJlcXVlc3RJZCAtIDE7XG4gICAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2FzeW5jQ29ubmVjdGlvbiA9IGNvbm5lY3Rpb247XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignQ291bGQgbm90IGNvbm5lY3QgdG8gQ2xhbmcgc2VydmVyJywgZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9hc3luY0Nvbm5lY3Rpb247XG4gIH1cblxufVxuIl19