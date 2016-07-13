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

var _Block2;

function _Block() {
  return _Block2 = require('./Block');
}

var _RadioGroup2;

function _RadioGroup() {
  return _RadioGroup2 = require('./RadioGroup');
}

var labels = ['choose', 'from', 'one of', 'several', 'options'];

var RadioGroupExample = (function (_React$Component) {
  _inherits(RadioGroupExample, _React$Component);

  function RadioGroupExample(props) {
    _classCallCheck(this, RadioGroupExample);

    _get(Object.getPrototypeOf(RadioGroupExample.prototype), 'constructor', this).call(this, props);
    this.onSelectedChange = this.onSelectedChange.bind(this);
    this.state = {
      selectedIndex: 0
    };
  }

  _createClass(RadioGroupExample, [{
    key: 'onSelectedChange',
    value: function onSelectedChange(selectedIndex) {
      this.setState({
        selectedIndex: selectedIndex
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Block2 || _Block()).Block,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_RadioGroup2 || _RadioGroup()).RadioGroup, {
          selectedIndex: this.state.selectedIndex,
          optionLabels: labels,
          onSelectedChange: this.onSelectedChange
        })
      );
    }
  }]);

  return RadioGroupExample;
})((_reactForAtom2 || _reactForAtom()).React.Component);

var RadioGroupExamples = {
  sectionName: 'RadioGroup',
  description: '',
  examples: [{
    title: '',
    component: RadioGroupExample
  }]
};
exports.RadioGroupExamples = RadioGroupExamples;