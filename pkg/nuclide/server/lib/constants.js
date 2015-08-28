'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export var MESSAGE_TYPE = {
  FUNCTION_CALL: 'FunctionCall',
  METHOD_CALL: 'MethodCall',
  NEW_OBJECT: 'NewObject',
};

export var RETURN_TYPE = {
  PROMISE: 'promise',
  VOID: 'void',
  OBSERVABLE: 'observable',
};
