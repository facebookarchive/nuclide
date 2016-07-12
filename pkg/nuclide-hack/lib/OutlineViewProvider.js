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

exports.outlineFromHackIdeOutline = outlineFromHackIdeOutline;

var outlineFromEditor = _asyncToGenerator(function* (editor) {
  var filePath = editor.getPath();
  if (filePath == null) {
    return null;
  }
  var hackLanguage = yield (0, (_HackLanguage2 || _HackLanguage()).getHackLanguageForUri)(filePath);
  if (hackLanguage == null) {
    return null;
  }

  var contents = editor.getText();

  return yield hackLanguage.getIdeOutline(filePath, contents);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideTokenizedText2;

function _nuclideTokenizedText() {
  return _nuclideTokenizedText2 = require('../../nuclide-tokenized-text');
}

var _HackLanguage2;

function _HackLanguage() {
  return _HackLanguage2 = require('./HackLanguage');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var OutlineViewProvider = (function () {
  function OutlineViewProvider() {
    _classCallCheck(this, OutlineViewProvider);
  }

  _createClass(OutlineViewProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      var hackOutline = yield outlineFromEditor(editor);
      if (hackOutline == null) {
        return null;
      }
      return outlineFromHackIdeOutline(hackOutline);
    })
  }]);

  return OutlineViewProvider;
})();

exports.OutlineViewProvider = OutlineViewProvider;

function outlineFromHackIdeOutline(hackOutline) {
  return {
    outlineTrees: hackOutline.map(outlineFromHackIdeItem)
  };
}

function outlineFromHackIdeItem(hackItem) {
  var tokenizedText = [];

  function addKeyword(value) {
    tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).keyword)(value));
    tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '));
  }

  function addModifiers(modifiers) {
    if (modifiers != null) {
      modifiers.forEach(addKeyword);
    }
  }

  addModifiers(hackItem.modifiers);
  switch (hackItem.kind) {
    case 'typeconst':
      addKeyword('const');
      addKeyword('type');
      break;
    case 'method':
      addKeyword('function');
      break;
    default:
      addKeyword(hackItem.kind);
      break;
  }

  // name
  switch (hackItem.kind) {
    case 'class':
    case 'enum':
    case 'typeconst':
      tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).className)(hackItem.name));
      break;
    default:
      tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).method)(hackItem.name));
      break;
  }

  // params
  var params = hackItem.params;
  if (params != null) {
    tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)('('));
    var first = true;
    for (var param of params) {
      if (!first) {
        tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(','));
        tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).whitespace)(' '));
      }
      first = false;
      addModifiers(param.modifiers);
      tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(param.name));
    }
    tokenizedText.push((0, (_nuclideTokenizedText2 || _nuclideTokenizedText()).plain)(')'));
  }

  return {
    tokenizedText: tokenizedText,
    representativeName: hackItem.name,
    startPosition: pointFromHack(hackItem.position.line, hackItem.position.char_start),
    endPosition: pointFromHack(hackItem.span.line_end, hackItem.span.char_end),
    children: hackItem.children == null ? [] : hackItem.children.map(outlineFromHackIdeItem)
  };
}

function pointFromHack(hackLine, hackColumn) {
  return new (_atom2 || _atom()).Point(hackLine - 1, hackColumn - 1);
}