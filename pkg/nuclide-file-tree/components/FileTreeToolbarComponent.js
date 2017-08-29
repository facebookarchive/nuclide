'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeToolbarComponent = undefined;

var _react = _interopRequireWildcard(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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

var _Button;

function _load_Button() {
  return _Button = require('nuclide-commons-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('nuclide-commons-ui/ButtonGroup');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class FileTreeToolbarComponent extends _react.Component {

  constructor(props) {
    super(props);

    this._toggleWorkingSetsSelector = () => {
      if (this._inProcessOfClosingSelection) {
        this._inProcessOfClosingSelection = false;
        return;
      }

      if (this.state.definitionsAreEmpty && !this.state.selectionIsActive) {
        return;
      }

      this.setState({ selectionIsActive: !this.state.selectionIsActive });
    };

    this._toggleWorkingSetEditMode = () => {
      if (this._store.isEditingWorkingSet()) {
        this._finishEditingWorkingSet();
      } else {
        this._startEditingWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet());
      }
    };

    this._saveWorkingSet = name => {
      const workingSetsStore = this._store.getWorkingSetsStore();

      if (!workingSetsStore) {
        throw new Error('Invariant violation: "workingSetsStore"');
      }

      const editedWorkingSet = this._store.getEditedWorkingSet();
      this._finishEditingWorkingSet();
      workingSetsStore.saveWorkingSet(name, editedWorkingSet);
      workingSetsStore.activate(name);
    };

    this._updateWorkingSet = (prevName, name) => {
      const workingSetsStore = this._store.getWorkingSetsStore();

      if (!workingSetsStore) {
        throw new Error('Invariant violation: "workingSetsStore"');
      }

      const editedWorkingSet = this._store.getEditedWorkingSet();
      this._finishEditingWorkingSet();

      workingSetsStore.update(prevName, name, editedWorkingSet);
    };

    this._checkIfClosingSelector = () => {
      if (this.state.selectionIsActive) {
        this._inProcessOfClosingSelection = true;
      }
    };

    this._editWorkingSet = (name, uris) => {
      this._prevName = name;
      this.setState({
        isUpdatingExistingWorkingSet: true,
        updatedWorkingSetName: name,
        selectionIsActive: false
      });
      this._startEditingWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet(uris));
    };

    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this.state = {
      selectionIsActive: false,
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    };

    this._inProcessOfClosingSelection = false;
    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(props.workingSetsStore.subscribeToDefinitions(definitions => {
      const empty = definitions.applicable.length + definitions.notApplicable.length === 0;
      this.setState({ definitionsAreEmpty: empty });
    }));
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add('atom-workspace',
    // This command is exposed in the nuclide-working-sets menu config.
    // eslint-disable-next-line nuclide-internal/atom-apis
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
    const workingSetsStore = this._store.getWorkingSetsStore();
    let shouldShowButtonLabel;
    if (workingSetsStore != null) {
      shouldShowButtonLabel = workingSetsStore.getDefinitions().length === 0;
    }
    const workingSet = this._store.getWorkingSet();
    const editedWorkingSetIsEmpty = this._store.isEditedWorkingSetEmpty();
    const isEditingWorkingSet = this._store.isEditingWorkingSet();

    let selectWorkingSetButton;
    if (!this.state.definitionsAreEmpty && !isEditingWorkingSet) {
      selectWorkingSetButton = _react.createElement(SelectWorkingSetButton, {
        onClick: this._toggleWorkingSetsSelector,
        onFocus: this._checkIfClosingSelector,
        isWorkingSetEmpty: workingSet.isEmpty()
      });
    }

    let workingSetNameAndSave;
    if (isEditingWorkingSet && !editedWorkingSetIsEmpty) {
      workingSetNameAndSave = _react.createElement((_WorkingSetNameAndSaveComponent || _load_WorkingSetNameAndSaveComponent()).WorkingSetNameAndSaveComponent, {
        isEditing: this.state.isUpdatingExistingWorkingSet,
        initialName: this.state.updatedWorkingSetName,
        onUpdate: this._updateWorkingSet,
        onSave: this._saveWorkingSet,
        onCancel: this._toggleWorkingSetEditMode
      });
    }

    return _react.createElement(
      'div',
      {
        className: (0, (_classnames || _load_classnames()).default)({
          'nuclide-file-tree-toolbar': true,
          'nuclide-file-tree-toolbar-fader': workingSet.isEmpty() && !this.state.selectionIsActive && !this._store.isEditingWorkingSet()
        }) },
      _react.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'pull-right', size: (_ButtonGroup || _load_ButtonGroup()).ButtonGroupSizes.SMALL },
        selectWorkingSetButton,
        _react.createElement(DefineWorkingSetButton, {
          isActive: isEditingWorkingSet,
          isWorkingSetEmpty: workingSet.isEmpty(),
          shouldShowLabel: shouldShowButtonLabel,
          onClick: this._toggleWorkingSetEditMode
        })
      ),
      _react.createElement('div', { className: 'clearfix' }),
      workingSetNameAndSave
    );
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

      _reactDom.default.unmountComponentAtNode(reactDiv);
      panel.destroy();
      this.setState({ selectionIsActive: false });
    };

    _reactDom.default.render(_react.createElement((_WorkingSetSelectionComponent || _load_WorkingSetSelectionComponent()).WorkingSetSelectionComponent, {
      workingSetsStore: this.props.workingSetsStore,
      onClose: onClose,
      onEditWorkingSet: this._editWorkingSet
    }), reactDiv);

    return onClose;
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
}

exports.FileTreeToolbarComponent = FileTreeToolbarComponent; /**
                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                              * All rights reserved.
                                                              *
                                                              * This source code is licensed under the license found in the LICENSE file in
                                                              * the root directory of this source tree.
                                                              *
                                                              * 
                                                              * @format
                                                              */

class SelectWorkingSetButton extends _react.Component {
  render() {
    const { isWorkingSetEmpty, onClick, onFocus } = this.props;
    return _react.createElement(
      (_Button || _load_Button()).Button,
      {
        icon: 'pencil',
        onClick: onClick,
        onFocus: onFocus,
        selected: !isWorkingSetEmpty,
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        tooltip: {
          title: 'Select Working Sets',
          delay: 300,
          placement: 'top',
          keyBindingCommand: 'working-sets:select-active'
        } },
      'Working Sets...'
    );
  }
}

class DefineWorkingSetButton extends _react.Component {
  render() {
    const { isActive, isWorkingSetEmpty, shouldShowLabel, onClick } = this.props;
    return _react.createElement(
      (_Button || _load_Button()).Button,
      {
        icon: isActive ? undefined : 'plus',
        size: (_Button || _load_Button()).ButtonSizes.SMALL,
        tooltip: {
          title: isActive ? 'Cancel' : 'Define a Working Set',
          delay: 300,
          placement: 'top'
        },
        onClick: onClick },
      isActive ? 'Cancel selection' : isWorkingSetEmpty && shouldShowLabel ? 'Working Set...' : null
    );
  }
}