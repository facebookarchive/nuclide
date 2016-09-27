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
 * Renders a single React element into a different part of the DOM. This allows you to maintain the
 * declarative nature of React components.
 */

var Portal = (function (_React$Component) {
  _inherits(Portal, _React$Component);

  function Portal() {
    _classCallCheck(this, Portal);

    _get(Object.getPrototypeOf(Portal.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Portal, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Do the initial render.
      this._render(this.props.children, this.props.container);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._render(null, this.props.container);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._render(this.props.children, this.props.container);
    }
  }, {
    key: '_render',
    value: function _render(element, container) {
      if (this._container != null && (container !== this._container || element == null)) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this._container);
      }

      if (element != null) {
        (_reactForAtom2 || _reactForAtom()).ReactDOM.render((_reactForAtom2 || _reactForAtom()).React.Children.only(element), container);
      }

      this._container = container;
      this._renderedChildren = element;
    }
  }, {
    key: 'render',
    value: function render() {
      // Don't actually render anything here.
      return null;
    }
  }]);

  return Portal;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.Portal = Portal;

// Must be a single React element. We do this (instead of wrapping in this component) to provide
// maximum control to the owner.