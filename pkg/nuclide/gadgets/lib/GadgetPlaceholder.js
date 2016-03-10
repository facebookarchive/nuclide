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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkdhZGdldFBsYWNlaG9sZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O21DQWFnQyx1QkFBdUI7Ozs7NEJBSWhELGdCQUFnQjs7SUFVakIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFLVixXQUxQLGlCQUFpQixDQUtULEtBQVksRUFBRTswQkFMdEIsaUJBQWlCOztBQU1uQiwrQkFORSxpQkFBaUIsNkNBTWIsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLGtCQUFrQixHQUFHLEtBQUssSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUM7R0FDNUQ7O2VBUkcsaUJBQWlCOztXQVVkLG1CQUFHO0FBQ1IsNkJBQVMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQy9DOzs7V0FFTyxvQkFBVztBQUNqQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO0tBQ3pCOzs7V0FFVSx1QkFBVztBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQzVCOzs7V0FFVSx1QkFBVztBQUNwQixhQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDO0tBQzVCOzs7V0FFdUIsb0NBQVc7QUFDakMsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDO0tBQ3pDOzs7V0FFSyxrQkFBa0I7O0FBRXRCLGFBQU8sOENBQU8sQ0FBQztLQUNoQjs7O1dBRVEscUJBQVc7OztBQUdsQixhQUFPO0FBQ0wsb0JBQVksRUFBRSxtQkFBbUI7QUFDakMsWUFBSSxFQUFFO0FBQ0osa0JBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQzVCLGtCQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUM1QiwrQkFBcUIsRUFBRSxJQUFJLENBQUMsd0JBQXdCLEVBQUU7QUFDdEQsZUFBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDdEIsMkJBQWlCLEVBQUUsSUFBSSxDQUFDLGtCQUFrQjtTQUMzQztPQUNGLENBQUM7S0FDSDs7O1dBRWlCLHFCQUFDLEtBQUssRUFBRTtBQUN4QixhQUFPLHNDQUFvQixrQ0FBQyxpQkFBaUIsRUFBSyxLQUFLLENBQUMsSUFBSSxDQUFJLENBQUMsQ0FBQztLQUNuRTs7O1NBcERHLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVM7O0FBd0QvQyxNQUFNLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDIiwiZmlsZSI6IkdhZGdldFBsYWNlaG9sZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyplc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCBjcmVhdGVDb21wb25lbnRJdGVtIGZyb20gJy4vY3JlYXRlQ29tcG9uZW50SXRlbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgZ2FkZ2V0SWQ6IHN0cmluZztcbiAgaWNvbk5hbWU6IHN0cmluZztcbiAgcmF3SW5pdGlhbEdhZGdldFN0YXRlOiBPYmplY3Q7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGV4cGFuZGVkRmxleFNjYWxlOiA/bnVtYmVyO1xufTtcblxuY2xhc3MgR2FkZ2V0UGxhY2Vob2xkZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHMsIHZvaWQ+IHtcblxuICBlbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX2V4cGFuZGVkRmxleFNjYWxlOiA/bnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9leHBhbmRlZEZsZXhTY2FsZSA9IHByb3BzICYmIHByb3BzLmV4cGFuZGVkRmxleFNjYWxlO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuZWxlbWVudCk7XG4gIH1cblxuICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByb3BzLnRpdGxlO1xuICB9XG5cbiAgZ2V0R2FkZ2V0SWQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5nYWRnZXRJZDtcbiAgfVxuXG4gIGdldEljb25OYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuaWNvbk5hbWU7XG4gIH1cblxuICBnZXRSYXdJbml0aWFsR2FkZ2V0U3RhdGUoKTogT2JqZWN0IHtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5yYXdJbml0aWFsR2FkZ2V0U3RhdGU7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETzogTWFrZSBzb21lIG5pY2UgcGxhY2Vob2xkZXI/IEl0IGhhcHBlbnMgc28gZmFzdCBpdCBtYXkgbm90IGJlIHdvcnRoIGl0LlxuICAgIHJldHVybiA8ZGl2IC8+O1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IE9iamVjdCB7XG4gICAgLy8gRXZlbiB0aG91Z2ggdGhpcyBpcyBqdXN0IGEgcGxhY2Vob2xkZXIgZm9yIGEgZ2FkZ2V0LCB0aGVyZSdzIGEgY2hhbmNlIGl0J2xsIG5lZWQgdG8gYmVcbiAgICAvLyBzZXJpYWxpemVkIGJlZm9yZSB3ZSByZXBsYWNlIGl0LlxuICAgIHJldHVybiB7XG4gICAgICBkZXNlcmlhbGl6ZXI6ICdHYWRnZXRQbGFjZWhvbGRlcicsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGdhZGdldElkOiB0aGlzLmdldEdhZGdldElkKCksXG4gICAgICAgIGljb25OYW1lOiB0aGlzLmdldEljb25OYW1lKCksXG4gICAgICAgIHJhd0luaXRpYWxHYWRnZXRTdGF0ZTogdGhpcy5nZXRSYXdJbml0aWFsR2FkZ2V0U3RhdGUoKSxcbiAgICAgICAgdGl0bGU6IHRoaXMuZ2V0VGl0bGUoKSxcbiAgICAgICAgZXhwYW5kZWRGbGV4U2NhbGU6IHRoaXMuX2V4cGFuZGVkRmxleFNjYWxlLFxuICAgICAgfSxcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGRlc2VyaWFsaXplKHN0YXRlKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUNvbXBvbmVudEl0ZW0oPEdhZGdldFBsYWNlaG9sZGVyIHsuLi5zdGF0ZS5kYXRhfSAvPik7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhZGdldFBsYWNlaG9sZGVyO1xuIl19