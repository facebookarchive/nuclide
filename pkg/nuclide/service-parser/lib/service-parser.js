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

import type {
  Definition,
  FunctionDefinition,
  AliasDefinition,
  Definitions,
  FunctionType,
  InterfaceDefinition,
  Type,
  Location,
  SourceLocation,
  Babel$Node,
} from './types';

import {locationToString, namedBuiltinTypes} from './builtin-types';
import {validateDefinitions} from './DefinitionValidator';

function isPrivateMemberName(name: string): boolean {
  return name.startsWith('_');
}

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
  _defs: Map<string, Definition>;

  constructor(fileName: string) {
    this._fileName = fileName;
    this._defs = new Map();

    // Add all builtin types
    const defineBuiltinType = name => {
      this._defs.set(name, {
        kind: 'alias',
        name,
        location: { type: 'builtin' },
      });
    };
    namedBuiltinTypes.forEach(defineBuiltinType);
    // TODO: Find a better place for this.
    defineBuiltinType('NuclideUri');
  }

  _locationOfNode(node: any): SourceLocation {
    return {
      type: 'source',
      fileName: this._fileName,
      line: node.loc.start.line,
    };
  }

  _nodeLocationString(node: Babel$Node): string {
    return `${this._fileName}(${node.loc.start.line})`;
  }

  _errorLocations(locations: Array<Location>, message: string): Error {
    let fullMessage = `${locationToString(locations[0])}:${message}`;
    fullMessage = fullMessage.concat(
      ... (locations.slice(1).map(location =>
        `\n${locationToString(location)}: Related location`)));
    return new Error(fullMessage);
  }

  _error(node: Babel$Node, message: string): Error {
    return new Error(`${this._nodeLocationString(node)}:${message}`);
  }

  _assert(node, condition, message): void {
    if (!condition) {
      throw this._error(node, message);
    }
  }

  parseService(source: string): Definitions {
    const program = babel.parse(source);
    assert(program && program.type === 'Program', 'The result of parsing is a Program node.');

    // Iterate through each node in the program body.
    for (const node of program.body) {
      // We're specifically looking for exports.
      if (node.type === 'ExportNamedDeclaration') {
        const declaration = node.declaration;
        switch (declaration.type) {
          // An exported function that can be directly called by a client.
          case 'FunctionDeclaration':
            this._add(this._parseFunctionDeclaration(declaration));
            break;
          // An exported type alias.
          case 'TypeAlias':
            this._add(this._parseTypeAlias(declaration));
            break;
          // Parse classes as remotable interfaces.
          case 'ClassDeclaration':
            this._add(this._parseClassDeclaration(declaration));
            break;
          case 'VariableDeclaration':
            // Ignore exported variables.
            break;
          // Unknown export declaration.
          default:
            throw this._error(
              declaration,
              `Unknown declaration type ${declaration.type} in definition body.`);
        }
      } else {
        // Ignore all non-export top level program elements including:
        // imports, statements, variable declarations, function declarations
      }
    }

    validateDefinitions(this._defs);

    return this._defs;
  }

  _add(definition: Definition): void {
    if (this._defs.has(definition.name)) {
      throw this._errorLocations([definition.location, this._defs.get(definition.name).location],
        `Duplicate definition for ${definition.name}`);
    } else {
      this._defs.set(definition.name, definition);
    }
  }

  /**
   * Helper function that parses an exported function declaration, and returns the function name,
   * along with a FunctionType object that encodes the argument and return types of the function.
   */
  _parseFunctionDeclaration(declaration: any): FunctionDefinition {
    this._assert(
      declaration,
      declaration.id && declaration.id.type === 'Identifier',
      'Remote function declarations must have an identifier.');
    this._assert(
      declaration,
      declaration.returnType != null &&
      declaration.returnType.type === 'TypeAnnotation',
      'Remote functions must be annotated with a return type.');

    const returnType = this._parseTypeAnnotation(declaration.returnType.typeAnnotation);

    return {
      kind: 'function',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      type: {
        location: this._locationOfNode(declaration),
        kind: 'function',
        argumentTypes: declaration.params.map(param => this._parseParameter(param)),
        returnType,
      },
    };
  }

  /**
   * Helper function that parses an exported type alias, and returns the name of the alias,
   * along with the type that it refers to.
   */
  _parseTypeAlias(declaration: any): AliasDefinition {
    this._assert(declaration, declaration.type === 'TypeAlias',
        'parseTypeAlias accepts a TypeAlias node.');
    return {
      kind: 'alias',
      location: this._locationOfNode(declaration),
      name: declaration.id.name,
      definition: this._parseTypeAnnotation(declaration.right),
    };
  }

  /**
   * Parse a ClassDeclaration AST Node.
   * @param declaration - The AST node.
   */
  _parseClassDeclaration(declaration: Object): InterfaceDefinition {
    const def: InterfaceDefinition = {
      kind: 'interface',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      constructorArgs: [],
      staticMethods: new Map(),
      instanceMethods: new Map(),
    };

    const classBody = declaration.body;
    for (const method of classBody.body) {
      if (method.kind === 'constructor') {
        def.constructorArgs = method.value.params.map(param => this._parseParameter(param));
        if (method.value.returnType) {
          throw this._error(method, `constructors may not have return types`);
        }
      } else {
        if (!isPrivateMemberName(method.key.name)) {
          const {name, type} = this._parseMethodDefinition(method);
          this._defineMethod(name, type, method.static ? def.staticMethods : def.instanceMethods);
        }
      }
    }
    return def;
  }

  _defineMethod(name: string, type: FunctionType, peers: Map<string, FunctionType>): void {
    if (peers.has(name)) {
      const relatedLocation: SourceLocation = (peers.get(name).location: any);
      throw this._errorLocations([(type.location: any), relatedLocation],
        `Duplicate method definition ${name}`);
    } else {
      peers.set(name, type);
    }
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
    this._assert(definition, definition.value.returnType &&
      definition.value.returnType.type === 'TypeAnnotation',
      `${definition.key.name} missing a return type annotation.`);

    const returnType = this._parseTypeAnnotation(definition.value.returnType.typeAnnotation);
    return {
      location: this._locationOfNode(definition.key),
      name: definition.key.name,
      type: {
        location: this._locationOfNode(definition.value),
        kind: 'function',
        argumentTypes: definition.value.params.map(param => this._parseParameter(param)),
        returnType,
      },
    };
  }

  _parseParameter(param: Object): Type {
    if (!param.typeAnnotation) {
      throw this._error(param, `Parameter ${param.name} doesn't have type annotation.`);
    } else {
      const type = this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
      if (param.optional && type.kind !== 'nullable') {
        return {
          location: this._locationOfNode(param),
          kind: 'nullable',
          type,
        };
      } else {
        return type;
      }
    }
  }

  /**
   * Helper function that parses a Flow type annotation into our intermediate format.
   * @returns {Type} A representation of the type.
   */
  _parseTypeAnnotation(typeAnnotation: Object): Type {
    const location = this._locationOfNode(typeAnnotation);
    switch (typeAnnotation.type) {
      case 'AnyTypeAnnotation':
        return {location, kind: 'any'};
      case 'MixedTypeAnnotation':
        return {location, kind: 'mixed'};
      case 'StringTypeAnnotation':
        return {location, kind: 'string'};
      case 'NumberTypeAnnotation':
        return {location, kind: 'number'};
      case 'BooleanTypeAnnotation':
        return {location, kind: 'boolean'};
      case 'NullableTypeAnnotation':
        return {
          location,
          kind: 'nullable',
          type: this._parseTypeAnnotation(typeAnnotation.typeAnnotation),
        };
      case 'ObjectTypeAnnotation':
        return {
          location,
          kind: 'object',
          fields: typeAnnotation.properties.map(prop => {
            assert(prop.type === 'ObjectTypeProperty');
            return {
              location: this._locationOfNode(prop),
              name: prop.key.name,
              type: this._parseTypeAnnotation(prop.value),
              optional: prop.optional,
            };
          }),
        };
      case 'VoidTypeAnnotation':
        return {location, kind: 'void'};
      case 'TupleTypeAnnotation':
        return {
          location,
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
  _parseGenericTypeAnnotation(typeAnnotation): Type {
    assert(typeAnnotation.type === 'GenericTypeAnnotation');
    const id = this._parseTypeName(typeAnnotation.id);
    const location: Location = this._locationOfNode(typeAnnotation);
    switch (id) {
      case 'Array':
        return {
          location,
          kind: 'array',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation),
        };
      case 'Set':
        return {
          location,
          kind: 'set',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation),
        };
      case 'Promise':
        return {
          location,
          kind: 'promise',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation),
        };
      case 'Observable':
        return {
          location,
          kind: 'observable',
          type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation),
        };
      case 'Map':
        this._assert(
          typeAnnotation,
          typeAnnotation.typeParameters != null &&
          typeAnnotation.typeParameters.params.length === 2,
          `${id} takes exactly two type parameters.`);
        return {
          location,
          kind: 'map',
          keyType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
          valueType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[1]),
        };
      default:
        // Named types are represented as Generic types with no type parameters.
        this._assert(typeAnnotation, typeAnnotation.typeParameters == null,
            `Unknown generic type ${id}.`);
        return {location, kind: 'named', name: id};
    }
  }

  _parseGenericTypeParameterOfKnownType(id: string, typeAnnotation: Object): Type {
    this._assert(
      typeAnnotation,
      typeAnnotation.typeParameters != null &&
      typeAnnotation.typeParameters.params.length === 1,
      `${id} has exactly one type parameter.`);
    return this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]);
  }

  /**
   * Type names may either be simple Identifiers, or they may be
   * qualified identifiers.
   */
  _parseTypeName(type: Object): string {
    switch (type.type) {
      case 'Identifier':
        return type.name;
      case 'QualifiedTypeIdentifier':
        assert(type.id.type === 'Identifier');
        return `${this._parseTypeName(type.qualification)}.${type.id.name}`;
      default:
        throw this._error(type, `Expected named type. Found ${type.type}`);
    }
  }
}
