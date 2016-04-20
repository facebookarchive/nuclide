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

var _nuclideUiLibWebview = require('../../../nuclide-ui/lib/Webview');

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
      return _reactForAtom.React.createElement(_nuclideUiLibWebview.Webview, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWW9CLGdCQUFnQjs7b0JBQ25CLE1BQU07Ozs7bUNBQ0QsaUNBQWlDOzs4QkFDOUIsMEJBQTBCOztJQUU3QyxTQUFTO1lBQVQsU0FBUzs7ZUFBVCxTQUFTOztXQUNLLGdDQUFnQzs7OztBQUV2QyxXQUhQLFNBQVMsQ0FHRCxLQUFZLEVBQUU7MEJBSHRCLFNBQVM7O0FBSVgsK0JBSkUsU0FBUyw2Q0FJTCxLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3pFOztlQU5HLFNBQVM7O1dBUUwsb0JBQVc7QUFDakIsYUFBTyx3QkFBd0IsQ0FBQztLQUNqQzs7O1dBRUssa0JBQW1CO0FBQ3ZCLGFBQ0U7QUFDRSxhQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQUFBQztBQUN2Qyx1QkFBZSxFQUFFLElBQUksQUFBQztBQUN0QixpQkFBUyxFQUFDLHFCQUFxQjtBQUMvQix1QkFBZSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQUFBQztBQUMzQyxXQUFHLEVBQUMseUVBQXlFO1FBQzdFLENBQ0Y7S0FDSDs7O1dBRW1CLDhCQUFDLEtBQUssRUFBRTtBQUMxQixVQUFNLE9BQU8sR0FBSyxLQUFLLENBQUMsTUFBTSxBQUF1QixDQUFDO0FBQ3RELFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JELFVBQU0saUJBQWlCLEdBQ3JCLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUseUNBQXlDLENBQUMsQ0FBQztBQUNsRSxhQUFPLENBQUMsaUJBQWlCLGlDQUNPLGdDQUFXLGlCQUFpQixDQUFDLFVBQUssZ0NBQVcsWUFBWSxDQUFDLFFBQ3pGLENBQUM7S0FDSDs7O1NBaENHLFNBQVM7R0FBUyxvQkFBTSxTQUFTOztBQW1DdkMsTUFBTSxDQUFDLE9BQU8sR0FBSyxTQUFTLEFBQWUsQ0FBQyIsImZpbGUiOiJJbnNwZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0fSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWdhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7V2Vidmlld30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvV2Vidmlldyc7XG5pbXBvcnQge3RvSnNTdHJpbmd9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmNsYXNzIEluc3BlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLXJlYWN0LW5hdGl2ZS1pbnNwZWN0b3InO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRGlkRmluaXNoTG9hZCA9IHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdSZWFjdCBOYXRpdmUgSW5zcGVjdG9yJztcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3QuRWxlbWVudCB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxXZWJ2aWV3XG4gICAgICAgIHN0eWxlPXt7d2lkdGg6ICcxMDAlJywgaGVpZ2h0OiAnMTAwJSd9fVxuICAgICAgICBub2RlaW50ZWdyYXRpb249e3RydWV9XG4gICAgICAgIGNsYXNzTmFtZT1cIm5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICBvbkRpZEZpbmlzaExvYWQ9e3RoaXMuX2hhbmRsZURpZEZpbmlzaExvYWR9XG4gICAgICAgIHNyYz1cImF0b206Ly9udWNsaWRlL3BrZy9udWNsaWRlLXJlYWN0LW5hdGl2ZS1pbnNwZWN0b3IvbGliL3VpL2luc3BlY3Rvci5odG1sXCJcbiAgICAgIC8+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVEaWRGaW5pc2hMb2FkKGV2ZW50KSB7XG4gICAgY29uc3QgZWxlbWVudCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBXZWJ2aWV3RWxlbWVudCk7XG4gICAgY29uc3QgcmVxdWlyZVBhdGhzID0gcmVxdWlyZS5jYWNoZVtfX2ZpbGVuYW1lXS5wYXRocztcbiAgICBjb25zdCBpbnNwZWN0b3JEZXZUb29scyA9XG4gICAgICBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vLi4vVmVuZG9yTGliL2Rldi10b29scy9zdGFuZGFsb25lLmpzJyk7XG4gICAgZWxlbWVudC5leGVjdXRlSmF2YVNjcmlwdChcbiAgICAgIGBpbml0aWFsaXplRWxlbWVudEluc3BlY3Rvcigke3RvSnNTdHJpbmcoaW5zcGVjdG9yRGV2VG9vbHMpfSwgJHt0b0pzU3RyaW5nKHJlcXVpcmVQYXRocyl9KTtgXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICgoSW5zcGVjdG9yOiBhbnkpOiBHYWRnZXQpO1xuIl19