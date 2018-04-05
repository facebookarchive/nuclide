'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.highlightCode = highlightCode;
exports.highlightCodeHTML = highlightCodeHTML;
exports.HighlightCode = HighlightCode;

var _react = _interopRequireWildcard(require('react'));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

const scopeToClassNameCache = new Map(); /**
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

function scopeToClassName(scope) {
  let className = scopeToClassNameCache.get(scope);
  if (className == null) {
    className = 'syntax--' + scope.replace(/\./g, ' syntax--');
    scopeToClassNameCache.set(scope, className);
  }
  return className;
}

/**
 * Re-uses an Atom grammar's tokenization functions to produce syntax-higlighted text
 * without the overhead of creating a new TextEditor / TextBuffer.
 */
function highlightCode(grammar, code) {
  const scopeStack = [];
  return grammar.tokenizeLines(code).map(line => {
    const resultLine = [];
    for (const token of line) {
      const diffIndex = scopeStack.findIndex((stackEntry, i) => token.scopes[i] !== stackEntry);
      if (diffIndex !== -1) {
        while (diffIndex < scopeStack.length) {
          resultLine.push({ type: 'end' });
          scopeStack.pop();
        }
      }
      while (scopeStack.length < token.scopes.length) {
        const scope = token.scopes[scopeStack.length];
        resultLine.push({
          type: 'start',
          className: scopeToClassName(scope)
        });
        scopeStack.push(scope);
      }
      resultLine.push({ type: 'value', value: token.value });
    }
    while (scopeStack.length) {
      resultLine.push({ type: 'end' });
      scopeStack.pop();
    }
    return resultLine;
  });
}

/**
 * Converts the grammar/code directly to HTML (using highlightCode above).
 */
function highlightCodeHTML(grammar, code) {
  const tokens = highlightCode(grammar, code);
  let html = '';
  for (const line of tokens) {
    for (const token of line) {
      switch (token.type) {
        case 'start':
          html += `<span class=${JSON.stringify(token.className)}>`;
          break;
        case 'end':
          html += '</span>';
          break;
        case 'value':
          html += token.value;
          break;
      }
    }
    html += '\n';
  }
  return html;
}

function HighlightCode({
  grammar,
  code
}) {
  return _react.createElement(
    'pre',
    null,
    _react.createElement('code', {
      dangerouslySetInnerHTML: { __html: highlightCodeHTML(grammar, code) }
    })
  );
}