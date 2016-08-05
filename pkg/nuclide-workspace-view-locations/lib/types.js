'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type SerializedPanelLocation = {
  deserializer: 'PanelLocation',
  data: {
    activeItemIndex: number,
    items: Array<Object>,
    visible: boolean,
  },
};

export type SerializedPanelLocationItem = {
  deserializer: 'PanelLocationItem',
  data: {
    activeItemIndex: number,
    items: Array<Object>,
  },
};

export type PanelLocationId =
  'top-panel'
  | 'right-panel'
  | 'bottom-panel'
  | 'left-panel';
