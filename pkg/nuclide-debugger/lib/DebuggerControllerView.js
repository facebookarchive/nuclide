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

import type DebuggerModel from './DebuggerModel';

import * as React from 'react';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';

type Props = {
  model: DebuggerModel,
};

type State = {
  debuggerModelChangeListener?: IDisposable,
};

function getStateFromModel(model: DebuggerModel): State {
  return {};
}

export default class DebuggerControllerView extends React.Component<
  Props,
  State,
> {
  constructor(props: Props) {
    super(props);
    this.state = getStateFromModel(props.model);
  }

  componentWillMount() {
    this.setState({
      debuggerModelChangeListener: this.props.model.onChange(
        this._updateStateFromModel,
      ),
    });
    this._updateStateFromModel();
  }

  componentWillUnmount() {
    const listener = this.state.debuggerModelChangeListener;
    if (listener != null) {
      listener.dispose();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const listener = this.state.debuggerModelChangeListener;
    if (listener != null) {
      listener.dispose();
    }
    this.setState({
      debuggerModelChangeListener: nextProps.model.onChange(
        this._updateStateFromModel,
      ),
    });
    this._updateStateFromModel(nextProps.model);
  }

  render(): React.Node {
    if (this.props.model.getDebuggerMode() === 'starting') {
      return (
        <div className="nuclide-debugger-starting-message">
          <div>
            <span className="inline-block">Starting Debugger...</span>
            <LoadingSpinner className="inline-block" size="EXTRA_SMALL" />
          </div>
        </div>
      );
    }
    return null;
  }

  _updateStateFromModel = (model?: DebuggerModel) => {
    if (model != null) {
      this.setState(getStateFromModel(model));
    } else {
      this.setState(getStateFromModel(this.props.model));
    }
  };
}
