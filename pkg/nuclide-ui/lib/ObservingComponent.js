Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// State is set to null indicates that the observable has not
// produced a value yet.

// Derived classes must override render()
// Also might want to override shouldComponentUpdate(nextProps, nextState).

var ObservingComponent = (function (_React$Component) {
  _inherits(ObservingComponent, _React$Component);

  function ObservingComponent(props) {
    _classCallCheck(this, ObservingComponent);

    _get(Object.getPrototypeOf(ObservingComponent.prototype), 'constructor', this).call(this, props);
    this.state = {
      data: null
    };
  }

  _createClass(ObservingComponent, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this._subscribe(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      if (newProps.data === this.props.data) {
        return;
      }

      this._unsubscribe();
      this._subscribe(newProps);
    }
  }, {
    key: '_subscribe',
    value: function _subscribe(newProps) {
      var _this = this;

      (0, (_assert2 || _assert()).default)(this.subscription == null);
      this.subscription = this.props.data.subscribe(function (data) {
        _this.setState({ data: data });
      });
      this.setState({ data: null });
    }
  }, {
    key: '_unsubscribe',
    value: function _unsubscribe() {
      (0, (_assert2 || _assert()).default)(this.subscription != null);
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._unsubscribe();
    }
  }]);

  return ObservingComponent;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.ObservingComponent = ObservingComponent;