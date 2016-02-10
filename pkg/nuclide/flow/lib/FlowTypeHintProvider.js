'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../type-hint-interfaces';

import invariant from 'assert';

const {extractWordAtPosition} = require('../../atom-helpers');
const featureConfig = require('../../feature-config');
const {getServiceByNuclideUri} = require('../../client');
const {Range} = require('atom');

import {JAVASCRIPT_WORD_REGEX} from './constants';

export class FlowTypeHintProvider {
  async typeHint(editor: TextEditor, position: atom$Point): Promise<?TypeHint> {
    const enabled = featureConfig.get('nuclide-flow.enableTypeHints');
    if (!enabled) {
      return null;
    }
    const filePath = editor.getPath();
    const contents = editor.getText();
    const flowService = await getServiceByNuclideUri('FlowService', filePath);
    invariant(flowService);

    const enableStructuredTypeHints = featureConfig.get('nuclide-flow.enableStructuredTypeHints');
    const getTypeResult = await flowService.flowGetType(
      filePath,
      contents,
      position.row,
      position.column,
      enableStructuredTypeHints,
    );
    if (getTypeResult == null) {
      return null;
    }
    const {type, rawType} = getTypeResult;

    // TODO(nmote) refine this regex to better capture JavaScript expressions.
    // Having this regex be not quite right is just a display issue, though --
    // it only affects the location of the tooltip.
    const word = extractWordAtPosition(editor, position, JAVASCRIPT_WORD_REGEX);
    let range;
    if (word) {
      range = word.range;
    } else {
      range = new Range(position, position);
    }
    const result = {
      hint: type,
      range,
    };
    const hintTree = getTypeHintTree(rawType);
    if (hintTree) {
      return {
        ...result,
        hintTree,
      };
    } else {
      return result;
    }
  }
}

// TODO Import from type-hints package once it exposes it.
type HintTree = {
  value: string,
  children?: Array<HintTree>,
}

export function getTypeHintTree(typeHint: ?string): ?HintTree {
  if (!typeHint) {
    return null;
  }
  try {
    const json = JSON.parse(typeHint);
    return jsonToTree(json);
  } catch (e) {
    const logger = require('../../logging').getLogger();
    logger.error(`Problem parsing type hint: ${e.message}`);
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

function jsonToTree(json: Object): HintTree {
  const kind = json['kind'];
  switch (kind) {
    case OBJECT:
      const propTypes = json['type']['propTypes'];
      const children = [];
      for (const prop of propTypes) {
        const propName = prop['name'];
        const childTree = jsonToTree(prop['type']);
        // Instead of making single child node just for the type name, we'll graft the type onto the
        // end of the property name.
        children.push({
          value: `${propName}: ${childTree.value}`,
          children: childTree.children,
        });
      }
      return {
        value: 'Object',
        children,
      };
    case NUMBER:
      return {
        value: 'number',
      };
    case STRING:
      return {
        value: 'string',
      };
    case BOOLEAN:
      return {
        value: 'boolean',
      };
    case MAYBE:
      const childTree = jsonToTree(json['type']);
      return {
        value: `?${childTree.value}`,
        children: childTree.children,
      };
    case ANYOBJECT:
      return {
        value: 'Object',
      };
    case ARRAY:
      const elemType = jsonToTree(json['elemType']);
      return {
        value: `Array<${elemType.value}>`,
        children: elemType.children,
      };
    case FUNCTION:
      const paramNames = json['funType']['paramNames'];
      const paramTypes = json['funType']['paramTypes'];
      invariant(Array.isArray(paramNames));
      const parameters = paramNames.map((name, i) => {
        const type = jsonToTree(paramTypes[i]);
        return {
          value: `${name}: ${type.value}`,
          children: type.children,
        };
      });
      const returnType = jsonToTree(json['funType']['returnType']);
      return {
        value: 'Function',
        children: [
          {
            value: 'Parameters',
            children: parameters,
          },
          {
            value: `Return Type: ${returnType.value}`,
            children: returnType.children,
          },
        ],
      };
    default:
      throw new Error(`Kind ${kind} not supported`);
  }
}
