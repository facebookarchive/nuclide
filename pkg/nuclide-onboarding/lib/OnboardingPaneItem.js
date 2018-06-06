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

type Props = {
  taskDetails: Observable<OnboardingModelState>,
  selectTaskHandler: string => void,
};

export default class OnboardingPaneItem {
  _taskDetails: Observable<OnboardingModelState>;
  _selectTaskHandler: string => void;

  constructor(props: Props) {
    this._taskDetails = props.taskDetails;
    this._selectTaskHandler = props.selectTaskHandler;
  }

  getElement(): HTMLElement {
    const DecoratedOnboardingPaneContents = bindObservableAsProps(
      this._taskDetails,
      OnboardingPaneContents,
    );

    return renderReactRoot(
      <DecoratedOnboardingPaneContents
        selectTaskHandler={this._selectTaskHandler}
      />,
    );
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
