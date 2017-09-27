'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseServiceDefinition = parseServiceDefinition;
exports._clearFileParsers = _clearFileParsers;

var _babylon;

function _load_babylon() {
  return _babylon = _interopRequireWildcard(require('babylon'));
}

var _builtinTypes;

function _load_builtinTypes() {
  return _builtinTypes = require('./builtin-types');
}

var _location;

function _load_location() {
  return _location = require('./location');
}

var _DefinitionValidator;

function _load_DefinitionValidator() {
  return _DefinitionValidator = require('./DefinitionValidator');
}

var _resolveFrom;

function _load_resolveFrom() {
  return _resolveFrom = _interopRequireDefault(require('resolve-from'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _fs = _interopRequireDefault(require('fs'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function isPrivateMemberName(name) {
  return name.startsWith('_');
}

/**
 * Parse a definition file, returning an intermediate representation that has all of the
 * information required to generate the remote proxy, as well as marshal and unmarshal the
 * data over a network.
 * @param source - The string source of the definition file.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function parseServiceDefinition(fileName, source, predefinedTypes) {
  return new ServiceParser(predefinedTypes).parseService(fileName, source);
}

class ServiceParser {

  constructor(predefinedTypes) {
    this._defs = new Map();
    this._visitedExports = new WeakSet();

    // Add all builtin types
    const defineBuiltinType = name => {
      if (!!this._defs.has(name)) {
        throw new Error('Duplicate builtin type');
      }

      this._defs.set(name, {
        kind: 'alias',
        name,
        location: { type: 'builtin' }
      });
    };
    (_builtinTypes || _load_builtinTypes()).namedBuiltinTypes.forEach(defineBuiltinType);
    predefinedTypes.forEach(defineBuiltinType);
  }
  // Set of exported AST nodes. Ensures we don't process the same export twice.


  parseService(fileName, source) {
    const fileParser = getFileParser(fileName, source);
    fileParser.getExports().forEach(node => fileParser.parseExport(this, node));
    const objDefs = (0, (_collection || _load_collection()).objectFromMap)(this._defs);
    (0, (_DefinitionValidator || _load_DefinitionValidator()).validateDefinitions)(objDefs);
    return objDefs;
  }

  hasDefinition(id) {
    return this._defs.has(id);
  }

  addDefinition(definition) {
    const existingDef = this._defs.get(definition.name);
    if (existingDef != null) {
      throw errorLocations([definition.location, existingDef.location], `Duplicate definition for ${definition.name}`);
    } else {
      this._defs.set(definition.name, definition);
    }
    return definition;
  }

  /**
   * Returns false if the export node has already been visited.
   * This prevents duplicate exports from being added.
   */
  visitExport(node) {
    if (this._visitedExports.has(node)) {
      return false;
    }
    this._visitedExports.add(node);
    return true;
  }
}

const fileParsers = new Map();

function getFileParser(fileName, source) {
  let parser = fileParsers.get(fileName);
  if (parser != null) {
    return parser;
  }
  parser = new FileParser(fileName);
  // flowlint-next-line sketchy-null-string:off
  parser.parse(source || _fs.default.readFileSync(fileName, 'utf8'));
  fileParsers.set(fileName, parser);
  return parser;
}

// Exported for testing.
function _clearFileParsers() {
  fileParsers.clear();
}

class FileParser {
  // Map of exported identifiers to their nodes.
  constructor(fileName) {
    this._fileName = fileName;
    this._exports = new Map();
    this._imports = new Map();
  }
  // Map of imported identifiers to their source file/identifier.


  getExports() {
    return this._exports;
  }

  _locationOfNode(node) {
    return {
      type: 'source',
      fileName: this._fileName,
      line: node.loc.start.line
    };
  }

  _nodeLocationString(node) {
    return `${this._fileName}(${node.loc.start.line})`;
  }

  _error(node, message) {
    return new Error(`${this._nodeLocationString(node)}:${message}`);
  }

  _assert(node, condition, message) {
    if (!condition) {
      throw this._error(node, message);
    }
  }

  /**
   * Performs a quick pass to index the file's exports and imports.
   * This doesn't actually visit any of the type definitions.
   */
  parse(source) {
    const ast = (_babylon || _load_babylon()).parse(source, {
      sourceType: 'module',
      plugins: ['*', 'jsx', 'flow']
    });
    const program = ast.program;

    if (!(program && program.type === 'Program')) {
      throw new Error('The result of parsing is a Program node.');
    }

    // Iterate through each node in the program body.


    for (const node of program.body) {
      switch (node.type) {
        case 'ExportNamedDeclaration':
          // Mark exports for easy lookup later.
          if (node.declaration != null && node.declaration.id != null) {
            this._exports.set(node.declaration.id.name, node);
          }
          // Only support export type {...} for now.
          if (node.specifiers != null && node.exportKind === 'type') {
            node.specifiers.forEach(specifier => {
              const { exported, local } = specifier;
              this._exports.set(exported.name, specifier);
              // export type {X as Y} from 'xyz' is equivalent to:
              //   import type {X} from 'xyz';
              //   export type {X as Y};
              if (node.source != null && typeof node.source.value === 'string') {
                this._imports.set(local.name, {
                  imported: local.name,
                  file: node.source.value
                });
              }
            });
          }
          break;

        case 'ImportDeclaration':
          this._parseImport(node);
          break;

        default:
          // Ignore all non-export top level program elements including:
          // imports, statements, variable declarations, function declarations
          break;
      }
    }
  }

  /**
   * Dive into the specified export node and visit all its dependencies as
   * necessary. This may also visit other files (if they're imported).
   */
  parseExport(serviceParser, node) {
    if (!serviceParser.visitExport(node)) {
      return;
    }
    if (node.type === 'ExportSpecifier') {
      const { exported, local } = node;
      const imp = this._imports.get(local.name);
      // It's difficult to resolve types that are defined elsewhere,
      // but in the same file. An easy workaround is to just export them
      // where they're defined, anyway.

      if (!(imp != null)) {
        throw new Error('export type {...} only supports imported types.');
      }

      if (exported.name !== imp.imported) {
        //   import type {A as B} from ...;
        //   export type {B as C};
        // will be treated as:
        //   import type {A} from ...;
        //   export type C = A;
        serviceParser.addDefinition({
          kind: 'alias',
          name: exported.name,
          location: this._locationOfNode(node),
          definition: { kind: 'named', name: imp.imported }
        });
      }
      this._visitImport(serviceParser, imp);
      return;
    }

    if (!(node.type === 'ExportNamedDeclaration')) {
      throw new Error('Invariant violation: "node.type === \'ExportNamedDeclaration\'"');
    }

    const declaration = node.declaration;
    switch (declaration.type) {
      // An exported function that can be directly called by a client.
      case 'FunctionDeclaration':
        if (!isPrivateMemberName(declaration.id.name)) {
          this._parseFunctionDeclaration(serviceParser, declaration);
        }
        break;
      // An exported type alias.
      case 'TypeAlias':
        if (!isPrivateMemberName(declaration.id.name)) {
          this._parseTypeAlias(serviceParser, declaration);
        }
        break;
      // Parse classes as remotable interfaces.
      case 'ClassDeclaration':
        this._parseClassDeclaration(serviceParser, declaration);
        break;
      case 'InterfaceDeclaration':
        this._parseInterfaceDeclaration(serviceParser, declaration);
        break;
      case 'VariableDeclaration':
        // Ignore exported variables.
        break;
      // Unknown export declaration.
      default:
        throw this._error(declaration, `Unknown declaration type ${declaration.type} in definition body.`);
    }
  }

  _visitImport(serviceParser, imp) {
    let resolved = (0, (_resolveFrom || _load_resolveFrom()).default)((_nuclideUri || _load_nuclideUri()).default.dirname(this._fileName), imp.file);
    // Prioritize .flow files.
    if (_fs.default.existsSync(resolved + '.flow')) {
      resolved += '.flow';
    }
    const importedFile = getFileParser(resolved);
    const exportNode = importedFile.getExports().get(imp.imported);

    if (!(exportNode != null)) {
      throw new Error(`Could not find export for ${imp.imported} in ${resolved}`);
    }

    importedFile.parseExport(serviceParser, exportNode);
  }

  _parseImport(node) {
    const from = node.source.value;

    if (!(typeof from === 'string')) {
      throw new Error('Invariant violation: "typeof from === \'string\'"');
    }

    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportSpecifier') {
        const imported = specifier.imported.name;
        const local = specifier.local.name;
        this._imports.set(local, {
          imported,
          file: from
        });
      }
    }
  }

  /**
   * Helper function that parses an exported function declaration, and returns the function name,
   * along with a FunctionType object that encodes the argument and return types of the function.
   */
  _parseFunctionDeclaration(serviceParser, declaration) {
    if (this._fileType === 'import') {
      throw this._error(declaration, 'Exported function in imported RPC file');
    }

    this._assert(declaration, declaration.id && declaration.id.type === 'Identifier', 'Remote function declarations must have an identifier.');
    this._assert(declaration, declaration.returnType != null && declaration.returnType.type === 'TypeAnnotation', 'Remote functions must be annotated with a return type.');

    const returnType = this._parseTypeAnnotation(serviceParser, declaration.returnType.typeAnnotation);

    return serviceParser.addDefinition({
      kind: 'function',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      type: {
        location: this._locationOfNode(declaration),
        kind: 'function',
        argumentTypes: declaration.params.map(param => this._parseParameter(serviceParser, param)),
        returnType
      }
    });
  }

  /**
   * Helper function that parses an exported type alias, and returns the name of the alias,
   * along with the type that it refers to.
   */
  _parseTypeAlias(serviceParser, declaration) {
    this._assert(declaration, declaration.type === 'TypeAlias', 'parseTypeAlias accepts a TypeAlias node.');
    return serviceParser.addDefinition({
      kind: 'alias',
      location: this._locationOfNode(declaration),
      name: declaration.id.name,
      definition: this._parseTypeAnnotation(serviceParser, declaration.right)
    });
  }

  /**
   * Parse a ClassDeclaration AST Node.
   * @param declaration - The AST node.
   */
  _parseClassDeclaration(serviceParser, declaration) {
    if (this._fileType === 'import') {
      throw this._error(declaration, 'Exported class in imported RPC file');
    }

    const def = {
      kind: 'interface',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      constructorArgs: [],
      staticMethods: {},
      instanceMethods: {}
    };

    const classBody = declaration.body;
    for (const method of classBody.body) {
      if (method.kind === 'constructor') {
        def.constructorArgs = method.params.map(param => this._parseParameter(serviceParser, param));
        if (method.returnType) {
          throw this._error(method, 'constructors may not have return types');
        }
      } else {
        if (!isPrivateMemberName(method.key.name)) {
          const { name, type } = this._parseClassMethod(serviceParser, method);
          const isStatic = Boolean(method.static);
          this._validateMethod(method, name, type, isStatic);
          this._defineMethod(name, type, isStatic ? def.staticMethods : def.instanceMethods);
        }
      }
    }
    if (!def.instanceMethods.hasOwnProperty('dispose')) {
      throw this._error(declaration, 'Remotable interfaces must include a dispose method');
    }
    return serviceParser.addDefinition(def);
  }

  _validateMethod(node, name, type, isStatic) {
    if (name === 'dispose' && !isStatic) {
      // Validate dispose method has a reasonable signature
      if (type.argumentTypes.length > 0) {
        throw this._error(node, 'dispose method may not take arguments');
      }
      if (!isValidDisposeReturnType(type.returnType)) {
        throw this._error(node, 'dispose method must return either void or Promise<void>');
      }
    }
  }

  /**
   * Parse a InterfaceDeclaration AST Node.
   * @param declaration - The AST node.
   */
  _parseInterfaceDeclaration(serviceParser, declaration) {
    const def = {
      kind: 'interface',
      name: declaration.id.name,
      location: this._locationOfNode(declaration),
      constructorArgs: null,
      staticMethods: {},
      instanceMethods: {}
    };

    if (!(declaration.body.type === 'ObjectTypeAnnotation')) {
      throw new Error('Invariant violation: "declaration.body.type === \'ObjectTypeAnnotation\'"');
    }

    const properties = declaration.body.properties;
    for (const property of properties) {
      if (!(property.type === 'ObjectTypeProperty')) {
        throw new Error('Invariant violation: "property.type === \'ObjectTypeProperty\'"');
      }

      if (!isPrivateMemberName(property.key.name)) {
        const { name, type } = this._parseInterfaceClassMethod(serviceParser, property);

        if (!!property.static) {
          throw new Error('static interface members are a parse error');
        }

        this._validateMethod(property, name, type, false);
        this._defineMethod(name, type, def.instanceMethods);
      }
    }
    if (!def.instanceMethods.hasOwnProperty('dispose')) {
      throw this._error(declaration, 'Remotable interfaces must include a dispose method');
    }
    return serviceParser.addDefinition(def);
  }

  _defineMethod(name, type, peers) {
    if (peers.hasOwnProperty(name)) {
      const peer = peers[name];
      throw errorLocations([type.location, peer.location], `Duplicate method definition ${name}`);
    } else {
      peers[name] = type;
    }
  }

  /**
   * Helper function that parses an method definition in a class.
   * @param defintion - The ClassMethod AST node.
   * @returns A record containing the name of the method, and a FunctionType object
   *   encoding the arguments and return type of the method.
   */
  _parseClassMethod(serviceParser, definition) {
    this._assert(definition, definition.type === 'ClassMethod', 'This is a ClassMethod object.');
    this._assert(definition, definition.key && definition.key.type === 'Identifier', 'This method defintion has an key (a name).');
    this._assert(definition, definition.returnType && definition.returnType.type === 'TypeAnnotation', `${definition.key.name} missing a return type annotation.`);

    const returnType = this._parseTypeAnnotation(serviceParser, definition.returnType.typeAnnotation);
    return {
      location: this._locationOfNode(definition.key),
      name: definition.key.name,
      type: {
        location: this._locationOfNode(definition),
        kind: 'function',
        argumentTypes: definition.params.map(param => this._parseParameter(serviceParser, param)),
        returnType
      }
    };
  }

  /**
   * Parses an method definition in an interface.
   * Note that interface method definitions are slightly different structure to class methods.
   * @param defintion - The ObjectTypeProperty AST node.
   * @returns A record containing the name of the method, and a FunctionType object
   *   encoding the arguments and return type of the method.
   */
  _parseInterfaceClassMethod(serviceParser, definition) {
    this._assert(definition, definition.type === 'ObjectTypeProperty', 'This is a ObjectTypeProperty object.');
    this._assert(definition, definition.key && definition.key.type === 'Identifier', 'This method definition has an key (a name).');
    this._assert(definition, definition.value.returnType != null, `${definition.key.name} missing a return type annotation.`);
    const returnType = this._parseTypeAnnotation(serviceParser, definition.value.returnType);

    if (!(typeof definition.key.name === 'string')) {
      throw new Error('Invariant violation: "typeof definition.key.name === \'string\'"');
    }

    if (!(typeof definition.optional === 'boolean')) {
      throw new Error('Invariant violation: "typeof definition.optional === \'boolean\'"');
    }

    if (definition.optional) {
      throw this._error(definition, `${definition.key.name} optional interface methods are not supported.`);
    }
    return {
      location: this._locationOfNode(definition.key),
      name: definition.key.name,
      type: {
        location: this._locationOfNode(definition.value),
        kind: 'function',
        argumentTypes: definition.value.params.map(param => this._parseInterfaceParameter(serviceParser, param)),
        returnType
      }
    };
  }

  _parseInterfaceParameter(serviceParser, param) {
    if (!param.typeAnnotation) {
      throw this._error(param, `Parameter ${param.name} doesn't have type annotation.`);
    } else {
      const name = param.name.name;

      if (!(typeof name === 'string')) {
        throw new Error('Invariant violation: "typeof name === \'string\'"');
      }

      const type = this._parseTypeAnnotation(serviceParser, param.typeAnnotation);
      if (param.optional && type.kind !== 'nullable') {
        return {
          name,
          type: {
            kind: 'nullable',
            type
          }
        };
      } else {
        return {
          name,
          type
        };
      }
    }
  }

  _parseParameter(serviceParser, param) {
    // Parameter with a default type, e.g. (x: number = 1).
    // Babel's transpiled implementation will take care of actually setting the default.
    if (param.type === 'AssignmentPattern') {
      return this._parseParameter(serviceParser, Object.assign({}, param.left, {
        // Having a default value implies that it's optional.
        optional: true
      }));
    }

    if (!param.typeAnnotation) {
      throw this._error(param, `Parameter ${param.name} doesn't have type annotation.`);
    } else {
      const name = param.name;
      const type = this._parseTypeAnnotation(serviceParser, param.typeAnnotation.typeAnnotation);
      if (param.optional && type.kind !== 'nullable') {
        return {
          name,
          type: {
            kind: 'nullable',
            type
          }
        };
      } else {
        return {
          name,
          type
        };
      }
    }
  }

  /**
   * Helper function that parses a Flow type annotation into our intermediate format.
   * @returns {Type} A representation of the type.
   */
  _parseTypeAnnotation(serviceParser, typeAnnotation) {
    switch (typeAnnotation.type) {
      case 'AnyTypeAnnotation':
        return { kind: 'any' };
      case 'MixedTypeAnnotation':
        return { kind: 'mixed' };
      case 'StringTypeAnnotation':
        return { kind: 'string' };
      case 'NumberTypeAnnotation':
        return { kind: 'number' };
      case 'BooleanTypeAnnotation':
        return { kind: 'boolean' };
      case 'StringLiteralTypeAnnotation':
        return { kind: 'string-literal', value: typeAnnotation.value };
      case 'NumericLiteralTypeAnnotation':
        return { kind: 'number-literal', value: typeAnnotation.value };
      case 'BooleanLiteralTypeAnnotation':
        return { kind: 'boolean-literal', value: typeAnnotation.value };
      case 'NullableTypeAnnotation':
        return {
          kind: 'nullable',
          type: this._parseTypeAnnotation(serviceParser, typeAnnotation.typeAnnotation)
        };
      case 'ObjectTypeAnnotation':
        return {
          kind: 'object',
          fields: typeAnnotation.properties.map(prop => {
            if (!(prop.type === 'ObjectTypeProperty')) {
              throw new Error('Invariant violation: "prop.type === \'ObjectTypeProperty\'"');
            }

            return {
              name: prop.key.name,
              type: this._parseTypeAnnotation(serviceParser, prop.value),
              optional: prop.optional
            };
          })
        };
      case 'VoidTypeAnnotation':
        return { kind: 'void' };
      case 'TupleTypeAnnotation':
        return {
          kind: 'tuple',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this, serviceParser))
        };
      case 'UnionTypeAnnotation':
        return {
          kind: 'union',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this, serviceParser))
        };
      case 'IntersectionTypeAnnotation':
        return {
          kind: 'intersection',
          types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this, serviceParser))
        };
      case 'GenericTypeAnnotation':
        return this._parseGenericTypeAnnotation(serviceParser, typeAnnotation);
      case 'FunctionTypeAnnotation':
        throw this._error(typeAnnotation, 'Properties that are of a function type are not supported. Use a method instead.');
      default:
        throw this._error(typeAnnotation, `Unknown type annotation ${typeAnnotation.type}.`);
    }
  }

  /**
   * Helper function that parses annotations of type 'GenericTypeAnnotation'. Meant to be called
   * from parseTypeAnnotation.
   */
  _parseGenericTypeAnnotation(serviceParser, typeAnnotation) {
    if (!(typeAnnotation.type === 'GenericTypeAnnotation')) {
      throw new Error('Invariant violation: "typeAnnotation.type === \'GenericTypeAnnotation\'"');
    }

    const id = this._parseTypeName(serviceParser, typeAnnotation.id);
    switch (id) {
      case 'Array':
        return {
          kind: 'array',
          type: this._parseGenericTypeParameterOfKnownType(serviceParser, id, typeAnnotation)
        };
      case 'Set':
        return {
          kind: 'set',
          type: this._parseGenericTypeParameterOfKnownType(serviceParser, id, typeAnnotation)
        };
      case 'Promise':
        return {
          kind: 'promise',
          type: this._parseGenericTypeParameterOfKnownType(serviceParser, id, typeAnnotation)
        };
      case 'ConnectableObservable':
        return {
          kind: 'observable',
          type: this._parseGenericTypeParameterOfKnownType(serviceParser, id, typeAnnotation)
        };
      case 'Map':
        this._assert(typeAnnotation, typeAnnotation.typeParameters != null && typeAnnotation.typeParameters.params.length === 2, `${id} takes exactly two type parameters.`);
        return {
          kind: 'map',
          keyType: this._parseTypeAnnotation(serviceParser, typeAnnotation.typeParameters.params[0]),
          valueType: this._parseTypeAnnotation(serviceParser, typeAnnotation.typeParameters.params[1])
        };
      default:
        this._assert(typeAnnotation, id !== 'Observable', 'Use of Observable in RPC interface. Use ConnectableObservable instead.');

        // Named types are represented as Generic types with no type parameters.
        this._assert(typeAnnotation, typeAnnotation.typeParameters == null, `Unknown generic type ${id}.`);

        if (!serviceParser.hasDefinition(id)) {
          const imp = this._imports.get(id);
          if (imp != null) {
            this._visitImport(serviceParser, imp);
            if (id !== imp.imported) {
              return { kind: 'named', name: imp.imported };
            }
          } else {
            const exportNode = this._exports.get(id);
            if (exportNode == null) {
              throw errorLocations([this._locationOfNode(typeAnnotation)], `Type ${id} should be exported from ${this._fileName}.`);
            }
            this.parseExport(serviceParser, exportNode);
          }
        }
    }
    return { kind: 'named', name: id };
  }

  _parseGenericTypeParameterOfKnownType(serviceParser, id, typeAnnotation) {
    this._assert(typeAnnotation, typeAnnotation.typeParameters != null && typeAnnotation.typeParameters.params.length === 1, `${id} has exactly one type parameter.`);
    return this._parseTypeAnnotation(serviceParser, typeAnnotation.typeParameters.params[0]);
  }

  /**
   * Type names may either be simple Identifiers, or they may be
   * qualified identifiers.
   */
  _parseTypeName(serviceParser, type) {
    switch (type.type) {
      case 'Identifier':
        return type.name;
      case 'QualifiedTypeIdentifier':
        if (!(type.id.type === 'Identifier')) {
          throw new Error('Invariant violation: "type.id.type === \'Identifier\'"');
        }

        return `${this._parseTypeName(serviceParser, type.qualification)}.${type.id.name}`;
      default:
        throw this._error(type, `Expected named type. Found ${type.type}`);
    }
  }
}

function errorLocations(locations, message) {
  let fullMessage = `${(0, (_location || _load_location()).locationToString)(locations[0])}:${message}`;
  fullMessage = fullMessage.concat(...locations.slice(1).map(location => `\n${(0, (_location || _load_location()).locationToString)(location)}: Related location`));
  return new Error(fullMessage);
}

function isValidDisposeReturnType(type) {
  return type.kind === 'void' || type.kind === 'promise' && type.type.kind === 'void';
}