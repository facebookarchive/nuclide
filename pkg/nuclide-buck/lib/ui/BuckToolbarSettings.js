'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskSettings} from '../types';

import {React} from 'react-for-atom';
import {parse, quote} from 'shell-quote';

import {AtomInput} from '../../../nuclide-ui/lib/AtomInput';
import {Button, ButtonTypes} from '../../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../../nuclide-ui/lib/ButtonGroup';
import {Modal} from '../../../nuclide-ui/lib/Modal';

type PropTypes = {
  currentBuckRoot: ?string;
  settings: TaskSettings;
  buildType: string;
  onDismiss: () => void;
  onSave: (settings: TaskSettings) => void;
};

export default class BuckToolbarSettings extends React.Component {
  props: PropTypes;
  state: {
    arguments: string;
  };

  constructor(props: PropTypes) {
    super(props);
    const {arguments: args} = props.settings;
    this.state = {
      arguments: args == null ? '' : quote(args),
    };
  }

  render(): React.Element<any> {
    return (
      <Modal onDismiss={this.props.onDismiss}>
        <div className="block">
          <div className="block">
            <h5>
              Buck Settings for build type: <b>{this.props.buildType}</b>
            </h5>
            <label>Current Buck root:</label>
            <p>
              <code>
                {this.props.currentBuckRoot || 'No Buck project found.'}
              </code>
            </p>
            <label>Arguments:</label>
            <AtomInput
              tabIndex="0"
              initialValue={this.state.arguments}
              placeholderText="Extra arguments to Buck (e.g. --num-threads 4)"
              onDidChange={this._onArgsChange.bind(this)}
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

  _onArgsChange(args: string) {
    this.setState({arguments: args});
  }

  _onSave() {
    try {
      const parsed = parse(this.state.arguments)
        .filter(x => typeof x === 'string');
      this.props.onSave({arguments: parsed});
    } catch (err) {
      atom.notifications.addError(
        'Could not parse arguments',
        {detail: err.stack},
      );
    }
  }

}
