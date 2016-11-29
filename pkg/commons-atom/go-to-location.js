'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.goToLocation = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

// Opens the given file at the line/column.
// By default will center the opened text editor.
let goToLocation = exports.goToLocation = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (file, line, column, center = true) {
    // Prefer going to the current editor rather than the leftmost editor.
    const currentEditor = atom.workspace.getActiveTextEditor();
    if (currentEditor != null && currentEditor.getPath() === file) {
      if (line != null) {
        goToLocationInEditor(currentEditor, line, column == null ? 0 : column, center);
      } else {
        if (!(center !== true)) {
          throw new Error('goToLocation: Cannot center if no line specfied');
        }

        if (!(column == null)) {
          throw new Error('goToLocation: Cannot specify just column');
        }
      }
      return currentEditor;
    } else {
      const editor = yield atom.workspace.open(file, {
        initialLine: line,
        initialColumn: column,
        searchAllPanes: true
      });

      if (center) {
        editor.scrollToBufferPosition([line, column], { center: true });
      }
      return editor;
    }
  });

  return function goToLocation(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.goToLocationInEditor = goToLocationInEditor;
exports.observeNavigatingEditors = observeNavigatingEditors;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const goToLocationSubject = new _rxjsBundlesRxMinJs.Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
function goToLocationInEditor(editor, line, column, center = true) {
  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }

  goToLocationSubject.next(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}