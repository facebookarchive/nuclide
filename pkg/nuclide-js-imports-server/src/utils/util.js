"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.babelLocationToAtomRange = babelLocationToAtomRange;
exports.importPathToPriority = importPathToPriority;
exports.compareForInsertion = compareForInsertion;
exports.compareForSuggestion = compareForSuggestion;
exports.getRequiredModule = getRequiredModule;

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
 * 
 * @format
 */
function babelLocationToAtomRange(location) {
  return new (_simpleTextBuffer().Range)(new (_simpleTextBuffer().Point)(location.start.line - 1, location.start.col), new (_simpleTextBuffer().Point)(location.end.line - 1, location.end.col));
}
/**
 * Sort in decreasing order of 'globality':
 * - Modules
 * - Relative paths in other directories (../*)
 * - Local paths (./*)
 */


const MODULES_PRIORITY = -1;
const RELATIVE_PRIORITY = 0;
const LOCAL_PRIORITY = 1;

function importPathToPriority(path) {
  if (path.startsWith('..')) {
    return RELATIVE_PRIORITY;
  }

  if (path.startsWith('.')) {
    return LOCAL_PRIORITY;
  }

  return MODULES_PRIORITY;
}

function isLowerCase(s) {
  return s.toLowerCase() === s;
}

function compareForInsertion(path1, path2) {
  const p1 = importPathToPriority(path1);
  const p2 = importPathToPriority(path2);

  if (p1 !== p2) {
    // Typically the highest-priority imports are at the end.
    return p1 - p2;
  }

  if (p1 === MODULES_PRIORITY) {
    // Order uppercase modules before lowercased modules.
    // (Mostly a Facebook-friendly convention).
    const lc1 = isLowerCase(path1[0]);
    const lc2 = isLowerCase(path2[0]);

    if (lc1 !== lc2) {
      return Number(lc1) - Number(lc2);
    }
  }

  return path1.localeCompare(path2);
}

function compareForSuggestion(path1, path2) {
  const p1 = importPathToPriority(path1);
  const p2 = importPathToPriority(path2);

  if (p1 !== p2) {
    // Provide highest-priority matches first.
    return p2 - p1;
  } // Prefer shorter paths.


  if (path1.length !== path2.length) {
    return path1.length - path2.length;
  }

  return path1.localeCompare(path2);
} // Check if an AST node is a require call, and returns the literal value.


function getRequiredModule(node) {
  if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require' && node.arguments[0] && node.arguments[0].type === 'StringLiteral') {
    return node.arguments[0].value;
  }
}