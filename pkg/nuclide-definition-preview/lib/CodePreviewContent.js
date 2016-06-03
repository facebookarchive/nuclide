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

var contentOfEditor = _asyncToGenerator(function* (definitionService, editorPosition) {
  if (editorPosition == null) {
    return null;
  }
  var editor = editorPosition.editor;
  var position = editorPosition.position;
  var queryResult = yield definitionService.getDefinition(editor, position);
  if (queryResult == null) {
    return null;
  }
  (0, (_assert2 || _assert()).default)(queryResult.definitions.length > 0);
  var definition = queryResult.definitions[0];

  var path = editor.getPath();
  (0, (_assert2 || _assert()).default)(path != null);
  return {
    location: {
      path: path,
      position: position
    },
    symbolName: definition.name,
    definition: {
      path: definition.path,
      position: definition.position
    },
    grammar: editor.getGrammar()
  };
});

exports.getContent = getContent;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _commonsAtomDebounced2;

function _commonsAtomDebounced() {
  return _commonsAtomDebounced2 = require('../../commons-atom/debounced');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function getContent(definitionService) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.concat((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of(null), (0, (_commonsAtomDebounced2 || _commonsAtomDebounced()).observeTextEditorsPositions)().switchMap(function (editorPosition) {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(contentOfEditor(definitionService, editorPosition));
  }).filter(function (content) {
    return content != null;
  }));
}