'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getOutline = getOutline;

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

var _kinds;

function _load_kinds() {
  return _kinds = require('graphql/language/kinds');
}

var _Range;

function _load_Range() {
  return _Range = require('../utils/Range');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const OUTLINEABLE_KINDS = {
  Field: true,
  OperationDefinition: true,
  Document: true,
  SelectionSet: true,
  Name: true,
  FragmentDefinition: true,
  FragmentSpread: true,
  InlineFragment: true
};

function getOutline(queryText) {
  let ast;
  try {
    ast = (0, (_graphql || _load_graphql()).parse)(queryText);
  } catch (error) {
    return null;
  }

  const visitorFns = outlineTreeConverter(queryText);
  const outlineTrees = (0, (_graphql || _load_graphql()).visit)(ast, {
    leave(node) {
      if (OUTLINEABLE_KINDS[node.kind] && visitorFns[node.kind]) {
        return visitorFns[node.kind](node);
      }
      return null;
    }
  });
  return { outlineTrees };
}

function outlineTreeConverter(docText) {
  const meta = node => ({
    representativeName: node.name,
    startPosition: (0, (_Range || _load_Range()).offsetToPoint)(docText, node.loc.start),
    endPosition: (0, (_Range || _load_Range()).offsetToPoint)(docText, node.loc.end),
    children: node.selectionSet || []
  });
  return {
    Field: node => {
      const tokenizedText = node.alias ? [buildToken('plain', node.alias), buildToken('plain', ': ')] : [];
      tokenizedText.push(buildToken('plain', node.name));
      return Object.assign({ tokenizedText }, meta(node));
    },
    OperationDefinition: node => {
      const nodeName = node.name || 'AnonymousQuery';
      const metaObject = meta(node);
      if (metaObject.representativeName === null) {
        metaObject.representativeName = nodeName;
      }
      return Object.assign({
        tokenizedText: [buildToken('keyword', node.operation), buildToken('whitespace', ' '), buildToken('class-name', nodeName)]
      }, metaObject);
    },
    Document: node => node.definitions,
    SelectionSet: node => concatMap(node.selections, child => child.kind === (_kinds || _load_kinds()).INLINE_FRAGMENT ? child.selectionSet : child),
    Name: node => node.value,
    FragmentDefinition: node => Object.assign({
      tokenizedText: [buildToken('keyword', 'fragment'), buildToken('whitespace', ' '), buildToken('class-name', node.name)]
    }, meta(node)),
    FragmentSpread: node => Object.assign({
      tokenizedText: [buildToken('plain', '...'), buildToken('class-name', node.name)]
    }, meta(node)),
    InlineFragment: node => node.selectionSet
  };
}

function buildToken(kind, value) {
  return { kind, value };
}

function concatMap(arr, fn) {
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    const x = fn(arr[i], i);
    if (Array.isArray(x)) {
      res.push(...x);
    } else {
      res.push(x);
    }
  }
  return res;
}