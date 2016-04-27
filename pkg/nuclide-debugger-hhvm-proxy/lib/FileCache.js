var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _helpers = require('./helpers');

var _ClientCallback = require('./ClientCallback');

var _File = require('./File');

var _File2 = _interopRequireDefault(_File);

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
      var filepath = (0, _helpers.uriToPath)(fileUrl);
      if (!this._files.has(filepath)) {
        this._files.set(filepath, new _File2['default'](filepath));
        this._callback.sendMethod(this._callback.getServerMessageObservable(), 'Debugger.scriptParsed', {
          'scriptId': filepath,
          'url': fileUrl,
          'startLine': 0,
          'startColumn': 0,
          'endLine': 0,
          'endColumn': 0
        });
      }
      var result = this._files.get(filepath);
      (0, _assert2['default'])(result != null);
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