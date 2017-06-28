'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.goToLocation = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Opens the given file.
 *
 * Optionally include a line and column to navigate to. If a line is given, by default it will
 * center it in the opened text editor.
 *
 * This should be preferred over `atom.workspace.open()` in typical cases. The motivations are:
 * - We call `atom.workspace.open()` with the `searchAllPanes` option. This looks in other panes for
 *   the current file, rather just opening a new copy in the current pane. People often forget this
 *   option which typically leads to a subpar experience for people who use multiple panes.
 * - When moving around in the current file, `goToLocation` explicitly publishes events that the nav
 *   stack uses.
 *
 * Currently, `atom.workspace.open()` should be used only in these cases:
 * - When the URI to open is not a file URI. For example, if we want to open some tool like find
 *   references in a pane.
 * - When we want to open an untitled file (providing no file argument). Currently, goToLocation
 *   requires a file to open.
 * - When we want to open a file as a pending pane item. Currently goToLocation cannot do this.
 *
 * In these cases, you may disable the lint rule against `atom.workspace.open` by adding the
 * following comment above its use:
 * // eslint-disable-next-line nuclide-internal/atom-apis
 */
let goToLocation = exports.goToLocation = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (file, line, column, center = true) {
    // Prefer going to the current editor rather than the leftmost editor.
    const currentEditor = atom.workspace.getActiveTextEditor();
    if (currentEditor != null && currentEditor.getPath() === file) {
      if (line != null) {
        goToLocationInEditor(currentEditor, line, column == null ? 0 : column, center);
      } else {
        if (!(column == null)) {
          throw new Error('goToLocation: Cannot specify just column');
        }
      }
      return currentEditor;
    } else {
      // Obviously, calling goToLocation isn't a viable alternative here :P
      // eslint-disable-next-line nuclide-internal/atom-apis
      const editor = yield atom.workspace.open(file, {
        initialLine: line,
        initialColumn: column,
        searchAllPanes: true
      });

      if (center && line != null) {
        editor.scrollToBufferPosition([line, column], { center: true });
      }
      return editor;
    }
  });

  return function goToLocation(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2017-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the BSD-style license found in the
       * LICENSE file in the root directory of this source tree. An additional grant
       * of patent rights can be found in the PATENTS file in the same directory.
       *
       * 
       * @format
       */

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