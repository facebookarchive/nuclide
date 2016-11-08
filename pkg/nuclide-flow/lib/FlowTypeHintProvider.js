'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowTypeHintProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.getTypeHintTree = getTypeHintTree;

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _FlowServiceFactory;

function _load_FlowServiceFactory() {
  return _FlowServiceFactory = require('./FlowServiceFactory');
}

var _atom = require('atom');

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

let FlowTypeHintProvider = exports.FlowTypeHintProvider = class FlowTypeHintProvider {
  typeHint(editor, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const enabled = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableTypeHints');
      if (!enabled) {
        return null;
      }
      const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
      if (scopes.find(function (scope) {
        return scope.includes('comment');
      }) !== undefined) {
        return null;
      }
      const filePath = editor.getPath();
      if (filePath == null) {
        return null;
      }
      const contents = editor.getText();
      const flowService = yield (0, (_FlowServiceFactory || _load_FlowServiceFactory()).getFlowServiceByNuclideUri)(filePath);

      if (!flowService) {
        throw new Error('Invariant violation: "flowService"');
      }

      const enableStructuredTypeHints = (_featureConfig || _load_featureConfig()).default.get('nuclide-flow.enableStructuredTypeHints');
      const getTypeResult = yield flowService.flowGetType(filePath, contents, position.row, position.column, enableStructuredTypeHints);
      if (getTypeResult == null) {
        return null;
      }
      const type = getTypeResult.type,
            rawType = getTypeResult.rawType;

      // TODO(nmote) refine this regex to better capture JavaScript expressions.
      // Having this regex be not quite right is just a display issue, though --
      // it only affects the location of the tooltip.

      const word = (0, (_range || _load_range()).wordAtPosition)(editor, position, (_constants || _load_constants()).JAVASCRIPT_WORD_REGEX);
      let range;
      if (word) {
        range = word.range;
      } else {
        range = new _atom.Range(position, position);
      }
      const result = {
        hint: type,
        range: range
      };
      const hintTree = getTypeHintTree(rawType);
      if (hintTree) {
        return Object.assign({}, result, {
          hintTree: hintTree
        });
      } else {
        return result;
      }
    })();
  }
};
function getTypeHintTree(typeHint) {
  if (!typeHint) {
    return null;
  }
  try {
    const json = JSON.parse(typeHint);
    return jsonToTree(json);
  } catch (e) {
    logger.error(`Problem parsing type hint: ${ e.message }`);
    // If there is any problem parsing just fall back on the original string
    return null;
  }
}

const OBJECT = 'ObjT';
const NUMBER = 'NumT';
const STRING = 'StrT';
const BOOLEAN = 'BoolT';
const MAYBE = 'MaybeT';
const ANYOBJECT = 'AnyObjT';
const ARRAY = 'ArrT';
const FUNCTION = 'FunT';

function jsonToTree(json) {
  const kind = json.kind;
  switch (kind) {
    case OBJECT:
      const propTypes = json.type.propTypes;
      const children = [];
      for (const prop of propTypes) {
        const propName = prop.name;
        const childTree = jsonToTree(prop.type);
        // Instead of making single child node just for the type name, we'll graft the type onto the
        // end of the property name.
        children.push({
          value: `${ propName }: ${ childTree.value }`,
          children: childTree.children
        });
      }
      return {
        value: 'Object',
        children: children
      };
    case NUMBER:
      return {
        value: 'number'
      };
    case STRING:
      return {
        value: 'string'
      };
    case BOOLEAN:
      return {
        value: 'boolean'
      };
    case MAYBE:
      const childTree = jsonToTree(json.type);
      return {
        value: `?${ childTree.value }`,
        children: childTree.children
      };
    case ANYOBJECT:
      return {
        value: 'Object'
      };
    case ARRAY:
      const elemType = jsonToTree(json.elemType);
      return {
        value: `Array<${ elemType.value }>`,
        children: elemType.children
      };
    case FUNCTION:
      const paramNames = json.funType.paramNames;
      const paramTypes = json.funType.paramTypes;

      if (!Array.isArray(paramNames)) {
        throw new Error('Invariant violation: "Array.isArray(paramNames)"');
      }

      const parameters = paramNames.map((name, i) => {
        const type = jsonToTree(paramTypes[i]);
        return {
          value: `${ name }: ${ type.value }`,
          children: type.children
        };
      });
      const returnType = jsonToTree(json.funType.returnType);
      return {
        value: 'Function',
        children: [{
          value: 'Parameters',
          children: parameters
        }, {
          value: `Return Type: ${ returnType.value }`,
          children: returnType.children
        }]
      };
    default:
      throw new Error(`Kind ${ kind } not supported`);
  }
}