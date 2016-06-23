Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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

var Dropdown = (function (_React$Component) {
  _inherits(Dropdown, _React$Component);

  _createClass(Dropdown, null, [{
    key: 'defaultProps',
    value: {
      className: '',
      disabled: false,
      isFlat: false,
      onChange: function onChange(value) {},
      options: [],
      value: null,
      title: ''
    },
    enumerable: true
  }]);

  function Dropdown(props) {
    _classCallCheck(this, Dropdown);

    _get(Object.getPrototypeOf(Dropdown.prototype), 'constructor', this).call(this, props);
    this._handleChange = this._handleChange.bind(this);
  }

  _createClass(Dropdown, [{
    key: '_handleChange',
    value: function _handleChange(event) {
      var selectedIndex = event.currentTarget.selectedIndex;
      var option = this.props.options[selectedIndex];
      this.props.onChange(option == null ? null : option.value);
    }
  }, {
    key: 'render',
    value: function render() {
      var _ref,
          _this = this;

      var options = this.props.options.map(function (item, index) {
        return(
          // Use indexes for values. This allows us to have non-string values in our options object.
          (_reactForAtom2 || _reactForAtom()).React.createElement(
            'option',
            { key: index, value: index },
            item.label
          )
        );
      });
      var selectClassName = (0, (_classnames2 || _classnames()).default)('nuclide-dropdown', (_ref = {
        'btn': !this.props.isFlat
      }, _defineProperty(_ref, 'btn-' + this.props.size, !this.props.isFlat && this.props.size != null), _defineProperty(_ref, 'nuclide-dropdown-flat', this.props.isFlat), _ref));

      var selectedIndex = this.props.options.findIndex(function (option) {
        return option.value === _this.props.value;
      });

      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: 'nuclide-dropdown-container ' + this.props.className },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'select',
          {
            className: selectClassName,
            disabled: this.props.disabled,
            onChange: this._handleChange,
            title: this.props.title,
            value: selectedIndex === -1 ? '' : selectedIndex },
          options
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('i', { className: 'icon icon-triangle-down text-center' })
      );
    }
  }]);

  return Dropdown;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Dropdown = Dropdown;

/**
 * A function that gets called with the new value on change.
 */

/**
 * Size of dropdown. Sizes match .btn classes in Atom's style guide. Default is medium (which
 * does not have an associated 'size' string).
 */