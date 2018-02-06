/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {TokenizedText, TextToken} from 'nuclide-commons/tokenized-text';
import type {SimpleToken, TokenizedSymbol} from '../../types';

import {className, method, param} from 'nuclide-commons/tokenized-text';
import {lastFromArray} from 'nuclide-commons/collection';
import {tokenizeGenericText} from './CqueryOutlineGenericTokenizer';
import {ParenthesisCounter} from './ParenthesisCounter';
import {TokenBuffer} from './TokenBuffer';

// Set of classes that can tokenize a (containerName, name) pair as a class,
// function, argument, etc.

export function asClass(containerName: string, name: string): TokenizedSymbol {
  const tokens = tokenizeGenericText(containerName)
    .filter(token => !token.isBreak)
    .map(token => token.text);
  return {
    ancestors: tokens.slice(0, -1),
    tokenizedText: [className(lastFromArray(tokens))],
  };
}

/**
 * This handles both functions and methods.
 */
export function asFunction(
  containerName: string,
  name: string,
): ?TokenizedSymbol {
  return tokenizeAroundSymbol(
    containerName,
    (idx, tokens) => {
      // if looks like a obj-c method
      if (!containerName.includes('(')) {
        return tokens[idx].text === name;
      }
      return (
        idx + 1 !== tokens.length &&
        tokens[idx].text === name &&
        tokens[idx + 1].text === '('
      );
    },
    method,
  );
}

/**
 * E.g. a class or structure non-function member
 */
export function asMember(
  containerName: string,
  name: string,
): ?TokenizedSymbol {
  const tokenized = tokenizeAroundSymbol(
    containerName,
    (idx, tokens) => tokens[idx].text === name,
    param,
  );
  return tokenized == null || tokenized.ancestors.length === 0
    ? null
    : tokenized;
}

/**
 * I.e. global variables or inside a namespace.
 */
export function asNonLocalVariable(
  containerName: string,
  name: string,
): ?TokenizedSymbol {
  return tokenizeAroundSymbol(
    containerName,
    (idx, tokens) => !tokens[idx].isBreak && tokens[idx].text === name,
    param,
  );
}

function findSymbolIndex(
  tokens: SimpleToken[],
  symbolChecker: (idx: number, tokens: SimpleToken[]) => boolean,
): ?number {
  const counter = new ParenthesisCounter();
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
function tokenizeAroundSymbol(
  containerName: string,
  symbolChecker: (idx: number, tokens: SimpleToken[]) => boolean,
  symbolTokenCreator: string => TextToken,
): ?TokenizedSymbol {
  const tokens = tokenizeGenericText(containerName);

  const symbolIndex = findSymbolIndex(tokens, symbolChecker);
  if (symbolIndex == null) {
    return null;
  }

  const {ancestors, rightmostNonAncestor} = findAncestorOfSymbol(
    tokens,
    symbolIndex,
  );
  return {
    ancestors: ancestors.reverse(),
    tokenizedText: tokenizeExceptAncestors(
      tokens,
      symbolIndex,
      symbolTokenCreator,
      rightmostNonAncestor,
    ),
  };
}

/**
 * cquery reports ancestors in this format:
 *   some keywords ancestor1::ancestor2::...::ancestorn::symbol some keywords
 * We need the position of the symbol we care because the keywords after or
 * before the symbol may also contain ::
 */
function findAncestorOfSymbol(
  tokens: SimpleToken[],
  symbolIndex: number,
): {ancestors: string[], rightmostNonAncestor: number} {
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
  return {ancestors, rightmostNonAncestor};
}

/**
 * Removes the ancestors of a given symbol and then tokenize the resulting
 * string.
 */

function tokenizeExceptAncestors(
  tokens: SimpleToken[],
  symbolIndex: number,
  symbolTokenCreator: string => TextToken,
  rightmostNonAncestor: number,
): TokenizedText {
  const tokenizedText = new TokenBuffer();
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
function isAnonymousNamespaceInAncestorsTokens(
  tokens: SimpleToken[],
  idx: number,
): boolean {
  return (
    idx + 2 < tokens.length &&
    tokens[idx].text === 'anonymous_namespace' &&
    tokens[idx + 1].text === ':' &&
    tokens[idx + 2].text === ':'
  );
}
