'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.asClass = asClass;
exports.asFunction = asFunction;
exports.asMember = asMember;
exports.asNonLocalVariable = asNonLocalVariable;

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../../../../modules/nuclide-commons/tokenized-text');
}

var _collection;

function _load_collection() {
  return _collection = require('../../../../../modules/nuclide-commons/collection');
}

var _CqueryOutlineGenericTokenizer;

function _load_CqueryOutlineGenericTokenizer() {
  return _CqueryOutlineGenericTokenizer = require('./CqueryOutlineGenericTokenizer');
}

var _ParenthesisCounter;

function _load_ParenthesisCounter() {
  return _ParenthesisCounter = require('./ParenthesisCounter');
}

var _TokenBuffer;

function _load_TokenBuffer() {
  return _TokenBuffer = require('./TokenBuffer');
}

// Set of classes that can tokenize a (containerName, name) pair as a class,
// function, argument, etc.

function asClass(containerName, name) {
  const tokens = (0, (_CqueryOutlineGenericTokenizer || _load_CqueryOutlineGenericTokenizer()).tokenizeGenericText)(containerName).filter(token => !token.isBreak).map(token => token.text);
  return {
    ancestors: tokens.slice(0, -1),
    tokenizedText: [(0, (_tokenizedText || _load_tokenizedText()).className)((0, (_collection || _load_collection()).lastFromArray)(tokens))]
  };
}

/**
 * This handles both functions and methods.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function asFunction(containerName, name) {
  return tokenizeAroundSymbol(containerName, (idx, tokens) => {
    // if looks like a obj-c method
    if (!containerName.includes('(')) {
      return tokens[idx].text === name;
    }
    return idx + 1 !== tokens.length && tokens[idx].text === name && tokens[idx + 1].text === '(';
  }, (_tokenizedText || _load_tokenizedText()).method);
}

/**
 * E.g. a class or structure non-function member
 */
function asMember(containerName, name) {
  const tokenized = tokenizeAroundSymbol(containerName, (idx, tokens) => tokens[idx].text === name, (_tokenizedText || _load_tokenizedText()).param);
  return tokenized == null || tokenized.ancestors.length === 0 ? null : tokenized;
}

/**
 * I.e. global variables or inside a namespace.
 */
function asNonLocalVariable(containerName, name) {
  return tokenizeAroundSymbol(containerName, (idx, tokens) => !tokens[idx].isBreak && tokens[idx].text === name, (_tokenizedText || _load_tokenizedText()).param);
}

function findSymbolIndex(tokens, symbolChecker) {
  const counter = new (_ParenthesisCounter || _load_ParenthesisCounter()).ParenthesisCounter();
  for (let i = tokens.length - 1; i >= 0; i--) {
    counter.process(tokens[i].text);
    // we don't consider any token that might be inside some kind of
    // parenthesization
    if (!counter.isInsideParenthesis() && symbolChecker(i, tokens)) {
      return i;
    }
  }
  return null;
}

/**
 * Given a symbol name, it creates a named token (e.g. method, class) in the
 * most suitable ocurrence of this symbol name, then it tokenize the rest of
 * the strings as keywords, plains or whitespaces.
 */
function tokenizeAroundSymbol(containerName, symbolChecker, symbolTokenCreator) {
  const tokens = (0, (_CqueryOutlineGenericTokenizer || _load_CqueryOutlineGenericTokenizer()).tokenizeGenericText)(containerName);

  const symbolIndex = findSymbolIndex(tokens, symbolChecker);
  if (symbolIndex == null) {
    return null;
  }

  const { ancestors, rightmostNonAncestor } = findAncestorOfSymbol(tokens, symbolIndex);
  return {
    ancestors: ancestors.reverse(),
    tokenizedText: tokenizeExceptAncestors(tokens, symbolIndex, symbolTokenCreator, rightmostNonAncestor)
  };
}

/**
 * cquery reports ancestors in this format:
 *   some keywords ancestor1::ancestor2::...::ancestorn::symbol some keywords
 * We need the position of the symbol we care because the keywords after or
 * before the symbol may also contain ::
 */
function findAncestorOfSymbol(tokens, symbolIndex) {
  const ancestors = [];
  let rightmostNonAncestor = symbolIndex - 1;
  for (; rightmostNonAncestor >= 0; rightmostNonAncestor--) {
    if (tokens[rightmostNonAncestor].text === ':') {
      continue;
    } else if (tokens[rightmostNonAncestor].isBreak) {
      break;
    }
    ancestors.push(tokens[rightmostNonAncestor].text);
  }
  return { ancestors, rightmostNonAncestor };
}

/**
 * Removes the ancestors of a given symbol and then tokenize the resulting
 * string.
 */

function tokenizeExceptAncestors(tokens, symbolIndex, symbolTokenCreator, rightmostNonAncestor) {
  const tokenizedText = new (_TokenBuffer || _load_TokenBuffer()).TokenBuffer();
  for (let i = 0; i < tokens.length; i++) {
    if (i === symbolIndex) {
      tokenizedText.append(symbolTokenCreator(tokens[i].text));
    } else if (i <= rightmostNonAncestor || i > symbolIndex) {
      // skip anonymous namespace
      if (isAnonymousNamespaceInAncestorsTokens(tokens, i)) {
        i += 2;
      } else if (!tokens[i].isBreak) {
        tokenizedText.appendKeyword(tokens[i].text);
      } else {
        tokenizedText.appendBreak(tokens[i].text);
      }
    }
  }
  return tokenizedText.toArray();
}

/**
 * This special kind of anonymous_namespace is different from (anon). clang
 * uses to refer it to a global symbol
 */
function isAnonymousNamespaceInAncestorsTokens(tokens, idx) {
  return idx + 2 < tokens.length && tokens[idx].text === 'anonymous_namespace' && tokens[idx + 1].text === ':' && tokens[idx + 2].text === ':';
}