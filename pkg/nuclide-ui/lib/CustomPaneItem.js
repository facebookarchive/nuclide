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

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var CustomPaneItem = (function (_HTMLElement) {
  _inherits(CustomPaneItem, _HTMLElement);

  function CustomPaneItem() {
    _classCallCheck(this, CustomPaneItem);

    _get(Object.getPrototypeOf(CustomPaneItem.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(CustomPaneItem, [{
    key: 'initialize',
    value: function initialize(options) {
      this._title = options.title;
      this._iconName = options.iconName;
      this._uri = options.uri;
      this._allowSplit = Boolean(options.allowSplit);

      this.__component = (_reactForAtom2 || _reactForAtom()).ReactDOM.render(this.__renderPaneItem(options), this);
    }

    /**
     * Subclasses should override this method to render the pane using options passed from above.
     * This method is invoked as part of initialize(), and so, it should be safe to invoke any of the
     * getter methods on this class in this method.
     *
     * @return A React component that this element call ReactDOM.render() on.
     */
  }, {
    key: '__renderPaneItem',
    value: function __renderPaneItem(options) {
      throw new Error('Subclass should implement this method.');
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      (0, (_assert2 || _assert()).default)(this._title);
      return this._title;
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return this._iconName;
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return this._uri;
    }
  }, {
    key: 'copy',
    value: function copy() {
      return this._allowSplit;
    }
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this);
    }
  }]);

  return CustomPaneItem;
})(HTMLElement);

exports.CustomPaneItem = CustomPaneItem;