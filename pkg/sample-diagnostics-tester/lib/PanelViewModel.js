/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import PanelView from './PanelView';
import * as React from 'react';

export type AddMessagesType = (
  severity: 'error' | 'warning' | 'info',
  count: number,
) => mixed;
export type ClearType = () => mixed;

export default class PanelViewModel {
  element: ?HTMLElement;

  constructor(options: {+addMessages: AddMessagesType, +clear: ClearType}) {
    this.element = renderReactRoot(<PanelView {...options} />);
  }

  getTitle() {
    return 'Diagnostics Tester';
  }

  getDefaultLocation(): string {
    return 'right';
  }
}
