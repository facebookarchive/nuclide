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

// $FlowIssue
export type Definition = FunctionDefinition | InterfaceDefinition | AliasDefinition;

// A top level function.
export type FunctionDefinition = {
  kind: 'function';
  name: string;
  location: Location;
  type: FunctionType;
};

// An interface class.
export type InterfaceDefinition = {
  kind: 'interface';
  name: string;
  location: Location;
  constructorArgs: Array<Type>;
  instanceMethods: Map<string, FunctionType>;
  staticMethods: Map<string, FunctionType>;
};

// A type alias.
export type AliasDefinition = {
  kind: 'alias';
  name: string;
  location: Location;
  definition: Type;
};

// $FlowIssue
export type Type = NullableType |
  AnyType | StringType | BooleanType | NumberType | // Primitive types.
  ObjectType | ArrayType | MapType | SetType | TupleType | // Container types.
  VoidType | PromiseType | ObservableType | // Return types.
  NamedType; // Type aliases.

// Nullable type.
export type NullableType = { location: Location; kind: 'nullable'; type: Type };

// Functions.
export type FunctionType = {
  location: Location;
  kind: 'function';
  argumentTypes: Array<Type>;
  returnType: VoidType | PromiseType | ObservableType;
}

// Primitive types.
export type AnyType = { location: Location; kind: 'any' };
export type StringType = { location: Location; kind: 'string' };
export type BooleanType = { location: Location; kind: 'boolean' };
export type NumberType = { location: Location; kind: 'number' };

// Possible Return formats.
export type VoidType = { location: Location; kind: 'void' };
export type PromiseType = { location: Location; kind: 'promise'; type: Type };
export type ObservableType = { location: Location; kind: 'observable'; type: Type };

// Container Types.
export type ArrayType = { location: Location; kind: 'array'; type: Type; };
export type SetType = { location: Location; kind: 'set'; type: Type; };
export type MapType = { location: Location; kind: 'map'; keyType: Type; valueType: Type; };
export type ObjectType = { location: Location; kind: 'object'; fields: Array<ObjectField> };
export type ObjectField = {
  location: Location;
  name: string;
  type: Type;
  optional: boolean;
};
export type TupleType = { location: Location; kind: 'tuple'; types: Array<Type>; };

// Represents a named, custom type.
export type NamedType = { location: Location; kind: 'named'; name: string };

export type Location = SourceLocation | BuiltinLocation;

export type SourceLocation = {
  type: 'source';
  fileName: string;
  line: number;
};

export type BuiltinLocation = {
  type: 'builtin';
};

// Babel Definitions
// TODO: Move these to external-interfaces package.

export type Babel$Node = {
  loc: Babel$Range;
};

export type Babel$Range = {
  start: Babel$Location;
  end: Babel$Location;
};

export type Babel$Location = {
  line: number;
};
