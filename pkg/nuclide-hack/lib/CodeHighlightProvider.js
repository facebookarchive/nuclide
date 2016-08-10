Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var codeHighlightFromEditor = _asyncToGenerator(function* (editor, position) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(filePath);
  if (!hackLanguage) {
    return [];
  }
  (0, (_assert2 || _assert()).default)(filePath != null);

  var id = (0, (_utils2 || _utils()).getIdentifierAtPosition)(editor, position);
  if (id == null) {
    return [];
  }

  return hackLanguage.highlightSource(filePath, editor.getText(), position.row + 1, position.column);
});

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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

var CodeHighlightProvider = (function () {
  function CodeHighlightProvider() {
    _classCallCheck(this, CodeHighlightProvider);
  }

  _createClass(CodeHighlightProvider, [{
    key: 'highlight',
    value: function highlight(editor, position) {
      return codeHighlightFromEditor(editor, position);
    }
  }]);

  return CodeHighlightProvider;
})();

exports.default = CodeHighlightProvider;
module.exports = exports.default;