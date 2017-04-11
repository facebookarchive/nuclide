'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateDefinitions = validateDefinitions;

var _location;

function _load_location() {
  return _location = require('./location');
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

/**
 * Throws if a named type referenced in an RPC interface is not defined.
 * The error message thrown is suitable for display to a human.
 *
 * NOTE: Will also mutate the incoming definitions in place to make them easier to marshal.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function validateDefinitions(definitions) {
  const namedTypes = new Map();
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
    Object.keys(definitions).forEach(name => {
      const definition = definitions[name];
      switch (definition.kind) {
        case 'alias':
        case 'interface':
          namedTypes.set(definition.name, definition);
          break;
      }
    });
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
        type.fields.map(field => field.type).forEach(checkTypeForMissingNames);
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
        type.argumentTypes.forEach(parameter => checkTypeForMissingNames(parameter.type));
        checkTypeForMissingNames(type.returnType);
        break;
      case 'named':
        const name = type.name;
        if (!namedTypes.has(name)) {
          throw error(type, `No definition for type ${name}.`);
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function findRecursiveAliases() {
    Object.keys(definitions).forEach(name => {
      const definition = definitions[name];
      switch (definition.kind) {
        case 'alias':
          checkAliasLayout(definition);
          break;
      }
    });
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
        type.fields.filter(field => !field.optional).map(field => field.type).forEach(validateTypeRec);
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
        const name = type.name;
        // $FlowFixMe(peterhal)
        const definition = namedTypes.get(name);
        if (containingDefinitions.indexOf(definition) !== -1) {
          throw errorDefinitions(containingDefinitions.slice(containingDefinitions.indexOf(definition)), `Type ${name} contains itself.`);
        } else if (definition.kind === 'alias' && definition.definition != null) {
          containingDefinitions.push(definition);

          if (!definition.definition) {
            throw new Error('Invariant violation: "definition.definition"');
          }

          validateLayoutRec(containingDefinitions, definition.definition);
          containingDefinitions.pop();
        }
        break;
      default:
        throw new Error(JSON.stringify(type));
    }
  }

  function validateReturnTypes() {
    Object.keys(definitions).forEach(defName => {
      const definition = definitions[defName];
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
          if (definition.constructorArgs != null) {
            definition.constructorArgs.forEach(parameter => validateType(parameter.type));
          }
          Object.keys(definition.instanceMethods).forEach(methodName => {
            validateType(definition.instanceMethods[methodName]);
          });
          Object.keys(definition.staticMethods).forEach(methodName => {
            validateType(definition.staticMethods[methodName]);
          });
          break;
      }
    });
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
    const fields = flattenIntersection(intersectionType);
    const fieldNameToLocation = new Map();
    for (const field of fields) {
      if (fieldNameToLocation.has(field.name)) {
        // TODO allow duplicate field names if they have the same type.
        const otherLocation = fieldNameToLocation.get(field.name);

        if (!(otherLocation != null)) {
          throw new Error('Invariant violation: "otherLocation != null"');
        }

        throw errorLocations([intersectionType.location, field.location, otherLocation], `Duplicate field name '${field.name}' in intersection types are not supported.`);
      }
      fieldNameToLocation.set(field.name, field.location);
    }
  }

  function validateUnionType(type) {
    const alternates = flattenUnionAlternates(type.types);

    if (isLiteralType(alternates[0])) {
      validateLiteralUnionType(type, alternates);
    } else if (alternates[0].kind === 'object') {
      validateObjectUnionType(type, alternates);
    } else {
      throw errorLocations([type.location, alternates[0].location], 'Union alternates must be either be typed object or literal types.');
    }
  }

  function validateLiteralUnionType(type, alternates) {
    alternates.reduce((previousAlternates, alternate) => {
      validateType(alternate);

      // Ensure a valid alternate
      if (!isLiteralType(alternate)) {
        throw errorLocations([type.location, alternate.location], 'Union alternates may only be literal types.');
      }

      // Ensure no duplicates
      previousAlternates.forEach(previous => {
        if (!(previous.kind === 'string-literal' || previous.kind === 'number-literal' || previous.kind === 'boolean-literal')) {
          throw new Error('Invariant violation: "previous.kind === \'string-literal\' || previous.kind === \'number-literal\'\\n            || previous.kind === \'boolean-literal\'"');
        }

        if (!(alternate.kind === 'string-literal' || alternate.kind === 'number-literal' || alternate.kind === 'boolean-literal')) {
          throw new Error('Invariant violation: "alternate.kind === \'string-literal\' || alternate.kind === \'number-literal\'\\n            || alternate.kind === \'boolean-literal\'"');
        }

        if (previous.value === alternate.value) {
          throw errorLocations([type.location, previous.location, alternate.location], 'Union alternates may not have the same value.');
        }
      });

      previousAlternates.push(alternate);
      return previousAlternates;
    }, []);
  }

  function validateObjectUnionType(type, alternates) {
    alternates.forEach(alternate => {
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
    if (!(alternates.length > 0)) {
      throw new Error('Invariant violation: "alternates.length > 0"');
    }
    // $FlowFixMe


    const possibleFields = alternates.reduce((possibilities, alternate) => {
      const alternatePossibilities = possibleDiscriminantFieldsOfUnionAlternate(alternate);
      if (alternatePossibilities.size === 0) {
        throw errorLocations([type.location, alternate.location], 'Object union alternative has no possible discriminant fields.');
      }
      // Use null to represent the set containing everything.
      if (possibilities == null) {
        return alternatePossibilities;
      } else {
        return (0, (_collection || _load_collection()).setIntersect)(alternatePossibilities, possibilities);
      }
    }, null);

    const validFields = Array.from(possibleFields).filter(fieldName => isValidDiscriminantField(alternates, fieldName));
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
    const fieldTypes = alternates.map(alternate => resolvePossiblyNamedType(getObjectFieldByName(alternate, candidateField).type));

    // Fields in all alternates must have same type.
    if (!fieldTypes.every(fieldType => fieldType.kind === fieldTypes[0].kind)) {
      return false;
    }

    // Must not have duplicate values in any alternate.
    // All alternates must be unique.
    return new Set(fieldTypes.map(fieldType => fieldType.value)).size === alternates.length;
  }

  function getObjectFieldByName(type, fieldName) {
    const result = type.fields.find(field => field.name === fieldName);

    if (!(result != null)) {
      throw new Error('Invariant violation: "result != null"');
    }

    return result;
  }

  function possibleDiscriminantFieldsOfUnionAlternate(alternate) {
    return new Set(alternate.fields.filter(field => isLiteralType(resolvePossiblyNamedType(field.type))).map(field => field.name));
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
        type.fields.map(field => field.type).forEach(validateType);
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
        type.argumentTypes.forEach(parameter => validateType(parameter.type));
        validateReturnType(type, resolvePossiblyNamedType(type.returnType));
        break;
      case 'named':
        const resolvedType = resolveNamedType(type);
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
        type.fields.forEach(field => {
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
        type.argumentTypes.forEach(parameter => {
          cannonicalizeType(parameter.type);
        });
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
    const fields = flattenIntersection(intersectionType);
    intersectionType.flattened = {
      kind: 'object',
      location: intersectionType.location,
      fields
    };
  }

  function flattenIntersection(intersectionType) {
    const fields = [];
    for (const type of intersectionType.types) {
      const resolvedType = resolvePossiblyNamedType(type);
      if (resolvedType.kind === 'object') {
        fields.push(...resolvedType.fields);
      } else if (resolvedType.kind === 'intersection') {
        fields.push(...flattenIntersection(resolvedType));
      } else {
        throw errorLocations([intersectionType.location, type.location], 'Types in intersections must be object or intersection types');
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
    return [].concat(...types.map(alternate => {
      const resolvedAlternate = resolvePossiblyNamedType(alternate);
      return resolvedAlternate.kind === 'union' ? flattenUnionAlternates(resolvedAlternate.types) : resolvedAlternate;
    }));
  }

  // Returns the definition of a named type. If the type resolves to an alias it returns the
  // alias's definition.
  // Will return a named type if and only if the alias resolves to a builtin type, or an interface.
  function resolveNamedType(namedType) {
    const def = namedTypes.get(namedType.name);

    if (!(def != null)) {
      throw new Error('Invariant violation: "def != null"');
    }

    switch (def.kind) {
      case 'alias':
        const type = def.definition;
        if (type) {
          if (type.kind === 'named') {
            return resolveNamedType(type);
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

  function visitAllTypes(operation) {
    Object.keys(definitions).forEach(name => {
      const definition = definitions[name];
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
          if (definition.constructorArgs != null) {
            definition.constructorArgs.forEach(parameter => operation(parameter.type));
          }
          Object.keys(definition.instanceMethods).forEach(methodName => {
            operation(definition.instanceMethods[methodName]);
          });
          Object.keys(definition.staticMethods).forEach(methodName => {
            operation(definition.staticMethods[methodName]);
          });
          break;
      }
    });
  }

  function error(type, message) {
    return errorLocations([type.location], message);
  }

  function errorLocations(locations, message) {
    let fullMessage = `${(0, (_location || _load_location()).locationToString)(locations[0])}:${message}`;
    fullMessage = fullMessage.concat(...locations.slice(1).map(location => `\n${(0, (_location || _load_location()).locationToString)(location)}: Related location`));
    return new Error(fullMessage);
  }

  function errorDefinitions(defs, message) {
    let fullMessage = `${(0, (_location || _load_location()).locationToString)(defs[0].location)}:${message}`;
    fullMessage = fullMessage.concat(...defs.slice(1).map(definition => `\n${(0, (_location || _load_location()).locationToString)(definition.location)}: Related definition ${definition.name}`));
    return new Error(fullMessage);
  }
}