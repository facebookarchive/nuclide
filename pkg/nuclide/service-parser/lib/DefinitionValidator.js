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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRlZmluaXRpb25WYWxpZGF0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBVytCLGlCQUFpQjs7c0JBQzFCLFFBQVE7Ozs7dUJBQ0wsZUFBZTs7Ozs7Ozs7O0FBdUJqQyxTQUFTLG1CQUFtQixDQUFDLFdBQXdCLEVBQVE7QUFDbEUsTUFBTSxVQUE4RCxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakYsa0JBQWdCLEVBQUUsQ0FBQztBQUNuQixVQUFRLEVBQUUsQ0FBQzs7QUFFWCxXQUFTLFFBQVEsR0FBUztBQUN4Qix3QkFBb0IsRUFBRSxDQUFDO0FBQ3ZCLHdCQUFvQixFQUFFLENBQUM7QUFDdkIsdUJBQW1CLEVBQUUsQ0FBQztBQUN0QixpQkFBYSxFQUFFLENBQUM7R0FDakI7O0FBRUQsV0FBUyxvQkFBb0IsR0FBRztBQUM5QixpQkFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7R0FDekM7O0FBRUQsV0FBUyxnQkFBZ0IsR0FBUztBQUNoQyxTQUFLLElBQU0sVUFBVSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUM3QyxjQUFRLFVBQVUsQ0FBQyxJQUFJO0FBQ3JCLGFBQUssT0FBTyxDQUFDO0FBQ2IsYUFBSyxXQUFXO0FBQ2Qsb0JBQVUsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUM1QyxnQkFBTTtBQUFBLE9BQ1Q7S0FDRjtHQUNGOztBQUVELFdBQVMsd0JBQXdCLENBQUMsSUFBVSxFQUFRO0FBQ2xELFlBQVEsSUFBSSxDQUFDLElBQUk7QUFDZixXQUFLLEtBQUssQ0FBQztBQUNYLFdBQUssT0FBTyxDQUFDO0FBQ2IsV0FBSyxRQUFRLENBQUM7QUFDZCxXQUFLLFNBQVMsQ0FBQztBQUNmLFdBQUssUUFBUSxDQUFDO0FBQ2QsV0FBSyxnQkFBZ0IsQ0FBQztBQUN0QixXQUFLLGlCQUFpQixDQUFDO0FBQ3ZCLFdBQUssZ0JBQWdCLENBQUM7QUFD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LENBQUM7QUFDckUsZUFBVyxHQUFHLGlCQUFBLFdBQVcsRUFBQyxNQUFNLE1BQUEsbUNBQ3pCLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVTtvQkFDMUIsb0NBQWlCLFVBQVUsQ0FBQyxRQUFRLENBQUMsNkJBQXdCLFVBQVUsQ0FBQyxJQUFJO0tBQUUsQ0FBQyxFQUFFLENBQUM7QUFDM0YsV0FBTyxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMvQjtDQUNGIiwiZmlsZSI6IkRlZmluaXRpb25WYWxpZGF0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge2xvY2F0aW9uVG9TdHJpbmd9IGZyb20gJy4vYnVpbHRpbi10eXBlcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2FycmF5LCBzZXR9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5pbXBvcnQgdHlwZSB7XG4gIERlZmluaXRpb25zLFxuICBEZWZpbml0aW9uLFxuICBBbGlhc0RlZmluaXRpb24sXG4gIEludGVyZmFjZURlZmluaXRpb24sXG4gIFR5cGUsXG4gIEZ1bmN0aW9uVHlwZSxcbiAgTmFtZWRUeXBlLFxuICBVbmlvblR5cGUsXG4gIE9iamVjdFR5cGUsXG4gIE9iamVjdEZpZWxkLFxuICBMaXRlcmFsVHlwZSxcbiAgTG9jYXRpb24sXG59IGZyb20gJy4vdHlwZXMnO1xuXG4vKipcbiAqIFRocm93cyBpZiBhIG5hbWVkIHR5cGUgcmVmZXJlbmNlZCBpbiBhbiBSUEMgaW50ZXJmYWNlIGlzIG5vdCBkZWZpbmVkLlxuICogVGhlIGVycm9yIG1lc3NhZ2UgdGhyb3duIGlzIHN1aXRhYmxlIGZvciBkaXNwbGF5IHRvIGEgaHVtYW4uXG4gKlxuICogTk9URTogV2lsbCBhbHNvIG11dGF0ZSB0aGUgaW5jb21pbmcgZGVmaW5pdGlvbnMgaW4gcGxhY2UgdG8gbWFrZSB0aGVtIGVhc2llciB0byBtYXJzaGFsLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVEZWZpbml0aW9ucyhkZWZpbml0aW9uczogRGVmaW5pdGlvbnMpOiB2b2lkIHtcbiAgY29uc3QgbmFtZWRUeXBlczogTWFwPHN0cmluZywgQWxpYXNEZWZpbml0aW9uIHwgSW50ZXJmYWNlRGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG4gIGdhdGhlcktub3duVHlwZXMoKTtcbiAgdmFsaWRhdGUoKTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZSgpOiB2b2lkIHtcbiAgICBmaW5kTWlzc2luZ1R5cGVOYW1lcygpO1xuICAgIGZpbmRSZWN1cnNpdmVBbGlhc2VzKCk7XG4gICAgdmFsaWRhdGVSZXR1cm5UeXBlcygpO1xuICAgIGNhbm5vbmljYWxpemUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRNaXNzaW5nVHlwZU5hbWVzKCkge1xuICAgIHZpc2l0QWxsVHlwZXMoY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdhdGhlcktub3duVHlwZXMoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBkZWZpbml0aW9uIG9mIGRlZmluaXRpb25zLnZhbHVlcygpKSB7XG4gICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICBjYXNlICdhbGlhcyc6XG4gICAgICAgIGNhc2UgJ2ludGVyZmFjZSc6XG4gICAgICAgICAgbmFtZWRUeXBlcy5zZXQoZGVmaW5pdGlvbi5uYW1lLCBkZWZpbml0aW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZTogVHlwZSk6IHZvaWQge1xuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICdhbnknOlxuICAgICAgY2FzZSAnbWl4ZWQnOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgIGNhc2UgJ3N0cmluZy1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ2Jvb2xlYW4tbGl0ZXJhbCc6XG4gICAgICBjYXNlICdudW1iZXItbGl0ZXJhbCc6XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JzZXJ2YWJsZSc6XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2V0JzpcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbnVsbGFibGUnOlxuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXAnOlxuICAgICAgICBjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXModHlwZS5rZXlUeXBlKTtcbiAgICAgICAgY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKHR5cGUudmFsdWVUeXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICB0eXBlLmZpZWxkcy5tYXAoZmllbGQgPT4gZmllbGQudHlwZSkuZm9yRWFjaChjaGVja1R5cGVGb3JNaXNzaW5nTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R1cGxlJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5pb24nOlxuICAgICAgICB0eXBlLnR5cGVzLmZvckVhY2goY2hlY2tUeXBlRm9yTWlzc2luZ05hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgIHR5cGUuYXJndW1lbnRUeXBlcy5mb3JFYWNoKGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyk7XG4gICAgICAgIGNoZWNrVHlwZUZvck1pc3NpbmdOYW1lcyh0eXBlLnJldHVyblR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25hbWVkJzpcbiAgICAgICAgY29uc3QgbmFtZSA9IHR5cGUubmFtZTtcbiAgICAgICAgaWYgKCFuYW1lZFR5cGVzLmhhcyhuYW1lKSkge1xuICAgICAgICAgIHRocm93IGVycm9yKHR5cGUsIGBObyBkZWZpbml0aW9uIGZvciB0eXBlICR7bmFtZX0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkodHlwZSkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmVBbGlhc2VzKCkge1xuICAgIGZvciAoY29uc3QgZGVmaW5pdGlvbiBvZiBkZWZpbml0aW9ucy52YWx1ZXMoKSkge1xuICAgICAgc3dpdGNoIChkZWZpbml0aW9uLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgIGNoZWNrQWxpYXNMYXlvdXQoZGVmaW5pdGlvbik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tBbGlhc0xheW91dChhbGlhczogQWxpYXNEZWZpbml0aW9uKTogdm9pZCB7XG4gICAgaWYgKGFsaWFzLmRlZmluaXRpb24pIHtcbiAgICAgIHZhbGlkYXRlTGF5b3V0UmVjKFthbGlhc10sIGFsaWFzLmRlZmluaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZXMgdGhhdCBhIHR5cGUgZG9lcyBub3QgZGlyZWN0bHkgY29udGFpbiBhbnkgdHlwZXMgd2hpY2ggYXJlIGtub3duIHRvXG4gICAqIGRpcmVjdGx5IG9yIGluZGlyZWN0bHkgY29udGFpbiBpdC5cbiAgICpcbiAgICogSWYgcmVjdXJzaW9uIGlzIGZvdW5kIHRoZSBjaGFpbiBvZiB0eXBlcyB3aGljaCByZWN1cnNpdmVseSBjb250YWluIGVhY2ggb3RoZXIgaXMgcmVwb3J0ZWQuXG4gICAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUxheW91dFJlYyhjb250YWluaW5nRGVmaW5pdGlvbnM6IEFycmF5PEFsaWFzRGVmaW5pdGlvbj4sIHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZVR5cGVSZWModHlwZVJlYzogVHlwZSk6IHZvaWQge1xuICAgICAgdmFsaWRhdGVMYXlvdXRSZWMoY29udGFpbmluZ0RlZmluaXRpb25zLCB0eXBlUmVjKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAnYW55JzpcbiAgICAgIGNhc2UgJ21peGVkJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmctbGl0ZXJhbCc6XG4gICAgICBjYXNlICdib29sZWFuLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnbnVtYmVyLWxpdGVyYWwnOlxuICAgICAgY2FzZSAndm9pZCc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgdmFsaWRhdGVUeXBlUmVjKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbnVsbGFibGUnOlxuICAgICAgICAvLyBOdWxsYWJsZSBicmVha3MgdGhlIGxheW91dCBjaGFpblxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21hcCc6XG4gICAgICBjYXNlICdhcnJheSc6XG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgICAvLyBDb250YWluZXJzIGJyZWFrIHRoZSBsYXlvdXQgY2hhaW4gYXMgdGhleSBtYXkgYmUgZW1wdHkuXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgdHlwZS5maWVsZHMuXG4gICAgICAgICAgZmlsdGVyKGZpZWxkID0+ICFmaWVsZC5vcHRpb25hbCkuXG4gICAgICAgICAgbWFwKGZpZWxkID0+IGZpZWxkLnR5cGUpLlxuICAgICAgICAgIGZvckVhY2godmFsaWRhdGVUeXBlUmVjKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd0dXBsZSc6XG4gICAgICAgIHR5cGUudHlwZXMuZm9yRWFjaCh2YWxpZGF0ZVR5cGVSZWMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3VuaW9uJzpcbiAgICAgICAgLy8gVW5pb24gdHlwZXMgYnJlYWsgdGhlIGxheW91dCBjaGFpbi5cbiAgICAgICAgLy8gVE9ETzogU3RyaWN0bHkgd2Ugc2hvdWxkIGRldGVjdCBhbHRlcm5hdGVzIHdoaWNoIGRpcmVjdGx5IGNvbnRhaW4gdGhlaXIgcGFyZW50IHVuaW9uLFxuICAgICAgICAvLyBvciBpZiBhbGwgYWx0ZXJuYXRlcyBpbmRpcmVjdGx5IGNvbnRhaW4gdGhlIHBhcmVudCB1bmlvbi5cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZWQnOlxuICAgICAgICBjb25zdCBuYW1lID0gdHlwZS5uYW1lO1xuICAgICAgICAvLyAkRmxvd0ZpeE1lKHBldGVyaGFsKVxuICAgICAgICBjb25zdCBkZWZpbml0aW9uOiBBbGlhc0RlZmluaXRpb24gfCBJbnRlcmZhY2VEZWZpbml0aW9uID0gbmFtZWRUeXBlcy5nZXQobmFtZSk7XG4gICAgICAgIGlmIChjb250YWluaW5nRGVmaW5pdGlvbnMuaW5kZXhPZigoZGVmaW5pdGlvbjogYW55KSkgIT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3JEZWZpbml0aW9ucyhcbiAgICAgICAgICAgIChjb250YWluaW5nRGVmaW5pdGlvbnMuc2xpY2UoY29udGFpbmluZ0RlZmluaXRpb25zLmluZGV4T2YoKGRlZmluaXRpb246IGFueSkpKTogYW55KSxcbiAgICAgICAgICAgIGBUeXBlICR7bmFtZX0gY29udGFpbnMgaXRzZWxmLmApO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluaXRpb24ua2luZCA9PT0gJ2FsaWFzJyAmJiBkZWZpbml0aW9uLmRlZmluaXRpb24gIT0gbnVsbCkge1xuICAgICAgICAgIGNvbnRhaW5pbmdEZWZpbml0aW9ucy5wdXNoKGRlZmluaXRpb24pO1xuICAgICAgICAgIGludmFyaWFudChkZWZpbml0aW9uLmRlZmluaXRpb24pO1xuICAgICAgICAgIHZhbGlkYXRlTGF5b3V0UmVjKGNvbnRhaW5pbmdEZWZpbml0aW9ucywgZGVmaW5pdGlvbi5kZWZpbml0aW9uKTtcbiAgICAgICAgICBjb250YWluaW5nRGVmaW5pdGlvbnMucG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkodHlwZSkpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUmV0dXJuVHlwZXMoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBkZWZpbml0aW9uIG9mIGRlZmluaXRpb25zLnZhbHVlcygpKSB7XG4gICAgICBzd2l0Y2ggKGRlZmluaXRpb24ua2luZCkge1xuICAgICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgICAgdmFsaWRhdGVUeXBlKGRlZmluaXRpb24udHlwZSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgICBpZiAoZGVmaW5pdGlvbi5kZWZpbml0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICAgIHZhbGlkYXRlQWxpYXNUeXBlKGRlZmluaXRpb24uZGVmaW5pdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICAgIGRlZmluaXRpb24uY29uc3RydWN0b3JBcmdzLmZvckVhY2godmFsaWRhdGVUeXBlKTtcbiAgICAgICAgICBkZWZpbml0aW9uLmluc3RhbmNlTWV0aG9kcy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgICAgZGVmaW5pdGlvbi5zdGF0aWNNZXRob2RzLmZvckVhY2godmFsaWRhdGVUeXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBWYWxpZGF0ZXMgYSB0eXBlIHdoaWNoIG11c3QgYmUgYSByZXR1cm4gdHlwZS5cbiAgLy8gQ2FsbGVyIG11c3QgcmVzb2x2ZSBuYW1lZCB0eXBlcy5cbiAgZnVuY3Rpb24gdmFsaWRhdGVSZXR1cm5UeXBlKGZ1bmNUeXBlOiBGdW5jdGlvblR5cGUsIHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBmdW5jdGlvbiBpbnZhbGlkUmV0dXJuVHlwZUVycm9yKCk6IEVycm9yIHtcbiAgICAgIHJldHVybiBlcnJvcihmdW5jVHlwZSxcbiAgICAgICAgYFRoZSByZXR1cm4gdHlwZSBvZiBhIHJlbW90ZSBmdW5jdGlvbiBtdXN0IGJlIG9mIHR5cGUgVm9pZCwgUHJvbWlzZSwgb3IgT2JzZXJ2YWJsZWApO1xuICAgIH1cblxuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICBpZiAodHlwZS50eXBlLmtpbmQgIT09ICd2b2lkJykge1xuICAgICAgICAgIHZhbGlkYXRlVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgaW52YWxpZFJldHVyblR5cGVFcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8vIEFsaWFzZXMgbWF5IGJlIHJldHVybiB0eXBlcywgb3Igbm9uLXJldHVybiB0eXBlcy5cbiAgZnVuY3Rpb24gdmFsaWRhdGVBbGlhc1R5cGUodHlwZTogVHlwZSk6IHZvaWQge1xuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICBpZiAodHlwZS50eXBlLmtpbmQgIT09ICd2b2lkJykge1xuICAgICAgICAgIHZhbGlkYXRlVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZWQnOlxuICAgICAgICAvLyBObyBuZWVkIHRvIHJlY3Vyc2UsIGFzIHRoZSB0YXJnZXQgYWxpYXMgZGVmaW5pdGlvbiB3aWxsIGdldCB2YWxpZGF0ZWQgc2VwZXJhdGVseS5cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzTGl0ZXJhbFR5cGUodHlwZTogVHlwZSk6IGJvb2xlYW4ge1xuICAgIHN3aXRjaCAodHlwZS5raW5kKSB7XG4gICAgICBjYXNlICdzdHJpbmctbGl0ZXJhbCc6XG4gICAgICBjYXNlICdudW1iZXItbGl0ZXJhbCc6XG4gICAgICBjYXNlICdib29sZWFuLWxpdGVyYWwnOlxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZVVuaW9uVHlwZSh0eXBlOiBVbmlvblR5cGUpOiB2b2lkIHtcbiAgICBjb25zdCBhbHRlcm5hdGVzID0gZmxhdHRlblVuaW9uQWx0ZXJuYXRlcyh0eXBlLnR5cGVzKTtcblxuICAgIGlmIChpc0xpdGVyYWxUeXBlKGFsdGVybmF0ZXNbMF0pKSB7XG4gICAgICB2YWxpZGF0ZUxpdGVyYWxVbmlvblR5cGUodHlwZSwgYWx0ZXJuYXRlcyk7XG4gICAgfSBlbHNlIGlmIChhbHRlcm5hdGVzWzBdLmtpbmQgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YWxpZGF0ZU9iamVjdFVuaW9uVHlwZSh0eXBlLCBhbHRlcm5hdGVzKTtcbiAgICB9ICBlbHNlIHtcbiAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBhbHRlcm5hdGVzWzBdLmxvY2F0aW9uXSxcbiAgICAgICAgYFVuaW9uIGFsdGVybmF0ZXMgbXVzdCBiZSBlaXRoZXIgYmUgdHlwZWQgb2JqZWN0IG9yIGxpdGVyYWwgdHlwZXMuYCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVMaXRlcmFsVW5pb25UeXBlKHR5cGU6IFVuaW9uVHlwZSwgYWx0ZXJuYXRlczogQXJyYXk8VHlwZT4pOiB2b2lkIHtcbiAgICBhbHRlcm5hdGVzLnJlZHVjZSgocHJldmlvdXNBbHRlcm5hdGVzLCBhbHRlcm5hdGUpID0+IHtcbiAgICAgIHZhbGlkYXRlVHlwZShhbHRlcm5hdGUpO1xuXG4gICAgICAvLyBFbnN1cmUgYSB2YWxpZCBhbHRlcm5hdGVcbiAgICAgIGlmICghaXNMaXRlcmFsVHlwZShhbHRlcm5hdGUpKSB7XG4gICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBhbHRlcm5hdGUubG9jYXRpb25dLFxuICAgICAgICAgIGBVbmlvbiBhbHRlcm5hdGVzIG1heSBvbmx5IGJlIGxpdGVyYWwgdHlwZXMuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEVuc3VyZSBubyBkdXBsaWNhdGVzXG4gICAgICBwcmV2aW91c0FsdGVybmF0ZXMuZm9yRWFjaChwcmV2aW91cyA9PiB7XG4gICAgICAgIGludmFyaWFudChwcmV2aW91cy5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IHByZXZpb3VzLmtpbmQgPT09ICdudW1iZXItbGl0ZXJhbCdcbiAgICAgICAgICAgIHx8IHByZXZpb3VzLmtpbmQgPT09ICdib29sZWFuLWxpdGVyYWwnKTtcbiAgICAgICAgaW52YXJpYW50KGFsdGVybmF0ZS5raW5kID09PSAnc3RyaW5nLWxpdGVyYWwnIHx8IGFsdGVybmF0ZS5raW5kID09PSAnbnVtYmVyLWxpdGVyYWwnXG4gICAgICAgICAgICB8fCBhbHRlcm5hdGUua2luZCA9PT0gJ2Jvb2xlYW4tbGl0ZXJhbCcpO1xuICAgICAgICBpZiAocHJldmlvdXMudmFsdWUgPT09IGFsdGVybmF0ZS52YWx1ZSkge1xuICAgICAgICAgIHRocm93IGVycm9yTG9jYXRpb25zKFt0eXBlLmxvY2F0aW9uLCBwcmV2aW91cy5sb2NhdGlvbiwgYWx0ZXJuYXRlLmxvY2F0aW9uXSxcbiAgICAgICAgICAgIGBVbmlvbiBhbHRlcm5hdGVzIG1heSBub3QgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5gKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHByZXZpb3VzQWx0ZXJuYXRlcy5wdXNoKGFsdGVybmF0ZSk7XG4gICAgICByZXR1cm4gcHJldmlvdXNBbHRlcm5hdGVzO1xuICAgIH0sIFtdKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlT2JqZWN0VW5pb25UeXBlKHR5cGU6IFVuaW9uVHlwZSwgYWx0ZXJuYXRlczogQXJyYXk8VHlwZT4pOiB2b2lkIHtcbiAgICBhbHRlcm5hdGVzLmZvckVhY2goYWx0ZXJuYXRlID0+IHtcbiAgICAgIHZhbGlkYXRlVHlwZShhbHRlcm5hdGUpO1xuXG4gICAgICAvLyBFbnN1cmUgYWx0ZXJuYXRlcyBtYXRjaFxuICAgICAgaWYgKGFsdGVybmF0ZS5raW5kICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBlcnJvckxvY2F0aW9ucyhbdHlwZS5sb2NhdGlvbiwgYWx0ZXJuYXRlc1swXS5sb2NhdGlvbiwgYWx0ZXJuYXRlLmxvY2F0aW9uXSxcbiAgICAgICAgICBgVW5pb24gYWx0ZXJuYXRlcyBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUuYCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0eXBlLmRpc2NyaW1pbmFudEZpZWxkID0gZmluZE9iamVjdFVuaW9uRGlzY3JpbWluYW50KHR5cGUsIChhbHRlcm5hdGVzOiBBcnJheTxhbnk+KSk7XG4gIH1cblxuICBmdW5jdGlvbiBmaW5kT2JqZWN0VW5pb25EaXNjcmltaW5hbnQodHlwZTogVW5pb25UeXBlLCBhbHRlcm5hdGVzOiBBcnJheTxPYmplY3RUeXBlPik6IHN0cmluZyB7XG4gICAgLy8gR2V0IHNldCBvZiBmaWVsZHMgd2hpY2ggYXJlIGxpdGVyYWwgdHlwZXMgaW4gYWwgYWx0ZXJuYXRlcy5cbiAgICBpbnZhcmlhbnQoYWx0ZXJuYXRlcy5sZW5ndGggPiAwKTtcbiAgICAvLyAkRmxvd0ZpeE1lXG4gICAgY29uc3QgcG9zc2libGVGaWVsZHM6IFNldDxzdHJpbmc+ID0gYWx0ZXJuYXRlcy5yZWR1Y2UoXG4gICAgICAocG9zc2liaWxpdGllczogP1NldDxzdHJpbmc+LCBhbHRlcm5hdGU6IE9iamVjdFR5cGUpID0+IHtcbiAgICAgICAgY29uc3QgYWx0ZXJuYXRlUG9zc2liaWxpdGllcyA9IHBvc3NpYmxlRGlzY3JpbWluYW50RmllbGRzT2ZVbmlvbkFsdGVybmF0ZShhbHRlcm5hdGUpO1xuICAgICAgICBpZiAoYWx0ZXJuYXRlUG9zc2liaWxpdGllcy5zaXplID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb24sIGFsdGVybmF0ZS5sb2NhdGlvbl0sXG4gICAgICAgICAgICBgT2JqZWN0IHVuaW9uIGFsdGVybmF0aXZlIGhhcyBubyBwb3NzaWJsZSBkaXNjcmltaW5hbnQgZmllbGRzLmApO1xuICAgICAgICB9XG4gICAgICAgIC8vIFVzZSBudWxsIHRvIHJlcHJlc2VudCB0aGUgc2V0IGNvbnRhaW5pbmcgZXZlcnl0aGluZy5cbiAgICAgICAgaWYgKHBvc3NpYmlsaXRpZXMgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBhbHRlcm5hdGVQb3NzaWJpbGl0aWVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzZXQuaW50ZXJzZWN0KGFsdGVybmF0ZVBvc3NpYmlsaXRpZXMsIHBvc3NpYmlsaXRpZXMpO1xuICAgICAgICB9XG4gICAgICB9LCBudWxsKTtcblxuICAgIGNvbnN0IHZhbGlkRmllbGRzID0gYXJyYXkuZnJvbShwb3NzaWJsZUZpZWxkcykuXG4gICAgICAgIGZpbHRlcihmaWVsZE5hbWUgPT4gaXNWYWxpZERpc2NyaW1pbmFudEZpZWxkKGFsdGVybmF0ZXMsIGZpZWxkTmFtZSkpO1xuICAgIGlmICh2YWxpZEZpZWxkcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBJZiB0aGVyZSBhcmUgbXVsdGlwbGUgdmFsaWQgZGlzY3JpbWluYW50IGZpZWxkcywgd2UganVzdCBwaWNrIHRoZSBmaXJzdC5cbiAgICAgIHJldHVybiB2YWxpZEZpZWxkc1swXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gVE9ETzogQmV0dGVyIGVycm9yIG1lc3NhZ2Ugd2h5IGVhY2ggcG9zc2libGVGaWVsZHMgaXMgaW52YWxpZC5cbiAgICAgIHRocm93IGVycm9yKHR5cGUsICdObyB2YWxpZCBkaXNjcmltaW5hbnQgZmllbGQgZm9yIHVuaW9uIHR5cGUuJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaXNWYWxpZERpc2NyaW1pbmFudEZpZWxkKGFsdGVybmF0ZXM6IEFycmF5PE9iamVjdFR5cGU+LFxuICAgICAgY2FuZGlkYXRlRmllbGQ6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIC8vICRGbG93Rml4TWVcbiAgICBjb25zdCBmaWVsZFR5cGVzOiBBcnJheTxMaXRlcmFsVHlwZT4gPSBhbHRlcm5hdGVzLm1hcChcbiAgICAgIGFsdGVybmF0ZSA9PiByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUoZ2V0T2JqZWN0RmllbGRCeU5hbWUoYWx0ZXJuYXRlLCBjYW5kaWRhdGVGaWVsZCkudHlwZSkpO1xuXG4gICAgLy8gRmllbGRzIGluIGFsbCBhbHRlcm5hdGVzIG11c3QgaGF2ZSBzYW1lIHR5cGUuXG4gICAgaWYgKCFmaWVsZFR5cGVzLmV2ZXJ5KGZpZWxkVHlwZSA9PiBmaWVsZFR5cGUua2luZCA9PT0gZmllbGRUeXBlc1swXS5raW5kKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIE11c3Qgbm90IGhhdmUgZHVwbGljYXRlIHZhbHVlcyBpbiBhbnkgYWx0ZXJuYXRlLlxuICAgIC8vIEFsbCBhbHRlcm5hdGVzIG11c3QgYmUgdW5pcXVlLlxuICAgIHJldHVybiAobmV3IFNldChmaWVsZFR5cGVzLm1hcChmaWVsZFR5cGUgPT4gZmllbGRUeXBlLnZhbHVlKSkpLnNpemUgPT09IGFsdGVybmF0ZXMubGVuZ3RoO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0T2JqZWN0RmllbGRCeU5hbWUodHlwZTogT2JqZWN0VHlwZSwgZmllbGROYW1lOiBzdHJpbmcpOiBPYmplY3RGaWVsZCB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXJyYXkuZmluZCh0eXBlLmZpZWxkcywgZmllbGQgPT4gZmllbGQubmFtZSA9PT0gZmllbGROYW1lKTtcbiAgICBpbnZhcmlhbnQocmVzdWx0ICE9IG51bGwpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBwb3NzaWJsZURpc2NyaW1pbmFudEZpZWxkc09mVW5pb25BbHRlcm5hdGUoYWx0ZXJuYXRlOiBPYmplY3RUeXBlKTogU2V0PHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgU2V0KGFsdGVybmF0ZS5maWVsZHNcbiAgICAgICAgLmZpbHRlcihmaWVsZCA9PiBpc0xpdGVyYWxUeXBlKHJlc29sdmVQb3NzaWJseU5hbWVkVHlwZShmaWVsZC50eXBlKSkpXG4gICAgICAgIC5tYXAoZmllbGQgPT4gZmllbGQubmFtZSkpO1xuICB9XG5cbiAgLy8gVmFsaWRhdGVzIGEgdHlwZSB3aGljaCBpcyBub3QgZGlyZWN0bHkgYSByZXR1cm4gdHlwZS5cbiAgZnVuY3Rpb24gdmFsaWRhdGVUeXBlKHR5cGU6IFR5cGUpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHR5cGUua2luZCkge1xuICAgICAgY2FzZSAnYW55JzpcbiAgICAgIGNhc2UgJ21peGVkJzpcbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICBjYXNlICdzdHJpbmctbGl0ZXJhbCc6XG4gICAgICBjYXNlICdib29sZWFuLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnbnVtYmVyLWxpdGVyYWwnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgY2FzZSAncHJvbWlzZSc6XG4gICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgdGhyb3cgZXJyb3IodHlwZSwgJ1Byb21pc2UsIHZvaWQgYW5kIE9ic2VydmFibGUgdHlwZXMgbWF5IG9ubHkgYmUgdXNlZCBhcyByZXR1cm4gdHlwZXMnKTtcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2V0JzpcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbnVsbGFibGUnOlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXAnOlxuICAgICAgICB2YWxpZGF0ZVR5cGUodHlwZS5rZXlUeXBlKTtcbiAgICAgICAgdmFsaWRhdGVUeXBlKHR5cGUudmFsdWVUeXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICB0eXBlLmZpZWxkcy5tYXAoZmllbGQgPT4gZmllbGQudHlwZSkuZm9yRWFjaCh2YWxpZGF0ZVR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R1cGxlJzpcbiAgICAgICAgdHlwZS50eXBlcy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAndW5pb24nOlxuICAgICAgICB2YWxpZGF0ZVVuaW9uVHlwZSh0eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmdW5jdGlvbic6XG4gICAgICAgIHR5cGUuYXJndW1lbnRUeXBlcy5mb3JFYWNoKHZhbGlkYXRlVHlwZSk7XG4gICAgICAgIHZhbGlkYXRlUmV0dXJuVHlwZSh0eXBlLCByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUodHlwZS5yZXR1cm5UeXBlKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbmFtZWQnOlxuICAgICAgICBjb25zdCByZXNvbHZlZFR5cGUgPSByZXNvbHZlTmFtZWRUeXBlKHR5cGUpO1xuICAgICAgICAvLyBOb3RlOiBXZSBkbyBub3QgcmVjdXJzZSBoZXJlIGFzIHR5cGVzIG1heSBiZSBzZWxmLXJlY3Vyc2l2ZSAodGhyb3VnaCBudWxsYWJsZSBmb3JcbiAgICAgICAgLy8gZXhhbXBsZSkuXG4gICAgICAgIC8vIFRoZSByZXNvbHZlZFR5cGUgd2lsbCBhbHJlYWR5IGhhdmUgYmVlbiBjaGVja2VkIHRvIGJlIGEgdmFsaWQgYWxpYXMgdHlwZS5cbiAgICAgICAgLy8gc28gd2Ugb25seSBuZWVkIHRvIGNoZWNrIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gYWxpYXMgdHlwZXMgYW5kIG5vbi1yZXR1cm4gdHlwZXMuXG4gICAgICAgIHN3aXRjaCAocmVzb2x2ZWRUeXBlLmtpbmQpIHtcbiAgICAgICAgICBjYXNlICd2b2lkJzpcbiAgICAgICAgICBjYXNlICdwcm9taXNlJzpcbiAgICAgICAgICBjYXNlICdvYnNlcnZhYmxlJzpcbiAgICAgICAgICAgIHRocm93IGVycm9yKHR5cGUsXG4gICAgICAgICAgICAgICdQcm9taXNlLCB2b2lkIGFuZCBPYnNlcnZhYmxlIHR5cGVzIG1heSBvbmx5IGJlIHVzZWQgYXMgcmV0dXJuIHR5cGVzJyk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoSlNPTi5zdHJpbmdpZnkodHlwZSkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlcGxhY2VzIGFsbCB1c2VzIG9mIHR5cGUgYWxpYXNlcyBpbiByZXR1cm4gdHlwZXMgd2l0aCB0aGVpciBkZWZpbml0aW9uXG4gIC8vIHNvIHRoYXQgY2xpZW50cyBuZWVkIG5vdCBiZSBhd2FyZSBvZiBhbGlhc2VzLlxuICAvLyBUT0RPOiBTaG91bGQgcmVwbGFjZSBhbGwgYWxpYXNlcywgaG93ZXZlciB0aGF0IHdpbGwgcmVxdWlyZSByZXdyaXRpbmcgbWFyc2FsbGluZy5cbiAgZnVuY3Rpb24gY2Fubm9uaWNhbGl6ZSgpOiB2b2lkIHtcbiAgICB2aXNpdEFsbFR5cGVzKGNhbm5vbmljYWxpemVUeXBlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZXM6IEFycmF5PFR5cGU+KTogdm9pZCB7XG4gICAgdHlwZXMuZm9yRWFjaChjYW5ub25pY2FsaXplVHlwZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5ub25pY2FsaXplVHlwZSh0eXBlOiBUeXBlKTogdm9pZCB7XG4gICAgc3dpdGNoICh0eXBlLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2FueSc6XG4gICAgICBjYXNlICdtaXhlZCc6XG4gICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nLWxpdGVyYWwnOlxuICAgICAgY2FzZSAnYm9vbGVhbi1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ251bWJlci1saXRlcmFsJzpcbiAgICAgIGNhc2UgJ3ZvaWQnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3Byb21pc2UnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29ic2VydmFibGUnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzZXQnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnR5cGUpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ251bGxhYmxlJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS50eXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdtYXAnOlxuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLmtleVR5cGUpO1xuICAgICAgICBjYW5ub25pY2FsaXplVHlwZSh0eXBlLnZhbHVlVHlwZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgdHlwZS5maWVsZHMuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUoZmllbGQudHlwZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3R1cGxlJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGVBcnJheSh0eXBlLnR5cGVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIGNhbm5vbmljYWxpemVUeXBlQXJyYXkodHlwZS50eXBlcyk7XG4gICAgICAgIHR5cGUudHlwZXMgPSBmbGF0dGVuVW5pb25BbHRlcm5hdGVzKHR5cGUudHlwZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGVBcnJheSh0eXBlLmFyZ3VtZW50VHlwZXMpO1xuICAgICAgICB0eXBlLnJldHVyblR5cGUgPSByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUodHlwZS5yZXR1cm5UeXBlKTtcbiAgICAgICAgY2Fubm9uaWNhbGl6ZVR5cGUodHlwZS5yZXR1cm5UeXBlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICduYW1lZCc6XG4gICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGRvZXMgbm90IHJlY3Vyc2UsIHNvIHRoZSBhbGdvcml0aG0gd2lsbCBhbHdheXMgdGVybWluYXRlLlxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihKU09OLnN0cmluZ2lmeSh0eXBlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gV2lsbCByZXR1cm4gYSBuYW1lZCB0eXBlIGlmIGFuZCBvbmx5IGlmIHRoZSBhbGlhcyByZXNvbHZlcyB0byBhIGJ1aWx0aW4gdHlwZSwgb3IgYW4gaW50ZXJmYWNlLlxuICBmdW5jdGlvbiByZXNvbHZlUG9zc2libHlOYW1lZFR5cGUodHlwZTogVHlwZSk6IFR5cGUge1xuICAgIGlmICh0eXBlLmtpbmQgPT09ICduYW1lZCcpIHtcbiAgICAgIHJldHVybiByZXNvbHZlTmFtZWRUeXBlKHR5cGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdHlwZTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBmbGF0dGVuVW5pb25BbHRlcm5hdGVzKHR5cGVzOiBBcnJheTxUeXBlPik6IEFycmF5PFR5cGU+IHtcbiAgICByZXR1cm4gW10uY29uY2F0KC4uLiB0eXBlcy5tYXAoYWx0ZXJuYXRlID0+IHtcbiAgICAgIGNvbnN0IHJlc29sdmVkQWx0ZXJuYXRlID0gcmVzb2x2ZVBvc3NpYmx5TmFtZWRUeXBlKGFsdGVybmF0ZSk7XG4gICAgICByZXR1cm4gcmVzb2x2ZWRBbHRlcm5hdGUua2luZCA9PT0gJ3VuaW9uJyA/XG4gICAgICAgICAgZmxhdHRlblVuaW9uQWx0ZXJuYXRlcyhyZXNvbHZlZEFsdGVybmF0ZS50eXBlcykgOlxuICAgICAgICAgIHJlc29sdmVkQWx0ZXJuYXRlO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIGRlZmluaXRpb24gb2YgYSBuYW1lZCB0eXBlLiBJZiB0aGUgdHlwZSByZXNvbHZlcyB0byBhbiBhbGlhcyBpdCByZXR1cm5zIHRoZVxuICAvLyBhbGlhcydzIGRlZmluaXRpb24uXG4gIC8vIFdpbGwgcmV0dXJuIGEgbmFtZWQgdHlwZSBpZiBhbmQgb25seSBpZiB0aGUgYWxpYXMgcmVzb2x2ZXMgdG8gYSBidWlsdGluIHR5cGUsIG9yIGFuIGludGVyZmFjZS5cbiAgZnVuY3Rpb24gcmVzb2x2ZU5hbWVkVHlwZShuYW1lZFR5cGU6IE5hbWVkVHlwZSk6IFR5cGUge1xuICAgIGNvbnN0IGRlZiA9IG5hbWVkVHlwZXMuZ2V0KG5hbWVkVHlwZS5uYW1lKTtcbiAgICBpbnZhcmlhbnQoZGVmICE9IG51bGwpO1xuICAgIHN3aXRjaCAoZGVmLmtpbmQpIHtcbiAgICAgIGNhc2UgJ2FsaWFzJzpcbiAgICAgICAgY29uc3QgdHlwZSA9IGRlZi5kZWZpbml0aW9uO1xuICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgIGlmICh0eXBlLmtpbmQgPT09ICduYW1lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlTmFtZWRUeXBlKHR5cGUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmFtZWRUeXBlO1xuICAgICAgY2FzZSAnaW50ZXJmYWNlJzpcbiAgICAgICAgcmV0dXJuIG5hbWVkVHlwZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5leHBlY3RlZCBkZWZpbml0aW9uIGtpbmQnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2aXNpdEFsbFR5cGVzKG9wZXJhdGlvbjogKHR5cGU6IFR5cGUpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IGRlZmluaXRpb24gb2YgZGVmaW5pdGlvbnMudmFsdWVzKCkpIHtcbiAgICAgIHN3aXRjaCAoZGVmaW5pdGlvbi5raW5kKSB7XG4gICAgICAgIGNhc2UgJ2Z1bmN0aW9uJzpcbiAgICAgICAgICBvcGVyYXRpb24oZGVmaW5pdGlvbi50eXBlKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnYWxpYXMnOlxuICAgICAgICAgIGlmIChkZWZpbml0aW9uLmRlZmluaXRpb24gIT0gbnVsbCkge1xuICAgICAgICAgICAgb3BlcmF0aW9uKGRlZmluaXRpb24uZGVmaW5pdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdpbnRlcmZhY2UnOlxuICAgICAgICAgIGRlZmluaXRpb24uY29uc3RydWN0b3JBcmdzLmZvckVhY2gob3BlcmF0aW9uKTtcbiAgICAgICAgICBkZWZpbml0aW9uLmluc3RhbmNlTWV0aG9kcy5mb3JFYWNoKG9wZXJhdGlvbik7XG4gICAgICAgICAgZGVmaW5pdGlvbi5zdGF0aWNNZXRob2RzLmZvckVhY2gob3BlcmF0aW9uKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlcnJvcih0eXBlOiBUeXBlLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gZXJyb3JMb2NhdGlvbnMoW3R5cGUubG9jYXRpb25dLCBtZXNzYWdlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVycm9yTG9jYXRpb25zKGxvY2F0aW9uczogQXJyYXk8TG9jYXRpb24+LCBtZXNzYWdlOiBzdHJpbmcpOiBFcnJvciB7XG4gICAgbGV0IGZ1bGxNZXNzYWdlID0gYCR7bG9jYXRpb25Ub1N0cmluZyhsb2NhdGlvbnNbMF0pfToke21lc3NhZ2V9YDtcbiAgICBmdWxsTWVzc2FnZSA9IGZ1bGxNZXNzYWdlLmNvbmNhdChcbiAgICAgIC4uLiAobG9jYXRpb25zLnNsaWNlKDEpLm1hcChsb2NhdGlvbiA9PlxuICAgICAgICBgXFxuJHtsb2NhdGlvblRvU3RyaW5nKGxvY2F0aW9uKX06IFJlbGF0ZWQgbG9jYXRpb25gKSkpO1xuICAgIHJldHVybiBuZXcgRXJyb3IoZnVsbE1lc3NhZ2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gZXJyb3JEZWZpbml0aW9ucyhkZWZzOiBBcnJheTxEZWZpbml0aW9uPiwgbWVzc2FnZTogc3RyaW5nKTogRXJyb3Ige1xuICAgIGxldCBmdWxsTWVzc2FnZSA9IGAke2xvY2F0aW9uVG9TdHJpbmcoZGVmc1swXS5sb2NhdGlvbil9OiR7bWVzc2FnZX1gO1xuICAgIGZ1bGxNZXNzYWdlID0gZnVsbE1lc3NhZ2UuY29uY2F0KFxuICAgICAgLi4uIChkZWZzLnNsaWNlKDEpLm1hcChkZWZpbml0aW9uID0+XG4gICAgICAgIGBcXG4ke2xvY2F0aW9uVG9TdHJpbmcoZGVmaW5pdGlvbi5sb2NhdGlvbil9OiBSZWxhdGVkIGRlZmluaXRpb24gJHtkZWZpbml0aW9uLm5hbWV9YCkpKTtcbiAgICByZXR1cm4gbmV3IEVycm9yKGZ1bGxNZXNzYWdlKTtcbiAgfVxufVxuIl19