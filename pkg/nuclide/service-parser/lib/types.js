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
export type Definitions = Map<string, Definition>;

export type Definition = FunctionDefinition | InterfaceDefinition | AliasDefinition;

// A top level function.
export type FunctionDefinition = {
  kind: 'function';
  name: string;
  type: FunctionType;
};

// An interface class.
export type InterfaceDefinition = {
  kind: 'interface';
  name: string;
  constructorArgs: Array<Type>;
  instanceMethods: Map<string, FunctionType>;
  staticMethods: Map<string, FunctionType>;
};

// A type alias.
export type AliasDefinition = {
  kind: 'alias';
  name: string;
  definition: Type;
};

export type Type = NullableType |
  AnyType | StringType | BooleanType | NumberType | // Primitive types.
  ObjectType | ArrayType | MapType | SetType | TupleType | // Container types.
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
export type AnyType = { kind: 'any' };
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
