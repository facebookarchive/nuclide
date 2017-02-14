'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.opt = opt;
exports.list = list;
exports.butNot = butNot;
exports.t = t;
exports.p = p;


// An optional rule.
function opt(ofRule) {
  return { ofRule };
}

// A list of another rule.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

// These functions help build matching rules for ParseRules.

function list(ofRule, separator) {
  return { ofRule, isList: true, separator };
}

// An constraint described as `but not` in the GraphQL spec.
function butNot(rule, exclusions) {
  const ruleMatch = rule.match;
  rule.match = token => {
    let check = false;
    if (ruleMatch) {
      check = ruleMatch(token);
    }
    return check && exclusions.every(exclusion => exclusion.match && !exclusion.match(token));
  };
  return rule;
}

// Token of a kind
function t(kind, style) {
  return { style, match: token => token.kind === kind };
}

// Punctuator
function p(value, style) {
  return {
    style: style || 'punctuation',
    match: token => token.kind === 'Punctuation' && token.value === value
  };
}