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
} from '../../nuclide-outline-view';
import type {FlowOutlineTree} from '../../nuclide-flow-base';

import {Point} from 'atom';

import invariant from 'assert';

import {
  getFlowServiceByNuclideUri,
  getLocalFlowService,
} from './FlowServiceFactory';


export class FlowOutlineProvider {
  async getOutline(editor: atom$TextEditor): Promise<?Outline> {
    const filePath = editor.getPath();
    let flowService;
    if (filePath != null) {
      flowService = getFlowServiceByNuclideUri(filePath);
    } else {
      flowService = getLocalFlowService();
    }
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
    tokenizedText: flowTree.tokenizedText,
    startPosition: new Point(flowTree.startPosition.line, flowTree.startPosition.column),
    children: flowTree.children.map(flowTreeToNormalTree),
  };
}
