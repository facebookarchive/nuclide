/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {OutlineForUi, SerializedOutlineViewPanelState} from '..';

import React from 'react';

import {renderReactRoot} from '../../commons-atom/renderReactRoot';
import {OutlineView} from './OutlineView';
import {BehaviorSubject, Observable} from 'rxjs';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/outline-view';

export class OutlineViewPanelState {
  _outlines: Observable<OutlineForUi>;
  _visibility: BehaviorSubject<boolean>;

  constructor(outlines: Observable<OutlineForUi>) {
    this._outlines = outlines;
    this._visibility = new BehaviorSubject(true);
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

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'right';
  }

  didChangeVisibility(visible: boolean): void {
    this._visibility.next(visible);
  }

  getElement(): HTMLElement {
    const outlines = this._visibility.switchMap(visible => (
      visible ? this._outlines : Observable.of({kind: 'empty'})
    ));
    return renderReactRoot(<OutlineView outlines={outlines} />);
  }

  serialize(): SerializedOutlineViewPanelState {
    return {
      deserializer: 'nuclide.OutlineViewPanelState',
    };
  }
}
