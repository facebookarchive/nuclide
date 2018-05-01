'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.openSourceLocation = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let openSourceLocation = exports.openSourceLocation = (() => {var _ref = (0, _asyncToGenerator.default)(




















































  function* (
  path,
  line)
  {
    // eslint-disable-next-line rulesdir/atom-apis
    const editor = yield atom.workspace.open(path, {
      searchAllPanes: true,
      pending: true });

    editor.scrollToBufferPosition([line, 0]);
    editor.setCursorBufferPosition([line, 0]);
    return editor;
  });return function openSourceLocation(_x, _x2) {return _ref.apply(this, arguments);};})();exports.





getLineForEvent = getLineForEvent;exports.
















isLocalScopeName = isLocalScopeName;exports.



expressionAsEvaluationResult = expressionAsEvaluationResult;exports.





















expressionAsEvaluationResultStream = expressionAsEvaluationResultStream;exports.




















fetchChildrenForLazyComponent = fetchChildrenForLazyComponent;exports.














onUnexpectedError = onUnexpectedError;exports.










capitalize = capitalize;exports.



notifyOpenDebugSession = notifyOpenDebugSession;var _nullthrows;function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _logger;function _load_logger() {return _logger = _interopRequireDefault(require('./logger'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                               * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                               * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                               * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                               * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                               * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                               *
                                                                                                                                                                                                                                                                                                                                                                                                                               * 
                                                                                                                                                                                                                                                                                                                                                                                                                               * @format
                                                                                                                                                                                                                                                                                                                                                                                                                               */function getGutterLineNumber(target) {const eventLine = parseInt(target.dataset.line, 10);if (eventLine != null && eventLine >= 0 && !isNaN(Number(eventLine))) {return eventLine;}}const SCREEN_ROW_ATTRIBUTE_NAME = 'data-screen-row';function getEditorLineNumber(editor, target) {let node = target;while (node != null) {if (node.hasAttribute(SCREEN_ROW_ATTRIBUTE_NAME)) {const screenRow = Number(node.getAttribute(SCREEN_ROW_ATTRIBUTE_NAME));try {return editor.bufferPositionForScreenPosition([screenRow, 0]).row;} catch (error) {return null;}}node = node.parentElement;}}function firstNonNull(...args) {return (0, (_nullthrows || _load_nullthrows()).default)(args.find(arg => arg != null));}function getLineForEvent(editor, event) {const cursorLine = editor.getLastCursor().getBufferRow();const target = event ? event.target : null;if (target == null) {return cursorLine;} // toggleLine is the line the user clicked in the gutter next to, as opposed
  // to the line the editor's cursor happens to be in. If this command was invoked
  // from the menu, then the cursor position is the target line.
  return firstNonNull(getGutterLineNumber(target), getEditorLineNumber(editor, target), // fall back to the line the cursor is on.
  cursorLine);}function isLocalScopeName(scopeName) {return ['Local', 'Locals'].indexOf(scopeName) !== -1;}function expressionAsEvaluationResult(expression) {const value = expression.getValue();if (!expression.available) {return { type: 'error', value };} else if (!expression.hasChildren()) {return { type: typeForSimpleValue(value), value };} else {return { type: 'object', description: value, // Used a means to get children when requested later.
      // $FlowFixMe: that isn't an object ID,
      objectId: expression };}}function expressionAsEvaluationResultStream(expression, focusedProcess, focusedStackFrame, context) {return _rxjsBundlesRxMinJs.Observable.fromPromise(expression.evaluate(focusedProcess, focusedStackFrame, context)).map(() => expressionAsEvaluationResult(expression)).startWith(null);}function typeForSimpleValue(value) {if (value === 'undefined' || value === 'null') {return value;} else {return 'default';}}function fetchChildrenForLazyComponent(expression) {return _rxjsBundlesRxMinJs.Observable.fromPromise(expression.getChildren().then(children => children.map(child => ({ name: child.name, value: expressionAsEvaluationResult(child) })), error => null));}function onUnexpectedError(error) {const errorMessage = error.stack || error.message || String(error);(_logger || _load_logger()).default.error('Unexpected error', error);atom.notifications.addError('Atom debugger ran into an unexpected error - please file a bug!', { detail: errorMessage });}function capitalize(str) {return str[0].toUpperCase() + str.slice(1);}function notifyOpenDebugSession() {atom.notifications.addInfo("Received a debug request, but there's an open debug session already!", { detail: 'Please terminate your existing debug session' });}