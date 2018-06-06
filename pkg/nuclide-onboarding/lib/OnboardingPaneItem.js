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

import type {OnboardingModelState} from './types';
import type {Observable} from 'rxjs';
import * as React from 'react';

import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {renderReactRoot} from 'nuclide-commons-ui/renderReactRoot';
import OnboardingPaneContents from './OnboardingPaneContents';

export const WORKSPACE_VIEW_URI = 'atom://nuclide/onboarding';

export default class OnboardingPaneItem {
  _observableModel: Observable<OnboardingModelState>;

  constructor(observableModel: Observable<OnboardingModelState>) {
    this._observableModel = observableModel;
  }

  getElement(): HTMLElement {
    const DecoratedOnboardingPaneContents = bindObservableAsProps(
      this._observableModel,
      OnboardingPaneContents,
    );
    return renderReactRoot(<DecoratedOnboardingPaneContents />);
  }

  getTitle(): string {
    return 'Onboarding';
  }

  getIconName(): string {
    return 'onboarding';
  }

  getURI(): string {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation(): string {
    return 'center';
  }
}
