'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type Gadget = {
  gadgetId: string;

  // For now, locations are pretty limited. In the future we might support more complicated things,
  // including nested locations ("the bottom of the right") and event different container types
  // (pane items vs panels).
  defaultLocation?: GadgetLocation;

  deserializeState?: (state: Object) => Object;
  prototype: Object;
};

export type GadgetLocation = 'active-pane' | 'top' | 'bottom' | 'left' | 'right';

export type GadgetsService = {
  destroyGadget(gadgetId: string): void;
  registerGadget(gadget: Gadget): IDisposable;
  showGadget(gadgetId: string): void;
};
