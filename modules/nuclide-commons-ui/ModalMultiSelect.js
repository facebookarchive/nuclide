'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.ModalMultiSelect = undefined;var _Button;














function _load_Button() {return _Button = require('./Button');}var _ButtonGroup;
function _load_ButtonGroup() {return _ButtonGroup = require('./ButtonGroup');}var _Modal;
function _load_Modal() {return _Modal = require('./Modal');}var _MultiSelectList;
function _load_MultiSelectList() {return _MultiSelectList = require('./MultiSelectList');}var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}
var _react = _interopRequireWildcard(require('react'));
var _reactDom = _interopRequireDefault(require('react-dom'));function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}























/**
                                                                                                                                                                                                                                                                                                                                                                                                                            * A `<select>`-like control that uses an Atom modal for its options. This component uses an API as
                                                                                                                                                                                                                                                                                                                                                                                                                            * similar to `Dropdown` as possible, with extra props for customizing display options.
                                                                                                                                                                                                                                                                                                                                                                                                                            */
class ModalMultiSelect extends _react.Component {












  constructor(props) {
    super(props);this.


































    _selectAll = () => {
      const allValues = this.props.options.map(option => option.value);
      this.setState({ activeValues: allValues });
    };this.

    _selectNone = () => {
      this.setState({ activeValues: [] });
    };this.

    _resetSelection = () => {
      this.setState({ activeValues: this.props.value });
    };this.

    _showModal = () => {
      this.setState({
        showModal: true,
        // When you show the modal, the initial selection should match the actually selected values.
        activeValues: this.props.value });

    };this.

    _dismissModal = () => {
      this.setState({ showModal: false });
    };this.

    _confirmValues = () => {
      // TODO (matthewwithanm): Use ctrl-enter to confirm
      this._dismissModal();
      this.props.onChange(this.state.activeValues);
    };this.state = { activeValues: props.value, showModal: false };}render() {const LabelComponent = this.props.labelComponent || DefaultLabelComponent;const selectedOptions = this.props.options.filter(option => this.props.value.indexOf(option.value) !== -1);const className = (0, (_classnames || _load_classnames()).default)(this.props.className, { 'btn-warning': this.props.value.length === 0 });return _react.createElement((_Button || _load_Button()).Button, { className: className, disabled: this.props.disabled, size: this.props.size, onClick: event => {// Because of how Portals work in React, this handler will actually be triggered for all
          // clicks within the modal! We need to filter those out to separate button clicks.
          // (see https://reactjs.org/docs/portals.html#event-bubbling-through-portals)
          const modalElement = this._modal && _reactDom.default.findDOMNode(this._modal);if (modalElement == null || !modalElement.contains(event.target)) {this._showModal();}} }, _react.createElement(LabelComponent, { selectedOptions: selectedOptions }), this._renderModal());}_renderModal() {if (!this.state.showModal) {
      return;
    }

    return (
      _react.createElement((_Modal || _load_Modal()).Modal, {
          ref: c => {
            this._modal = c;
          },
          onDismiss: this._dismissModal },
        _react.createElement((_MultiSelectList || _load_MultiSelectList()).MultiSelectList, {
          commandScope: atom.views.getView(atom.workspace),
          value: this.state.activeValues,
          options: this.props.options,
          optionComponent: this.props.optionComponent,
          onChange: activeValues => this.setState({ activeValues }) }),

        _react.createElement('div', { className: 'nuclide-modal-multi-select-actions' },
          _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
            _react.createElement((_Button || _load_Button()).Button, { onClick: this._selectNone }, 'None'),
            _react.createElement((_Button || _load_Button()).Button, { onClick: this._selectAll }, 'All'),
            _react.createElement((_Button || _load_Button()).Button, { onClick: this._resetSelection }, 'Reset')),

          _react.createElement((_ButtonGroup || _load_ButtonGroup()).ButtonGroup, null,
            _react.createElement((_Button || _load_Button()).Button, { onClick: this._dismissModal }, 'Cancel'),
            _react.createElement((_Button || _load_Button()).Button, {
                buttonType: (_Button || _load_Button()).ButtonTypes.PRIMARY,
                onClick: this._confirmValues }, 'Confirm')))));






  }}exports.ModalMultiSelect = ModalMultiSelect; /**
                                                  * Copyright (c) 2017-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the BSD-style license found in the
                                                  * LICENSE file in the root directory of this source tree. An additional grant
                                                  * of patent rights can be found in the PATENTS file in the same directory.
                                                  *
                                                  * 
                                                  * @format
                                                  */ModalMultiSelect.defaultProps = { className: '', disabled: false, labelComponent: DefaultLabelComponent, onChange: value => {}, options: [], value: [], size: (_Button || _load_Button()).ButtonSizes.SMALL };function DefaultLabelComponent(props) {const count = props.selectedOptions.length;const noun = count === 1 ? 'Item' : 'Items';return _react.createElement('span', null, `${count} ${noun} Selected`);
}