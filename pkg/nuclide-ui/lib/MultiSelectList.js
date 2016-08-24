Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var MultiSelectList = (function (_React$Component) {
  _inherits(MultiSelectList, _React$Component);

  _createClass(MultiSelectList, null, [{
    key: 'defaultProps',
    value: {
      onChange: function onChange(values) {},
      optionComponent: DefaultOptionComponent,
      options: [],
      value: []
    },
    enumerable: true
  }]);

  function MultiSelectList(props) {
    _classCallCheck(this, MultiSelectList);

    _get(Object.getPrototypeOf(MultiSelectList.prototype), 'constructor', this).call(this, props);
    this.state = {
      selectedValue: null
    };
  }

  _createClass(MultiSelectList, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._updateCommands(this.props.commandScope);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps) {
      if (prevProps.commandScope !== this.props.commandScope) {
        this._updateCommands(this.props.commandScope);
      }
    }
  }, {
    key: '_updateCommands',
    value: function _updateCommands() {
      var _this = this;

      if (this._commandsDisposables != null) {
        this._commandsDisposables.dispose();
      }
      var el = this.props.commandScope || (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      this._commandsDisposables = new (_atom2 || _atom()).CompositeDisposable(atom.commands.add(el, {
        'core:move-up': function coreMoveUp() {
          _this._moveSelectionIndex(-1);
        },
        'core:move-down': function coreMoveDown() {
          _this._moveSelectionIndex(1);
        },
        'core:confirm': function coreConfirm() {
          var selectedValue = _this.state.selectedValue;

          if (selectedValue != null) {
            _this._toggleActive(selectedValue);
          }
        }
      }));
    }
  }, {
    key: '_moveSelectionIndex',
    value: function _moveSelectionIndex(delta) {
      var _this2 = this;

      var currentIndex = this.props.options.findIndex(function (option) {
        return option.value === _this2.state.selectedValue;
      });
      var nextIndex = currentIndex + delta;
      if (nextIndex >= 0 && nextIndex < this.props.options.length) {
        this.setState({ selectedValue: this.props.options[nextIndex].value });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._commandsDisposables != null) {
        this._commandsDisposables.dispose();
      }
    }
  }, {
    key: '_toggleActive',
    value: function _toggleActive(value) {
      var activeValues = this.props.value.slice();
      var index = activeValues.indexOf(value);
      if (index === -1) {
        activeValues.push(value);
      } else {
        activeValues.splice(index, 1);
      }
      this.props.onChange(activeValues);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        {
          className: 'nuclide-multi-select-list select-list block',
          tabIndex: '0' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'ol',
          { className: 'list-group mark-active' },
          this._renderOptions()
        )
      );
    }
  }, {
    key: '_renderOptions',
    value: function _renderOptions() {
      var _this3 = this;

      var OptionComponent = this.props.optionComponent || DefaultOptionComponent;
      return this.props.options.map(function (option, index) {
        var selected = _this3.state.selectedValue === option.value;
        var active = _this3.props.value.indexOf(option.value) !== -1;
        var className = (0, (_classnames2 || _classnames()).default)({
          clearfix: true,
          selected: selected,
          active: active
        });
        return (_reactForAtom2 || _reactForAtom()).React.createElement(
          'li',
          {
            key: index,
            className: className,
            onMouseOver: function () {
              _this3.setState({ selectedValue: option.value });
            },
            onClick: function () {
              _this3._toggleActive(option.value);
            } },
          (_reactForAtom2 || _reactForAtom()).React.createElement(OptionComponent, {
            option: option,
            active: active,
            selected: selected
          })
        );
      });
    }
  }]);

  return MultiSelectList;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.MultiSelectList = MultiSelectList;

function DefaultOptionComponent(props) {
  return (_reactForAtom2 || _reactForAtom()).React.createElement(
    'span',
    null,
    props.option.label
  );
}