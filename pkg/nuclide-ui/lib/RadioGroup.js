Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

// Globally unique ID used as the "name" attribute to group radio inputs.
var uid = 0;

/**
 * A managed radio group component. Accepts arbitrary React elements as labels.
 */
var RadioGroup = (_reactForAtom2 || _reactForAtom()).React.createClass({

  propTypes: {
    optionLabels: (_reactForAtom2 || _reactForAtom()).React.PropTypes.arrayOf((_reactForAtom2 || _reactForAtom()).React.PropTypes.node).isRequired,
    selectedIndex: (_reactForAtom2 || _reactForAtom()).React.PropTypes.number.isRequired,
    onSelectedChange: (_reactForAtom2 || _reactForAtom()).React.PropTypes.func.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      optionLabels: [],
      onSelectedChange: function onSelectedChange() {},
      selectedIndex: 0
    };
  },

  getInitialState: function getInitialState() {
    return {
      uid: uid++
    };
  },

  render: function render() {
    var _this = this;

    var checkboxes = this.props.optionLabels.map(function (labelContent, i) {
      var id = 'nuclide-radiogroup-' + uid + '-' + i;
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { key: i },
        (_reactForAtom2 || _reactForAtom()).React.createElement('input', {
          type: 'radio',
          checked: i === _this.props.selectedIndex,
          name: 'radiogroup-' + _this.state.uid,
          id: id,
          onChange: _this.props.onSelectedChange.bind(null, i)
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'label',
          {
            className: 'nuclide-ui-radiogroup-label',
            htmlFor: id },
          labelContent
        )
      );
    });
    return (_reactForAtom2 || _reactForAtom()).React.createElement(
      'div',
      null,
      checkboxes
    );
  }
});
exports.RadioGroup = RadioGroup;