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

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _uiWebview = require('../../../ui/webview');

var _uiWebview2 = _interopRequireDefault(_uiWebview);

var _commons = require('../../../commons');

var Inspector = (function (_React$Component) {
  _inherits(Inspector, _React$Component);

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
      return _reactForAtom2['default'].createElement(_uiWebview2['default'], {
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
})(_reactForAtom2['default'].Component);

Inspector.gadgetId = 'nuclide-react-native-inspector';

module.exports = Inspector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWWtCLGdCQUFnQjs7OztvQkFDakIsTUFBTTs7Ozt5QkFDSCxxQkFBcUI7Ozs7dUJBQ2hCLGtCQUFrQjs7SUFFckMsU0FBUztZQUFULFNBQVM7O0FBRUYsV0FGUCxTQUFTLENBRUQsS0FBWSxFQUFFOzBCQUZ0QixTQUFTOztBQUdYLCtCQUhFLFNBQVMsNkNBR0wsS0FBSyxFQUFFO0FBQ2IsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDbEU7O2VBTEcsU0FBUzs7V0FPTCxvQkFBVztBQUNqQixhQUFPLHdCQUF3QixDQUFDO0tBQ2pDOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFDRTtBQUNFLGFBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxBQUFDO0FBQ3ZDLHVCQUFlLEVBQUUsSUFBSSxBQUFDO0FBQ3RCLGlCQUFTLEVBQUMscUJBQXFCO0FBQy9CLHVCQUFlLEVBQUUsSUFBSSxDQUFDLG9CQUFvQixBQUFDO0FBQzNDLFdBQUcsRUFBQyx5RUFBeUU7UUFDN0UsQ0FDRjtLQUNIOzs7V0FFbUIsOEJBQUMsS0FBSyxFQUFFO0FBQzFCLFVBQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7QUFDN0IsVUFBTSxnQkFBZ0IsR0FBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNELFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JELGFBQU8sQ0FBQyxpQkFBaUIsaUNBQ08seUJBQVcsZ0JBQWdCLENBQUMsVUFBSyx5QkFBVyxZQUFZLENBQUMsUUFDeEYsQ0FBQztLQUNIOzs7U0E5QkcsU0FBUztHQUFTLDBCQUFNLFNBQVM7O0FBa0N2QyxTQUFTLENBQUMsUUFBUSxHQUFHLGdDQUFnQyxDQUFDOztBQUV0RCxNQUFNLENBQUMsT0FBTyxHQUFLLFNBQVMsQUFBZSxDQUFDIiwiZmlsZSI6Ikluc3BlY3Rvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtHYWRnZXR9IGZyb20gJy4uLy4uLy4uL2dhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgV2VidmlldyBmcm9tICcuLi8uLi8uLi91aS93ZWJ2aWV3JztcbmltcG9ydCB7dG9Kc1N0cmluZ30gZnJvbSAnLi4vLi4vLi4vY29tbW9ucyc7XG5cbmNsYXNzIEluc3BlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IG1peGVkKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQgPSB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkLmJpbmQodGhpcyk7XG4gIH1cblxuICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVhY3QgTmF0aXZlIEluc3BlY3Rvcic7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxXZWJ2aWV3XG4gICAgICAgIHN0eWxlPXt7d2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJSd9fVxuICAgICAgICBub2RlaW50ZWdyYXRpb249e3RydWV9XG4gICAgICAgIGNsYXNzTmFtZT1cIm5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICBvbkRpZEZpbmlzaExvYWQ9e3RoaXMuX2hhbmRsZURpZEZpbmlzaExvYWR9XG4gICAgICAgIHNyYz1cImF0b206Ly9udWNsaWRlL3BrZy9udWNsaWRlL3JlYWN0LW5hdGl2ZS1pbnNwZWN0b3IvbGliL3VpL2luc3BlY3Rvci5odG1sXCJcbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVEaWRGaW5pc2hMb2FkKGV2ZW50KSB7XG4gICAgY29uc3QgZWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICBjb25zdCBwYWNrYWdlRGlyZWN0b3J5ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLycpO1xuICAgIGNvbnN0IHJlcXVpcmVQYXRocyA9IHJlcXVpcmUuY2FjaGVbX19maWxlbmFtZV0ucGF0aHM7XG4gICAgZWxlbWVudC5leGVjdXRlSmF2YVNjcmlwdChcbiAgICAgIGBpbml0aWFsaXplRWxlbWVudEluc3BlY3Rvcigke3RvSnNTdHJpbmcocGFja2FnZURpcmVjdG9yeSl9LCAke3RvSnNTdHJpbmcocmVxdWlyZVBhdGhzKX0pO2BcbiAgICApO1xuICB9XG5cbn1cblxuSW5zcGVjdG9yLmdhZGdldElkID0gJ251Y2xpZGUtcmVhY3QtbmF0aXZlLWluc3BlY3Rvcic7XG5cbm1vZHVsZS5leHBvcnRzID0gKChJbnNwZWN0b3I6IGFueSk6IEdhZGdldCk7XG4iXX0=