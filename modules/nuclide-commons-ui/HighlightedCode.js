'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.














































highlightCode = highlightCode;exports.









































highlightCodeHtml = highlightCodeHtml;exports.






















HighlightedCode = HighlightedCode;var _classnames;function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _escapeHtml;function _load_escapeHtml() {return _escapeHtml = _interopRequireDefault(require('escape-html'));}var _nullthrows;function _load_nullthrows() {return _nullthrows = _interopRequireDefault(require('nullthrows'));}var _react = _interopRequireWildcard(require('react'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _objectWithoutProperties(obj, keys) {var target = {};for (var i in obj) {if (keys.indexOf(i) >= 0) continue;if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;target[i] = obj[i];}return target;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */const scopeToClassNameCache = new Map();function scopeToClassName(scope) {let className = scopeToClassNameCache.get(scope);if (className == null) {className = 'syntax--' + scope.replace(/\./g, ' syntax--');scopeToClassNameCache.set(scope, className);}return className;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * Re-uses an Atom grammar's tokenization functions to produce syntax-higlighted text
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 * without the overhead of creating a new TextEditor / TextBuffer.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 */function highlightCode(grammar, code) {return grammar.tokenizeLines(code).map(highlightTokens);}function highlightTokens(line) {const resultLine = [];const scopeStack = [];for (const token of line) {const diffIndex = scopeStack.findIndex((stackEntry, i) => token.scopes[i] !== stackEntry);if (diffIndex !== -1) {while (diffIndex < scopeStack.length) {resultLine.push({ type: 'end' });scopeStack.pop();}}while (scopeStack.length < token.scopes.length) {const scope = token.scopes[scopeStack.length];resultLine.push({ type: 'start', className: scopeToClassName(scope) });scopeStack.push(scope);}resultLine.push({ type: 'value', value: token.value });}while (scopeStack.length) {resultLine.push({ type: 'end' });scopeStack.pop();}return resultLine;} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * Converts the grammar/code directly to HTML (using highlightCode above).
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */function highlightCodeHtml(grammar, code) {const tokens = highlightCode(grammar, code);return tokens.map(tokensToHtml).join('\n');}function tokensToHtml(tokens) {let html = '';for (const token of tokens) {switch (token.type) {case 'start':html += `<span class=${JSON.stringify(token.className)}>`;break;case 'end':html += '</span>';break;case 'value':html += (0, (_escapeHtml || _load_escapeHtml()).default)(token.value);break;}}return html;}function HighlightedCode(_ref) {let { grammar, code, className } = _ref,otherProps = _objectWithoutProperties(_ref, ['grammar', 'code', 'className']);const lines = code.split('\n'); // This is really hacky but we need a way to pass the parsed rule stack from one line to the next.
  // We'll give each component a shared array of rule stacks that can be written / read from.
  // React needs to render each line in order to make this work (but this assumption seems safe).
  const ruleStacks = new Array(lines.length);return _react.createElement('pre', Object.assign({ className: (0, (_classnames || _load_classnames()).default)(className,
      'nuclide-highlighted-code',
      'native-key-bindings'),

      tabIndex: -1 },
    otherProps),
    _react.createElement('code', null,
      lines.map((line, i) => {
        return (
          _react.createElement(HighlightedLine, {
            key: i,
            grammar: grammar,
            line: line,
            lineNumber: i,
            ruleStacks: ruleStacks }));


      })));



}

function HighlightedLine({ grammar, line, lineNumber, ruleStacks }) {
  // $FlowIgnore
  const { tokens, ruleStack } = grammar.tokenizeLine(
  line,
  // Throws if the lines haven't been rendered in order.
  lineNumber > 0 ? (0, (_nullthrows || _load_nullthrows()).default)(ruleStacks[lineNumber - 1]) : null,
  /* firstLine */lineNumber === 0);

  ruleStacks[lineNumber] = ruleStack;
  return (
    _react.createElement('span', {
      dangerouslySetInnerHTML: {
        __html: tokensToHtml(highlightTokens(tokens)) + '\n' } }));



}