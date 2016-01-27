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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _reactForAtom = require('react-for-atom');

var NuclideCustomPaneItem = (function (_HTMLElement) {
  _inherits(NuclideCustomPaneItem, _HTMLElement);

  function NuclideCustomPaneItem() {
    _classCallCheck(this, NuclideCustomPaneItem);

    _get(Object.getPrototypeOf(NuclideCustomPaneItem.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(NuclideCustomPaneItem, [{
    key: 'initialize',
    value: function initialize(options) {
      this._title = options.title;
      this._iconName = options.iconName;
      this._uri = options.uri;
      this._allowSplit = !!options.allowSplit;

      var component = this.__renderPaneItem(options);
      _reactForAtom.React.render(component, this);
    }

    /**
     * Subclasses should override this method to render the pane using options passed from above.
     * This method is invoked as part of initialize(), and so, it should be safe to invoke any of the
     * getter methods on this class in this method.
     *
     * @return A React component that this element call React.render() on.
     */
  }, {
    key: '__renderPaneItem',
    value: function __renderPaneItem(options) {
      throw new Error('Subclass should implement this method.');
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      (0, _assert2['default'])(this._title);
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
      _reactForAtom.React.unmountComponentAtNode(this);
    }
  }]);

  return NuclideCustomPaneItem;
})(HTMLElement);

module.exports = NuclideCustomPaneItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk51Y2xpZGVDdXN0b21QYW5lSXRlbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBV3NCLFFBQVE7Ozs7NEJBQ1YsZ0JBQWdCOztJQUk5QixxQkFBcUI7WUFBckIscUJBQXFCOztXQUFyQixxQkFBcUI7MEJBQXJCLHFCQUFxQjs7K0JBQXJCLHFCQUFxQjs7O2VBQXJCLHFCQUFxQjs7V0FPZixvQkFBQyxPQUFxQyxFQUFFO0FBQ2hELFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUM1QixVQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDbEMsVUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7O0FBRXhDLFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqRCwwQkFBTSxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9COzs7Ozs7Ozs7OztXQVNlLDBCQUFDLE9BQXFDLEVBQWdCO0FBQ3BFLFlBQU0sSUFBSSxLQUFLLENBQUMsd0NBQXdDLENBQUMsQ0FBQztLQUMzRDs7O1dBRU8sb0JBQVc7QUFDakIsK0JBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztLQUNwQjs7O1dBRVUsdUJBQVk7QUFDckIsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0tBQ3ZCOzs7V0FFSyxrQkFBWTtBQUNoQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7S0FDbEI7OztXQUVHLGdCQUFZO0FBQ2QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0tBQ3pCOzs7V0FFZSw0QkFBRztBQUNqQiwwQkFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNwQzs7O1NBL0NHLHFCQUFxQjtHQUFTLFdBQVc7O0FBa0QvQyxNQUFNLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDIiwiZmlsZSI6Ik51Y2xpZGVDdXN0b21QYW5lSXRlbS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IHR5cGUge051Y2xpZGVDdXN0b21QYW5lSXRlbU9wdGlvbnN9IGZyb20gJy4vdHlwZXMnO1xuXG5jbGFzcyBOdWNsaWRlQ3VzdG9tUGFuZUl0ZW0gZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG5cbiAgX3RpdGxlOiA/c3RyaW5nO1xuICBfaWNvbk5hbWU6ID9zdHJpbmc7XG4gIF91cmk6ID9zdHJpbmc7XG4gIF9hbGxvd1NwbGl0OiBib29sZWFuO1xuXG4gIGluaXRpYWxpemUob3B0aW9uczogTnVjbGlkZUN1c3RvbVBhbmVJdGVtT3B0aW9ucykge1xuICAgIHRoaXMuX3RpdGxlID0gb3B0aW9ucy50aXRsZTtcbiAgICB0aGlzLl9pY29uTmFtZSA9IG9wdGlvbnMuaWNvbk5hbWU7XG4gICAgdGhpcy5fdXJpID0gb3B0aW9ucy51cmk7XG4gICAgdGhpcy5fYWxsb3dTcGxpdCA9ICEhb3B0aW9ucy5hbGxvd1NwbGl0O1xuXG4gICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5fX3JlbmRlclBhbmVJdGVtKG9wdGlvbnMpO1xuICAgIFJlYWN0LnJlbmRlcihjb21wb25lbnQsIHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN1YmNsYXNzZXMgc2hvdWxkIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHJlbmRlciB0aGUgcGFuZSB1c2luZyBvcHRpb25zIHBhc3NlZCBmcm9tIGFib3ZlLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBpbnZva2VkIGFzIHBhcnQgb2YgaW5pdGlhbGl6ZSgpLCBhbmQgc28sIGl0IHNob3VsZCBiZSBzYWZlIHRvIGludm9rZSBhbnkgb2YgdGhlXG4gICAqIGdldHRlciBtZXRob2RzIG9uIHRoaXMgY2xhc3MgaW4gdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEByZXR1cm4gQSBSZWFjdCBjb21wb25lbnQgdGhhdCB0aGlzIGVsZW1lbnQgY2FsbCBSZWFjdC5yZW5kZXIoKSBvbi5cbiAgICovXG4gIF9fcmVuZGVyUGFuZUl0ZW0ob3B0aW9uczogTnVjbGlkZUN1c3RvbVBhbmVJdGVtT3B0aW9ucyk6IFJlYWN0RWxlbWVudCB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdTdWJjbGFzcyBzaG91bGQgaW1wbGVtZW50IHRoaXMgbWV0aG9kLicpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICBpbnZhcmlhbnQodGhpcy5fdGl0bGUpO1xuICAgIHJldHVybiB0aGlzLl90aXRsZTtcbiAgfVxuXG4gIGdldEljb25OYW1lKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9pY29uTmFtZTtcbiAgfVxuXG4gIGdldFVSSSgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fdXJpO1xuICB9XG5cbiAgY29weSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fYWxsb3dTcGxpdDtcbiAgfVxuXG4gIGRldGFjaGVkQ2FsbGJhY2soKSB7XG4gICAgUmVhY3QudW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE51Y2xpZGVDdXN0b21QYW5lSXRlbTtcbiJdfQ==