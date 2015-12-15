'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {PaneItemContainer} from '../types/PaneItemContainer';

import {TextEditor} from 'atom';
import getResizableContainers from './getResizableContainers';
import {array} from '../../commons';

const containsTextEditor = pane => pane.getItems().some(item => item instanceof TextEditor);

/**
 * Gets the resizeable container (Pane or PaneAxis) which should be resized in order to hide the
 * provided pane.
 */
export default function getContainerToHide(pane: PaneItemContainer): ?PaneItemContainer {
  let containerToHide = null;

  // The top-most container isn't resizable so exclude that immediately.
  const resizableContainers = array.from(getResizableContainers(pane)).slice(0, -1);

  // Find the highest resizable container that doesn't contain a text editor. If the very first
  // container has a text editor, use it anyway (we gotta hide something!)
  for (let i = 0, len = resizableContainers.length; i < len; i++) {
    const container = resizableContainers[i];
    const isLeaf = i === 0;

    if (!isLeaf && containsTextEditor(container)) {
      break;
    }

    containerToHide = container;
  }

  return containerToHide;
}
