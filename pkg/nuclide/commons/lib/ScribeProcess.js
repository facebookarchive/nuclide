Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
     * Write an Object to scribe category using JSON.stringify.
     *
     * @param message the object to write.
     * @param replacer optional replacer function which alters the behavior of the
     *        stringification process. refer
     *        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
     *        for more information.
     */
    value: _asyncToGenerator(function* (message, replacer) {
      var os = require('os');
      var child = yield this._getOrCreateChildProcess();
      return new Promise(function (resolve, reject) {
        child.stdin.write('' + JSON.stringify(message) + os.EOL, resolve);
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
//# sourceMappingURL=data:application/json;base64,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RSxLQUFLLENBQUMsQ0FBQztTQUM3QyxDQUFDLENBQUM7QUFDSCxlQUFPLEtBQUssQ0FBQztPQUNkLENBQUMsQ0FBQzs7QUFFUCxhQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7S0FDM0I7Ozs2QkEvRDZCLGFBQXFCO2lCQUM5QixNQUFNLDBCQUFZLE9BQU8sRUFBRSxDQUFDLGtCQUFrQixDQUFDLENBQUM7O1VBQTVELFFBQVEsUUFBUixRQUFROztBQUNmLGFBQU8sUUFBUSxLQUFLLENBQUMsQ0FBQztLQUN2Qjs7O1NBakJVLGFBQWE7Ozs7QUFnRm5CLElBQU0sUUFBUSxHQUFHO0FBQ3RCLHFCQUFtQixFQUFBLDZCQUFDLFVBQWtCLEVBQVU7QUFDOUMsUUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUM7QUFDM0Msc0JBQWtCLEdBQUcsVUFBVSxDQUFDO0FBQ2hDLFdBQU8sZUFBZSxDQUFDO0dBQ3hCO0NBQ0YsQ0FBQyIsImZpbGUiOiJTY3JpYmVQcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtjaGVja091dHB1dCwgc2FmZVNwYXdufSBmcm9tICcuL3Byb2Nlc3MnO1xuXG5jb25zdCBERUZBVUxUX0pPSU5fVElNRU9VVCA9IDUwMDA7XG5sZXQgU0NSSUJFX0NBVF9DT01NQU5EID0gJ3NjcmliZV9jYXQnO1xuXG4vKipcbiAqIEEgd3JhcHBlciBvZiBgc2NyaWJlX2NhdGAgKGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9va2FyY2hpdmUvc2NyaWJlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3NjcmliZV9jYXQpXG4gKiBjb21tYW5kLiBVc2VyIGNvdWxkIGNhbGwgYG5ldyBTY3JpYmVQcm9jZXNzKCRzY3JpYmVDYXRlZ29yeU5hbWUpYCB0byBjcmVhdGUgYSBwcm9jZXNzIGFuZCB0aGVuXG4gKiBjYWxsIGBzY3JpYmVQcm9jZXNzLndyaXRlKCRvYmplY3QpYCB0byBzYXZlIGFuIEpTT04gc2NoZW1hZWQgT2JqZWN0IGludG8gc2NyaWJlIGNhdGVnb3J5LlxuICogSXQgd2lsbCBhbHNvIHJlY292ZXIgZnJvbSBgc2NyaWJlX2NhdGAgZmFpbHVyZSBhdXRvbWF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU2NyaWJlUHJvY2VzcyB7XG4gIF9zY3JpYmVDYXRlZ29yeTogc3RyaW5nO1xuICBfY2hpbGRQcm9taXNlOiA/UHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz47XG4gIF9jaGlsZFByb2Nlc3NSdW5uaW5nOiBXZWFrTWFwPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBib29sZWFuPjtcblxuICBjb25zdHJ1Y3RvcihzY3JpYmVDYXRlZ29yeTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2NyaWJlQ2F0ZWdvcnkgPSBzY3JpYmVDYXRlZ29yeTtcbiAgICB0aGlzLl9jaGlsZFByb2Nlc3NSdW5uaW5nID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9nZXRPckNyZWF0ZUNoaWxkUHJvY2VzcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBzY3JpYmVfY2F0YCBleGlzdHMgaW4gUEFUSC5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBpc1NjcmliZUNhdE9uUGF0aCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB7ZXhpdENvZGV9ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3doaWNoJywgW1NDUklCRV9DQVRfQ09NTUFORF0pO1xuICAgIHJldHVybiBleGl0Q29kZSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBhbiBPYmplY3QgdG8gc2NyaWJlIGNhdGVnb3J5IHVzaW5nIEpTT04uc3RyaW5naWZ5LlxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSB0aGUgb2JqZWN0IHRvIHdyaXRlLlxuICAgKiBAcGFyYW0gcmVwbGFjZXIgb3B0aW9uYWwgcmVwbGFjZXIgZnVuY3Rpb24gd2hpY2ggYWx0ZXJzIHRoZSBiZWhhdmlvciBvZiB0aGVcbiAgICogICAgICAgIHN0cmluZ2lmaWNhdGlvbiBwcm9jZXNzLiByZWZlclxuICAgKiAgICAgICAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnlcbiAgICogICAgICAgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgYXN5bmMgd3JpdGUobWVzc2FnZTogc3RyaW5nIHwgT2JqZWN0LCByZXBsYWNlcj86ICgpPT5taXhlZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbiAgICBjb25zdCBjaGlsZCA9IGF3YWl0IHRoaXMuX2dldE9yQ3JlYXRlQ2hpbGRQcm9jZXNzKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNoaWxkLnN0ZGluLndyaXRlKGAke0pTT04uc3RyaW5naWZ5KG1lc3NhZ2UpfSR7b3MuRU9MfWAsIHJlc29sdmUpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fY2hpbGRQcm9taXNlKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGF3YWl0IHRoaXMuX2NoaWxkUHJvbWlzZTtcbiAgICAgIGlmICh0aGlzLl9jaGlsZFByb2Nlc3NSdW5uaW5nLmdldChjaGlsZCkpIHtcbiAgICAgICAgY2hpbGQua2lsbCgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGpvaW4odGltZW91dDogbnVtYmVyID0gREVGQVVMVF9KT0lOX1RJTUVPVVQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5fY2hpbGRQcm9taXNlKSB7XG4gICAgICBjb25zdCBjaGlsZCA9IGF3YWl0IHRoaXMuX2NoaWxkUHJvbWlzZTtcbiAgICAgIGNoaWxkLnN0ZGluLmVuZCgpO1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHJlc29sdmUoKSk7XG4gICAgICAgIHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZW91dCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfZ2V0T3JDcmVhdGVDaGlsZFByb2Nlc3MoKTogUHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz4ge1xuICAgIGlmICh0aGlzLl9jaGlsZFByb21pc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jaGlsZFByb21pc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hpbGRQcm9taXNlID0gc2FmZVNwYXduKFNDUklCRV9DQVRfQ09NTUFORCwgW3RoaXMuX3NjcmliZUNhdGVnb3J5XSlcbiAgICAgICAgLnRoZW4oY2hpbGQgPT4ge1xuICAgICAgICAgIGNoaWxkLnN0ZGluLnNldERlZmF1bHRFbmNvZGluZygndXRmOCcpO1xuICAgICAgICAgIHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuc2V0KGNoaWxkLCB0cnVlKTtcbiAgICAgICAgICBjaGlsZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZFByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZy5zZXQoY2hpbGQsIGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjaGlsZC5vbignZXhpdCcsIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9taXNlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuc2V0KGNoaWxkLCBmYWxzZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiB0aGlzLl9jaGlsZFByb21pc2U7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IF9fdGVzdF9fID0ge1xuICBzZXRTY3JpYmVDYXRDb21tYW5kKG5ld0NvbW1hbmQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3Qgb3JpZ2luYWxDb21tYW5kID0gU0NSSUJFX0NBVF9DT01NQU5EO1xuICAgIFNDUklCRV9DQVRfQ09NTUFORCA9IG5ld0NvbW1hbmQ7XG4gICAgcmV0dXJuIG9yaWdpbmFsQ29tbWFuZDtcbiAgfSxcbn07XG4iXX0=