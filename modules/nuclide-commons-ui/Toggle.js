"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Toggle = void 0;

var React = _interopRequireWildcard(require("react"));

function _classnames() {
  const data = _interopRequireDefault(require("classnames"));

  _classnames = function () {
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
 * A toggle component with an input toggle and a label. We restrict the label to a string
 * to ensure this component is pure.
 */
class Toggle extends React.Component {
  constructor(...args) {
    var _temp;

    return _temp = super(...args), this._onChange = event => {
      const isToggled = event.target.checked;
      this.props.onChange.call(null, isToggled);
    }, _temp;
  }

  render() {
    const {
      className,
      disabled,
      label,
      onClick,
      toggled
    } = this.props;
    const text = label === '' ? null : React.createElement("span", {
      className: "nuclide-ui-toggle-label-text"
    }, " ", label);
    return React.createElement("label", {
      className: (0, _classnames().default)(className, 'nuclide-ui-toggle-label', {
        'nuclide-ui-toggle-disabled': disabled
      }),
      onClick: onClick && (0, _ignoreTextSelectionEvents().default)(onClick)
    }, React.createElement("input", {
      checked: toggled,
      className: "input-toggle",
      disabled: disabled,
      onChange: this._onChange,
      type: "checkbox"
    }), text);
  }

}

exports.Toggle = Toggle;
Toggle.defaultProps = {
  disabled: false,

  onClick(event) {}

};