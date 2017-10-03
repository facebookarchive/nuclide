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
 * // eslint-disable-next-line rulesdir/atom-apis
 */
let goToLocation = exports.goToLocation = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (file, options) {
    var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;

    const center_ = (_ref = options) != null ? _ref.center : _ref;
    const center = center_ == null ? true : center_;
    const activatePane_ = (_ref2 = options) != null ? _ref2.activatePane : _ref2;
    const activatePane = activatePane_ == null ? true : activatePane_;
    const activateItem = (_ref3 = options) != null ? _ref3.activateItem : _ref3;
    const line = (_ref4 = options) != null ? _ref4.line : _ref4;
    const column = (_ref5 = options) != null ? _ref5.column : _ref5;
    const pending = (_ref6 = options) != null ? _ref6.pending : _ref6;

    // Prefer going to the current editor rather than the leftmost editor.
    const currentEditor = atom.workspace.getActiveTextEditor();
    if (currentEditor != null && currentEditor.getPath() === file) {
      const paneContainer = atom.workspace.paneContainerForItem(currentEditor);

      if (!(paneContainer != null)) {
        throw new Error('Invariant violation: "paneContainer != null"');
      }

      if (activatePane) {
        paneContainer.activate();
      }
      if (line != null) {
        goToLocationInEditor(currentEditor, {
          line,
          column: column == null ? 0 : column,
          center
        });
      } else {
        if (!(column == null)) {
          throw new Error('goToLocation: Cannot specify just column');
        }
      }
      return currentEditor;
    } else {
      // Obviously, calling goToLocation isn't a viable alternative here :P
      // eslint-disable-next-line rulesdir/atom-apis
      const editor = yield atom.workspace.open(file, {
        initialLine: line,
        initialColumn: column,
        searchAllPanes: true,
        activatePane,
        activateItem,
        pending
      });

      if (center && line != null) {
        editor.scrollToBufferPosition([line, column], { center: true });
      }
      return editor;
    }
  });

  return function goToLocation(_x, _x2) {
    return _ref7.apply(this, arguments);
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

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const goToLocationSubject = new _rxjsBundlesRxMinJs.Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
function goToLocationInEditor(editor, options) {
  const center = options.center == null ? true : options.center;
  const { line, column } = options;

  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }

  goToLocationSubject.next(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}