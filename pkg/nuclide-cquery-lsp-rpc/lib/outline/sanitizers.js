'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeSymbol = sanitizeSymbol;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict
 * @format
 */

const NON_CLASS_OPERATOR_PREFIX = 'operator (';
const CLASS_OPERATOR = 'operator()';

function sanitizeSymbol(_name) {
  if (_name == null) {
    return '';
  }
  let name = _name;
  for (const func of [sanitizeOperator, sanitizeObjcSymbol, removeObjcFunctionArguments, sanitizeAnonymousKeywords]) {
    name = func(name);
  }
  return name;
}

/**
 * Heuristic: (anon) and (anonymous namespace) have (), so it's better to get
 * rid of the parenthesis.
 */
function sanitizeAnonymousKeywords(name) {
  return name.replace(/\(anon\)/g, 'namespace').replace(/\(anonymous namespace\)/g, 'anonymous_namespace');
}

function removeObjcFunctionArguments(name) {
  const lastColon = name.lastIndexOf(':');
  if (lastColon === -1 || isNamespaceColon(name, lastColon)) {
    return name;
  }
  return removeObjcFunctionArguments(name.substr(0, lastColon));
}

function sanitizeObjcSymbol(name) {
  return name.replace(
  // handles cases like this:
  //   Ret * _Nonnull (NSUInteger) funct --> Ret *funct(NSUInteger)
  /(.*) _Nonnull \((.*)\) (.*)/, (match, p1, p2, p3) => `${p1} ${p3}(${p2})`).replace(/ (__strong|_Nonnull)/g, '');
}

function sanitizeOperator(name) {
  if (name.startsWith(NON_CLASS_OPERATOR_PREFIX)) {
    return name.substr(NON_CLASS_OPERATOR_PREFIX.length);
  } else if (name === CLASS_OPERATOR) {
    return 'operator';
  }
  return name;
}

function isNamespaceColon(text, idx) {
  return idx > 0 && text[idx - 1] === ':';
}