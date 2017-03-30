'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAutocompleteSuggestions = getAutocompleteSuggestions;

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _introspection;

function _load_introspection() {
  return _introspection = require('graphql/type/introspection');
}

var _autocompleteUtils;

function _load_autocompleteUtils() {
  return _autocompleteUtils = require('./autocompleteUtils');
}

var _CharacterStream;

function _load_CharacterStream() {
  return _CharacterStream = _interopRequireDefault(require('../parser/CharacterStream'));
}

var _onlineParser;

function _load_onlineParser() {
  return _onlineParser = _interopRequireDefault(require('../parser/onlineParser'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Given GraphQLSchema, queryText, and context of the current position within
 * the source text, provide a list of typeahead entries.
 */

function getAutocompleteSuggestions(schema, queryText, cursor) {
  const token = getTokenAtPosition(queryText, cursor);

  const state = token.state.kind === 'Invalid' ? token.state.prevState : token.state;

  // relieve flow errors by checking if `state` exists
  if (!state) {
    return [];
  }

  const kind = state.kind;
  const step = state.step;
  const typeInfo = getTypeInfo(schema, token.state);

  // Definition kinds
  if (kind === 'Document') {
    return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, [{ text: 'query' }, { text: 'mutation' }, { text: 'subscription' }, { text: 'fragment' }, { text: '{' }]);
  }

  // Field names
  if (kind === 'SelectionSet' || kind === 'Field' || kind === 'AliasedField') {
    return getSuggestionsForFieldNames(cursor, token, typeInfo, schema);
  }

  // Argument names
  if (kind === 'Arguments' || kind === 'Argument' && step === 0) {
    const argDefs = typeInfo.argDefs;
    if (argDefs) {
      return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, argDefs.map(argDef => ({
        text: argDef.name,
        type: argDef.type,
        description: argDef.description
      })));
    }
  }

  // Input Object fields
  if (kind === 'ObjectValue' || kind === 'ObjectField' && step === 0) {
    if (typeInfo.objectFieldDefs) {
      const objectFields = (0, (_autocompleteUtils || _load_autocompleteUtils()).objectValues)(typeInfo.objectFieldDefs);
      return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, objectFields.map(field => ({
        text: field.name,
        type: field.type,
        description: field.description
      })));
    }
  }

  // Input values: Enum and Boolean
  if (kind === 'EnumValue' || kind === 'ListValue' && step === 1 || kind === 'ObjectField' && step === 2 || kind === 'Argument' && step === 2) {
    return getSuggestionsForInputValues(cursor, token, typeInfo);
  }

  // Fragment type conditions
  if (kind === 'TypeCondition' && step === 1 || kind === 'NamedType' && state.prevState != null && state.prevState.kind === 'TypeCondition') {
    return getSuggestionsForFragmentTypeConditions(cursor, token, typeInfo, schema);
  }

  // Fragment spread names
  if (kind === 'FragmentSpread' && step === 1) {
    return getSuggestionsForFragmentSpread(cursor, token, typeInfo, schema, queryText);
  }

  // Variable definition types
  if (kind === 'VariableDefinition' && step === 2 || kind === 'ListType' && step === 1 || kind === 'NamedType' && state.prevState && (state.prevState.kind === 'VariableDefinition' || state.prevState.kind === 'ListType')) {
    return getSuggestionsForVariableDefinition(cursor, token, schema);
  }

  // Directive names
  if (kind === 'Directive') {
    return getSuggestionsForDirective(cursor, token, state, schema);
  }

  return [];
}

// Helper functions to get suggestions for each kinds
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function getSuggestionsForFieldNames(cursor, token, typeInfo, schema) {
  if (typeInfo.parentType) {
    const parentType = typeInfo.parentType;
    const fields = parentType.getFields ? (0, (_autocompleteUtils || _load_autocompleteUtils()).objectValues)(parentType.getFields()) : [];
    if ((0, (_graphql || _load_graphql()).isAbstractType)(parentType)) {
      fields.push((_introspection || _load_introspection()).TypeNameMetaFieldDef);
    }
    if (parentType === schema.getQueryType()) {
      fields.push((_introspection || _load_introspection()).SchemaMetaFieldDef, (_introspection || _load_introspection()).TypeMetaFieldDef);
    }
    return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, fields.map(field => ({
      text: field.name,
      type: field.type,
      description: field.description,
      isDeprecated: field.isDeprecated,
      deprecationReason: field.deprecationReason
    })));
  }
  return [];
}

function getSuggestionsForInputValues(cursor, token, typeInfo) {
  const namedInputType = (0, (_graphql || _load_graphql()).getNamedType)(typeInfo.inputType);
  if (namedInputType instanceof (_graphql || _load_graphql()).GraphQLEnumType) {
    const valueMap = namedInputType.getValues();
    const values = (0, (_autocompleteUtils || _load_autocompleteUtils()).objectValues)(valueMap);
    return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, values.map(value => ({
      text: value.name,
      type: namedInputType,
      description: value.description,
      isDeprecated: value.isDeprecated,
      deprecationReason: value.deprecationReason
    })));
  } else if (namedInputType === (_graphql || _load_graphql()).GraphQLBoolean) {
    return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, [{ text: 'true', type: (_graphql || _load_graphql()).GraphQLBoolean, description: 'Not false.' }, { text: 'false', type: (_graphql || _load_graphql()).GraphQLBoolean, description: 'Not true.' }]);
  }

  return [];
}

function getSuggestionsForFragmentTypeConditions(cursor, token, typeInfo, schema) {
  let possibleTypes;
  if (typeInfo.parentType) {
    if ((0, (_graphql || _load_graphql()).isAbstractType)(typeInfo.parentType)) {
      // Collect both the possible Object types as well as the interfaces
      // they implement.
      const possibleObjTypes = schema.getPossibleTypes(typeInfo.parentType);
      const possibleIfaceMap = Object.create(null);
      possibleObjTypes.forEach(type => {
        type.getInterfaces().forEach(iface => {
          possibleIfaceMap[iface.name] = iface;
        });
      });
      possibleTypes = possibleObjTypes.concat((0, (_autocompleteUtils || _load_autocompleteUtils()).objectValues)(possibleIfaceMap));
    } else {
      // The parent type is a non-abstract Object type, so the only possible
      // type that can be used is that same type.
      possibleTypes = [typeInfo.parentType];
    }
  } else {
    const typeMap = schema.getTypeMap();
    possibleTypes = (0, (_autocompleteUtils || _load_autocompleteUtils()).objectValues)(typeMap).filter((_graphql || _load_graphql()).isCompositeType);
  }
  return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, possibleTypes.map(type => ({
    text: type.name,
    description: type.description
  })));
}

function getSuggestionsForFragmentSpread(cursor, token, typeInfo, schema, queryText) {
  const typeMap = schema.getTypeMap();
  const defState = (0, (_autocompleteUtils || _load_autocompleteUtils()).getDefinitionState)(token.state);
  const fragments = getFragmentDefinitions(queryText);

  // Filter down to only the fragments which may exist here.
  const relevantFrags = fragments.filter(frag =>
  // Only include fragments with known types.
  typeMap[frag.typeCondition.name.value] &&
  // Only include fragments which are not cyclic.
  !(defState && defState.kind === 'FragmentDefinition' && defState.name === frag.name.value) &&
  // Only include fragments which could possibly be spread here.
  (0, (_graphql || _load_graphql()).doTypesOverlap)(schema, typeInfo.parentType, typeMap[frag.typeCondition.name.value]));

  return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, relevantFrags.map(frag => ({
    text: frag.name.value,
    type: typeMap[frag.typeCondition.name.value],
    description: `fragment ${frag.name.value} on ${frag.typeCondition.name.value}`
  })));
}

function getFragmentDefinitions(queryText) {
  const fragmentDefs = [];
  runOnlineParser(queryText, (_, state) => {
    if (state.kind === 'FragmentDefinition' && state.name && state.type) {
      fragmentDefs.push({
        kind: 'FragmentDefinition',
        name: {
          kind: 'Name',
          value: state.name
        },
        typeCondition: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: state.type
          }
        }
      });
    }
  });

  return fragmentDefs;
}

function getSuggestionsForVariableDefinition(cursor, token, schema) {
  const inputTypeMap = schema.getTypeMap();
  const inputTypes = (0, (_autocompleteUtils || _load_autocompleteUtils()).objectValues)(inputTypeMap).filter((_graphql || _load_graphql()).isInputType);
  return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, inputTypes.map(type => ({
    text: type.name,
    description: type.description
  })));
}

function getSuggestionsForDirective(cursor, token, state, schema) {
  if (state.prevState && state.prevState.kind) {
    const stateKind = state.prevState.kind;
    const directives = schema.getDirectives().filter(directive => canUseDirective(stateKind, directive));
    return (0, (_autocompleteUtils || _load_autocompleteUtils()).hintList)(cursor, token, directives.map(directive => ({
      text: directive.name,
      description: directive.description
    })));
  }
  return [];
}

function getTokenAtPosition(queryText, cursor) {
  let styleAtCursor = null;
  let stateAtCursor = null;
  let stringAtCursor = null;
  const token = runOnlineParser(queryText, (stream, state, style, index) => {
    if (index === cursor.row) {
      if (stream.getCurrentPosition() > cursor.column) {
        return 'BREAK';
      }
      styleAtCursor = style;
      stateAtCursor = Object.assign({}, state);
      stringAtCursor = stream.current();
    }
  });

  // Return the state/style of parsed token in case those at cursor aren't
  // available.
  return {
    start: token.start,
    end: token.end,
    string: stringAtCursor || token.string,
    state: stateAtCursor || token.state,
    style: styleAtCursor || token.style
  };
}

/**
 * Provides an utility function to parse a given query text and construct a
 * `token` context object.
 * A token context provides useful information about the token/style that
 * CharacterStream currently possesses, as well as the end state and style
 * of the token.
 */


function runOnlineParser(queryText, callback) {
  const lines = queryText.split('\n');
  const parser = (0, (_onlineParser || _load_onlineParser()).default)();
  let state = parser.startState();
  let style = '';

  let stream = new (_CharacterStream || _load_CharacterStream()).default('');

  for (let i = 0; i < lines.length; i++) {
    stream = new (_CharacterStream || _load_CharacterStream()).default(lines[i]);
    // Stop the parsing when the stream arrives at the current cursor position
    while (!stream.eol()) {
      style = parser.token(stream, state);
      const code = callback(stream, state, style, i);
      if (code === 'BREAK') {
        break;
      }
    }

    if (!state.kind) {
      state = parser.startState();
    }
  }

  return {
    start: stream.getStartOfToken(),
    end: stream.getCurrentPosition(),
    string: stream.current(),
    state,
    style
  };
}

function canUseDirective(kind, directive) {
  const locations = directive.locations;
  switch (kind) {
    case 'Query':
      return locations.indexOf('QUERY') !== -1;
    case 'Mutation':
      return locations.indexOf('MUTATION') !== -1;
    case 'Subscription':
      return locations.indexOf('SUBSCRIPTION') !== -1;
    case 'Field':
    case 'AliasedField':
      return locations.indexOf('FIELD') !== -1;
    case 'FragmentDefinition':
      return locations.indexOf('FRAGMENT_DEFINITION') !== -1;
    case 'FragmentSpread':
      return locations.indexOf('FRAGMENT_SPREAD') !== -1;
    case 'InlineFragment':
      return locations.indexOf('INLINE_FRAGMENT') !== -1;
  }
  return false;
}

// Utility for collecting rich type information given any token's state
// from the graphql-mode parser.
function getTypeInfo(schema, tokenState) {
  const info = {
    schema,
    type: null,
    parentType: null,
    inputType: null,
    directiveDef: null,
    enumValue: null,
    fieldDef: null,
    argDef: null,
    argDefs: null,
    objectFieldDefs: null
  };

  (0, (_autocompleteUtils || _load_autocompleteUtils()).forEachState)(tokenState, state => {
    switch (state.kind) {
      case 'Query':
      case 'ShortQuery':
        info.type = schema.getQueryType();
        break;
      case 'Mutation':
        info.type = schema.getMutationType();
        break;
      case 'Subscription':
        info.type = schema.getSubscriptionType();
        break;
      case 'InlineFragment':
      case 'FragmentDefinition':
        if (state.type) {
          info.type = schema.getType(state.type);
        }
        break;
      case 'Field':
      case 'AliasedField':
        if (!info.type || !state.name) {
          info.fieldDef = null;
        } else {
          info.fieldDef = (0, (_autocompleteUtils || _load_autocompleteUtils()).getFieldDef)(schema, info.parentType, state.name);
          info.type = info.fieldDef ? info.fieldDef.type : null;
        }
        break;
      case 'SelectionSet':
        info.parentType = (0, (_graphql || _load_graphql()).getNamedType)(info.type);
        break;
      case 'Directive':
        info.directiveDef = state.name ? schema.getDirective(state.name) : null;
        break;
      case 'Arguments':
        if (!state.prevState) {
          info.argDefs = null;
        } else {
          switch (state.prevState.kind) {
            case 'Field':
              info.argDefs = info.fieldDef && info.fieldDef.args;
              break;
            case 'Directive':
              info.argDefs = info.directiveDef && info.directiveDef.args;
              break;
            case 'AliasedField':
              const name = state.prevState && state.prevState.name;
              if (!name) {
                info.argDefs = null;
                break;
              }
              const fieldDef = (0, (_autocompleteUtils || _load_autocompleteUtils()).getFieldDef)(schema, info.parentType, name);
              if (!fieldDef) {
                info.argDefs = null;
                break;
              }
              info.argDefs = fieldDef.args;
              break;
            default:
              info.argDefs = null;
              break;
          }
        }
        break;
      case 'Argument':
        info.argDef = null;
        if (info.argDefs) {
          for (let i = 0; i < info.argDefs.length; i++) {
            if (info.argDefs[i].name === state.name) {
              info.argDef = info.argDefs[i];
              break;
            }
          }
        }
        info.inputType = info.argDef && info.argDef.type;
        break;
      case 'EnumValue':
        const enumType = (0, (_graphql || _load_graphql()).getNamedType)(info.inputType);
        info.enumValue = enumType instanceof (_graphql || _load_graphql()).GraphQLEnumType ? find(enumType.getValues(), val => val.value === state.name) : null;
        break;
      case 'ListValue':
        const nullableType = (0, (_graphql || _load_graphql()).getNullableType)(info.inputType);
        info.inputType = nullableType instanceof (_graphql || _load_graphql()).GraphQLList ? nullableType.ofType : null;
        break;
      case 'ObjectValue':
        const objectType = (0, (_graphql || _load_graphql()).getNamedType)(info.inputType);
        info.objectFieldDefs = objectType instanceof (_graphql || _load_graphql()).GraphQLInputObjectType ? objectType.getFields() : null;
        break;
      case 'ObjectField':
        const objectField = state.name && info.objectFieldDefs ? info.objectFieldDefs[state.name] : null;
        info.inputType = objectField && objectField.type;
        break;
      case 'NamedType':
        info.type = schema.getType(state.name);
        break;
    }
  });

  return info;
}

// Returns the first item in the array which causes predicate to return truthy.
function find(array, predicate) {
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i])) {
      return array[i];
    }
  }
  return null;
}