"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openSourceLocation = openSourceLocation;
exports.getLineForEvent = getLineForEvent;
exports.isLocalScopeName = isLocalScopeName;
exports.expressionAsEvaluationResult = expressionAsEvaluationResult;
exports.expressionAsEvaluationResultStream = expressionAsEvaluationResultStream;
exports.fetchChildrenForLazyComponent = fetchChildrenForLazyComponent;
exports.onUnexpectedError = onUnexpectedError;
exports.capitalize = capitalize;
exports.notifyOpenDebugSession = notifyOpenDebugSession;

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _logger() {
  const data = _interopRequireDefault(require("./logger"));

  _logger = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
function getGutterLineNumber(target) {
  const eventLine = parseInt(target.dataset.line, 10);

  if (eventLine != null && eventLine >= 0 && !isNaN(Number(eventLine))) {
    return eventLine;
  }
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

async function openSourceLocation(path, line) {
  // eslint-disable-next-line nuclide-internal/atom-apis
  const editor = await atom.workspace.open(path, {
    searchAllPanes: true,
    pending: true
  });

  if (editor == null) {
    // Failed to open file. Return an empty text editor.
    // eslint-disable-next-line nuclide-internal/atom-apis
    return atom.workspace.open();
  }

  editor.scrollToBufferPosition([line, 0]);
  editor.setCursorBufferPosition([line, 0]); // Put the focus back in the console prompt.

  atom.commands.dispatch(atom.views.getView(atom.workspace), 'atom-ide-console:focus-console-prompt');
  return editor;
}

function firstNonNull(...args) {
  return (0, _nullthrows().default)(args.find(arg => arg != null));
}

function getLineForEvent(editor, event) {
  const cursorLine = editor.getLastCursor().getBufferRow();
  const target = event ? event.target : null;

  if (target == null) {
    return cursorLine;
  } // toggleLine is the line the user clicked in the gutter next to, as opposed
  // to the line the editor's cursor happens to be in. If this command was invoked
  // from the menu, then the cursor position is the target line.


  return firstNonNull(getGutterLineNumber(target), getEditorLineNumber(editor, target), // fall back to the line the cursor is on.
  cursorLine);
}

function isLocalScopeName(scopeName) {
  return ['Local', 'Locals'].indexOf(scopeName) !== -1;
}

function expressionAsEvaluationResult(expression) {
  const value = expression.getValue();

  if (!expression.available) {
    return {
      type: 'error',
      value
    };
  } else if (!expression.hasChildren()) {
    return {
      type: typeForSimpleValue(value),
      value
    };
  } else {
    return {
      type: 'object',
      description: value,
      // Used a means to get children when requested later.
      // $FlowFixMe: that isn't an object ID,
      objectId: expression
    };
  }
}

function expressionAsEvaluationResultStream(expression, focusedProcess, focusedStackFrame, context) {
  return _RxMin.Observable.fromPromise(expression.evaluate(focusedProcess, focusedStackFrame, context)).map(() => expressionAsEvaluationResult(expression)).startWith(null);
}

function typeForSimpleValue(value) {
  if (value === 'undefined' || value === 'null') {
    return value;
  } else {
    return 'default';
  }
}

function fetchChildrenForLazyComponent(expression) {
  return _RxMin.Observable.fromPromise(expression.getChildren().then(children => children.map(child => ({
    name: child.name,
    value: expressionAsEvaluationResult(child)
  })), error => null));
}

function onUnexpectedError(error) {
  const errorMessage = error.stack || error.message || String(error);

  _logger().default.error('Unexpected error', error);

  atom.notifications.addError('Atom debugger ran into an unexpected error - please file a bug!', {
    detail: errorMessage
  });
}

function capitalize(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function notifyOpenDebugSession() {
  atom.notifications.addInfo("Received a debug request, but there's an open debug session already!", {
    detail: 'Please terminate your existing debug session'
  });
}