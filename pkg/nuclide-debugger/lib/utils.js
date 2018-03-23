'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBreakpointEventLocation = getBreakpointEventLocation;
exports.getLineForEvent = getLineForEvent;
exports.isLocalScopeName = isLocalScopeName;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getGutterLineNumber(target) {
  const eventLine = parseInt(target.dataset.line, 10);
  if (eventLine != null && eventLine >= 0 && !isNaN(Number(eventLine))) {
    return eventLine;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getBreakpointEventLocation(target) {
  if (target != null && target.dataset != null && target.dataset.path != null && target.dataset.line != null) {
    return { path: target.dataset.path, line: parseInt(target.dataset.line, 10) };
  }
  return null;
}

const SCREEN_ROW_ATTRIBUTE_NAME = 'data-screen-row';

function getEditorLineNumber(editor, target) {
  let node = target;
  while (node != null) {
    if (node.hasAttribute(SCREEN_ROW_ATTRIBUTE_NAME)) {
      const screenRow = Number(node.getAttribute(SCREEN_ROW_ATTRIBUTE_NAME));
      try {
        return editor.bufferPositionForScreenPosition([screenRow, 0]).row;
      } catch (error) {
        return null;
      }
    }
    node = node.parentElement;
  }
}

function firstNonNull(...args) {
  return (0, (_nullthrows || _load_nullthrows()).default)(args.find(arg => arg != null));
}

function getLineForEvent(editor, event) {
  const cursorLine = editor.getLastCursor().getBufferRow();
  const target = event ? event.target : null;
  if (target == null) {
    return cursorLine;
  }
  // toggleLine is the line the user clicked in the gutter next to, as opposed
  // to the line the editor's cursor happens to be in. If this command was invoked
  // from the menu, then the cursor position is the target line.
  return firstNonNull(getGutterLineNumber(target), getEditorLineNumber(editor, target),
  // fall back to the line the cursor is on.
  cursorLine);
}

function isLocalScopeName(scopeName) {
  return ['Local', 'Locals'].indexOf(scopeName) !== -1;
}