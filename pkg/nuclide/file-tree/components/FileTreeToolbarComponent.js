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
import {CompositeDisposable} from 'atom';
import classnames from 'classnames';
import {addTooltip} from '../../atom-helpers';
import {WorkingSetSelectionComponent} from './WorkingSetSelectionComponent';
import FileTreeStore from '../lib/FileTreeStore';

import type {WorkingSetsStore} from '../../working-sets';

type Props = {
  workingSetsStore: WorkingSetsStore;
};

type State = {
  selectionIsActive: boolean;
  workingSetName: string;
  definitionsAreEmpty: boolean;
};

export class FileTreeToolbarComponent extends React.Component {
  _store: FileTreeStore;
  _disposables: CompositeDisposable;
  _inProcessOfClosingSelection: boolean;
  state: State;
  props: Props;

  constructor(props: Object) {
    super(props);

    this._store = FileTreeStore.getInstance();
    this.state = {
      selectionIsActive: false,
      workingSetName: '',
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
    };

    this._inProcessOfClosingSelection = false;

    this._disposables = new CompositeDisposable();
    this._disposables.add(props.workingSetsStore.subscribeToDefinitions(
      definitions => this.setState({definitionsAreEmpty: definitions.length === 0})
    ));

    (this: any)._toggleWorkingSetsSelector = this._toggleWorkingSetsSelector.bind(this);
    (this: any)._closeWorkingSetsSelector = this._closeWorkingSetsSelector.bind(this);
    (this: any)._checkIfClosingSelector = this._checkIfClosingSelector.bind(this);
  }

  componentDidMount(): void {
    this._disposables.add(atom.commands.add(
      'atom-workspace',
      'working-sets:select-active',
      this._toggleWorkingSetsSelector,
    ));
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  render(): React.Element {
    const workingSet = this._store.getWorkingSet();

    let selectWorkingSetButton;
    if (!this.state.definitionsAreEmpty) {
      selectWorkingSetButton = (
        <SelectWorkingsetButton
          highlight={!workingSet.isEmpty()}
          onClick={this._toggleWorkingSetsSelector}
          onFocus={this._checkIfClosingSelector}
        />
      );
    }

    let workingSetSelectionPanel;
    if (this.state.selectionIsActive) {
      workingSetSelectionPanel = (
        <WorkingSetSelectionComponent
          workingSetsStore={this.props.workingSetsStore}
          onClose={this._closeWorkingSetsSelector}
        />
      );
    }

    return (
      <div
        className={classnames({
          'nuclide-file-tree-toolbar': true,
          'nuclide-file-tree-toolbar-fader':
            workingSet.isEmpty() && !this.state.selectionIsActive,
        })}>
        <div className="btn-group pull-right">
        {selectWorkingSetButton}
        </div>
        {workingSetSelectionPanel}
      </div>
    );
  }

  _trackWorkingSetName(text: string): void {
    this.setState({workingSetName: text});
  }

  _toggleWorkingSetsSelector(): void {
    if (this._inProcessOfClosingSelection) {
      this._inProcessOfClosingSelection = false;
      return;
    }

    this.setState({selectionIsActive: !this.state.selectionIsActive});
  }

  _closeWorkingSetsSelector(): void {
    this.setState({selectionIsActive: false});
  }

  _checkIfClosingSelector(): void {
    if (this.state.selectionIsActive) {
      this._inProcessOfClosingSelection = true;
    }
  }
}

class SelectWorkingsetButton extends React.Component {
  props: {
    highlight: boolean;
    onClick: () => void;
    onFocus: () => void;
  };

  render(): React.Element {
    return (
      <button
        className={classnames({
          btn: true,
          selected: this.props.highlight,
        })}
        ref={addTooltip({
          title: 'Select Working Sets',
          delay: 500,
          placement: 'bottom',
          keyBindingCommand: 'working-sets:select-active',
        })}
        onClick={this.props.onClick}
        onFocus={this.props.onFocus}>
        <span className="icon icon-list-unordered" />
      </button>
    );
  }
}
