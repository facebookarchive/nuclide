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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3BlY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBWW9CLGdCQUFnQjs7b0JBQ25CLE1BQU07Ozs7bUNBQ0QsaUNBQWlDOzs4QkFDOUIsMEJBQTBCOztJQUU3QyxTQUFTO1lBQVQsU0FBUzs7ZUFBVCxTQUFTOztXQUNLLGdDQUFnQzs7OztBQUV2QyxXQUhQLFNBQVMsQ0FHRCxLQUFZLEVBQUU7MEJBSHRCLFNBQVM7O0FBSVgsK0JBSkUsU0FBUyw2Q0FJTCxLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3pFOztlQU5HLFNBQVM7O1dBUUwsb0JBQVc7QUFDakIsYUFBTyx3QkFBd0IsQ0FBQztLQUNqQzs7O1dBRUssa0JBQWtCO0FBQ3RCLGFBQ0U7QUFDRSxhQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQUFBQztBQUN2Qyx1QkFBZSxFQUFFLElBQUksQUFBQztBQUN0QixpQkFBUyxFQUFDLHFCQUFxQjtBQUMvQix1QkFBZSxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQUFBQztBQUMzQyxXQUFHLEVBQUMseUVBQXlFO1FBQzdFLENBQ0Y7S0FDSDs7O1dBRW1CLDhCQUFDLEtBQUssRUFBRTtBQUMxQixVQUFNLE9BQU8sR0FBSyxLQUFLLENBQUMsTUFBTSxBQUF1QixDQUFDO0FBQ3RELFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQ3JELFVBQU0saUJBQWlCLEdBQ3JCLGtCQUFLLElBQUksQ0FBQyxTQUFTLEVBQUUseUNBQXlDLENBQUMsQ0FBQztBQUNsRSxhQUFPLENBQUMsaUJBQWlCLGlDQUNPLGdDQUFXLGlCQUFpQixDQUFDLFVBQUssZ0NBQVcsWUFBWSxDQUFDLFFBQ3pGLENBQUM7S0FDSDs7O1NBaENHLFNBQVM7R0FBUyxvQkFBTSxTQUFTOztBQW1DdkMsTUFBTSxDQUFDLE9BQU8sR0FBSyxTQUFTLEFBQWUsQ0FBQyIsImZpbGUiOiJJbnNwZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7R2FkZ2V0fSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWdhZGdldHMtaW50ZXJmYWNlcyc7XG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7V2Vidmlld30gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvV2Vidmlldyc7XG5pbXBvcnQge3RvSnNTdHJpbmd9IGZyb20gJy4uLy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmNsYXNzIEluc3BlY3RvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBnYWRnZXRJZCA9ICdudWNsaWRlLXJlYWN0LW5hdGl2ZS1pbnNwZWN0b3InO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBtaXhlZCkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlRGlkRmluaXNoTG9hZCA9IHRoaXMuX2hhbmRsZURpZEZpbmlzaExvYWQuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGdldFRpdGxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuICdSZWFjdCBOYXRpdmUgSW5zcGVjdG9yJztcbiAgfVxuXG4gIHJlbmRlcigpOiA/UmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPFdlYnZpZXdcbiAgICAgICAgc3R5bGU9e3t3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJ319XG4gICAgICAgIG5vZGVpbnRlZ3JhdGlvbj17dHJ1ZX1cbiAgICAgICAgY2xhc3NOYW1lPVwibmF0aXZlLWtleS1iaW5kaW5nc1wiXG4gICAgICAgIG9uRGlkRmluaXNoTG9hZD17dGhpcy5faGFuZGxlRGlkRmluaXNoTG9hZH1cbiAgICAgICAgc3JjPVwiYXRvbTovL251Y2xpZGUvcGtnL251Y2xpZGUtcmVhY3QtbmF0aXZlLWluc3BlY3Rvci9saWIvdWkvaW5zcGVjdG9yLmh0bWxcIlxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZURpZEZpbmlzaExvYWQoZXZlbnQpIHtcbiAgICBjb25zdCBlbGVtZW50ID0gKChldmVudC50YXJnZXQ6IGFueSk6IFdlYnZpZXdFbGVtZW50KTtcbiAgICBjb25zdCByZXF1aXJlUGF0aHMgPSByZXF1aXJlLmNhY2hlW19fZmlsZW5hbWVdLnBhdGhzO1xuICAgIGNvbnN0IGluc3BlY3RvckRldlRvb2xzID1cbiAgICAgIHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9WZW5kb3JMaWIvZGV2LXRvb2xzL3N0YW5kYWxvbmUuanMnKTtcbiAgICBlbGVtZW50LmV4ZWN1dGVKYXZhU2NyaXB0KFxuICAgICAgYGluaXRpYWxpemVFbGVtZW50SW5zcGVjdG9yKCR7dG9Kc1N0cmluZyhpbnNwZWN0b3JEZXZUb29scyl9LCAke3RvSnNTdHJpbmcocmVxdWlyZVBhdGhzKX0pO2BcbiAgICApO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKChJbnNwZWN0b3I6IGFueSk6IEdhZGdldCk7XG4iXX0=