'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as babel from 'babel-core';
import assert from 'assert';

import type {Definitions, Type, FunctionType} from './types';

/**
 * Parse a definition file, returning an intermediate representation that has all of the
 * information required to generate the remote proxy, as well as marshal and unmarshal the
 * data over a network.
 * @param source - The string source of the definition file.
 */
export default function parseServiceDefinition(source: string): Definitions {
  var defs: Definitions = {functions: new Map(), interfaces: new Map(), aliases: new Map()};
  var program = babel.parse(source);
  assert(program && program.type === 'Program', 'The result of parsing is a Program node.');

  // Iterate through each node in the program body.
  for (var node of program.body) {
    // We're specifically looking for exports.
    if (node.type === 'ExportNamedDeclaration') {
      var declaration = node.declaration;
      switch (declaration.type) {
        // An exported function that can be directly called by a client.
        case 'FunctionDeclaration':
          var {name, type} = parseFunctionDeclaration(declaration);
          defs.functions.set(name, type);
          break;
        // An exported type alias.
        case 'TypeAlias':
          var {name, type} = parseTypeAlias(declaration);
          defs.aliases.set(name, type);
          break;
        // TODO: Parse classes as remotable interfaces.
        case 'ClassDeclaration':
          throw new Error('ClassDeclaration not yet supported.');
        // Unkown export declaration.
        default:
          throw new Error(`Unkown declaration type ${declaration.type} in definition body.`);
      }
    } else {
      throw new Error(`Unkown node type ${node.type} in definition body.`);
    }
  }
  return defs;
}

/**
 * Helper function that parses an exported function declaration, and returns the function name,
 * along with a FunctionType object that encodes the argument and return types of the function.
 */
function parseFunctionDeclaration(declaration: any): {name: string, type: FunctionType} {
  assert(declaration.id && declaration.id.type === 'Identifier',
    'This function declaration has an identifier.');
  assert(declaration.returnType.type === 'TypeAnnotation',
    'The function is annotated with a return type.');

  var returnType = parseTypeAnnotation(declaration.returnType.typeAnnotation);
  assert(returnType.kind === 'void' || returnType.kind === 'promise' || returnType.kind === 'observable',
    'The return type of a function must be of type Void, Promise, or Observable');

  return {
    name: declaration.id.name,
    type: {
      kind: 'function',
      argumentTypes: declaration.params.map(param => {
        if (!param.typeAnnotation) {
          throw new Error(`Parameter ${param.name} doesn't have type annotation.`);
        } else {
          return parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
        }
      }),
      returnType,
    },
  };
}

/**
 * Helper function that parses an exported type alias, and returns the name of the alias,
 * along with the type that it refers to.
 */
function parseTypeAlias(declaration: any): {name: string, type: Type} {
  assert(declaration.right.type === 'ObjectTypeAnnotation',
    'The type alias maps to an object type annotation.');
  return {
    name: declaration.id.name,
    type: parseTypeAnnotation(declaration.right),
  };
}

/**
 * Helper function that parses a Flow type annotation into our intermediate format.
 * @returns {Type} A representation of the type.
 */
function parseTypeAnnotation(typeAnnotation: Object): Type {
  switch (typeAnnotation.type) {
    case 'StringTypeAnnotation':
      return {kind: 'string'};
    case 'NumberTypeAnnotation':
      return {kind: 'number'};
    case 'BooleanTypeAnnotation':
      return {kind: 'boolean'};
    case 'NullableTypeAnnotation':
      return {
        kind: 'nullable',
        type: parseTypeAnnotation(typeAnnotation.typeAnnotation),
      };
    case 'ObjectTypeAnnotation':
      return {
        kind: 'object',
        fields: typeAnnotation.properties.map(prop => {
          assert(prop.type === 'ObjectTypeProperty');
          return {
            name: prop.key.name,
            type: parseTypeAnnotation(prop.value),
            optional: prop.optional,
          };
        }),
      };
    case 'VoidTypeAnnotation':
      return {kind: 'void'};
    case 'GenericTypeAnnotation':
      return parseGenericTypeAnnotation(typeAnnotation);
    default:
      throw new Error(`Unkown type annotation ${typeAnnotation.type}.`);
  }
}

/**
 * Helper function that parses annotations of type 'GenericTypeAnnotation'. Meant to be called
 * from parseTypeAnnotation.
 */
function parseGenericTypeAnnotation(typeAnnotation) {
  assert(typeAnnotation.type === 'GenericTypeAnnotation');
  switch (typeAnnotation.id.name) {
    case 'Array':
    case 'Set':
    case 'Promise':
    case 'Observable':
      assert(typeAnnotation.typeParameters.params.length === 1,
        `${typeAnnotation.id.name} has exactly one type parameter.`);
      return {
        kind: typeAnnotation.id.name.toLowerCase(),
        type: parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
      };
    default:
      return {kind: 'named', name: typeAnnotation.id.name};
  }
}
