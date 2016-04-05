Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.validateDefinitions = validateDefinitions;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _builtinTypes = require('./builtin-types');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideCommons = require('../../nuclide-commons');

/**
 * Throws if a named type referenced in an RPC interface is not defined.
 * The error message thrown is suitable for display to a human.
 *
 * NOTE: Will also mutate the incoming definitions in place to make them easier to marshal.
 */

function validateDefinitions(definitions) {
  var namedTypes = new Map();
  gatherKnownTypes();
  validate();

  function validate() {
    findMissingTypeNames();
    findRecursiveAliases();
    validateReturnTypes();
    cannonicalize();
  }

  function findMissingTypeNames() {
    visitAllTypes(checkTypeForMissingNames);
  }

  function gatherKnownTypes() {
    for (var definition of definitions.values()) {
      switch (definition.kind) {
        case 'alias':
        case 'interface':
          namedTypes.set(definition.name, definition);
          break;
      }
    }
  }

  function checkTypeForMissingNames(type) {
    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
      case 'string-literal':
      case 'boolean-literal':
      case 'number-literal':
      case 'void':
        break;
      case 'promise':
        checkTypeForMissingNames(type.type);
        break;
      case 'observable':
        checkTypeForMissingNames(type.type);
        break;
      case 'array':
        checkTypeForMissingNames(type.type);
        break;
      case 'set':
        checkTypeForMissingNames(type.type);
        break;
      case 'nullable':
        checkTypeForMissingNames(type.type);
        break;
      case 'map':
        checkTypeForMissingNames(type.keyType);
        checkTypeForMissingNames(type.valueType);
        break;
      case 'object':
        type.fields.map(function (field) {
          return field.type;
        }).forEach(checkTypeForMissingNames);
        break;
      case 'tuple':
        type.types.forEach(checkTypeForMissingNames);
        break;
      case 'union':
        type.types.forEach(checkTypeForMissingNames);
        break;
      case 'intersection':
        type.types.forEach(checkTypeForMissingNames);
        break;
      case 'function':
        type.argumentTypes.forEach(checkTypeForMissingNames);
        checkTypeForMissingNames(type.returnType);
        break;
      case 'named':
        var name = type.name;
        if (!namedTypes.has(name)) {
          throw error(type, 'No definition for type ' + name + '.');
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function findRecursiveAliases() {
    for (var definition of definitions.values()) {
      switch (definition.kind) {
        case 'alias':
          checkAliasLayout(definition);
          break;
      }
    }
  }

  function checkAliasLayout(alias) {
    if (alias.definition) {
      validateLayoutRec([alias], alias.definition);
    }
  }

  /**
   * Validates that a type does not directly contain any types which are known to
   * directly or indirectly contain it.
   *
   * If recursion is found the chain of types which recursively contain each other is reported.
   */
  function validateLayoutRec(containingDefinitions, type) {
    function validateTypeRec(typeRec) {
      validateLayoutRec(containingDefinitions, typeRec);
    }

    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
      case 'string-literal':
      case 'boolean-literal':
      case 'number-literal':
      case 'void':
        break;
      case 'promise':
      case 'observable':
        validateTypeRec(type.type);
        break;
      case 'nullable':
        // Nullable breaks the layout chain
        break;
      case 'map':
      case 'array':
      case 'set':
        // Containers break the layout chain as they may be empty.
        break;
      case 'object':
        type.fields.filter(function (field) {
          return !field.optional;
        }).map(function (field) {
          return field.type;
        }).forEach(validateTypeRec);
        break;
      case 'tuple':
        type.types.forEach(validateTypeRec);
        break;
      case 'union':
        // Union types break the layout chain.
        // TODO: Strictly we should detect alternates which directly contain their parent union,
        // or if all alternates indirectly contain the parent union.
        break;
      case 'intersection':
        type.types.forEach(validateTypeRec);
        break;
      case 'function':
        break;
      case 'named':
        var name = type.name;
        // $FlowFixMe(peterhal)
        var definition = namedTypes.get(name);
        if (containingDefinitions.indexOf(definition) !== -1) {
          throw errorDefinitions(containingDefinitions.slice(containingDefinitions.indexOf(definition)), 'Type ' + name + ' contains itself.');
        } else if (definition.kind === 'alias' && definition.definition != null) {
          containingDefinitions.push(definition);
          (0, _assert2['default'])(definition.definition);
          validateLayoutRec(containingDefinitions, definition.definition);
          containingDefinitions.pop();
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function validateReturnTypes() {
    for (var definition of definitions.values()) {
      switch (definition.kind) {
        case 'function':
          validateType(definition.type);
          break;
        case 'alias':
          if (definition.definition != null) {
            validateAliasType(definition.definition);
          }
          break;
        case 'interface':
          definition.constructorArgs.forEach(validateType);
          definition.instanceMethods.forEach(validateType);
          definition.staticMethods.forEach(validateType);
          break;
      }
    }
  }

  // Validates a type which must be a return type.
  // Caller must resolve named types.
  function validateReturnType(funcType, type) {
    function invalidReturnTypeError() {
      return error(funcType, 'The return type of a remote function must be of type Void, Promise, or Observable');
    }

    switch (type.kind) {
      case 'void':
        break;
      case 'promise':
      case 'observable':
        if (type.type.kind !== 'void') {
          validateType(type.type);
        }
        break;
      default:
        throw invalidReturnTypeError();
    }
  }

  // Aliases may be return types, or non-return types.
  function validateAliasType(type) {
    switch (type.kind) {
      case 'void':
        break;
      case 'promise':
      case 'observable':
        if (type.type.kind !== 'void') {
          validateType(type.type);
        }
        break;
      case 'named':
        // No need to recurse, as the target alias definition will get validated seperately.
        break;
      default:
        validateType(type);
        break;
    }
  }

  function isLiteralType(type) {
    switch (type.kind) {
      case 'string-literal':
      case 'number-literal':
      case 'boolean-literal':
        return true;
      default:
        return false;
    }
  }

  function validateIntersectionType(intersectionType) {
    var fields = flattenIntersection(intersectionType);
    var fieldNameToLocation = new Map();
    for (var field of fields) {
      if (fieldNameToLocation.has(field.name)) {
        // TODO allow duplicate field names if they have the same type.
        var otherLocation = fieldNameToLocation.get(field.name);
        (0, _assert2['default'])(otherLocation != null);
        throw errorLocations([intersectionType.location, field.location, otherLocation], 'Duplicate field name \'' + field.name + '\' in intersection types are not supported.');
      }
      fieldNameToLocation.set(field.name, field.location);
    }
  }

  function validateUnionType(type) {
    var alternates = flattenUnionAlternates(type.types);

    if (isLiteralType(alternates[0])) {
      validateLiteralUnionType(type, alternates);
    } else if (alternates[0].kind === 'object') {
      validateObjectUnionType(type, alternates);
    } else {
      throw errorLocations([type.location, alternates[0].location], 'Union alternates must be either be typed object or literal types.');
    }
  }

  function validateLiteralUnionType(type, alternates) {
    alternates.reduce(function (previousAlternates, alternate) {
      validateType(alternate);

      // Ensure a valid alternate
      if (!isLiteralType(alternate)) {
        throw errorLocations([type.location, alternate.location], 'Union alternates may only be literal types.');
      }

      // Ensure no duplicates
      previousAlternates.forEach(function (previous) {
        (0, _assert2['default'])(previous.kind === 'string-literal' || previous.kind === 'number-literal' || previous.kind === 'boolean-literal');
        (0, _assert2['default'])(alternate.kind === 'string-literal' || alternate.kind === 'number-literal' || alternate.kind === 'boolean-literal');
        if (previous.value === alternate.value) {
          throw errorLocations([type.location, previous.location, alternate.location], 'Union alternates may not have the same value.');
        }
      });

      previousAlternates.push(alternate);
      return previousAlternates;
    }, []);
  }

  function validateObjectUnionType(type, alternates) {
    alternates.forEach(function (alternate) {
      validateType(alternate);

      // Ensure alternates match
      if (alternate.kind !== 'object') {
        throw errorLocations([type.location, alternates[0].location, alternate.location], 'Union alternates must be of the same type.');
      }
    });

    type.discriminantField = findObjectUnionDiscriminant(type, alternates);
  }

  function findObjectUnionDiscriminant(type, alternates) {
    // Get set of fields which are literal types in al alternates.
    (0, _assert2['default'])(alternates.length > 0);
    // $FlowFixMe
    var possibleFields = alternates.reduce(function (possibilities, alternate) {
      var alternatePossibilities = possibleDiscriminantFieldsOfUnionAlternate(alternate);
      if (alternatePossibilities.size === 0) {
        throw errorLocations([type.location, alternate.location], 'Object union alternative has no possible discriminant fields.');
      }
      // Use null to represent the set containing everything.
      if (possibilities == null) {
        return alternatePossibilities;
      } else {
        return _nuclideCommons.set.intersect(alternatePossibilities, possibilities);
      }
    }, null);

    var validFields = _nuclideCommons.array.from(possibleFields).filter(function (fieldName) {
      return isValidDiscriminantField(alternates, fieldName);
    });
    if (validFields.length > 0) {
      // If there are multiple valid discriminant fields, we just pick the first.
      return validFields[0];
    } else {
      // TODO: Better error message why each possibleFields is invalid.
      throw error(type, 'No valid discriminant field for union type.');
    }
  }

  function isValidDiscriminantField(alternates, candidateField) {
    // $FlowFixMe
    var fieldTypes = alternates.map(function (alternate) {
      return resolvePossiblyNamedType(getObjectFieldByName(alternate, candidateField).type);
    });

    // Fields in all alternates must have same type.
    if (!fieldTypes.every(function (fieldType) {
      return fieldType.kind === fieldTypes[0].kind;
    })) {
      return false;
    }

    // Must not have duplicate values in any alternate.
    // All alternates must be unique.
    return new Set(fieldTypes.map(function (fieldType) {
      return fieldType.value;
    })).size === alternates.length;
  }

  function getObjectFieldByName(type, fieldName) {
    var result = _nuclideCommons.array.find(type.fields, function (field) {
      return field.name === fieldName;
    });
    (0, _assert2['default'])(result != null);
    return result;
  }

  function possibleDiscriminantFieldsOfUnionAlternate(alternate) {
    return new Set(alternate.fields.filter(function (field) {
      return isLiteralType(resolvePossiblyNamedType(field.type));
    }).map(function (field) {
      return field.name;
    }));
  }

  // Validates a type which is not directly a return type.
  function validateType(type) {
    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
      case 'string-literal':
      case 'boolean-literal':
      case 'number-literal':
        break;
      case 'void':
      case 'promise':
      case 'observable':
        throw error(type, 'Promise, void and Observable types may only be used as return types');
      case 'array':
        validateType(type.type);
        break;
      case 'set':
        validateType(type.type);
        break;
      case 'nullable':
        validateType(type.type);
        break;
      case 'map':
        validateType(type.keyType);
        validateType(type.valueType);
        break;
      case 'object':
        type.fields.map(function (field) {
          return field.type;
        }).forEach(validateType);
        break;
      case 'tuple':
        type.types.forEach(validateType);
        break;
      case 'union':
        validateUnionType(type);
        break;
      case 'intersection':
        validateIntersectionType(type);
        break;
      case 'function':
        type.argumentTypes.forEach(validateType);
        validateReturnType(type, resolvePossiblyNamedType(type.returnType));
        break;
      case 'named':
        var resolvedType = resolveNamedType(type);
        // Note: We do not recurse here as types may be self-recursive (through nullable for
        // example).
        // The resolvedType will already have been checked to be a valid alias type.
        // so we only need to check the difference between alias types and non-return types.
        switch (resolvedType.kind) {
          case 'void':
          case 'promise':
          case 'observable':
            throw error(type, 'Promise, void and Observable types may only be used as return types');
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  // Replaces all uses of type aliases in return types with their definition
  // so that clients need not be aware of aliases.
  // TODO: Should replace all aliases, however that will require rewriting marsalling.
  function cannonicalize() {
    visitAllTypes(cannonicalizeType);
  }

  function cannonicalizeTypeArray(types) {
    types.forEach(cannonicalizeType);
  }

  function cannonicalizeType(type) {
    switch (type.kind) {
      case 'any':
      case 'mixed':
      case 'string':
      case 'boolean':
      case 'number':
      case 'string-literal':
      case 'boolean-literal':
      case 'number-literal':
      case 'void':
        break;
      case 'promise':
        cannonicalizeType(type.type);
        break;
      case 'observable':
        cannonicalizeType(type.type);
        break;
      case 'array':
        cannonicalizeType(type.type);
        break;
      case 'set':
        cannonicalizeType(type.type);
        break;
      case 'nullable':
        cannonicalizeType(type.type);
        break;
      case 'map':
        cannonicalizeType(type.keyType);
        cannonicalizeType(type.valueType);
        break;
      case 'object':
        type.fields.forEach(function (field) {
          cannonicalizeType(field.type);
        });
        break;
      case 'tuple':
        cannonicalizeTypeArray(type.types);
        break;
      case 'union':
        cannonicalizeTypeArray(type.types);
        type.types = flattenUnionAlternates(type.types);
        break;
      case 'intersection':
        cannonicalizeTypeArray(type.types);
        canonicalizeIntersection(type);
        break;
      case 'function':
        cannonicalizeTypeArray(type.argumentTypes);
        type.returnType = resolvePossiblyNamedType(type.returnType);
        cannonicalizeType(type.returnType);
        break;
      case 'named':
        // Note that this does not recurse, so the algorithm will always terminate.
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function canonicalizeIntersection(intersectionType) {
    var fields = flattenIntersection(intersectionType);
    intersectionType.flattened = {
      kind: 'object',
      location: intersectionType.location,
      fields: fields
    };
  }

  function flattenIntersection(intersectionType) {
    var fields = [];
    for (var _type of intersectionType.types) {
      var resolvedType = resolvePossiblyNamedType(_type);
      if (resolvedType.kind === 'object') {
        fields.push.apply(fields, _toConsumableArray(resolvedType.fields));
      } else if (resolvedType.kind === 'intersection') {
        fields.push.apply(fields, _toConsumableArray(flattenIntersection(resolvedType)));
      } else {
        throw errorLocations([intersectionType.location, _type.location], 'Types in intersections must be object or intersection types');
      }
    }
    return fields;
  }

  // Will return a named type if and only if the alias resolves to a builtin type, or an interface.
  function resolvePossiblyNamedType(type) {
    if (type.kind === 'named') {
      return resolveNamedType(type);
    } else {
      return type;
    }
  }

  function flattenUnionAlternates(types) {
    var _ref;

    return (_ref = []).concat.apply(_ref, _toConsumableArray(types.map(function (alternate) {
      var resolvedAlternate = resolvePossiblyNamedType(alternate);
      return resolvedAlternate.kind === 'union' ? flattenUnionAlternates(resolvedAlternate.types) : resolvedAlternate;
    })));
  }

  // Returns the definition of a named type. If the type resolves to an alias it returns the
  // alias's definition.
  // Will return a named type if and only if the alias resolves to a builtin type, or an interface.
  function resolveNamedType(_x) {
    var _again = true;

    _function: while (_again) {
      var namedType = _x;
      _again = false;

      var def = namedTypes.get(namedType.name);
      (0, _assert2['default'])(def != null);
      switch (def.kind) {
        case 'alias':
          var type = def.definition;
          if (type) {
            if (type.kind === 'named') {
              _x = type;
              _again = true;
              def = type = undefined;
              continue _function;
            }
            return type;
          }
          return namedType;
        case 'interface':
          return namedType;
        default:
          throw new Error('Unexpected definition kind');
      }
    }
  }

  function visitAllTypes(operation) {
    for (var definition of definitions.values()) {
      switch (definition.kind) {
        case 'function':
          operation(definition.type);
          break;
        case 'alias':
          if (definition.definition != null) {
            operation(definition.definition);
          }
          break;
        case 'interface':
          definition.constructorArgs.forEach(operation);
          definition.instanceMethods.forEach(operation);
          definition.staticMethods.forEach(operation);
          break;
      }
    }
  }

  function error(type, message) {
    return errorLocations([type.location], message);
  }

  function errorLocations(locations, message) {
    var _fullMessage;

    var fullMessage = (0, _builtinTypes.locationToString)(locations[0]) + ':' + message;
    fullMessage = (_fullMessage = fullMessage).concat.apply(_fullMessage, _toConsumableArray(locations.slice(1).map(function (location) {
      return '\n' + (0, _builtinTypes.locationToString)(location) + ': Related location';
    })));
    return new Error(fullMessage);
  }

  function errorDefinitions(defs, message) {
    var _fullMessage2;

    var fullMessage = (0, _builtinTypes.locationToString)(defs[0].location) + ':' + message;
    fullMessage = (_fullMessage2 = fullMessage).concat.apply(_fullMessage2, _toConsumableArray(defs.slice(1).map(function (definition) {
      return '\n' + (0, _builtinTypes.locationToString)(definition.location) + ': Related definition ' + definition.name;
    })));
    return new Error(fullMessage);
  }
}
//# sourceMappingURL=data:application/json;base64,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QUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMvQjtDQUNGIiwiZmlsZSI6IkRlZmluaXRpb25WYWxpZGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2xvY2F0aW9uVG9TdHJpbmd9IGZyb20gJy4vYnVpbHRpbi10eXBlcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FycmF5LCBzZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmltcG9ydCB0eXBlIHtcbiAgRGVmaW5pdGlvbnMsXG4gIERlZmluaXRpb24sXG4gIEFsaWFzRGVmaW5pdGlvbixcbiAgSW50ZXJmYWNlRGVmaW5pdGlvbixcbiAgVHlwZSxcbiAgRnVuY3Rpb25UeXBlLFxuICBOYW1lZFR5cGUsXG4gIFVuaW9uVHlwZSxcbiAgSW50ZXJzZWN0aW9uVHlwZSxcbiAgT2JqZWN0VHlwZSxcbiAgT2JqZWN0RmllbGQsXG4gIExpdGVyYWxUeXBlLFxuICBMb2NhdGlvbixcbn0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogVGhyb3dzIGlmIGEgbmFtZWQgdHlwZSByZWZlcmVuY2VkIGluIGFuIFJQQyBpbnRlcmZhY2UgaXMgbm90IGRlZmluZWQuXG4gKiBUaGUgZXJyb3IgbWVzc2FnZSB0aHJvd24gaXMgc3VpdGFibGUgZm9yIGRpc3BsYXkgdG8gYSBodW1hbi5cbiAqXG4gKiBOT1RFOiBXaWxsIGFsc28gbXV0YXRlIHRoZSBpbmNvbWluZyBkZWZpbml0aW9ucyBpbiBwbGFjZSB0byBtYWtlIHRoZW0gZWFzaWVyIHRvIG1hcnNoYWwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZURlZmluaXRpb25zKGRlZmluaXRpb25zOiBEZWZpbml0aW9ucyk6IHZvaWQge1xuICBjb25zdCBuYW1lZFR5cGVzOiBNYXA8c3RyaW5nLCBBbGlhc0RlZmluaXRpb24gfCBJbnRlcmZhY2VEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbiAgZ2F0aGVyS25vd25UeXBlcygpO1xuICB2YWxpZGF0ZSgpO1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKCk6IHZvaWQge1xuICAgIGZpbmRNaXNzaW5nVHlwZU5hbWVzKCk7XG4gICAgZmluZFJlY3Vyc2l2ZUFsaWFzZXMoKTtcbiAgICB2YWxpZGF0ZVJldHVyblR5cGVzKCk7XG4gICAgY2Fubm9uaWNhbGl6ZSgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluZE1pc3NpbmdUeXBlTmFtZXMoKSB7XG4gICAgdmlzaXRBbGxUeXBlcyhjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2F0aGVyS25vd25UeXBlcygpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRlZmluaXRpb24gb2YgZGVmaW5pdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICBuYW1lZFR5cGVzLnNldChkZWZpbml0aW9uLm5hbWUsIGRlZmluaXRpb24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2FueSc6XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnYm9vbGVhbi1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ251bWJlci1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdudWxsYWJsZSc6XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21hcCc6XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLmtleVR5cGUpO1xuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS52YWx1ZVR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIHR5cGUuZmllbGRzLm1hcChmaWVsZCA9PiBmaWVsZC50eXBlKS5mb3JFYWNoKGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHVwbGUnOlxuICAgICAgICB0eXBlLnR5cGVzLmZvckVhY2goY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIHR5cGUudHlwZXMuZm9yRWFjaChjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ludGVyc2VjdGlvbic6XG4gICAgICAgIHR5cGUudHlwZXMuZm9yRWFjaChjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgdHlwZS5hcmd1bWVudFR5cGVzLmZvckVhY2goY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKTtcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUucmV0dXJuVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZWQnOlxuICAgICAgICBjb25zdCBuYW1lID0gdHlwZS5uYW1lO1xuICAgICAgICBpZiAoIW5hbWVkVHlwZXMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3IodHlwZSwgYE5vIGRlZmluaXRpb24gZm9yIHR5cGUgJHtuYW1lfS5gKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh0eXBlKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZmluZFJlY3Vyc2l2ZUFsaWFzZXMoKSB7XG4gICAgZm9yIChjb25zdCBkZWZpbml0aW9uIG9mIGRlZmluaXRpb25zLnZhbHVlcygpKSB7XG4gICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgY2hlY2tBbGlhc0xheW91dChkZWZpbml0aW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FsaWFzTGF5b3V0KGFsaWFzOiBBbGlhc0RlZmluaXRpb24pOiB2b2lkIHtcbiAgICBpZiAoYWxpYXMuZGVmaW5pdGlvbikge1xuICAgICAgdmFsaWRhdGVMYXlvdXRSZWMoW2FsaWFzXSwgYWxpYXMuZGVmaW5pdGlvbik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyB0aGF0IGEgdHlwZSBkb2VzIG5vdCBkaXJlY3RseSBjb250YWluIGFueSB0eXBlcyB3aGljaCBhcmUga25vd24gdG9cbiAgICogZGlyZWN0bHkgb3IgaW5kaXJlY3RseSBjb250YWluIGl0LlxuICAgKlxuICAgKiBJZiByZWN1cnNpb24gaXMgZm91bmQgdGhlIGNoYWluIG9mIHR5cGVzIHdoaWNoIHJlY3Vyc2l2ZWx5IGNvbnRhaW4gZWFjaCBvdGhlciBpcyByZXBvcnRlZC5cbiAgICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlTGF5b3V0UmVjKGNvbnRhaW5pbmdEZWZpbml0aW9uczogQXJyYXk8QWxpYXNEZWZpbml0aW9uPiwgdHlwZTogVHlwZSk6IHZvaWQge1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlVHlwZVJlYyh0eXBlUmVjOiBUeXBlKTogdm9pZCB7XG4gICAgICB2YWxpZGF0ZUxheW91dFJlYyhjb250YWluaW5nRGVmaW5pdGlvbnMsIHR5cGVSZWMpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICdhbnknOlxuICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZy1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4tbGl0ZXJhbCc6XG4gICAgICBjYXNlICdudW1iZXItbGl0ZXJhbCc6XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICB2YWxpZGF0ZVR5cGVSZWModHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdudWxsYWJsZSc6XG4gICAgICAgIC8vIE51bGxhYmxlIGJyZWFrcyB0aGUgbGF5b3V0IGNoYWluXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWFwJzpcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIGNhc2UgJ3NldCc6XG4gICAgICAgIC8vIENvbnRhaW5lcnMgYnJlYWsgdGhlIGxheW91dCBjaGFpbiBhcyB0aGV5IG1heSBiZSBlbXB0eS5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICB0eXBlLmZpZWxkcy5cbiAgICAgICAgICBmaWx0ZXIoZmllbGQgPT4gIWZpZWxkLm9wdGlvbmFsKS5cbiAgICAgICAgICBtYXAoZmllbGQgPT4gZmllbGQudHlwZSkuXG4gICAgICAgICAgZm9yRWFjaCh2YWxpZGF0ZVR5cGVSZWMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R1cGxlJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKHZhbGlkYXRlVHlwZVJlYyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5pb24nOlxuICAgICAgICAvLyBVbmlvbiB0eXBlcyBicmVhayB0aGUgbGF5b3V0IGNoYWluLlxuICAgICAgICAvLyBUT0RPOiBTdHJpY3RseSB3ZSBzaG91bGQgZGV0ZWN0IGFsdGVybmF0ZXMgd2hpY2ggZGlyZWN0bHkgY29udGFpbiB0aGVpciBwYXJlbnQgdW5pb24sXG4gICAgICAgIC8vIG9yIGlmIGFsbCBhbHRlcm5hdGVzIGluZGlyZWN0bHkgY29udGFpbiB0aGUgcGFyZW50IHVuaW9uLlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ludGVyc2VjdGlvbic6XG4gICAgICAgIHR5cGUudHlwZXMuZm9yRWFjaCh2YWxpZGF0ZVR5cGVSZWMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICduYW1lZCc6XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0eXBlLm5hbWU7XG4gICAgICAgIC8vICRGbG93Rml4TWUocGV0ZXJoYWwpXG4gICAgICAgIGNvbnN0IGRlZmluaXRpb246IEFsaWFzRGVmaW5pdGlvbiB8IEludGVyZmFjZURlZmluaXRpb24gPSBuYW1lZFR5cGVzLmdldChuYW1lKTtcbiAgICAgICAgaWYgKGNvbnRhaW5pbmdEZWZpbml0aW9ucy5pbmRleE9mKChkZWZpbml0aW9uOiBhbnkpKSAhPT0gLTEpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvckRlZmluaXRpb25zKFxuICAgICAgICAgICAgKGNvbnRhaW5pbmdEZWZpbml0aW9ucy5zbGljZShjb250YWluaW5nRGVmaW5pdGlvbnMuaW5kZXhPZigoZGVmaW5pdGlvbjogYW55KSkpOiBhbnkpLFxuICAgICAgICAgICAgYFR5cGUgJHtuYW1lfSBjb250YWlucyBpdHNlbGYuYCk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbi5raW5kID09PSAnYWxpYXMnICYmIGRlZmluaXRpb24uZGVmaW5pdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgY29udGFpbmluZ0RlZmluaXRpb25zLnB1c2goZGVmaW5pdGlvbik7XG4gICAgICAgICAgaW52YXJpYW50KGRlZmluaXRpb24uZGVmaW5pdGlvbik7XG4gICAgICAgICAgdmFsaWRhdGVMYXlvdXRSZWMoY29udGFpbmluZ0RlZmluaXRpb25zLCBkZWZpbml0aW9uLmRlZmluaXRpb24pO1xuICAgICAgICAgIGNvbnRhaW5pbmdEZWZpbml0aW9ucy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh0eXBlKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVSZXR1cm5UeXBlcygpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRlZmluaXRpb24gb2YgZGVmaW5pdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICB2YWxpZGF0ZVR5cGUoZGVmaW5pdGlvbi50eXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgIGlmIChkZWZpbml0aW9uLmRlZmluaXRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgdmFsaWRhdGVBbGlhc1R5cGUoZGVmaW5pdGlvbi5kZWZpbml0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICAgICAgZGVmaW5pdGlvbi5jb25zdHJ1Y3RvckFyZ3MuZm9yRWFjaCh2YWxpZGF0ZVR5cGUpO1xuICAgICAgICAgIGRlZmluaXRpb24uaW5zdGFuY2VNZXRob2RzLmZvckVhY2godmFsaWRhdGVUeXBlKTtcbiAgICAgICAgICBkZWZpbml0aW9uLnN0YXRpY01ldGhvZHMuZm9yRWFjaCh2YWxpZGF0ZVR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFZhbGlkYXRlcyBhIHR5cGUgd2hpY2ggbXVzdCBiZSBhIHJldHVybiB0eXBlLlxuICAvLyBDYWxsZXIgbXVzdCByZXNvbHZlIG5hbWVkIHR5cGVzLlxuICBmdW5jdGlvbiB2YWxpZGF0ZVJldHVyblR5cGUoZnVuY1R5cGU6IEZ1bmN0aW9uVHlwZSwgdHlwZTogVHlwZSk6IHZvaWQge1xuICAgIGZ1bmN0aW9uIGludmFsaWRSZXR1cm5UeXBlRXJyb3IoKTogRXJyb3Ige1xuICAgICAgcmV0dXJuIGVycm9yKGZ1bmNUeXBlLFxuICAgICAgICBgVGhlIHJldHVybiB0eXBlIG9mIGEgcmVtb3RlIGZ1bmN0aW9uIG11c3QgYmUgb2YgdHlwZSBWb2lkLCBQcm9taXNlLCBvciBPYnNlcnZhYmxlYCk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIGlmICh0eXBlLnR5cGUua2luZCAhPT0gJ3ZvaWQnKSB7XG4gICAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBpbnZhbGlkUmV0dXJuVHlwZUVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWxpYXNlcyBtYXkgYmUgcmV0dXJuIHR5cGVzLCBvciBub24tcmV0dXJuIHR5cGVzLlxuICBmdW5jdGlvbiB2YWxpZGF0ZUFsaWFzVHlwZSh0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIGlmICh0eXBlLnR5cGUua2luZCAhPT0gJ3ZvaWQnKSB7XG4gICAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICduYW1lZCc6XG4gICAgICAgIC8vIE5vIG5lZWQgdG8gcmVjdXJzZSwgYXMgdGhlIHRhcmdldCBhbGlhcyBkZWZpbml0aW9uIHdpbGwgZ2V0IHZhbGlkYXRlZCBzZXBlcmF0ZWx5LlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhbGlkYXRlVHlwZSh0eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNMaXRlcmFsVHlwZSh0eXBlOiBUeXBlKTogYm9vbGVhbiB7XG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ3N0cmluZy1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ251bWJlci1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4tbGl0ZXJhbCc6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlSW50ZXJzZWN0aW9uVHlwZShpbnRlcnNlY3Rpb25UeXBlOiBJbnRlcnNlY3Rpb25UeXBlKTogdm9pZCB7XG4gICAgY29uc3QgZmllbGRzID0gZmxhdHRlbkludGVyc2VjdGlvbihpbnRlcnNlY3Rpb25UeXBlKTtcbiAgICBjb25zdCBmaWVsZE5hbWVUb0xvY2F0aW9uID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XG4gICAgICBpZiAoZmllbGROYW1lVG9Mb2NhdGlvbi5oYXMoZmllbGQubmFtZSkpIHtcbiAgICAgICAgLy8gVE9ETyBhbGxvdyBkdXBsaWNhdGUgZmllbGQgbmFtZXMgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHR5cGUuXG4gICAgICAgIGNvbnN0IG90aGVyTG9jYXRpb24gPSBmaWVsZE5hbWVUb0xvY2F0aW9uLmdldChmaWVsZC5uYW1lKTtcbiAgICAgICAgaW52YXJpYW50KG90aGVyTG9jYXRpb24gIT0gbnVsbCk7XG4gICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFxuICAgICAgICAgIFtpbnRlcnNlY3Rpb25UeXBlLmxvY2F0aW9uLCBmaWVsZC5sb2NhdGlvbiwgb3RoZXJMb2NhdGlvbl0sXG4gICAgICAgICAgYER1cGxpY2F0ZSBmaWVsZCBuYW1lICcke2ZpZWxkLm5hbWV9JyBpbiBpbnRlcnNlY3Rpb24gdHlwZXMgYXJlIG5vdCBzdXBwb3J0ZWQuYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGZpZWxkTmFtZVRvTG9jYXRpb24uc2V0KGZpZWxkLm5hbWUsIGZpZWxkLmxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZVVuaW9uVHlwZSh0eXBlOiBVbmlvblR5cGUpOiB2b2lkIHtcbiAgICBjb25zdCBhbHRlcm5hdGVzID0gZmxhdHRlblVuaW9uQWx0ZXJuYXRlcyh0eXBlLnR5cGVzKTtcblxuICAgIGlmIChpc0xpdGVyYWxUeXBlKGFsdGVybmF0ZXNbMF0pKSB7XG4gICAgICB2YWxpZGF0ZUxpdGVyYWxVbmlvblR5cGUodHlwZSwgYWx0ZXJuYXRlcyk7XG4gICAgfSBlbHNlIGlmIChhbHRlcm5hdGVzWzBdLmtpbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YWxpZGF0ZU9iamVjdFVuaW9uVHlwZSh0eXBlLCBhbHRlcm5hdGVzKTtcbiAgICB9ICBlbHNlIHtcbiAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBhbHRlcm5hdGVzWzBdLmxvY2F0aW9uXSxcbiAgICAgICAgYFVuaW9uIGFsdGVybmF0ZXMgbXVzdCBiZSBlaXRoZXIgYmUgdHlwZWQgb2JqZWN0IG9yIGxpdGVyYWwgdHlwZXMuYCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVMaXRlcmFsVW5pb25UeXBlKHR5cGU6IFVuaW9uVHlwZSwgYWx0ZXJuYXRlczogQXJyYXk8VHlwZT4pOiB2b2lkIHtcbiAgICBhbHRlcm5hdGVzLnJlZHVjZSgocHJldmlvdXNBbHRlcm5hdGVzLCBhbHRlcm5hdGUpID0+IHtcbiAgICAgIHZhbGlkYXRlVHlwZShhbHRlcm5hdGUpO1xuXG4gICAgICAvLyBFbnN1cmUgYSB2YWxpZCBhbHRlcm5hdGVcbiAgICAgIGlmICghaXNMaXRlcmFsVHlwZShhbHRlcm5hdGUpKSB7XG4gICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBhbHRlcm5hdGUubG9jYXRpb25dLFxuICAgICAgICAgIGBVbmlvbiBhbHRlcm5hdGVzIG1heSBvbmx5IGJlIGxpdGVyYWwgdHlwZXMuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVuc3VyZSBubyBkdXBsaWNhdGVzXG4gICAgICBwcmV2aW91c0FsdGVybmF0ZXMuZm9yRWFjaChwcmV2aW91cyA9PiB7XG4gICAgICAgIGludmFyaWFudChwcmV2aW91cy5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IHByZXZpb3VzLmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgICAgIHx8IHByZXZpb3VzLmtpbmQgPT09ICdib29sZWFuLWxpdGVyYWwnKTtcbiAgICAgICAgaW52YXJpYW50KGFsdGVybmF0ZS5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IGFsdGVybmF0ZS5raW5kID09PSAnbnVtYmVyLWxpdGVyYWwnXG4gICAgICAgICAgICB8fCBhbHRlcm5hdGUua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgICBpZiAocHJldmlvdXMudmFsdWUgPT09IGFsdGVybmF0ZS52YWx1ZSkge1xuICAgICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBwcmV2aW91cy5sb2NhdGlvbiwgYWx0ZXJuYXRlLmxvY2F0aW9uXSxcbiAgICAgICAgICAgIGBVbmlvbiBhbHRlcm5hdGVzIG1heSBub3QgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByZXZpb3VzQWx0ZXJuYXRlcy5wdXNoKGFsdGVybmF0ZSk7XG4gICAgICByZXR1cm4gcHJldmlvdXNBbHRlcm5hdGVzO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0VW5pb25UeXBlKHR5cGU6IFVuaW9uVHlwZSwgYWx0ZXJuYXRlczogQXJyYXk8VHlwZT4pOiB2b2lkIHtcbiAgICBhbHRlcm5hdGVzLmZvckVhY2goYWx0ZXJuYXRlID0+IHtcbiAgICAgIHZhbGlkYXRlVHlwZShhbHRlcm5hdGUpO1xuXG4gICAgICAvLyBFbnN1cmUgYWx0ZXJuYXRlcyBtYXRjaFxuICAgICAgaWYgKGFsdGVybmF0ZS5raW5kICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBlcnJvckxvY2F0aW9ucyhbdHlwZS5sb2NhdGlvbiwgYWx0ZXJuYXRlc1swXS5sb2NhdGlvbiwgYWx0ZXJuYXRlLmxvY2F0aW9uXSxcbiAgICAgICAgICBgVW5pb24gYWx0ZXJuYXRlcyBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUuYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0eXBlLmRpc2NyaW1pbmFudEZpZWxkID0gZmluZE9iamVjdFVuaW9uRGlzY3JpbWluYW50KHR5cGUsIChhbHRlcm5hdGVzOiBBcnJheTxhbnk+KSk7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kT2JqZWN0VW5pb25EaXNjcmltaW5hbnQodHlwZTogVW5pb25UeXBlLCBhbHRlcm5hdGVzOiBBcnJheTxPYmplY3RUeXBlPik6IHN0cmluZyB7XG4gICAgLy8gR2V0IHNldCBvZiBmaWVsZHMgd2hpY2ggYXJlIGxpdGVyYWwgdHlwZXMgaW4gYWwgYWx0ZXJuYXRlcy5cbiAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlcy5sZW5ndGggPiAwKTtcbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgY29uc3QgcG9zc2libGVGaWVsZHM6IFNldDxzdHJpbmc+ID0gYWx0ZXJuYXRlcy5yZWR1Y2UoXG4gICAgICAocG9zc2liaWxpdGllczogP1NldDxzdHJpbmc+LCBhbHRlcm5hdGU6IE9iamVjdFR5cGUpID0+IHtcbiAgICAgICAgY29uc3QgYWx0ZXJuYXRlUG9zc2liaWxpdGllcyA9IHBvc3NpYmxlRGlzY3JpbWluYW50RmllbGRzT2ZVbmlvbkFsdGVybmF0ZShhbHRlcm5hdGUpO1xuICAgICAgICBpZiAoYWx0ZXJuYXRlUG9zc2liaWxpdGllcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb24sIGFsdGVybmF0ZS5sb2NhdGlvbl0sXG4gICAgICAgICAgICBgT2JqZWN0IHVuaW9uIGFsdGVybmF0aXZlIGhhcyBubyBwb3NzaWJsZSBkaXNjcmltaW5hbnQgZmllbGRzLmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFVzZSBudWxsIHRvIHJlcHJlc2VudCB0aGUgc2V0IGNvbnRhaW5pbmcgZXZlcnl0aGluZy5cbiAgICAgICAgaWYgKHBvc3NpYmlsaXRpZXMgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBhbHRlcm5hdGVQb3NzaWJpbGl0aWVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzZXQuaW50ZXJzZWN0KGFsdGVybmF0ZVBvc3NpYmlsaXRpZXMsIHBvc3NpYmlsaXRpZXMpO1xuICAgICAgICB9XG4gICAgICB9LCBudWxsKTtcblxuICAgIGNvbnN0IHZhbGlkRmllbGRzID0gYXJyYXkuZnJvbShwb3NzaWJsZUZpZWxkcykuXG4gICAgICAgIGZpbHRlcihmaWVsZE5hbWUgPT4gaXNWYWxpZERpc2NyaW1pbmFudEZpZWxkKGFsdGVybmF0ZXMsIGZpZWxkTmFtZSkpO1xuICAgIGlmICh2YWxpZEZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgdmFsaWQgZGlzY3JpbWluYW50IGZpZWxkcywgd2UganVzdCBwaWNrIHRoZSBmaXJzdC5cbiAgICAgIHJldHVybiB2YWxpZEZpZWxkc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogQmV0dGVyIGVycm9yIG1lc3NhZ2Ugd2h5IGVhY2ggcG9zc2libGVGaWVsZHMgaXMgaW52YWxpZC5cbiAgICAgIHRocm93IGVycm9yKHR5cGUsICdObyB2YWxpZCBkaXNjcmltaW5hbnQgZmllbGQgZm9yIHVuaW9uIHR5cGUuJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNWYWxpZERpc2NyaW1pbmFudEZpZWxkKGFsdGVybmF0ZXM6IEFycmF5PE9iamVjdFR5cGU+LFxuICAgICAgY2FuZGlkYXRlRmllbGQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBmaWVsZFR5cGVzOiBBcnJheTxMaXRlcmFsVHlwZT4gPSBhbHRlcm5hdGVzLm1hcChcbiAgICAgIGFsdGVybmF0ZSA9PiByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUoZ2V0T2JqZWN0RmllbGRCeU5hbWUoYWx0ZXJuYXRlLCBjYW5kaWRhdGVGaWVsZCkudHlwZSkpO1xuXG4gICAgLy8gRmllbGRzIGluIGFsbCBhbHRlcm5hdGVzIG11c3QgaGF2ZSBzYW1lIHR5cGUuXG4gICAgaWYgKCFmaWVsZFR5cGVzLmV2ZXJ5KGZpZWxkVHlwZSA9PiBmaWVsZFR5cGUua2luZCA9PT0gZmllbGRUeXBlc1swXS5raW5kKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIE11c3Qgbm90IGhhdmUgZHVwbGljYXRlIHZhbHVlcyBpbiBhbnkgYWx0ZXJuYXRlLlxuICAgIC8vIEFsbCBhbHRlcm5hdGVzIG11c3QgYmUgdW5pcXVlLlxuICAgIHJldHVybiAobmV3IFNldChmaWVsZFR5cGVzLm1hcChmaWVsZFR5cGUgPT4gZmllbGRUeXBlLnZhbHVlKSkpLnNpemUgPT09IGFsdGVybmF0ZXMubGVuZ3RoO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0T2JqZWN0RmllbGRCeU5hbWUodHlwZTogT2JqZWN0VHlwZSwgZmllbGROYW1lOiBzdHJpbmcpOiBPYmplY3RGaWVsZCB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXJyYXkuZmluZCh0eXBlLmZpZWxkcywgZmllbGQgPT4gZmllbGQubmFtZSA9PT0gZmllbGROYW1lKTtcbiAgICBpbnZhcmlhbnQocmVzdWx0ICE9IG51bGwpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBwb3NzaWJsZURpc2NyaW1pbmFudEZpZWxkc09mVW5pb25BbHRlcm5hdGUoYWx0ZXJuYXRlOiBPYmplY3RUeXBlKTogU2V0PHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgU2V0KGFsdGVybmF0ZS5maWVsZHNcbiAgICAgICAgLmZpbHRlcihmaWVsZCA9PiBpc0xpdGVyYWxUeXBlKHJlc29sdmVQb3NzaWJseU5hbWVkVHlwZShmaWVsZC50eXBlKSkpXG4gICAgICAgIC5tYXAoZmllbGQgPT4gZmllbGQubmFtZSkpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGVzIGEgdHlwZSB3aGljaCBpcyBub3QgZGlyZWN0bHkgYSByZXR1cm4gdHlwZS5cbiAgZnVuY3Rpb24gdmFsaWRhdGVUeXBlKHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAnYW55JzpcbiAgICAgIGNhc2UgJ21peGVkJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmctbGl0ZXJhbCc6XG4gICAgICBjYXNlICdib29sZWFuLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnbnVtYmVyLWxpdGVyYWwnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgdGhyb3cgZXJyb3IodHlwZSwgJ1Byb21pc2UsIHZvaWQgYW5kIE9ic2VydmFibGUgdHlwZXMgbWF5IG9ubHkgYmUgdXNlZCBhcyByZXR1cm4gdHlwZXMnKTtcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2V0JzpcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbnVsbGFibGUnOlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXAnOlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS5rZXlUeXBlKTtcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudmFsdWVUeXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICB0eXBlLmZpZWxkcy5tYXAoZmllbGQgPT4gZmllbGQudHlwZSkuZm9yRWFjaCh2YWxpZGF0ZVR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R1cGxlJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5pb24nOlxuICAgICAgICB2YWxpZGF0ZVVuaW9uVHlwZSh0eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbnRlcnNlY3Rpb24nOlxuICAgICAgICB2YWxpZGF0ZUludGVyc2VjdGlvblR5cGUodHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICB0eXBlLmFyZ3VtZW50VHlwZXMuZm9yRWFjaCh2YWxpZGF0ZVR5cGUpO1xuICAgICAgICB2YWxpZGF0ZVJldHVyblR5cGUodHlwZSwgcmVzb2x2ZVBvc3NpYmx5TmFtZWRUeXBlKHR5cGUucmV0dXJuVHlwZSkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWVkJzpcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRUeXBlID0gcmVzb2x2ZU5hbWVkVHlwZSh0eXBlKTtcbiAgICAgICAgLy8gTm90ZTogV2UgZG8gbm90IHJlY3Vyc2UgaGVyZSBhcyB0eXBlcyBtYXkgYmUgc2VsZi1yZWN1cnNpdmUgKHRocm91Z2ggbnVsbGFibGUgZm9yXG4gICAgICAgIC8vIGV4YW1wbGUpLlxuICAgICAgICAvLyBUaGUgcmVzb2x2ZWRUeXBlIHdpbGwgYWxyZWFkeSBoYXZlIGJlZW4gY2hlY2tlZCB0byBiZSBhIHZhbGlkIGFsaWFzIHR5cGUuXG4gICAgICAgIC8vIHNvIHdlIG9ubHkgbmVlZCB0byBjaGVjayB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIGFsaWFzIHR5cGVzIGFuZCBub24tcmV0dXJuIHR5cGVzLlxuICAgICAgICBzd2l0Y2ggKHJlc29sdmVkVHlwZS5raW5kKSB7XG4gICAgICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgICAgICB0aHJvdyBlcnJvcih0eXBlLFxuICAgICAgICAgICAgICAnUHJvbWlzZSwgdm9pZCBhbmQgT2JzZXJ2YWJsZSB0eXBlcyBtYXkgb25seSBiZSB1c2VkIGFzIHJldHVybiB0eXBlcycpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHR5cGUpKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXBsYWNlcyBhbGwgdXNlcyBvZiB0eXBlIGFsaWFzZXMgaW4gcmV0dXJuIHR5cGVzIHdpdGggdGhlaXIgZGVmaW5pdGlvblxuICAvLyBzbyB0aGF0IGNsaWVudHMgbmVlZCBub3QgYmUgYXdhcmUgb2YgYWxpYXNlcy5cbiAgLy8gVE9ETzogU2hvdWxkIHJlcGxhY2UgYWxsIGFsaWFzZXMsIGhvd2V2ZXIgdGhhdCB3aWxsIHJlcXVpcmUgcmV3cml0aW5nIG1hcnNhbGxpbmcuXG4gIGZ1bmN0aW9uIGNhbm5vbmljYWxpemUoKTogdm9pZCB7XG4gICAgdmlzaXRBbGxUeXBlcyhjYW5ub25pY2FsaXplVHlwZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5ub25pY2FsaXplVHlwZUFycmF5KHR5cGVzOiBBcnJheTxUeXBlPik6IHZvaWQge1xuICAgIHR5cGVzLmZvckVhY2goY2Fubm9uaWNhbGl6ZVR5cGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2Fubm9uaWNhbGl6ZVR5cGUodHlwZTogVHlwZSk6IHZvaWQge1xuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICdhbnknOlxuICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZy1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4tbGl0ZXJhbCc6XG4gICAgICBjYXNlICdudW1iZXItbGl0ZXJhbCc6XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2V0JzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdudWxsYWJsZSc6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWFwJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS5rZXlUeXBlKTtcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS52YWx1ZVR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIHR5cGUuZmllbGRzLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgIGNhbm5vbmljYWxpemVUeXBlKGZpZWxkLnR5cGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0dXBsZSc6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZS50eXBlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5pb24nOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZUFycmF5KHR5cGUudHlwZXMpO1xuICAgICAgICB0eXBlLnR5cGVzID0gZmxhdHRlblVuaW9uQWx0ZXJuYXRlcyh0eXBlLnR5cGVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbnRlcnNlY3Rpb24nOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZUFycmF5KHR5cGUudHlwZXMpO1xuICAgICAgICBjYW5vbmljYWxpemVJbnRlcnNlY3Rpb24odHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZUFycmF5KHR5cGUuYXJndW1lbnRUeXBlcyk7XG4gICAgICAgIHR5cGUucmV0dXJuVHlwZSA9IHJlc29sdmVQb3NzaWJseU5hbWVkVHlwZSh0eXBlLnJldHVyblR5cGUpO1xuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnJldHVyblR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWVkJzpcbiAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgcmVjdXJzZSwgc28gdGhlIGFsZ29yaXRobSB3aWxsIGFsd2F5cyB0ZXJtaW5hdGUuXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHR5cGUpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjYW5vbmljYWxpemVJbnRlcnNlY3Rpb24oaW50ZXJzZWN0aW9uVHlwZTogSW50ZXJzZWN0aW9uVHlwZSk6IHZvaWQge1xuICAgIGNvbnN0IGZpZWxkcyA9IGZsYXR0ZW5JbnRlcnNlY3Rpb24oaW50ZXJzZWN0aW9uVHlwZSk7XG4gICAgaW50ZXJzZWN0aW9uVHlwZS5mbGF0dGVuZWQgPSB7XG4gICAgICBraW5kOiAnb2JqZWN0JyxcbiAgICAgIGxvY2F0aW9uOiBpbnRlcnNlY3Rpb25UeXBlLmxvY2F0aW9uLFxuICAgICAgZmllbGRzLFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBmbGF0dGVuSW50ZXJzZWN0aW9uKGludGVyc2VjdGlvblR5cGU6IEludGVyc2VjdGlvblR5cGUpOiBBcnJheTxPYmplY3RGaWVsZD4ge1xuICAgIGNvbnN0IGZpZWxkcyA9IFtdO1xuICAgIGZvciAoY29uc3QgdHlwZSBvZiBpbnRlcnNlY3Rpb25UeXBlLnR5cGVzKSB7XG4gICAgICBjb25zdCByZXNvbHZlZFR5cGUgPSByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUodHlwZSk7XG4gICAgICBpZiAocmVzb2x2ZWRUeXBlLmtpbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZpZWxkcy5wdXNoKC4uLnJlc29sdmVkVHlwZS5maWVsZHMpO1xuICAgICAgfSBlbHNlIGlmIChyZXNvbHZlZFR5cGUua2luZCA9PT0gJ2ludGVyc2VjdGlvbicpIHtcbiAgICAgICAgZmllbGRzLnB1c2goLi4uZmxhdHRlbkludGVyc2VjdGlvbihyZXNvbHZlZFR5cGUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFxuICAgICAgICAgIFtpbnRlcnNlY3Rpb25UeXBlLmxvY2F0aW9uLCB0eXBlLmxvY2F0aW9uXSxcbiAgICAgICAgICAnVHlwZXMgaW4gaW50ZXJzZWN0aW9ucyBtdXN0IGJlIG9iamVjdCBvciBpbnRlcnNlY3Rpb24gdHlwZXMnLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmllbGRzO1xuICB9XG5cbiAgLy8gV2lsbCByZXR1cm4gYSBuYW1lZCB0eXBlIGlmIGFuZCBvbmx5IGlmIHRoZSBhbGlhcyByZXNvbHZlcyB0byBhIGJ1aWx0aW4gdHlwZSwgb3IgYW4gaW50ZXJmYWNlLlxuICBmdW5jdGlvbiByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUodHlwZTogVHlwZSk6IFR5cGUge1xuICAgIGlmICh0eXBlLmtpbmQgPT09ICduYW1lZCcpIHtcbiAgICAgIHJldHVybiByZXNvbHZlTmFtZWRUeXBlKHR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmbGF0dGVuVW5pb25BbHRlcm5hdGVzKHR5cGVzOiBBcnJheTxUeXBlPik6IEFycmF5PFR5cGU+IHtcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLiB0eXBlcy5tYXAoYWx0ZXJuYXRlID0+IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkQWx0ZXJuYXRlID0gcmVzb2x2ZVBvc3NpYmx5TmFtZWRUeXBlKGFsdGVybmF0ZSk7XG4gICAgICByZXR1cm4gcmVzb2x2ZWRBbHRlcm5hdGUua2luZCA9PT0gJ3VuaW9uJyA/XG4gICAgICAgICAgZmxhdHRlblVuaW9uQWx0ZXJuYXRlcyhyZXNvbHZlZEFsdGVybmF0ZS50eXBlcykgOlxuICAgICAgICAgIHJlc29sdmVkQWx0ZXJuYXRlO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIGRlZmluaXRpb24gb2YgYSBuYW1lZCB0eXBlLiBJZiB0aGUgdHlwZSByZXNvbHZlcyB0byBhbiBhbGlhcyBpdCByZXR1cm5zIHRoZVxuICAvLyBhbGlhcydzIGRlZmluaXRpb24uXG4gIC8vIFdpbGwgcmV0dXJuIGEgbmFtZWQgdHlwZSBpZiBhbmQgb25seSBpZiB0aGUgYWxpYXMgcmVzb2x2ZXMgdG8gYSBidWlsdGluIHR5cGUsIG9yIGFuIGludGVyZmFjZS5cbiAgZnVuY3Rpb24gcmVzb2x2ZU5hbWVkVHlwZShuYW1lZFR5cGU6IE5hbWVkVHlwZSk6IFR5cGUge1xuICAgIGNvbnN0IGRlZiA9IG5hbWVkVHlwZXMuZ2V0KG5hbWVkVHlwZS5uYW1lKTtcbiAgICBpbnZhcmlhbnQoZGVmICE9IG51bGwpO1xuICAgIHN3aXRjaCAoZGVmLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY29uc3QgdHlwZSA9IGRlZi5kZWZpbml0aW9uO1xuICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgIGlmICh0eXBlLmtpbmQgPT09ICduYW1lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlTmFtZWRUeXBlKHR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZWRUeXBlO1xuICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgcmV0dXJuIG5hbWVkVHlwZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBkZWZpbml0aW9uIGtpbmQnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2aXNpdEFsbFR5cGVzKG9wZXJhdGlvbjogKHR5cGU6IFR5cGUpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRlZmluaXRpb24gb2YgZGVmaW5pdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICBvcGVyYXRpb24oZGVmaW5pdGlvbi50eXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgIGlmIChkZWZpbml0aW9uLmRlZmluaXRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgb3BlcmF0aW9uKGRlZmluaXRpb24uZGVmaW5pdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICAgIGRlZmluaXRpb24uY29uc3RydWN0b3JBcmdzLmZvckVhY2gob3BlcmF0aW9uKTtcbiAgICAgICAgICBkZWZpbml0aW9uLmluc3RhbmNlTWV0aG9kcy5mb3JFYWNoKG9wZXJhdGlvbik7XG4gICAgICAgICAgZGVmaW5pdGlvbi5zdGF0aWNNZXRob2RzLmZvckVhY2gob3BlcmF0aW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvcih0eXBlOiBUeXBlLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb25dLCBtZXNzYWdlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVycm9yTG9jYXRpb25zKGxvY2F0aW9uczogQXJyYXk8TG9jYXRpb24+LCBtZXNzYWdlOiBzdHJpbmcpOiBFcnJvciB7XG4gICAgbGV0IGZ1bGxNZXNzYWdlID0gYCR7bG9jYXRpb25Ub1N0cmluZyhsb2NhdGlvbnNbMF0pfToke21lc3NhZ2V9YDtcbiAgICBmdWxsTWVzc2FnZSA9IGZ1bGxNZXNzYWdlLmNvbmNhdChcbiAgICAgIC4uLiAobG9jYXRpb25zLnNsaWNlKDEpLm1hcChsb2NhdGlvbiA9PlxuICAgICAgICBgXFxuJHtsb2NhdGlvblRvU3RyaW5nKGxvY2F0aW9uKX06IFJlbGF0ZWQgbG9jYXRpb25gKSkpO1xuICAgIHJldHVybiBuZXcgRXJyb3IoZnVsbE1lc3NhZ2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXJyb3JEZWZpbml0aW9ucyhkZWZzOiBBcnJheTxEZWZpbml0aW9uPiwgbWVzc2FnZTogc3RyaW5nKTogRXJyb3Ige1xuICAgIGxldCBmdWxsTWVzc2FnZSA9IGAke2xvY2F0aW9uVG9TdHJpbmcoZGVmc1swXS5sb2NhdGlvbil9OiR7bWVzc2FnZX1gO1xuICAgIGZ1bGxNZXNzYWdlID0gZnVsbE1lc3NhZ2UuY29uY2F0KFxuICAgICAgLi4uIChkZWZzLnNsaWNlKDEpLm1hcChkZWZpbml0aW9uID0+XG4gICAgICAgIGBcXG4ke2xvY2F0aW9uVG9TdHJpbmcoZGVmaW5pdGlvbi5sb2NhdGlvbil9OiBSZWxhdGVkIGRlZmluaXRpb24gJHtkZWZpbml0aW9uLm5hbWV9YCkpKTtcbiAgICByZXR1cm4gbmV3IEVycm9yKGZ1bGxNZXNzYWdlKTtcbiAgfVxufVxuIl19