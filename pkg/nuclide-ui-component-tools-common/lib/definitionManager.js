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

import {Matcher} from '../../nuclide-fuzzy-native';
import {lspPositionToAtomPoint} from '../../nuclide-lsp-implementation-common/lsp-utils';
import {
  CompletionItemKind,
  InsertTextFormat,
} from '../../nuclide-vscode-language-service-rpc/lib/protocol';

function getSnippetFromDefinition(definition: ComponentDefinition): string {
  // TODO: T29616247 Children as a required prop should have different behavior.
  let snippet = definition.name;
  if (definition.requiredProps.length === 0) {
    snippet += ' $1/>';
    return snippet;
  }

  snippet += '\n';
  definition.requiredProps.forEach((prop, index) => {
    // This is naive and quadratic time but N is really small.
    if (!definition.defaultProps.includes(prop.name)) {
      snippet += `  ${prop.name}={$${index + 1}}\n`;
    }
  });

  return snippet + '/>';
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
        };
      });
  }
}
