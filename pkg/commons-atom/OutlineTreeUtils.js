"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.iconForOutlineKind = iconForOutlineKind;
exports.iconForOutlineTree = iconForOutlineTree;

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
const OUTLINE_KIND_TO_ICON = {
  array: 'type-array',
  boolean: 'type-boolean',
  class: 'type-class',
  constant: 'type-constant',
  constructor: 'type-constructor',
  enum: 'type-enum',
  field: 'type-field',
  file: 'type-file',
  function: 'type-function',
  interface: 'type-interface',
  method: 'type-method',
  module: 'type-module',
  namespace: 'type-namespace',
  number: 'type-number',
  package: 'type-package',
  property: 'type-property',
  string: 'type-string',
  variable: 'type-variable'
};

function iconForOutlineKind(kind) {
  return OUTLINE_KIND_TO_ICON[kind];
}

function iconForOutlineTree(outlineTree) {
  const {
    kind
  } = outlineTree; // $FlowFixMe these come from the RPC and are untyped.

  const icon = outlineTree.icon;
  const iconName = icon != null ? icon : kind && iconForOutlineKind(kind);

  if (iconName == null) {
    return 'code';
  }

  return iconName;
}