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

import GadgetPlaceholder from './GadgetPlaceholder';

export function get(container: PaneItemContainer): number {
  for (const item of container.getItems()) {
    if (item._expandedFlexScale) {
      return item._expandedFlexScale;
    }
  }
  return 1;
}

export function set(container: PaneItemContainer, value: number): void {
  // Store the number on on every gadget item in the container just in case one gets moved or
  // destroyed. It would be nice to store the information on the container (Pane, PaneAxis) itself,
  // but Atom doesn't give us a way to persist metadata about those.
  container.getItems().forEach(item => {
    if (!('gadgetId' in item.constructor) && !(item instanceof GadgetPlaceholder)) {
      // We don't control this item's serialization so no use in storing the size on it.
      return;
    }
    item._expandedFlexScale = value;
  });
}
