'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.Toggle = undefined;











var _react = _interopRequireWildcard(require('react'));var _classnames;
function _load_classnames() {return _classnames = _interopRequireDefault(require('classnames'));}var _ignoreTextSelectionEvents;

function _load_ignoreTextSelectionEvents() {return _ignoreTextSelectionEvents = _interopRequireDefault(require('./ignoreTextSelectionEvents'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}















/**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * A toggle component with an input toggle and a label. We restrict the label to a string
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               * to ensure this component is pure.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               */
class Toggle extends _react.Component {constructor(...args) {var _temp;return _temp = super(...args), this.





    _onChange = event => {
      const isToggled = event.target.checked;
      this.props.onChange.call(null, isToggled);
    }, _temp;}

  render() {
    const { className, disabled, label, onClick, toggled } = this.props;
    const text =
    label === '' ? null :
    _react.createElement('span', { className: 'nuclide-ui-toggle-label-text' }, ' ', label);

    return (
      _react.createElement('label', {
          className: (0, (_classnames || _load_classnames()).default)(className, 'nuclide-ui-toggle-label', {
            'nuclide-ui-toggle-disabled': disabled }),

          onClick: onClick && (0, (_ignoreTextSelectionEvents || _load_ignoreTextSelectionEvents()).default)(onClick) },
        _react.createElement('input', {
          checked: toggled,
          className: 'input-toggle',
          disabled: disabled,
          onChange: this._onChange,
          type: 'checkbox' }),

        text));


  }}exports.Toggle = Toggle; /**
                              * Copyright (c) 2017-present, Facebook, Inc.
                              * All rights reserved.
                              *
                              * This source code is licensed under the BSD-style license found in the
                              * LICENSE file in the root directory of this source tree. An additional grant
                              * of patent rights can be found in the PATENTS file in the same directory.
                              *
                              * 
                              * @format
                              */Toggle.defaultProps = { disabled: false, onClick(event) {} };