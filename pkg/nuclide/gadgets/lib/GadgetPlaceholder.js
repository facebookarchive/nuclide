var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable react/prop-types */

var _GadgetUri = require('./GadgetUri');

var GadgetUri = _interopRequireWildcard(_GadgetUri);

var _createComponentItem = require('./createComponentItem');

var _createComponentItem2 = _interopRequireDefault(_createComponentItem);

var _reactForAtom = require('react-for-atom');

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
      _reactForAtom.ReactDOM.unmountComponentAtNode(this.element);
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
    key: 'getURI',
    value: function getURI() {
      return GadgetUri.format({ gadgetId: this.props.gadgetId });
    }
  }, {
    key: 'render',
    value: function render() {
      // TODO: Make some nice placeholder? It happens so fast it may not be worth it.
      return _reactForAtom.React.createElement('div', null);
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
      return (0, _createComponentItem2['default'])(_reactForAtom.React.createElement(GadgetPlaceholder, state.data));
    }
  }]);

  return GadgetPlaceholder;
})(_reactForAtom.React.Component);

module.exports = GadgetPlaceholder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldFBsYWNlaG9sZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBYTJCLGFBQWE7O0lBQTVCLFNBQVM7O21DQUNXLHVCQUF1Qjs7Ozs0QkFJaEQsZ0JBQWdCOztJQVVqQixpQkFBaUI7WUFBakIsaUJBQWlCOztBQUlWLFdBSlAsaUJBQWlCLENBSVQsS0FBWSxFQUFFOzBCQUp0QixpQkFBaUI7O0FBS25CLCtCQUxFLGlCQUFpQiw2Q0FLYixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztHQUM1RDs7ZUFQRyxpQkFBaUI7O1dBU2QsbUJBQUc7QUFDUiw2QkFBUyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0M7OztXQUVPLG9CQUFXO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDekI7OztXQUVVLHVCQUFXO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7S0FDNUI7OztXQUVVLHVCQUFXO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7S0FDNUI7OztXQUV1QixvQ0FBVztBQUNqQyxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUM7S0FDekM7OztXQUVLLGtCQUFHO0FBQ1AsYUFBTyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUMxRDs7O1dBRUssa0JBQWtCOztBQUV0QixhQUFPLDhDQUFPLENBQUM7S0FDaEI7OztXQUVRLHFCQUFXOzs7QUFHbEIsYUFBTztBQUNMLG9CQUFZLEVBQUUsbUJBQW1CO0FBQ2pDLFlBQUksRUFBRTtBQUNKLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUM1QixrQkFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDNUIsK0JBQXFCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ3RELGVBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3RCLDJCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDM0M7T0FDRixDQUFDO0tBQ0g7OztXQUVpQixxQkFBQyxLQUFLLEVBQUU7QUFDeEIsYUFBTyxzQ0FBb0Isa0NBQUMsaUJBQWlCLEVBQUssS0FBSyxDQUFDLElBQUksQ0FBSSxDQUFDLENBQUM7S0FDbkU7OztTQXZERyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQTJEL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJHYWRnZXRQbGFjZWhvbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgKiBhcyBHYWRnZXRVcmkgZnJvbSAnLi9HYWRnZXRVcmknO1xuaW1wb3J0IGNyZWF0ZUNvbXBvbmVudEl0ZW0gZnJvbSAnLi9jcmVhdGVDb21wb25lbnRJdGVtJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG50eXBlIFByb3BzID0ge1xuICBnYWRnZXRJZDogc3RyaW5nO1xuICBpY29uTmFtZTogc3RyaW5nO1xuICByYXdJbml0aWFsR2FkZ2V0U3RhdGU6IE9iamVjdDtcbiAgdGl0bGU6IHN0cmluZztcbiAgZXhwYW5kZWRGbGV4U2NhbGU6ID9udW1iZXI7XG59O1xuXG5jbGFzcyBHYWRnZXRQbGFjZWhvbGRlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuXG4gIF9leHBhbmRlZEZsZXhTY2FsZTogP251bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fZXhwYW5kZWRGbGV4U2NhbGUgPSBwcm9wcyAmJiBwcm9wcy5leHBhbmRlZEZsZXhTY2FsZTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLmVsZW1lbnQpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy50aXRsZTtcbiAgfVxuXG4gIGdldEdhZGdldElkKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZ2FkZ2V0SWQ7XG4gIH1cblxuICBnZXRJY29uTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmljb25OYW1lO1xuICB9XG5cbiAgZ2V0UmF3SW5pdGlhbEdhZGdldFN0YXRlKCk6IE9iamVjdCB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMucmF3SW5pdGlhbEdhZGdldFN0YXRlO1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiBHYWRnZXRVcmkuZm9ybWF0KHtnYWRnZXRJZDogdGhpcy5wcm9wcy5nYWRnZXRJZH0pO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIC8vIFRPRE86IE1ha2Ugc29tZSBuaWNlIHBsYWNlaG9sZGVyPyBJdCBoYXBwZW5zIHNvIGZhc3QgaXQgbWF5IG5vdCBiZSB3b3J0aCBpdC5cbiAgICByZXR1cm4gPGRpdiAvPjtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBPYmplY3Qge1xuICAgIC8vIEV2ZW4gdGhvdWdoIHRoaXMgaXMganVzdCBhIHBsYWNlaG9sZGVyIGZvciBhIGdhZGdldCwgdGhlcmUncyBhIGNoYW5jZSBpdCdsbCBuZWVkIHRvIGJlXG4gICAgLy8gc2VyaWFsaXplZCBiZWZvcmUgd2UgcmVwbGFjZSBpdC5cbiAgICByZXR1cm4ge1xuICAgICAgZGVzZXJpYWxpemVyOiAnR2FkZ2V0UGxhY2Vob2xkZXInLFxuICAgICAgZGF0YToge1xuICAgICAgICBnYWRnZXRJZDogdGhpcy5nZXRHYWRnZXRJZCgpLFxuICAgICAgICBpY29uTmFtZTogdGhpcy5nZXRJY29uTmFtZSgpLFxuICAgICAgICByYXdJbml0aWFsR2FkZ2V0U3RhdGU6IHRoaXMuZ2V0UmF3SW5pdGlhbEdhZGdldFN0YXRlKCksXG4gICAgICAgIHRpdGxlOiB0aGlzLmdldFRpdGxlKCksXG4gICAgICAgIGV4cGFuZGVkRmxleFNjYWxlOiB0aGlzLl9leHBhbmRlZEZsZXhTY2FsZSxcbiAgICAgIH0sXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBkZXNlcmlhbGl6ZShzdGF0ZSkge1xuICAgIHJldHVybiBjcmVhdGVDb21wb25lbnRJdGVtKDxHYWRnZXRQbGFjZWhvbGRlciB7Li4uc3RhdGUuZGF0YX0gLz4pO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHYWRnZXRQbGFjZWhvbGRlcjtcbiJdfQ==