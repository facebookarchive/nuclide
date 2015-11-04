'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {locationToString} from './builtin-types';
import invariant from 'assert';

import type {
  Definitions,
  Definition,
  AliasDefinition,
  InterfaceDefinition,
  Type,
  FunctionType,
  NamedType,
} from './types';

/**
 * Throws if a named type referenced in an RPC interface is not defined.
 * The error message thrown is suitable for display to a human.
 */
export function validateDefinitions(definitions: Definitions): void {
  const namedTypes: Map<string, AliasDefinition | InterfaceDefinition> = new Map();
  gatherKnownTypes();
  validate();

  function validate(): void {
    findMissingTypeNames();
    findRecursiveAliases();
    validateReturnTypes();
  }

  function findMissingTypeNames() {
    visitAllTypes(checkTypeForMissingNames);
  }

  function gatherKnownTypes(): void {
    for (const definition of definitions.values()) {
      switch (definition.kind) {
        case 'alias':
        case 'interface':
          namedTypes.set(definition.name, definition);
          break;
      }
    }
  }

  function checkTypeForMissingNames(type: Type): void {
    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
      case 'void':
        break;
      case 'promise':
        checkTypeForMissingNames(type.type);
        break;
      case 'observable':
        checkTypeForMissingNames(type.type);
        break;
      case 'array':
        checkTypeForMissingNames(type.type);
        break;
      case 'set':
        checkTypeForMissingNames(type.type);
        break;
      case 'nullable':
        checkTypeForMissingNames(type.type);
        break;
      case 'map':
        checkTypeForMissingNames(type.keyType);
        checkTypeForMissingNames(type.valueType);
        break;
      case 'object':
        type.fields.map(field => field.type).forEach(checkTypeForMissingNames);
        break;
      case 'tuple':
        type.types.forEach(checkTypeForMissingNames);
        break;
      case 'function':
        type.argumentTypes.forEach(checkTypeForMissingNames);
        checkTypeForMissingNames(type.returnType);
        break;
      case 'named':
        const name = type.name;
        if (!namedTypes.has(name)) {
          throw error(type, `No definition for type ${name}.`);
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function findRecursiveAliases() {
    for (const definition of definitions.values()) {
      switch (definition.kind) {
        case 'alias':
          checkAliasLayout(definition);
          break;
      }
    }
  }

  function checkAliasLayout(alias: AliasDefinition): void {
    if (alias.definition) {
      validateLayoutRec([alias], alias.definition);
    }
  }

  /**
   * Validates that a type does not directly contain any types which are known to
   * directly or indirectly contain it.
   *
   * If recursion is found the chain of types which recursively contain each other is reported.
   */
  function validateLayoutRec(containingDefinitions: Array<AliasDefinition>, type: Type): void {
    function validateTypeRec(typeRec: Type): void {
      validateLayoutRec(containingDefinitions, typeRec);
    }

    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
      case 'void':
        break;
      case 'promise':
      case 'observable':
        validateTypeRec(type.type);
        break;
      case 'nullable':
        // Nullable breaks the layout chain
        break;
      case 'map':
      case 'array':
      case 'set':
        // Containers break the layout chain as they may be empty.
        break;
      case 'object':
        type.fields.
          filter(field => !field.optional).
          map(field => field.type).
          forEach(validateTypeRec);
        break;
      case 'tuple':
        type.types.forEach(validateTypeRec);
        break;
      case 'function':
        break;
      case 'named':
        const name = type.name;
        const definition: AliasDefinition | InterfaceDefinition = namedTypes.get(name);
        if (containingDefinitions.indexOf((definition: any)) !== -1) {
          throw errorDefinitions(
            (containingDefinitions.slice(containingDefinitions.indexOf((definition: any))): any),
            `Type ${name} contains itself.`);
        } else if (definition.kind === 'alias' && definition.definition != null) {
          containingDefinitions.push(definition);
          invariant(definition.definition);
          validateLayoutRec(containingDefinitions, definition.definition);
          containingDefinitions.pop();
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function validateReturnTypes(): void {
    for (const definition of definitions.values()) {
      switch (definition.kind) {
        case 'function':
          validateType(definition.type);
          break;
        case 'alias':
          if (definition.definition != null) {
            validateAliasType(definition.definition);
          }
          break;
        case 'interface':
          // $FlowIssue
          definition.constructorArgs.forEach(validateType);
          // $FlowIssue
          definition.instanceMethods.forEach(validateType);
          // $FlowIssue
          definition.staticMethods.forEach(validateType);
          break;
      }
    }
  }

  // Validates a type which must be a return type.
  function validateReturnType(funcType: FunctionType, type: Type): void {
    function invalidReturnTypeError(): Error {
      return error(funcType,
        `The return type of a remote function must be of type Void, Promise, or Observable`);
    }

    switch (type.kind) {
      case 'void':
        break;
      case 'promise':
      case 'observable':
        if (type.type.kind !== 'void') {
          validateType(type.type);
        }
        break;
      case 'named':
        const resolvedType = resolveNamedType(type);
        if (resolvedType.kind !== 'named') {
          validateReturnType(funcType, resolvedType);

          // HACK ON
          // The marshalling code expects returnType to be one of
          // void/promise/observable, while it could be a named type which resolves to a return
          // type.
          //
          // We mutate the function return type here to keep the marshaller happy.
          //
          // In a perfect world the service parser would return a clone of the rpc definition
          // which had all non-predefined named types resolved to their underlying types.
          funcType.returnType = resolvedType;
          // HACK OFF
        } else {
          throw invalidReturnTypeError();
        }
        break;
      default:
        throw invalidReturnTypeError();
    }
  }

  // Aliases may be return types, or non-return types.
  function validateAliasType(type: Type): void {
    switch (type.kind) {
      case 'void':
        break;
      case 'promise':
      case 'observable':
        if (type.type.kind !== 'void') {
          validateType(type.type);
        }
        break;
      case 'named':
        // No need to recurse, as the target alias definition will get validated seperately.
        break;
      default:
        validateType(type);
        break;
    }
  }

  // Validates a type which is not directly a return type.
  function validateType(type: Type): void {
    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
        break;
      case 'void':
      case 'promise':
      case 'observable':
        throw error(type, 'Promise, void and Observable types may only be used as return types');
      case 'array':
        validateType(type.type);
        break;
      case 'set':
        validateType(type.type);
        break;
      case 'nullable':
        validateType(type.type);
        break;
      case 'map':
        validateType(type.keyType);
        validateType(type.valueType);
        break;
      case 'object':
        type.fields.map(field => field.type).forEach(validateType);
        break;
      case 'tuple':
        type.types.forEach(validateType);
        break;
      case 'function':
        type.argumentTypes.forEach(validateType);
        validateReturnType(type, type.returnType);
        break;
      case 'named':
        const resolvedType = resolveNamedType(type);
        // Note: We do not recurse here as types may be self-recursive (through nullable for
        // example).
        // The resolvedType will already have been checked to be a valid alias type.
        // so we only need to check the difference between alias types and non-return types.
        switch (resolvedType.kind) {
          case 'void':
          case 'promise':
          case 'observable':
            throw error(type,
              'Promise, void and Observable types may only be used as return types');
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  // Returns the definition of a named type. If the type resolves to an alias it returns the
  // alias's definition.
  // Will return a named type if and only if the alias resolves to a builtin type, or an interface.
  function resolveNamedType(namedType: NamedType): Type {
    const def = namedTypes.get(namedType.name);
    switch (def.kind) {
      case 'alias':
        const type = def.definition;
        if (type) {
          if (type.kind === 'named') {
            return resolveNamedType(type);
          }
          return type;
        }
        return namedType;
      case 'interface':
        return namedType;
      default:
        throw new Error('Unexpected definition kind');
    }
  }

  function visitAllTypes(operation: (type: Type) => void): void {
    for (const definition of definitions.values()) {
      switch (definition.kind) {
        case 'function':
          operation(definition.type);
          break;
        case 'alias':
          if (definition.definition != null) {
            operation(definition.definition);
          }
          break;
        case 'interface':
          // $FlowIssue
          definition.constructorArgs.forEach(operation);
          // $FlowIssue
          definition.instanceMethods.forEach(operation);
          // $FlowIssue
          definition.staticMethods.forEach(operation);
          break;
      }
    }
  }

  function error(type: Type, message: string) {
    return new Error(`${locationToString(type.location)}: ${message}`);
  }

  function errorDefinitions(defs: Array<Definition>, message: string): Error {
    let fullMessage = `${locationToString(defs[0].location)}:${message}`;
    fullMessage = fullMessage.concat(
      ... (defs.slice(1).map(definition =>
        `\n${locationToString(definition.location)}: Related definition ${definition.name}`)));
    return new Error(fullMessage);
  }
}
