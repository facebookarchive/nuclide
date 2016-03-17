var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nuclideUiWebview = require('../../../nuclide-ui-webview');

var _nuclideUiWebview2 = _interopRequireDefault(_nuclideUiWebview);

var _nuclideCommons = require('../../../nuclide-commons');

var Inspector = (function (_React$Component) {
  _inherits(Inspector, _React$Component);

  _createClass(Inspector, null, [{
    key: 'gadgetId',
    value: 'nuclide-react-native-inspector',
    enumerable: true
  }]);

  function Inspector(props) {
    _classCallCheck(this, Inspector);

    _get(Object.getPrototypeOf(Inspector.prototype), 'constructor', this).call(this, props);
    this._handleDidFinishLoad = this._handleDidFinishLoad.bind(this);
  }

  _createClass(Inspector, [{
    key: 'getTitle',
    value: function getTitle() {
      return 'React Native Inspector';
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(_nuclideUiWebview2['default'], {
        style: { width: '100%', height: '100%' },
        nodeintegration: true,
        className: 'native-key-bindings',
        onDidFinishLoad: this._handleDidFinishLoad,
        src: 'atom://nuclide/pkg/nuclide-react-native-inspector/lib/ui/inspector.html'
      });
    }
  }, {
    key: '_handleDidFinishLoad',
    value: function _handleDidFinishLoad(event) {
      var element = event.target;
      var requirePaths = require.cache[__filename].paths;
      var inspectorDevTools = _path2['default'].join(__dirname, '../../VendorLib/dev-tools/standalone.js');
      element.executeJavaScript('initializeElementInspector(' + (0, _nuclideCommons.toJsString)(inspectorDevTools) + ', ' + (0, _nuclideCommons.toJsString)(requirePaths) + ');');
    }
  }]);

  return Inspector;
})(_reactForAtom.React.Component);

module.exports = Inspector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWW9CLGdCQUFnQjs7b0JBQ25CLE1BQU07Ozs7Z0NBQ0gsNkJBQTZCOzs7OzhCQUN4QiwwQkFBMEI7O0lBRTdDLFNBQVM7WUFBVCxTQUFTOztlQUFULFNBQVM7O1dBQ0ssZ0NBQWdDOzs7O0FBRXZDLFdBSFAsU0FBUyxDQUdELEtBQVksRUFBRTswQkFIdEIsU0FBUzs7QUFJWCwrQkFKRSxTQUFTLDZDQUlMLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekU7O2VBTkcsU0FBUzs7V0FRTCxvQkFBVztBQUNqQixhQUFPLHdCQUF3QixDQUFDO0tBQ2pDOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFDRTtBQUNFLGFBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxBQUFDO0FBQ3ZDLHVCQUFlLEVBQUUsSUFBSSxBQUFDO0FBQ3RCLGlCQUFTLEVBQUMscUJBQXFCO0FBQy9CLHVCQUFlLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixBQUFDO0FBQzNDLFdBQUcsRUFBQyx5RUFBeUU7UUFDN0UsQ0FDRjtLQUNIOzs7V0FFbUIsOEJBQUMsS0FBSyxFQUFFO0FBQzFCLFVBQU0sT0FBTyxHQUFLLEtBQUssQ0FBQyxNQUFNLEFBQXVCLENBQUM7QUFDdEQsVUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUM7QUFDckQsVUFBTSxpQkFBaUIsR0FDckIsa0JBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSx5Q0FBeUMsQ0FBQyxDQUFDO0FBQ2xFLGFBQU8sQ0FBQyxpQkFBaUIsaUNBQ08sZ0NBQVcsaUJBQWlCLENBQUMsVUFBSyxnQ0FBVyxZQUFZLENBQUMsUUFDekYsQ0FBQztLQUNIOzs7U0FoQ0csU0FBUztHQUFTLG9CQUFNLFNBQVM7O0FBbUN2QyxNQUFNLENBQUMsT0FBTyxHQUFLLFNBQVMsQUFBZSxDQUFDIiwiZmlsZSI6Ikluc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtHYWRnZXR9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtZ2FkZ2V0cy1pbnRlcmZhY2VzJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IFdlYnZpZXcgZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS11aS13ZWJ2aWV3JztcbmltcG9ydCB7dG9Kc1N0cmluZ30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuY2xhc3MgSW5zcGVjdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtcmVhY3QtbmF0aXZlLWluc3BlY3Rvcic7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVEaWRGaW5pc2hMb2FkID0gdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1JlYWN0IE5hdGl2ZSBJbnNwZWN0b3InO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8V2Vidmlld1xuICAgICAgICBzdHlsZT17e3dpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX1cbiAgICAgICAgbm9kZWludGVncmF0aW9uPXt0cnVlfVxuICAgICAgICBjbGFzc05hbWU9XCJuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgb25EaWRGaW5pc2hMb2FkPXt0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkfVxuICAgICAgICBzcmM9XCJhdG9tOi8vbnVjbGlkZS9wa2cvbnVjbGlkZS1yZWFjdC1uYXRpdmUtaW5zcGVjdG9yL2xpYi91aS9pbnNwZWN0b3IuaHRtbFwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlRGlkRmluaXNoTG9hZChldmVudCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSAoKGV2ZW50LnRhcmdldDogYW55KTogV2Vidmlld0VsZW1lbnQpO1xuICAgIGNvbnN0IHJlcXVpcmVQYXRocyA9IHJlcXVpcmUuY2FjaGVbX19maWxlbmFtZV0ucGF0aHM7XG4gICAgY29uc3QgaW5zcGVjdG9yRGV2VG9vbHMgPVxuICAgICAgcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uLy4uL1ZlbmRvckxpYi9kZXYtdG9vbHMvc3RhbmRhbG9uZS5qcycpO1xuICAgIGVsZW1lbnQuZXhlY3V0ZUphdmFTY3JpcHQoXG4gICAgICBgaW5pdGlhbGl6ZUVsZW1lbnRJbnNwZWN0b3IoJHt0b0pzU3RyaW5nKGluc3BlY3RvckRldlRvb2xzKX0sICR7dG9Kc1N0cmluZyhyZXF1aXJlUGF0aHMpfSk7YFxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoKEluc3BlY3RvcjogYW55KTogR2FkZ2V0KTtcbiJdfQ==