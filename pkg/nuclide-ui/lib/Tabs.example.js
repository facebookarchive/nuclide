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

var _Tabs2;

function _Tabs() {
  return _Tabs2 = require('./Tabs');
}

var tabs = [{
  name: 'one',
  tabContent: (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'One'
  )
}, {
  name: 'two',
  tabContent: (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'Two'
  )
}, {
  name: 'three',
  tabContent: (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'Three'
  )
}, {
  name: 'four',
  tabContent: (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'Four'
  )
}, {
  name: 'five',
  tabContent: (_reactForAtom2 || _reactForAtom()).React.createElement(
    'div',
    null,
    'Five'
  )
}];

var TabExample = (function (_React$Component) {
  _inherits(TabExample, _React$Component);

  function TabExample(props) {
    _classCallCheck(this, TabExample);

    _get(Object.getPrototypeOf(TabExample.prototype), 'constructor', this).call(this, props);
    this.handleTabChange = this.handleTabChange.bind(this);
    this.state = {
      activeTabName: 'one'
    };
  }

  _createClass(TabExample, [{
    key: 'handleTabChange',
    value: function handleTabChange(newTabName) {
      this.setState({
        activeTabName: newTabName.name
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var activeTabName = this.state.activeTabName;

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        (_Block2 || _Block()).Block,
        null,
        (_reactForAtom2 || _reactForAtom()).React.createElement((_Tabs2 || _Tabs()).Tabs, {
          tabs: tabs,
          activeTabName: activeTabName,
          triggeringEvent: 'onClick',
          onActiveTabChange: this.handleTabChange
        }),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { style: { padding: '2em 0 2em 0' } },
          'Showing content for tab "',
          activeTabName,
          '".'
        )
      );
    }
  }]);

  return TabExample;
})((_reactForAtom2 || _reactForAtom()).React.Component);

var TabExamples = {
  sectionName: 'Tabs',
  description: '',
  examples: [{
    title: '',
    // $FlowIssue
    component: TabExample
  }]
};
exports.TabExamples = TabExamples;