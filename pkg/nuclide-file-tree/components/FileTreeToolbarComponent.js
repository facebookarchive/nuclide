"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileTreeToolbarComponent = void 0;

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _WorkingSetSelectionComponent() {
  const data = require("./WorkingSetSelectionComponent");

  _WorkingSetSelectionComponent = function () {
    return data;
  };

  return data;
}

function _WorkingSetNameAndSaveComponent() {
  const data = require("./WorkingSetNameAndSaveComponent");

  _WorkingSetNameAndSaveComponent = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _nuclideWorkingSetsCommon() {
  const data = require("../../nuclide-working-sets-common");

  _nuclideWorkingSetsCommon = function () {
    return data;
  };

  return data;
}

function _Button() {
  const data = require("../../../modules/nuclide-commons-ui/Button");

  _Button = function () {
    return data;
  };

  return data;
}

function _ButtonGroup() {
  const data = require("../../../modules/nuclide-commons-ui/ButtonGroup");

  _ButtonGroup = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
class FileTreeToolbarComponent extends React.Component {
  constructor(props) {
    super(props);

    this._toggleWorkingSetsSelector = () => {
      if (this._inProcessOfClosingSelection) {
        this._inProcessOfClosingSelection = false;
        return;
      }

      if (this.state.definitionsAreEmpty && !this.state.selectionIsActive) {
        return;
      } // TODO: (wbinnssmith) T30771435 this setState depends on current state
      // and should use an updater function rather than an object
      // eslint-disable-next-line react/no-access-state-in-setstate


      this.setState({
        selectionIsActive: !this.state.selectionIsActive
      });
    };

    this._toggleWorkingSetEditMode = () => {
      if (Selectors().isEditingWorkingSet(this.props.store)) {
        this._finishEditingWorkingSet();
      } else {
        this._startEditingWorkingSet(new (_nuclideWorkingSetsCommon().WorkingSet)());
      }
    };

    this._saveWorkingSet = name => {
      const workingSetsStore = Selectors().getWorkingSetsStore(this.props.store);

      if (!workingSetsStore) {
        throw new Error("Invariant violation: \"workingSetsStore\"");
      }

      const editedWorkingSet = Selectors().getEditedWorkingSet(this.props.store);

      this._finishEditingWorkingSet();

      workingSetsStore.saveWorkingSet(name, editedWorkingSet);
      workingSetsStore.activate(name);
    };

    this._updateWorkingSet = (prevName, name) => {
      const workingSetsStore = Selectors().getWorkingSetsStore(this.props.store);

      if (!workingSetsStore) {
        throw new Error("Invariant violation: \"workingSetsStore\"");
      }

      const editedWorkingSet = Selectors().getEditedWorkingSet(this.props.store);

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

      this._startEditingWorkingSet(new (_nuclideWorkingSetsCommon().WorkingSet)(uris));
    };

    this.state = {
      selectionIsActive: false,
      definitionsAreEmpty: props.workingSetsStore.getDefinitions().length === 0,
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    };
    this._inProcessOfClosingSelection = false;
    this._disposables = new (_UniversalDisposable().default)(props.workingSetsStore.subscribeToDefinitions(definitions => {
      const empty = definitions.applicable.length + definitions.notApplicable.length === 0;
      this.setState({
        definitionsAreEmpty: empty
      });
    }));
  }

  componentDidMount() {
    this._disposables.add(atom.commands.add('atom-workspace', // This command is exposed in the nuclide-working-sets menu config.
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
        throw new Error("Invariant violation: \"this._closeWorkingSetsSelector\"");
      }

      this._closeWorkingSetsSelector();
    }
  }

  render() {
    const workingSetsStore = Selectors().getWorkingSetsStore(this.props.store);
    let shouldShowButtonLabel;

    if (workingSetsStore != null) {
      shouldShowButtonLabel = workingSetsStore.getDefinitions().length === 0;
    }

    const workingSet = Selectors().getWorkingSet(this.props.store);
    const editedWorkingSetIsEmpty = Selectors().isEditedWorkingSetEmpty(this.props.store);
    const isEditingWorkingSet = Selectors().isEditingWorkingSet(this.props.store);
    let selectWorkingSetButton;

    if (!this.state.definitionsAreEmpty && !isEditingWorkingSet) {
      selectWorkingSetButton = React.createElement(SelectWorkingSetButton, {
        onClick: this._toggleWorkingSetsSelector,
        onFocus: this._checkIfClosingSelector,
        isWorkingSetEmpty: workingSet.isEmpty()
      });
    }

    let workingSetNameAndSave;

    if (isEditingWorkingSet && !editedWorkingSetIsEmpty) {
      workingSetNameAndSave = React.createElement(_WorkingSetNameAndSaveComponent().WorkingSetNameAndSaveComponent, {
        isEditing: this.state.isUpdatingExistingWorkingSet,
        initialName: this.state.updatedWorkingSetName,
        onUpdate: this._updateWorkingSet,
        onSave: this._saveWorkingSet,
        onCancel: this._toggleWorkingSetEditMode
      });
    }

    return React.createElement("div", {
      className: (0, _classnames().default)({
        'nuclide-file-tree-toolbar': true,
        'nuclide-file-tree-toolbar-fader': workingSet.isEmpty() && !this.state.selectionIsActive && !Selectors().isEditingWorkingSet(this.props.store)
      })
    }, React.createElement(_ButtonGroup().ButtonGroup, {
      className: "pull-right",
      size: _ButtonGroup().ButtonGroupSizes.SMALL
    }, selectWorkingSetButton, React.createElement(DefineWorkingSetButton, {
      isActive: isEditingWorkingSet,
      isWorkingSetEmpty: workingSet.isEmpty(),
      shouldShowLabel: shouldShowButtonLabel,
      onClick: this._toggleWorkingSetEditMode
    })), React.createElement("div", {
      className: "clearfix"
    }), workingSetNameAndSave);
  }

  _renderWorkingSetSelectionPanel() {
    const reactDiv = document.createElement('div');
    const panel = atom.workspace.addModalPanel({
      item: reactDiv
    });
    let closed = false;

    const onClose = () => {
      if (closed) {
        return;
      }

      closed = true;

      _reactDom.default.unmountComponentAtNode(reactDiv);

      panel.destroy();
      this.setState({
        selectionIsActive: false
      });
    };

    _reactDom.default.render(React.createElement(_WorkingSetSelectionComponent().WorkingSetSelectionComponent, {
      workingSetsStore: this.props.workingSetsStore,
      onClose: onClose,
      onEditWorkingSet: this._editWorkingSet
    }), reactDiv);

    return onClose;
  }

  _startEditingWorkingSet(workingSet) {
    this.props.actions.startEditingWorkingSet(workingSet);
  }

  _finishEditingWorkingSet() {
    this.setState({
      isUpdatingExistingWorkingSet: false,
      updatedWorkingSetName: ''
    });
    this.props.actions.finishEditingWorkingSet();
  }

}

exports.FileTreeToolbarComponent = FileTreeToolbarComponent;

class SelectWorkingSetButton extends React.Component {
  render() {
    const {
      isWorkingSetEmpty,
      onClick,
      onFocus
    } = this.props;
    return React.createElement(_Button().Button, {
      icon: "pencil",
      onClick: onClick,
      onFocus: onFocus,
      selected: !isWorkingSetEmpty,
      size: _Button().ButtonSizes.SMALL,
      tooltip: {
        title: 'Select Working Sets',
        delay: 300,
        placement: 'top',
        keyBindingCommand: 'working-sets:select-active'
      }
    }, "Working Sets...");
  }

}

class DefineWorkingSetButton extends React.Component {
  render() {
    const {
      isActive,
      isWorkingSetEmpty,
      shouldShowLabel,
      onClick
    } = this.props;
    return React.createElement(_Button().Button, {
      icon: isActive ? undefined : 'plus',
      size: _Button().ButtonSizes.SMALL,
      tooltip: {
        title: isActive ? 'Cancel' : 'Define a Working Set',
        delay: 300,
        placement: 'top'
      },
      onClick: onClick
    }, isActive ? 'Cancel selection' : isWorkingSetEmpty && shouldShowLabel ? 'Working Set...' : null);
  }

}