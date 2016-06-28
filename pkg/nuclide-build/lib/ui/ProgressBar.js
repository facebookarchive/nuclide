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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _classnames2;

function _classnames() {
  return _classnames2 = _interopRequireDefault(require('classnames'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var ProgressBar = (function (_React$Component) {
  _inherits(ProgressBar, _React$Component);

  function ProgressBar() {
    _classCallCheck(this, ProgressBar);

    _get(Object.getPrototypeOf(ProgressBar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ProgressBar, [{
    key: 'render',
    value: function render() {
      var className = (0, (_classnames2 || _classnames()).default)('nuclide-build-progress-bar', {
        indeterminate: this._isIndeterminate()
      });
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { className: className, hidden: !this.props.visible },
        this._renderBar()
      );
    }
  }, {
    key: '_isIndeterminate',
    value: function _isIndeterminate() {
      return this.props.progress == null;
    }
  }, {
    key: '_renderBar',
    value: function _renderBar() {
      if (this._isIndeterminate()) {
        return null;
      }

      (0, (_assert2 || _assert()).default)(this.props.progress != null);
      return (_reactForAtom2 || _reactForAtom()).React.createElement(Bar, { progress: this.props.progress });
    }
  }]);

  return ProgressBar;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ProgressBar = ProgressBar;

var Bar = (function (_React$Component2) {
  _inherits(Bar, _React$Component2);

  function Bar() {
    _classCallCheck(this, Bar);

    _get(Object.getPrototypeOf(Bar.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Bar, [{
    key: 'render',
    value: function render() {
      var pct = Math.max(0, Math.min(100, this.props.progress * 100));
      return (_reactForAtom2 || _reactForAtom()).React.createElement('div', {
        className: 'nuclide-build-progress-bar-bar',
        style: { width: pct + '%' }
      });
    }
  }]);

  return Bar;
})((_reactForAtom2 || _reactForAtom()).React.Component);