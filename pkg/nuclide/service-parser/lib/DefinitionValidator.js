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

var _commons = require('../../commons');

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
        return _commons.set.intersect(alternatePossibilities, possibilities);
      }
    }, null);

    var validFields = _commons.array.from(possibleFields).filter(function (fieldName) {
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
    var result = _commons.array.find(type.fields, function (field) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlZmluaXRpb25WYWxpZGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBVytCLGlCQUFpQjs7c0JBQzFCLFFBQVE7Ozs7dUJBQ0wsZUFBZTs7Ozs7Ozs7O0FBd0JqQyxTQUFTLG1CQUFtQixDQUFDLFdBQXdCLEVBQVE7QUFDbEUsTUFBTSxVQUE4RCxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakYsa0JBQWdCLEVBQUUsQ0FBQztBQUNuQixVQUFRLEVBQUUsQ0FBQzs7QUFFWCxXQUFTLFFBQVEsR0FBUztBQUN4Qix3QkFBb0IsRUFBRSxDQUFDO0FBQ3ZCLHdCQUFvQixFQUFFLENBQUM7QUFDdkIsdUJBQW1CLEVBQUUsQ0FBQztBQUN0QixpQkFBYSxFQUFFLENBQUM7R0FDakI7O0FBRUQsV0FBUyxvQkFBb0IsR0FBRztBQUM5QixpQkFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7R0FDekM7O0FBRUQsV0FBUyxnQkFBZ0IsR0FBUztBQUNoQyxTQUFLLElBQU0sVUFBVSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUM3QyxjQUFRLFVBQVUsQ0FBQyxJQUFJO0FBQ3JCLGFBQUssT0FBTyxDQUFDO0FBQ2IsYUFBSyxXQUFXO0FBQ2Qsb0JBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1QyxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjtHQUNGOztBQUVELFdBQVMsd0JBQXdCLENBQUMsSUFBVSxFQUFRO0FBQ2xELFlBQVEsSUFBSSxDQUFDLElBQUk7QUFDZixXQUFLLEtBQUssQ0FBQztBQUNYLFdBQUssT0FBTyxDQUFDO0FBQ2IsV0FBSyxRQUFRLENBQUM7QUFDZCxXQUFLLFNBQVMsQ0FBQztBQUNmLFdBQUssUUFBUSxDQUFDO0FBQ2QsV0FBSyxnQkFBZ0IsQ0FBQztBQUN0QixXQUFLLGlCQUFpQixDQUFDO0FBQ3ZCLFdBQUssZ0JBQWdCLENBQUM7QUFD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QUFLLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDL0I7Q0FDRiIsImZpbGUiOiJEZWZpbml0aW9uVmFsaWRhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtsb2NhdGlvblRvU3RyaW5nfSBmcm9tICcuL2J1aWx0aW4tdHlwZXMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHthcnJheSwgc2V0fSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1xuICBEZWZpbml0aW9ucyxcbiAgRGVmaW5pdGlvbixcbiAgQWxpYXNEZWZpbml0aW9uLFxuICBJbnRlcmZhY2VEZWZpbml0aW9uLFxuICBUeXBlLFxuICBGdW5jdGlvblR5cGUsXG4gIE5hbWVkVHlwZSxcbiAgVW5pb25UeXBlLFxuICBJbnRlcnNlY3Rpb25UeXBlLFxuICBPYmplY3RUeXBlLFxuICBPYmplY3RGaWVsZCxcbiAgTGl0ZXJhbFR5cGUsXG4gIExvY2F0aW9uLFxufSBmcm9tICcuL3R5cGVzJztcblxuLyoqXG4gKiBUaHJvd3MgaWYgYSBuYW1lZCB0eXBlIHJlZmVyZW5jZWQgaW4gYW4gUlBDIGludGVyZmFjZSBpcyBub3QgZGVmaW5lZC5cbiAqIFRoZSBlcnJvciBtZXNzYWdlIHRocm93biBpcyBzdWl0YWJsZSBmb3IgZGlzcGxheSB0byBhIGh1bWFuLlxuICpcbiAqIE5PVEU6IFdpbGwgYWxzbyBtdXRhdGUgdGhlIGluY29taW5nIGRlZmluaXRpb25zIGluIHBsYWNlIHRvIG1ha2UgdGhlbSBlYXNpZXIgdG8gbWFyc2hhbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRGVmaW5pdGlvbnMoZGVmaW5pdGlvbnM6IERlZmluaXRpb25zKTogdm9pZCB7XG4gIGNvbnN0IG5hbWVkVHlwZXM6IE1hcDxzdHJpbmcsIEFsaWFzRGVmaW5pdGlvbiB8IEludGVyZmFjZURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuICBnYXRoZXJLbm93blR5cGVzKCk7XG4gIHZhbGlkYXRlKCk7XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoKTogdm9pZCB7XG4gICAgZmluZE1pc3NpbmdUeXBlTmFtZXMoKTtcbiAgICBmaW5kUmVjdXJzaXZlQWxpYXNlcygpO1xuICAgIHZhbGlkYXRlUmV0dXJuVHlwZXMoKTtcbiAgICBjYW5ub25pY2FsaXplKCk7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kTWlzc2luZ1R5cGVOYW1lcygpIHtcbiAgICB2aXNpdEFsbFR5cGVzKGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyk7XG4gIH1cblxuICBmdW5jdGlvbiBnYXRoZXJLbm93blR5cGVzKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZGVmaW5pdGlvbiBvZiBkZWZpbml0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgc3dpdGNoIChkZWZpbml0aW9uLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICAgIG5hbWVkVHlwZXMuc2V0KGRlZmluaXRpb24ubmFtZSwgZGVmaW5pdGlvbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAnYW55JzpcbiAgICAgIGNhc2UgJ21peGVkJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmctbGl0ZXJhbCc6XG4gICAgICBjYXNlICdib29sZWFuLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnbnVtYmVyLWxpdGVyYWwnOlxuICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NldCc6XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ251bGxhYmxlJzpcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbWFwJzpcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUua2V5VHlwZSk7XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnZhbHVlVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgdHlwZS5maWVsZHMubWFwKGZpZWxkID0+IGZpZWxkLnR5cGUpLmZvckVhY2goY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0dXBsZSc6XG4gICAgICAgIHR5cGUudHlwZXMuZm9yRWFjaChjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VuaW9uJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaW50ZXJzZWN0aW9uJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICB0eXBlLmFyZ3VtZW50VHlwZXMuZm9yRWFjaChjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXMpO1xuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS5yZXR1cm5UeXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICduYW1lZCc6XG4gICAgICAgIGNvbnN0IG5hbWUgPSB0eXBlLm5hbWU7XG4gICAgICAgIGlmICghbmFtZWRUeXBlcy5oYXMobmFtZSkpIHtcbiAgICAgICAgICB0aHJvdyBlcnJvcih0eXBlLCBgTm8gZGVmaW5pdGlvbiBmb3IgdHlwZSAke25hbWV9LmApO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHR5cGUpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kUmVjdXJzaXZlQWxpYXNlcygpIHtcbiAgICBmb3IgKGNvbnN0IGRlZmluaXRpb24gb2YgZGVmaW5pdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICBjaGVja0FsaWFzTGF5b3V0KGRlZmluaXRpb24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrQWxpYXNMYXlvdXQoYWxpYXM6IEFsaWFzRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGlmIChhbGlhcy5kZWZpbml0aW9uKSB7XG4gICAgICB2YWxpZGF0ZUxheW91dFJlYyhbYWxpYXNdLCBhbGlhcy5kZWZpbml0aW9uKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGVzIHRoYXQgYSB0eXBlIGRvZXMgbm90IGRpcmVjdGx5IGNvbnRhaW4gYW55IHR5cGVzIHdoaWNoIGFyZSBrbm93biB0b1xuICAgKiBkaXJlY3RseSBvciBpbmRpcmVjdGx5IGNvbnRhaW4gaXQuXG4gICAqXG4gICAqIElmIHJlY3Vyc2lvbiBpcyBmb3VuZCB0aGUgY2hhaW4gb2YgdHlwZXMgd2hpY2ggcmVjdXJzaXZlbHkgY29udGFpbiBlYWNoIG90aGVyIGlzIHJlcG9ydGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVMYXlvdXRSZWMoY29udGFpbmluZ0RlZmluaXRpb25zOiBBcnJheTxBbGlhc0RlZmluaXRpb24+LCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGVUeXBlUmVjKHR5cGVSZWM6IFR5cGUpOiB2b2lkIHtcbiAgICAgIHZhbGlkYXRlTGF5b3V0UmVjKGNvbnRhaW5pbmdEZWZpbml0aW9ucywgdHlwZVJlYyk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2FueSc6XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnYm9vbGVhbi1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ251bWJlci1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIHZhbGlkYXRlVHlwZVJlYyh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ251bGxhYmxlJzpcbiAgICAgICAgLy8gTnVsbGFibGUgYnJlYWtzIHRoZSBsYXlvdXQgY2hhaW5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXAnOlxuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgY2FzZSAnc2V0JzpcbiAgICAgICAgLy8gQ29udGFpbmVycyBicmVhayB0aGUgbGF5b3V0IGNoYWluIGFzIHRoZXkgbWF5IGJlIGVtcHR5LlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIHR5cGUuZmllbGRzLlxuICAgICAgICAgIGZpbHRlcihmaWVsZCA9PiAhZmllbGQub3B0aW9uYWwpLlxuICAgICAgICAgIG1hcChmaWVsZCA9PiBmaWVsZC50eXBlKS5cbiAgICAgICAgICBmb3JFYWNoKHZhbGlkYXRlVHlwZVJlYyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHVwbGUnOlxuICAgICAgICB0eXBlLnR5cGVzLmZvckVhY2godmFsaWRhdGVUeXBlUmVjKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIC8vIFVuaW9uIHR5cGVzIGJyZWFrIHRoZSBsYXlvdXQgY2hhaW4uXG4gICAgICAgIC8vIFRPRE86IFN0cmljdGx5IHdlIHNob3VsZCBkZXRlY3QgYWx0ZXJuYXRlcyB3aGljaCBkaXJlY3RseSBjb250YWluIHRoZWlyIHBhcmVudCB1bmlvbixcbiAgICAgICAgLy8gb3IgaWYgYWxsIGFsdGVybmF0ZXMgaW5kaXJlY3RseSBjb250YWluIHRoZSBwYXJlbnQgdW5pb24uXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaW50ZXJzZWN0aW9uJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKHZhbGlkYXRlVHlwZVJlYyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWVkJzpcbiAgICAgICAgY29uc3QgbmFtZSA9IHR5cGUubmFtZTtcbiAgICAgICAgLy8gJEZsb3dGaXhNZShwZXRlcmhhbClcbiAgICAgICAgY29uc3QgZGVmaW5pdGlvbjogQWxpYXNEZWZpbml0aW9uIHwgSW50ZXJmYWNlRGVmaW5pdGlvbiA9IG5hbWVkVHlwZXMuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAoY29udGFpbmluZ0RlZmluaXRpb25zLmluZGV4T2YoKGRlZmluaXRpb246IGFueSkpICE9PSAtMSkge1xuICAgICAgICAgIHRocm93IGVycm9yRGVmaW5pdGlvbnMoXG4gICAgICAgICAgICAoY29udGFpbmluZ0RlZmluaXRpb25zLnNsaWNlKGNvbnRhaW5pbmdEZWZpbml0aW9ucy5pbmRleE9mKChkZWZpbml0aW9uOiBhbnkpKSk6IGFueSksXG4gICAgICAgICAgICBgVHlwZSAke25hbWV9IGNvbnRhaW5zIGl0c2VsZi5gKTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbml0aW9uLmtpbmQgPT09ICdhbGlhcycgJiYgZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICBjb250YWluaW5nRGVmaW5pdGlvbnMucHVzaChkZWZpbml0aW9uKTtcbiAgICAgICAgICBpbnZhcmlhbnQoZGVmaW5pdGlvbi5kZWZpbml0aW9uKTtcbiAgICAgICAgICB2YWxpZGF0ZUxheW91dFJlYyhjb250YWluaW5nRGVmaW5pdGlvbnMsIGRlZmluaXRpb24uZGVmaW5pdGlvbik7XG4gICAgICAgICAgY29udGFpbmluZ0RlZmluaXRpb25zLnBvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKEpTT04uc3RyaW5naWZ5KHR5cGUpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZVJldHVyblR5cGVzKCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZGVmaW5pdGlvbiBvZiBkZWZpbml0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgc3dpdGNoIChkZWZpbml0aW9uLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgIHZhbGlkYXRlVHlwZShkZWZpbml0aW9uLnR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgaWYgKGRlZmluaXRpb24uZGVmaW5pdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YWxpZGF0ZUFsaWFzVHlwZShkZWZpbml0aW9uLmRlZmluaXRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgICBkZWZpbml0aW9uLmNvbnN0cnVjdG9yQXJncy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgICAgZGVmaW5pdGlvbi5pbnN0YW5jZU1ldGhvZHMuZm9yRWFjaCh2YWxpZGF0ZVR5cGUpO1xuICAgICAgICAgIGRlZmluaXRpb24uc3RhdGljTWV0aG9kcy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gVmFsaWRhdGVzIGEgdHlwZSB3aGljaCBtdXN0IGJlIGEgcmV0dXJuIHR5cGUuXG4gIC8vIENhbGxlciBtdXN0IHJlc29sdmUgbmFtZWQgdHlwZXMuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUmV0dXJuVHlwZShmdW5jVHlwZTogRnVuY3Rpb25UeXBlLCB0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgZnVuY3Rpb24gaW52YWxpZFJldHVyblR5cGVFcnJvcigpOiBFcnJvciB7XG4gICAgICByZXR1cm4gZXJyb3IoZnVuY1R5cGUsXG4gICAgICAgIGBUaGUgcmV0dXJuIHR5cGUgb2YgYSByZW1vdGUgZnVuY3Rpb24gbXVzdCBiZSBvZiB0eXBlIFZvaWQsIFByb21pc2UsIG9yIE9ic2VydmFibGVgKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgaWYgKHR5cGUudHlwZS5raW5kICE9PSAndm9pZCcpIHtcbiAgICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IGludmFsaWRSZXR1cm5UeXBlRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvLyBBbGlhc2VzIG1heSBiZSByZXR1cm4gdHlwZXMsIG9yIG5vbi1yZXR1cm4gdHlwZXMuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQWxpYXNUeXBlKHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgaWYgKHR5cGUudHlwZS5raW5kICE9PSAndm9pZCcpIHtcbiAgICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWVkJzpcbiAgICAgICAgLy8gTm8gbmVlZCB0byByZWN1cnNlLCBhcyB0aGUgdGFyZ2V0IGFsaWFzIGRlZmluaXRpb24gd2lsbCBnZXQgdmFsaWRhdGVkIHNlcGVyYXRlbHkuXG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc0xpdGVyYWxUeXBlKHR5cGU6IFR5cGUpOiBib29sZWFuIHtcbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAnc3RyaW5nLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnbnVtYmVyLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnYm9vbGVhbi1saXRlcmFsJzpcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVJbnRlcnNlY3Rpb25UeXBlKGludGVyc2VjdGlvblR5cGU6IEludGVyc2VjdGlvblR5cGUpOiB2b2lkIHtcbiAgICBjb25zdCBmaWVsZHMgPSBmbGF0dGVuSW50ZXJzZWN0aW9uKGludGVyc2VjdGlvblR5cGUpO1xuICAgIGNvbnN0IGZpZWxkTmFtZVRvTG9jYXRpb24gPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBmaWVsZCBvZiBmaWVsZHMpIHtcbiAgICAgIGlmIChmaWVsZE5hbWVUb0xvY2F0aW9uLmhhcyhmaWVsZC5uYW1lKSkge1xuICAgICAgICAvLyBUT0RPIGFsbG93IGR1cGxpY2F0ZSBmaWVsZCBuYW1lcyBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdHlwZS5cbiAgICAgICAgY29uc3Qgb3RoZXJMb2NhdGlvbiA9IGZpZWxkTmFtZVRvTG9jYXRpb24uZ2V0KGZpZWxkLm5hbWUpO1xuICAgICAgICBpbnZhcmlhbnQob3RoZXJMb2NhdGlvbiAhPSBudWxsKTtcbiAgICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoXG4gICAgICAgICAgW2ludGVyc2VjdGlvblR5cGUubG9jYXRpb24sIGZpZWxkLmxvY2F0aW9uLCBvdGhlckxvY2F0aW9uXSxcbiAgICAgICAgICBgRHVwbGljYXRlIGZpZWxkIG5hbWUgJyR7ZmllbGQubmFtZX0nIGluIGludGVyc2VjdGlvbiB0eXBlcyBhcmUgbm90IHN1cHBvcnRlZC5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgZmllbGROYW1lVG9Mb2NhdGlvbi5zZXQoZmllbGQubmFtZSwgZmllbGQubG9jYXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlVW5pb25UeXBlKHR5cGU6IFVuaW9uVHlwZSk6IHZvaWQge1xuICAgIGNvbnN0IGFsdGVybmF0ZXMgPSBmbGF0dGVuVW5pb25BbHRlcm5hdGVzKHR5cGUudHlwZXMpO1xuXG4gICAgaWYgKGlzTGl0ZXJhbFR5cGUoYWx0ZXJuYXRlc1swXSkpIHtcbiAgICAgIHZhbGlkYXRlTGl0ZXJhbFVuaW9uVHlwZSh0eXBlLCBhbHRlcm5hdGVzKTtcbiAgICB9IGVsc2UgaWYgKGFsdGVybmF0ZXNbMF0ua2luZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhbGlkYXRlT2JqZWN0VW5pb25UeXBlKHR5cGUsIGFsdGVybmF0ZXMpO1xuICAgIH0gIGVsc2Uge1xuICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb24sIGFsdGVybmF0ZXNbMF0ubG9jYXRpb25dLFxuICAgICAgICBgVW5pb24gYWx0ZXJuYXRlcyBtdXN0IGJlIGVpdGhlciBiZSB0eXBlZCBvYmplY3Qgb3IgbGl0ZXJhbCB0eXBlcy5gKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZUxpdGVyYWxVbmlvblR5cGUodHlwZTogVW5pb25UeXBlLCBhbHRlcm5hdGVzOiBBcnJheTxUeXBlPik6IHZvaWQge1xuICAgIGFsdGVybmF0ZXMucmVkdWNlKChwcmV2aW91c0FsdGVybmF0ZXMsIGFsdGVybmF0ZSkgPT4ge1xuICAgICAgdmFsaWRhdGVUeXBlKGFsdGVybmF0ZSk7XG5cbiAgICAgIC8vIEVuc3VyZSBhIHZhbGlkIGFsdGVybmF0ZVxuICAgICAgaWYgKCFpc0xpdGVyYWxUeXBlKGFsdGVybmF0ZSkpIHtcbiAgICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb24sIGFsdGVybmF0ZS5sb2NhdGlvbl0sXG4gICAgICAgICAgYFVuaW9uIGFsdGVybmF0ZXMgbWF5IG9ubHkgYmUgbGl0ZXJhbCB0eXBlcy5gKTtcbiAgICAgIH1cblxuICAgICAgLy8gRW5zdXJlIG5vIGR1cGxpY2F0ZXNcbiAgICAgIHByZXZpb3VzQWx0ZXJuYXRlcy5mb3JFYWNoKHByZXZpb3VzID0+IHtcbiAgICAgICAgaW52YXJpYW50KHByZXZpb3VzLmtpbmQgPT09ICdzdHJpbmctbGl0ZXJhbCcgfHwgcHJldmlvdXMua2luZCA9PT0gJ251bWJlci1saXRlcmFsJ1xuICAgICAgICAgICAgfHwgcHJldmlvdXMua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlLmtpbmQgPT09ICdzdHJpbmctbGl0ZXJhbCcgfHwgYWx0ZXJuYXRlLmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgICAgIHx8IGFsdGVybmF0ZS5raW5kID09PSAnYm9vbGVhbi1saXRlcmFsJyk7XG4gICAgICAgIGlmIChwcmV2aW91cy52YWx1ZSA9PT0gYWx0ZXJuYXRlLnZhbHVlKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb24sIHByZXZpb3VzLmxvY2F0aW9uLCBhbHRlcm5hdGUubG9jYXRpb25dLFxuICAgICAgICAgICAgYFVuaW9uIGFsdGVybmF0ZXMgbWF5IG5vdCBoYXZlIHRoZSBzYW1lIHZhbHVlLmApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcHJldmlvdXNBbHRlcm5hdGVzLnB1c2goYWx0ZXJuYXRlKTtcbiAgICAgIHJldHVybiBwcmV2aW91c0FsdGVybmF0ZXM7XG4gICAgfSwgW10pO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVPYmplY3RVbmlvblR5cGUodHlwZTogVW5pb25UeXBlLCBhbHRlcm5hdGVzOiBBcnJheTxUeXBlPik6IHZvaWQge1xuICAgIGFsdGVybmF0ZXMuZm9yRWFjaChhbHRlcm5hdGUgPT4ge1xuICAgICAgdmFsaWRhdGVUeXBlKGFsdGVybmF0ZSk7XG5cbiAgICAgIC8vIEVuc3VyZSBhbHRlcm5hdGVzIG1hdGNoXG4gICAgICBpZiAoYWx0ZXJuYXRlLmtpbmQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBhbHRlcm5hdGVzWzBdLmxvY2F0aW9uLCBhbHRlcm5hdGUubG9jYXRpb25dLFxuICAgICAgICAgIGBVbmlvbiBhbHRlcm5hdGVzIG11c3QgYmUgb2YgdGhlIHNhbWUgdHlwZS5gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHR5cGUuZGlzY3JpbWluYW50RmllbGQgPSBmaW5kT2JqZWN0VW5pb25EaXNjcmltaW5hbnQodHlwZSwgKGFsdGVybmF0ZXM6IEFycmF5PGFueT4pKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRPYmplY3RVbmlvbkRpc2NyaW1pbmFudCh0eXBlOiBVbmlvblR5cGUsIGFsdGVybmF0ZXM6IEFycmF5PE9iamVjdFR5cGU+KTogc3RyaW5nIHtcbiAgICAvLyBHZXQgc2V0IG9mIGZpZWxkcyB3aGljaCBhcmUgbGl0ZXJhbCB0eXBlcyBpbiBhbCBhbHRlcm5hdGVzLlxuICAgIGludmFyaWFudChhbHRlcm5hdGVzLmxlbmd0aCA+IDApO1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBwb3NzaWJsZUZpZWxkczogU2V0PHN0cmluZz4gPSBhbHRlcm5hdGVzLnJlZHVjZShcbiAgICAgIChwb3NzaWJpbGl0aWVzOiA/U2V0PHN0cmluZz4sIGFsdGVybmF0ZTogT2JqZWN0VHlwZSkgPT4ge1xuICAgICAgICBjb25zdCBhbHRlcm5hdGVQb3NzaWJpbGl0aWVzID0gcG9zc2libGVEaXNjcmltaW5hbnRGaWVsZHNPZlVuaW9uQWx0ZXJuYXRlKGFsdGVybmF0ZSk7XG4gICAgICAgIGlmIChhbHRlcm5hdGVQb3NzaWJpbGl0aWVzLnNpemUgPT09IDApIHtcbiAgICAgICAgICB0aHJvdyBlcnJvckxvY2F0aW9ucyhbdHlwZS5sb2NhdGlvbiwgYWx0ZXJuYXRlLmxvY2F0aW9uXSxcbiAgICAgICAgICAgIGBPYmplY3QgdW5pb24gYWx0ZXJuYXRpdmUgaGFzIG5vIHBvc3NpYmxlIGRpc2NyaW1pbmFudCBmaWVsZHMuYCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gVXNlIG51bGwgdG8gcmVwcmVzZW50IHRoZSBzZXQgY29udGFpbmluZyBldmVyeXRoaW5nLlxuICAgICAgICBpZiAocG9zc2liaWxpdGllcyA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIGFsdGVybmF0ZVBvc3NpYmlsaXRpZXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHNldC5pbnRlcnNlY3QoYWx0ZXJuYXRlUG9zc2liaWxpdGllcywgcG9zc2liaWxpdGllcyk7XG4gICAgICAgIH1cbiAgICAgIH0sIG51bGwpO1xuXG4gICAgY29uc3QgdmFsaWRGaWVsZHMgPSBhcnJheS5mcm9tKHBvc3NpYmxlRmllbGRzKS5cbiAgICAgICAgZmlsdGVyKGZpZWxkTmFtZSA9PiBpc1ZhbGlkRGlzY3JpbWluYW50RmllbGQoYWx0ZXJuYXRlcywgZmllbGROYW1lKSk7XG4gICAgaWYgKHZhbGlkRmllbGRzLmxlbmd0aCA+IDApIHtcbiAgICAgIC8vIElmIHRoZXJlIGFyZSBtdWx0aXBsZSB2YWxpZCBkaXNjcmltaW5hbnQgZmllbGRzLCB3ZSBqdXN0IHBpY2sgdGhlIGZpcnN0LlxuICAgICAgcmV0dXJuIHZhbGlkRmllbGRzWzBdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPOiBCZXR0ZXIgZXJyb3IgbWVzc2FnZSB3aHkgZWFjaCBwb3NzaWJsZUZpZWxkcyBpcyBpbnZhbGlkLlxuICAgICAgdGhyb3cgZXJyb3IodHlwZSwgJ05vIHZhbGlkIGRpc2NyaW1pbmFudCBmaWVsZCBmb3IgdW5pb24gdHlwZS4nKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpc1ZhbGlkRGlzY3JpbWluYW50RmllbGQoYWx0ZXJuYXRlczogQXJyYXk8T2JqZWN0VHlwZT4sXG4gICAgICBjYW5kaWRhdGVGaWVsZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gJEZsb3dGaXhNZVxuICAgIGNvbnN0IGZpZWxkVHlwZXM6IEFycmF5PExpdGVyYWxUeXBlPiA9IGFsdGVybmF0ZXMubWFwKFxuICAgICAgYWx0ZXJuYXRlID0+IHJlc29sdmVQb3NzaWJseU5hbWVkVHlwZShnZXRPYmplY3RGaWVsZEJ5TmFtZShhbHRlcm5hdGUsIGNhbmRpZGF0ZUZpZWxkKS50eXBlKSk7XG5cbiAgICAvLyBGaWVsZHMgaW4gYWxsIGFsdGVybmF0ZXMgbXVzdCBoYXZlIHNhbWUgdHlwZS5cbiAgICBpZiAoIWZpZWxkVHlwZXMuZXZlcnkoZmllbGRUeXBlID0+IGZpZWxkVHlwZS5raW5kID09PSBmaWVsZFR5cGVzWzBdLmtpbmQpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gTXVzdCBub3QgaGF2ZSBkdXBsaWNhdGUgdmFsdWVzIGluIGFueSBhbHRlcm5hdGUuXG4gICAgLy8gQWxsIGFsdGVybmF0ZXMgbXVzdCBiZSB1bmlxdWUuXG4gICAgcmV0dXJuIChuZXcgU2V0KGZpZWxkVHlwZXMubWFwKGZpZWxkVHlwZSA9PiBmaWVsZFR5cGUudmFsdWUpKSkuc2l6ZSA9PT0gYWx0ZXJuYXRlcy5sZW5ndGg7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRPYmplY3RGaWVsZEJ5TmFtZSh0eXBlOiBPYmplY3RUeXBlLCBmaWVsZE5hbWU6IHN0cmluZyk6IE9iamVjdEZpZWxkIHtcbiAgICBjb25zdCByZXN1bHQgPSBhcnJheS5maW5kKHR5cGUuZmllbGRzLCBmaWVsZCA9PiBmaWVsZC5uYW1lID09PSBmaWVsZE5hbWUpO1xuICAgIGludmFyaWFudChyZXN1bHQgIT0gbnVsbCk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBvc3NpYmxlRGlzY3JpbWluYW50RmllbGRzT2ZVbmlvbkFsdGVybmF0ZShhbHRlcm5hdGU6IE9iamVjdFR5cGUpOiBTZXQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBTZXQoYWx0ZXJuYXRlLmZpZWxkc1xuICAgICAgICAuZmlsdGVyKGZpZWxkID0+IGlzTGl0ZXJhbFR5cGUocmVzb2x2ZVBvc3NpYmx5TmFtZWRUeXBlKGZpZWxkLnR5cGUpKSlcbiAgICAgICAgLm1hcChmaWVsZCA9PiBmaWVsZC5uYW1lKSk7XG4gIH1cblxuICAvLyBWYWxpZGF0ZXMgYSB0eXBlIHdoaWNoIGlzIG5vdCBkaXJlY3RseSBhIHJldHVybiB0eXBlLlxuICBmdW5jdGlvbiB2YWxpZGF0ZVR5cGUodHlwZTogVHlwZSk6IHZvaWQge1xuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICdhbnknOlxuICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZy1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4tbGl0ZXJhbCc6XG4gICAgICBjYXNlICdudW1iZXItbGl0ZXJhbCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndm9pZCc6XG4gICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICB0aHJvdyBlcnJvcih0eXBlLCAnUHJvbWlzZSwgdm9pZCBhbmQgT2JzZXJ2YWJsZSB0eXBlcyBtYXkgb25seSBiZSB1c2VkIGFzIHJldHVybiB0eXBlcycpO1xuICAgICAgY2FzZSAnYXJyYXknOlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdudWxsYWJsZSc6XG4gICAgICAgIHZhbGlkYXRlVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21hcCc6XG4gICAgICAgIHZhbGlkYXRlVHlwZSh0eXBlLmtleVR5cGUpO1xuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS52YWx1ZVR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIHR5cGUuZmllbGRzLm1hcChmaWVsZCA9PiBmaWVsZC50eXBlKS5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndHVwbGUnOlxuICAgICAgICB0eXBlLnR5cGVzLmZvckVhY2godmFsaWRhdGVUeXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIHZhbGlkYXRlVW5pb25UeXBlKHR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ludGVyc2VjdGlvbic6XG4gICAgICAgIHZhbGlkYXRlSW50ZXJzZWN0aW9uVHlwZSh0eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgIHR5cGUuYXJndW1lbnRUeXBlcy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgIHZhbGlkYXRlUmV0dXJuVHlwZSh0eXBlLCByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUodHlwZS5yZXR1cm5UeXBlKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZWQnOlxuICAgICAgICBjb25zdCByZXNvbHZlZFR5cGUgPSByZXNvbHZlTmFtZWRUeXBlKHR5cGUpO1xuICAgICAgICAvLyBOb3RlOiBXZSBkbyBub3QgcmVjdXJzZSBoZXJlIGFzIHR5cGVzIG1heSBiZSBzZWxmLXJlY3Vyc2l2ZSAodGhyb3VnaCBudWxsYWJsZSBmb3JcbiAgICAgICAgLy8gZXhhbXBsZSkuXG4gICAgICAgIC8vIFRoZSByZXNvbHZlZFR5cGUgd2lsbCBhbHJlYWR5IGhhdmUgYmVlbiBjaGVja2VkIHRvIGJlIGEgdmFsaWQgYWxpYXMgdHlwZS5cbiAgICAgICAgLy8gc28gd2Ugb25seSBuZWVkIHRvIGNoZWNrIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gYWxpYXMgdHlwZXMgYW5kIG5vbi1yZXR1cm4gdHlwZXMuXG4gICAgICAgIHN3aXRjaCAocmVzb2x2ZWRUeXBlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgICAgIHRocm93IGVycm9yKHR5cGUsXG4gICAgICAgICAgICAgICdQcm9taXNlLCB2b2lkIGFuZCBPYnNlcnZhYmxlIHR5cGVzIG1heSBvbmx5IGJlIHVzZWQgYXMgcmV0dXJuIHR5cGVzJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkodHlwZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlcGxhY2VzIGFsbCB1c2VzIG9mIHR5cGUgYWxpYXNlcyBpbiByZXR1cm4gdHlwZXMgd2l0aCB0aGVpciBkZWZpbml0aW9uXG4gIC8vIHNvIHRoYXQgY2xpZW50cyBuZWVkIG5vdCBiZSBhd2FyZSBvZiBhbGlhc2VzLlxuICAvLyBUT0RPOiBTaG91bGQgcmVwbGFjZSBhbGwgYWxpYXNlcywgaG93ZXZlciB0aGF0IHdpbGwgcmVxdWlyZSByZXdyaXRpbmcgbWFyc2FsbGluZy5cbiAgZnVuY3Rpb24gY2Fubm9uaWNhbGl6ZSgpOiB2b2lkIHtcbiAgICB2aXNpdEFsbFR5cGVzKGNhbm5vbmljYWxpemVUeXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZXM6IEFycmF5PFR5cGU+KTogdm9pZCB7XG4gICAgdHlwZXMuZm9yRWFjaChjYW5ub25pY2FsaXplVHlwZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5ub25pY2FsaXplVHlwZSh0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2FueSc6XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnYm9vbGVhbi1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ251bWJlci1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ251bGxhYmxlJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXAnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLmtleVR5cGUpO1xuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnZhbHVlVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgdHlwZS5maWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUoZmllbGQudHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R1cGxlJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGVBcnJheSh0eXBlLnR5cGVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZS50eXBlcyk7XG4gICAgICAgIHR5cGUudHlwZXMgPSBmbGF0dGVuVW5pb25BbHRlcm5hdGVzKHR5cGUudHlwZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2ludGVyc2VjdGlvbic6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZS50eXBlcyk7XG4gICAgICAgIGNhbm9uaWNhbGl6ZUludGVyc2VjdGlvbih0eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZS5hcmd1bWVudFR5cGVzKTtcbiAgICAgICAgdHlwZS5yZXR1cm5UeXBlID0gcmVzb2x2ZVBvc3NpYmx5TmFtZWRUeXBlKHR5cGUucmV0dXJuVHlwZSk7XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlKHR5cGUucmV0dXJuVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZWQnOlxuICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyBkb2VzIG5vdCByZWN1cnNlLCBzbyB0aGUgYWxnb3JpdGhtIHdpbGwgYWx3YXlzIHRlcm1pbmF0ZS5cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkodHlwZSkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbm9uaWNhbGl6ZUludGVyc2VjdGlvbihpbnRlcnNlY3Rpb25UeXBlOiBJbnRlcnNlY3Rpb25UeXBlKTogdm9pZCB7XG4gICAgY29uc3QgZmllbGRzID0gZmxhdHRlbkludGVyc2VjdGlvbihpbnRlcnNlY3Rpb25UeXBlKTtcbiAgICBpbnRlcnNlY3Rpb25UeXBlLmZsYXR0ZW5lZCA9IHtcbiAgICAgIGtpbmQ6ICdvYmplY3QnLFxuICAgICAgbG9jYXRpb246IGludGVyc2VjdGlvblR5cGUubG9jYXRpb24sXG4gICAgICBmaWVsZHMsXG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZsYXR0ZW5JbnRlcnNlY3Rpb24oaW50ZXJzZWN0aW9uVHlwZTogSW50ZXJzZWN0aW9uVHlwZSk6IEFycmF5PE9iamVjdEZpZWxkPiB7XG4gICAgY29uc3QgZmllbGRzID0gW107XG4gICAgZm9yIChjb25zdCB0eXBlIG9mIGludGVyc2VjdGlvblR5cGUudHlwZXMpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkVHlwZSA9IHJlc29sdmVQb3NzaWJseU5hbWVkVHlwZSh0eXBlKTtcbiAgICAgIGlmIChyZXNvbHZlZFR5cGUua2luZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZmllbGRzLnB1c2goLi4ucmVzb2x2ZWRUeXBlLmZpZWxkcyk7XG4gICAgICB9IGVsc2UgaWYgKHJlc29sdmVkVHlwZS5raW5kID09PSAnaW50ZXJzZWN0aW9uJykge1xuICAgICAgICBmaWVsZHMucHVzaCguLi5mbGF0dGVuSW50ZXJzZWN0aW9uKHJlc29sdmVkVHlwZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoXG4gICAgICAgICAgW2ludGVyc2VjdGlvblR5cGUubG9jYXRpb24sIHR5cGUubG9jYXRpb25dLFxuICAgICAgICAgICdUeXBlcyBpbiBpbnRlcnNlY3Rpb25zIG11c3QgYmUgb2JqZWN0IG9yIGludGVyc2VjdGlvbiB0eXBlcycsXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmaWVsZHM7XG4gIH1cblxuICAvLyBXaWxsIHJldHVybiBhIG5hbWVkIHR5cGUgaWYgYW5kIG9ubHkgaWYgdGhlIGFsaWFzIHJlc29sdmVzIHRvIGEgYnVpbHRpbiB0eXBlLCBvciBhbiBpbnRlcmZhY2UuXG4gIGZ1bmN0aW9uIHJlc29sdmVQb3NzaWJseU5hbWVkVHlwZSh0eXBlOiBUeXBlKTogVHlwZSB7XG4gICAgaWYgKHR5cGUua2luZCA9PT0gJ25hbWVkJykge1xuICAgICAgcmV0dXJuIHJlc29sdmVOYW1lZFR5cGUodHlwZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0eXBlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZsYXR0ZW5VbmlvbkFsdGVybmF0ZXModHlwZXM6IEFycmF5PFR5cGU+KTogQXJyYXk8VHlwZT4ge1xuICAgIHJldHVybiBbXS5jb25jYXQoLi4uIHR5cGVzLm1hcChhbHRlcm5hdGUgPT4ge1xuICAgICAgY29uc3QgcmVzb2x2ZWRBbHRlcm5hdGUgPSByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUoYWx0ZXJuYXRlKTtcbiAgICAgIHJldHVybiByZXNvbHZlZEFsdGVybmF0ZS5raW5kID09PSAndW5pb24nID9cbiAgICAgICAgICBmbGF0dGVuVW5pb25BbHRlcm5hdGVzKHJlc29sdmVkQWx0ZXJuYXRlLnR5cGVzKSA6XG4gICAgICAgICAgcmVzb2x2ZWRBbHRlcm5hdGU7XG4gICAgfSkpO1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgZGVmaW5pdGlvbiBvZiBhIG5hbWVkIHR5cGUuIElmIHRoZSB0eXBlIHJlc29sdmVzIHRvIGFuIGFsaWFzIGl0IHJldHVybnMgdGhlXG4gIC8vIGFsaWFzJ3MgZGVmaW5pdGlvbi5cbiAgLy8gV2lsbCByZXR1cm4gYSBuYW1lZCB0eXBlIGlmIGFuZCBvbmx5IGlmIHRoZSBhbGlhcyByZXNvbHZlcyB0byBhIGJ1aWx0aW4gdHlwZSwgb3IgYW4gaW50ZXJmYWNlLlxuICBmdW5jdGlvbiByZXNvbHZlTmFtZWRUeXBlKG5hbWVkVHlwZTogTmFtZWRUeXBlKTogVHlwZSB7XG4gICAgY29uc3QgZGVmID0gbmFtZWRUeXBlcy5nZXQobmFtZWRUeXBlLm5hbWUpO1xuICAgIGludmFyaWFudChkZWYgIT0gbnVsbCk7XG4gICAgc3dpdGNoIChkZWYua2luZCkge1xuICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICBjb25zdCB0eXBlID0gZGVmLmRlZmluaXRpb247XG4gICAgICAgIGlmICh0eXBlKSB7XG4gICAgICAgICAgaWYgKHR5cGUua2luZCA9PT0gJ25hbWVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVOYW1lZFR5cGUodHlwZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0eXBlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lZFR5cGU7XG4gICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICByZXR1cm4gbmFtZWRUeXBlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmV4cGVjdGVkIGRlZmluaXRpb24ga2luZCcpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZpc2l0QWxsVHlwZXMob3BlcmF0aW9uOiAodHlwZTogVHlwZSkgPT4gdm9pZCk6IHZvaWQge1xuICAgIGZvciAoY29uc3QgZGVmaW5pdGlvbiBvZiBkZWZpbml0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgc3dpdGNoIChkZWZpbml0aW9uLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgICAgIG9wZXJhdGlvbihkZWZpbml0aW9uLnR5cGUpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgICAgaWYgKGRlZmluaXRpb24uZGVmaW5pdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICBvcGVyYXRpb24oZGVmaW5pdGlvbi5kZWZpbml0aW9uKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICAgICAgZGVmaW5pdGlvbi5jb25zdHJ1Y3RvckFyZ3MuZm9yRWFjaChvcGVyYXRpb24pO1xuICAgICAgICAgIGRlZmluaXRpb24uaW5zdGFuY2VNZXRob2RzLmZvckVhY2gob3BlcmF0aW9uKTtcbiAgICAgICAgICBkZWZpbml0aW9uLnN0YXRpY01ldGhvZHMuZm9yRWFjaChvcGVyYXRpb24pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVycm9yKHR5cGU6IFR5cGUsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHJldHVybiBlcnJvckxvY2F0aW9ucyhbdHlwZS5sb2NhdGlvbl0sIG1lc3NhZ2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXJyb3JMb2NhdGlvbnMobG9jYXRpb25zOiBBcnJheTxMb2NhdGlvbj4sIG1lc3NhZ2U6IHN0cmluZyk6IEVycm9yIHtcbiAgICBsZXQgZnVsbE1lc3NhZ2UgPSBgJHtsb2NhdGlvblRvU3RyaW5nKGxvY2F0aW9uc1swXSl9OiR7bWVzc2FnZX1gO1xuICAgIGZ1bGxNZXNzYWdlID0gZnVsbE1lc3NhZ2UuY29uY2F0KFxuICAgICAgLi4uIChsb2NhdGlvbnMuc2xpY2UoMSkubWFwKGxvY2F0aW9uID0+XG4gICAgICAgIGBcXG4ke2xvY2F0aW9uVG9TdHJpbmcobG9jYXRpb24pfTogUmVsYXRlZCBsb2NhdGlvbmApKSk7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihmdWxsTWVzc2FnZSk7XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvckRlZmluaXRpb25zKGRlZnM6IEFycmF5PERlZmluaXRpb24+LCBtZXNzYWdlOiBzdHJpbmcpOiBFcnJvciB7XG4gICAgbGV0IGZ1bGxNZXNzYWdlID0gYCR7bG9jYXRpb25Ub1N0cmluZyhkZWZzWzBdLmxvY2F0aW9uKX06JHttZXNzYWdlfWA7XG4gICAgZnVsbE1lc3NhZ2UgPSBmdWxsTWVzc2FnZS5jb25jYXQoXG4gICAgICAuLi4gKGRlZnMuc2xpY2UoMSkubWFwKGRlZmluaXRpb24gPT5cbiAgICAgICAgYFxcbiR7bG9jYXRpb25Ub1N0cmluZyhkZWZpbml0aW9uLmxvY2F0aW9uKX06IFJlbGF0ZWQgZGVmaW5pdGlvbiAke2RlZmluaXRpb24ubmFtZX1gKSkpO1xuICAgIHJldHVybiBuZXcgRXJyb3IoZnVsbE1lc3NhZ2UpO1xuICB9XG59XG4iXX0=