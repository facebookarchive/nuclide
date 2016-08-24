Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _process2;

function _process() {
  return _process2 = require('./process');
}

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
        child.stdin.write('' + message + (_os2 || _os()).default.EOL, resolve);
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

      this._childPromise = (0, (_process2 || _process()).safeSpawn)(SCRIBE_CAT_COMMAND, [this._scribeCategory]).then(function (child) {
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
      var _ref = yield (0, (_process2 || _process()).asyncExecute)('which', [SCRIBE_CAT_COMMAND]);

      var exitCode = _ref.exitCode;

      return exitCode === 0;
    })
  }]);

  return ScribeProcess;
})();

exports.default = ScribeProcess;
var __test__ = {
  setScribeCatCommand: function setScribeCatCommand(newCommand) {
    var originalCommand = SCRIBE_CAT_COMMAND;
    SCRIBE_CAT_COMMAND = newCommand;
    return originalCommand;
  }
};
exports.__test__ = __test__;