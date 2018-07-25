"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.simplifyNodeForTesting = simplifyNodeForTesting;
exports.createFunction = createFunction;
exports.createVariable = createVariable;
exports.createClass = createClass;

function _protocol() {
  const data = require("../../nuclide-vscode-language-service-rpc/lib/protocol");

  _protocol = function () {
    return data;
  };

  return data;
}

function _simpleTextBuffer() {
  const data = require("simple-text-buffer");

  _simpleTextBuffer = function () {
    return data;
  };

  return data;
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
function createFunctionSymbol(name, containerName, fromLine, toLine, fromChar, toChar) {
  return {
    name,
    kind: _protocol().SymbolKind.Function,
    location: {
      uri: '',
      range: {
        start: {
          line: fromLine,
          character: fromChar
        },
        end: {
          line: toLine,
          character: toChar
        }
      }
    },
    containerName
  };
}

function createClassSymbol(name, containerName, fromLine, toLine, fromChar, toChar) {
  return {
    name,
    kind: _protocol().SymbolKind.Class,
    location: {
      uri: '',
      range: {
        start: {
          line: fromLine,
          character: fromChar
        },
        end: {
          line: toLine,
          character: toChar
        }
      }
    },
    containerName
  };
}

function createVariableSymbol(name, containerName, line, fromChar, toChar) {
  return {
    name,
    kind: _protocol().SymbolKind.Variable,
    location: {
      uri: '',
      range: {
        start: {
          line,
          character: fromChar
        },
        end: {
          line,
          character: toChar
        }
      }
    },
    containerName
  };
}

function createNode(name, kind, line, fromChar, toChar) {
  return {
    plainText: name,
    representativeName: name,
    startPosition: new (_simpleTextBuffer().Point)(line, fromChar),
    endPosition: new (_simpleTextBuffer().Point)(line, toChar),
    children: [],
    kind
  };
}

function simplifyNodeForTesting(node) {
  return {
    children: node.children.map(n => simplifyNodeForTesting(n)),
    tokenizedText: node.tokenizedText,
    kind: node.kind
  };
}

function createFunction(name, containerName, fromLine = 0, toLine = 0, fromChar = 0, toChar = 0) {
  return [createFunctionSymbol(name, containerName, fromLine, toLine, fromChar, toChar), createNode(name, 'method', fromLine, fromChar, toChar)];
}

function createVariable(name, containerName, line, fromChar = 0, toChar = 0) {
  return [createVariableSymbol(name, containerName, line, fromChar, toChar), createNode(name, 'variable', line, fromChar, toChar)];
}

function createClass(name, containerName, fromLine = 0, toLine = 0, fromChar = 0, toChar = 0) {
  return [createClassSymbol(name, containerName, fromLine, toLine, fromChar, toChar), createNode(name, 'class', fromLine, fromChar, toChar)];
}