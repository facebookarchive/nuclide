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
      _reactForAtom.React.unmountComponentAtNode(this.element);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldFBsYWNlaG9sZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBYTJCLGFBQWE7O0lBQTVCLFNBQVM7O21DQUNXLHVCQUF1Qjs7Ozs0QkFDbkMsZ0JBQWdCOztJQVU5QixpQkFBaUI7WUFBakIsaUJBQWlCOztBQUlWLFdBSlAsaUJBQWlCLENBSVQsS0FBWSxFQUFFOzBCQUp0QixpQkFBaUI7O0FBS25CLCtCQUxFLGlCQUFpQiw2Q0FLYixLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztHQUM1RDs7ZUFQRyxpQkFBaUI7O1dBU2QsbUJBQUc7QUFDUiwwQkFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDNUM7OztXQUVPLG9CQUFXO0FBQ2pCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7S0FDekI7OztXQUVVLHVCQUFXO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7S0FDNUI7OztXQUVVLHVCQUFXO0FBQ3BCLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7S0FDNUI7OztXQUV1QixvQ0FBVztBQUNqQyxhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUM7S0FDekM7OztXQUVLLGtCQUFHO0FBQ1AsYUFBTyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUMxRDs7O1dBRUssa0JBQWtCOztBQUV0QixhQUFPLDhDQUFPLENBQUM7S0FDaEI7OztXQUVRLHFCQUFXOzs7QUFHbEIsYUFBTztBQUNMLG9CQUFZLEVBQUUsbUJBQW1CO0FBQ2pDLFlBQUksRUFBRTtBQUNKLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUM1QixrQkFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDNUIsK0JBQXFCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ3RELGVBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3RCLDJCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDM0M7T0FDRixDQUFDO0tBQ0g7OztXQUVpQixxQkFBQyxLQUFLLEVBQUU7QUFDeEIsYUFBTyxzQ0FBb0Isa0NBQUMsaUJBQWlCLEVBQUssS0FBSyxDQUFDLElBQUksQ0FBSSxDQUFDLENBQUM7S0FDbkU7OztTQXZERyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQTJEL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJHYWRnZXRQbGFjZWhvbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuXG5pbXBvcnQgKiBhcyBHYWRnZXRVcmkgZnJvbSAnLi9HYWRnZXRVcmknO1xuaW1wb3J0IGNyZWF0ZUNvbXBvbmVudEl0ZW0gZnJvbSAnLi9jcmVhdGVDb21wb25lbnRJdGVtJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZ2FkZ2V0SWQ6IHN0cmluZztcbiAgaWNvbk5hbWU6IHN0cmluZztcbiAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiBPYmplY3Q7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGV4cGFuZGVkRmxleFNjYWxlOiA/bnVtYmVyO1xufTtcblxuY2xhc3MgR2FkZ2V0UGxhY2Vob2xkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICBfZXhwYW5kZWRGbGV4U2NhbGU6ID9udW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2V4cGFuZGVkRmxleFNjYWxlID0gcHJvcHMgJiYgcHJvcHMuZXhwYW5kZWRGbGV4U2NhbGU7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGl0bGU7XG4gIH1cblxuICBnZXRHYWRnZXRJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmdhZGdldElkO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5pY29uTmFtZTtcbiAgfVxuXG4gIGdldFJhd0luaXRpYWxHYWRnZXRTdGF0ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJhd0luaXRpYWxHYWRnZXRTdGF0ZTtcbiAgfVxuXG4gIGdldFVSSSgpIHtcbiAgICByZXR1cm4gR2FkZ2V0VXJpLmZvcm1hdCh7Z2FkZ2V0SWQ6IHRoaXMucHJvcHMuZ2FkZ2V0SWR9KTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPOiBNYWtlIHNvbWUgbmljZSBwbGFjZWhvbGRlcj8gSXQgaGFwcGVucyBzbyBmYXN0IGl0IG1heSBub3QgYmUgd29ydGggaXQuXG4gICAgcmV0dXJuIDxkaXYgLz47XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICAvLyBFdmVuIHRob3VnaCB0aGlzIGlzIGp1c3QgYSBwbGFjZWhvbGRlciBmb3IgYSBnYWRnZXQsIHRoZXJlJ3MgYSBjaGFuY2UgaXQnbGwgbmVlZCB0byBiZVxuICAgIC8vIHNlcmlhbGl6ZWQgYmVmb3JlIHdlIHJlcGxhY2UgaXQuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ0dhZGdldFBsYWNlaG9sZGVyJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZ2FkZ2V0SWQ6IHRoaXMuZ2V0R2FkZ2V0SWQoKSxcbiAgICAgICAgaWNvbk5hbWU6IHRoaXMuZ2V0SWNvbk5hbWUoKSxcbiAgICAgICAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiB0aGlzLmdldFJhd0luaXRpYWxHYWRnZXRTdGF0ZSgpLFxuICAgICAgICB0aXRsZTogdGhpcy5nZXRUaXRsZSgpLFxuICAgICAgICBleHBhbmRlZEZsZXhTY2FsZTogdGhpcy5fZXhwYW5kZWRGbGV4U2NhbGUsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZGVzZXJpYWxpemUoc3RhdGUpIHtcbiAgICByZXR1cm4gY3JlYXRlQ29tcG9uZW50SXRlbSg8R2FkZ2V0UGxhY2Vob2xkZXIgey4uLnN0YXRlLmRhdGF9IC8+KTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2FkZ2V0UGxhY2Vob2xkZXI7XG4iXX0=