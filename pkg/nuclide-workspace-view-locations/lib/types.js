/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type SerializedPanelLocation = {
  deserializer: 'PanelLocation',
  data: {
    paneContainer: ?Object,
    size: ?number,
    visible: boolean,
  },
};

export type PanelLocationId =
  'top-panel'
  | 'right-panel'
  | 'bottom-panel'
  | 'left-panel';
