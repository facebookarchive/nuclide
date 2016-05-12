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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _StatusBarTileComponent2;

function _StatusBarTileComponent() {
  return _StatusBarTileComponent2 = require('./StatusBarTileComponent');
}

var StatusBarTile = (function (_React$Component) {
  _inherits(StatusBarTile, _React$Component);

  function StatusBarTile(props) {
    _classCallCheck(this, StatusBarTile);

    _get(Object.getPrototypeOf(StatusBarTile.prototype), 'constructor', this).call(this, props);
    this.state = {
      percentage: null,
      pending: false
    };
  }

  _createClass(StatusBarTile, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      (0, (_assert2 || _assert()).default)(this.subscription == null);
      this.subscription = this.props.results.subscribe(function (result) {
        return _this._consumeResult(result);
      });
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      (0, (_assert2 || _assert()).default)(this.subscription != null);
      this.subscription.unsubscribe();
      this.subscription = null;
      this.setState({ percentage: null });
    }
  }, {
    key: '_consumeResult',
    value: function _consumeResult(result) {
      switch (result.kind) {
        case 'not-text-editor':
        case 'no-provider':
        case 'provider-error':
          this.setState({ percentage: null });
          break;
        case 'pane-change':
        case 'edit':
        case 'save':
          this.setState({ pending: true });
          break;
        case 'result':
          var coverageResult = result.result;
          this.setState({
            percentage: coverageResult == null ? null : coverageResult.percentage,
            pending: false
          });
          break;
        default:
          throw new Error('Should handle kind ' + result.kind);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement((_StatusBarTileComponent2 || _StatusBarTileComponent()).StatusBarTileComponent, this.state);
    }
  }]);

  return StatusBarTile;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.StatusBarTile = StatusBarTile;