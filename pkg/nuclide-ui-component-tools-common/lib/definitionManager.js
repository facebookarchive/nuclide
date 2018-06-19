/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type TextDocument from '../../nuclide-lsp-implementation-common/TextDocument';
import type {
  TextDocumentPositionParams,
  CompletionItem,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';
import type {ComponentDefinition} from './types';

import invariant from 'assert';
import {Matcher} from '../../nuclide-fuzzy-native';
import {lspPositionToAtomPoint} from '../../nuclide-lsp-implementation-common/lsp-utils';
import {
  CompletionItemKind,
  InsertTextFormat,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';
import {removePrefix} from './utils';
import {LEADING_COMMENT_LIMIT} from './constants';

export function getSnippetFromDefinition(
  definition: ComponentDefinition,
): string {
  let snippet = definition.name;
  if (definition.requiredProps.length === 0) {
    snippet += ' $1/>';
    return snippet;
  }

  snippet += '\n';
  let i = 1;
  definition.requiredProps.forEach((prop, index) => {
    // This is naive and quadratic time but N is really small.
    if (
      !definition.defaultProps.includes(prop.name) &&
      prop.name !== 'children'
    ) {
      // There's different behavior depending on the type annotation.
      // String props have a nested tabstop that gives the user the opportunity
      // to either delete the quotes in exchange for braces, or to tab into the
      // quotes.
      // Other types of props simply render {$tabstop}.
      const value =
        prop.typeAnnotation === 'string' || prop.typeAnnotation === 'Fbt'
          ? `\${${i++}:"$${i++}"}`
          : `{$${i++}}`;
      snippet += `  ${prop.name}=${value}\n`;
    }
  });

  // If the component requires children then place a tabstop in between an
  // opening and closing tag.
  if (definition.requiredProps.find(p => p.name === 'children')) {
    return snippet + `>\n  $${i++}\n</${definition.name}>`;
  }

  return snippet + `$${i}/>`;
}

// Force an opening JSX tag character so that we don't autocomplete in something
// like a createElement call with a JSX snippet. Note: this is not the most
// robust regex to match React identifiers and some false negatives are
// possible.
const componentNameRegexp = new RegExp('<[a-zA-Z_]+');

function getComponentNameFromPositionParams(
  document: TextDocument,
  positionParams: TextDocumentPositionParams,
): ?string {
  const rowRange = document.buffer.rangeForRow(positionParams.position.line);
  rowRange.end = lspPositionToAtomPoint(positionParams.position);

  let word = null;
  document.buffer.backwardsScanInRange(componentNameRegexp, rowRange, arg => {
    word = arg.matchText;
  });
  return word;
}

export function getDocumentationObject(
  definition: ComponentDefinition,
): {documentation?: string} {
  if (
    definition.leadingComment == null ||
    !definition.leadingComment.startsWith('@explorer-desc') ||
    definition.leadingComment.includes('@no-completion-description')
  ) {
    return {};
  }

  invariant(definition.leadingComment != null);
  let candidate = removePrefix('@explorer-desc', definition.leadingComment)
    .split('\n')
    .find(l => l.length > 0);
  if (candidate == null) {
    return {};
  } else {
    candidate = candidate.trim();
  }
  if (candidate.length < 20) {
    // This is probably too short and not a real component description. Exclude
    // it.
    return {};
  } else if (candidate.length < LEADING_COMMENT_LIMIT) {
    return {documentation: candidate};
  }
  return {documentation: candidate.substr(0, LEADING_COMMENT_LIMIT) + '…'};
}

export default class DefinitionManager {
  definitionForComponentName: Map<string, ComponentDefinition>;
  matcher: Matcher;

  constructor() {
    this.definitionForComponentName = new Map();
    this.matcher = new Matcher([]);
  }

  addDefinition(definition: ComponentDefinition) {
    const key = definition.name;
    this.definitionForComponentName.set(key, definition);
    this.matcher.addCandidates([key]);
  }

  getCompletions(
    document: TextDocument,
    positionParams: TextDocumentPositionParams,
  ): Array<CompletionItem> {
    const componentName = getComponentNameFromPositionParams(
      document,
      positionParams,
    );
    if (componentName == null) {
      return [];
    }

    return this.matcher
      .match(componentName.substring(1))
      .map(({value}) => this.definitionForComponentName.get(value))
      .filter(Boolean)
      .map(definition => {
        return {
          insertText: getSnippetFromDefinition(definition),
          insertTextFormat: InsertTextFormat.Snippet,
          kind: CompletionItemKind.Snippet,
          label: definition.name,
          ...getDocumentationObject(definition),
        };
      });
  }
}
