Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports['default'] = parseServiceDefinition;

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

            this._defineMethod(_name, _type, method['static'] ? def.staticMethods : def.instanceMethods);
          }
        }
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

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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T0FDOUM7S0FDRjs7O1dBRW9DLCtDQUFDLEVBQVUsRUFBRSxjQUFzQixFQUFRO0FBQzlFLFVBQUksQ0FBQyxPQUFPLENBQ1YsY0FBYyxFQUNkLGNBQWMsQ0FBQyxjQUFjLElBQUksSUFBSSxJQUNyQyxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUM5QyxFQUFFLHNDQUFtQyxDQUFDO0FBQzNDLGFBQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDM0U7Ozs7Ozs7O1dBTWEsd0JBQUMsSUFBWSxFQUFVO0FBQ25DLGNBQVEsSUFBSSxDQUFDLElBQUk7QUFDZixhQUFLLFlBQVk7QUFDZixpQkFBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQUEsQUFDbkIsYUFBSyx5QkFBeUI7QUFDNUIsbUNBQVUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEtBQUssWUFBWSxDQUFDLENBQUM7QUFDekMsaUJBQVUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUc7QUFBQSxBQUN0RTtBQUNFLGdCQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxrQ0FBZ0MsSUFBSSxDQUFDLElBQUksQ0FBRyxDQUFDO0FBQUEsT0FDdEU7S0FDRjs7O1NBNVhHLGFBQWEiLCJmaWxlIjoic2VydmljZS1wYXJzZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgKiBhcyBiYWJlbCBmcm9tICdiYWJlbC1jb3JlJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUge1xuICBEZWZpbml0aW9uLFxuICBGdW5jdGlvbkRlZmluaXRpb24sXG4gIEFsaWFzRGVmaW5pdGlvbixcbiAgRGVmaW5pdGlvbnMsXG4gIEZ1bmN0aW9uVHlwZSxcbiAgSW50ZXJmYWNlRGVmaW5pdGlvbixcbiAgVHlwZSxcbiAgTG9jYXRpb24sXG4gIFNvdXJjZUxvY2F0aW9uLFxuICBCYWJlbCROb2RlLFxufSBmcm9tICcuL3R5cGVzJztcblxuaW1wb3J0IHtsb2NhdGlvblRvU3RyaW5nLCBuYW1lZEJ1aWx0aW5UeXBlc30gZnJvbSAnLi9idWlsdGluLXR5cGVzJztcbmltcG9ydCB7dmFsaWRhdGVEZWZpbml0aW9uc30gZnJvbSAnLi9EZWZpbml0aW9uVmFsaWRhdG9yJztcblxuZnVuY3Rpb24gaXNQcml2YXRlTWVtYmVyTmFtZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5hbWUuc3RhcnRzV2l0aCgnXycpO1xufVxuXG4vKipcbiAqIFBhcnNlIGEgZGVmaW5pdGlvbiBmaWxlLCByZXR1cm5pbmcgYW4gaW50ZXJtZWRpYXRlIHJlcHJlc2VudGF0aW9uIHRoYXQgaGFzIGFsbCBvZiB0aGVcbiAqIGluZm9ybWF0aW9uIHJlcXVpcmVkIHRvIGdlbmVyYXRlIHRoZSByZW1vdGUgcHJveHksIGFzIHdlbGwgYXMgbWFyc2hhbCBhbmQgdW5tYXJzaGFsIHRoZVxuICogZGF0YSBvdmVyIGEgbmV0d29yay5cbiAqIEBwYXJhbSBzb3VyY2UgLSBUaGUgc3RyaW5nIHNvdXJjZSBvZiB0aGUgZGVmaW5pdGlvbiBmaWxlLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZVNlcnZpY2VEZWZpbml0aW9uKGZpbGVOYW1lOiBzdHJpbmcsIHNvdXJjZTogc3RyaW5nKTogRGVmaW5pdGlvbnMge1xuICByZXR1cm4gbmV3IFNlcnZpY2VQYXJzZXIoZmlsZU5hbWUpLnBhcnNlU2VydmljZShzb3VyY2UpO1xufVxuXG5jbGFzcyBTZXJ2aWNlUGFyc2VyIHtcbiAgX2ZpbGVOYW1lOiBzdHJpbmc7XG4gIF9kZWZzOiBNYXA8c3RyaW5nLCBEZWZpbml0aW9uPjtcblxuICBjb25zdHJ1Y3RvcihmaWxlTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fZmlsZU5hbWUgPSBmaWxlTmFtZTtcbiAgICB0aGlzLl9kZWZzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gQWRkIGFsbCBidWlsdGluIHR5cGVzXG4gICAgY29uc3QgZGVmaW5lQnVpbHRpblR5cGUgPSBuYW1lID0+IHtcbiAgICAgIHRoaXMuX2RlZnMuc2V0KG5hbWUsIHtcbiAgICAgICAga2luZDogJ2FsaWFzJyxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgbG9jYXRpb246IHsgdHlwZTogJ2J1aWx0aW4nIH0sXG4gICAgICB9KTtcbiAgICB9O1xuICAgIG5hbWVkQnVpbHRpblR5cGVzLmZvckVhY2goZGVmaW5lQnVpbHRpblR5cGUpO1xuICAgIC8vIFRPRE86IEZpbmQgYSBiZXR0ZXIgcGxhY2UgZm9yIHRoaXMuXG4gICAgZGVmaW5lQnVpbHRpblR5cGUoJ051Y2xpZGVVcmknKTtcbiAgfVxuXG4gIF9sb2NhdGlvbk9mTm9kZShub2RlOiBhbnkpOiBTb3VyY2VMb2NhdGlvbiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHR5cGU6ICdzb3VyY2UnLFxuICAgICAgZmlsZU5hbWU6IHRoaXMuX2ZpbGVOYW1lLFxuICAgICAgbGluZTogbm9kZS5sb2Muc3RhcnQubGluZSxcbiAgICB9O1xuICB9XG5cbiAgX25vZGVMb2NhdGlvblN0cmluZyhub2RlOiBCYWJlbCROb2RlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fZmlsZU5hbWV9KCR7bm9kZS5sb2Muc3RhcnQubGluZX0pYDtcbiAgfVxuXG4gIF9lcnJvckxvY2F0aW9ucyhsb2NhdGlvbnM6IEFycmF5PExvY2F0aW9uPiwgbWVzc2FnZTogc3RyaW5nKTogRXJyb3Ige1xuICAgIGxldCBmdWxsTWVzc2FnZSA9IGAke2xvY2F0aW9uVG9TdHJpbmcobG9jYXRpb25zWzBdKX06JHttZXNzYWdlfWA7XG4gICAgZnVsbE1lc3NhZ2UgPSBmdWxsTWVzc2FnZS5jb25jYXQoXG4gICAgICAuLi4gKGxvY2F0aW9ucy5zbGljZSgxKS5tYXAobG9jYXRpb24gPT5cbiAgICAgICAgYFxcbiR7bG9jYXRpb25Ub1N0cmluZyhsb2NhdGlvbil9OiBSZWxhdGVkIGxvY2F0aW9uYCkpKTtcbiAgICByZXR1cm4gbmV3IEVycm9yKGZ1bGxNZXNzYWdlKTtcbiAgfVxuXG4gIF9lcnJvcihub2RlOiBCYWJlbCROb2RlLCBtZXNzYWdlOiBzdHJpbmcpOiBFcnJvciB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihgJHt0aGlzLl9ub2RlTG9jYXRpb25TdHJpbmcobm9kZSl9OiR7bWVzc2FnZX1gKTtcbiAgfVxuXG4gIF9hc3NlcnQobm9kZSwgY29uZGl0aW9uLCBtZXNzYWdlKTogdm9pZCB7XG4gICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgIHRocm93IHRoaXMuX2Vycm9yKG5vZGUsIG1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIHBhcnNlU2VydmljZShzb3VyY2U6IHN0cmluZyk6IERlZmluaXRpb25zIHtcbiAgICBjb25zdCBwcm9ncmFtID0gYmFiZWwucGFyc2Uoc291cmNlKTtcbiAgICBpbnZhcmlhbnQocHJvZ3JhbSAmJiBwcm9ncmFtLnR5cGUgPT09ICdQcm9ncmFtJywgJ1RoZSByZXN1bHQgb2YgcGFyc2luZyBpcyBhIFByb2dyYW0gbm9kZS4nKTtcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIG5vZGUgaW4gdGhlIHByb2dyYW0gYm9keS5cbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcHJvZ3JhbS5ib2R5KSB7XG4gICAgICAvLyBXZSdyZSBzcGVjaWZpY2FsbHkgbG9va2luZyBmb3IgZXhwb3J0cy5cbiAgICAgIGlmIChub2RlLnR5cGUgPT09ICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJykge1xuICAgICAgICBjb25zdCBkZWNsYXJhdGlvbiA9IG5vZGUuZGVjbGFyYXRpb247XG4gICAgICAgIHN3aXRjaCAoZGVjbGFyYXRpb24udHlwZSkge1xuICAgICAgICAgIC8vIEFuIGV4cG9ydGVkIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGRpcmVjdGx5IGNhbGxlZCBieSBhIGNsaWVudC5cbiAgICAgICAgICBjYXNlICdGdW5jdGlvbkRlY2xhcmF0aW9uJzpcbiAgICAgICAgICAgIGlmICghaXNQcml2YXRlTWVtYmVyTmFtZShkZWNsYXJhdGlvbi5pZC5uYW1lKSkge1xuICAgICAgICAgICAgICB0aGlzLl9hZGQodGhpcy5fcGFyc2VGdW5jdGlvbkRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAvLyBBbiBleHBvcnRlZCB0eXBlIGFsaWFzLlxuICAgICAgICAgIGNhc2UgJ1R5cGVBbGlhcyc6XG4gICAgICAgICAgICBpZiAoIWlzUHJpdmF0ZU1lbWJlck5hbWUoZGVjbGFyYXRpb24uaWQubmFtZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYWRkKHRoaXMuX3BhcnNlVHlwZUFsaWFzKGRlY2xhcmF0aW9uKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAvLyBQYXJzZSBjbGFzc2VzIGFzIHJlbW90YWJsZSBpbnRlcmZhY2VzLlxuICAgICAgICAgIGNhc2UgJ0NsYXNzRGVjbGFyYXRpb24nOlxuICAgICAgICAgICAgdGhpcy5fYWRkKHRoaXMuX3BhcnNlQ2xhc3NEZWNsYXJhdGlvbihkZWNsYXJhdGlvbikpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnVmFyaWFibGVEZWNsYXJhdGlvbic6XG4gICAgICAgICAgICAvLyBJZ25vcmUgZXhwb3J0ZWQgdmFyaWFibGVzLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gVW5rbm93biBleHBvcnQgZGVjbGFyYXRpb24uXG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHRocm93IHRoaXMuX2Vycm9yKFxuICAgICAgICAgICAgICBkZWNsYXJhdGlvbixcbiAgICAgICAgICAgICAgYFVua25vd24gZGVjbGFyYXRpb24gdHlwZSAke2RlY2xhcmF0aW9uLnR5cGV9IGluIGRlZmluaXRpb24gYm9keS5gKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gSWdub3JlIGFsbCBub24tZXhwb3J0IHRvcCBsZXZlbCBwcm9ncmFtIGVsZW1lbnRzIGluY2x1ZGluZzpcbiAgICAgICAgLy8gaW1wb3J0cywgc3RhdGVtZW50cywgdmFyaWFibGUgZGVjbGFyYXRpb25zLCBmdW5jdGlvbiBkZWNsYXJhdGlvbnNcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxpZGF0ZURlZmluaXRpb25zKHRoaXMuX2RlZnMpO1xuXG4gICAgcmV0dXJuIHRoaXMuX2RlZnM7XG4gIH1cblxuICBfYWRkKGRlZmluaXRpb246IERlZmluaXRpb24pOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fZGVmcy5oYXMoZGVmaW5pdGlvbi5uYW1lKSkge1xuICAgICAgY29uc3QgZXhpc3RpbmdEZWYgPSB0aGlzLl9kZWZzLmdldChkZWZpbml0aW9uLm5hbWUpO1xuICAgICAgaW52YXJpYW50KGV4aXN0aW5nRGVmICE9IG51bGwpO1xuICAgICAgdGhyb3cgdGhpcy5fZXJyb3JMb2NhdGlvbnMoW2RlZmluaXRpb24ubG9jYXRpb24sIGV4aXN0aW5nRGVmLmxvY2F0aW9uXSxcbiAgICAgICAgYER1cGxpY2F0ZSBkZWZpbml0aW9uIGZvciAke2RlZmluaXRpb24ubmFtZX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZGVmcy5zZXQoZGVmaW5pdGlvbi5uYW1lLCBkZWZpbml0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGFuIGV4cG9ydGVkIGZ1bmN0aW9uIGRlY2xhcmF0aW9uLCBhbmQgcmV0dXJucyB0aGUgZnVuY3Rpb24gbmFtZSxcbiAgICogYWxvbmcgd2l0aCBhIEZ1bmN0aW9uVHlwZSBvYmplY3QgdGhhdCBlbmNvZGVzIHRoZSBhcmd1bWVudCBhbmQgcmV0dXJuIHR5cGVzIG9mIHRoZSBmdW5jdGlvbi5cbiAgICovXG4gIF9wYXJzZUZ1bmN0aW9uRGVjbGFyYXRpb24oZGVjbGFyYXRpb246IGFueSk6IEZ1bmN0aW9uRGVmaW5pdGlvbiB7XG4gICAgdGhpcy5fYXNzZXJ0KFxuICAgICAgZGVjbGFyYXRpb24sXG4gICAgICBkZWNsYXJhdGlvbi5pZCAmJiBkZWNsYXJhdGlvbi5pZC50eXBlID09PSAnSWRlbnRpZmllcicsXG4gICAgICAnUmVtb3RlIGZ1bmN0aW9uIGRlY2xhcmF0aW9ucyBtdXN0IGhhdmUgYW4gaWRlbnRpZmllci4nKTtcbiAgICB0aGlzLl9hc3NlcnQoXG4gICAgICBkZWNsYXJhdGlvbixcbiAgICAgIGRlY2xhcmF0aW9uLnJldHVyblR5cGUgIT0gbnVsbCAmJlxuICAgICAgZGVjbGFyYXRpb24ucmV0dXJuVHlwZS50eXBlID09PSAnVHlwZUFubm90YXRpb24nLFxuICAgICAgJ1JlbW90ZSBmdW5jdGlvbnMgbXVzdCBiZSBhbm5vdGF0ZWQgd2l0aCBhIHJldHVybiB0eXBlLicpO1xuXG4gICAgY29uc3QgcmV0dXJuVHlwZSA9IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24oZGVjbGFyYXRpb24ucmV0dXJuVHlwZS50eXBlQW5ub3RhdGlvbik7XG5cbiAgICByZXR1cm4ge1xuICAgICAga2luZDogJ2Z1bmN0aW9uJyxcbiAgICAgIG5hbWU6IGRlY2xhcmF0aW9uLmlkLm5hbWUsXG4gICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUoZGVjbGFyYXRpb24pLFxuICAgICAgdHlwZToge1xuICAgICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUoZGVjbGFyYXRpb24pLFxuICAgICAgICBraW5kOiAnZnVuY3Rpb24nLFxuICAgICAgICBhcmd1bWVudFR5cGVzOiBkZWNsYXJhdGlvbi5wYXJhbXMubWFwKHBhcmFtID0+IHRoaXMuX3BhcnNlUGFyYW1ldGVyKHBhcmFtKSksXG4gICAgICAgIHJldHVyblR5cGUsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGFuIGV4cG9ydGVkIHR5cGUgYWxpYXMsIGFuZCByZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSBhbGlhcyxcbiAgICogYWxvbmcgd2l0aCB0aGUgdHlwZSB0aGF0IGl0IHJlZmVycyB0by5cbiAgICovXG4gIF9wYXJzZVR5cGVBbGlhcyhkZWNsYXJhdGlvbjogYW55KTogQWxpYXNEZWZpbml0aW9uIHtcbiAgICB0aGlzLl9hc3NlcnQoZGVjbGFyYXRpb24sIGRlY2xhcmF0aW9uLnR5cGUgPT09ICdUeXBlQWxpYXMnLFxuICAgICAgICAncGFyc2VUeXBlQWxpYXMgYWNjZXB0cyBhIFR5cGVBbGlhcyBub2RlLicpO1xuICAgIHJldHVybiB7XG4gICAgICBraW5kOiAnYWxpYXMnLFxuICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKGRlY2xhcmF0aW9uKSxcbiAgICAgIG5hbWU6IGRlY2xhcmF0aW9uLmlkLm5hbWUsXG4gICAgICBkZWZpbml0aW9uOiB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKGRlY2xhcmF0aW9uLnJpZ2h0KSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIGEgQ2xhc3NEZWNsYXJhdGlvbiBBU1QgTm9kZS5cbiAgICogQHBhcmFtIGRlY2xhcmF0aW9uIC0gVGhlIEFTVCBub2RlLlxuICAgKi9cbiAgX3BhcnNlQ2xhc3NEZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogT2JqZWN0KTogSW50ZXJmYWNlRGVmaW5pdGlvbiB7XG4gICAgY29uc3QgZGVmOiBJbnRlcmZhY2VEZWZpbml0aW9uID0ge1xuICAgICAga2luZDogJ2ludGVyZmFjZScsXG4gICAgICBuYW1lOiBkZWNsYXJhdGlvbi5pZC5uYW1lLFxuICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKGRlY2xhcmF0aW9uKSxcbiAgICAgIGNvbnN0cnVjdG9yQXJnczogW10sXG4gICAgICBzdGF0aWNNZXRob2RzOiBuZXcgTWFwKCksXG4gICAgICBpbnN0YW5jZU1ldGhvZHM6IG5ldyBNYXAoKSxcbiAgICB9O1xuXG4gICAgY29uc3QgY2xhc3NCb2R5ID0gZGVjbGFyYXRpb24uYm9keTtcbiAgICBmb3IgKGNvbnN0IG1ldGhvZCBvZiBjbGFzc0JvZHkuYm9keSkge1xuICAgICAgaWYgKG1ldGhvZC5raW5kID09PSAnY29uc3RydWN0b3InKSB7XG4gICAgICAgIGRlZi5jb25zdHJ1Y3RvckFyZ3MgPSBtZXRob2QudmFsdWUucGFyYW1zLm1hcChwYXJhbSA9PiB0aGlzLl9wYXJzZVBhcmFtZXRlcihwYXJhbSkpO1xuICAgICAgICBpZiAobWV0aG9kLnZhbHVlLnJldHVyblR5cGUpIHtcbiAgICAgICAgICB0aHJvdyB0aGlzLl9lcnJvcihtZXRob2QsIGBjb25zdHJ1Y3RvcnMgbWF5IG5vdCBoYXZlIHJldHVybiB0eXBlc2ApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWlzUHJpdmF0ZU1lbWJlck5hbWUobWV0aG9kLmtleS5uYW1lKSkge1xuICAgICAgICAgIGNvbnN0IHtuYW1lLCB0eXBlfSA9IHRoaXMuX3BhcnNlTWV0aG9kRGVmaW5pdGlvbihtZXRob2QpO1xuICAgICAgICAgIHRoaXMuX2RlZmluZU1ldGhvZChuYW1lLCB0eXBlLCBtZXRob2Quc3RhdGljID8gZGVmLnN0YXRpY01ldGhvZHMgOiBkZWYuaW5zdGFuY2VNZXRob2RzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmO1xuICB9XG5cbiAgX2RlZmluZU1ldGhvZChuYW1lOiBzdHJpbmcsIHR5cGU6IEZ1bmN0aW9uVHlwZSwgcGVlcnM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uVHlwZT4pOiB2b2lkIHtcbiAgICBpZiAocGVlcnMuaGFzKG5hbWUpKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lKHBldGVyaGFsKVxuICAgICAgY29uc3QgcmVsYXRlZExvY2F0aW9uOiBTb3VyY2VMb2NhdGlvbiA9IChwZWVycy5nZXQobmFtZSkubG9jYXRpb246IGFueSk7XG4gICAgICB0aHJvdyB0aGlzLl9lcnJvckxvY2F0aW9ucyhbKHR5cGUubG9jYXRpb246IGFueSksIHJlbGF0ZWRMb2NhdGlvbl0sXG4gICAgICAgIGBEdXBsaWNhdGUgbWV0aG9kIGRlZmluaXRpb24gJHtuYW1lfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICBwZWVycy5zZXQobmFtZSwgdHlwZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHBhcnNlcyBhbiBtZXRob2QgZGVmaW5pdGlvbiBpbiBhIGNsYXNzLlxuICAgKiBAcGFyYW0gZGVmaW50aW9uIC0gVGhlIE1ldGhvZERlZmluaXRpb24gQVNUIG5vZGUuXG4gICAqIEByZXR1cm5zIEEgcmVjb3JkIGNvbnRhaW5pbmcgdGhlIG5hbWUgb2YgdGhlIG1ldGhvZCwgYW5kIGEgRnVuY3Rpb25UeXBlIG9iamVjdFxuICAgKiAgIGVuY29kaW5nIHRoZSBhcmd1bWVudHMgYW5kIHJldHVybiB0eXBlIG9mIHRoZSBtZXRob2QuXG4gICAqL1xuICBfcGFyc2VNZXRob2REZWZpbml0aW9uKGRlZmluaXRpb246IGFueSk6IHtuYW1lOiBzdHJpbmcsIHR5cGU6IEZ1bmN0aW9uVHlwZX0ge1xuICAgIHRoaXMuX2Fzc2VydChkZWZpbml0aW9uLCBkZWZpbml0aW9uLnR5cGUgPT09ICdNZXRob2REZWZpbml0aW9uJyxcbiAgICAgICAgJ1RoaXMgaXMgYSBNZXRob2REZWZpbml0aW9uIG9iamVjdC4nKTtcbiAgICB0aGlzLl9hc3NlcnQoZGVmaW5pdGlvbiwgZGVmaW5pdGlvbi5rZXkgJiYgZGVmaW5pdGlvbi5rZXkudHlwZSA9PT0gJ0lkZW50aWZpZXInLFxuICAgICAgJ1RoaXMgbWV0aG9kIGRlZmludGlvbiBoYXMgYW4ga2V5IChhIG5hbWUpLicpO1xuICAgIHRoaXMuX2Fzc2VydChkZWZpbml0aW9uLCBkZWZpbml0aW9uLnZhbHVlLnJldHVyblR5cGUgJiZcbiAgICAgIGRlZmluaXRpb24udmFsdWUucmV0dXJuVHlwZS50eXBlID09PSAnVHlwZUFubm90YXRpb24nLFxuICAgICAgYCR7ZGVmaW5pdGlvbi5rZXkubmFtZX0gbWlzc2luZyBhIHJldHVybiB0eXBlIGFubm90YXRpb24uYCk7XG5cbiAgICBjb25zdCByZXR1cm5UeXBlID0gdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbihkZWZpbml0aW9uLnZhbHVlLnJldHVyblR5cGUudHlwZUFubm90YXRpb24pO1xuICAgIHJldHVybiB7XG4gICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUoZGVmaW5pdGlvbi5rZXkpLFxuICAgICAgbmFtZTogZGVmaW5pdGlvbi5rZXkubmFtZSxcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKGRlZmluaXRpb24udmFsdWUpLFxuICAgICAgICBraW5kOiAnZnVuY3Rpb24nLFxuICAgICAgICBhcmd1bWVudFR5cGVzOiBkZWZpbml0aW9uLnZhbHVlLnBhcmFtcy5tYXAocGFyYW0gPT4gdGhpcy5fcGFyc2VQYXJhbWV0ZXIocGFyYW0pKSxcbiAgICAgICAgcmV0dXJuVHlwZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIF9wYXJzZVBhcmFtZXRlcihwYXJhbTogT2JqZWN0KTogVHlwZSB7XG4gICAgaWYgKCFwYXJhbS50eXBlQW5ub3RhdGlvbikge1xuICAgICAgdGhyb3cgdGhpcy5fZXJyb3IocGFyYW0sIGBQYXJhbWV0ZXIgJHtwYXJhbS5uYW1lfSBkb2Vzbid0IGhhdmUgdHlwZSBhbm5vdGF0aW9uLmApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB0eXBlID0gdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbihwYXJhbS50eXBlQW5ub3RhdGlvbi50eXBlQW5ub3RhdGlvbik7XG4gICAgICBpZiAocGFyYW0ub3B0aW9uYWwgJiYgdHlwZS5raW5kICE9PSAnbnVsbGFibGUnKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKHBhcmFtKSxcbiAgICAgICAgICBraW5kOiAnbnVsbGFibGUnLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGEgRmxvdyB0eXBlIGFubm90YXRpb24gaW50byBvdXIgaW50ZXJtZWRpYXRlIGZvcm1hdC5cbiAgICogQHJldHVybnMge1R5cGV9IEEgcmVwcmVzZW50YXRpb24gb2YgdGhlIHR5cGUuXG4gICAqL1xuICBfcGFyc2VUeXBlQW5ub3RhdGlvbih0eXBlQW5ub3RhdGlvbjogT2JqZWN0KTogVHlwZSB7XG4gICAgY29uc3QgbG9jYXRpb24gPSB0aGlzLl9sb2NhdGlvbk9mTm9kZSh0eXBlQW5ub3RhdGlvbik7XG4gICAgc3dpdGNoICh0eXBlQW5ub3RhdGlvbi50eXBlKSB7XG4gICAgICBjYXNlICdBbnlUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdhbnknfTtcbiAgICAgIGNhc2UgJ01peGVkVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnbWl4ZWQnfTtcbiAgICAgIGNhc2UgJ1N0cmluZ1R5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ3N0cmluZyd9O1xuICAgICAgY2FzZSAnTnVtYmVyVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnbnVtYmVyJ307XG4gICAgICBjYXNlICdCb29sZWFuVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnYm9vbGVhbid9O1xuICAgICAgY2FzZSAnU3RyaW5nTGl0ZXJhbFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ3N0cmluZy1saXRlcmFsJywgdmFsdWU6IHR5cGVBbm5vdGF0aW9uLnZhbHVlfTtcbiAgICAgIGNhc2UgJ051bWJlckxpdGVyYWxUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdudW1iZXItbGl0ZXJhbCcsIHZhbHVlOiB0eXBlQW5ub3RhdGlvbi52YWx1ZX07XG4gICAgICBjYXNlICdCb29sZWFuTGl0ZXJhbFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ2Jvb2xlYW4tbGl0ZXJhbCcsIHZhbHVlOiB0eXBlQW5ub3RhdGlvbi52YWx1ZX07XG4gICAgICBjYXNlICdOdWxsYWJsZVR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnbnVsbGFibGUnLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24udHlwZUFubm90YXRpb24pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnT2JqZWN0VHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdvYmplY3QnLFxuICAgICAgICAgIGZpZWxkczogdHlwZUFubm90YXRpb24ucHJvcGVydGllcy5tYXAocHJvcCA9PiB7XG4gICAgICAgICAgICBpbnZhcmlhbnQocHJvcC50eXBlID09PSAnT2JqZWN0VHlwZVByb3BlcnR5Jyk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUocHJvcCksXG4gICAgICAgICAgICAgIG5hbWU6IHByb3Aua2V5Lm5hbWUsXG4gICAgICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24ocHJvcC52YWx1ZSksXG4gICAgICAgICAgICAgIG9wdGlvbmFsOiBwcm9wLm9wdGlvbmFsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ1ZvaWRUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICd2b2lkJ307XG4gICAgICBjYXNlICdUdXBsZVR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAndHVwbGUnLFxuICAgICAgICAgIHR5cGVzOiB0eXBlQW5ub3RhdGlvbi50eXBlcy5tYXAodGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbi5iaW5kKHRoaXMpKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ1VuaW9uVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICd1bmlvbicsXG4gICAgICAgICAgdHlwZXM6IHR5cGVBbm5vdGF0aW9uLnR5cGVzLm1hcCh0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uLmJpbmQodGhpcykpLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnR2VuZXJpY1R5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVBbm5vdGF0aW9uKHR5cGVBbm5vdGF0aW9uKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IHRoaXMuX2Vycm9yKHR5cGVBbm5vdGF0aW9uLCBgVW5rbm93biB0eXBlIGFubm90YXRpb24gJHt0eXBlQW5ub3RhdGlvbi50eXBlfS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGFubm90YXRpb25zIG9mIHR5cGUgJ0dlbmVyaWNUeXBlQW5ub3RhdGlvbicuIE1lYW50IHRvIGJlIGNhbGxlZFxuICAgKiBmcm9tIHBhcnNlVHlwZUFubm90YXRpb24uXG4gICAqL1xuICBfcGFyc2VHZW5lcmljVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24pOiBUeXBlIHtcbiAgICBpbnZhcmlhbnQodHlwZUFubm90YXRpb24udHlwZSA9PT0gJ0dlbmVyaWNUeXBlQW5ub3RhdGlvbicpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5fcGFyc2VUeXBlTmFtZSh0eXBlQW5ub3RhdGlvbi5pZCk7XG4gICAgY29uc3QgbG9jYXRpb246IExvY2F0aW9uID0gdGhpcy5fbG9jYXRpb25PZk5vZGUodHlwZUFubm90YXRpb24pO1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnYXJyYXknLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVQYXJhbWV0ZXJPZktub3duVHlwZShpZCwgdHlwZUFubm90YXRpb24pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnU2V0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnc2V0JyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQsIHR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ1Byb21pc2UnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdwcm9taXNlJyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQsIHR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ09ic2VydmFibGUnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdvYnNlcnZhYmxlJyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQsIHR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ01hcCc6XG4gICAgICAgIHRoaXMuX2Fzc2VydChcbiAgICAgICAgICB0eXBlQW5ub3RhdGlvbixcbiAgICAgICAgICB0eXBlQW5ub3RhdGlvbi50eXBlUGFyYW1ldGVycyAhPSBudWxsICYmXG4gICAgICAgICAgdHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zLmxlbmd0aCA9PT0gMixcbiAgICAgICAgICBgJHtpZH0gdGFrZXMgZXhhY3RseSB0d28gdHlwZSBwYXJhbWV0ZXJzLmApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdtYXAnLFxuICAgICAgICAgIGtleVR5cGU6IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zWzBdKSxcbiAgICAgICAgICB2YWx1ZVR5cGU6IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zWzFdKSxcbiAgICAgICAgfTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIE5hbWVkIHR5cGVzIGFyZSByZXByZXNlbnRlZCBhcyBHZW5lcmljIHR5cGVzIHdpdGggbm8gdHlwZSBwYXJhbWV0ZXJzLlxuICAgICAgICB0aGlzLl9hc3NlcnQodHlwZUFubm90YXRpb24sIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzID09IG51bGwsXG4gICAgICAgICAgICBgVW5rbm93biBnZW5lcmljIHR5cGUgJHtpZH0uYCk7XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICduYW1lZCcsIG5hbWU6IGlkfTtcbiAgICB9XG4gIH1cblxuICBfcGFyc2VHZW5lcmljVHlwZVBhcmFtZXRlck9mS25vd25UeXBlKGlkOiBzdHJpbmcsIHR5cGVBbm5vdGF0aW9uOiBPYmplY3QpOiBUeXBlIHtcbiAgICB0aGlzLl9hc3NlcnQoXG4gICAgICB0eXBlQW5ub3RhdGlvbixcbiAgICAgIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzICE9IG51bGwgJiZcbiAgICAgIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzLnBhcmFtcy5sZW5ndGggPT09IDEsXG4gICAgICBgJHtpZH0gaGFzIGV4YWN0bHkgb25lIHR5cGUgcGFyYW1ldGVyLmApO1xuICAgIHJldHVybiB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzLnBhcmFtc1swXSk7XG4gIH1cblxuICAvKipcbiAgICogVHlwZSBuYW1lcyBtYXkgZWl0aGVyIGJlIHNpbXBsZSBJZGVudGlmaWVycywgb3IgdGhleSBtYXkgYmVcbiAgICogcXVhbGlmaWVkIGlkZW50aWZpZXJzLlxuICAgKi9cbiAgX3BhcnNlVHlwZU5hbWUodHlwZTogT2JqZWN0KTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHR5cGUudHlwZSkge1xuICAgICAgY2FzZSAnSWRlbnRpZmllcic6XG4gICAgICAgIHJldHVybiB0eXBlLm5hbWU7XG4gICAgICBjYXNlICdRdWFsaWZpZWRUeXBlSWRlbnRpZmllcic6XG4gICAgICAgIGludmFyaWFudCh0eXBlLmlkLnR5cGUgPT09ICdJZGVudGlmaWVyJyk7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLl9wYXJzZVR5cGVOYW1lKHR5cGUucXVhbGlmaWNhdGlvbil9LiR7dHlwZS5pZC5uYW1lfWA7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyB0aGlzLl9lcnJvcih0eXBlLCBgRXhwZWN0ZWQgbmFtZWQgdHlwZS4gRm91bmQgJHt0eXBlLnR5cGV9YCk7XG4gICAgfVxuICB9XG59XG4iXX0=