"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetSelectionComponent = void 0;

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
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

function _HR() {
  const data = require("../../../modules/nuclide-commons-ui/HR");

  _HR = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class WorkingSetSelectionComponent extends React.Component {
  constructor(props) {
    super(props);

    this._setSelectionIndex = selectionIndex => {
      this.setState({
        selectionIndex
      });
    };

    this._checkFocus = event => {
      const node = _reactDom.default.findDOMNode(this); // If the next active element (`event.relatedTarget`) is not a descendant of this modal, close
      // the modal.  In the case of a canceled _deleteWorkingSet, relatedTarget is null
      // and we don't want to close the modal
      // $FlowFixMe


      if (event.relatedTarget != null && !node.contains(event.relatedTarget)) {
        this.props.onClose();
      }
    };

    this._toggleWorkingSet = (name, active) => {
      if (active) {
        this.props.workingSetsStore.deactivate(name);
      } else {
        this.props.workingSetsStore.activate(name);
      }
    };

    this._deleteWorkingSet = name => {
      const result = atom.confirm({
        message: `Please confirm: delete working set '${name}'?`,
        buttons: ['Delete', 'Cancel']
      });

      if (result === 0) {
        this.props.workingSetsStore.deleteWorkingSet(name);
      }
    };

    const workingSetsStore = props.workingSetsStore;
    this.state = {
      selectionIndex: 0,
      applicableDefinitions: sortApplicableDefinitions(workingSetsStore.getApplicableDefinitions()),
      notApplicableDefinitions: workingSetsStore.getNotApplicableDefinitions()
    };
    this._disposables = new (_UniversalDisposable().default)(workingSetsStore.subscribeToDefinitions(definitions => {
      this.setState({
        applicableDefinitions: sortApplicableDefinitions(definitions.applicable),
        notApplicableDefinitions: definitions.notApplicable
      });

      if (definitions.applicable.length + definitions.notApplicable.length === 0) {
        this.props.onClose();
      }
    }));
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this); // $FlowFixMe


    node.focus();

    this._disposables.add(atom.commands.add( // $FlowFixMe
    node, {
      'core:move-up': () => this._moveSelectionIndex(-1),
      'core:move-down': () => this._moveSelectionIndex(1),
      'core:confirm': () => {
        const def = this.state.applicableDefinitions[this.state.selectionIndex];

        this._toggleWorkingSet(def.name, def.active);
      },
      'core:cancel': this.props.onClose
    }));
  }

  componentWillUnmount() {
    this._disposables.dispose();
  }

  UNSAFE_componentWillUpdate(nextProps, nextState) {
    const applicableLength = nextState.applicableDefinitions.length;

    if (applicableLength > 0) {
      if (nextState.selectionIndex >= applicableLength) {
        this.setState({
          selectionIndex: applicableLength - 1
        });
      } else if (nextState.selectionIndex < 0) {
        this.setState({
          selectionIndex: 0
        });
      }
    }
  }

  componentDidUpdate() {
    const node = _reactDom.default.findDOMNode(this); // $FlowFixMe


    node.focus();
  }

  render() {
    // It's only possible to have one active project (currently, at least), so this will only ever
    // be an empty or single-item array.
    const activeProjectDefinitionRows = this.state.applicableDefinitions.filter(def => def.isActiveProject).map((def, index) => this._renderDefinitionRow(def, index));
    const applicableDefinitionRows = this.state.applicableDefinitions.filter(def => !def.isActiveProject).map((def, index) => this._renderDefinitionRow(def, activeProjectDefinitionRows.length + index));
    const activeProjectSection = applicableDefinitionRows.length === 0 ? null : React.createElement("ol", {
      className: "list-group mark-active"
    }, activeProjectDefinitionRows);
    const applicableDefinitionsSection = React.createElement("ol", {
      className: "list-group mark-active",
      style: {
        maxHeight: '80vh'
      }
    }, applicableDefinitionRows);
    let notApplicableSection;

    if (this.state.notApplicableDefinitions.length > 0) {
      const notApplicableDefinitions = this.state.notApplicableDefinitions.map(def => {
        return React.createElement(NonApplicableDefinitionLine, {
          key: def.name,
          def: def,
          onDeleteWorkingSet: this._deleteWorkingSet
        });
      });
      notApplicableSection = React.createElement("div", null, React.createElement(_HR().HR, null), React.createElement("span", null, "The working sets below are not applicable to your current project folders"), React.createElement("ol", {
        className: "list-group"
      }, notApplicableDefinitions));
    }

    return React.createElement("div", {
      className: "select-list",
      tabIndex: "0",
      onBlur: this._checkFocus
    }, activeProjectSection, applicableDefinitionsSection, notApplicableSection);
  }

  _renderDefinitionRow(def, index) {
    return React.createElement(ApplicableDefinitionLine, {
      key: def.name,
      def: def,
      index: index,
      selected: index === this.state.selectionIndex,
      toggleWorkingSet: this._toggleWorkingSet,
      onSelect: this._setSelectionIndex,
      onDeleteWorkingSet: this._deleteWorkingSet,
      onEditWorkingSet: this.props.onEditWorkingSet
    });
  }

  _moveSelectionIndex(step) {
    // TODO: (wbinnssmith) T30771435 this setState depends on current state
    // and should use an updater function rather than an object
    // eslint-disable-next-line react/no-access-state-in-setstate
    this.setState({
      selectionIndex: this.state.selectionIndex + step
    });
  }

}

exports.WorkingSetSelectionComponent = WorkingSetSelectionComponent;

class ApplicableDefinitionLine extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._lineOnClick = event => {
      this.props.toggleWorkingSet(this.props.def.name, this.props.def.active);
    }, this._deleteButtonOnClick = event => {
      this.props.onDeleteWorkingSet(this.props.def.name);
      event.stopPropagation();
    }, this._editButtonOnClick = event => {
      this.props.onEditWorkingSet(this.props.def.name, this.props.def.uris);
      event.stopPropagation();
    }, _temp;
  }

  render() {
    const classes = {
      active: this.props.def.active,
      selected: this.props.selected,
      clearfix: true
    };
    const label = this.props.def.isActiveProject ? `Active Project: ${this.props.def.name}` : this.props.def.name;
    return React.createElement("li", {
      className: (0, _classnames().default)(classes),
      onMouseOver: () => this.props.onSelect(this.props.index),
      onClick: this._lineOnClick
    }, this._renderButtons(), React.createElement("span", null, label));
  }

  _renderButtons() {
    if (this.props.def.isActiveProject) {
      // The active project working set definition can't be edited or deleted.
      return null;
    }

    return React.createElement(_ButtonGroup().ButtonGroup, {
      className: "pull-right"
    }, React.createElement(_Button().Button, {
      icon: "trashcan",
      onClick: this._deleteButtonOnClick,
      tabIndex: "-1",
      title: "Delete this working set"
    }), React.createElement(_Button().Button, {
      icon: "pencil",
      onClick: this._editButtonOnClick,
      tabIndex: "-1",
      title: "Edit this working set"
    }));
  }

}

class NonApplicableDefinitionLine extends React.Component {
  constructor(props) {
    super(props);

    this._deleteButtonOnClick = event => {
      this.props.onDeleteWorkingSet(this.props.def.name);
      event.stopPropagation();
    };

    this._deleteButtonOnClick = this._deleteButtonOnClick.bind(this);
  }

  render() {
    return React.createElement("li", {
      className: "clearfix"
    }, React.createElement(_Button().Button, {
      className: "pull-right",
      icon: "trashcan",
      onClick: this._deleteButtonOnClick,
      tabIndex: "-1",
      title: "Delete this working set"
    }), React.createElement("span", {
      className: "text-subtle"
    }, this.props.def.name));
  }

} // Since the selection is based on index, we need to make sure these are ordered correctly (i.e.
// with the active project first).


function sortApplicableDefinitions(definitions) {
  return definitions.slice().sort((a, b) => {
    if (a.isActiveProject && !b.isActiveProject) {
      return -1;
    }

    if (!a.isActiveProject && b.isActiveProject) {
      return 1;
    }

    return a.name.localeCompare(b.name);
  });
}