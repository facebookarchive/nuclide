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

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var LoadingSpinnerSizes = Object.freeze({
  EXTRA_SMALL: 'EXTRA_SMALL',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
});

exports.LoadingSpinnerSizes = LoadingSpinnerSizes;
var LoadingSpinnerClassnames = Object.freeze({
  EXTRA_SMALL: 'loading-spinner-tiny',
  SMALL: 'loading-spinner-small',
  MEDIUM: 'loading-spinner-medium',
  LARGE: 'loading-spinner-large'
});

/**
 * Shows an indefinite, animated LoadingSpinner.
 */

var LoadingSpinner = (function (_React$Component) {
  _inherits(LoadingSpinner, _React$Component);

  function LoadingSpinner(props) {
    _classCallCheck(this, LoadingSpinner);

    _get(Object.getPrototypeOf(LoadingSpinner.prototype), 'constructor', this).call(this, props);
    this.state = { shouldRender: false };
  }

  _createClass(LoadingSpinner, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var delay = this.props.delay == null ? 0 : this.props.delay;
      this._timeout = setTimeout(function () {
        return _this.setState({ shouldRender: true });
      }, delay);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._timeout != null) {
        clearTimeout(this._timeout);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var className = _props.className;
      var size = _props.size;

      if (!this.state.shouldRender) {
        return null;
      }
      var safeSize = size != null && LoadingSpinnerSizes.hasOwnProperty(size) ? size : LoadingSpinnerSizes.MEDIUM;
      var sizeClassname = LoadingSpinnerClassnames[safeSize];
      var newClassName = (0, (_classnames2 || _classnames()).default)(className, 'loading', sizeClassname);
      return (_reactForAtom2 || _reactForAtom()).React.createElement('div', { className: newClassName });
    }
  }]);

  return LoadingSpinner;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.LoadingSpinner = LoadingSpinner;

/** The size of the LoadingSpinner. Defaults to MEDIUM. */

/**
 * An optional delay (in milliseconds) between mounting the component and actually rendering
 * the spinner to avoid UI churn.
 */