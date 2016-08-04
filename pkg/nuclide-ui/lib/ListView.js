Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 *
 */

var Listview = (function (_React$Component) {
  _inherits(Listview, _React$Component);

  function Listview() {
    _classCallCheck(this, Listview);

    _get(Object.getPrototypeOf(Listview.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Listview, [{
    key: 'render',
    value: function render() {
      var _this = this;

      var _props = this.props;
      var children = _props.children;
      var alternateBackground = _props.alternateBackground;
      var selectable = _props.selectable;
      var onSelect = _props.onSelect;

      var wrappedChildren = (_reactForAtom2 || _reactForAtom()).React.Children.map(children, function (child, index) {
        var dynamicProps = {};
        if (selectable) {
          (0, (_assert2 || _assert()).default)(onSelect != null);
          dynamicProps.onClick = onSelect.bind(_this, index);
        }
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          _extends({
            key: index,
            className: 'nuclide-ui-listview-item'
          }, dynamicProps),
          child
        );
      });
      var className = (0, (_classnames2 || _classnames()).default)({
        'nuclide-ui-listview': true,
        'nuclide-ui-listview-highlight-odd': alternateBackground,
        'nuclide-ui-listview-selectable': selectable
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: className },
        wrappedChildren
      );
    }
  }]);

  return Listview;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Listview = Listview;

/**
 * Whether to shade even and odd items differently.
 */

/**
 * Whether items can be selected.
 * If specified, `onSelect` must also be specified.
 */

/**
 * Handler to be called upon selection. Called iff `selectable` is `true`.
 */