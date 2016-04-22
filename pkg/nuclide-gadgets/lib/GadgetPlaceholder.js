var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldFBsYWNlaG9sZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OzttQ0FXZ0MsdUJBQXVCOzs7OzRCQUloRCxnQkFBZ0I7O0lBVWpCLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBTVYsV0FOUCxpQkFBaUIsQ0FNVCxLQUFZLEVBQUU7MEJBTnRCLGlCQUFpQjs7QUFPbkIsK0JBUEUsaUJBQWlCLDZDQU9iLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDO0dBQzVEOztlQVRHLGlCQUFpQjs7V0FXZCxtQkFBUztBQUNkLDZCQUFTLHNCQUFzQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUMvQzs7O1dBRU8sb0JBQVc7QUFDakIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztLQUN6Qjs7O1dBRVUsdUJBQVc7QUFDcEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUM1Qjs7O1dBRVUsdUJBQVc7QUFDcEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztLQUM1Qjs7O1dBRXVCLG9DQUFXO0FBQ2pDLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQztLQUN6Qzs7O1dBRUssa0JBQW1COztBQUV2QixhQUFPLDhDQUFPLENBQUM7S0FDaEI7OztXQUVRLHFCQUFXOzs7QUFHbEIsYUFBTztBQUNMLG9CQUFZLEVBQUUsbUJBQW1CO0FBQ2pDLFlBQUksRUFBRTtBQUNKLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUM1QixrQkFBUSxFQUFFLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDNUIsK0JBQXFCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ3RELGVBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ3RCLDJCQUFpQixFQUFFLElBQUksQ0FBQyxrQkFBa0I7U0FDM0M7T0FDRixDQUFDO0tBQ0g7OztXQUVpQixxQkFBQyxLQUFLLEVBQWU7QUFDckMsYUFBTyxzQ0FBb0Isa0NBQUMsaUJBQWlCLEVBQUssS0FBSyxDQUFDLElBQUksQ0FBSSxDQUFDLENBQUM7S0FDbkU7OztTQXJERyxpQkFBaUI7R0FBUyxvQkFBTSxTQUFTOztBQXdEL0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxpQkFBaUIsQ0FBQyIsImZpbGUiOiJHYWRnZXRQbGFjZWhvbGRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVDb21wb25lbnRJdGVtIGZyb20gJy4vY3JlYXRlQ29tcG9uZW50SXRlbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZ2FkZ2V0SWQ6IHN0cmluZztcbiAgaWNvbk5hbWU6IHN0cmluZztcbiAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiBPYmplY3Q7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGV4cGFuZGVkRmxleFNjYWxlOiA/bnVtYmVyO1xufTtcblxuY2xhc3MgR2FkZ2V0UGxhY2Vob2xkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIHByb3BzOiBQcm9wcztcblxuICBfZXhwYW5kZWRGbGV4U2NhbGU6ID9udW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2V4cGFuZGVkRmxleFNjYWxlID0gcHJvcHMgJiYgcHJvcHMuZXhwYW5kZWRGbGV4U2NhbGU7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGl0bGU7XG4gIH1cblxuICBnZXRHYWRnZXRJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmdhZGdldElkO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5pY29uTmFtZTtcbiAgfVxuXG4gIGdldFJhd0luaXRpYWxHYWRnZXRTdGF0ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJhd0luaXRpYWxHYWRnZXRTdGF0ZTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgLy8gVE9ETzogTWFrZSBzb21lIG5pY2UgcGxhY2Vob2xkZXI/IEl0IGhhcHBlbnMgc28gZmFzdCBpdCBtYXkgbm90IGJlIHdvcnRoIGl0LlxuICAgIHJldHVybiA8ZGl2IC8+O1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgLy8gRXZlbiB0aG91Z2ggdGhpcyBpcyBqdXN0IGEgcGxhY2Vob2xkZXIgZm9yIGEgZ2FkZ2V0LCB0aGVyZSdzIGEgY2hhbmNlIGl0J2xsIG5lZWQgdG8gYmVcbiAgICAvLyBzZXJpYWxpemVkIGJlZm9yZSB3ZSByZXBsYWNlIGl0LlxuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdHYWRnZXRQbGFjZWhvbGRlcicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGdhZGdldElkOiB0aGlzLmdldEdhZGdldElkKCksXG4gICAgICAgIGljb25OYW1lOiB0aGlzLmdldEljb25OYW1lKCksXG4gICAgICAgIHJhd0luaXRpYWxHYWRnZXRTdGF0ZTogdGhpcy5nZXRSYXdJbml0aWFsR2FkZ2V0U3RhdGUoKSxcbiAgICAgICAgdGl0bGU6IHRoaXMuZ2V0VGl0bGUoKSxcbiAgICAgICAgZXhwYW5kZWRGbGV4U2NhbGU6IHRoaXMuX2V4cGFuZGVkRmxleFNjYWxlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGRlc2VyaWFsaXplKHN0YXRlKTogSFRNTEVsZW1lbnQge1xuICAgIHJldHVybiBjcmVhdGVDb21wb25lbnRJdGVtKDxHYWRnZXRQbGFjZWhvbGRlciB7Li4uc3RhdGUuZGF0YX0gLz4pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2FkZ2V0UGxhY2Vob2xkZXI7XG4iXX0=