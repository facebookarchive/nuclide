"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.goToLocation = goToLocation;
exports.goToLocationInEditor = goToLocationInEditor;
exports.observeNavigatingEditors = observeNavigatingEditors;

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

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
async function goToLocation(file, options) {
  var _ref, _ref2, _ref3;

  const center = (_ref = options === null || options === void 0 ? void 0 : options.center) !== null && _ref !== void 0 ? _ref : true;
  const moveCursor = (_ref2 = options === null || options === void 0 ? void 0 : options.moveCursor) !== null && _ref2 !== void 0 ? _ref2 : true;
  const activatePane = (_ref3 = options === null || options === void 0 ? void 0 : options.activatePane) !== null && _ref3 !== void 0 ? _ref3 : true;
  const activateItem = options === null || options === void 0 ? void 0 : options.activateItem;
  const line = options === null || options === void 0 ? void 0 : options.line;
  const column = options === null || options === void 0 ? void 0 : options.column;
  const pending = options === null || options === void 0 ? void 0 : options.pending; // Prefer going to the current editor rather than the leftmost editor.

  const currentEditor = atom.workspace.getActiveTextEditor();

  if (currentEditor != null && currentEditor.getPath() === file) {
    const paneContainer = atom.workspace.paneContainerForItem(currentEditor);

    if (!(paneContainer != null)) {
      throw new Error("Invariant violation: \"paneContainer != null\"");
    }

    if (activatePane) {
      paneContainer.activate();
    }

    if (line != null) {
      goToLocationInEditor(currentEditor, {
        line,
        column: column == null ? 0 : column,
        center,
        moveCursor
      });
    } else {
      if (!(column == null)) {
        throw new Error('goToLocation: Cannot specify just column');
      }
    }

    return currentEditor;
  } else {
    // Obviously, calling goToLocation isn't a viable alternative here :P
    // eslint-disable-next-line nuclide-internal/atom-apis
    const editor = await atom.workspace.open(file, {
      initialLine: line,
      initialColumn: column,
      searchAllPanes: true,
      activatePane,
      activateItem,
      pending
    }); // TODO(T28305560) Investigate offenders for this error

    if (editor == null) {
      const tmp = {};
      Error.captureStackTrace(tmp);
      const error = Error(`atom.workspace.open returned null on ${file}`);
      (0, _log4js().getLogger)('goToLocation').error(error);
      throw error;
    }

    if (center && line != null) {
      editor.scrollToBufferPosition([line, column], {
        center: true
      });
    }

    return editor;
  }
}

const goToLocationSubject = new _rxjsCompatUmdMin.Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
function goToLocationInEditor(editor, options) {
  const center = options.center == null ? true : options.center;
  const moveCursor = options.moveCursor == null ? true : options.moveCursor;
  const {
    line,
    column
  } = options;

  if (moveCursor) {
    editor.setCursorBufferPosition([line, column]);
  }

  if (center) {
    editor.scrollToBufferPosition([line, column], {
      center: true
    });
  }

  goToLocationSubject.next(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}