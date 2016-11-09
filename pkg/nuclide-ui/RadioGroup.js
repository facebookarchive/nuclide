'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _class, _temp;

var _reactForAtom = require('react-for-atom');

// Globally unique ID used as the "name" attribute to group radio inputs.
let uid = 0;

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
let RadioGroup = (_temp = _class = class RadioGroup extends _reactForAtom.React.Component {

  constructor(props) {
    super(props);
    this.state = {
      uid: uid++
    };
  }

  render() {
    const onSelectedChange = this.props.onSelectedChange;

    const checkboxes = this.props.optionLabels.map((labelContent, i) => {
      const id = 'nuclide-radiogroup-' + uid + '-' + i;
      return _reactForAtom.React.createElement(
        'div',
        { key: i },
        _reactForAtom.React.createElement('input', {
          className: 'input-radio',
          type: 'radio',
          checked: i === this.props.selectedIndex,
          name: 'radiogroup-' + this.state.uid,
          id: id,
          onChange: () => {
            onSelectedChange(i);
          }
        }),
        _reactForAtom.React.createElement(
          'label',
          {
            className: 'input-label nuclide-ui-radiogroup-label',
            htmlFor: id },
          labelContent
        )
      );
    });
    return _reactForAtom.React.createElement(
      'div',
      null,
      checkboxes
    );
  }
}, _class.defaultProps = {
  optionLabels: [],
  onSelectedChange: selectedIndex => {},
  selectedIndex: 0
}, _temp);
exports.default = RadioGroup;
module.exports = exports['default'];