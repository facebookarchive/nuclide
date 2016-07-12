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

var _createComponentItem2;

function _createComponentItem() {
  return _createComponentItem2 = _interopRequireDefault(require('./createComponentItem'));
}

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var GadgetPlaceholder = (function (_React$Component) {
  _inherits(GadgetPlaceholder, _React$Component);

  function GadgetPlaceholder(props) {
    _classCallCheck(this, GadgetPlaceholder);

    _get(Object.getPrototypeOf(GadgetPlaceholder.prototype), 'constructor', this).call(this, props);
    this._expandedFlexScale = props && props.expandedFlexScale;
  }

  _createClass(GadgetPlaceholder, [{
    key: 'destroy',
    value: function destroy() {
      (_reactForAtom2 || _reactForAtom()).ReactDOM.unmountComponentAtNode(this.element);
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return this.props.title;
    }
  }, {
    key: 'getGadgetId',
    value: function getGadgetId() {
      return this.props.gadgetId;
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return this.props.iconName;
    }
  }, {
    key: 'getRawInitialGadgetState',
    value: function getRawInitialGadgetState() {
      return this.props.rawInitialGadgetState;
    }
  }, {
    key: 'render',
    value: function render() {
      // TODO: Make some nice placeholder? It happens so fast it may not be worth it.
      return (_reactForAtom2 || _reactForAtom()).React.createElement('div', null);
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      // Even though this is just a placeholder for a gadget, there's a chance it'll need to be
      // serialized before we replace it.
      return {
        deserializer: 'GadgetPlaceholder',
        data: {
          gadgetId: this.getGadgetId(),
          iconName: this.getIconName(),
          rawInitialGadgetState: this.getRawInitialGadgetState(),
          title: this.getTitle(),
          expandedFlexScale: this._expandedFlexScale
        }
      };
    }
  }], [{
    key: 'deserialize',
    value: function deserialize(state) {
      return (0, (_createComponentItem2 || _createComponentItem()).default)((_reactForAtom2 || _reactForAtom()).React.createElement(GadgetPlaceholder, state.data));
    }
  }]);

  return GadgetPlaceholder;
})((_reactForAtom2 || _reactForAtom()).React.Component);

module.exports = GadgetPlaceholder;