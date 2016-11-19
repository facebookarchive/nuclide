'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React, ReactDOM} from 'react-for-atom';
import {CompositeDisposable} from 'atom';
import classnames from 'classnames';
import invariant from 'assert';
import addTooltip from '../../nuclide-ui/add-tooltip';
import {WorkingSetSelectionComponent} from './WorkingSetSelectionComponent';
import {WorkingSetNameAndSaveComponent} from './WorkingSetNameAndSaveComponent';
import {FileTreeStore} from '../lib/FileTreeStore';
import FileTreeActions from '../lib/FileTreeActions';
import {WorkingSet} from '../../nuclide-working-sets-common';

import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/types';

type Props = {
  workingSetsStore: WorkingSetsStore,
};

type State = {
  selectionIsActive: boolean,
  definitionsAreEmpty: boolean,
  isUpdatingExistingWorkingSet: boolean,
  updatedWorkingSetName: string,
};

export class FileTreeToolbarComponent extends React.Component {
  _store: FileTreeStore;
  _disposables: CompositeDisposable;
  _inProcessOfClosingSelection: boolean;
  _prevName: string;
  _actions: FileTreeActions;
  _closeWorkingSetsSelector: ?() => void;
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
      definitions => {
        const empty = definitions.applicable.length + definitions.notApplicable.length === 0;
        this.setState({definitionsAreEmpty: empty});
      },
    ));

    (this: any)._toggleWorkingSetsSelector = this._toggleWorkingSetsSelector.bind(this);
    (this: any)._checkIfClosingSelector = this._checkIfClosingSelector.bind(this);
    (this: any)._editWorkingSet = this._editWorkingSet.bind(this);
    (this: any)._saveWorkingSet = this._saveWorkingSet.bind(this);
    (this: any)._updateWorkingSet = this._updateWorkingSet.bind(this);
    (this: any)._toggleWorkingSetEditMode = this._toggleWorkingSetEditMode.bind(this);
  }

  componentDidMount(): void {
    this._disposables.add(atom.commands.add(
      'atom-workspace',
      // This command is exposed in the nuclide-working-sets menu config.
      // eslint-disable-next-line nuclide-internal/atom-commands
      'working-sets:select-active',
      this._toggleWorkingSetsSelector,
    ));
  }

  componentWillUnmount(): void {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!prevState.selectionIsActive && this.state.selectionIsActive) {
      this._closeWorkingSetsSelector = this._renderWorkingSetSelectionPanel();
    } else if (prevState.selectionIsActive && !this.state.selectionIsActive) {
      invariant(this._closeWorkingSetsSelector);
      this._closeWorkingSetsSelector();
    }
  }

  render(): React.Element<any> {
    const workingSet = this._store.getWorkingSet();
    const editedWorkingSetIsEmpty = this._store.isEditedWorkingSetEmpty();
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
    if (isEditingWorkingSet && !editedWorkingSetIsEmpty) {
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
      </div>
    );
  }

  _toggleWorkingSetsSelector(): void {
    if (this._inProcessOfClosingSelection) {
      this._inProcessOfClosingSelection = false;
      return;
    }

    if (this.state.definitionsAreEmpty && !this.state.selectionIsActive) {
      return;
    }

    this.setState({selectionIsActive: !this.state.selectionIsActive});
  }

  _renderWorkingSetSelectionPanel(): () => void {
    const reactDiv = document.createElement('div');
    const panel = atom.workspace.addModalPanel({item: reactDiv});

    let closed = false;
    const onClose = () => {
      if (closed) {
        return;
      }
      closed = true;

      ReactDOM.unmountComponentAtNode(reactDiv);
      panel.destroy();
      this.setState({selectionIsActive: false});
    };

    ReactDOM.render((
      <WorkingSetSelectionComponent
        workingSetsStore={this.props.workingSetsStore}
        onClose={onClose}
        onEditWorkingSet={this._editWorkingSet}
      />
    ), reactDiv);

    return onClose;
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
    highlight: boolean,
    onClick: () => void,
    onFocus: () => void,
  };

  render(): React.Element<any> {
    const {
      highlight,
      onClick,
      onFocus,
    } = this.props;
    return (
      <button
        className={classnames('btn', {selected: highlight})}
        ref={addTooltip({
          title: 'Select Working Sets',
          delay: 500,
          placement: 'bottom',
          keyBindingCommand: 'working-sets:select-active',
        })}
        onClick={onClick}
        onFocus={onFocus}>
        <span className="icon icon-list-unordered nuclide-file-tree-toolbar-icon" />
      </button>
    );
  }
}

class DefineWorkingSetButton extends React.Component {
  props: {
    isActive: boolean,
    onClick: () => void,
  };

  render(): React.Element<any> {
    const {
      isActive,
      onClick,
    } = this.props;
    return (
      <button
        className={classnames('btn', {selected: isActive})}
        ref={addTooltip({
          title: isActive ? 'Cancel' : 'Define a Working Set',
          delay: 500,
          placement: 'bottom',
        })}
        onClick={onClick}>
        <span
          className={classnames({
            'icon': true,
            'icon-plus': !isActive,
            'icon-dash': isActive,
            'nuclide-file-tree-toolbar-icon': true,
          })}
        />
      </button>
    );
  }
}
