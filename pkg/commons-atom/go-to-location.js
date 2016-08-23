Object.defineProperty(exports, '__esModule', {
  value: true
});

// Opens the given file at the line/column.
// By default will center the opened text editor.

var goToLocation = _asyncToGenerator(function* (file, line, column) {
  var center = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  var editor = yield atom.workspace.open(file, {
    initialLine: line,
    initialColumn: column,
    searchAllPanes: true
  });

  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }
  return editor;
});

exports.goToLocation = goToLocation;
exports.goToLocationInEditor = goToLocationInEditor;
exports.observeNavigatingEditors = observeNavigatingEditors;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var goToLocationSubject = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation

function goToLocationInEditor(editor, line, column) {
  var center = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }

  goToLocationSubject.next(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}