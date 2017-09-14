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

import type {Props} from './DiagnosticsView';

import * as React from 'react';
import featureConfig from 'nuclide-commons-atom/feature-config';
import DiagnosticsView from './DiagnosticsView';
import ExperimentalDiagnosticsView from './ExperimentalDiagnosticsView';

type UI_OPTION = 'CLASSIC' | 'EXPERIMENTAL';

type State = {
  uiToShow: ?UI_OPTION,
};

export default class DiagnosticsUi extends React.Component<Props, State> {
  _configSubscription: rxjs$ISubscription;

  constructor() {
    super();
    this.state = {
      uiToShow: null,
    };
  }

  componentDidMount(): void {
    this._configSubscription = featureConfig
      .observeAsStream('atom-ide-diagnostics-ui.useExperimentalUi')
      .subscribe(useExperimentalUi => {
        this.setState({
          uiToShow: Boolean(useExperimentalUi) ? 'EXPERIMENTAL' : 'CLASSIC',
        });
      });
  }

  render(): ?React.Node {
    switch (this.state.uiToShow) {
      case null:
        return null;
      case 'CLASSIC':
        return <DiagnosticsView {...this.props} />;
      case 'EXPERIMENTAL':
        return <ExperimentalDiagnosticsView {...this.props} />;
    }
  }
}
