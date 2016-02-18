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

/*eslint-disable react/prop-types */

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldFBsYWNlaG9sZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21DQWFnQyx1QkFBdUI7Ozs7NEJBSWhELGdCQUFnQjs7SUFVakIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFJVixXQUpQLGlCQUFpQixDQUlULEtBQVksRUFBRTswQkFKdEIsaUJBQWlCOztBQUtuQiwrQkFMRSxpQkFBaUIsNkNBS2IsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUM7R0FDNUQ7O2VBUEcsaUJBQWlCOztXQVNkLG1CQUFHO0FBQ1IsNkJBQVMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9DOzs7V0FFTyxvQkFBVztBQUNqQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCOzs7V0FFVSx1QkFBVztBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQzVCOzs7V0FFVSx1QkFBVztBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQzVCOzs7V0FFdUIsb0NBQVc7QUFDakMsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDO0tBQ3pDOzs7V0FFSyxrQkFBa0I7O0FBRXRCLGFBQU8sOENBQU8sQ0FBQztLQUNoQjs7O1dBRVEscUJBQVc7OztBQUdsQixhQUFPO0FBQ0wsb0JBQVksRUFBRSxtQkFBbUI7QUFDakMsWUFBSSxFQUFFO0FBQ0osa0JBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQzVCLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUM1QiwrQkFBcUIsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7QUFDdEQsZUFBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDdEIsMkJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtTQUMzQztPQUNGLENBQUM7S0FDSDs7O1dBRWlCLHFCQUFDLEtBQUssRUFBRTtBQUN4QixhQUFPLHNDQUFvQixrQ0FBQyxpQkFBaUIsRUFBSyxLQUFLLENBQUMsSUFBSSxDQUFJLENBQUMsQ0FBQztLQUNuRTs7O1NBbkRHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVM7O0FBdUQvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkdhZGdldFBsYWNlaG9sZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCBjcmVhdGVDb21wb25lbnRJdGVtIGZyb20gJy4vY3JlYXRlQ29tcG9uZW50SXRlbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZ2FkZ2V0SWQ6IHN0cmluZyxcbiAgaWNvbk5hbWU6IHN0cmluZyxcbiAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiBPYmplY3QsXG4gIHRpdGxlOiBzdHJpbmcsXG4gIGV4cGFuZGVkRmxleFNjYWxlOiA/bnVtYmVyLFxufTtcblxuY2xhc3MgR2FkZ2V0UGxhY2Vob2xkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICBfZXhwYW5kZWRGbGV4U2NhbGU6ID9udW1iZXI7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2V4cGFuZGVkRmxleFNjYWxlID0gcHJvcHMgJiYgcHJvcHMuZXhwYW5kZWRGbGV4U2NhbGU7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5lbGVtZW50KTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMudGl0bGU7XG4gIH1cblxuICBnZXRHYWRnZXRJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLmdhZGdldElkO1xuICB9XG5cbiAgZ2V0SWNvbk5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5pY29uTmFtZTtcbiAgfVxuXG4gIGdldFJhd0luaXRpYWxHYWRnZXRTdGF0ZSgpOiBPYmplY3Qge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnJhd0luaXRpYWxHYWRnZXRTdGF0ZTtcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICAvLyBUT0RPOiBNYWtlIHNvbWUgbmljZSBwbGFjZWhvbGRlcj8gSXQgaGFwcGVucyBzbyBmYXN0IGl0IG1heSBub3QgYmUgd29ydGggaXQuXG4gICAgcmV0dXJuIDxkaXYgLz47XG4gIH1cblxuICBzZXJpYWxpemUoKTogT2JqZWN0IHtcbiAgICAvLyBFdmVuIHRob3VnaCB0aGlzIGlzIGp1c3QgYSBwbGFjZWhvbGRlciBmb3IgYSBnYWRnZXQsIHRoZXJlJ3MgYSBjaGFuY2UgaXQnbGwgbmVlZCB0byBiZVxuICAgIC8vIHNlcmlhbGl6ZWQgYmVmb3JlIHdlIHJlcGxhY2UgaXQuXG4gICAgcmV0dXJuIHtcbiAgICAgIGRlc2VyaWFsaXplcjogJ0dhZGdldFBsYWNlaG9sZGVyJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZ2FkZ2V0SWQ6IHRoaXMuZ2V0R2FkZ2V0SWQoKSxcbiAgICAgICAgaWNvbk5hbWU6IHRoaXMuZ2V0SWNvbk5hbWUoKSxcbiAgICAgICAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiB0aGlzLmdldFJhd0luaXRpYWxHYWRnZXRTdGF0ZSgpLFxuICAgICAgICB0aXRsZTogdGhpcy5nZXRUaXRsZSgpLFxuICAgICAgICBleHBhbmRlZEZsZXhTY2FsZTogdGhpcy5fZXhwYW5kZWRGbGV4U2NhbGUsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgZGVzZXJpYWxpemUoc3RhdGUpIHtcbiAgICByZXR1cm4gY3JlYXRlQ29tcG9uZW50SXRlbSg8R2FkZ2V0UGxhY2Vob2xkZXIgey4uLnN0YXRlLmRhdGF9IC8+KTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2FkZ2V0UGxhY2Vob2xkZXI7XG4iXX0=