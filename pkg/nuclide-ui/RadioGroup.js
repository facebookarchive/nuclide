'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Globally unique ID used as the "name" attribute to group radio inputs.
let uid = 0; /**
              * Copyright (c) 2015-present, Facebook, Inc.
              * All rights reserved.
              *
              * This source code is licensed under the license found in the LICENSE file in
              * the root directory of this source tree.
              *
              * 
              * @format
              */

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
class RadioGroup extends _react.default.Component {

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
      return _react.default.createElement(
        'div',
        { key: i, className: 'nuclide-ui-radiogroup-div' },
        _react.default.createElement('input', {
          className: 'input-radio',
          type: 'radio',
          checked: i === selectedIndex,
          name: 'radiogroup-' + this.state.uid,
          id: id,
          onChange: () => {
            onSelectedChange(i);
          }
        }),
        _react.default.createElement(
          'label',
          {
            className: 'input-label nuclide-ui-radiogroup-label',
            htmlFor: id },
          labelContent
        )
      );
    });
    return _react.default.createElement(
      'div',
      { className: className },
      checkboxes
    );
  }
}
exports.default = RadioGroup;
RadioGroup.defaultProps = {
  optionLabels: [],
  onSelectedChange: selectedIndex => {},
  selectedIndex: 0
};