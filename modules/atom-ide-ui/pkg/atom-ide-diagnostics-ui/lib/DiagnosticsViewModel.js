/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IconName} from 'nuclide-commons-ui/Icon';
import type {Props} from './ui/DiagnosticsView';

import React from 'react';
import DiagnosticsUi from './ui/DiagnosticsUi';
import analytics from 'nuclide-commons-atom/analytics';
import observePaneItemVisibility from 'nuclide-commons-atom/observePaneItemVisibility';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import {toggle} from 'nuclide-commons/observable';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {Observable} from 'rxjs';

type SerializedDiagnosticsViewModel = {
  deserializer: 'atom-ide-ui.DiagnosticsViewModel',
};

// The shape of the state that's shared between views (if there are multiple). Right now, this is
// the same as the component's Props, but that could change if we want to support multiple instances
// of the Diagnostics view each with different filters, for example.
export type GlobalViewState = Props;

export const WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics';

export class DiagnosticsViewModel {
  _element: ?HTMLElement;
  _props: Observable<Props>;
  _visibilitySubscription: rxjs$ISubscription;

  constructor(states: Observable<GlobalViewState>) {
    const visibility = observePaneItemVisibility(this).distinctUntilChanged();
    this._visibilitySubscription = visibility
      .debounceTime(1000)
      .distinctUntilChanged()
      .filter(Boolean)
      .subscribe(() => {
        analytics.track('diagnostics-show-table');
      });

    // "Mute" the props stream when the view is hidden so we don't do unnecessary updates.
    this._props = toggle(states, visibility);
  }

  destroy(): void {
    this._visibilitySubscription.unsubscribe();
  }

  getTitle(): string {
    return 'Diagnostics';
  }

  getIconName(): IconName {
    return 'law';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'bottom';
  }

  serialize(): SerializedDiagnosticsViewModel {
    return {
      deserializer: 'atom-ide-ui.DiagnosticsViewModel',
    };
  }

  getElement(): HTMLElement {
    if (this._element == null) {
      const Component = bindObservableAsProps(this._props, DiagnosticsUi);
      const element = renderReactRoot(<Component />);
      element.classList.add('diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }
}
