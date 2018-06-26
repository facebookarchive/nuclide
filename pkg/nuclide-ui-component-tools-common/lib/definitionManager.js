'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSnippetFromDefinition = getSnippetFromDefinition;
exports.getDocumentationObject = getDocumentationObject;

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');
}

var _lspUtils;

function _load_lspUtils() {
  return _lspUtils = require('../../nuclide-lsp-implementation-common/lsp-utils');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('../../nuclide-vscode-language-service-rpc/lib/protocol');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

function getSnippetFromDefinition(definition) {
  let snippet = definition.name;
  if (definition.requiredProps.length === 0) {
    snippet += ' $1/>';
    return snippet;
  }

  snippet += '\n';
  let i = 1;
  definition.requiredProps.forEach((prop, index) => {
    // This is naive and quadratic time but N is really small.
    if (!definition.defaultProps.includes(prop.name) && prop.name !== 'children') {
      // There's different behavior depending on the type annotation.
      // String props have a nested tabstop that gives the user the opportunity
      // to either delete the quotes in exchange for braces, or to tab into the
      // quotes.
      // Other types of props simply render {$tabstop}.
      const value = prop.typeAnnotation === 'string' || prop.typeAnnotation === 'Fbt' ? `\${${i++}:"$${i++}"}` : `{$${i++}}`;
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

function getComponentNameFromPositionParams(document, positionParams) {
  const rowRange = document.buffer.rangeForRow(positionParams.position.line);
  rowRange.end = (0, (_lspUtils || _load_lspUtils()).lspPositionToAtomPoint)(positionParams.position);

  let word = null;
  document.buffer.backwardsScanInRange(componentNameRegexp, rowRange, arg => {
    word = arg.matchText;
  });
  return word;
}

function getDocumentationObject(definition) {
  if (definition.leadingComment == null || !definition.leadingComment.startsWith('@explorer-desc') || definition.leadingComment.includes('@no-completion-description')) {
    return {};
  }

  if (!(definition.leadingComment != null)) {
    throw new Error('Invariant violation: "definition.leadingComment != null"');
  }

  let candidate = (0, (_utils || _load_utils()).removePrefix)('@explorer-desc', definition.leadingComment).split('\n').find(l => l.length > 0);
  if (candidate == null) {
    return {};
  } else {
    candidate = candidate.trim();
  }
  if (candidate.length < 20) {
    // This is probably too short and not a real component description. Exclude
    // it.
    return {};
  } else if (candidate.length < (_constants || _load_constants()).LEADING_COMMENT_LIMIT) {
    return { documentation: candidate };
  }
  return { documentation: candidate.substr(0, (_constants || _load_constants()).LEADING_COMMENT_LIMIT) + '…' };
}

const matcherOptions = {
  // We want "fds" to match "FDSButton".
  caseSensitive: false,
  // We're dealing with component names which are fairly short.
  maxGap: 20,
  // There can be thousands of component definitions in a large codebase. The
  // results should be limited so that we don't provide thousands of completion
  // suggestions and perform wasted map calls.
  maxResults: 50,
  // Explicit default.
  numThreads: 1,
  // Explicit default.
  recordMatchIndexes: false,
  // Prefer case-sensitive matches if the user signals casing, e.g., "Component"
  // would prefer "ComponentGroup" over "componentWrapper".
  smartCase: true
};

class DefinitionManager {

  constructor() {
    this.definitionForComponentName = new Map();
    this.matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher([]);
  }

  addDefinition(definition) {
    const key = definition.name;
    this.definitionForComponentName.set(key, definition);
    this.matcher.addCandidates([key]);
  }

  getCompletions(document, positionParams) {
    const componentName = getComponentNameFromPositionParams(document, positionParams);
    if (componentName == null) {
      return [];
    }

    return this.matcher.match(componentName.substring(1), matcherOptions).map(({ value }) => this.definitionForComponentName.get(value)).filter(Boolean).map(definition => {
      return Object.assign({
        insertText: getSnippetFromDefinition(definition),
        insertTextFormat: (_protocol || _load_protocol()).InsertTextFormat.Snippet,
        kind: (_protocol || _load_protocol()).CompletionItemKind.Snippet,
        label: definition.name
      }, getDocumentationObject(definition));
    });
  }
}
exports.default = DefinitionManager;