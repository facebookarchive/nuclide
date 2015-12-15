'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget} from '../../gadgets-interfaces';
import type {PaneItemContainer} from './PaneItemContainer';

/**
 * The interface for changing the application state. These would also be called
 * "action creators" in vanilla Flux.
 */
export type Commands = {
  createPaneItem(gadgetId: string, props: Object): ?Object;
  destroyPaneItem(item: Object): void;
  deactivate(): void;
  openUri(uri: string): ?Object;
  renderPaneItems(): void;
  replacePlaceholder(item: Object, pane: Object, index: number): ?Object;
  registerGadget(gadget: Gadget): void;
  showGadget(gadgetId: string): Object;
  unregisterGadget(gadgetId: string): void;
  updateExpandedFlexScale(paneItemContainer: PaneItemContainer): void;
};
