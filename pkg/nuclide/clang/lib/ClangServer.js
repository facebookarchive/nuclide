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
    value: _asyncToGenerator(function* (method, params) {
      if (method === 'compile') {
        this._pendingCompileRequests++;
      } else if (this._pendingCompileRequests) {
        // All other requests should instantly fail.
        return null;
      }
      try {
        return yield this._makeRequestImpl(method, params);
      } finally {
        if (method === 'compile') {
          this._pendingCompileRequests--;
        }
      }
    })
  }, {
    key: '_makeRequestImpl',
    value: _asyncToGenerator(function* (method, params) {
      var _this2 = this;

      var flags = yield this.getFlags();
      if (flags == null) {
        return null;
      }

      var connection = yield this._getAsyncConnection();
      if (connection == null) {
        return null;
      }

      var reqid = this._getNextRequestId();
      var request = _extends({ reqid: reqid, method: method, src: this._src, flags: flags }, params);
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
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQztBQUMxRCxvQkFBVSxDQUFDLGNBQWMsQ0FDdEIsSUFBSSxDQUFDLHdCQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUN2QixFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ3hCLGdCQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0IsbUJBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7V0FDbEMsQ0FBQyxDQUNELEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDdEIsa0JBQU0sQ0FBQyxLQUFLLENBQ1YsbUVBQW1FLEdBQ2pFLGtCQUFrQixFQUNwQixLQUFLLENBQ04sQ0FBQztBQUNGLG1CQUFLLE9BQU8sRUFBRSxDQUFDO0FBQ2YsbUJBQUssZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzdCLG1CQUFLLHVCQUF1QixHQUFHLE9BQUssY0FBYyxHQUFHLENBQUMsQ0FBQztXQUN4RCxDQUFDLENBQUM7QUFDTCxjQUFJLENBQUMsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDO1NBQ3BDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDVixnQkFBTSxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN0RDtPQUNGO0FBQ0QsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztTQTFJa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiQ2xhbmdTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBDbGFuZ0ZsYWdzTWFuYWdlciBmcm9tICcuL0NsYW5nRmxhZ3NNYW5hZ2VyJztcblxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgc3BsaXQgZnJvbSAnc3BsaXQnO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCB7Y2hlY2tPdXRwdXQsIHNhZmVTcGF3bn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5cbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuY29uc3QgcGF0aFRvTGliQ2xhbmdTZXJ2ZXIgPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vcHl0aG9uL2NsYW5nX3NlcnZlci5weScpO1xuXG5hc3luYyBmdW5jdGlvbiBfZmluZENsYW5nU2VydmVyQXJncygpOiBQcm9taXNlPHtcbiAgbGliQ2xhbmdMaWJyYXJ5RmlsZTogP3N0cmluZztcbiAgcHl0aG9uRXhlY3V0YWJsZTogc3RyaW5nO1xuICBweXRob25QYXRoRW52OiA/c3RyaW5nO1xufT4ge1xuICBsZXQgZmluZENsYW5nU2VydmVyQXJncztcbiAgdHJ5IHtcbiAgICBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID0gcmVxdWlyZSgnLi9mYi9maW5kLWNsYW5nLXNlcnZlci1hcmdzJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZ25vcmUuXG4gIH1cblxuICBsZXQgbGliQ2xhbmdMaWJyYXJ5RmlsZTtcbiAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT09ICdkYXJ3aW4nKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3hjb2RlLXNlbGVjdCcsIFsnLS1wcmludC1wYXRoJ10pO1xuICAgIGlmIChyZXN1bHQuZXhpdENvZGUgPT09IDApIHtcbiAgICAgIGxpYkNsYW5nTGlicmFyeUZpbGUgPSByZXN1bHQuc3Rkb3V0LnRyaW0oKSArXG4gICAgICAgICcvVG9vbGNoYWlucy9YY29kZURlZmF1bHQueGN0b29sY2hhaW4vdXNyL2xpYi9saWJjbGFuZy5keWxpYic7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzID0ge1xuICAgIGxpYkNsYW5nTGlicmFyeUZpbGUsXG4gICAgcHl0aG9uRXhlY3V0YWJsZTogJ3B5dGhvbicsXG4gICAgcHl0aG9uUGF0aEVudjogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL3B5dGhvbnBhdGgnKSxcbiAgfTtcbiAgaWYgKHR5cGVvZiBmaW5kQ2xhbmdTZXJ2ZXJBcmdzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc3QgY2xhbmdTZXJ2ZXJBcmdzT3ZlcnJpZGVzID0gYXdhaXQgZmluZENsYW5nU2VydmVyQXJncygpO1xuICAgIHJldHVybiB7Li4uY2xhbmdTZXJ2ZXJBcmdzLCAuLi5jbGFuZ1NlcnZlckFyZ3NPdmVycmlkZXN9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjbGFuZ1NlcnZlckFyZ3M7XG4gIH1cbn1cblxudHlwZSBDb25uZWN0aW9uID0ge1xuICBkaXNwb3NlOiAoKSA9PiBhbnksXG4gIHJlYWRhYmxlU3RyZWFtOiBzdHJlYW0kUmVhZGFibGUsXG4gIHdyaXRhYmxlU3RyZWFtOiBzdHJlYW0kV3JpdGFibGUsXG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZUFzeW5jQ29ubmVjdGlvbihzcmM6IHN0cmluZyk6IFByb21pc2U8Q29ubmVjdGlvbj4ge1xuICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHtsaWJDbGFuZ0xpYnJhcnlGaWxlLCBweXRob25QYXRoRW52LCBweXRob25FeGVjdXRhYmxlfSA9IGF3YWl0IF9maW5kQ2xhbmdTZXJ2ZXJBcmdzKCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIGN3ZDogcGF0aC5kaXJuYW1lKHBhdGhUb0xpYkNsYW5nU2VydmVyKSxcbiAgICAgIC8vIFRoZSBwcm9jZXNzIHNob3VsZCB1c2UgaXRzIG9yZGluYXJ5IHN0ZGVyciBmb3IgZXJyb3JzLlxuICAgICAgc3RkaW86IFsncGlwZScsIG51bGwsICdwaXBlJywgJ3BpcGUnXSxcbiAgICAgIGRldGFjaGVkOiBmYWxzZSwgLy8gV2hlbiBBdG9tIGlzIGtpbGxlZCwgY2xhbmdfc2VydmVyLnB5IHNob3VsZCBiZSBraWxsZWQsIHRvby5cbiAgICAgIGVudjoge1xuICAgICAgICAvLyBPbiBNYWMgT1NYIEVsIENhcGl0YW4sIGJhc2ggc2VlbXMgdG8gd2lwZSBvdXQgdGhlIGBMRF9MSUJSQVJZX1BBVEhgIGFuZFxuICAgICAgICAvLyBgRFlMRF9MSUJSQVJZX1BBVEhgIGVudmlyb25tZW50IGxldGlhYmxlcy4gU28sIHNldCB0aGlzIGVudiBsZXQgd2hpY2ggaXMgcmVhZCBieVxuICAgICAgICAvLyBjbGFuZ19zZXJ2ZXIucHkgdG8gZXhwbGljaXRseSBzZXQgdGhlIGZpbGUgcGF0aCB0byBsb2FkLlxuICAgICAgICBMSUJfQ0xBTkdfTElCUkFSWV9GSUxFOiBsaWJDbGFuZ0xpYnJhcnlGaWxlLFxuICAgICAgICBQWVRIT05QQVRIOiBweXRob25QYXRoRW52LFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gTm90ZSB0aGF0IHNhZmVTcGF3bigpIG9mdGVuIG92ZXJyaWRlcyBvcHRpb25zLmVudi5QQVRILCBidXQgdGhhdCBvbmx5IGhhcHBlbnMgd2hlblxuICAgIC8vIG9wdGlvbnMuZW52IGlzIHVuZGVmaW5lZCAod2hpY2ggaXMgbm90IHRoZSBjYXNlIGhlcmUpLiBUaGlzIHdpbGwgb25seSBiZSBhbiBpc3N1ZSBpZiB0aGVcbiAgICAvLyBzeXN0ZW0gY2Fubm90IGZpbmQgYHB5dGhvbkV4ZWN1dGFibGVgLlxuICAgIGNvbnN0IGNoaWxkID0gYXdhaXQgc2FmZVNwYXduKHB5dGhvbkV4ZWN1dGFibGUsIC8qIGFyZ3MgKi8gW3BhdGhUb0xpYkNsYW5nU2VydmVyXSwgb3B0aW9ucyk7XG5cbiAgICBjaGlsZC5vbignY2xvc2UnLCBmdW5jdGlvbihleGl0Q29kZSkge1xuICAgICAgbG9nZ2VyLmVycm9yKCclcyBleGl0ZWQgd2l0aCBjb2RlICVzJywgcGF0aFRvTGliQ2xhbmdTZXJ2ZXIsIGV4aXRDb2RlKTtcbiAgICB9KTtcbiAgICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIGVycm9yID0gZXJyb3IudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgICAgIH1cbiAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgcmVjZWl2aW5nIGRhdGEnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLyogJEZsb3dGaXhNZSAtIHVwZGF0ZSBGbG93IGRlZnMgZm9yIENoaWxkUHJvY2VzcyAqL1xuICAgIGNvbnN0IHdyaXRhYmxlU3RyZWFtID0gY2hpbGQuc3RkaW9bM107XG4gICAgd3JpdGFibGVTdHJlYW0ub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICBsb2dnZXIuZXJyb3IoJ0Vycm9yIHdyaXRpbmcgZGF0YScsIGVycm9yKTtcbiAgICB9KTtcblxuICAgIGxldCBjaGlsZFJ1bm5pbmcgPSB0cnVlO1xuICAgIGNoaWxkLm9uKCdleGl0JywgKCkgPT4ge1xuICAgICAgY2hpbGRSdW5uaW5nID0gZmFsc2U7XG4gICAgfSk7XG4gICAgLy8gTWFrZSBzdXJlIHRoZSBiaWRpcmVjdGlvbmFsIGNvbW11bmljYXRpb24gY2hhbm5lbCBpcyBzZXQgdXAgYmVmb3JlXG4gICAgLy8gcmVzb2x2aW5nIHRoaXMgUHJvbWlzZS5cbiAgICBjaGlsZC5zdGRvdXQub25jZSgnZGF0YScsIGZ1bmN0aW9uKGRhdGE6IEJ1ZmZlcikge1xuICAgICAgaWYgKGRhdGEudG9TdHJpbmcoKSA9PT0gJ2Fja1xcbicpIHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0ge1xuICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgIGlmIChjaGlsZFJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgICAgICAgICBjaGlsZFJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlYWRhYmxlU3RyZWFtOiBjaGlsZC5zdGRvdXQsXG4gICAgICAgICAgd3JpdGFibGVTdHJlYW0sXG4gICAgICAgIH07XG4gICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlamVjdChkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZShgaW5pdDoke3NyY31cXG5gKTtcbiAgfSk7XG59XG5cbi8vIExpc3Qgb2Ygc3VwcG9ydGVkIG1ldGhvZHMuIEtlZXAgaW4gc3luYyB3aXRoIHRoZSBQeXRob24gc2VydmVyLlxudHlwZSBDbGFuZ1NlcnZlclJlcXVlc3QgPVxuICAnY29tcGlsZScgfCAnZ2V0X2NvbXBsZXRpb25zJyB8ICdnZXRfZGVjbGFyYXRpb24nIHwgJ2dldF9kZWNsYXJhdGlvbl9pbmZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2xhbmdTZXJ2ZXIge1xuXG4gIF9zcmM6IHN0cmluZztcbiAgX2NsYW5nRmxhZ3NNYW5hZ2VyOiBDbGFuZ0ZsYWdzTWFuYWdlcjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX25leHRSZXF1ZXN0SWQ6IG51bWJlcjtcbiAgX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQ6IG51bWJlcjtcbiAgX2FzeW5jQ29ubmVjdGlvbjogP0Nvbm5lY3Rpb247XG4gIF9wZW5kaW5nQ29tcGlsZVJlcXVlc3RzOiBudW1iZXI7XG5cbiAgLy8gQ2FjaGUgdGhlIGZsYWdzLWZldGNoaW5nIHByb21pc2Ugc28gd2UgZG9uJ3QgZW5kIHVwIGludm9raW5nIEJ1Y2sgdHdpY2UuXG4gIF9mbGFnc1Byb21pc2U6ID9Qcm9taXNlPD9BcnJheTxzdHJpbmc+PjtcblxuICBjb25zdHJ1Y3RvcihjbGFuZ0ZsYWdzTWFuYWdlcjogQ2xhbmdGbGFnc01hbmFnZXIsIHNyYzogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3JjID0gc3JjO1xuICAgIHRoaXMuX2NsYW5nRmxhZ3NNYW5hZ2VyID0gY2xhbmdGbGFnc01hbmFnZXI7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9uZXh0UmVxdWVzdElkID0gMDtcbiAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gLTE7XG4gICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cyA9IDA7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIC8vIEZhaWwgYWxsIHBlbmRpbmcgcmVxdWVzdHMuXG4gICAgLy8gVGhlIENsYW5nIHNlcnZlciByZWNlaXZlcyByZXF1ZXN0cyBzZXJpYWxseSB2aWEgc3RkaW4gKGFuZCBwcm9jZXNzZXMgdGhlbSBpbiB0aGF0IG9yZGVyKVxuICAgIC8vIHNvIGl0J3MgcXVpdGUgc2FmZSB0byBhc3N1bWUgdGhhdCByZXF1ZXN0cyBhcmUgcHJvY2Vzc2VkIGluIG9yZGVyLlxuICAgIGZvciAobGV0IHJlcWlkID0gdGhpcy5fbGFzdFByb2Nlc3NlZFJlcXVlc3RJZCArIDE7IHJlcWlkIDwgdGhpcy5fbmV4dFJlcXVlc3RJZDsgcmVxaWQrKykge1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KHJlcWlkLnRvU3RyaW5nKDE2KSwge2Vycm9yOiAnU2VydmVyIHdhcyBraWxsZWQuJ30pO1xuICAgIH1cbiAgICBpZiAodGhpcy5fYXN5bmNDb25uZWN0aW9uKSB7XG4gICAgICB0aGlzLl9hc3luY0Nvbm5lY3Rpb24uZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB9XG5cbiAgZ2V0RmxhZ3MoKTogUHJvbWlzZTw/QXJyYXk8c3RyaW5nPj4ge1xuICAgIGlmICh0aGlzLl9mbGFnc1Byb21pc2UgIT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2ZsYWdzUHJvbWlzZTtcbiAgICB9XG4gICAgdGhpcy5fZmxhZ3NQcm9taXNlID0gdGhpcy5fY2xhbmdGbGFnc01hbmFnZXIuZ2V0RmxhZ3NGb3JTcmModGhpcy5fc3JjKVxuICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgIGxvZ2dlci5lcnJvcihgY2xhbmctc2VydmVyOiBDb3VsZCBub3QgZ2V0IGZsYWdzIGZvciAke3RoaXMuX3NyY306YCwgZSk7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGdldHMgYSByZXRyeS5cbiAgICAgICAgdGhpcy5fZmxhZ3NQcm9taXNlID0gbnVsbDtcbiAgICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9mbGFnc1Byb21pc2U7XG4gIH1cblxuICBhc3luYyBtYWtlUmVxdWVzdChtZXRob2Q6IENsYW5nU2VydmVyUmVxdWVzdCwgcGFyYW1zOiBPYmplY3QpOiBQcm9taXNlPD9PYmplY3Q+IHtcbiAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgIHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMrKztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3BlbmRpbmdDb21waWxlUmVxdWVzdHMpIHtcbiAgICAgIC8vIEFsbCBvdGhlciByZXF1ZXN0cyBzaG91bGQgaW5zdGFudGx5IGZhaWwuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9tYWtlUmVxdWVzdEltcGwobWV0aG9kLCBwYXJhbXMpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAobWV0aG9kID09PSAnY29tcGlsZScpIHtcbiAgICAgICAgdGhpcy5fcGVuZGluZ0NvbXBpbGVSZXF1ZXN0cy0tO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9tYWtlUmVxdWVzdEltcGwobWV0aG9kOiBDbGFuZ1NlcnZlclJlcXVlc3QsIHBhcmFtczogT2JqZWN0KTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gICAgY29uc3QgZmxhZ3MgPSBhd2FpdCB0aGlzLmdldEZsYWdzKCk7XG4gICAgaWYgKGZsYWdzID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCB0aGlzLl9nZXRBc3luY0Nvbm5lY3Rpb24oKTtcbiAgICBpZiAoY29ubmVjdGlvbiA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXFpZCA9IHRoaXMuX2dldE5leHRSZXF1ZXN0SWQoKTtcbiAgICBjb25zdCByZXF1ZXN0ID0ge3JlcWlkLCBtZXRob2QsIHNyYzogdGhpcy5fc3JjLCBmbGFncywgLi4ucGFyYW1zfTtcbiAgICBjb25zdCBsb2dEYXRhID0gSlNPTi5zdHJpbmdpZnkocmVxdWVzdCwgKGtleSwgdmFsdWUpID0+IHtcbiAgICAgIC8vIEZpbGUgY29udGVudHMgYXJlIHRvbyBsYXJnZSBhbmQgY2x1dHRlciB1cCB0aGUgbG9ncywgc28gZXhjbHVkZSB0aGVtLlxuICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnRzJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbG9nZ2VyLmRlYnVnKCdMaWJDbGFuZyByZXF1ZXN0OiAnICsgbG9nRGF0YSk7XG4gICAgLy8gQmVjYXVzZSBOb2RlIHVzZXMgYW4gZXZlbnQtbG9vcCwgd2UgZG8gbm90IGhhdmUgdG8gd29ycnkgYWJvdXQgYSBjYWxsIHRvXG4gICAgLy8gd3JpdGUoKSBjb21pbmcgaW4gZnJvbSBhbm90aGVyIHRocmVhZCBiZXR3ZWVuIG91ciB0d28gY2FsbHMgaGVyZS5cbiAgICBjb25zdCB7d3JpdGFibGVTdHJlYW19ID0gY29ubmVjdGlvbjtcbiAgICB3cml0YWJsZVN0cmVhbS53cml0ZShKU09OLnN0cmluZ2lmeShyZXF1ZXN0KSk7XG4gICAgd3JpdGFibGVTdHJlYW0ud3JpdGUoJ1xcbicpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShyZXFpZCwgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZygnTGliQ2xhbmcgcmVzcG9uc2U6ICcgKyBKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgICBjb25zdCBpc0Vycm9yID0gJ2Vycm9yJyBpbiByZXNwb25zZTtcbiAgICAgICAgaWYgKGlzRXJyb3IpIHtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ2Vycm9yIHJlY2VpdmVkIGZyb20gY2xhbmdfc2VydmVyLnB5IGZvciByZXF1ZXN0OlxcbiVvXFxuRXJyb3I6JXMnLFxuICAgICAgICAgICAgbG9nRGF0YSxcbiAgICAgICAgICAgIHJlc3BvbnNlWydlcnJvciddKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9sYXN0UHJvY2Vzc2VkUmVxdWVzdElkID0gcGFyc2VJbnQocmVxaWQsIDE2KTtcbiAgICAgICAgKGlzRXJyb3IgPyByZWplY3QgOiByZXNvbHZlKShyZXNwb25zZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIF9nZXROZXh0UmVxdWVzdElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICh0aGlzLl9uZXh0UmVxdWVzdElkKyspLnRvU3RyaW5nKDE2KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRBc3luY0Nvbm5lY3Rpb24oKTogUHJvbWlzZTw/Q29ubmVjdGlvbj4ge1xuICAgIGlmICh0aGlzLl9hc3luY0Nvbm5lY3Rpb24gPT0gbnVsbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IGNyZWF0ZUFzeW5jQ29ubmVjdGlvbih0aGlzLl9zcmMpO1xuICAgICAgICBjb25uZWN0aW9uLnJlYWRhYmxlU3RyZWFtXG4gICAgICAgICAgLnBpcGUoc3BsaXQoSlNPTi5wYXJzZSkpXG4gICAgICAgICAgLm9uKCdkYXRhJywgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpZCA9IHJlc3BvbnNlWydyZXFpZCddO1xuICAgICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KGlkLCByZXNwb25zZSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoXG4gICAgICAgICAgICAgICdGYWlsZWQgdG8gaGFuZGxlIGxpYmNsYW5nIG91dHB1dCwgbW9zdCBsaWtlbHkgdGhlIGxpYmNsYW5nIHB5dGhvbidcbiAgICAgICAgICAgICAgKyAnIHNlcnZlciBjcmFzaGVkLicsXG4gICAgICAgICAgICAgIGVycm9yLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZSgpO1xuICAgICAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2xhc3RQcm9jZXNzZWRSZXF1ZXN0SWQgPSB0aGlzLl9uZXh0UmVxdWVzdElkIC0gMTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYXN5bmNDb25uZWN0aW9uID0gY29ubmVjdGlvbjtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdDb3VsZCBub3QgY29ubmVjdCB0byBDbGFuZyBzZXJ2ZXInLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2FzeW5jQ29ubmVjdGlvbjtcbiAgfVxuXG59XG4iXX0=