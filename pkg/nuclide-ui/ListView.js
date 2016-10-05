Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/**
 * Use ListViewItem in conjunction with ListView.
 */

var ListViewItem = (function (_React$Component) {
  _inherits(ListViewItem, _React$Component);

  function ListViewItem() {
    _classCallCheck(this, ListViewItem);

    _get(Object.getPrototypeOf(ListViewItem.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ListViewItem, [{
    key: '_select',
    value: function _select(value, index, event) {
      this.props.onSelect(value, index);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var children = _props.children;
      var index = _props.index;
      var value = _props.value;

      var remainingProps = _objectWithoutProperties(_props, ['children', 'index', 'value']);

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        _extends({
          className: 'nuclide-ui-listview-item'
        }, remainingProps, {
          onClick: this._select.bind(this, value, index) }),
        children
      );
    }
  }]);

  return ListViewItem;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ListViewItem = ListViewItem;

var ListView = (function (_React$Component2) {
  _inherits(ListView, _React$Component2);

  function ListView(props) {
    _classCallCheck(this, ListView);

    _get(Object.getPrototypeOf(ListView.prototype), 'constructor', this).call(this, props);
    this._handleSelect = this._handleSelect.bind(this);
  }

  _createClass(ListView, [{
    key: '_handleSelect',
    value: function _handleSelect(value, index, event) {
      if (this.props.selectable && this.props.onSelect != null) {
        this.props.onSelect(index, value);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      var _props2 = this.props;
      var children = _props2.children;
      var alternateBackground = _props2.alternateBackground;
      var selectable = _props2.selectable;

      var renderedItems = (_reactForAtom2 || _reactForAtom()).React.Children.map(children, function (child, index) {
        return (_reactForAtom2 || _reactForAtom()).React.cloneElement(child, {
          index: index,
          onSelect: _this._handleSelect
        });
      });
      var className = (0, (_classnames2 || _classnames()).default)({
        'nuclide-ui-listview': true,
        'nuclide-ui-listview-highlight-odd': alternateBackground,
        'nuclide-ui-listview-selectable': selectable
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: className },
        renderedItems
      );
    }
  }]);

  return ListView;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ListView = ListView;

// $FlowIssue `index` and `onSelect` are injected by the surrounding `ListView` component.

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