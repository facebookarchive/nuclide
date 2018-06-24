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

import type {OutlineTree} from 'atom-ide-ui';
import type {OutlineTreeKind} from 'atom-ide-ui/pkg/atom-ide-outline-view/lib/types';
import type {TokenizedText} from 'nuclide-commons/tokenized-text';
import type {SymbolInformation} from '../../nuclide-vscode-language-service-rpc/lib/protocol';

import {SymbolKind} from '../../nuclide-vscode-language-service-rpc/lib/protocol';
import {Point} from 'simple-text-buffer';

type SimplifiedNode = {
  tokenizedText?: TokenizedText,
  children: Array<SimplifiedNode>,
  kind?: OutlineTreeKind,
};

function createFunctionSymbol(
  name: string,
  containerName: string,
  fromLine: number,
  toLine: number,
  fromChar: number,
  toChar: number,
): SymbolInformation {
  return {
    name,
    kind: SymbolKind.Function,
    location: {
      uri: '',
      range: {
        start: {line: fromLine, character: fromChar},
        end: {line: toLine, character: toChar},
      },
    },
    containerName,
  };
}

function createClassSymbol(
  name: string,
  containerName: string,
  fromLine: number,
  toLine: number,
  fromChar: number,
  toChar: number,
): SymbolInformation {
  return {
    name,
    kind: SymbolKind.Class,
    location: {
      uri: '',
      range: {
        start: {line: fromLine, character: fromChar},
        end: {line: toLine, character: toChar},
      },
    },
    containerName,
  };
}

function createVariableSymbol(
  name: string,
  containerName: string,
  line: number,
  fromChar: number,
  toChar: number,
): SymbolInformation {
  return {
    name,
    kind: SymbolKind.Variable,
    location: {
      uri: '',
      range: {
        start: {line, character: fromChar},
        end: {line, character: toChar},
      },
    },
    containerName,
  };
}

function createNode(
  name: string,
  kind: OutlineTreeKind,
  line: number,
  fromChar: number,
  toChar: number,
): OutlineTree {
  return {
    plainText: name,
    representativeName: name,
    startPosition: new Point(line, fromChar),
    endPosition: new Point(line, toChar),
    children: [],
    kind,
  };
}

export function simplifyNodeForTesting(node: OutlineTree): SimplifiedNode {
  return {
    children: node.children.map(n => simplifyNodeForTesting(n)),
    tokenizedText: node.tokenizedText,
    kind: node.kind,
  };
}

export function createFunction(
  name: string,
  containerName: string,
  fromLine: number = 0,
  toLine: number = 0,
  fromChar: number = 0,
  toChar: number = 0,
): [SymbolInformation, OutlineTree] {
  return [
    createFunctionSymbol(
      name,
      containerName,
      fromLine,
      toLine,
      fromChar,
      toChar,
    ),
    createNode(name, 'method', fromLine, fromChar, toChar),
  ];
}

export function createVariable(
  name: string,
  containerName: string,
  line: number,
  fromChar: number = 0,
  toChar: number = 0,
): [SymbolInformation, OutlineTree] {
  return [
    createVariableSymbol(name, containerName, line, fromChar, toChar),
    createNode(name, 'variable', line, fromChar, toChar),
  ];
}

export function createClass(
  name: string,
  containerName: string,
  fromLine: number = 0,
  toLine: number = 0,
  fromChar: number = 0,
  toChar: number = 0,
): [SymbolInformation, OutlineTree] {
  return [
    createClassSymbol(name, containerName, fromLine, toLine, fromChar, toChar),
    createNode(name, 'class', fromLine, fromChar, toChar),
  ];
}
