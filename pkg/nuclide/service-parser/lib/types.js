'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

declare module 'module' {
  declare function _resolveFilename(filename: string, module: any): string;
}

/**
 * `Definitions` encodes all of the information in a service defintion file that is required to
 * generate a remote proxy.
 */
export type Definitions = {
  // Encodes all of the module level functions in a file.
  functions: Map<string, FunctionType>;
  // Encodes all of the remote classes that can be instantiated.
  interfaces: Map<string, InterfaceDefinition>;
  // Encodes all of the type aliases in this definition file.
  aliases: Map<string, Type>;
};

export type InterfaceDefinition = {
  constructorArgs: Array<Type>;
  instanceMethods: Map<string, FunctionType>;
  staticMethods: Map<string, FunctionType>;
};

export type Type = NullableType |
  StringType | BooleanType | NumberType | // Primitive types.
  ObjectType | ArrayType | MapType | SetType | // Container types.
  VoidType | PromiseType | ObservableType | // Return types.
  NamedType; // Type aliases.

// Nullable type.
export type NullableType = { kind: 'nullable', type: Type };

// Functions.
export type FunctionType = {
  kind: 'function';
  argumentTypes: Array<Type>;
  returnType: VoidType | PromiseType | ObservableType;
}

// Primitive types.
export type StringType = { kind: 'string' };
export type BooleanType = { kind: 'boolean' };
export type NumberType = { kind: 'number' };

// Possible Return formats.
export type VoidType = { kind: 'void' };
export type PromiseType = { kind: 'promise', type: Type };
export type ObservableType = { kind: 'observable', type: Type };

// Container Types.
export type ArrayType = { kind: 'array'; type: Type; };
export type SetType = { kind: 'set'; type: Type; };
export type MapType = { kind: 'map'; keyType: Type; valueType: Type; };
export type ObjectType = { kind: 'object'; fields: Array<ObjectField> };
export type ObjectField = {
  name: string;
  type: Type;
  optional: boolean;
};
export type TupleType = { kind: 'tuple'; types: Array<Type>; };

// Represents a named, custom type.
export type NamedType = { kind: 'named', name: string };
