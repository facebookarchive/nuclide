"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var React = _interopRequireWildcard(require("react"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
// Globally unique ID used as the "name" attribute to group radio inputs.
let uid = 0;

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
class RadioGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      uid: uid++
    };
  }

  render() {
    const {
      className,
      onSelectedChange,
      optionLabels,
      selectedIndex
    } = this.props;
    const checkboxes = optionLabels.map((labelContent, i) => {
      const id = 'nuclide-radiogroup-' + uid + '-' + i;
      return React.createElement("div", {
        key: i,
        className: "nuclide-ui-radiogroup-div"
      }, React.createElement("input", {
        className: "input-radio",
        type: "radio",
        checked: i === selectedIndex,
        name: 'radiogroup-' + this.state.uid,
        id: id,
        onChange: () => {
          onSelectedChange(i);
        }
      }), React.createElement("label", {
        className: "input-label nuclide-ui-radiogroup-label",
        htmlFor: id
      }, labelContent));
    });
    return React.createElement("div", {
      className: className
    }, checkboxes);
  }

}

exports.default = RadioGroup;
RadioGroup.defaultProps = {
  optionLabels: [],
  onSelectedChange: selectedIndex => {},
  selectedIndex: 0
};