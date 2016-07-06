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

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

/** Component to prompt the user for authentication information. */

var AuthenticationPrompt = (function (_React$Component) {
  _inherits(AuthenticationPrompt, _React$Component);

  function AuthenticationPrompt(props) {
    _classCallCheck(this, AuthenticationPrompt);

    _get(Object.getPrototypeOf(AuthenticationPrompt.prototype), 'constructor', this).call(this, props);
    this._disposables = new (_atom2 || _atom()).CompositeDisposable();
    this._onKeyUp = this._onKeyUp.bind(this);
  }

  _createClass(AuthenticationPrompt, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      // Hitting enter when this panel has focus should confirm the dialog.
      this._disposables.add(atom.commands.add(this.refs.root, 'core:confirm', function (event) {
        return _this.props.onConfirm();
      }));

      // Hitting escape should cancel the dialog.
      this._disposables.add(atom.commands.add('atom-workspace', 'core:cancel', function (event) {
        return _this.props.onCancel();
      }));

      this.refs.password.focus();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._disposables.dispose();
    }
  }, {
    key: 'focus',
    value: function focus() {
      this.refs.password.focus();
    }
  }, {
    key: 'getPassword',
    value: function getPassword() {
      return this.refs.password.value;
    }
  }, {
    key: '_onKeyUp',
    value: function _onKeyUp(e) {
      if (e.key === 'Enter') {
        this.props.onConfirm();
      }

      if (e.key === 'Escape') {
        this.props.onCancel();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      // * Need native-key-bindings so that delete works and we need `_onKeyUp` so that escape and
      //   enter work
      // * `instructions` are pre-formatted, so apply `whiteSpace: pre` to maintain formatting coming
      //   from the server.
      return (_reactForAtom2 || _reactForAtom()).React.createElement(
        'div',
        { ref: 'root' },
        (_reactForAtom2 || _reactForAtom()).React.createElement(
          'div',
          { className: 'block', style: { whiteSpace: 'pre' } },
          this.props.instructions
        ),
        (_reactForAtom2 || _reactForAtom()).React.createElement('input', {
          tabIndex: '0',
          type: 'password',
          className: 'nuclide-password native-key-bindings',
          ref: 'password',
          onKeyPress: this._onKeyUp
        })
      );
    }
  }]);

  return AuthenticationPrompt;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.default = AuthenticationPrompt;
module.exports = exports.default;