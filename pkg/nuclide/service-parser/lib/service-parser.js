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

import type {Definitions, Type, FunctionType, InterfaceDefinition} from './types';

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
          var {name, interfaceDefinition} = parseClassDeclaration(declaration);
          defs.interfaces.set(name, interfaceDefinition);
          break;
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
  assert(declaration.type === 'TypeAlias', 'parseTypeAlias accepts a TypeAlias node.');
  return {
    name: declaration.id.name,
    type: parseTypeAnnotation(declaration.right),
  };
}

/**
 * Parse a ClassDeclaration AST Node.
 * @param declaration - The AST node.
 * @returns A record containing the name of the class, along with an InterfaceDefinition
 *   object that describes it's method.
 */
function parseClassDeclaration(declaration: Object): {name: string,
  interfaceDefinition: InterfaceDefinition} {
    var def: InterfaceDefinition = {
      constructorArgs: [],
      staticMethods: new Map(),
      instanceMethods: new Map(),
    };

    var classBody = declaration.body;
    for (var method of classBody.body) {
      if (method.kind === 'constructor') {
        def.constructorArgs = method.value.params.map(param => {
          if (!param.typeAnnotation) {
            throw new Error(`Parameter ${param.name} doesn't have type annotation.`);
          } else {
            return parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
          }
        });
      } else {
        var {name, type} = parseMethodDefinition(method);
        if (method.static) {
          def.staticMethods.set(name, type);
        } else {
          def.instanceMethods.set(name, type);
        }
      }
    }
    return {
      name: declaration.id.name,
      interfaceDefinition: def,
    };
}

/**
 * Helper function that parses an method definition in a class.
 * @param defintion - The MethodDefinition AST node.
 * @returns A record containing the name of the method, and a FunctionType object
 *   encoding the arguments and return type of the method.
 */
function parseMethodDefinition(definition: any): {name: string, type: FunctionType} {
  assert(definition.type === 'MethodDefinition', 'This is a MethodDefinition object.');
  assert(definition.key && definition.key.type === 'Identifier',
    'This method defintion has an key (a name).');
  assert(definition.value.returnType.type === 'TypeAnnotation',
    `${definition.key.name} missing a return type annotation.`);

  var returnType = parseTypeAnnotation(definition.value.returnType.typeAnnotation);
  assert(returnType.kind === 'void' || returnType.kind === 'promise' || returnType.kind === 'observable',
    'The return type of a function must be of type Void, Promise, or Observable');

  return {
    name: definition.key.name,
    type: {
      kind: 'function',
      argumentTypes: definition.value.params.map(param => {
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
 * Helper function that parses a Flow type annotation into our intermediate format.
 * @returns {Type} A representation of the type.
 */
function parseTypeAnnotation(typeAnnotation: Object): Type {
  switch (typeAnnotation.type) {
  case 'AnyTypeAnnotation':
    return {kind: 'any'};
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
  case 'TupleTypeAnnotation':
    return {kind: 'tuple', types: typeAnnotation.types.map(parseTypeAnnotation)};
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
    case 'Map':
      assert(typeAnnotation.typeParameters.params.length === 2,
        `${typeAnnotation.id.name} takes exactly two type parameters.`);
      return {
        kind: 'map',
        keyType: parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
        valueType: parseTypeAnnotation(typeAnnotation.typeParameters.params[1]),
      };
    default:
      return {kind: 'named', name: typeAnnotation.id.name};
  }
}
