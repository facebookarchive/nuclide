Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.parseServiceDefinition = parseServiceDefinition;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _babelParse2;

function _babelParse() {
  return _babelParse2 = _interopRequireDefault(require('./babel-parse'));
}

var _builtinTypes2;

function _builtinTypes() {
  return _builtinTypes2 = require('./builtin-types');
}

var _location2;

function _location() {
  return _location2 = require('./location');
}

var _DefinitionValidator2;

function _DefinitionValidator() {
  return _DefinitionValidator2 = require('./DefinitionValidator');
}

var _resolveFrom2;

function _resolveFrom() {
  return _resolveFrom2 = _interopRequireDefault(require('resolve-from'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

function isPrivateMemberName(name) {
  return name.startsWith('_');
}

/**
 * Parse a definition file, returning an intermediate representation that has all of the
 * information required to generate the remote proxy, as well as marshal and unmarshal the
 * data over a network.
 * @param source - The string source of the definition file.
 */

function parseServiceDefinition(fileName, source) {
  return new ServiceParser().parseService(fileName, source);
}

var ServiceParser = (function () {
  function ServiceParser() {
    var _this = this;

    _classCallCheck(this, ServiceParser);

    this._defs = new Map();
    this._filesTodo = [];
    this._filesSeen = new Set();

    // Add all builtin types
    var defineBuiltinType = function defineBuiltinType(name) {
      _this._defs.set(name, {
        kind: 'alias',
        name: name,
        location: { type: 'builtin' }
      });
    };
    (_builtinTypes2 || _builtinTypes()).namedBuiltinTypes.forEach(defineBuiltinType);
    // TODO: Find a better place for this.
    defineBuiltinType('NuclideUri');
  }

  _createClass(ServiceParser, [{
    key: 'parseService',
    value: function parseService(fileName, source) {
      this._filesSeen.add(fileName);

      this._parseFile(fileName, 'service', source);

      while (this._filesTodo.length > 0) {
        var _file = this._filesTodo.pop();
        var contents = (_fs2 || _fs()).default.readFileSync(_file, 'utf8');
        this._parseFile(_file, 'import', contents);
      }

      (0, (_DefinitionValidator2 || _DefinitionValidator()).validateDefinitions)(this._defs);

      return this._defs;
    }
  }, {
    key: '_parseFile',
    value: function _parseFile(fileName, fileType, source) {
      var parser = new FileParser(fileName, fileType, this._defs);
      var imports = parser.parse(source);
      for (var imp of imports) {
        var resolvedFrom = (0, (_resolveFrom2 || _resolveFrom()).default)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(fileName), imp);

        if (!this._filesSeen.has(resolvedFrom)) {
          this._filesSeen.add(resolvedFrom);
          this._filesTodo.push(resolvedFrom);
        }
      }
    }
  }]);

  return ServiceParser;
})();

var FileParser = (function () {
  function FileParser(fileName, fileType, defs) {
    _classCallCheck(this, FileParser);

    this._fileType = fileType;
    this._fileName = fileName;
    this._defs = defs;
    this._imports = new Map();
    this._importsUsed = new Set();
  }

  _createClass(FileParser, [{
    key: '_locationOfNode',
    value: function _locationOfNode(node) {
      return {
        type: 'source',
        fileName: this._fileName,
        line: node.loc.start.line
      };
    }
  }, {
    key: '_nodeLocationString',
    value: function _nodeLocationString(node) {
      return this._fileName + '(' + node.loc.start.line + ')';
    }
  }, {
    key: '_errorLocations',
    value: function _errorLocations(locations, message) {
      var _fullMessage;

      var fullMessage = (0, (_location2 || _location()).locationToString)(locations[0]) + ':' + message;
      fullMessage = (_fullMessage = fullMessage).concat.apply(_fullMessage, _toConsumableArray(locations.slice(1).map(function (location) {
        return '\n' + (0, (_location2 || _location()).locationToString)(location) + ': Related location';
      })));
      return new Error(fullMessage);
    }
  }, {
    key: '_error',
    value: function _error(node, message) {
      return new Error(this._nodeLocationString(node) + ':' + message);
    }
  }, {
    key: '_assert',
    value: function _assert(node, condition, message) {
      if (!condition) {
        throw this._error(node, message);
      }
    }

    // Returns set of imported files required.
    // The file names returned are relative to the file being parsed.
  }, {
    key: 'parse',
    value: function parse(source) {
      this._imports = new Map();

      var program = (0, (_babelParse2 || _babelParse()).default)(source);
      (0, (_assert2 || _assert()).default)(program && program.type === 'Program', 'The result of parsing is a Program node.');

      // Iterate through each node in the program body.
      for (var node of program.body) {
        // We're specifically looking for exports.
        switch (node.type) {
          case 'ExportNamedDeclaration':
            this._parseExport(node);
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

      return this._importsUsed;
    }
  }, {
    key: '_parseExport',
    value: function _parseExport(node) {
      (0, (_assert2 || _assert()).default)(node.type === 'ExportNamedDeclaration');
      var declaration = node.declaration;
      switch (declaration.type) {
        // An exported function that can be directly called by a client.
        case 'FunctionDeclaration':
          if (!isPrivateMemberName(declaration.id.name)) {
            this._add(this._parseFunctionDeclaration(declaration));
          }
          break;
        // An exported type alias.
        case 'TypeAlias':
          if (!isPrivateMemberName(declaration.id.name)) {
            this._add(this._parseTypeAlias(declaration));
          }
          break;
        // Parse classes as remotable interfaces.
        case 'ClassDeclaration':
          this._add(this._parseClassDeclaration(declaration));
          break;
        case 'InterfaceDeclaration':
          this._add(this._parseInterfaceDeclaration(declaration));
          break;
        case 'VariableDeclaration':
          // Ignore exported variables.
          break;
        // Unknown export declaration.
        default:
          throw this._error(declaration, 'Unknown declaration type ' + declaration.type + ' in definition body.');
      }
    }
  }, {
    key: '_parseImport',
    value: function _parseImport(node) {
      var from = node.source.value;

      (0, (_assert2 || _assert()).default)(typeof from === 'string');

      for (var specifier of node.specifiers) {
        if (specifier.type === 'ImportSpecifier') {
          var _imported = specifier.imported.name;
          var local = specifier.local.name;
          this._imports.set(local, {
            imported: _imported,
            file: from,
            added: false,
            location: this._locationOfNode(specifier)
          });
        }
      }
    }
  }, {
    key: '_add',
    value: function _add(definition) {
      if (this._defs.has(definition.name)) {
        var existingDef = this._defs.get(definition.name);
        (0, (_assert2 || _assert()).default)(existingDef != null);
        throw this._errorLocations([definition.location, existingDef.location], 'Duplicate definition for ' + definition.name);
      } else {
        this._defs.set(definition.name, definition);
      }
    }

    /**
     * Helper function that parses an exported function declaration, and returns the function name,
     * along with a FunctionType object that encodes the argument and return types of the function.
     */
  }, {
    key: '_parseFunctionDeclaration',
    value: function _parseFunctionDeclaration(declaration) {
      var _this2 = this;

      if (this._fileType === 'import') {
        throw this._error(declaration, 'Exported function in imported RPC file');
      }

      this._assert(declaration, declaration.id && declaration.id.type === 'Identifier', 'Remote function declarations must have an identifier.');
      this._assert(declaration, declaration.returnType != null && declaration.returnType.type === 'TypeAnnotation', 'Remote functions must be annotated with a return type.');

      var returnType = this._parseTypeAnnotation(declaration.returnType.typeAnnotation);

      return {
        kind: 'function',
        name: declaration.id.name,
        location: this._locationOfNode(declaration),
        type: {
          location: this._locationOfNode(declaration),
          kind: 'function',
          argumentTypes: declaration.params.map(function (param) {
            return _this2._parseParameter(param);
          }),
          returnType: returnType
        }
      };
    }

    /**
     * Helper function that parses an exported type alias, and returns the name of the alias,
     * along with the type that it refers to.
     */
  }, {
    key: '_parseTypeAlias',
    value: function _parseTypeAlias(declaration) {
      this._assert(declaration, declaration.type === 'TypeAlias', 'parseTypeAlias accepts a TypeAlias node.');
      return {
        kind: 'alias',
        location: this._locationOfNode(declaration),
        name: declaration.id.name,
        definition: this._parseTypeAnnotation(declaration.right)
      };
    }

    /**
     * Parse a ClassDeclaration AST Node.
     * @param declaration - The AST node.
     */
  }, {
    key: '_parseClassDeclaration',
    value: function _parseClassDeclaration(declaration) {
      var _this3 = this;

      if (this._fileType === 'import') {
        throw this._error(declaration, 'Exported class in imported RPC file');
      }

      var def = {
        kind: 'interface',
        name: declaration.id.name,
        location: this._locationOfNode(declaration),
        constructorArgs: [],
        staticMethods: new Map(),
        instanceMethods: new Map()
      };

      var classBody = declaration.body;
      for (var method of classBody.body) {
        if (method.kind === 'constructor') {
          def.constructorArgs = method.value.params.map(function (param) {
            return _this3._parseParameter(param);
          });
          if (method.value.returnType) {
            throw this._error(method, 'constructors may not have return types');
          }
        } else {
          if (!isPrivateMemberName(method.key.name)) {
            var _parseMethodDefinition2 = this._parseMethodDefinition(method);

            var _name = _parseMethodDefinition2.name;
            var _type = _parseMethodDefinition2.type;

            var isStatic = Boolean(method.static);
            this._validateMethod(method, _name, _type, isStatic);
            this._defineMethod(_name, _type, isStatic ? def.staticMethods : def.instanceMethods);
          }
        }
      }
      if (!def.instanceMethods.has('dispose')) {
        throw this._error(declaration, 'Remotable interfaces must include a dispose method');
      }
      return def;
    }
  }, {
    key: '_validateMethod',
    value: function _validateMethod(node, name, type, isStatic) {
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
  }, {
    key: '_parseInterfaceDeclaration',
    value: function _parseInterfaceDeclaration(declaration) {
      var def = {
        kind: 'interface',
        name: declaration.id.name,
        location: this._locationOfNode(declaration),
        constructorArgs: null,
        staticMethods: new Map(),
        instanceMethods: new Map()
      };

      (0, (_assert2 || _assert()).default)(declaration.body.type === 'ObjectTypeAnnotation');
      var properties = declaration.body.properties;
      for (var property of properties) {
        (0, (_assert2 || _assert()).default)(property.type === 'ObjectTypeProperty');

        if (!isPrivateMemberName(property.key.name)) {
          var _parseInterfaceMethodDefinition2 = this._parseInterfaceMethodDefinition(property);

          var _name2 = _parseInterfaceMethodDefinition2.name;
          var _type2 = _parseInterfaceMethodDefinition2.type;

          (0, (_assert2 || _assert()).default)(!property.static, 'static interface members are a parse error');
          this._validateMethod(property, _name2, _type2, false);
          this._defineMethod(_name2, _type2, def.instanceMethods);
        }
      }
      if (!def.instanceMethods.has('dispose')) {
        throw this._error(declaration, 'Remotable interfaces must include a dispose method');
      }
      return def;
    }
  }, {
    key: '_defineMethod',
    value: function _defineMethod(name, type, peers) {
      if (peers.has(name)) {
        // $FlowFixMe(peterhal)
        var relatedLocation = peers.get(name).location;
        throw this._errorLocations([type.location, relatedLocation], 'Duplicate method definition ' + name);
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
  }, {
    key: '_parseMethodDefinition',
    value: function _parseMethodDefinition(definition) {
      var _this4 = this;

      this._assert(definition, definition.type === 'MethodDefinition', 'This is a MethodDefinition object.');
      this._assert(definition, definition.key && definition.key.type === 'Identifier', 'This method defintion has an key (a name).');
      this._assert(definition, definition.value.returnType && definition.value.returnType.type === 'TypeAnnotation', definition.key.name + ' missing a return type annotation.');

      var returnType = this._parseTypeAnnotation(definition.value.returnType.typeAnnotation);
      return {
        location: this._locationOfNode(definition.key),
        name: definition.key.name,
        type: {
          location: this._locationOfNode(definition.value),
          kind: 'function',
          argumentTypes: definition.value.params.map(function (param) {
            return _this4._parseParameter(param);
          }),
          returnType: returnType
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
  }, {
    key: '_parseInterfaceMethodDefinition',
    value: function _parseInterfaceMethodDefinition(definition) {
      var _this5 = this;

      this._assert(definition, definition.type === 'ObjectTypeProperty', 'This is a ObjectTypeProperty object.');
      this._assert(definition, definition.key && definition.key.type === 'Identifier', 'This method definition has an key (a name).');
      this._assert(definition, definition.value.returnType != null, definition.key.name + ' missing a return type annotation.');

      var returnType = this._parseTypeAnnotation(definition.value.returnType);
      return {
        location: this._locationOfNode(definition.key),
        name: definition.key.name,
        type: {
          location: this._locationOfNode(definition.value),
          kind: 'function',
          argumentTypes: definition.value.params.map(function (param) {
            return _this5._parseInterfaceParameter(param);
          }),
          returnType: returnType
        }
      };
    }
  }, {
    key: '_parseInterfaceParameter',
    value: function _parseInterfaceParameter(param) {
      if (!param.typeAnnotation) {
        throw this._error(param, 'Parameter ' + param.name + ' doesn\'t have type annotation.');
      } else {
        var _name3 = param.name;
        var _type3 = this._parseTypeAnnotation(param.typeAnnotation);
        if (param.optional && _type3.kind !== 'nullable') {
          return {
            name: _name3,
            type: {
              location: this._locationOfNode(param),
              kind: 'nullable',
              type: _type3
            }
          };
        } else {
          return {
            name: _name3,
            type: _type3
          };
        }
      }
    }
  }, {
    key: '_parseParameter',
    value: function _parseParameter(param) {
      if (!param.typeAnnotation) {
        throw this._error(param, 'Parameter ' + param.name + ' doesn\'t have type annotation.');
      } else {
        var _name4 = param.name;
        var _type4 = this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
        if (param.optional && _type4.kind !== 'nullable') {
          return {
            name: _name4,
            type: {
              location: this._locationOfNode(param),
              kind: 'nullable',
              type: _type4
            }
          };
        } else {
          return {
            name: _name4,
            type: _type4
          };
        }
      }
    }

    /**
     * Helper function that parses a Flow type annotation into our intermediate format.
     * @returns {Type} A representation of the type.
     */
  }, {
    key: '_parseTypeAnnotation',
    value: function _parseTypeAnnotation(typeAnnotation) {
      var _this6 = this;

      var location = this._locationOfNode(typeAnnotation);
      switch (typeAnnotation.type) {
        case 'AnyTypeAnnotation':
          return { location: location, kind: 'any' };
        case 'MixedTypeAnnotation':
          return { location: location, kind: 'mixed' };
        case 'StringTypeAnnotation':
          return { location: location, kind: 'string' };
        case 'NumberTypeAnnotation':
          return { location: location, kind: 'number' };
        case 'BooleanTypeAnnotation':
          return { location: location, kind: 'boolean' };
        case 'StringLiteralTypeAnnotation':
          return { location: location, kind: 'string-literal', value: typeAnnotation.value };
        case 'NumberLiteralTypeAnnotation':
          return { location: location, kind: 'number-literal', value: typeAnnotation.value };
        case 'BooleanLiteralTypeAnnotation':
          return { location: location, kind: 'boolean-literal', value: typeAnnotation.value };
        case 'NullableTypeAnnotation':
          return {
            location: location,
            kind: 'nullable',
            type: this._parseTypeAnnotation(typeAnnotation.typeAnnotation)
          };
        case 'ObjectTypeAnnotation':
          return {
            location: location,
            kind: 'object',
            fields: typeAnnotation.properties.map(function (prop) {
              (0, (_assert2 || _assert()).default)(prop.type === 'ObjectTypeProperty');
              return {
                location: _this6._locationOfNode(prop),
                name: prop.key.name,
                type: _this6._parseTypeAnnotation(prop.value),
                optional: prop.optional
              };
            })
          };
        case 'VoidTypeAnnotation':
          return { location: location, kind: 'void' };
        case 'TupleTypeAnnotation':
          return {
            location: location,
            kind: 'tuple',
            types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this))
          };
        case 'UnionTypeAnnotation':
          return {
            location: location,
            kind: 'union',
            types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this))
          };
        case 'IntersectionTypeAnnotation':
          return {
            location: location,
            kind: 'intersection',
            types: typeAnnotation.types.map(this._parseTypeAnnotation.bind(this))
          };
        case 'GenericTypeAnnotation':
          return this._parseGenericTypeAnnotation(typeAnnotation);
        default:
          throw this._error(typeAnnotation, 'Unknown type annotation ' + typeAnnotation.type + '.');
      }
    }

    /**
     * Helper function that parses annotations of type 'GenericTypeAnnotation'. Meant to be called
     * from parseTypeAnnotation.
     */
  }, {
    key: '_parseGenericTypeAnnotation',
    value: function _parseGenericTypeAnnotation(typeAnnotation) {
      (0, (_assert2 || _assert()).default)(typeAnnotation.type === 'GenericTypeAnnotation');
      var id = this._parseTypeName(typeAnnotation.id);
      var location = this._locationOfNode(typeAnnotation);
      switch (id) {
        case 'Array':
          return {
            location: location,
            kind: 'array',
            type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
          };
        case 'Set':
          return {
            location: location,
            kind: 'set',
            type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
          };
        case 'Promise':
          return {
            location: location,
            kind: 'promise',
            type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
          };
        case 'Observable':
          return {
            location: location,
            kind: 'observable',
            type: this._parseGenericTypeParameterOfKnownType(id, typeAnnotation)
          };
        case 'Map':
          this._assert(typeAnnotation, typeAnnotation.typeParameters != null && typeAnnotation.typeParameters.params.length === 2, id + ' takes exactly two type parameters.');
          return {
            location: location,
            kind: 'map',
            keyType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]),
            valueType: this._parseTypeAnnotation(typeAnnotation.typeParameters.params[1])
          };
        default:
          // Named types are represented as Generic types with no type parameters.
          this._assert(typeAnnotation, typeAnnotation.typeParameters == null, 'Unknown generic type ' + id + '.');

          var imp = this._imports.get(id);
          if (id !== 'NuclideUri' && imp != null && !imp.added) {
            imp.added = true;
            this._importsUsed.add(imp.file);
            if (id !== imp.imported) {
              return { location: location, kind: 'named', name: imp.imported };
            }
          }
          return { location: location, kind: 'named', name: id };
      }
    }
  }, {
    key: '_parseGenericTypeParameterOfKnownType',
    value: function _parseGenericTypeParameterOfKnownType(id, typeAnnotation) {
      this._assert(typeAnnotation, typeAnnotation.typeParameters != null && typeAnnotation.typeParameters.params.length === 1, id + ' has exactly one type parameter.');
      return this._parseTypeAnnotation(typeAnnotation.typeParameters.params[0]);
    }

    /**
     * Type names may either be simple Identifiers, or they may be
     * qualified identifiers.
     */
  }, {
    key: '_parseTypeName',
    value: function _parseTypeName(type) {
      switch (type.type) {
        case 'Identifier':
          return type.name;
        case 'QualifiedTypeIdentifier':
          (0, (_assert2 || _assert()).default)(type.id.type === 'Identifier');
          return this._parseTypeName(type.qualification) + '.' + type.id.name;
        default:
          throw this._error(type, 'Expected named type. Found ' + type.type);
      }
    }
  }]);

  return FileParser;
})();

function isValidDisposeReturnType(type) {
  return type.kind === 'void' || type.kind === 'promise' && type.type.kind === 'void';
}

// Maps type names to the imported name and file that they are imported from.

// Set of files required by imports