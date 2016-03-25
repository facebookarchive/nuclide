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
     * Write an Object to scribe category using JSON.stringify.
     *
     * @param message the object to write.
     * @param replacer optional replacer function which alters the behavior of the
     *        stringification process. refer
     *        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
     *        for more information.
     */
    value: _asyncToGenerator(function* (message, replacer) {
      var child = yield this._getOrCreateChildProcess();
      return new Promise(function (resolve, reject) {
        child.stdin.write('' + JSON.stringify(message) + _os2['default'].EOL, resolve);
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
//# sourceMappingURL=data:application/json;base64,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QUNILGVBQU8sS0FBSyxDQUFDO09BQ2QsQ0FBQyxDQUFDOztBQUVQLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztLQUMzQjs7OzZCQTlENkIsYUFBcUI7aUJBQzlCLE1BQU0sMEJBQVksT0FBTyxFQUFFLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7VUFBNUQsUUFBUSxRQUFSLFFBQVE7O0FBQ2YsYUFBTyxRQUFRLEtBQUssQ0FBQyxDQUFDO0tBQ3ZCOzs7U0FqQlUsYUFBYTs7OztBQStFbkIsSUFBTSxRQUFRLEdBQUc7QUFDdEIscUJBQW1CLEVBQUEsNkJBQUMsVUFBa0IsRUFBVTtBQUM5QyxRQUFNLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQztBQUMzQyxzQkFBa0IsR0FBRyxVQUFVLENBQUM7QUFDaEMsV0FBTyxlQUFlLENBQUM7R0FDeEI7Q0FDRixDQUFDIiwiZmlsZSI6IlNjcmliZVByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHtjaGVja091dHB1dCwgc2FmZVNwYXdufSBmcm9tICcuL3Byb2Nlc3MnO1xuXG5jb25zdCBERUZBVUxUX0pPSU5fVElNRU9VVCA9IDUwMDA7XG5sZXQgU0NSSUJFX0NBVF9DT01NQU5EID0gJ3NjcmliZV9jYXQnO1xuXG4vKipcbiAqIEEgd3JhcHBlciBvZiBgc2NyaWJlX2NhdGAgKGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9va2FyY2hpdmUvc2NyaWJlL2Jsb2IvbWFzdGVyL2V4YW1wbGVzL3NjcmliZV9jYXQpXG4gKiBjb21tYW5kLiBVc2VyIGNvdWxkIGNhbGwgYG5ldyBTY3JpYmVQcm9jZXNzKCRzY3JpYmVDYXRlZ29yeU5hbWUpYCB0byBjcmVhdGUgYSBwcm9jZXNzIGFuZCB0aGVuXG4gKiBjYWxsIGBzY3JpYmVQcm9jZXNzLndyaXRlKCRvYmplY3QpYCB0byBzYXZlIGFuIEpTT04gc2NoZW1hZWQgT2JqZWN0IGludG8gc2NyaWJlIGNhdGVnb3J5LlxuICogSXQgd2lsbCBhbHNvIHJlY292ZXIgZnJvbSBgc2NyaWJlX2NhdGAgZmFpbHVyZSBhdXRvbWF0aWNhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgU2NyaWJlUHJvY2VzcyB7XG4gIF9zY3JpYmVDYXRlZ29yeTogc3RyaW5nO1xuICBfY2hpbGRQcm9taXNlOiA/UHJvbWlzZTxjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2Vzcz47XG4gIF9jaGlsZFByb2Nlc3NSdW5uaW5nOiBXZWFrTWFwPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzLCBib29sZWFuPjtcblxuICBjb25zdHJ1Y3RvcihzY3JpYmVDYXRlZ29yeTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2NyaWJlQ2F0ZWdvcnkgPSBzY3JpYmVDYXRlZ29yeTtcbiAgICB0aGlzLl9jaGlsZFByb2Nlc3NSdW5uaW5nID0gbmV3IFdlYWtNYXAoKTtcbiAgICB0aGlzLl9nZXRPckNyZWF0ZUNoaWxkUHJvY2VzcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBzY3JpYmVfY2F0YCBleGlzdHMgaW4gUEFUSC5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBpc1NjcmliZUNhdE9uUGF0aCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB7ZXhpdENvZGV9ID0gYXdhaXQgY2hlY2tPdXRwdXQoJ3doaWNoJywgW1NDUklCRV9DQVRfQ09NTUFORF0pO1xuICAgIHJldHVybiBleGl0Q29kZSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBXcml0ZSBhbiBPYmplY3QgdG8gc2NyaWJlIGNhdGVnb3J5IHVzaW5nIEpTT04uc3RyaW5naWZ5LlxuICAgKlxuICAgKiBAcGFyYW0gbWVzc2FnZSB0aGUgb2JqZWN0IHRvIHdyaXRlLlxuICAgKiBAcGFyYW0gcmVwbGFjZXIgb3B0aW9uYWwgcmVwbGFjZXIgZnVuY3Rpb24gd2hpY2ggYWx0ZXJzIHRoZSBiZWhhdmlvciBvZiB0aGVcbiAgICogICAgICAgIHN0cmluZ2lmaWNhdGlvbiBwcm9jZXNzLiByZWZlclxuICAgKiAgICAgICAgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9zdHJpbmdpZnlcbiAgICogICAgICAgIGZvciBtb3JlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgYXN5bmMgd3JpdGUobWVzc2FnZTogc3RyaW5nIHwgT2JqZWN0LCByZXBsYWNlcj86ICgpPT5taXhlZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGNoaWxkID0gYXdhaXQgdGhpcy5fZ2V0T3JDcmVhdGVDaGlsZFByb2Nlc3MoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY2hpbGQuc3RkaW4ud3JpdGUoYCR7SlNPTi5zdHJpbmdpZnkobWVzc2FnZSl9JHtvcy5FT0x9YCwgcmVzb2x2ZSk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9jaGlsZFByb21pc2UpIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gYXdhaXQgdGhpcy5fY2hpbGRQcm9taXNlO1xuICAgICAgaWYgKHRoaXMuX2NoaWxkUHJvY2Vzc1J1bm5pbmcuZ2V0KGNoaWxkKSkge1xuICAgICAgICBjaGlsZC5raWxsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgam9pbih0aW1lb3V0OiBudW1iZXIgPSBERUZBVUxUX0pPSU5fVElNRU9VVCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLl9jaGlsZFByb21pc2UpIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gYXdhaXQgdGhpcy5fY2hpbGRQcm9taXNlO1xuICAgICAgY2hpbGQuc3RkaW4uZW5kKCk7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNoaWxkLm9uKCdleGl0JywgKCkgPT4gcmVzb2x2ZSgpKTtcbiAgICAgICAgc2V0VGltZW91dChyZXNvbHZlLCB0aW1lb3V0KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9nZXRPckNyZWF0ZUNoaWxkUHJvY2VzcygpOiBQcm9taXNlPGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzPiB7XG4gICAgaWYgKHRoaXMuX2NoaWxkUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NoaWxkUHJvbWlzZTtcbiAgICB9XG5cbiAgICB0aGlzLl9jaGlsZFByb21pc2UgPSBzYWZlU3Bhd24oU0NSSUJFX0NBVF9DT01NQU5ELCBbdGhpcy5fc2NyaWJlQ2F0ZWdvcnldKVxuICAgICAgICAudGhlbihjaGlsZCA9PiB7XG4gICAgICAgICAgY2hpbGQuc3RkaW4uc2V0RGVmYXVsdEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICAgICAgdGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZy5zZXQoY2hpbGQsIHRydWUpO1xuICAgICAgICAgIGNoaWxkLm9uKCdlcnJvcicsIGVycm9yID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2NoaWxkUHJvbWlzZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZFByb2Nlc3NSdW5uaW5nLnNldChjaGlsZCwgZmFsc2UpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNoaWxkLm9uKCdleGl0JywgZSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9jaGlsZFByb21pc2UgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fY2hpbGRQcm9jZXNzUnVubmluZy5zZXQoY2hpbGQsIGZhbHNlKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAgIH0pO1xuXG4gICAgcmV0dXJuIHRoaXMuX2NoaWxkUHJvbWlzZTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3QgX190ZXN0X18gPSB7XG4gIHNldFNjcmliZUNhdENvbW1hbmQobmV3Q29tbWFuZDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBvcmlnaW5hbENvbW1hbmQgPSBTQ1JJQkVfQ0FUX0NPTU1BTkQ7XG4gICAgU0NSSUJFX0NBVF9DT01NQU5EID0gbmV3Q29tbWFuZDtcbiAgICByZXR1cm4gb3JpZ2luYWxDb21tYW5kO1xuICB9LFxufTtcbiJdfQ==