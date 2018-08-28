"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.aSingleLineFunctionSignature = aSingleLineFunctionSignature;
exports.aMultiLineFunctionSignature = aMultiLineFunctionSignature;
exports.aPoorlyIndentedFunction = aPoorlyIndentedFunction;

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 */
// license header above without @format
// eslint-disable-next-line
const A_CONSTANT = 42;
const SOME_OTHER_CONSTANT = 24; // eslint-disable-next-line

const A_MULTILINE_CONST = `
  hey look I span
    multiple
      lines
`;

function aSingleLineFunctionSignature() {
  return A_CONSTANT + SOME_OTHER_CONSTANT;
}

function aMultiLineFunctionSignature(aReallyReallyLongArgumentNameThatWouldRequireThisToBreakAcrossMultipleLines) {
  return 97;
}

function aPoorlyIndentedFunction(aReallyReallyLongArgumentNameThatWouldRequireThisToBreakAcrossMultipleLines) {
  return 97;
}

const foo = null;
foo;