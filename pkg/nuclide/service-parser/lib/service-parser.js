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
import invariant from 'assert';

import type {
  Definitions,
  FunctionType,
  InterfaceDefinition,
  Type,
} from './types';


/**
 * Parse a definition file, returning an intermediate representation that has all of the
 * information required to generate the remote proxy, as well as marshal and unmarshal the
 * data over a network.
 * @param source - The string source of the definition file.
 */
export default function parseServiceDefinition(fileName: string, source: string): Definitions {
  return new ServiceParser(fileName).parseService(source);
}

class ServiceParser {
  _fileName: string;

  constructor(fileName: string) {
    this._fileName = fileName;
  }

  _nodeLocation(node): string {
    return `${this._fileName}(${node.loc.start.line})`;
  }

  _error(node, message): Error {
    return new Error(`${this._nodeLocation(node)}:${message}`);
  }

  _assert(node, condition, message): void {
    if (!condition) {
      throw this._error(node, message);
    }
  }

  parseService(source: string): Definitions {
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
            var {name, type} = this._parseFunctionDeclaration(declaration);
            defs.functions.set(name, type);
            break;
          // An exported type alias.
          case 'TypeAlias':
            var {name, type} = this._parseTypeAlias(declaration);
            defs.aliases.set(name, type);
            break;
          // TODO: Parse classes as remotable interfaces.
          case 'ClassDeclaration':
            var {name, interfaceDefinition} = this._parseClassDeclaration(declaration);
            defs.interfaces.set(name, interfaceDefinition);
            break;
          // Unkown export declaration.
          default:
            throw this._error(
              declaration,
              `Unknown declaration type ${declaration.type} in definition body.`);
        }
      } else {
        throw this._error(node, `Unknown node type ${node.type} in definition body.`);
      }
    }
    return defs;
  }

  /**
   * Helper function that parses an exported function declaration, and returns the function name,
   * along with a FunctionType object that encodes the argument and return types of the function.
   */
  _parseFunctionDeclaration(declaration: any): {name: string, type: FunctionType} {
    this._assert(
      declaration,
      declaration.id && declaration.id.type === 'Identifier',
      'This function declaration has an identifier.');
    this._assert(
      declaration,
      declaration.returnType.type === 'TypeAnnotation',
      'The function is annotated with a return type.');

    var returnType = this._parseTypeAnnotation(declaration.returnType.typeAnnotation);
    this._assert(declaration.returnType.typeAnnotation,
      returnType.kind === 'void' || returnType.kind === 'promise' ||
          returnType.kind === 'observable',
      'The return type of a function must be of type Void, Promise, or Observable');

    invariant(returnType.kind === 'void' ||
      returnType.kind === 'promise' ||
      returnType.kind === 'observable');
    return {
      name: declaration.id.name,
      type: {
        kind: 'function',
        argumentTypes: declaration.params.map(param => {
          if (!param.typeAnnotation) {
            throw this._error(param, `Parameter ${param.name} doesn't have type annotation.`);
          } else {
            return this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
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
  _parseTypeAlias(declaration: any): {name: string, type: Type} {
    this._assert(declaration, declaration.type === 'TypeAlias',
        'parseTypeAlias accepts a TypeAlias node.');
    return {
      name: declaration.id.name,
      type: this._parseTypeAnnotation(declaration.right),
    };
  }

  /**
   * Parse a ClassDeclaration AST Node.
   * @param declaration - The AST node.
   * @returns A record containing the name of the class, along with an InterfaceDefinition
   *   object that describes it's method.
   */
  _parseClassDeclaration(
    declaration: Object,
  ): {name: string, interfaceDefinition: InterfaceDefinition} {
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
            throw this._error(param, `Parameter ${param.name} doesn't have type annotation.`);
          } else {
            return this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
          }
        });
      } else {
        var {name, type} = this._parseMethodDefinition(method);
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
  _parseMethodDefinition(definition: any): {name: string, type: FunctionType} {
    this._assert(definition, definition.type === 'MethodDefinition',
        'This is a MethodDefinition object.');
    this._assert(definition, definition.key && definition.key.type === 'Identifier',
      'This method defintion has an key (a name).');
    this._assert(definition, definition.value.returnType.type === 'TypeAnnotation',
      `${definition.key.name} missing a return type annotation.`);

    var returnType = this._parseTypeAnnotation(definition.value.returnType.typeAnnotation);
    this._assert(
      definition.value.returnType.typeAnnotation,
      returnType.kind === 'void' || returnType.kind === 'promise' ||
          returnType.kind === 'observable',
      'The return type of a function must be of type Void, Promise, or Observable');

    return {
      name: definition.key.name,
      type: {
        kind: 'function',
        argumentTypes: definition.value.params.map(param => {
          if (!param.typeAnnotation) {
            throw this._error(param, `Parameter ${param.name} doesn't have type annotation.`);
          } else {
            return this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
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
  _parseTypeAnnotation(typeAnnotation: Object): Type {
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
          type: this._parseTypeAnnotation(typeAnnotation.typeAnnotation),
        };
      case 'ObjectTypeAnnotation':
        return {
          kind: 'object',
          fields: typeAnnotation.properties.map(prop => {
            assert(prop.type === 'ObjectTypeProperty');
            return {
              name: prop.key.name,
              type: this._parseTypeAnnotation(prop.value),
              optional: prop.optional,
            };
          }),
        };
      case 'VoidTypeAnnotation':
        return {kind: 'void'};
      case 'TupleTypeAnnotation':
        return {
          kind: 'tuple',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this)),
        };
      case 'GenericTypeAnnotation':
        return this._parseGenericTypeAnnotation(typeAnnotation);
      default:
        throw this._error(typeAnnotation, `Unknown type annotation ${typeAnnotation.type}.`);
    }
  }

  /**
   * Helper function that parses annotations of type 'GenericTypeAnnotation'. Meant to be called
   * from parseTypeAnnotation.
   */
  _parseGenericTypeAnnotation(typeAnnotation) {
    assert(typeAnnotation.type === 'GenericTypeAnnotation');
    switch (typeAnnotation.id.name) {
      case 'Array':
      case 'Set':
      case 'Promise':
      case 'Observable':
        this._assert(
          typeAnnotation,
          typeAnnotation.typeParameters != null &&
          typeAnnotation.typeParameters.params.length === 1,
          `${typeAnnotation.id.name} has exactly one type parameter.`);
        return {
          kind: typeAnnotation.id.name.toLowerCase(),
          type: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
        };
      case 'Map':
        this._assert(
          typeAnnotation,
          typeAnnotation.typeParameters != null &&
          typeAnnotation.typeParameters.params.length === 2,
          `${typeAnnotation.id.name} takes exactly two type parameters.`);
        return {
          kind: 'map',
          keyType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
          valueType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[1]),
        };
      default:
        return {kind: 'named', name: typeAnnotation.id.name};
    }
  }
}
