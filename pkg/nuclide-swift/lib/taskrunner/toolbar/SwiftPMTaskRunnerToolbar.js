'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {AtomInput} from '../../../../nuclide-ui/lib/AtomInput';
import {Button, ButtonSizes} from '../../../../nuclide-ui/lib/Button';
import {
  SwiftPMTaskRunnerBuildTaskMetadata,
  SwiftPMTaskRunnerTestTaskMetadata,
} from '../SwiftPMTaskRunnerTaskMetadata';
import SwiftPMBuildSettingsModal from './SwiftPMBuildSettingsModal';
import SwiftPMTestSettingsModal from './SwiftPMTestSettingsModal';

export default class SwiftPMTaskRunnerToolbar extends React.Component {
  state: {settingsVisible: boolean};

  constructor(props: mixed) {
    super(props);
    this.state = {settingsVisible: false};
    (this: any)._onChdirChange = this._onChdirChange.bind(this);
  }

  render(): React.Element<any> {
    const settingsElements = [];
    switch (this.props.activeTaskType) {
      case SwiftPMTaskRunnerBuildTaskMetadata.type:
        settingsElements.push(
          <SwiftPMBuildSettingsModal
            configuration={this.props.store.getConfiguration()}
            Xcc={this.props.store.getXcc()}
            Xlinker={this.props.store.getXlinker()}
            Xswiftc={this.props.store.getXswiftc()}
            buildPath={this.props.store.getBuildPath()}
            onDismiss={() => this._hideSettings()}
            onSave={(configuration, Xcc, Xlinker, Xswiftc, buildPath) =>
              this._saveBuildSettings(configuration, Xcc, Xlinker, Xswiftc, buildPath)}
          />,
        );
        break;
      case SwiftPMTaskRunnerTestTaskMetadata.type:
        settingsElements.push(
          <SwiftPMTestSettingsModal
            buildPath={this.props.store.getTestBuildPath()}
            onDismiss={() => this._hideSettings()}
            onSave={buildPath => this._saveTestSettings(buildPath)}
          />,
        );
        break;
      default:
        if (this.props.activeTaskType) {
          throw new Error(`Unrecognized task type: ${this.props.activeTaskType}`);
        }
        break;
    }

    return (
      <div>
        <AtomInput
          className="inline-block"
          size="sm"
          initialValue={this.props.store.getChdir()}
          onDidChange={chdir => this._onChdirChange(chdir)}
          placeholderText="Path to Swift package"
          width={400}
        />
        <Button
          className="nuclide-swift-settings icon icon-gear"
          size={ButtonSizes.SMALL}
          disabled={false}
          onClick={() => this._showSettings()}
        />
        {this.state.settingsVisible ? settingsElements : null}
      </div>
    );
  }

  _onChdirChange(value: string) {
    this.props.actions.updateChdir(value);
  }

  _showSettings() {
    this.setState({settingsVisible: true});
  }

  _hideSettings() {
    this.setState({settingsVisible: false});
  }

  _saveBuildSettings(
    configuration: string,
    Xcc: string,
    Xlinker: string,
    Xswiftc: string,
    buildPath: string,
  ) {
    this.props.actions.updateBuildSettings(
      configuration,
      Xcc,
      Xlinker,
      Xswiftc,
      buildPath,
    );
    this._hideSettings();
  }

  _saveTestSettings(buildPath: string) {
    this.props.actions.updateTestSettings(buildPath);
    this._hideSettings();
  }
}
