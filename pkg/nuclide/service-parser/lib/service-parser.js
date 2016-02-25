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

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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O0FBQUEsQUFDSjs7QUFFRSxjQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsY0FBYyxJQUFJLElBQUksNEJBQ3RDLEVBQUUsT0FBSSxDQUFDO0FBQ25DLGlCQUFPLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQztBQUFBLE9BQzlDO0tBQ0Y7OztXQUVvQywrQ0FBQyxFQUFVLEVBQUUsY0FBc0IsRUFBUTtBQUM5RSxVQUFJLENBQUMsT0FBTyxDQUNWLGNBQWMsRUFDZCxjQUFjLENBQUMsY0FBYyxJQUFJLElBQUksSUFDckMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDOUMsRUFBRSxzQ0FBbUMsQ0FBQztBQUMzQyxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzNFOzs7Ozs7OztXQU1hLHdCQUFDLElBQVksRUFBVTtBQUNuQyxjQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2YsYUFBSyxZQUFZO0FBQ2YsaUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQztBQUFBLEFBQ25CLGFBQUsseUJBQXlCO0FBQzVCLG1DQUFVLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLGlCQUFVLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFHO0FBQUEsQUFDdEU7QUFDRSxnQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksa0NBQWdDLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQztBQUFBLE9BQ3RFO0tBQ0Y7OztTQWxZRyxhQUFhIiwiZmlsZSI6InNlcnZpY2UtcGFyc2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0ICogYXMgYmFiZWwgZnJvbSAnYmFiZWwtY29yZSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGVmaW5pdGlvbixcbiAgRnVuY3Rpb25EZWZpbml0aW9uLFxuICBBbGlhc0RlZmluaXRpb24sXG4gIERlZmluaXRpb25zLFxuICBGdW5jdGlvblR5cGUsXG4gIEludGVyZmFjZURlZmluaXRpb24sXG4gIFR5cGUsXG4gIExvY2F0aW9uLFxuICBTb3VyY2VMb2NhdGlvbixcbiAgQmFiZWwkTm9kZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7bG9jYXRpb25Ub1N0cmluZywgbmFtZWRCdWlsdGluVHlwZXN9IGZyb20gJy4vYnVpbHRpbi10eXBlcyc7XG5pbXBvcnQge3ZhbGlkYXRlRGVmaW5pdGlvbnN9IGZyb20gJy4vRGVmaW5pdGlvblZhbGlkYXRvcic7XG5cbmZ1bmN0aW9uIGlzUHJpdmF0ZU1lbWJlck5hbWUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lLnN0YXJ0c1dpdGgoJ18nKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIGRlZmluaXRpb24gZmlsZSwgcmV0dXJuaW5nIGFuIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbiB0aGF0IGhhcyBhbGwgb2YgdGhlXG4gKiBpbmZvcm1hdGlvbiByZXF1aXJlZCB0byBnZW5lcmF0ZSB0aGUgcmVtb3RlIHByb3h5LCBhcyB3ZWxsIGFzIG1hcnNoYWwgYW5kIHVubWFyc2hhbCB0aGVcbiAqIGRhdGEgb3ZlciBhIG5ldHdvcmsuXG4gKiBAcGFyYW0gc291cmNlIC0gVGhlIHN0cmluZyBzb3VyY2Ugb2YgdGhlIGRlZmluaXRpb24gZmlsZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcGFyc2VTZXJ2aWNlRGVmaW5pdGlvbihmaWxlTmFtZTogc3RyaW5nLCBzb3VyY2U6IHN0cmluZyk6IERlZmluaXRpb25zIHtcbiAgcmV0dXJuIG5ldyBTZXJ2aWNlUGFyc2VyKGZpbGVOYW1lKS5wYXJzZVNlcnZpY2Uoc291cmNlKTtcbn1cblxuY2xhc3MgU2VydmljZVBhcnNlciB7XG4gIF9maWxlTmFtZTogc3RyaW5nO1xuICBfZGVmczogTWFwPHN0cmluZywgRGVmaW5pdGlvbj47XG5cbiAgY29uc3RydWN0b3IoZmlsZU5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuX2ZpbGVOYW1lID0gZmlsZU5hbWU7XG4gICAgdGhpcy5fZGVmcyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIEFkZCBhbGwgYnVpbHRpbiB0eXBlc1xuICAgIGNvbnN0IGRlZmluZUJ1aWx0aW5UeXBlID0gbmFtZSA9PiB7XG4gICAgICB0aGlzLl9kZWZzLnNldChuYW1lLCB7XG4gICAgICAgIGtpbmQ6ICdhbGlhcycsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGxvY2F0aW9uOiB7IHR5cGU6ICdidWlsdGluJyB9LFxuICAgICAgfSk7XG4gICAgfTtcbiAgICBuYW1lZEJ1aWx0aW5UeXBlcy5mb3JFYWNoKGRlZmluZUJ1aWx0aW5UeXBlKTtcbiAgICAvLyBUT0RPOiBGaW5kIGEgYmV0dGVyIHBsYWNlIGZvciB0aGlzLlxuICAgIGRlZmluZUJ1aWx0aW5UeXBlKCdOdWNsaWRlVXJpJyk7XG4gIH1cblxuICBfbG9jYXRpb25PZk5vZGUobm9kZTogYW55KTogU291cmNlTG9jYXRpb24ge1xuICAgIHJldHVybiB7XG4gICAgICB0eXBlOiAnc291cmNlJyxcbiAgICAgIGZpbGVOYW1lOiB0aGlzLl9maWxlTmFtZSxcbiAgICAgIGxpbmU6IG5vZGUubG9jLnN0YXJ0LmxpbmUsXG4gICAgfTtcbiAgfVxuXG4gIF9ub2RlTG9jYXRpb25TdHJpbmcobm9kZTogQmFiZWwkTm9kZSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX2ZpbGVOYW1lfSgke25vZGUubG9jLnN0YXJ0LmxpbmV9KWA7XG4gIH1cblxuICBfZXJyb3JMb2NhdGlvbnMobG9jYXRpb25zOiBBcnJheTxMb2NhdGlvbj4sIG1lc3NhZ2U6IHN0cmluZyk6IEVycm9yIHtcbiAgICBsZXQgZnVsbE1lc3NhZ2UgPSBgJHtsb2NhdGlvblRvU3RyaW5nKGxvY2F0aW9uc1swXSl9OiR7bWVzc2FnZX1gO1xuICAgIGZ1bGxNZXNzYWdlID0gZnVsbE1lc3NhZ2UuY29uY2F0KFxuICAgICAgLi4uIChsb2NhdGlvbnMuc2xpY2UoMSkubWFwKGxvY2F0aW9uID0+XG4gICAgICAgIGBcXG4ke2xvY2F0aW9uVG9TdHJpbmcobG9jYXRpb24pfTogUmVsYXRlZCBsb2NhdGlvbmApKSk7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihmdWxsTWVzc2FnZSk7XG4gIH1cblxuICBfZXJyb3Iobm9kZTogQmFiZWwkTm9kZSwgbWVzc2FnZTogc3RyaW5nKTogRXJyb3Ige1xuICAgIHJldHVybiBuZXcgRXJyb3IoYCR7dGhpcy5fbm9kZUxvY2F0aW9uU3RyaW5nKG5vZGUpfToke21lc3NhZ2V9YCk7XG4gIH1cblxuICBfYXNzZXJ0KG5vZGUsIGNvbmRpdGlvbiwgbWVzc2FnZSk6IHZvaWQge1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICB0aHJvdyB0aGlzLl9lcnJvcihub2RlLCBtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBwYXJzZVNlcnZpY2Uoc291cmNlOiBzdHJpbmcpOiBEZWZpbml0aW9ucyB7XG4gICAgY29uc3QgcHJvZ3JhbSA9IGJhYmVsLnBhcnNlKHNvdXJjZSk7XG4gICAgaW52YXJpYW50KHByb2dyYW0gJiYgcHJvZ3JhbS50eXBlID09PSAnUHJvZ3JhbScsICdUaGUgcmVzdWx0IG9mIHBhcnNpbmcgaXMgYSBQcm9ncmFtIG5vZGUuJyk7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBub2RlIGluIHRoZSBwcm9ncmFtIGJvZHkuXG4gICAgZm9yIChjb25zdCBub2RlIG9mIHByb2dyYW0uYm9keSkge1xuICAgICAgLy8gV2UncmUgc3BlY2lmaWNhbGx5IGxvb2tpbmcgZm9yIGV4cG9ydHMuXG4gICAgICBpZiAobm9kZS50eXBlID09PSAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbicpIHtcbiAgICAgICAgY29uc3QgZGVjbGFyYXRpb24gPSBub2RlLmRlY2xhcmF0aW9uO1xuICAgICAgICBzd2l0Y2ggKGRlY2xhcmF0aW9uLnR5cGUpIHtcbiAgICAgICAgICAvLyBBbiBleHBvcnRlZCBmdW5jdGlvbiB0aGF0IGNhbiBiZSBkaXJlY3RseSBjYWxsZWQgYnkgYSBjbGllbnQuXG4gICAgICAgICAgY2FzZSAnRnVuY3Rpb25EZWNsYXJhdGlvbic6XG4gICAgICAgICAgICBpZiAoIWlzUHJpdmF0ZU1lbWJlck5hbWUoZGVjbGFyYXRpb24uaWQubmFtZSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5fYWRkKHRoaXMuX3BhcnNlRnVuY3Rpb25EZWNsYXJhdGlvbihkZWNsYXJhdGlvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gQW4gZXhwb3J0ZWQgdHlwZSBhbGlhcy5cbiAgICAgICAgICBjYXNlICdUeXBlQWxpYXMnOlxuICAgICAgICAgICAgaWYgKCFpc1ByaXZhdGVNZW1iZXJOYW1lKGRlY2xhcmF0aW9uLmlkLm5hbWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2FkZCh0aGlzLl9wYXJzZVR5cGVBbGlhcyhkZWNsYXJhdGlvbikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgLy8gUGFyc2UgY2xhc3NlcyBhcyByZW1vdGFibGUgaW50ZXJmYWNlcy5cbiAgICAgICAgICBjYXNlICdDbGFzc0RlY2xhcmF0aW9uJzpcbiAgICAgICAgICAgIHRoaXMuX2FkZCh0aGlzLl9wYXJzZUNsYXNzRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ1ZhcmlhYmxlRGVjbGFyYXRpb24nOlxuICAgICAgICAgICAgLy8gSWdub3JlIGV4cG9ydGVkIHZhcmlhYmxlcy5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIFVua25vd24gZXhwb3J0IGRlY2xhcmF0aW9uLlxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyB0aGlzLl9lcnJvcihcbiAgICAgICAgICAgICAgZGVjbGFyYXRpb24sXG4gICAgICAgICAgICAgIGBVbmtub3duIGRlY2xhcmF0aW9uIHR5cGUgJHtkZWNsYXJhdGlvbi50eXBlfSBpbiBkZWZpbml0aW9uIGJvZHkuYCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElnbm9yZSBhbGwgbm9uLWV4cG9ydCB0b3AgbGV2ZWwgcHJvZ3JhbSBlbGVtZW50cyBpbmNsdWRpbmc6XG4gICAgICAgIC8vIGltcG9ydHMsIHN0YXRlbWVudHMsIHZhcmlhYmxlIGRlY2xhcmF0aW9ucywgZnVuY3Rpb24gZGVjbGFyYXRpb25zXG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsaWRhdGVEZWZpbml0aW9ucyh0aGlzLl9kZWZzKTtcblxuICAgIHJldHVybiB0aGlzLl9kZWZzO1xuICB9XG5cbiAgX2FkZChkZWZpbml0aW9uOiBEZWZpbml0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2RlZnMuaGFzKGRlZmluaXRpb24ubmFtZSkpIHtcbiAgICAgIGNvbnN0IGV4aXN0aW5nRGVmID0gdGhpcy5fZGVmcy5nZXQoZGVmaW5pdGlvbi5uYW1lKTtcbiAgICAgIGludmFyaWFudChleGlzdGluZ0RlZiAhPSBudWxsKTtcbiAgICAgIHRocm93IHRoaXMuX2Vycm9yTG9jYXRpb25zKFtkZWZpbml0aW9uLmxvY2F0aW9uLCBleGlzdGluZ0RlZi5sb2NhdGlvbl0sXG4gICAgICAgIGBEdXBsaWNhdGUgZGVmaW5pdGlvbiBmb3IgJHtkZWZpbml0aW9uLm5hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RlZnMuc2V0KGRlZmluaXRpb24ubmFtZSwgZGVmaW5pdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHBhcnNlcyBhbiBleHBvcnRlZCBmdW5jdGlvbiBkZWNsYXJhdGlvbiwgYW5kIHJldHVybnMgdGhlIGZ1bmN0aW9uIG5hbWUsXG4gICAqIGFsb25nIHdpdGggYSBGdW5jdGlvblR5cGUgb2JqZWN0IHRoYXQgZW5jb2RlcyB0aGUgYXJndW1lbnQgYW5kIHJldHVybiB0eXBlcyBvZiB0aGUgZnVuY3Rpb24uXG4gICAqL1xuICBfcGFyc2VGdW5jdGlvbkRlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiBhbnkpOiBGdW5jdGlvbkRlZmluaXRpb24ge1xuICAgIHRoaXMuX2Fzc2VydChcbiAgICAgIGRlY2xhcmF0aW9uLFxuICAgICAgZGVjbGFyYXRpb24uaWQgJiYgZGVjbGFyYXRpb24uaWQudHlwZSA9PT0gJ0lkZW50aWZpZXInLFxuICAgICAgJ1JlbW90ZSBmdW5jdGlvbiBkZWNsYXJhdGlvbnMgbXVzdCBoYXZlIGFuIGlkZW50aWZpZXIuJyk7XG4gICAgdGhpcy5fYXNzZXJ0KFxuICAgICAgZGVjbGFyYXRpb24sXG4gICAgICBkZWNsYXJhdGlvbi5yZXR1cm5UeXBlICE9IG51bGwgJiZcbiAgICAgIGRlY2xhcmF0aW9uLnJldHVyblR5cGUudHlwZSA9PT0gJ1R5cGVBbm5vdGF0aW9uJyxcbiAgICAgICdSZW1vdGUgZnVuY3Rpb25zIG11c3QgYmUgYW5ub3RhdGVkIHdpdGggYSByZXR1cm4gdHlwZS4nKTtcblxuICAgIGNvbnN0IHJldHVyblR5cGUgPSB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKGRlY2xhcmF0aW9uLnJldHVyblR5cGUudHlwZUFubm90YXRpb24pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6ICdmdW5jdGlvbicsXG4gICAgICBuYW1lOiBkZWNsYXJhdGlvbi5pZC5uYW1lLFxuICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKGRlY2xhcmF0aW9uKSxcbiAgICAgIHR5cGU6IHtcbiAgICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKGRlY2xhcmF0aW9uKSxcbiAgICAgICAga2luZDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgYXJndW1lbnRUeXBlczogZGVjbGFyYXRpb24ucGFyYW1zLm1hcChwYXJhbSA9PiB0aGlzLl9wYXJzZVBhcmFtZXRlcihwYXJhbSkpLFxuICAgICAgICByZXR1cm5UeXBlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHBhcnNlcyBhbiBleHBvcnRlZCB0eXBlIGFsaWFzLCBhbmQgcmV0dXJucyB0aGUgbmFtZSBvZiB0aGUgYWxpYXMsXG4gICAqIGFsb25nIHdpdGggdGhlIHR5cGUgdGhhdCBpdCByZWZlcnMgdG8uXG4gICAqL1xuICBfcGFyc2VUeXBlQWxpYXMoZGVjbGFyYXRpb246IGFueSk6IEFsaWFzRGVmaW5pdGlvbiB7XG4gICAgdGhpcy5fYXNzZXJ0KGRlY2xhcmF0aW9uLCBkZWNsYXJhdGlvbi50eXBlID09PSAnVHlwZUFsaWFzJyxcbiAgICAgICAgJ3BhcnNlVHlwZUFsaWFzIGFjY2VwdHMgYSBUeXBlQWxpYXMgbm9kZS4nKTtcbiAgICByZXR1cm4ge1xuICAgICAga2luZDogJ2FsaWFzJyxcbiAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShkZWNsYXJhdGlvbiksXG4gICAgICBuYW1lOiBkZWNsYXJhdGlvbi5pZC5uYW1lLFxuICAgICAgZGVmaW5pdGlvbjogdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbihkZWNsYXJhdGlvbi5yaWdodCksXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBhIENsYXNzRGVjbGFyYXRpb24gQVNUIE5vZGUuXG4gICAqIEBwYXJhbSBkZWNsYXJhdGlvbiAtIFRoZSBBU1Qgbm9kZS5cbiAgICovXG4gIF9wYXJzZUNsYXNzRGVjbGFyYXRpb24oZGVjbGFyYXRpb246IE9iamVjdCk6IEludGVyZmFjZURlZmluaXRpb24ge1xuICAgIGNvbnN0IGRlZjogSW50ZXJmYWNlRGVmaW5pdGlvbiA9IHtcbiAgICAgIGtpbmQ6ICdpbnRlcmZhY2UnLFxuICAgICAgbmFtZTogZGVjbGFyYXRpb24uaWQubmFtZSxcbiAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShkZWNsYXJhdGlvbiksXG4gICAgICBjb25zdHJ1Y3RvckFyZ3M6IFtdLFxuICAgICAgc3RhdGljTWV0aG9kczogbmV3IE1hcCgpLFxuICAgICAgaW5zdGFuY2VNZXRob2RzOiBuZXcgTWFwKCksXG4gICAgfTtcblxuICAgIGNvbnN0IGNsYXNzQm9keSA9IGRlY2xhcmF0aW9uLmJvZHk7XG4gICAgZm9yIChjb25zdCBtZXRob2Qgb2YgY2xhc3NCb2R5LmJvZHkpIHtcbiAgICAgIGlmIChtZXRob2Qua2luZCA9PT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgICBkZWYuY29uc3RydWN0b3JBcmdzID0gbWV0aG9kLnZhbHVlLnBhcmFtcy5tYXAocGFyYW0gPT4gdGhpcy5fcGFyc2VQYXJhbWV0ZXIocGFyYW0pKTtcbiAgICAgICAgaWYgKG1ldGhvZC52YWx1ZS5yZXR1cm5UeXBlKSB7XG4gICAgICAgICAgdGhyb3cgdGhpcy5fZXJyb3IobWV0aG9kLCBgY29uc3RydWN0b3JzIG1heSBub3QgaGF2ZSByZXR1cm4gdHlwZXNgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCFpc1ByaXZhdGVNZW1iZXJOYW1lKG1ldGhvZC5rZXkubmFtZSkpIHtcbiAgICAgICAgICBjb25zdCB7bmFtZSwgdHlwZX0gPSB0aGlzLl9wYXJzZU1ldGhvZERlZmluaXRpb24obWV0aG9kKTtcbiAgICAgICAgICB0aGlzLl9kZWZpbmVNZXRob2QobmFtZSwgdHlwZSwgbWV0aG9kLnN0YXRpYyA/IGRlZi5zdGF0aWNNZXRob2RzIDogZGVmLmluc3RhbmNlTWV0aG9kcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZjtcbiAgfVxuXG4gIF9kZWZpbmVNZXRob2QobmFtZTogc3RyaW5nLCB0eXBlOiBGdW5jdGlvblR5cGUsIHBlZXJzOiBNYXA8c3RyaW5nLCBGdW5jdGlvblR5cGU+KTogdm9pZCB7XG4gICAgaWYgKHBlZXJzLmhhcyhuYW1lKSkge1xuICAgICAgLy8gJEZsb3dGaXhNZShwZXRlcmhhbClcbiAgICAgIGNvbnN0IHJlbGF0ZWRMb2NhdGlvbjogU291cmNlTG9jYXRpb24gPSAocGVlcnMuZ2V0KG5hbWUpLmxvY2F0aW9uOiBhbnkpO1xuICAgICAgdGhyb3cgdGhpcy5fZXJyb3JMb2NhdGlvbnMoWyh0eXBlLmxvY2F0aW9uOiBhbnkpLCByZWxhdGVkTG9jYXRpb25dLFxuICAgICAgICBgRHVwbGljYXRlIG1ldGhvZCBkZWZpbml0aW9uICR7bmFtZX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGVlcnMuc2V0KG5hbWUsIHR5cGUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBwYXJzZXMgYW4gbWV0aG9kIGRlZmluaXRpb24gaW4gYSBjbGFzcy5cbiAgICogQHBhcmFtIGRlZmludGlvbiAtIFRoZSBNZXRob2REZWZpbml0aW9uIEFTVCBub2RlLlxuICAgKiBAcmV0dXJucyBBIHJlY29yZCBjb250YWluaW5nIHRoZSBuYW1lIG9mIHRoZSBtZXRob2QsIGFuZCBhIEZ1bmN0aW9uVHlwZSBvYmplY3RcbiAgICogICBlbmNvZGluZyB0aGUgYXJndW1lbnRzIGFuZCByZXR1cm4gdHlwZSBvZiB0aGUgbWV0aG9kLlxuICAgKi9cbiAgX3BhcnNlTWV0aG9kRGVmaW5pdGlvbihkZWZpbml0aW9uOiBhbnkpOiB7bmFtZTogc3RyaW5nOyB0eXBlOiBGdW5jdGlvblR5cGV9IHtcbiAgICB0aGlzLl9hc3NlcnQoZGVmaW5pdGlvbiwgZGVmaW5pdGlvbi50eXBlID09PSAnTWV0aG9kRGVmaW5pdGlvbicsXG4gICAgICAgICdUaGlzIGlzIGEgTWV0aG9kRGVmaW5pdGlvbiBvYmplY3QuJyk7XG4gICAgdGhpcy5fYXNzZXJ0KGRlZmluaXRpb24sIGRlZmluaXRpb24ua2V5ICYmIGRlZmluaXRpb24ua2V5LnR5cGUgPT09ICdJZGVudGlmaWVyJyxcbiAgICAgICdUaGlzIG1ldGhvZCBkZWZpbnRpb24gaGFzIGFuIGtleSAoYSBuYW1lKS4nKTtcbiAgICB0aGlzLl9hc3NlcnQoZGVmaW5pdGlvbiwgZGVmaW5pdGlvbi52YWx1ZS5yZXR1cm5UeXBlICYmXG4gICAgICBkZWZpbml0aW9uLnZhbHVlLnJldHVyblR5cGUudHlwZSA9PT0gJ1R5cGVBbm5vdGF0aW9uJyxcbiAgICAgIGAke2RlZmluaXRpb24ua2V5Lm5hbWV9IG1pc3NpbmcgYSByZXR1cm4gdHlwZSBhbm5vdGF0aW9uLmApO1xuXG4gICAgY29uc3QgcmV0dXJuVHlwZSA9IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24oZGVmaW5pdGlvbi52YWx1ZS5yZXR1cm5UeXBlLnR5cGVBbm5vdGF0aW9uKTtcbiAgICByZXR1cm4ge1xuICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKGRlZmluaXRpb24ua2V5KSxcbiAgICAgIG5hbWU6IGRlZmluaXRpb24ua2V5Lm5hbWUsXG4gICAgICB0eXBlOiB7XG4gICAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShkZWZpbml0aW9uLnZhbHVlKSxcbiAgICAgICAga2luZDogJ2Z1bmN0aW9uJyxcbiAgICAgICAgYXJndW1lbnRUeXBlczogZGVmaW5pdGlvbi52YWx1ZS5wYXJhbXMubWFwKHBhcmFtID0+IHRoaXMuX3BhcnNlUGFyYW1ldGVyKHBhcmFtKSksXG4gICAgICAgIHJldHVyblR5cGUsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBfcGFyc2VQYXJhbWV0ZXIocGFyYW06IE9iamVjdCk6IFR5cGUge1xuICAgIGlmICghcGFyYW0udHlwZUFubm90YXRpb24pIHtcbiAgICAgIHRocm93IHRoaXMuX2Vycm9yKHBhcmFtLCBgUGFyYW1ldGVyICR7cGFyYW0ubmFtZX0gZG9lc24ndCBoYXZlIHR5cGUgYW5ub3RhdGlvbi5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgdHlwZSA9IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24ocGFyYW0udHlwZUFubm90YXRpb24udHlwZUFubm90YXRpb24pO1xuICAgICAgaWYgKHBhcmFtLm9wdGlvbmFsICYmIHR5cGUua2luZCAhPT0gJ251bGxhYmxlJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShwYXJhbSksXG4gICAgICAgICAga2luZDogJ251bGxhYmxlJyxcbiAgICAgICAgICB0eXBlLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHR5cGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHBhcnNlcyBhIEZsb3cgdHlwZSBhbm5vdGF0aW9uIGludG8gb3VyIGludGVybWVkaWF0ZSBmb3JtYXQuXG4gICAqIEByZXR1cm5zIHtUeXBlfSBBIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0eXBlLlxuICAgKi9cbiAgX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb246IE9iamVjdCk6IFR5cGUge1xuICAgIGNvbnN0IGxvY2F0aW9uID0gdGhpcy5fbG9jYXRpb25PZk5vZGUodHlwZUFubm90YXRpb24pO1xuICAgIHN3aXRjaCAodHlwZUFubm90YXRpb24udHlwZSkge1xuICAgICAgY2FzZSAnQW55VHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnYW55J307XG4gICAgICBjYXNlICdNaXhlZFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ21peGVkJ307XG4gICAgICBjYXNlICdTdHJpbmdUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdzdHJpbmcnfTtcbiAgICAgIGNhc2UgJ051bWJlclR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ251bWJlcid9O1xuICAgICAgY2FzZSAnQm9vbGVhblR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ2Jvb2xlYW4nfTtcbiAgICAgIGNhc2UgJ1N0cmluZ0xpdGVyYWxUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdzdHJpbmctbGl0ZXJhbCcsIHZhbHVlOiB0eXBlQW5ub3RhdGlvbi52YWx1ZX07XG4gICAgICBjYXNlICdOdW1iZXJMaXRlcmFsVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnbnVtYmVyLWxpdGVyYWwnLCB2YWx1ZTogdHlwZUFubm90YXRpb24udmFsdWV9O1xuICAgICAgY2FzZSAnQm9vbGVhbkxpdGVyYWxUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdib29sZWFuLWxpdGVyYWwnLCB2YWx1ZTogdHlwZUFubm90YXRpb24udmFsdWV9O1xuICAgICAgY2FzZSAnTnVsbGFibGVUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ251bGxhYmxlJyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKHR5cGVBbm5vdGF0aW9uLnR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ09iamVjdFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnb2JqZWN0JyxcbiAgICAgICAgICBmaWVsZHM6IHR5cGVBbm5vdGF0aW9uLnByb3BlcnRpZXMubWFwKHByb3AgPT4ge1xuICAgICAgICAgICAgaW52YXJpYW50KHByb3AudHlwZSA9PT0gJ09iamVjdFR5cGVQcm9wZXJ0eScpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgbG9jYXRpb246IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKHByb3ApLFxuICAgICAgICAgICAgICBuYW1lOiBwcm9wLmtleS5uYW1lLFxuICAgICAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKHByb3AudmFsdWUpLFxuICAgICAgICAgICAgICBvcHRpb25hbDogcHJvcC5vcHRpb25hbCxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdWb2lkVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAndm9pZCd9O1xuICAgICAgY2FzZSAnVHVwbGVUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ3R1cGxlJyxcbiAgICAgICAgICB0eXBlczogdHlwZUFubm90YXRpb24udHlwZXMubWFwKHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24uYmluZCh0aGlzKSksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdVbmlvblR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAndW5pb24nLFxuICAgICAgICAgIHR5cGVzOiB0eXBlQW5ub3RhdGlvbi50eXBlcy5tYXAodGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbi5iaW5kKHRoaXMpKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ0ludGVyc2VjdGlvblR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnaW50ZXJzZWN0aW9uJyxcbiAgICAgICAgICB0eXBlczogdHlwZUFubm90YXRpb24udHlwZXMubWFwKHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24uYmluZCh0aGlzKSksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdHZW5lcmljVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VHZW5lcmljVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24pO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgdGhpcy5fZXJyb3IodHlwZUFubm90YXRpb24sIGBVbmtub3duIHR5cGUgYW5ub3RhdGlvbiAke3R5cGVBbm5vdGF0aW9uLnR5cGV9LmApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBwYXJzZXMgYW5ub3RhdGlvbnMgb2YgdHlwZSAnR2VuZXJpY1R5cGVBbm5vdGF0aW9uJy4gTWVhbnQgdG8gYmUgY2FsbGVkXG4gICAqIGZyb20gcGFyc2VUeXBlQW5ub3RhdGlvbi5cbiAgICovXG4gIF9wYXJzZUdlbmVyaWNUeXBlQW5ub3RhdGlvbih0eXBlQW5ub3RhdGlvbik6IFR5cGUge1xuICAgIGludmFyaWFudCh0eXBlQW5ub3RhdGlvbi50eXBlID09PSAnR2VuZXJpY1R5cGVBbm5vdGF0aW9uJyk7XG4gICAgY29uc3QgaWQgPSB0aGlzLl9wYXJzZVR5cGVOYW1lKHR5cGVBbm5vdGF0aW9uLmlkKTtcbiAgICBjb25zdCBsb2NhdGlvbjogTG9jYXRpb24gPSB0aGlzLl9sb2NhdGlvbk9mTm9kZSh0eXBlQW5ub3RhdGlvbik7XG4gICAgc3dpdGNoIChpZCkge1xuICAgICAgY2FzZSAnQXJyYXknOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdhcnJheScsXG4gICAgICAgICAgdHlwZTogdGhpcy5fcGFyc2VHZW5lcmljVHlwZVBhcmFtZXRlck9mS25vd25UeXBlKGlkLCB0eXBlQW5ub3RhdGlvbiksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdTZXQnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdzZXQnLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVQYXJhbWV0ZXJPZktub3duVHlwZShpZCwgdHlwZUFubm90YXRpb24pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnUHJvbWlzZSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ3Byb21pc2UnLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVQYXJhbWV0ZXJPZktub3duVHlwZShpZCwgdHlwZUFubm90YXRpb24pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnT2JzZXJ2YWJsZSc6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ29ic2VydmFibGUnLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVQYXJhbWV0ZXJPZktub3duVHlwZShpZCwgdHlwZUFubm90YXRpb24pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnTWFwJzpcbiAgICAgICAgdGhpcy5fYXNzZXJ0KFxuICAgICAgICAgIHR5cGVBbm5vdGF0aW9uLFxuICAgICAgICAgIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzICE9IG51bGwgJiZcbiAgICAgICAgICB0eXBlQW5ub3RhdGlvbi50eXBlUGFyYW1ldGVycy5wYXJhbXMubGVuZ3RoID09PSAyLFxuICAgICAgICAgIGAke2lkfSB0YWtlcyBleGFjdGx5IHR3byB0eXBlIHBhcmFtZXRlcnMuYCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ21hcCcsXG4gICAgICAgICAga2V5VHlwZTogdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbih0eXBlQW5ub3RhdGlvbi50eXBlUGFyYW1ldGVycy5wYXJhbXNbMF0pLFxuICAgICAgICAgIHZhbHVlVHlwZTogdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbih0eXBlQW5ub3RhdGlvbi50eXBlUGFyYW1ldGVycy5wYXJhbXNbMV0pLFxuICAgICAgICB9O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gTmFtZWQgdHlwZXMgYXJlIHJlcHJlc2VudGVkIGFzIEdlbmVyaWMgdHlwZXMgd2l0aCBubyB0eXBlIHBhcmFtZXRlcnMuXG4gICAgICAgIHRoaXMuX2Fzc2VydCh0eXBlQW5ub3RhdGlvbiwgdHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMgPT0gbnVsbCxcbiAgICAgICAgICAgIGBVbmtub3duIGdlbmVyaWMgdHlwZSAke2lkfS5gKTtcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ25hbWVkJywgbmFtZTogaWR9O1xuICAgIH1cbiAgfVxuXG4gIF9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQ6IHN0cmluZywgdHlwZUFubm90YXRpb246IE9iamVjdCk6IFR5cGUge1xuICAgIHRoaXMuX2Fzc2VydChcbiAgICAgIHR5cGVBbm5vdGF0aW9uLFxuICAgICAgdHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMgIT0gbnVsbCAmJlxuICAgICAgdHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zLmxlbmd0aCA9PT0gMSxcbiAgICAgIGAke2lkfSBoYXMgZXhhY3RseSBvbmUgdHlwZSBwYXJhbWV0ZXIuYCk7XG4gICAgcmV0dXJuIHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zWzBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUeXBlIG5hbWVzIG1heSBlaXRoZXIgYmUgc2ltcGxlIElkZW50aWZpZXJzLCBvciB0aGV5IG1heSBiZVxuICAgKiBxdWFsaWZpZWQgaWRlbnRpZmllcnMuXG4gICAqL1xuICBfcGFyc2VUeXBlTmFtZSh0eXBlOiBPYmplY3QpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAodHlwZS50eXBlKSB7XG4gICAgICBjYXNlICdJZGVudGlmaWVyJzpcbiAgICAgICAgcmV0dXJuIHR5cGUubmFtZTtcbiAgICAgIGNhc2UgJ1F1YWxpZmllZFR5cGVJZGVudGlmaWVyJzpcbiAgICAgICAgaW52YXJpYW50KHR5cGUuaWQudHlwZSA9PT0gJ0lkZW50aWZpZXInKTtcbiAgICAgICAgcmV0dXJuIGAke3RoaXMuX3BhcnNlVHlwZU5hbWUodHlwZS5xdWFsaWZpY2F0aW9uKX0uJHt0eXBlLmlkLm5hbWV9YDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IHRoaXMuX2Vycm9yKHR5cGUsIGBFeHBlY3RlZCBuYW1lZCB0eXBlLiBGb3VuZCAke3R5cGUudHlwZX1gKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==