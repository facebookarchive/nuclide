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

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _nuclideOpenFiles2;

function _nuclideOpenFiles() {
  return _nuclideOpenFiles2 = require('../../nuclide-open-files');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var CodeHighlightProvider = (function () {
  function CodeHighlightProvider() {
    _classCallCheck(this, CodeHighlightProvider);
  }

  _createClass(CodeHighlightProvider, [{
    key: 'highlight',
    value: _asyncToGenerator(function* (editor, position) {
      var fileVersion = yield (0, (_nuclideOpenFiles2 || _nuclideOpenFiles()).getFileVersionOfEditor)(editor);
      var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(editor.getPath());
      if (hackLanguage == null || fileVersion == null) {
        return [];
      }

      return (yield hackLanguage.highlight(fileVersion, position)).map(function (range) {
        return new (_atom2 || _atom()).Range(range.start, range.end);
      });
    })
  }]);

  return CodeHighlightProvider;
})();

exports.default = CodeHighlightProvider;
module.exports = exports.default;