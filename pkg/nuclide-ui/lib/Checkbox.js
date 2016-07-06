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

/**
 * A checkbox component with an input checkbox and a label. We restrict the label to a string
 * to ensure this component is pure.
 */

var Checkbox = (function (_React$Component) {
  _inherits(Checkbox, _React$Component);

  _createClass(Checkbox, null, [{
    key: 'defaultProps',
    value: {
      disabled: false,
      indeterminate: false,
      label: '',
      onClick: function onClick(event) {}
    },
    enumerable: true
  }]);

  function Checkbox(props) {
    _classCallCheck(this, Checkbox);

    _get(Object.getPrototypeOf(Checkbox.prototype), 'constructor', this).call(this, props);
    this._onChange = this._onChange.bind(this);
  }

  _createClass(Checkbox, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._setIndeterminate();
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return (_reactForAtom2 || _reactForAtom()).PureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._setIndeterminate();
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      var isChecked = event.target.checked;
      this.props.onChange.call(null, isChecked);
    }

    /*
     * Syncs the `indeterminate` prop to the underlying `<input>`. `indeterminate` is intentionally
     * not settable via HTML; it must be done on the `HTMLInputElement` instance in script.
     *
     * @see https://www.w3.org/TR/html5/forms.html#the-input-element
     */
  }, {
    key: '_setIndeterminate',
    value: function _setIndeterminate() {
      (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this.refs.input).indeterminate = this.props.indeterminate;
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'label',
        { className: 'nuclide-ui-checkbox-label', onClick: this.props.onClick },
        (_reactForAtom2 || _reactForAtom()).React.createElement('input', {
          checked: this.props.checked,
          className: 'nuclide-ui-checkbox',
          disabled: this.props.disabled,
          onChange: this._onChange,
          ref: 'input',
          type: 'checkbox'
        }),
        ' ',
        this.props.label
      );
    }
  }]);

  return Checkbox;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Checkbox = Checkbox;