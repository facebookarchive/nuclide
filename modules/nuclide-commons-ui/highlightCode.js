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

import * as React from 'react';

export type HighlightedToken =
  | {|
      type: 'start',
      className: string,
    |}
  | {|
      type: 'end',
    |}
  | {|
      type: 'value',
      value: string,
    |};

export type HighlightedTokens = Array<Array<HighlightedToken>>;

const scopeToClassNameCache = new Map();

function scopeToClassName(scope: string): string {
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
export function highlightCode(
  grammar: atom$Grammar,
  code: string,
): HighlightedTokens {
  const scopeStack = [];
  return grammar.tokenizeLines(code).map(line => {
    const resultLine = [];
    for (const token of line) {
      const diffIndex = scopeStack.findIndex(
        (stackEntry, i) => token.scopes[i] !== stackEntry,
      );
      if (diffIndex !== -1) {
        while (diffIndex < scopeStack.length) {
          resultLine.push({type: 'end'});
          scopeStack.pop();
        }
      }
      while (scopeStack.length < token.scopes.length) {
        const scope = token.scopes[scopeStack.length];
        resultLine.push({
          type: 'start',
          className: scopeToClassName(scope),
        });
        scopeStack.push(scope);
      }
      resultLine.push({type: 'value', value: token.value});
    }
    while (scopeStack.length) {
      resultLine.push({type: 'end'});
      scopeStack.pop();
    }
    return resultLine;
  });
}

/**
 * Converts the grammar/code directly to HTML (using highlightCode above).
 */
export function highlightCodeHTML(grammar: atom$Grammar, code: string): string {
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

export function HighlightCode({
  grammar,
  code,
}: {
  grammar: atom$Grammar,
  code: string,
}): React.Node {
  return (
    <pre>
      <code
        dangerouslySetInnerHTML={{__html: highlightCodeHTML(grammar, code)}}
      />
    </pre>
  );
}
