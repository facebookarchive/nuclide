'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeToolbarComponent = undefined;

var _reactForAtom = require('react-for-atom');

var _atom = require('atom');

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _addTooltip;

function _load_addTooltip() {
  return _addTooltip = _interopRequireDefault(require('../../nuclide-ui/add-tooltip'));
}

var _WorkingSetSelectionComponent;

function _load_WorkingSetSelectionComponent() {
  return _WorkingSetSelectionComponent = require('./WorkingSetSelectionComponent');
}

var _WorkingSetNameAndSaveComponent;

function _load_WorkingSetNameAndSaveComponent() {
  return _WorkingSetNameAndSaveComponent = require('./WorkingSetNameAndSaveComponent');
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FileTreeToolbarComponent = exports.FileTreeToolbarComponent = class FileTreeToolbarComponent extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);

    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this.state = {
      selectionIsActive: false,
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    };

    this._inProcessOfClosingSelection = false;
    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();

    this._disposables = new _atom.CompositeDisposable();
    this._disposables.add(props.workingSetsStore.subscribeToDefinitions(definitions => {
      const empty = definitions.applicable.length + definitions.notApplicable.length === 0;
      this.setState({ definitionsAreEmpty: empty });
    }));

    this._toggleWorkingSetsSelector = this._toggleWorkingSetsSelector.bind(this);
    this._checkIfClosingSelector = this._checkIfClosingSelector.bind(this);
    this._editWorkingSet = this._editWorkingSet.bind(this);
    this._saveWorkingSet = this._saveWorkingSet.bind(this);
    this._updateWorkingSet = this._updateWorkingSet.bind(this);
    this._toggleWorkingSetEditMode = this._toggleWorkingSetEditMode.bind(this);
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add('atom-workspace',
    // This command is exposed in the nuclide-working-sets menu config.
    // eslint-disable-next-line nuclide-internal/atom-commands
    'working-sets:select-active', this._toggleWorkingSetsSelector));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.selectionIsActive && this.state.selectionIsActive) {
      this._closeWorkingSetsSelector = this._renderWorkingSetSelectionPanel();
    } else if (prevState.selectionIsActive && !this.state.selectionIsActive) {
      if (!this._closeWorkingSetsSelector) {
        throw new Error('Invariant violation: "this._closeWorkingSetsSelector"');
      }

      this._closeWorkingSetsSelector();
    }
  }

  render() {
    const workingSet = this._store.getWorkingSet();
    const editedWorkingSetIsEmpty = this._store.isEditedWorkingSetEmpty();
    const isEditingWorkingSet = this._store.isEditingWorkingSet();

    let selectWorkingSetButton;
    if (!this.state.definitionsAreEmpty && !isEditingWorkingSet) {
      selectWorkingSetButton = _reactForAtom.React.createElement(SelectWorkingSetButton, {
        highlight: !workingSet.isEmpty(),
        onClick: this._toggleWorkingSetsSelector,
        onFocus: this._checkIfClosingSelector
      });
    }

    let workingSetNameAndSave;
    if (isEditingWorkingSet && !editedWorkingSetIsEmpty) {
      workingSetNameAndSave = _reactForAtom.React.createElement((_WorkingSetNameAndSaveComponent || _load_WorkingSetNameAndSaveComponent()).WorkingSetNameAndSaveComponent, {
        isEditing: this.state.isUpdatingExistingWorkingSet,
        initialName: this.state.updatedWorkingSetName,
        onUpdate: this._updateWorkingSet,
        onSave: this._saveWorkingSet,
        onCancel: this._toggleWorkingSetEditMode
      });
    }

    return _reactForAtom.React.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)({
          'nuclide-file-tree-toolbar': true,
          'nuclide-file-tree-toolbar-fader': workingSet.isEmpty() && !this.state.selectionIsActive && !this._store.isEditingWorkingSet()
        }) },
      _reactForAtom.React.createElement(
        'div',
        { className: 'btn-group pull-right' },
        selectWorkingSetButton,
        _reactForAtom.React.createElement(DefineWorkingSetButton, {
          isActive: isEditingWorkingSet,
          onClick: this._toggleWorkingSetEditMode
        })
      ),
      _reactForAtom.React.createElement('div', { className: 'clearfix' }),
      workingSetNameAndSave
    );
  }

  _toggleWorkingSetsSelector() {
    if (this._inProcessOfClosingSelection) {
      this._inProcessOfClosingSelection = false;
      return;
    }

    this.setState({ selectionIsActive: !this.state.selectionIsActive });
  }

  _renderWorkingSetSelectionPanel() {
    const reactDiv = document.createElement('div');
    const panel = atom.workspace.addModalPanel({ item: reactDiv });

    let closed = false;
    const onClose = () => {
      if (closed) {
        return;
      }
      closed = true;

      _reactForAtom.ReactDOM.unmountComponentAtNode(reactDiv);
      panel.destroy();
      this.setState({ selectionIsActive: false });
    };

    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_WorkingSetSelectionComponent || _load_WorkingSetSelectionComponent()).WorkingSetSelectionComponent, {
      workingSetsStore: this.props.workingSetsStore,
      onClose: onClose,
      onEditWorkingSet: this._editWorkingSet
    }), reactDiv);

    return onClose;
  }

  _toggleWorkingSetEditMode() {
    if (this._store.isEditingWorkingSet()) {
      this._finishEditingWorkingSet();
    } else {
      this._startEditingWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
    }
  }

  _saveWorkingSet(name) {
    const workingSetsStore = this._store.getWorkingSetsStore();

    if (!workingSetsStore) {
      throw new Error('Invariant violation: "workingSetsStore"');
    }

    const editedWorkingSet = this._store.getEditedWorkingSet();
    this._finishEditingWorkingSet();
    workingSetsStore.saveWorkingSet(name, editedWorkingSet);
    workingSetsStore.activate(name);
  }

  _updateWorkingSet(prevName, name) {
    const workingSetsStore = this._store.getWorkingSetsStore();

    if (!workingSetsStore) {
      throw new Error('Invariant violation: "workingSetsStore"');
    }

    const editedWorkingSet = this._store.getEditedWorkingSet();
    this._finishEditingWorkingSet();

    workingSetsStore.update(prevName, name, editedWorkingSet);
  }

  _checkIfClosingSelector() {
    if (this.state.selectionIsActive) {
      this._inProcessOfClosingSelection = true;
    }
  }

  _editWorkingSet(name, uris) {
    this._prevName = name;
    this.setState({
      isUpdatingExistingWorkingSet: true,
      updatedWorkingSetName: name,
      selectionIsActive: false
    });
    this._startEditingWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(uris));
  }

  _startEditingWorkingSet(workingSet) {
    this._actions.startEditingWorkingSet(workingSet);
  }

  _finishEditingWorkingSet() {
    this.setState({
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    });
    this._actions.finishEditingWorkingSet();
  }
};
let SelectWorkingSetButton = class SelectWorkingSetButton extends _reactForAtom.React.Component {

  render() {
    var _props = this.props;
    const highlight = _props.highlight,
          onClick = _props.onClick,
          onFocus = _props.onFocus;

    return _reactForAtom.React.createElement(
      'button',
      {
        className: (0, (_classnames || _load_classnames()).default)('btn', { selected: highlight }),
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          title: 'Select Working Sets',
          delay: 500,
          placement: 'bottom',
          keyBindingCommand: 'working-sets:select-active'
        }),
        onClick: onClick,
        onFocus: onFocus },
      _reactForAtom.React.createElement('span', { className: 'icon icon-list-unordered nuclide-file-tree-toolbar-icon' })
    );
  }
};
let DefineWorkingSetButton = class DefineWorkingSetButton extends _reactForAtom.React.Component {

  render() {
    var _props2 = this.props;
    const isActive = _props2.isActive,
          onClick = _props2.onClick;

    return _reactForAtom.React.createElement(
      'button',
      {
        className: (0, (_classnames || _load_classnames()).default)('btn', { selected: isActive }),
        ref: (0, (_addTooltip || _load_addTooltip()).default)({
          title: isActive ? 'Cancel' : 'Define a Working Set',
          delay: 500,
          placement: 'bottom'
        }),
        onClick: onClick },
      _reactForAtom.React.createElement('span', {
        className: (0, (_classnames || _load_classnames()).default)({
          'icon': true,
          'icon-plus': !isActive,
          'icon-dash': isActive,
          'nuclide-file-tree-toolbar-icon': true
        })
      })
    );
  }
};