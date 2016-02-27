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
import invariant from 'assert';
import {addTooltip} from '../../atom-helpers';
import {WorkingSetSelectionComponent} from './WorkingSetSelectionComponent';
import {WorkingSetNameAndSaveComponent} from './WorkingSetNameAndSaveComponent';
import FileTreeStore from '../lib/FileTreeStore';
import FileTreeActions from '../lib/FileTreeActions';
import {WorkingSet} from '../../working-sets';

import type {WorkingSetsStore} from '../../working-sets';

type Props = {
  workingSetsStore: WorkingSetsStore;
};

type State = {
  selectionIsActive: boolean;
  definitionsAreEmpty: boolean;
  isUpdatingExistingWorkingSet: boolean;
  updatedWorkingSetName: string;
};

export class FileTreeToolbarComponent extends React.Component {
  _store: FileTreeStore;
  _disposables: CompositeDisposable;
  _inProcessOfClosingSelection: boolean;
  _prevName: string;
  _store: FileTreeStore;
  _actions: FileTreeActions;
  state: State;
  props: Props;

  constructor(props: Object) {
    super(props);

    this._store = FileTreeStore.getInstance();
    this.state = {
      selectionIsActive: false,
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: '',
    };

    this._inProcessOfClosingSelection = false;
    this._actions = FileTreeActions.getInstance();

    this._disposables = new CompositeDisposable();
    this._disposables.add(props.workingSetsStore.subscribeToDefinitions(
      definitions => this.setState({definitionsAreEmpty: definitions.length === 0})
    ));

    (this: any)._toggleWorkingSetsSelector = this._toggleWorkingSetsSelector.bind(this);
    (this: any)._closeWorkingSetsSelector = this._closeWorkingSetsSelector.bind(this);
    (this: any)._checkIfClosingSelector = this._checkIfClosingSelector.bind(this);
    (this: any)._editWorkingSet = this._editWorkingSet.bind(this);
    (this: any)._saveWorkingSet = this._saveWorkingSet.bind(this);
    (this: any)._updateWorkingSet = this._updateWorkingSet.bind(this);
    (this: any)._toggleWorkingSetEditMode = this._toggleWorkingSetEditMode.bind(this);
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
    const editedWorkingSet = this._store.getEditedWorkingSet();
    const isEditingWorkingSet = this._store.isEditingWorkingSet();

    let selectWorkingSetButton;
    if (!this.state.definitionsAreEmpty && !isEditingWorkingSet) {
      selectWorkingSetButton = (
        <SelectWorkingSetButton
          highlight={!workingSet.isEmpty()}
          onClick={this._toggleWorkingSetsSelector}
          onFocus={this._checkIfClosingSelector}
        />
      );
    }

    let workingSetNameAndSave;
    if (!editedWorkingSet.isEmpty()) {
      workingSetNameAndSave = (
        <WorkingSetNameAndSaveComponent
          isEditing={this.state.isUpdatingExistingWorkingSet}
          initialName={this.state.updatedWorkingSetName}
          onUpdate={this._updateWorkingSet}
          onSave={this._saveWorkingSet}
          onCancel={this._toggleWorkingSetEditMode}
        />
      );
    }

    let workingSetSelectionPanel;
    if (this.state.selectionIsActive) {
      workingSetSelectionPanel = (
        <WorkingSetSelectionComponent
          workingSetsStore={this.props.workingSetsStore}
          onClose={this._closeWorkingSetsSelector}
          onEditWorkingSet={this._editWorkingSet}
        />
      );
    }
    return (
      <div
        className={classnames({
          'nuclide-file-tree-toolbar': true,
          'nuclide-file-tree-toolbar-fader':
            workingSet.isEmpty() &&
            !this.state.selectionIsActive &&
            !this._store.isEditingWorkingSet(),
        })}>
        <div className="btn-group pull-right">
          {selectWorkingSetButton}
          <DefineWorkingSetButton
            isActive={isEditingWorkingSet}
            onClick={this._toggleWorkingSetEditMode}
          />
        </div>
        <div className="clearfix" />
        {workingSetNameAndSave}
        {workingSetSelectionPanel}
      </div>
    );
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

  _toggleWorkingSetEditMode(): void {
    if (this._store.isEditingWorkingSet()) {
      this._finishEditingWorkingSet();
    } else {
      this._startEditingWorkingSet(new WorkingSet());
    }
  }

  _saveWorkingSet(name: string): void {
    const workingSetsStore = this._store.getWorkingSetsStore();
    invariant(workingSetsStore);
    const editedWorkingSet = this._store.getEditedWorkingSet();
    this._finishEditingWorkingSet();

    workingSetsStore.saveWorkingSet(name, editedWorkingSet);
    workingSetsStore.activate(name);
  }

  _updateWorkingSet(prevName: string, name: string): void {
    const workingSetsStore = this._store.getWorkingSetsStore();
    invariant(workingSetsStore);
    const editedWorkingSet = this._store.getEditedWorkingSet();
    this._finishEditingWorkingSet();

    workingSetsStore.update(prevName, name, editedWorkingSet);
  }

  _checkIfClosingSelector(): void {
    if (this.state.selectionIsActive) {
      this._inProcessOfClosingSelection = true;
    }
  }

  _editWorkingSet(name: string, uris: Array<string>): void {
    this._prevName = name;
    this.setState({
      isUpdatingExistingWorkingSet: true,
      updatedWorkingSetName: name,
      selectionIsActive: false,
    });
    this._startEditingWorkingSet(new WorkingSet(uris));
  }

  _startEditingWorkingSet(workingSet: WorkingSet): void {
    this._actions.startEditingWorkingSet(workingSet);
  }

  _finishEditingWorkingSet(): void {
    this.setState({
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: '',
    });
    this._actions.finishEditingWorkingSet();
  }
}

class SelectWorkingSetButton extends React.Component {
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
        <span className="icon icon-list-unordered nuclide-file-tree-toolbar-icon" />
      </button>
    );
  }
}

class DefineWorkingSetButton extends React.Component {
  props: {
    isActive: boolean;
    onClick: () => void;
  };

  render(): React.Element {
    return (
      <button
        className={classnames({
          btn: true,
          selected: this.props.isActive,
        })}
        ref={addTooltip({
          title: this.props.isActive ? 'Cancel' : 'Define a Working Set',
          delay: 500,
          placement: 'bottom',
        })}
        onClick={this.props.onClick}>
        <span className={classnames({
          icon: true,
          'icon-plus': !this.props.isActive,
          'icon-dash': this.props.isActive,
          'nuclide-file-tree-toolbar-icon': true,
        })}
        />
      </button>
    );
  }
}
