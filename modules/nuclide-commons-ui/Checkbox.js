"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Checkbox = void 0;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
    return data;
  };

  return data;
}

function _addTooltip() {
  const data = _interopRequireDefault(require("./addTooltip"));

  _addTooltip = function () {
    return data;
  };

  return data;
}

function _ignoreTextSelectionEvents() {
  const data = _interopRequireDefault(require("./ignoreTextSelectionEvents"));

  _ignoreTextSelectionEvents = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */
class Checkbox extends React.PureComponent {
  constructor(props) {
    super(props);
    this._onChange = this._onChange.bind(this);
  }

  componentDidMount() {
    this._setIndeterminate();
  }

  componentDidUpdate() {
    this._setIndeterminate();
  }

  _onChange(event) {
    const isChecked = event.target.checked;
    this.props.onChange.call(null, isChecked);
  }
  /*
   * Syncs the `indeterminate` prop to the underlying `<input>`. `indeterminate` is intentionally
   * not settable via HTML; it must be done on the `HTMLInputElement` instance in script.
   *
   * @see https://www.w3.org/TR/html5/forms.html#the-input-element
   */


  _setIndeterminate() {
    if (this._input == null) {
      return;
    }

    this._input.indeterminate = this.props.indeterminate;
  }

  render() {
    const {
      checked,
      className,
      disabled,
      // eslint-disable-next-line no-unused-vars
      indeterminate,
      // exclude `indeterminate` from `remainingProps`
      label,
      onClick,
      tooltip,
      title,
      onMouseDown
    } = this.props;
    const ref = tooltip ? (0, _addTooltip().default)(tooltip) : null;
    const text = label === '' ? null : React.createElement("span", {
      className: "nuclide-ui-checkbox-label-text"
    }, " ", label);
    return React.createElement("label", {
      className: (0, _classnames().default)(className, 'nuclide-ui-checkbox-label', {
        'nuclide-ui-checkbox-disabled': disabled
      }) // eslint-disable-next-line nuclide-internal/jsx-simple-callback-refs
      ,
      ref: ref,
      onClick: onClick && (0, _ignoreTextSelectionEvents().default)(onClick),
      title: title
    }, React.createElement("input", {
      checked: checked,
      className: "input-checkbox nuclide-ui-checkbox",
      disabled: disabled,
      onChange: this._onChange,
      onMouseDown: onMouseDown,
      ref: el => {
        this._input = el;
      },
      type: "checkbox"
    }), text);
  }

}

exports.Checkbox = Checkbox;
Checkbox.defaultProps = {
  disabled: false,
  indeterminate: false,
  label: '',

  onClick(event) {},

  onMouseDown(event) {}

};