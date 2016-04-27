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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.outlineFromHackOutline = outlineFromHackOutline;

var outlineFromEditor = _asyncToGenerator(function* (editor) {
  var filePath = editor.getPath();
  if (filePath == null) {
    return null;
  }
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (hackLanguage == null) {
    return null;
  }

  var contents = editor.getText();

  return yield hackLanguage.getOutline(filePath, contents);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideTokenizedText = require('../../nuclide-tokenized-text');

var _HackLanguage = require('./HackLanguage');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var OutlineViewProvider = (function () {
  function OutlineViewProvider() {
    _classCallCheck(this, OutlineViewProvider);
  }

  // Exported for testing

  _createClass(OutlineViewProvider, [{
    key: 'getOutline',
    value: _asyncToGenerator(function* (editor) {
      var hackOutline = yield outlineFromEditor(editor);
      if (hackOutline == null) {
        return null;
      }
      return outlineFromHackOutline(hackOutline);
    })
  }]);

  return OutlineViewProvider;
})();

exports.OutlineViewProvider = OutlineViewProvider;

function outlineFromHackOutline(hackOutline) {
  var classes = extractClasses(hackOutline);
  addMethodsToClasses(hackOutline, classes);

  var functions = extractFunctions(hackOutline);

  var outlineTrees = Array.from(classes.values()).concat(functions);
  sortOutline(outlineTrees);

  return {
    outlineTrees: outlineTrees
  };
}

function extractClasses(hackOutline) {
  var classes = new Map();
  for (var item of hackOutline) {
    if (item.type === 'class') {
      classes.set(item.name, outlineTreeFromHackOutlineItem(item));
    }
  }
  return classes;
}

function addMethodsToClasses(hackOutline, classes) {
  for (var item of hackOutline) {
    if (item.type === 'method' || item.type === 'static method') {
      // TODO handle bad input

      var _item$name$split = item.name.split('::');

      var _item$name$split2 = _slicedToArray(_item$name$split, 2);

      var classId = _item$name$split2[0];
      var methodName = _item$name$split2[1];

      (0, _assert2['default'])(methodName != null, 'Expected method name to include \'::\', got \'' + item.name + '\'');

      var methodOutline = outlineTreeFromHackOutlineItem(item);

      var classOutline = classes.get(classId);
      (0, _assert2['default'])(classOutline != null, 'Missing class ' + classId);
      classOutline.children.push(methodOutline);
    }
  }
}

function extractFunctions(hackOutline) {
  var functions = [];
  for (var item of hackOutline) {
    if (item.type === 'function') {
      functions.push(outlineTreeFromHackOutlineItem(item));
    }
  }
  return functions;
}

function sortOutline(outlineTrees) {
  for (var tree of outlineTrees) {
    sortOutline(tree.children);
  }
  outlineTrees.sort(function (a, b) {
    return a.startPosition.compare(b.startPosition);
  });
}

function outlineTreeFromHackOutlineItem(item) {
  var text = [];
  switch (item.type) {
    case 'static method':
    case 'method':
      var _item$name$split3 = item.name.split('::'),
          _item$name$split32 = _slicedToArray(_item$name$split3, 2),
          methodName = _item$name$split32[1];

      (0, _assert2['default'])(methodName != null, 'Expected method name to include \'::\', got \'' + item.name + '\'');

      if (item.type === 'static method') {
        text.push((0, _nuclideTokenizedText.keyword)('static'));
        text.push((0, _nuclideTokenizedText.whitespace)(' '));
      }
      text.push((0, _nuclideTokenizedText.keyword)('function'));
      text.push((0, _nuclideTokenizedText.whitespace)(' '));
      text.push((0, _nuclideTokenizedText.method)(methodName));
      break;
    case 'function':
      text.push((0, _nuclideTokenizedText.keyword)('function'));
      text.push((0, _nuclideTokenizedText.whitespace)(' '));
      text.push((0, _nuclideTokenizedText.method)(item.name));
      break;
    case 'class':
      text.push((0, _nuclideTokenizedText.keyword)('class'));
      text.push((0, _nuclideTokenizedText.whitespace)(' '));
      text.push((0, _nuclideTokenizedText.className)(item.name));
      break;
    default:
      throw new Error('Unrecognized item type ' + item.type);
  }

  return {
    tokenizedText: text,
    startPosition: pointFromHackOutlineItem(item),
    children: []
  };
}

function pointFromHackOutlineItem(item) {
  return new _atom.Point(item.line - 1, item.char_start - 1);
}