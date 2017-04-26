'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ModalMultiSelect = undefined;

var _Button;

function _load_Button() {
  return _Button = require('./Button');
}

var _ButtonGroup;

function _load_ButtonGroup() {
  return _ButtonGroup = require('./ButtonGroup');
}

var _Modal;

function _load_Modal() {
  return _Modal = require('./Modal');
}

var _MultiSelectList;

function _load_MultiSelectList() {
  return _MultiSelectList = require('./MultiSelectList');
}

var _classnames;

function _load_classnames() {
  return _classnames = _interopRequireDefault(require('classnames'));
}

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A `<select>`-like control that uses an Atom modal for its options. This component uses an API as
 * similar to `Dropdown` as possible, with extra props for customizing display options.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class ModalMultiSelect extends _react.default.Component {

  constructor(props) {
    super(props);
    this._confirmValues = this._confirmValues.bind(this);
    this._dismissModal = this._dismissModal.bind(this);
    this._selectAll = this._selectAll.bind(this);
    this._selectNone = this._selectNone.bind(this);
    this._resetSelection = this._resetSelection.bind(this);
    this._showModal = this._showModal.bind(this);
    this.state = {
      activeValues: props.value,
      showModal: false
    };
  }

  render() {
    const LabelComponent = this.props.labelComponent || DefaultLabelComponent;
    const selectedOptions = this.props.options.filter(option => this.props.value.indexOf(option.value) !== -1);
    const className = (0, (_classnames || _load_classnames()).default)(this.props.className, {
      'btn-warning': this.props.value.length === 0
    });
    return _react.default.createElement(
      (_Button || _load_Button()).Button,
      {
        className: className,
        disabled: this.props.disabled,
        size: this.props.size,
        onClick: this._showModal },
      _react.default.createElement(LabelComponent, { selectedOptions: selectedOptions }),
      this._renderModal()
    );
  }

  _selectAll() {
    const allValues = this.props.options.map(option => option.value);
    this.setState({ activeValues: allValues });
  }

  _selectNone() {
    this.setState({ activeValues: [] });
  }

  _resetSelection() {
    this.setState({ activeValues: this.props.value });
  }

  _showModal() {
    this.setState({
      showModal: true,
      // When you show the modal, the initial selection should match the actually selected values.
      activeValues: this.props.value
    });
  }

  _dismissModal() {
    this.setState({ showModal: false });
  }

  _confirmValues() {
    // TODO (matthewwithanm): Use ctrl-enter to confirm
    this._dismissModal();
    this.props.onChange(this.state.activeValues);
  }

  _renderModal() {
    if (!this.state.showModal) {
      return;
    }

    return _react.default.createElement(
      (_Modal || _load_Modal()).Modal,
      {
        onDismiss: this._dismissModal },
      _react.default.createElement((_MultiSelectList || _load_MultiSelectList()).MultiSelectList, {
        commandScope: atom.views.getView(atom.workspace),
        value: this.state.activeValues,
        options: this.props.options,
        optionComponent: this.props.optionComponent,
        onChange: activeValues => this.setState({ activeValues })
      }),
      _react.default.createElement(
        'div',
        { className: 'nuclide-modal-multi-select-actions' },
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._selectNone },
            'None'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._selectAll },
            'All'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._resetSelection },
            'Reset'
          )
        ),
        _react.default.createElement(
          (_ButtonGroup || _load_ButtonGroup()).ButtonGroup,
          null,
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            { onClick: this._dismissModal },
            'Cancel'
          ),
          _react.default.createElement(
            (_Button || _load_Button()).Button,
            {
              buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
              onClick: this._confirmValues },
            'Confirm'
          )
        )
      )
    );
  }
}

exports.ModalMultiSelect = ModalMultiSelect;
ModalMultiSelect.defaultProps = {
  className: '',
  disabled: false,
  labelComponent: DefaultLabelComponent,
  onChange: value => {},
  options: [],
  value: [],
  size: (_Button || _load_Button()).ButtonSizes.SMALL
};


function DefaultLabelComponent(props) {
  const count = props.selectedOptions.length;
  const noun = count === 1 ? 'Item' : 'Items';
  return _react.default.createElement(
    'span',
    null,
    `${count} ${noun} Selected`
  );
}