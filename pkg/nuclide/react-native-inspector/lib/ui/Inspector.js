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

var _commons = require('../../../commons');

var Inspector = (function (_React$Component) {
  _inherits(Inspector, _React$Component);

  function Inspector() {
    _classCallCheck(this, Inspector);

    _get(Object.getPrototypeOf(Inspector.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(Inspector, [{
    key: 'getTitle',
    value: function getTitle() {
      return 'React Native Inspector';
    }
  }, {
    key: 'render',
    value: function render() {
      return _reactForAtom2['default'].createElement('div', { style: { width: '100%', height: '100%' } });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // TODO: We create the webview element by hand here because React 0.13 doesn't support custom
      //       attributes (and we need the `nodeintegration` attribute). When we upgrade to 0.14,
      //       change this.
      var el = _reactForAtom2['default'].findDOMNode(this);
      var webview = document.createElement('webview');
      webview.style.width = '100%';
      webview.style.height = '100%';
      webview.nodeintegration = true;
      webview.className = 'native-key-bindings';
      webview.addEventListener('did-finish-load', function () {
        var packageDirectory = _path2['default'].resolve(__dirname, '../../');
        var requirePaths = require.cache[__filename].paths;
        webview.executeJavaScript('initializeElementInspector(' + (0, _commons.toJsString)(packageDirectory) + ', ' + (0, _commons.toJsString)(requirePaths) + ');');
      });
      webview.src = 'atom://nuclide/pkg/nuclide/react-native-inspector/lib/ui/inspector.html';
      el.appendChild(webview);
    }
  }]);

  return Inspector;
})(_reactForAtom2['default'].Component);

Inspector.gadgetId = 'nuclide-react-native-inspector';

module.exports = Inspector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWWtCLGdCQUFnQjs7OztvQkFDakIsTUFBTTs7Ozt1QkFDRSxrQkFBa0I7O0lBRXJDLFNBQVM7WUFBVCxTQUFTOztXQUFULFNBQVM7MEJBQVQsU0FBUzs7K0JBQVQsU0FBUzs7O2VBQVQsU0FBUzs7V0FFTCxvQkFBVztBQUNqQixhQUFPLHdCQUF3QixDQUFDO0tBQ2pDOzs7V0FFSyxrQkFBa0I7QUFDdEIsYUFBTyxpREFBSyxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQUFBQyxHQUFHLENBQUM7S0FDeEQ7OztXQUVnQiw2QkFBRzs7OztBQUlsQixVQUFNLEVBQUUsR0FBRywwQkFBTSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkMsVUFBTSxPQUFPLEdBQUssUUFBUSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQUFBdUIsQ0FBQztBQUMzRSxhQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUM7QUFDN0IsYUFBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQzlCLGFBQU8sQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQy9CLGFBQU8sQ0FBQyxTQUFTLEdBQUcscUJBQXFCLENBQUM7QUFDMUMsYUFBTyxDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixFQUFFLFlBQU07QUFDaEQsWUFBTSxnQkFBZ0IsR0FBRyxrQkFBSyxPQUFPLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNELFlBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JELGVBQU8sQ0FBQyxpQkFBaUIsaUNBQ08seUJBQVcsZ0JBQWdCLENBQUMsVUFBSyx5QkFBVyxZQUFZLENBQUMsUUFDeEYsQ0FBQztPQUNILENBQUMsQ0FBQztBQUNILGFBQU8sQ0FBQyxHQUFHLEdBQUcseUVBQXlFLENBQUM7QUFDeEYsUUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUN6Qjs7O1NBN0JHLFNBQVM7R0FBUywwQkFBTSxTQUFTOztBQWlDdkMsU0FBUyxDQUFDLFFBQVEsR0FBRyxnQ0FBZ0MsQ0FBQzs7QUFFdEQsTUFBTSxDQUFDLE9BQU8sR0FBSyxTQUFTLEFBQWUsQ0FBQyIsImZpbGUiOiJJbnNwZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0fSBmcm9tICcuLi8uLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHt0b0pzU3RyaW5nfSBmcm9tICcuLi8uLi8uLi9jb21tb25zJztcblxuY2xhc3MgSW5zcGVjdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBnZXRUaXRsZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiAnUmVhY3QgTmF0aXZlIEluc3BlY3Rvcic7XG4gIH1cblxuICByZW5kZXIoKTogP1JlYWN0RWxlbWVudCB7XG4gICAgcmV0dXJuIDxkaXYgc3R5bGU9e3t3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJ319IC8+O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gVE9ETzogV2UgY3JlYXRlIHRoZSB3ZWJ2aWV3IGVsZW1lbnQgYnkgaGFuZCBoZXJlIGJlY2F1c2UgUmVhY3QgMC4xMyBkb2Vzbid0IHN1cHBvcnQgY3VzdG9tXG4gICAgLy8gICAgICAgYXR0cmlidXRlcyAoYW5kIHdlIG5lZWQgdGhlIGBub2RlaW50ZWdyYXRpb25gIGF0dHJpYnV0ZSkuIFdoZW4gd2UgdXBncmFkZSB0byAwLjE0LFxuICAgIC8vICAgICAgIGNoYW5nZSB0aGlzLlxuICAgIGNvbnN0IGVsID0gUmVhY3QuZmluZERPTU5vZGUodGhpcyk7XG4gICAgY29uc3Qgd2VidmlldyA9ICgoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnd2VidmlldycpOiBhbnkpOiBXZWJ2aWV3RWxlbWVudCk7XG4gICAgd2Vidmlldy5zdHlsZS53aWR0aCA9ICcxMDAlJztcbiAgICB3ZWJ2aWV3LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB3ZWJ2aWV3Lm5vZGVpbnRlZ3JhdGlvbiA9IHRydWU7XG4gICAgd2Vidmlldy5jbGFzc05hbWUgPSAnbmF0aXZlLWtleS1iaW5kaW5ncyc7XG4gICAgd2Vidmlldy5hZGRFdmVudExpc3RlbmVyKCdkaWQtZmluaXNoLWxvYWQnLCAoKSA9PiB7XG4gICAgICBjb25zdCBwYWNrYWdlRGlyZWN0b3J5ID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uLycpO1xuICAgICAgY29uc3QgcmVxdWlyZVBhdGhzID0gcmVxdWlyZS5jYWNoZVtfX2ZpbGVuYW1lXS5wYXRocztcbiAgICAgIHdlYnZpZXcuZXhlY3V0ZUphdmFTY3JpcHQoXG4gICAgICAgIGBpbml0aWFsaXplRWxlbWVudEluc3BlY3Rvcigke3RvSnNTdHJpbmcocGFja2FnZURpcmVjdG9yeSl9LCAke3RvSnNTdHJpbmcocmVxdWlyZVBhdGhzKX0pO2BcbiAgICAgICk7XG4gICAgfSk7XG4gICAgd2Vidmlldy5zcmMgPSAnYXRvbTovL251Y2xpZGUvcGtnL251Y2xpZGUvcmVhY3QtbmF0aXZlLWluc3BlY3Rvci9saWIvdWkvaW5zcGVjdG9yLmh0bWwnO1xuICAgIGVsLmFwcGVuZENoaWxkKHdlYnZpZXcpO1xuICB9XG5cbn1cblxuSW5zcGVjdG9yLmdhZGdldElkID0gJ251Y2xpZGUtcmVhY3QtbmF0aXZlLWluc3BlY3Rvcic7XG5cbm1vZHVsZS5leHBvcnRzID0gKChJbnNwZWN0b3I6IGFueSk6IEdhZGdldCk7XG4iXX0=