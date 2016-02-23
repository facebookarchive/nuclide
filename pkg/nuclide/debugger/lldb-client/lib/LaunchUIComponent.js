'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

import type {LaunchAttachStore} from './LaunchAttachStore';
import type {LaunchAttachActions} from './LaunchAttachActions';

import {React} from 'react-for-atom';
import AtomInput from '../../../ui/atom-input';

type PropsType = {
  store: LaunchAttachStore;
  actions: LaunchAttachActions;
}

export class LaunchUIComponent extends React.Component<void, PropsType, void> {
  constructor(props: PropsType) {
    super(props);
    (this: any)._handleLaunchClick = this._handleLaunchClick.bind(this);
  }

  render(): ReactElement {
    return (
      <div className="block">
        <label>Executable: </label>
        <AtomInput
          ref="launchCommandLine"
          placeholderText="Input the executable path you want to launch"
        />
        <button className="btn" onClick={this._handleLaunchClick}>Launch</button>
      </div>
    );
  }

  _handleLaunchClick(): void {
    const launchExecutable = this.refs['launchCommandLine'].getText();
    // TODO: fill other fields from UI.
    const launchTarget = {
      executablePath: launchExecutable,
      arguments: [],
      environmentVariables: [],
      workingDirectory: '.',
    };
    // Fire and forget.
    this.props.actions.launchDebugger(launchTarget);
  }
}
