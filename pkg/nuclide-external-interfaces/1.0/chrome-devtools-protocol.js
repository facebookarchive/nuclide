/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

/* eslint-disable no-unused-vars */

//------------------------------------------------------------------------------
// Runtime domain types.
//------------------------------------------------------------------------------

// description wins over value in display
type Runtime$RemoteObject = {
  className?: string,
  description?: string,
  objectId?: Runtime$RemoteObjectId,
  subtype?: 'array' | 'date' | 'node' | 'null' | 'regexp',
  type: 'boolean' | 'function' | 'number' | 'object' | 'string' | 'undefined',
  value?: mixed,
};

type Runtime$RemoteObjectId = string;

type Runtime$PropertyDescriptor = {
  configurable: boolean,
  enumerable: boolean,
  get?: Runtime$RemoteObject,
  name: string,
  set?: Runtime$RemoteObject,
  value?: Runtime$RemoteObject,
  wasThrown?: boolean,
  writable?: boolean,
};

//------------------------------------------------------------------------------
// Debugger domain types.
//------------------------------------------------------------------------------

// scope.object.description shows on RHS
type Debugger$Scope = {
  object: Runtime$RemoteObject,
  type: Debugger$ScopeType,
};

type Debugger$ScopeType = 'catch' | 'closure' | 'global' | 'local' | 'with';
