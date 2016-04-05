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
//# sourceMappingURL=data:application/json;base64,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RSxjQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLENBQUMsY0FBYyxJQUFJLElBQUksNEJBQ3RDLEVBQUUsT0FBSSxDQUFDO0FBQ25DLGlCQUFPLEVBQUMsUUFBUSxFQUFSLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUMsQ0FBQztBQUFBLE9BQzlDO0tBQ0Y7OztXQUVvQywrQ0FBQyxFQUFVLEVBQUUsY0FBc0IsRUFBUTtBQUM5RSxVQUFJLENBQUMsT0FBTyxDQUNWLGNBQWMsRUFDZCxjQUFjLENBQUMsY0FBYyxJQUFJLElBQUksSUFDckMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDOUMsRUFBRSxzQ0FBbUMsQ0FBQztBQUMzQyxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzNFOzs7Ozs7OztXQU1hLHdCQUFDLElBQVksRUFBVTtBQUNuQyxjQUFRLElBQUksQ0FBQyxJQUFJO0FBQ2YsYUFBSyxZQUFZO0FBQ2YsaUJBQU8sSUFBSSxDQUFDLElBQUksQ0FBQztBQUFBLEFBQ25CLGFBQUsseUJBQXlCO0FBQzVCLG1DQUFVLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO0FBQ3pDLGlCQUFVLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFHO0FBQUEsQUFDdEU7QUFDRSxnQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksa0NBQWdDLElBQUksQ0FBQyxJQUFJLENBQUcsQ0FBQztBQUFBLE9BQ3RFO0tBQ0Y7OztTQWxZRyxhQUFhIiwiZmlsZSI6InNlcnZpY2UtcGFyc2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0ICogYXMgYmFiZWwgZnJvbSAnYmFiZWwtY29yZSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGVmaW5pdGlvbixcbiAgRnVuY3Rpb25EZWZpbml0aW9uLFxuICBBbGlhc0RlZmluaXRpb24sXG4gIERlZmluaXRpb25zLFxuICBGdW5jdGlvblR5cGUsXG4gIEludGVyZmFjZURlZmluaXRpb24sXG4gIFR5cGUsXG4gIExvY2F0aW9uLFxuICBTb3VyY2VMb2NhdGlvbixcbiAgQmFiZWwkTm9kZSxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbmltcG9ydCB7bG9jYXRpb25Ub1N0cmluZywgbmFtZWRCdWlsdGluVHlwZXN9IGZyb20gJy4vYnVpbHRpbi10eXBlcyc7XG5pbXBvcnQge3ZhbGlkYXRlRGVmaW5pdGlvbnN9IGZyb20gJy4vRGVmaW5pdGlvblZhbGlkYXRvcic7XG5cbmZ1bmN0aW9uIGlzUHJpdmF0ZU1lbWJlck5hbWUobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBuYW1lLnN0YXJ0c1dpdGgoJ18nKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBhIGRlZmluaXRpb24gZmlsZSwgcmV0dXJuaW5nIGFuIGludGVybWVkaWF0ZSByZXByZXNlbnRhdGlvbiB0aGF0IGhhcyBhbGwgb2YgdGhlXG4gKiBpbmZvcm1hdGlvbiByZXF1aXJlZCB0byBnZW5lcmF0ZSB0aGUgcmVtb3RlIHByb3h5LCBhcyB3ZWxsIGFzIG1hcnNoYWwgYW5kIHVubWFyc2hhbCB0aGVcbiAqIGRhdGEgb3ZlciBhIG5ldHdvcmsuXG4gKiBAcGFyYW0gc291cmNlIC0gVGhlIHN0cmluZyBzb3VyY2Ugb2YgdGhlIGRlZmluaXRpb24gZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2VydmljZURlZmluaXRpb24oZmlsZU5hbWU6IHN0cmluZywgc291cmNlOiBzdHJpbmcpOiBEZWZpbml0aW9ucyB7XG4gIHJldHVybiBuZXcgU2VydmljZVBhcnNlcihmaWxlTmFtZSkucGFyc2VTZXJ2aWNlKHNvdXJjZSk7XG59XG5cbmNsYXNzIFNlcnZpY2VQYXJzZXIge1xuICBfZmlsZU5hbWU6IHN0cmluZztcbiAgX2RlZnM6IE1hcDxzdHJpbmcsIERlZmluaXRpb24+O1xuXG4gIGNvbnN0cnVjdG9yKGZpbGVOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9maWxlTmFtZSA9IGZpbGVOYW1lO1xuICAgIHRoaXMuX2RlZnMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBBZGQgYWxsIGJ1aWx0aW4gdHlwZXNcbiAgICBjb25zdCBkZWZpbmVCdWlsdGluVHlwZSA9IG5hbWUgPT4ge1xuICAgICAgdGhpcy5fZGVmcy5zZXQobmFtZSwge1xuICAgICAgICBraW5kOiAnYWxpYXMnLFxuICAgICAgICBuYW1lLFxuICAgICAgICBsb2NhdGlvbjogeyB0eXBlOiAnYnVpbHRpbicgfSxcbiAgICAgIH0pO1xuICAgIH07XG4gICAgbmFtZWRCdWlsdGluVHlwZXMuZm9yRWFjaChkZWZpbmVCdWlsdGluVHlwZSk7XG4gICAgLy8gVE9ETzogRmluZCBhIGJldHRlciBwbGFjZSBmb3IgdGhpcy5cbiAgICBkZWZpbmVCdWlsdGluVHlwZSgnTnVjbGlkZVVyaScpO1xuICB9XG5cbiAgX2xvY2F0aW9uT2ZOb2RlKG5vZGU6IGFueSk6IFNvdXJjZUxvY2F0aW9uIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHlwZTogJ3NvdXJjZScsXG4gICAgICBmaWxlTmFtZTogdGhpcy5fZmlsZU5hbWUsXG4gICAgICBsaW5lOiBub2RlLmxvYy5zdGFydC5saW5lLFxuICAgIH07XG4gIH1cblxuICBfbm9kZUxvY2F0aW9uU3RyaW5nKG5vZGU6IEJhYmVsJE5vZGUpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLl9maWxlTmFtZX0oJHtub2RlLmxvYy5zdGFydC5saW5lfSlgO1xuICB9XG5cbiAgX2Vycm9yTG9jYXRpb25zKGxvY2F0aW9uczogQXJyYXk8TG9jYXRpb24+LCBtZXNzYWdlOiBzdHJpbmcpOiBFcnJvciB7XG4gICAgbGV0IGZ1bGxNZXNzYWdlID0gYCR7bG9jYXRpb25Ub1N0cmluZyhsb2NhdGlvbnNbMF0pfToke21lc3NhZ2V9YDtcbiAgICBmdWxsTWVzc2FnZSA9IGZ1bGxNZXNzYWdlLmNvbmNhdChcbiAgICAgIC4uLiAobG9jYXRpb25zLnNsaWNlKDEpLm1hcChsb2NhdGlvbiA9PlxuICAgICAgICBgXFxuJHtsb2NhdGlvblRvU3RyaW5nKGxvY2F0aW9uKX06IFJlbGF0ZWQgbG9jYXRpb25gKSkpO1xuICAgIHJldHVybiBuZXcgRXJyb3IoZnVsbE1lc3NhZ2UpO1xuICB9XG5cbiAgX2Vycm9yKG5vZGU6IEJhYmVsJE5vZGUsIG1lc3NhZ2U6IHN0cmluZyk6IEVycm9yIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKGAke3RoaXMuX25vZGVMb2NhdGlvblN0cmluZyhub2RlKX06JHttZXNzYWdlfWApO1xuICB9XG5cbiAgX2Fzc2VydChub2RlLCBjb25kaXRpb24sIG1lc3NhZ2UpOiB2b2lkIHtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgdGhyb3cgdGhpcy5fZXJyb3Iobm9kZSwgbWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgcGFyc2VTZXJ2aWNlKHNvdXJjZTogc3RyaW5nKTogRGVmaW5pdGlvbnMge1xuICAgIGNvbnN0IHByb2dyYW0gPSBiYWJlbC5wYXJzZShzb3VyY2UpO1xuICAgIGludmFyaWFudChwcm9ncmFtICYmIHByb2dyYW0udHlwZSA9PT0gJ1Byb2dyYW0nLCAnVGhlIHJlc3VsdCBvZiBwYXJzaW5nIGlzIGEgUHJvZ3JhbSBub2RlLicpO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggbm9kZSBpbiB0aGUgcHJvZ3JhbSBib2R5LlxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBwcm9ncmFtLmJvZHkpIHtcbiAgICAgIC8vIFdlJ3JlIHNwZWNpZmljYWxseSBsb29raW5nIGZvciBleHBvcnRzLlxuICAgICAgaWYgKG5vZGUudHlwZSA9PT0gJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nKSB7XG4gICAgICAgIGNvbnN0IGRlY2xhcmF0aW9uID0gbm9kZS5kZWNsYXJhdGlvbjtcbiAgICAgICAgc3dpdGNoIChkZWNsYXJhdGlvbi50eXBlKSB7XG4gICAgICAgICAgLy8gQW4gZXhwb3J0ZWQgZnVuY3Rpb24gdGhhdCBjYW4gYmUgZGlyZWN0bHkgY2FsbGVkIGJ5IGEgY2xpZW50LlxuICAgICAgICAgIGNhc2UgJ0Z1bmN0aW9uRGVjbGFyYXRpb24nOlxuICAgICAgICAgICAgaWYgKCFpc1ByaXZhdGVNZW1iZXJOYW1lKGRlY2xhcmF0aW9uLmlkLm5hbWUpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2FkZCh0aGlzLl9wYXJzZUZ1bmN0aW9uRGVjbGFyYXRpb24oZGVjbGFyYXRpb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIEFuIGV4cG9ydGVkIHR5cGUgYWxpYXMuXG4gICAgICAgICAgY2FzZSAnVHlwZUFsaWFzJzpcbiAgICAgICAgICAgIGlmICghaXNQcml2YXRlTWVtYmVyTmFtZShkZWNsYXJhdGlvbi5pZC5uYW1lKSkge1xuICAgICAgICAgICAgICB0aGlzLl9hZGQodGhpcy5fcGFyc2VUeXBlQWxpYXMoZGVjbGFyYXRpb24pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIC8vIFBhcnNlIGNsYXNzZXMgYXMgcmVtb3RhYmxlIGludGVyZmFjZXMuXG4gICAgICAgICAgY2FzZSAnQ2xhc3NEZWNsYXJhdGlvbic6XG4gICAgICAgICAgICB0aGlzLl9hZGQodGhpcy5fcGFyc2VDbGFzc0RlY2xhcmF0aW9uKGRlY2xhcmF0aW9uKSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdWYXJpYWJsZURlY2xhcmF0aW9uJzpcbiAgICAgICAgICAgIC8vIElnbm9yZSBleHBvcnRlZCB2YXJpYWJsZXMuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAvLyBVbmtub3duIGV4cG9ydCBkZWNsYXJhdGlvbi5cbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgdGhpcy5fZXJyb3IoXG4gICAgICAgICAgICAgIGRlY2xhcmF0aW9uLFxuICAgICAgICAgICAgICBgVW5rbm93biBkZWNsYXJhdGlvbiB0eXBlICR7ZGVjbGFyYXRpb24udHlwZX0gaW4gZGVmaW5pdGlvbiBib2R5LmApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZ25vcmUgYWxsIG5vbi1leHBvcnQgdG9wIGxldmVsIHByb2dyYW0gZWxlbWVudHMgaW5jbHVkaW5nOlxuICAgICAgICAvLyBpbXBvcnRzLCBzdGF0ZW1lbnRzLCB2YXJpYWJsZSBkZWNsYXJhdGlvbnMsIGZ1bmN0aW9uIGRlY2xhcmF0aW9uc1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbGlkYXRlRGVmaW5pdGlvbnModGhpcy5fZGVmcyk7XG5cbiAgICByZXR1cm4gdGhpcy5fZGVmcztcbiAgfVxuXG4gIF9hZGQoZGVmaW5pdGlvbjogRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9kZWZzLmhhcyhkZWZpbml0aW9uLm5hbWUpKSB7XG4gICAgICBjb25zdCBleGlzdGluZ0RlZiA9IHRoaXMuX2RlZnMuZ2V0KGRlZmluaXRpb24ubmFtZSk7XG4gICAgICBpbnZhcmlhbnQoZXhpc3RpbmdEZWYgIT0gbnVsbCk7XG4gICAgICB0aHJvdyB0aGlzLl9lcnJvckxvY2F0aW9ucyhbZGVmaW5pdGlvbi5sb2NhdGlvbiwgZXhpc3RpbmdEZWYubG9jYXRpb25dLFxuICAgICAgICBgRHVwbGljYXRlIGRlZmluaXRpb24gZm9yICR7ZGVmaW5pdGlvbi5uYW1lfWApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9kZWZzLnNldChkZWZpbml0aW9uLm5hbWUsIGRlZmluaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBwYXJzZXMgYW4gZXhwb3J0ZWQgZnVuY3Rpb24gZGVjbGFyYXRpb24sIGFuZCByZXR1cm5zIHRoZSBmdW5jdGlvbiBuYW1lLFxuICAgKiBhbG9uZyB3aXRoIGEgRnVuY3Rpb25UeXBlIG9iamVjdCB0aGF0IGVuY29kZXMgdGhlIGFyZ3VtZW50IGFuZCByZXR1cm4gdHlwZXMgb2YgdGhlIGZ1bmN0aW9uLlxuICAgKi9cbiAgX3BhcnNlRnVuY3Rpb25EZWNsYXJhdGlvbihkZWNsYXJhdGlvbjogYW55KTogRnVuY3Rpb25EZWZpbml0aW9uIHtcbiAgICB0aGlzLl9hc3NlcnQoXG4gICAgICBkZWNsYXJhdGlvbixcbiAgICAgIGRlY2xhcmF0aW9uLmlkICYmIGRlY2xhcmF0aW9uLmlkLnR5cGUgPT09ICdJZGVudGlmaWVyJyxcbiAgICAgICdSZW1vdGUgZnVuY3Rpb24gZGVjbGFyYXRpb25zIG11c3QgaGF2ZSBhbiBpZGVudGlmaWVyLicpO1xuICAgIHRoaXMuX2Fzc2VydChcbiAgICAgIGRlY2xhcmF0aW9uLFxuICAgICAgZGVjbGFyYXRpb24ucmV0dXJuVHlwZSAhPSBudWxsICYmXG4gICAgICBkZWNsYXJhdGlvbi5yZXR1cm5UeXBlLnR5cGUgPT09ICdUeXBlQW5ub3RhdGlvbicsXG4gICAgICAnUmVtb3RlIGZ1bmN0aW9ucyBtdXN0IGJlIGFubm90YXRlZCB3aXRoIGEgcmV0dXJuIHR5cGUuJyk7XG5cbiAgICBjb25zdCByZXR1cm5UeXBlID0gdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbihkZWNsYXJhdGlvbi5yZXR1cm5UeXBlLnR5cGVBbm5vdGF0aW9uKTtcblxuICAgIHJldHVybiB7XG4gICAgICBraW5kOiAnZnVuY3Rpb24nLFxuICAgICAgbmFtZTogZGVjbGFyYXRpb24uaWQubmFtZSxcbiAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShkZWNsYXJhdGlvbiksXG4gICAgICB0eXBlOiB7XG4gICAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShkZWNsYXJhdGlvbiksXG4gICAgICAgIGtpbmQ6ICdmdW5jdGlvbicsXG4gICAgICAgIGFyZ3VtZW50VHlwZXM6IGRlY2xhcmF0aW9uLnBhcmFtcy5tYXAocGFyYW0gPT4gdGhpcy5fcGFyc2VQYXJhbWV0ZXIocGFyYW0pKSxcbiAgICAgICAgcmV0dXJuVHlwZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBwYXJzZXMgYW4gZXhwb3J0ZWQgdHlwZSBhbGlhcywgYW5kIHJldHVybnMgdGhlIG5hbWUgb2YgdGhlIGFsaWFzLFxuICAgKiBhbG9uZyB3aXRoIHRoZSB0eXBlIHRoYXQgaXQgcmVmZXJzIHRvLlxuICAgKi9cbiAgX3BhcnNlVHlwZUFsaWFzKGRlY2xhcmF0aW9uOiBhbnkpOiBBbGlhc0RlZmluaXRpb24ge1xuICAgIHRoaXMuX2Fzc2VydChkZWNsYXJhdGlvbiwgZGVjbGFyYXRpb24udHlwZSA9PT0gJ1R5cGVBbGlhcycsXG4gICAgICAgICdwYXJzZVR5cGVBbGlhcyBhY2NlcHRzIGEgVHlwZUFsaWFzIG5vZGUuJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGtpbmQ6ICdhbGlhcycsXG4gICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUoZGVjbGFyYXRpb24pLFxuICAgICAgbmFtZTogZGVjbGFyYXRpb24uaWQubmFtZSxcbiAgICAgIGRlZmluaXRpb246IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24oZGVjbGFyYXRpb24ucmlnaHQpLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgYSBDbGFzc0RlY2xhcmF0aW9uIEFTVCBOb2RlLlxuICAgKiBAcGFyYW0gZGVjbGFyYXRpb24gLSBUaGUgQVNUIG5vZGUuXG4gICAqL1xuICBfcGFyc2VDbGFzc0RlY2xhcmF0aW9uKGRlY2xhcmF0aW9uOiBPYmplY3QpOiBJbnRlcmZhY2VEZWZpbml0aW9uIHtcbiAgICBjb25zdCBkZWY6IEludGVyZmFjZURlZmluaXRpb24gPSB7XG4gICAgICBraW5kOiAnaW50ZXJmYWNlJyxcbiAgICAgIG5hbWU6IGRlY2xhcmF0aW9uLmlkLm5hbWUsXG4gICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUoZGVjbGFyYXRpb24pLFxuICAgICAgY29uc3RydWN0b3JBcmdzOiBbXSxcbiAgICAgIHN0YXRpY01ldGhvZHM6IG5ldyBNYXAoKSxcbiAgICAgIGluc3RhbmNlTWV0aG9kczogbmV3IE1hcCgpLFxuICAgIH07XG5cbiAgICBjb25zdCBjbGFzc0JvZHkgPSBkZWNsYXJhdGlvbi5ib2R5O1xuICAgIGZvciAoY29uc3QgbWV0aG9kIG9mIGNsYXNzQm9keS5ib2R5KSB7XG4gICAgICBpZiAobWV0aG9kLmtpbmQgPT09ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgICAgZGVmLmNvbnN0cnVjdG9yQXJncyA9IG1ldGhvZC52YWx1ZS5wYXJhbXMubWFwKHBhcmFtID0+IHRoaXMuX3BhcnNlUGFyYW1ldGVyKHBhcmFtKSk7XG4gICAgICAgIGlmIChtZXRob2QudmFsdWUucmV0dXJuVHlwZSkge1xuICAgICAgICAgIHRocm93IHRoaXMuX2Vycm9yKG1ldGhvZCwgYGNvbnN0cnVjdG9ycyBtYXkgbm90IGhhdmUgcmV0dXJuIHR5cGVzYCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghaXNQcml2YXRlTWVtYmVyTmFtZShtZXRob2Qua2V5Lm5hbWUpKSB7XG4gICAgICAgICAgY29uc3Qge25hbWUsIHR5cGV9ID0gdGhpcy5fcGFyc2VNZXRob2REZWZpbml0aW9uKG1ldGhvZCk7XG4gICAgICAgICAgdGhpcy5fZGVmaW5lTWV0aG9kKG5hbWUsIHR5cGUsIG1ldGhvZC5zdGF0aWMgPyBkZWYuc3RhdGljTWV0aG9kcyA6IGRlZi5pbnN0YW5jZU1ldGhvZHMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWY7XG4gIH1cblxuICBfZGVmaW5lTWV0aG9kKG5hbWU6IHN0cmluZywgdHlwZTogRnVuY3Rpb25UeXBlLCBwZWVyczogTWFwPHN0cmluZywgRnVuY3Rpb25UeXBlPik6IHZvaWQge1xuICAgIGlmIChwZWVycy5oYXMobmFtZSkpIHtcbiAgICAgIC8vICRGbG93Rml4TWUocGV0ZXJoYWwpXG4gICAgICBjb25zdCByZWxhdGVkTG9jYXRpb246IFNvdXJjZUxvY2F0aW9uID0gKHBlZXJzLmdldChuYW1lKS5sb2NhdGlvbjogYW55KTtcbiAgICAgIHRocm93IHRoaXMuX2Vycm9yTG9jYXRpb25zKFsodHlwZS5sb2NhdGlvbjogYW55KSwgcmVsYXRlZExvY2F0aW9uXSxcbiAgICAgICAgYER1cGxpY2F0ZSBtZXRob2QgZGVmaW5pdGlvbiAke25hbWV9YCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBlZXJzLnNldChuYW1lLCB0eXBlKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGFuIG1ldGhvZCBkZWZpbml0aW9uIGluIGEgY2xhc3MuXG4gICAqIEBwYXJhbSBkZWZpbnRpb24gLSBUaGUgTWV0aG9kRGVmaW5pdGlvbiBBU1Qgbm9kZS5cbiAgICogQHJldHVybnMgQSByZWNvcmQgY29udGFpbmluZyB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kLCBhbmQgYSBGdW5jdGlvblR5cGUgb2JqZWN0XG4gICAqICAgZW5jb2RpbmcgdGhlIGFyZ3VtZW50cyBhbmQgcmV0dXJuIHR5cGUgb2YgdGhlIG1ldGhvZC5cbiAgICovXG4gIF9wYXJzZU1ldGhvZERlZmluaXRpb24oZGVmaW5pdGlvbjogYW55KToge25hbWU6IHN0cmluZzsgdHlwZTogRnVuY3Rpb25UeXBlfSB7XG4gICAgdGhpcy5fYXNzZXJ0KGRlZmluaXRpb24sIGRlZmluaXRpb24udHlwZSA9PT0gJ01ldGhvZERlZmluaXRpb24nLFxuICAgICAgICAnVGhpcyBpcyBhIE1ldGhvZERlZmluaXRpb24gb2JqZWN0LicpO1xuICAgIHRoaXMuX2Fzc2VydChkZWZpbml0aW9uLCBkZWZpbml0aW9uLmtleSAmJiBkZWZpbml0aW9uLmtleS50eXBlID09PSAnSWRlbnRpZmllcicsXG4gICAgICAnVGhpcyBtZXRob2QgZGVmaW50aW9uIGhhcyBhbiBrZXkgKGEgbmFtZSkuJyk7XG4gICAgdGhpcy5fYXNzZXJ0KGRlZmluaXRpb24sIGRlZmluaXRpb24udmFsdWUucmV0dXJuVHlwZSAmJlxuICAgICAgZGVmaW5pdGlvbi52YWx1ZS5yZXR1cm5UeXBlLnR5cGUgPT09ICdUeXBlQW5ub3RhdGlvbicsXG4gICAgICBgJHtkZWZpbml0aW9uLmtleS5uYW1lfSBtaXNzaW5nIGEgcmV0dXJuIHR5cGUgYW5ub3RhdGlvbi5gKTtcblxuICAgIGNvbnN0IHJldHVyblR5cGUgPSB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKGRlZmluaXRpb24udmFsdWUucmV0dXJuVHlwZS50eXBlQW5ub3RhdGlvbik7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShkZWZpbml0aW9uLmtleSksXG4gICAgICBuYW1lOiBkZWZpbml0aW9uLmtleS5uYW1lLFxuICAgICAgdHlwZToge1xuICAgICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUoZGVmaW5pdGlvbi52YWx1ZSksXG4gICAgICAgIGtpbmQ6ICdmdW5jdGlvbicsXG4gICAgICAgIGFyZ3VtZW50VHlwZXM6IGRlZmluaXRpb24udmFsdWUucGFyYW1zLm1hcChwYXJhbSA9PiB0aGlzLl9wYXJzZVBhcmFtZXRlcihwYXJhbSkpLFxuICAgICAgICByZXR1cm5UeXBlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgX3BhcnNlUGFyYW1ldGVyKHBhcmFtOiBPYmplY3QpOiBUeXBlIHtcbiAgICBpZiAoIXBhcmFtLnR5cGVBbm5vdGF0aW9uKSB7XG4gICAgICB0aHJvdyB0aGlzLl9lcnJvcihwYXJhbSwgYFBhcmFtZXRlciAke3BhcmFtLm5hbWV9IGRvZXNuJ3QgaGF2ZSB0eXBlIGFubm90YXRpb24uYCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKHBhcmFtLnR5cGVBbm5vdGF0aW9uLnR5cGVBbm5vdGF0aW9uKTtcbiAgICAgIGlmIChwYXJhbS5vcHRpb25hbCAmJiB0eXBlLmtpbmQgIT09ICdudWxsYWJsZScpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbjogdGhpcy5fbG9jYXRpb25PZk5vZGUocGFyYW0pLFxuICAgICAgICAgIGtpbmQ6ICdudWxsYWJsZScsXG4gICAgICAgICAgdHlwZSxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0eXBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBwYXJzZXMgYSBGbG93IHR5cGUgYW5ub3RhdGlvbiBpbnRvIG91ciBpbnRlcm1lZGlhdGUgZm9ybWF0LlxuICAgKiBAcmV0dXJucyB7VHlwZX0gQSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHlwZS5cbiAgICovXG4gIF9wYXJzZVR5cGVBbm5vdGF0aW9uKHR5cGVBbm5vdGF0aW9uOiBPYmplY3QpOiBUeXBlIHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHRoaXMuX2xvY2F0aW9uT2ZOb2RlKHR5cGVBbm5vdGF0aW9uKTtcbiAgICBzd2l0Y2ggKHR5cGVBbm5vdGF0aW9uLnR5cGUpIHtcbiAgICAgIGNhc2UgJ0FueVR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ2FueSd9O1xuICAgICAgY2FzZSAnTWl4ZWRUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdtaXhlZCd9O1xuICAgICAgY2FzZSAnU3RyaW5nVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnc3RyaW5nJ307XG4gICAgICBjYXNlICdOdW1iZXJUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdudW1iZXInfTtcbiAgICAgIGNhc2UgJ0Jvb2xlYW5UeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICdib29sZWFuJ307XG4gICAgICBjYXNlICdTdHJpbmdMaXRlcmFsVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnc3RyaW5nLWxpdGVyYWwnLCB2YWx1ZTogdHlwZUFubm90YXRpb24udmFsdWV9O1xuICAgICAgY2FzZSAnTnVtYmVyTGl0ZXJhbFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ251bWJlci1saXRlcmFsJywgdmFsdWU6IHR5cGVBbm5vdGF0aW9uLnZhbHVlfTtcbiAgICAgIGNhc2UgJ0Jvb2xlYW5MaXRlcmFsVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge2xvY2F0aW9uLCBraW5kOiAnYm9vbGVhbi1saXRlcmFsJywgdmFsdWU6IHR5cGVBbm5vdGF0aW9uLnZhbHVlfTtcbiAgICAgIGNhc2UgJ051bGxhYmxlVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdudWxsYWJsZScsXG4gICAgICAgICAgdHlwZTogdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbih0eXBlQW5ub3RhdGlvbi50eXBlQW5ub3RhdGlvbiksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdPYmplY3RUeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ29iamVjdCcsXG4gICAgICAgICAgZmllbGRzOiB0eXBlQW5ub3RhdGlvbi5wcm9wZXJ0aWVzLm1hcChwcm9wID0+IHtcbiAgICAgICAgICAgIGludmFyaWFudChwcm9wLnR5cGUgPT09ICdPYmplY3RUeXBlUHJvcGVydHknKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGxvY2F0aW9uOiB0aGlzLl9sb2NhdGlvbk9mTm9kZShwcm9wKSxcbiAgICAgICAgICAgICAgbmFtZTogcHJvcC5rZXkubmFtZSxcbiAgICAgICAgICAgICAgdHlwZTogdGhpcy5fcGFyc2VUeXBlQW5ub3RhdGlvbihwcm9wLnZhbHVlKSxcbiAgICAgICAgICAgICAgb3B0aW9uYWw6IHByb3Aub3B0aW9uYWwsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnVm9pZFR5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHtsb2NhdGlvbiwga2luZDogJ3ZvaWQnfTtcbiAgICAgIGNhc2UgJ1R1cGxlVHlwZUFubm90YXRpb24nOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICd0dXBsZScsXG4gICAgICAgICAgdHlwZXM6IHR5cGVBbm5vdGF0aW9uLnR5cGVzLm1hcCh0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uLmJpbmQodGhpcykpLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnVW5pb25UeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ3VuaW9uJyxcbiAgICAgICAgICB0eXBlczogdHlwZUFubm90YXRpb24udHlwZXMubWFwKHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24uYmluZCh0aGlzKSksXG4gICAgICAgIH07XG4gICAgICBjYXNlICdJbnRlcnNlY3Rpb25UeXBlQW5ub3RhdGlvbic6XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgbG9jYXRpb24sXG4gICAgICAgICAga2luZDogJ2ludGVyc2VjdGlvbicsXG4gICAgICAgICAgdHlwZXM6IHR5cGVBbm5vdGF0aW9uLnR5cGVzLm1hcCh0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uLmJpbmQodGhpcykpLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnR2VuZXJpY1R5cGVBbm5vdGF0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVBbm5vdGF0aW9uKHR5cGVBbm5vdGF0aW9uKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IHRoaXMuX2Vycm9yKHR5cGVBbm5vdGF0aW9uLCBgVW5rbm93biB0eXBlIGFubm90YXRpb24gJHt0eXBlQW5ub3RhdGlvbi50eXBlfS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcGFyc2VzIGFubm90YXRpb25zIG9mIHR5cGUgJ0dlbmVyaWNUeXBlQW5ub3RhdGlvbicuIE1lYW50IHRvIGJlIGNhbGxlZFxuICAgKiBmcm9tIHBhcnNlVHlwZUFubm90YXRpb24uXG4gICAqL1xuICBfcGFyc2VHZW5lcmljVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24pOiBUeXBlIHtcbiAgICBpbnZhcmlhbnQodHlwZUFubm90YXRpb24udHlwZSA9PT0gJ0dlbmVyaWNUeXBlQW5ub3RhdGlvbicpO1xuICAgIGNvbnN0IGlkID0gdGhpcy5fcGFyc2VUeXBlTmFtZSh0eXBlQW5ub3RhdGlvbi5pZCk7XG4gICAgY29uc3QgbG9jYXRpb246IExvY2F0aW9uID0gdGhpcy5fbG9jYXRpb25PZk5vZGUodHlwZUFubm90YXRpb24pO1xuICAgIHN3aXRjaCAoaWQpIHtcbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnYXJyYXknLFxuICAgICAgICAgIHR5cGU6IHRoaXMuX3BhcnNlR2VuZXJpY1R5cGVQYXJhbWV0ZXJPZktub3duVHlwZShpZCwgdHlwZUFubm90YXRpb24pLFxuICAgICAgICB9O1xuICAgICAgY2FzZSAnU2V0JzpcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsb2NhdGlvbixcbiAgICAgICAgICBraW5kOiAnc2V0JyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQsIHR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ1Byb21pc2UnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdwcm9taXNlJyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQsIHR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ09ic2VydmFibGUnOlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdvYnNlcnZhYmxlJyxcbiAgICAgICAgICB0eXBlOiB0aGlzLl9wYXJzZUdlbmVyaWNUeXBlUGFyYW1ldGVyT2ZLbm93blR5cGUoaWQsIHR5cGVBbm5vdGF0aW9uKSxcbiAgICAgICAgfTtcbiAgICAgIGNhc2UgJ01hcCc6XG4gICAgICAgIHRoaXMuX2Fzc2VydChcbiAgICAgICAgICB0eXBlQW5ub3RhdGlvbixcbiAgICAgICAgICB0eXBlQW5ub3RhdGlvbi50eXBlUGFyYW1ldGVycyAhPSBudWxsICYmXG4gICAgICAgICAgdHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zLmxlbmd0aCA9PT0gMixcbiAgICAgICAgICBgJHtpZH0gdGFrZXMgZXhhY3RseSB0d28gdHlwZSBwYXJhbWV0ZXJzLmApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxvY2F0aW9uLFxuICAgICAgICAgIGtpbmQ6ICdtYXAnLFxuICAgICAgICAgIGtleVR5cGU6IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zWzBdKSxcbiAgICAgICAgICB2YWx1ZVR5cGU6IHRoaXMuX3BhcnNlVHlwZUFubm90YXRpb24odHlwZUFubm90YXRpb24udHlwZVBhcmFtZXRlcnMucGFyYW1zWzFdKSxcbiAgICAgICAgfTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8vIE5hbWVkIHR5cGVzIGFyZSByZXByZXNlbnRlZCBhcyBHZW5lcmljIHR5cGVzIHdpdGggbm8gdHlwZSBwYXJhbWV0ZXJzLlxuICAgICAgICB0aGlzLl9hc3NlcnQodHlwZUFubm90YXRpb24sIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzID09IG51bGwsXG4gICAgICAgICAgICBgVW5rbm93biBnZW5lcmljIHR5cGUgJHtpZH0uYCk7XG4gICAgICAgIHJldHVybiB7bG9jYXRpb24sIGtpbmQ6ICduYW1lZCcsIG5hbWU6IGlkfTtcbiAgICB9XG4gIH1cblxuICBfcGFyc2VHZW5lcmljVHlwZVBhcmFtZXRlck9mS25vd25UeXBlKGlkOiBzdHJpbmcsIHR5cGVBbm5vdGF0aW9uOiBPYmplY3QpOiBUeXBlIHtcbiAgICB0aGlzLl9hc3NlcnQoXG4gICAgICB0eXBlQW5ub3RhdGlvbixcbiAgICAgIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzICE9IG51bGwgJiZcbiAgICAgIHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzLnBhcmFtcy5sZW5ndGggPT09IDEsXG4gICAgICBgJHtpZH0gaGFzIGV4YWN0bHkgb25lIHR5cGUgcGFyYW1ldGVyLmApO1xuICAgIHJldHVybiB0aGlzLl9wYXJzZVR5cGVBbm5vdGF0aW9uKHR5cGVBbm5vdGF0aW9uLnR5cGVQYXJhbWV0ZXJzLnBhcmFtc1swXSk7XG4gIH1cblxuICAvKipcbiAgICogVHlwZSBuYW1lcyBtYXkgZWl0aGVyIGJlIHNpbXBsZSBJZGVudGlmaWVycywgb3IgdGhleSBtYXkgYmVcbiAgICogcXVhbGlmaWVkIGlkZW50aWZpZXJzLlxuICAgKi9cbiAgX3BhcnNlVHlwZU5hbWUodHlwZTogT2JqZWN0KTogc3RyaW5nIHtcbiAgICBzd2l0Y2ggKHR5cGUudHlwZSkge1xuICAgICAgY2FzZSAnSWRlbnRpZmllcic6XG4gICAgICAgIHJldHVybiB0eXBlLm5hbWU7XG4gICAgICBjYXNlICdRdWFsaWZpZWRUeXBlSWRlbnRpZmllcic6XG4gICAgICAgIGludmFyaWFudCh0eXBlLmlkLnR5cGUgPT09ICdJZGVudGlmaWVyJyk7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLl9wYXJzZVR5cGVOYW1lKHR5cGUucXVhbGlmaWNhdGlvbil9LiR7dHlwZS5pZC5uYW1lfWA7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyB0aGlzLl9lcnJvcih0eXBlLCBgRXhwZWN0ZWQgbmFtZWQgdHlwZS4gRm91bmQgJHt0eXBlLnR5cGV9YCk7XG4gICAgfVxuICB9XG59XG4iXX0=