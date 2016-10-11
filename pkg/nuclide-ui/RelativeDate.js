Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom;

function _load_reactForAtom() {
  return _reactForAtom = require('react-for-atom');
}

var _commonsNodeString;

function _load_commonsNodeString() {
  return _commonsNodeString = require('../commons-node/string');
}

var DEFAULT_RERENDER_DELAY = 10000; // ms

/**
 * Renders a relative date that forces a re-render every `delay` ms,
 * in order to properly update the UI.
 *
 * Does not respond to changes to the initial `delay` for simplicity's sake.
 */

var Revision = (function (_React$Component) {
  _inherits(Revision, _React$Component);

  function Revision() {
    _classCallCheck(this, Revision);

    _get(Object.getPrototypeOf(Revision.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Revision, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this = this;

      var delay = this.props.delay;

      this._interval = setInterval(function () {
        return _this.forceUpdate();
      }, delay);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._interval != null) {
        clearInterval(this._interval);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var date = _props.date;

      var remainingProps = _objectWithoutProperties(_props, ['date']);

      return (_reactForAtom || _load_reactForAtom()).React.createElement(
        'span',
        remainingProps,
        (0, (_commonsNodeString || _load_commonsNodeString()).relativeDate)(date)
      );
    }
  }], [{
    key: 'defaultProps',
    value: {
      delay: DEFAULT_RERENDER_DELAY
    },
    enumerable: true
  }]);

  return Revision;
})((_reactForAtom || _load_reactForAtom()).React.Component);

exports.default = Revision;
module.exports = exports.default;