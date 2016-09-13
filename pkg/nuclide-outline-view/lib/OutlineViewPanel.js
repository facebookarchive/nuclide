'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';
import type {OutlineForUi, SerializedOutlineViewPanelState} from '..';

import {React} from 'react-for-atom';

import {renderReactRoot} from '../../commons-atom/renderReactRoot';
import {OutlineView} from './OutlineView';

export class OutlineViewPanelState {
  _outlines: Observable<OutlineForUi>;

  constructor(outlines: Observable<OutlineForUi>) {
    this._outlines = outlines;
  }

  getTitle() {
    return 'Outline View';
  }

  getIconName() {
    return 'list-unordered';
  }

  getPreferredInitialWidth(): number {
    return 300;
  }

  getElement(): HTMLElement {
    return renderReactRoot(
      <OutlineView outlines={this._outlines} />,
    );
  }

  serialize(): SerializedOutlineViewPanelState {
    return {
      deserializer: 'nuclide.OutlineViewPanelState',
    };
  }

}
