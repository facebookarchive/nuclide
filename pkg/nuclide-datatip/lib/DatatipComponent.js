Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _IconsForAction;

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var DATATIP_ACTIONS = Object.freeze({
  PIN: 'PIN',
  CLOSE: 'CLOSE'
});

exports.DATATIP_ACTIONS = DATATIP_ACTIONS;
var IconsForAction = (_IconsForAction = {}, _defineProperty(_IconsForAction, DATATIP_ACTIONS.PIN, 'pin'), _defineProperty(_IconsForAction, DATATIP_ACTIONS.CLOSE, 'x'), _IconsForAction);

var DatatipComponent = (function (_React$Component) {
  _inherits(DatatipComponent, _React$Component);

  function DatatipComponent(props) {
    _classCallCheck(this, DatatipComponent);

    _get(Object.getPrototypeOf(DatatipComponent.prototype), 'constructor', this).call(this, props);
    this.handleActionClick = this.handleActionClick.bind(this);
  }

  _createClass(DatatipComponent, [{
    key: 'handleActionClick',
    value: function handleActionClick(event) {
      this.props.onActionClick();
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var className = _props.className;
      var children = _props.children;
      var action = _props.action;
      var actionTitle = _props.actionTitle;

      var props = _objectWithoutProperties(_props, ['className', 'children', 'action', 'actionTitle']);

      var actionButton = undefined;
      if (action != null && IconsForAction[action] != null) {
        var actionIcon = IconsForAction[action];
        actionButton = (_reactForAtom2 || _reactForAtom()).React.createElement('div', {
          className: 'nuclide-datatip-pin-button icon-' + actionIcon,
          onClick: this.handleActionClick,
          title: actionTitle
        });
      }
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        _extends({
          className: (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(className) + ' nuclide-datatip-container'
        }, props),
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'nuclide-datatip-content' },
          children
        ),
        actionButton
      );
    }
  }]);

  return DatatipComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.DatatipComponent = DatatipComponent;