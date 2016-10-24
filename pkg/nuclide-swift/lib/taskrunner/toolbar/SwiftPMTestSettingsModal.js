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
import {AtomInput} from '../../../../nuclide-ui/AtomInput';
import {Button, ButtonTypes} from '../../../../nuclide-ui/Button';
import {ButtonGroup} from '../../../../nuclide-ui/ButtonGroup';
import {Modal} from '../../../../nuclide-ui/Modal';

type Props = {
  buildPath: string,
  onDismiss: () => void,
  onSave: (
    buildPath: string,
  ) => void,
};

type State = {
  buildPath: string,
};


export default class SwiftPMTestSettingsModal extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      buildPath: props.buildPath,
    };
  }

  render(): React.Element<any> {
    return (
      <Modal onDismiss={this.props.onDismiss}>
        <div className="block">
          <label>Build path:</label>
          <div className="block">
            <AtomInput
              initialValue={this.state.buildPath}
              placeholderText="Build directory path"
              onDidChange={this._onBuildPathChange.bind(this)}
              onConfirm={this._onSave.bind(this)}
            />
          </div>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <ButtonGroup>
              <Button onClick={this.props.onDismiss}>
                Cancel
              </Button>
              <Button
                buttonType={ButtonTypes.PRIMARY}
                onClick={this._onSave.bind(this)}>
                Save
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Modal>
    );
  }

  _onBuildPathChange(buildPath: string) {
    this.setState({buildPath});
  }

  _onSave() {
    this.props.onSave(
      this.state.buildPath,
    );
  }
}
