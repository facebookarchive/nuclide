/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  IExpression,
  IEvaluatableExpression,
  IProcess,
  IStackFrame,
  ContextType,
} from './types';
import type {EvaluationResult} from 'nuclide-commons-ui/TextRenderer';
import type {ExpansionResult} from 'nuclide-commons-ui/LazyNestedValueComponent';

import nullthrows from 'nullthrows';
import {Observable} from 'rxjs';
import logger from './logger';

function getGutterLineNumber(target: HTMLElement): ?number {
  const eventLine = parseInt(target.dataset.line, 10);
  if (eventLine != null && eventLine >= 0 && !isNaN(Number(eventLine))) {
    return eventLine;
  }
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

export async function openSourceLocation(
  path: string,
  line: number,
): Promise<atom$TextEditor> {
  // eslint-disable-next-line nuclide-internal/atom-apis
  const editor = await atom.workspace.open(path, {
    searchAllPanes: true,
    pending: true,
  });
  if (editor == null) {
    // Failed to open file. Return an empty text editor.
    // eslint-disable-next-line nuclide-internal/atom-apis
    return atom.workspace.open();
  }
  editor.scrollToBufferPosition([line, 0]);
  editor.setCursorBufferPosition([line, 0]);

  // Put the focus back in the console prompt.
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'atom-ide-console:focus-console-prompt',
  );

  return editor;
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

export function isLocalScopeName(scopeName: string): boolean {
  return ['Local', 'Locals'].indexOf(scopeName) !== -1;
}

export function expressionAsEvaluationResult(
  expression: IExpression,
): EvaluationResult {
  const value = expression.getValue();
  if (!expression.available) {
    return {type: 'error', value};
  } else if (!expression.hasChildren()) {
    return {
      type: typeForSimpleValue(value),
      value,
    };
  } else {
    return {
      type: 'object',
      description: value,
      // Used a means to get children when requested later.
      // $FlowFixMe: that isn't an object ID,
      objectId: expression,
    };
  }
}

export function expressionAsEvaluationResultStream(
  expression: IEvaluatableExpression,
  focusedProcess: IProcess,
  focusedStackFrame: ?IStackFrame,
  context: ContextType,
): Observable<?EvaluationResult> {
  return Observable.fromPromise(
    expression.evaluate(focusedProcess, focusedStackFrame, context),
  )
    .map(() => expressionAsEvaluationResult(expression))
    .startWith(null);
}

function typeForSimpleValue(value: string): string {
  if (value === 'undefined' || value === 'null') {
    return value;
  } else {
    return 'default';
  }
}

export function fetchChildrenForLazyComponent(
  expression: IExpression,
): Observable<?ExpansionResult> {
  return Observable.fromPromise(
    expression.getChildren().then(
      children =>
        children.map(child => ({
          name: child.name,
          value: expressionAsEvaluationResult(child),
        })),
      error => null,
    ),
  );
}

export function onUnexpectedError(error: any) {
  const errorMessage = error.stack || error.message || String(error);
  logger.error('Unexpected error', error);
  atom.notifications.addError(
    'Atom debugger ran into an unexpected error - please file a bug!',
    {
      detail: errorMessage,
    },
  );
}

export function capitalize(str: string): string {
  return str[0].toUpperCase() + str.slice(1);
}

export function notifyOpenDebugSession(): void {
  atom.notifications.addInfo(
    "Received a debug request, but there's an open debug session already!",
    {
      detail: 'Please terminate your existing debug session',
    },
  );
}
