'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This module contains some utilities for dealing with "container" (pane or pane axis) visibility.

import type {PaneItemContainer} from '../types/PaneItemContainer';

import * as ExpandedFlexScale from './ExpandedFlexScale';

export function isHidden(container: PaneItemContainer): boolean {
  // TODO: Leave a little wiggle room here? Hard to know a good number for flex scale.
  return container.getFlexScale() === 0;
}

export function hide(container: PaneItemContainer): void {
  if (isHidden(container)) {
    return;
  }

  const currentFlexScale = container.getFlexScale();
  container.setFlexScale(0);

  // Store the original flex scale so we can restore to it later.
  ExpandedFlexScale.set(container, currentFlexScale);
}
