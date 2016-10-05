Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var RadioGroup = (function (_React$Component) {
  _inherits(RadioGroup, _React$Component);

  _createClass(RadioGroup, null, [{
    key: 'defaultProps',
    value: {
      optionLabels: [],
      onSelectedChange: function onSelectedChange(selectedIndex) {},
      selectedIndex: 0
    },
    enumerable: true
  }]);

  function RadioGroup(props) {
    _classCallCheck(this, RadioGroup);

    _get(Object.getPrototypeOf(RadioGroup.prototype), 'constructor', this).call(this, props);
    this.state = {
      uid: uid++
    };
  }

  _createClass(RadioGroup, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var onSelectedChange = this.props.onSelectedChange;

      var checkboxes = this.props.optionLabels.map(function (labelContent, i) {
        var id = 'nuclide-radiogroup-' + uid + '-' + i;
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { key: i },
          (_reactForAtom2 || _reactForAtom()).React.createElement('input', {
            className: 'input-radio',
            type: 'radio',
            checked: i === _this.props.selectedIndex,
            name: 'radiogroup-' + _this.state.uid,
            id: id,
            onChange: function () {
              onSelectedChange(i);
            }
          }),
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'label',
            {
              className: 'input-label nuclide-ui-radiogroup-label',
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
  }]);

  return RadioGroup;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = RadioGroup;
module.exports = exports.default;