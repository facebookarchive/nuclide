var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _ClientCallback2;

function _ClientCallback() {
  return _ClientCallback2 = require('./ClientCallback');
}

var _File2;

function _File() {
  return _File2 = _interopRequireDefault(require('./File'));
}

/**
 * Handles registering files encountered during debugging with the Chrome debugger
 */

var FileCache = (function () {
  function FileCache(callback) {
    _classCallCheck(this, FileCache);

    this._callback = callback;
    this._files = new Map();
  }

  _createClass(FileCache, [{
    key: 'registerFile',
    value: function registerFile(fileUrl) {
      var filepath = (0, (_helpers2 || _helpers()).uriToPath)(fileUrl);
      if (!this._files.has(filepath)) {
        this._files.set(filepath, new (_File2 || _File()).default(filepath));
        this._callback.sendMethod(this._callback.getServerMessageObservable(), 'Debugger.scriptParsed', {
          scriptId: filepath,
          url: fileUrl,
          startLine: 0,
          startColumn: 0,
          endLine: 0,
          endColumn: 0
        });
      }
      var result = this._files.get(filepath);
      (0, (_assert2 || _assert()).default)(result != null);
      return result;
    }
  }, {
    key: 'getFileSource',
    value: function getFileSource(filepath) {
      return this.registerFile(filepath).getSource();
    }
  }]);

  return FileCache;
})();

module.exports = FileCache;