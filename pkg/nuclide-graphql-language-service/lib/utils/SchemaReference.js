'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFieldReference = getFieldReference;
exports.getDirectiveReference = getDirectiveReference;
exports.getArgumentReference = getArgumentReference;
exports.getEnumValueReference = getEnumValueReference;
exports.getTypeReference = getTypeReference;

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

function getFieldReference(typeInfo) {
  return {
    kind: 'Field',
    schema: typeInfo.schema,
    field: typeInfo.fieldDef,
    type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType
  };
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function getDirectiveReference(typeInfo) {
  return {
    kind: 'Directive',
    schema: typeInfo.schema,
    directive: typeInfo.directiveDef
  };
}

function getArgumentReference(typeInfo) {
  return typeInfo.directiveDef ? {
    kind: 'Argument',
    schema: typeInfo.schema,
    argument: typeInfo.argDef,
    directive: typeInfo.directiveDef
  } : {
    kind: 'Argument',
    schema: typeInfo.schema,
    argument: typeInfo.argDef,
    field: typeInfo.fieldDef,
    type: isMetaField(typeInfo.fieldDef) ? null : typeInfo.parentType
  };
}

function getEnumValueReference(typeInfo) {
  return {
    kind: 'EnumValue',
    value: typeInfo.enumValue,
    type: (0, (_graphql || _load_graphql()).getNamedType)(typeInfo.inputType)
  };
}

// Note: for reusability, getTypeReference can produce a reference to any type,
// though it defaults to the current type.
function getTypeReference(typeInfo, type) {
  return {
    kind: 'Type',
    schema: typeInfo.schema,
    type: type || typeInfo.type
  };
}

function isMetaField(fieldDef) {
  return fieldDef.name.slice(0, 2) === '__';
}