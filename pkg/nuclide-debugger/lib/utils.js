/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import nullthrows from 'nullthrows';

function getGutterLineNumber(target: HTMLElement): ?number {
  const eventLine = parseInt(target.dataset.line, 10);
  if (eventLine != null && eventLine >= 0 && !isNaN(Number(eventLine))) {
    return eventLine;
  }
}

export function getBreakpointEventLocation(
  target: HTMLElement,
): ?{path: string, line: number} {
  if (
    target != null &&
    target.dataset != null &&
    target.dataset.path != null &&
    target.dataset.line != null
  ) {
    return {path: target.dataset.path, line: parseInt(target.dataset.line, 10)};
  }
  return null;
}

const SCREEN_ROW_ATTRIBUTE_NAME = 'data-screen-row';

function getEditorLineNumber(
  editor: atom$TextEditor,
  target: HTMLElement,
): ?number {
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
  return nullthrows(args.find(arg => arg != null));
}

export function getLineForEvent(editor: atom$TextEditor, event: any): number {
  const cursorLine = editor.getLastCursor().getBufferRow();
  const target = event ? (event.target: HTMLElement) : null;
  if (target == null) {
    return cursorLine;
  }
  // toggleLine is the line the user clicked in the gutter next to, as opposed
  // to the line the editor's cursor happens to be in. If this command was invoked
  // from the menu, then the cursor position is the target line.
  return firstNonNull(
    getGutterLineNumber(target),
    getEditorLineNumber(editor, target),
    // fall back to the line the cursor is on.
    cursorLine,
  );
}
