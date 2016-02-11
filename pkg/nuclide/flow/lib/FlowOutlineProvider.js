'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  OutlineTree,
  Outline,
} from '../../outline-view';
import type {FlowOutlineTree} from '../../flow-base';

import {Point} from 'atom';

import invariant from 'assert';

export class FlowOutlineProvider {
  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const filePath = editor.getPath();
    const flowService = require('../../client').getServiceByNuclideUri('FlowService', filePath);
    invariant(flowService != null);
    const flowOutline = await flowService.flowGetOutline(editor.getText());
    if (flowOutline != null) {
      return flowOutlineToNormalOutline(flowOutline);
    } else {
      return null;
    }
  }
}

function flowOutlineToNormalOutline(
  flowOutline: Array<FlowOutlineTree>,
): Outline {
  return {
    outlineTrees: flowOutline.map(flowTreeToNormalTree),
  };
}

function flowTreeToNormalTree(flowTree): OutlineTree {
  return {
    displayText: flowTree.displayText,
    startPosition: new Point(flowTree.startLine, flowTree.startColumn),
    children: flowTree.children.map(flowTreeToNormalTree),
  };
}
