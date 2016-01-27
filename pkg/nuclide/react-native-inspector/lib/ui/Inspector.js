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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWW9CLGdCQUFnQjs7b0JBQ25CLE1BQU07Ozs7eUJBQ0gscUJBQXFCOzs7O3VCQUNoQixrQkFBa0I7O0lBRXJDLFNBQVM7WUFBVCxTQUFTOztlQUFULFNBQVM7O1dBQ0ssZ0NBQWdDOzs7O0FBRXZDLFdBSFAsU0FBUyxDQUdELEtBQVksRUFBRTswQkFIdEIsU0FBUzs7QUFJWCwrQkFKRSxTQUFTLDZDQUlMLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ2xFOztlQU5HLFNBQVM7O1dBUUwsb0JBQVc7QUFDakIsYUFBTyx3QkFBd0IsQ0FBQztLQUNqQzs7O1dBRUssa0JBQWtCO0FBQ3RCLGFBQ0U7QUFDRSxhQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQUFBQztBQUN2Qyx1QkFBZSxFQUFFLElBQUksQUFBQztBQUN0QixpQkFBUyxFQUFDLHFCQUFxQjtBQUMvQix1QkFBZSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQUFBQztBQUMzQyxXQUFHLEVBQUMseUVBQXlFO1FBQzdFLENBQ0Y7S0FDSDs7O1dBRW1CLDhCQUFDLEtBQUssRUFBRTtBQUMxQixVQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDO0FBQzdCLFVBQU0sZ0JBQWdCLEdBQUcsa0JBQUssT0FBTyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMzRCxVQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNyRCxhQUFPLENBQUMsaUJBQWlCLGlDQUNPLHlCQUFXLGdCQUFnQixDQUFDLFVBQUsseUJBQVcsWUFBWSxDQUFDLFFBQ3hGLENBQUM7S0FDSDs7O1NBL0JHLFNBQVM7R0FBUyxvQkFBTSxTQUFTOztBQWtDdkMsTUFBTSxDQUFDLE9BQU8sR0FBSyxTQUFTLEFBQWUsQ0FBQyIsImZpbGUiOiJJbnNwZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0fSBmcm9tICcuLi8uLi8uLi9nYWRnZXRzLWludGVyZmFjZXMnO1xuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgV2VidmlldyBmcm9tICcuLi8uLi8uLi91aS93ZWJ2aWV3JztcbmltcG9ydCB7dG9Kc1N0cmluZ30gZnJvbSAnLi4vLi4vLi4vY29tbW9ucyc7XG5cbmNsYXNzIEluc3BlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLXJlYWN0LW5hdGl2ZS1pbnNwZWN0b3InO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkID0gdGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJ1JlYWN0IE5hdGl2ZSBJbnNwZWN0b3InO1xuICB9XG5cbiAgcmVuZGVyKCk6ID9SZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8V2Vidmlld1xuICAgICAgICBzdHlsZT17e3dpZHRoOiAnMTAwJScsIGhlaWdodDogJzEwMCUnfX1cbiAgICAgICAgbm9kZWludGVncmF0aW9uPXt0cnVlfVxuICAgICAgICBjbGFzc05hbWU9XCJuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgb25EaWRGaW5pc2hMb2FkPXt0aGlzLl9oYW5kbGVEaWRGaW5pc2hMb2FkfVxuICAgICAgICBzcmM9XCJhdG9tOi8vbnVjbGlkZS9wa2cvbnVjbGlkZS9yZWFjdC1uYXRpdmUtaW5zcGVjdG9yL2xpYi91aS9pbnNwZWN0b3IuaHRtbFwiXG4gICAgICAvPlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlRGlkRmluaXNoTG9hZChldmVudCkge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3QgcGFja2FnZURpcmVjdG9yeSA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi8nKTtcbiAgICBjb25zdCByZXF1aXJlUGF0aHMgPSByZXF1aXJlLmNhY2hlW19fZmlsZW5hbWVdLnBhdGhzO1xuICAgIGVsZW1lbnQuZXhlY3V0ZUphdmFTY3JpcHQoXG4gICAgICBgaW5pdGlhbGl6ZUVsZW1lbnRJbnNwZWN0b3IoJHt0b0pzU3RyaW5nKHBhY2thZ2VEaXJlY3RvcnkpfSwgJHt0b0pzU3RyaW5nKHJlcXVpcmVQYXRocyl9KTtgXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICgoSW5zcGVjdG9yOiBhbnkpOiBHYWRnZXQpO1xuIl19