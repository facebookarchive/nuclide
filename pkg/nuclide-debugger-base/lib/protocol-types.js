/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

//------------------------------------------------------------------------------
// Runtime domain types.
//------------------------------------------------------------------------------

// description wins over value in display
export type RemoteObject = {
  className?: string,
  description?: string,
  objectId?: RemoteObjectId,
  subtype?: 'array' | 'date' | 'node' | 'null' | 'regexp',
  type: 'boolean' | 'function' | 'number' | 'object' | 'string' | 'undefined',
  value?: mixed,
};

export type RemoteObjectId = string;

export type PropertyDescriptor = {
  configurable: boolean,
  enumerable: boolean,
  get?: RemoteObject,
  name: string,
  set?: RemoteObject,
  value?: RemoteObject,
  wasThrown?: boolean,
  writable?: boolean,
};

//------------------------------------------------------------------------------
// Debugger domain types.
//------------------------------------------------------------------------------

// scope.object.description shows on RHS
export type Scope = {
  object: RemoteObject,
  type: ScopeType,
};

export type ScopeType = 'catch' | 'closure' | 'global' | 'local' | 'with';
