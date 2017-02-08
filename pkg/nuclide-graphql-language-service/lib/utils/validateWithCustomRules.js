'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateWithCustomRules = validateWithCustomRules;

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _validate;

function _load_validate() {
  return _validate = require('graphql/validation/validate');
}

/**
 * Validate a GraphQL Document optionally with custom validation rules.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function validateWithCustomRules(schema, ast, customRules) {
  // Because every fragment is considered for determing model subsets that may
  // be used anywhere in the codebase they're all technically "used" by clients
  // of graphql-data. So we remove this rule from the validators.
  const { NoUnusedFragments } = require('graphql/validation/rules/NoUnusedFragments');
  const rules = (_graphql || _load_graphql()).specifiedRules.filter(rule => rule !== NoUnusedFragments);

  const typeInfo = new (_graphql || _load_graphql()).TypeInfo(schema);
  if (customRules) {
    Array.prototype.push.apply(rules, customRules);
  }

  const errors = (0, (_validate || _load_validate()).visitUsingRules)(schema, typeInfo, ast, rules);

  if (errors.length > 0) {
    return errors;
  }

  return [];
}