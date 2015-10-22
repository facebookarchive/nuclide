'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {locationToString, namedBuiltinTypes} from './builtin-types';

import type {
  Definitions,
  Type,
} from './types';

/**
 * Throws if a named type referenced in an RPC interface is not defined.
 * The error message thrown is suitable for display to a human.
 */
export function validateDefinitions(definitions: Definitions): void {
  const knownNamedTypes = new Set();
  gatherKnownTypes();
  validate();

  function validate(): void {
    for (const definition of definitions.values()) {
      switch (definition.kind) {
        case 'function':
          validateType(definition.type);
          break;
        case 'alias':
          validateType(definition.definition);
          break;
        case 'interface':
          definition.constructorArgs.forEach(validateType);
          definition.instanceMethods.forEach(validateType);
          definition.staticMethods.forEach(validateType);
          break;
      }
    }
  }

  function gatherKnownTypes(): void {
    namedBuiltinTypes.forEach(name => {
      knownNamedTypes.add(name);
    });
    knownNamedTypes.add('NuclideUri');

    for (const definition of definitions.values()) {
      switch (definition.kind) {
        case 'alias':
        case 'interface':
          knownNamedTypes.add(definition.name);
          break;
      }
    }
  }

  function validateType(type: Type): void {
    switch (type.kind) {
      case 'any':
      case 'string':
      case 'boolean':
      case 'number':
      case 'void':
        break;
      case 'promise':
        validateType(type.type);
        break;
      case 'observable':
        validateType(type.type);
        break;
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
        validateType(type.returnType);
        break;
      case 'named':
        const name = type.name;
        if (!knownNamedTypes.has(name)) {
          throw new Error(
            `${locationToString(type.location)}: No definition for type ${name}.`);
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }
}
