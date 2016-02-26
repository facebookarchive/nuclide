'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

import {React} from 'react-for-atom';
import AtomInput from '../../ui/atom-input';
import classnames from 'classnames';

type Props = {
  isEditing: boolean;
  initialName: string;
  onUpdate: (prevName: string, name: string) => void;
  onSave: (name: string) => void;
  onCancel: () => void;
}

type State = {
  name: string;
}

export class WorkingSetNameAndSaveComponent extends React.Component {
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);

    this.state = {
      name: props.initialName,
    };

    (this: any)._trackName = this._trackName.bind(this);
    (this: any)._saveWorkingSet = this._saveWorkingSet.bind(this);
  }

  componentDidMount(): void {
  }

  componentWillUnmount(): void {
  }

  render() {
    return (
      <div>
        <AtomInput
          placeholderText="name"
          size="sm"
          className="nuclide-file-tree-working-set-name inline-block-tight"
          onDidChange={this._trackName}
          initialValue={this.props.initialName}
          onConfirm={this._saveWorkingSet}
          onCancel={this.props.onCancel}
        />
        <button
          className={classnames({
            'btn': true,
            'btn-success': true,
            'inline-block-tight': true,
            'disabled': this.state.name === '',
          })}
          onClick={this._saveWorkingSet}>
          <span className="icon icon-check" />
        </button>
      </div>
    );
  }

  _trackName(text: string): void {
    this.setState({name: text});
  }

  _saveWorkingSet(): void {
    if (this.state.name === '') {
      return;
    }

    if (this.props.isEditing) {
      this.props.onUpdate(this.props.initialName, this.state.name);
    } else {
      this.props.onSave(this.state.name);
    }
  }
}
