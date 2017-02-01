'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ParseRules = exports.LexRules = exports.isIgnored = undefined;

var _RuleHelpers;

function _load_RuleHelpers() {
  return _RuleHelpers = require('./RuleHelpers');
}

/**
 * Whitespace tokens defined in GraphQL spec.
 */
const isIgnored = exports.isIgnored = ch => ch === ' ' || ch === '\t' || ch === ',' || ch === '\n' || ch === '\r' || ch === '\uFEFF';

/**
 * The lexer rules. These are exactly as described by the spec.
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

const LexRules = exports.LexRules = {
  // The Name token.
  Name: /^[_A-Za-z][_0-9A-Za-z]*/,

  // All Punctuation used in GraphQL
  Punctuation: /^(?:!|\$|\(|\)|\.\.\.|:|=|@|\[|]|\{|\||\})/,

  // Combines the IntValue and FloatValue tokens.
  Number: /^-?(?:0|(?:[1-9][0-9]*))(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?/,

  // Note the closing quote is made optional as an IDE experience improvment.
  String: /^"(?:[^"\\]|\\(?:"|\/|\\|b|f|n|r|t|u[0-9a-fA-F]{4}))*"?/,

  // Comments consume entire lines.
  Comment: /^#.*/
};

/**
 * The parser rules. These are very close to, but not exactly the same as the
 * spec. Minor deviations allow for a simpler implementation. The resulting
 * parser can parse everything the spec declares possible.
 */
const ParseRules = exports.ParseRules = {
  Document: [(0, (_RuleHelpers || _load_RuleHelpers()).list)('Definition')],
  Definition(token) {
    switch (token.value) {
      case '{':
        return 'ShortQuery';
      case 'query':
        return 'Query';
      case 'mutation':
        return 'Mutation';
      case 'subscription':
        return 'Subscription';
      case 'fragment':
        return 'FragmentDefinition';
      case 'schema':
        return 'SchemaDef';
      case 'scalar':
        return 'ScalarDef';
      case 'type':
        return 'ObjectTypeDef';
      case 'interface':
        return 'InterfaceDef';
      case 'union':
        return 'UnionDef';
      case 'enum':
        return 'EnumDef';
      case 'input':
        return 'InputDef';
      case 'extend':
        return 'ExtendDef';
      case 'directive':
        return 'DirectiveDef';
    }
  },
  // Note: instead of "Operation", these rules have been separated out.
  ShortQuery: ['SelectionSet'],
  Query: [word('query'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)(name('def')), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('VariableDefinitions'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), 'SelectionSet'],
  Mutation: [word('mutation'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)(name('def')), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('VariableDefinitions'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), 'SelectionSet'],
  Subscription: [word('subscription'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)(name('def')), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('VariableDefinitions'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), 'SelectionSet'],
  VariableDefinitions: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('('), (0, (_RuleHelpers || _load_RuleHelpers()).list)('VariableDefinition'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(')')],
  VariableDefinition: ['Variable', (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), 'Type', (0, (_RuleHelpers || _load_RuleHelpers()).opt)('DefaultValue')],
  Variable: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('$', 'variable'), name('variable')],
  DefaultValue: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('='), 'Value'],
  SelectionSet: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Selection'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  Selection(token, stream) {
    return token.value === '...' ? stream.match(/[\s\u00a0,]*(on\b|@|{)/, false) ? 'InlineFragment' : 'FragmentSpread' : stream.match(/[\s\u00a0,]*:/, false) ? 'AliasedField' : 'Field';
  },
  // Note: this minor deviation of "AliasedField" simplifies the lookahead.
  AliasedField: [name('property'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), name('qualifier'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('Arguments'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('SelectionSet')],
  Field: [name('property'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('Arguments'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('SelectionSet')],
  Arguments: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('('), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Argument'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(')')],
  Argument: [name('attribute'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), 'Value'],
  FragmentSpread: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('...'), name('def'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive')],
  InlineFragment: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('...'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('TypeCondition'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), 'SelectionSet'],
  FragmentDefinition: [word('fragment'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)((0, (_RuleHelpers || _load_RuleHelpers()).butNot)(name('def'), [word('on')])), 'TypeCondition', (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), 'SelectionSet'],
  TypeCondition: [word('on'), 'NamedType'],
  // Variables could be parsed in cases where only Const is expected by spec.
  Value(token) {
    switch (token.kind) {
      case 'Number':
        return 'NumberValue';
      case 'String':
        return 'StringValue';
      case 'Punctuation':
        switch (token.value) {
          case '[':
            return 'ListValue';
          case '{':
            return 'ObjectValue';
          case '$':
            return 'Variable';
        }
        return null;
      case 'Name':
        switch (token.value) {
          case 'true':case 'false':
            return 'BooleanValue';
        }
        if (token.value === 'null') {
          return 'NullValue';
        }
        return 'EnumValue';
    }
  },
  NumberValue: [(0, (_RuleHelpers || _load_RuleHelpers()).t)('Number', 'number')],
  StringValue: [(0, (_RuleHelpers || _load_RuleHelpers()).t)('String', 'string')],
  BooleanValue: [(0, (_RuleHelpers || _load_RuleHelpers()).t)('Name', 'builtin')],
  NullValue: [(0, (_RuleHelpers || _load_RuleHelpers()).t)('Name', 'keyword')],
  EnumValue: [name('string-2')],
  ListValue: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('['), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Value'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(']')],
  ObjectValue: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('ObjectField'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  ObjectField: [name('attribute'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), 'Value'],
  Type(token) {
    return token.value === '[' ? 'ListType' : 'NonNullType';
  },
  // NonNullType has been merged into ListType to simplify.
  ListType: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('['), 'Type', (0, (_RuleHelpers || _load_RuleHelpers()).p)(']'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)((0, (_RuleHelpers || _load_RuleHelpers()).p)('!'))],
  NonNullType: ['NamedType', (0, (_RuleHelpers || _load_RuleHelpers()).opt)((0, (_RuleHelpers || _load_RuleHelpers()).p)('!'))],
  NamedType: [type('atom')],
  Directive: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('@', 'meta'), name('meta'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('Arguments')],
  // GraphQL schema language
  SchemaDef: [word('schema'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('OperationTypeDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  OperationTypeDef: [name('keyword'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), name('atom')],
  ScalarDef: [word('scalar'), name('atom'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive')],
  ObjectTypeDef: [word('type'), name('atom'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('Implements'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('FieldDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  Implements: [word('implements'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('NamedType')],
  FieldDef: [name('property'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('ArgumentsDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), 'Type', (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive')],
  ArgumentsDef: [(0, (_RuleHelpers || _load_RuleHelpers()).p)('('), (0, (_RuleHelpers || _load_RuleHelpers()).list)('InputValueDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(')')],
  InputValueDef: [name('attribute'), (0, (_RuleHelpers || _load_RuleHelpers()).p)(':'), 'Type', (0, (_RuleHelpers || _load_RuleHelpers()).opt)('DefaultValue'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive')],
  InterfaceDef: [word('interface'), name('atom'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('FieldDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  UnionDef: [word('union'), name('atom'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('='), (0, (_RuleHelpers || _load_RuleHelpers()).list)('UnionMember', (0, (_RuleHelpers || _load_RuleHelpers()).p)('|'))],
  UnionMember: ['NamedType'],
  EnumDef: [word('enum'), name('atom'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('EnumValueDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  EnumValueDef: [name('string-2'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive')],
  InputDef: [word('input'), name('atom'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('Directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('{'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('InputValueDef'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('}')],
  ExtendDef: [word('extend'), 'ObjectTypeDef'],
  DirectiveDef: [word('directive'), (0, (_RuleHelpers || _load_RuleHelpers()).p)('@', 'meta'), name('meta'), (0, (_RuleHelpers || _load_RuleHelpers()).opt)('ArgumentsDef'), word('on'), (0, (_RuleHelpers || _load_RuleHelpers()).list)('DirectiveLocation', (0, (_RuleHelpers || _load_RuleHelpers()).p)('|'))],
  DirectiveLocation: [name('string-2')]
};

// A keyword Token.
function word(value) {
  return {
    style: 'keyword',
    match: token => token.kind === 'Name' && token.value === value
  };
}

// A Name Token which will decorate the state with a `name`.
function name(style) {
  return {
    style,
    match: token => token.kind === 'Name',
    update(state, token) {
      state.name = token.value;
    }
  };
}

// A Name Token which will decorate the previous state with a `type`.
function type(style) {
  return {
    style,
    match: token => token.kind === 'Name',
    update(state, token) {
      if (state.prevState && state.prevState.prevState) {
        state.name = token.value;
        state.prevState.prevState.type = token.value;
      }
    }
  };
}