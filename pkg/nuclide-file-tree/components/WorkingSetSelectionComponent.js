'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WorkingSetSelectionComponent = undefined;

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _Button;

function _load_Button() {
  return _Button = require('../../nuclide-ui/Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('../../nuclide-ui/ButtonGroup');
}

var _HR;

function _load_HR() {
  return _HR = require('../../nuclide-ui/HR');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class WorkingSetSelectionComponent extends _react.default.Component {

  constructor(props) {
    super(props);

    const workingSetsStore = props.workingSetsStore;

    this.state = {
      selectionIndex: 0,
      applicableDefinitions: workingSetsStore.getApplicableDefinitions(),
      notApplicableDefinitions: workingSetsStore.getNotApplicableDefinitions()
    };

    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(workingSetsStore.subscribeToDefinitions(definitions => {
      this.setState({
        applicableDefinitions: definitions.applicable,
        notApplicableDefinitions: definitions.notApplicable
      });
      if (definitions.applicable.length + definitions.notApplicable.length === 0) {
        this.props.onClose();
      }
    }));

    this._checkFocus = this._checkFocus.bind(this);
    this._toggleWorkingSet = this._toggleWorkingSet.bind(this);
    this._setSelectionIndex = this._setSelectionIndex.bind(this);
    this._deleteWorkingSet = this._deleteWorkingSet.bind(this);
  }

  componentDidMount() {
    const node = _reactDom.default.findDOMNode(this);
    // $FlowFixMe
    node.focus();
    this._disposables.add(atom.commands.add(
    // $FlowFixMe
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

  componentWillUpdate(nextProps, nextState) {
    const applicableLength = nextState.applicableDefinitions.length;

    if (applicableLength > 0) {
      if (nextState.selectionIndex >= applicableLength) {
        this.setState({ selectionIndex: applicableLength - 1 });
      } else if (nextState.selectionIndex < 0) {
        this.setState({ selectionIndex: 0 });
      }
    }
  }

  componentDidUpdate() {
    const node = _reactDom.default.findDOMNode(this);
    // $FlowFixMe
    node.focus();
  }

  render() {
    const applicableDefinitions = this.state.applicableDefinitions.map((def, index) => {
      return _react.default.createElement(ApplicableDefinitionLine, {
        key: def.name,
        def: def,
        index: index,
        selected: index === this.state.selectionIndex,
        toggleWorkingSet: this._toggleWorkingSet,
        onSelect: this._setSelectionIndex,
        onDeleteWorkingSet: this._deleteWorkingSet,
        onEditWorkingSet: this.props.onEditWorkingSet
      });
    });

    let notApplicableSection;
    if (this.state.notApplicableDefinitions.length > 0) {
      const notApplicableDefinitions = this.state.notApplicableDefinitions.map(def => {
        return _react.default.createElement(NonApplicableDefinitionLine, {
          key: def.name,
          def: def,
          onDeleteWorkingSet: this._deleteWorkingSet
        });
      });

      notApplicableSection = _react.default.createElement(
        'div',
        null,
        _react.default.createElement((_HR || _load_HR()).HR, null),
        _react.default.createElement(
          'span',
          null,
          'The working sets below are not applicable to your current project folders'
        ),
        _react.default.createElement(
          'ol',
          { className: 'list-group' },
          notApplicableDefinitions
        )
      );
    }

    return _react.default.createElement(
      'div',
      {
        className: 'select-list',
        tabIndex: '0',
        onBlur: this._checkFocus },
      _react.default.createElement(
        'ol',
        { className: 'list-group mark-active', style: { 'max-height': '80vh' } },
        applicableDefinitions
      ),
      notApplicableSection
    );
  }

  _moveSelectionIndex(step) {
    this.setState({ selectionIndex: this.state.selectionIndex + step });
  }

  _setSelectionIndex(selectionIndex) {
    this.setState({ selectionIndex });
  }

  _checkFocus(event) {
    const node = _reactDom.default.findDOMNode(this);
    // If the next active element (`event.relatedTarget`) is not a descendant of this modal, close
    // the modal.
    // $FlowFixMe
    if (!node.contains(event.relatedTarget)) {
      this.props.onClose();
    }
  }

  _toggleWorkingSet(name, active) {
    if (active) {
      this.props.workingSetsStore.deactivate(name);
    } else {
      this.props.workingSetsStore.activate(name);
    }
  }

  _deleteWorkingSet(name) {
    this.props.workingSetsStore.deleteWorkingSet(name);
  }
}

exports.WorkingSetSelectionComponent = WorkingSetSelectionComponent;


class ApplicableDefinitionLine extends _react.default.Component {

  constructor(props) {
    super(props);

    this._lineOnClick = this._lineOnClick.bind(this);
    this._deleteButtonOnClick = this._deleteButtonOnClick.bind(this);
    this._editButtonOnClick = this._editButtonOnClick.bind(this);
  }

  render() {
    const classes = {
      active: this.props.def.active,
      selected: this.props.selected,
      clearfix: true
    };

    return _react.default.createElement(
      'li',
      {
        className: (0, (_classnames || _load_classnames()).default)(classes),
        onMouseOver: () => this.props.onSelect(this.props.index),
        onClick: this._lineOnClick },
      _react.default.createElement(
        (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
        { className: 'pull-right' },
        _react.default.createElement((_Button || _load_Button()).Button, {
          icon: 'trashcan',
          onClick: this._deleteButtonOnClick,
          tabIndex: '-1',
          title: 'Delete this working set'
        }),
        _react.default.createElement((_Button || _load_Button()).Button, {
          icon: 'pencil',
          onClick: this._editButtonOnClick,
          tabIndex: '-1',
          title: 'Edit this working set'
        })
      ),
      _react.default.createElement(
        'span',
        null,
        this.props.def.name
      )
    );
  }

  _lineOnClick(event) {
    this.props.toggleWorkingSet(this.props.def.name, this.props.def.active);
  }

  _deleteButtonOnClick(event) {
    this.props.onDeleteWorkingSet(this.props.def.name);
    event.stopPropagation();
  }

  _editButtonOnClick(event) {
    this.props.onEditWorkingSet(this.props.def.name, this.props.def.uris);
    event.stopPropagation();
  }
}

class NonApplicableDefinitionLine extends _react.default.Component {

  constructor(props) {
    super(props);

    this._deleteButtonOnClick = this._deleteButtonOnClick.bind(this);
  }

  render() {
    return _react.default.createElement(
      'li',
      { className: 'clearfix' },
      _react.default.createElement((_Button || _load_Button()).Button, {
        className: 'pull-right',
        icon: 'trashcan',
        onClick: this._deleteButtonOnClick,
        tabIndex: '-1',
        title: 'Delete this working set'
      }),
      _react.default.createElement(
        'span',
        { className: 'text-subtle' },
        this.props.def.name
      )
    );
  }

  _deleteButtonOnClick(event) {
    this.props.onDeleteWorkingSet(this.props.def.name);
    event.stopPropagation();
  }
}