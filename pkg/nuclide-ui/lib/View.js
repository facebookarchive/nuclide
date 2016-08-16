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
 * A React component used for rendering an item associated with a view via Atom's view registry.
 * Because we're going through Atom's ViewRegistry (which returns DOM nodes), we need to render an
 * empty element and manually attach the view (DOM element) we get from Atom.
 */

var View = (function (_React$Component) {
  _inherits(View, _React$Component);

  function View() {
    _classCallCheck(this, View);

    _get(Object.getPrototypeOf(View.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(View, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return this.props.item !== nextProps.item;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._update(this.props.item);
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this._update(this.props.item);
    }
  }, {
    key: '_update',
    value: function _update(item) {
      if (item === this._renderedItem) {
        return;
      }

      // Remove the current children.
      var container = (_reactForAtom2 || _reactForAtom()).ReactDOM.findDOMNode(this);
      while (container.lastChild != null) {
        container.removeChild(container.lastChild);
      }

      this._renderedItem = item;
      if (item == null) {
        return;
      }
      var el = atom.views.getView(item);
      container.appendChild(el);
    }
  }, {
    key: 'render',
    value: function render() {
      return (_reactForAtom2 || _reactForAtom()).React.createElement('nuclide-react-mount-root', null);
    }
  }]);

  return View;
})((_reactForAtom2 || _reactForAtom()).React.Component);

exports.View = View;