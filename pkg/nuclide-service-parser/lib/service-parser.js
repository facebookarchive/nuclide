Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.parseServiceDefinition = parseServiceDefinition;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _babelCore = require('babel-core');

var babel = _interopRequireWildcard(_babelCore);

var _assert2 = require('assert');

var _assert3 = _interopRequireDefault(_assert2);

var _builtinTypes = require('./builtin-types');

var _DefinitionValidator = require('./DefinitionValidator');

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
  return new ServiceParser(fileName).parseService(source);
}

var ServiceParser = (function () {
  function ServiceParser(fileName) {
    var _this = this;

    _classCallCheck(this, ServiceParser);

    this._fileName = fileName;
    this._defs = new Map();

    // Add all builtin types
    var defineBuiltinType = function defineBuiltinType(name) {
      _this._defs.set(name, {
        kind: 'alias',
        name: name,
        location: { type: 'builtin' }
      });
    };
    _builtinTypes.namedBuiltinTypes.forEach(defineBuiltinType);
    // TODO: Find a better place for this.
    defineBuiltinType('NuclideUri');
  }

  _createClass(ServiceParser, [{
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

      var fullMessage = (0, _builtinTypes.locationToString)(locations[0]) + ':' + message;
      fullMessage = (_fullMessage = fullMessage).concat.apply(_fullMessage, _toConsumableArray(locations.slice(1).map(function (location) {
        return '\n' + (0, _builtinTypes.locationToString)(location) + ': Related location';
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
  }, {
    key: 'parseService',
    value: function parseService(source) {
      var program = babel.parse(source);
      (0, _assert3['default'])(program && program.type === 'Program', 'The result of parsing is a Program node.');

      // Iterate through each node in the program body.
      for (var node of program.body) {
        // We're specifically looking for exports.
        if (node.type === 'ExportNamedDeclaration') {
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
            case 'VariableDeclaration':
              // Ignore exported variables.
              break;
            // Unknown export declaration.
            default:
              throw this._error(declaration, 'Unknown declaration type ' + declaration.type + ' in definition body.');
          }
        } else {
          // Ignore all non-export top level program elements including:
          // imports, statements, variable declarations, function declarations
        }
      }

      (0, _DefinitionValidator.validateDefinitions)(this._defs);

      return this._defs;
    }
  }, {
    key: '_add',
    value: function _add(definition) {
      if (this._defs.has(definition.name)) {
        var existingDef = this._defs.get(definition.name);
        (0, _assert3['default'])(existingDef != null);
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

            if (_name === 'dispose') {
              // Validate dispose method has a reasonable signature
              if (_type.argumentTypes.length > 0) {
                throw this._error(method, 'dispose method may not take arguments');
              }
              if (!isValidDisposeReturnType(_type.returnType)) {
                throw this._error(method, 'dispose method must return either void or Promise<void>');
              }
            }
            this._defineMethod(_name, _type, method['static'] ? def.staticMethods : def.instanceMethods);
          }
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
  }, {
    key: '_parseParameter',
    value: function _parseParameter(param) {
      if (!param.typeAnnotation) {
        throw this._error(param, 'Parameter ' + param.name + ' doesn\'t have type annotation.');
      } else {
        var _type2 = this._parseTypeAnnotation(param.typeAnnotation.typeAnnotation);
        if (param.optional && _type2.kind !== 'nullable') {
          return {
            location: this._locationOfNode(param),
            kind: 'nullable',
            type: _type2
          };
        } else {
          return _type2;
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
      var _this5 = this;

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
              (0, _assert3['default'])(prop.type === 'ObjectTypeProperty');
              return {
                location: _this5._locationOfNode(prop),
                name: prop.key.name,
                type: _this5._parseTypeAnnotation(prop.value),
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
      (0, _assert3['default'])(typeAnnotation.type === 'GenericTypeAnnotation');
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
          (0, _assert3['default'])(type.id.type === 'Identifier');
          return this._parseTypeName(type.qualification) + '.' + type.id.name;
        default:
          throw this._error(type, 'Expected named type. Found ' + type.type);
      }
    }
  }]);

  return ServiceParser;
})();

function isValidDisposeReturnType(type) {
  return type.kind === 'void' || type.kind === 'promise' && type.type.kind === 'void';
}