Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _process = require('./process');

var DEFAULT_JOIN_TIMEOUT = 5000;
var SCRIBE_CAT_COMMAND = 'scribe_cat';

/**
 * A wrapper of `scribe_cat` (https://github.com/facebookarchive/scribe/blob/master/examples/scribe_cat)
 * command. User could call `new ScribeProcess($scribeCategoryName)` to create a process and then
 * call `scribeProcess.write($object)` to save an JSON schemaed Object into scribe category.
 * It will also recover from `scribe_cat` failure automatically.
 */

var ScribeProcess = (function () {
  function ScribeProcess(scribeCategory) {
    _classCallCheck(this, ScribeProcess);

    this._scribeCategory = scribeCategory;
    this._childProcessRunning = new WeakMap();
    this._getOrCreateChildProcess();
  }

  /**
   * Check if `scribe_cat` exists in PATH.
   */

  _createClass(ScribeProcess, [{
    key: 'write',

    /**
     * Write a string to a Scribe category.
     * Ensure newlines are properly escaped.
     */
    value: _asyncToGenerator(function* (message) {
      var child = yield this._getOrCreateChildProcess();
      return new Promise(function (resolve, reject) {
        child.stdin.write('' + message + _os2['default'].EOL, resolve);
      });
    })
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      if (this._childPromise) {
        var child = yield this._childPromise;
        if (this._childProcessRunning.get(child)) {
          child.kill();
        }
      }
    })
  }, {
    key: 'join',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var timeout = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_JOIN_TIMEOUT : arguments[0];

      if (this._childPromise) {
        var _ret = yield* (function* () {
          var child = yield _this._childPromise;
          child.stdin.end();
          return {
            v: new Promise(function (resolve) {
              child.on('exit', function () {
                return resolve();
              });
              setTimeout(resolve, timeout);
            })
          };
        })();

        if (typeof _ret === 'object') return _ret.v;
      }
    })
  }, {
    key: '_getOrCreateChildProcess',
    value: function _getOrCreateChildProcess() {
      var _this2 = this;

      if (this._childPromise) {
        return this._childPromise;
      }

      this._childPromise = (0, _process.safeSpawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory]).then(function (child) {
        child.stdin.setDefaultEncoding('utf8');
        _this2._childProcessRunning.set(child, true);
        child.on('error', function (error) {
          _this2._childPromise = null;
          _this2._childProcessRunning.set(child, false);
        });
        child.on('exit', function (e) {
          _this2._childPromise = null;
          _this2._childProcessRunning.set(child, false);
        });
        return child;
      });

      return this._childPromise;
    }
  }], [{
    key: 'isScribeCatOnPath',
    value: _asyncToGenerator(function* () {
      var _ref = yield (0, _process.checkOutput)('which', [SCRIBE_CAT_COMMAND]);

      var exitCode = _ref.exitCode;

      return exitCode === 0;
    })
  }]);

  return ScribeProcess;
})();

exports.ScribeProcess = ScribeProcess;
var __test__ = {
  setScribeCatCommand: function setScribeCatCommand(newCommand) {
    var originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};
exports.__test__ = __test__;
//# sourceMappingURL=data:application/json;base64,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QU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUMzQjs7OzZCQXpENkIsYUFBcUI7aUJBQzlCLE1BQU0sMEJBQVksT0FBTyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7VUFBNUQsUUFBUSxRQUFSLFFBQVE7O0FBQ2YsYUFBTyxRQUFRLEtBQUssQ0FBQyxDQUFDO0tBQ3ZCOzs7U0FqQlUsYUFBYTs7OztBQTBFbkIsSUFBTSxRQUFRLEdBQUc7QUFDdEIscUJBQW1CLEVBQUEsNkJBQUMsVUFBa0IsRUFBVTtBQUM5QyxRQUFNLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztBQUMzQyxzQkFBa0IsR0FBRyxVQUFVLENBQUM7QUFDaEMsV0FBTyxlQUFlLENBQUM7R0FDeEI7Q0FDRixDQUFDIiwiZmlsZSI6IlNjcmliZVByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHtjaGVja091dHB1dCwgc2FmZVNwYXdufSBmcm9tICcuL3Byb2Nlc3MnO1xuXG5jb25zdCBERUZBVUxUX0pPSU5fVElNRU9VVCA9IDUwMDA7XG5sZXQgU0NSSUJFX0NBVF9DT01NQU5EID0gJ3NjcmliZV9jYXQnO1xuXG4vKipcbiAqIEEgd3JhcHBlciBvZiBgc2NyaWJlX2NhdGAgKGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9va2FyY2hpdmUvc2NyaWJlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3NjcmliZV9jYXQpXG4gKiBjb21tYW5kLiBVc2VyIGNvdWxkIGNhbGwgYG5ldyBTY3JpYmVQcm9jZXNzKCRzY3JpYmVDYXRlZ29yeU5hbWUpYCB0byBjcmVhdGUgYSBwcm9jZXNzIGFuZCB0aGVuXG4gKiBjYWxsIGBzY3JpYmVQcm9jZXNzLndyaXRlKCRvYmplY3QpYCB0byBzYXZlIGFuIEpTT04gc2NoZW1hZWQgT2JqZWN0IGludG8gc2NyaWJlIGNhdGVnb3J5LlxuICogSXQgd2lsbCBhbHNvIHJlY292ZXIgZnJvbSBgc2NyaWJlX2NhdGAgZmFpbHVyZSBhdXRvbWF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU2NyaWJlUHJvY2VzcyB7XG4gIF9zY3JpYmVDYXRlZ29yeTogc3RyaW5nO1xuICBfY2hpbGRQcm9taXNlOiA/UHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz47XG4gIF9jaGlsZFByb2Nlc3NSdW5uaW5nOiBXZWFrTWFwPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBib29sZWFuPjtcblxuICBjb25zdHJ1Y3RvcihzY3JpYmVDYXRlZ29yeTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2NyaWJlQ2F0ZWdvcnkgPSBzY3JpYmVDYXRlZ29yeTtcbiAgICB0aGlzLl9jaGlsZFByb2Nlc3NSdW5uaW5nID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9nZXRPckNyZWF0ZUNoaWxkUHJvY2VzcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBzY3JpYmVfY2F0YCBleGlzdHMgaW4gUEFUSC5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBpc1NjcmliZUNhdE9uUGF0aCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB7ZXhpdENvZGV9ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3doaWNoJywgW1NDUklCRV9DQVRfQ09NTUFORF0pO1xuICAgIHJldHVybiBleGl0Q29kZSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBhIHN0cmluZyB0byBhIFNjcmliZSBjYXRlZ29yeS5cbiAgICogRW5zdXJlIG5ld2xpbmVzIGFyZSBwcm9wZXJseSBlc2NhcGVkLlxuICAgKi9cbiAgYXN5bmMgd3JpdGUobWVzc2FnZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hpbGQgPSBhd2FpdCB0aGlzLl9nZXRPckNyZWF0ZUNoaWxkUHJvY2VzcygpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjaGlsZC5zdGRpbi53cml0ZShgJHttZXNzYWdlfSR7b3MuRU9MfWAsIHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fY2hpbGRQcm9taXNlKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGF3YWl0IHRoaXMuX2NoaWxkUHJvbWlzZTtcbiAgICAgIGlmICh0aGlzLl9jaGlsZFByb2Nlc3NSdW5uaW5nLmdldChjaGlsZCkpIHtcbiAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGpvaW4odGltZW91dDogbnVtYmVyID0gREVGQVVMVF9KT0lOX1RJTUVPVVQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fY2hpbGRQcm9taXNlKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGF3YWl0IHRoaXMuX2NoaWxkUHJvbWlzZTtcbiAgICAgIGNoaWxkLnN0ZGluLmVuZCgpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZW91dCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0T3JDcmVhdGVDaGlsZFByb2Nlc3MoKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICAgIGlmICh0aGlzLl9jaGlsZFByb21pc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jaGlsZFByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hpbGRQcm9taXNlID0gc2FmZVNwYXduKFNDUklCRV9DQVRfQ09NTUFORCwgW3RoaXMuX3NjcmliZUNhdGVnb3J5XSlcbiAgICAgICAgLnRoZW4oY2hpbGQgPT4ge1xuICAgICAgICAgIGNoaWxkLnN0ZGluLnNldERlZmF1bHRFbmNvZGluZygndXRmOCcpO1xuICAgICAgICAgIHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuc2V0KGNoaWxkLCB0cnVlKTtcbiAgICAgICAgICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZFByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZy5zZXQoY2hpbGQsIGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjaGlsZC5vbignZXhpdCcsIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuc2V0KGNoaWxkLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9jaGlsZFByb21pc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBzZXRTY3JpYmVDYXRDb21tYW5kKG5ld0NvbW1hbmQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgb3JpZ2luYWxDb21tYW5kID0gU0NSSUJFX0NBVF9DT01NQU5EO1xuICAgIFNDUklCRV9DQVRfQ09NTUFORCA9IG5ld0NvbW1hbmQ7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ29tbWFuZDtcbiAgfSxcbn07XG4iXX0=