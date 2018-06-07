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
  selectTaskHandler: string => void,
  setTaskCompletedHandler: (string, boolean) => Promise<mixed>,
  taskDetails: Observable<OnboardingModelState>,
};

export default class OnboardingPaneItem {
  props: Props;

  constructor(props: Props) {
    this.props = props;
  }

  getElement(): HTMLElement {
    const DecoratedOnboardingPaneContents = bindObservableAsProps(
      this.props.taskDetails,
      OnboardingPaneContents,
    );

    const {selectTaskHandler, setTaskCompletedHandler} = this.props;

    return renderReactRoot(
      <DecoratedOnboardingPaneContents
        selectTaskHandler={selectTaskHandler}
        setTaskCompletedHandler={setTaskCompletedHandler}
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
