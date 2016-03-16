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

const isResizable = pane => typeof pane.setFlexScale === 'function';
const getParent = pane => pane.getParent && pane.getParent();

/**
 * Walk up the tree finding all resizable descendants.
 */
export default function *getResizableContainers(
  container: PaneItemContainer,
): Iterable<PaneItemContainer> {
  while (container) {
    if (isResizable(container)) {
      yield container;
    }
    container = getParent(container);
  }
}
