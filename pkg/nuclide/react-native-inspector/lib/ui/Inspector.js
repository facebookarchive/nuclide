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

var _uiWebview = require('../../../ui/webview');

var _uiWebview2 = _interopRequireDefault(_uiWebview);

var _commons = require('../../../commons');

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
      return _reactForAtom.React.createElement(_uiWebview2['default'], {
        style: { width: '100%', height: '100%' },
        nodeintegration: true,
        className: 'native-key-bindings',
        onDidFinishLoad: this._handleDidFinishLoad,
        src: 'atom://nuclide/pkg/nuclide/react-native-inspector/lib/ui/inspector.html'
      });
    }
  }, {
    key: '_handleDidFinishLoad',
    value: function _handleDidFinishLoad(event) {
      var element = event.target;
      var packageDirectory = _path2['default'].resolve(__dirname, '../../');
      var requirePaths = require.cache[__filename].paths;
      element.executeJavaScript('initializeElementInspector(' + (0, _commons.toJsString)(packageDirectory) + ', ' + (0, _commons.toJsString)(requirePaths) + ');');
    }
  }]);

  return Inspector;
})(_reactForAtom.React.Component);

module.exports = Inspector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWW9CLGdCQUFnQjs7b0JBQ25CLE1BQU07Ozs7eUJBQ0gscUJBQXFCOzs7O3VCQUNoQixrQkFBa0I7O0lBRXJDLFNBQVM7WUFBVCxTQUFTOztlQUFULFNBQVM7O1dBQ0ssZ0NBQWdDOzs7O0FBRXZDLFdBSFAsU0FBUyxDQUdELEtBQVksRUFBRTswQkFIdEIsU0FBUzs7QUFJWCwrQkFKRSxTQUFTLDZDQUlMLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDekU7O2VBTkcsU0FBUzs7V0FRTCxvQkFBVztBQUNqQixhQUFPLHdCQUF3QixDQUFDO0tBQ2pDOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFDRTtBQUNFLGFBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxBQUFDO0FBQ3ZDLHVCQUFlLEVBQUUsSUFBSSxBQUFDO0FBQ3RCLGlCQUFTLEVBQUMscUJBQXFCO0FBQy9CLHVCQUFlLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixBQUFDO0FBQzNDLFdBQUcsRUFBQyx5RUFBeUU7UUFDN0UsQ0FDRjtLQUNIOzs7V0FFbUIsOEJBQUMsS0FBSyxFQUFFO0FBQzFCLFVBQU0sT0FBTyxHQUFLLEtBQUssQ0FBQyxNQUFNLEFBQXVCLENBQUM7QUFDdEQsVUFBTSxnQkFBZ0IsR0FBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNELFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JELGFBQU8sQ0FBQyxpQkFBaUIsaUNBQ08seUJBQVcsZ0JBQWdCLENBQUMsVUFBSyx5QkFBVyxZQUFZLENBQUMsUUFDeEYsQ0FBQztLQUNIOzs7U0EvQkcsU0FBUztHQUFTLG9CQUFNLFNBQVM7O0FBa0N2QyxNQUFNLENBQUMsT0FBTyxHQUFLLFNBQVMsQUFBZSxDQUFDIiwiZmlsZSI6Ikluc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtHYWRnZXR9IGZyb20gJy4uLy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBXZWJ2aWV3IGZyb20gJy4uLy4uLy4uL3VpL3dlYnZpZXcnO1xuaW1wb3J0IHt0b0pzU3RyaW5nfSBmcm9tICcuLi8uLi8uLi9jb21tb25zJztcblxuY2xhc3MgSW5zcGVjdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIGdhZGdldElkID0gJ251Y2xpZGUtcmVhY3QtbmF0aXZlLWluc3BlY3Rvcic7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVEaWRGaW5pc2hMb2FkID0gdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1JlYWN0IE5hdGl2ZSBJbnNwZWN0b3InO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8V2Vidmlld1xuICAgICAgICBzdHlsZT17e3dpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX1cbiAgICAgICAgbm9kZWludGVncmF0aW9uPXt0cnVlfVxuICAgICAgICBjbGFzc05hbWU9XCJuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgb25EaWRGaW5pc2hMb2FkPXt0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkfVxuICAgICAgICBzcmM9XCJhdG9tOi8vbnVjbGlkZS9wa2cvbnVjbGlkZS9yZWFjdC1uYXRpdmUtaW5zcGVjdG9yL2xpYi91aS9pbnNwZWN0b3IuaHRtbFwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlRGlkRmluaXNoTG9hZChldmVudCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSAoKGV2ZW50LnRhcmdldDogYW55KTogV2Vidmlld0VsZW1lbnQpO1xuICAgIGNvbnN0IHBhY2thZ2VEaXJlY3RvcnkgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vJyk7XG4gICAgY29uc3QgcmVxdWlyZVBhdGhzID0gcmVxdWlyZS5jYWNoZVtfX2ZpbGVuYW1lXS5wYXRocztcbiAgICBlbGVtZW50LmV4ZWN1dGVKYXZhU2NyaXB0KFxuICAgICAgYGluaXRpYWxpemVFbGVtZW50SW5zcGVjdG9yKCR7dG9Kc1N0cmluZyhwYWNrYWdlRGlyZWN0b3J5KX0sICR7dG9Kc1N0cmluZyhyZXF1aXJlUGF0aHMpfSk7YFxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoKEluc3BlY3RvcjogYW55KTogR2FkZ2V0KTtcbiJdfQ==