Object.defineProperty(exports, '__esModule', {
  value: true
});

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

var _reactForAtom = require('react-for-atom');

var _ReactNativeServerActions = require('./ReactNativeServerActions');

var _ReactNativeServerActions2 = _interopRequireDefault(_ReactNativeServerActions);

var _ReactNativeServerStatus = require('./ReactNativeServerStatus');

var _ReactNativeServerStatus2 = _interopRequireDefault(_ReactNativeServerStatus);

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

var ReactNativeServerPanel = (function (_React$Component) {
  _inherits(ReactNativeServerPanel, _React$Component);

  function ReactNativeServerPanel(props) {
    var _this = this;

    _classCallCheck(this, ReactNativeServerPanel);

    _get(Object.getPrototypeOf(ReactNativeServerPanel.prototype), 'constructor', this).call(this, props);
    this._storeSubscription = props.store.subscribe(function () {
      _this.forceUpdate();
    });
    this._handleStopClicked = this._handleStopClicked.bind(this);
    this._handleRestartClicked = this._handleRestartClicked.bind(this);
  }

  _createClass(ReactNativeServerPanel, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._storeSubscription.dispose();
    }
  }, {
    key: 'render',
    value: function render() {
      // TODO(natthu): Add another button to allow debugging RN Javascript.
      var status = this.props.store.isServerRunning() ? _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block highlight-success' },
        'Running'
      ) : _reactForAtom.React.createElement(
        'span',
        { className: 'inline-block highlight-error' },
        'Stopped'
      );
      return _reactForAtom.React.createElement(
        'div',
        { className: 'inset-panel padded' },
        _reactForAtom.React.createElement(
          'div',
          { className: 'inline-block' },
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              className: 'inline-block-tight',
              icon: 'primitive-square',
              onClick: this._handleStopClicked },
            'Stop'
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              className: 'inline-block-tight',
              icon: 'sync',
              onClick: this._handleRestartClicked },
            'Restart'
          )
        ),
        _reactForAtom.React.createElement(
          'span',
          { className: 'inline-block' },
          'Status: ',
          status
        )
      );
    }
  }, {
    key: '_handleStopClicked',
    value: function _handleStopClicked() {
      this.props.actions.stopServer();
    }
  }, {
    key: '_handleRestartClicked',
    value: function _handleRestartClicked() {
      this.props.actions.restartServer(this.props.serverCommand);
    }
  }]);

  return ReactNativeServerPanel;
})(_reactForAtom.React.Component);

exports['default'] = ReactNativeServerPanel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOzt3Q0FDQyw0QkFBNEI7Ozs7dUNBQzdCLDJCQUEyQjs7OztrQ0FDMUMsNkJBQTZCOztJQVE3QixzQkFBc0I7WUFBdEIsc0JBQXNCOztBQUs5QixXQUxRLHNCQUFzQixDQUs3QixLQUFZLEVBQUU7OzswQkFMUCxzQkFBc0I7O0FBTXZDLCtCQU5pQixzQkFBc0IsNkNBTWpDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQ3BELFlBQUssV0FBVyxFQUFFLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0FBQ0gsQUFBQyxRQUFJLENBQU8sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxBQUFDLFFBQUksQ0FBTyxxQkFBcUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzNFOztlQVprQixzQkFBc0I7O1dBY3JCLGdDQUFHO0FBQ3JCLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNuQzs7O1dBRUssa0JBQWtCOztBQUV0QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsR0FDN0M7O1VBQU0sU0FBUyxFQUFDLGdDQUFnQzs7T0FBZSxHQUMvRDs7VUFBTSxTQUFTLEVBQUMsOEJBQThCOztPQUFlLENBQUM7QUFDbEUsYUFDRTs7VUFBSyxTQUFTLEVBQUMsb0JBQW9CO1FBQ2pDOztZQUFLLFNBQVMsRUFBQyxjQUFjO1VBQzNCOzs7QUFDRSx1QkFBUyxFQUFDLG9CQUFvQjtBQUM5QixrQkFBSSxFQUFDLGtCQUFrQjtBQUN2QixxQkFBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQUFBQzs7V0FFMUI7VUFDVDs7O0FBQ0UsdUJBQVMsRUFBQyxvQkFBb0I7QUFDOUIsa0JBQUksRUFBQyxNQUFNO0FBQ1gscUJBQU8sRUFBRSxJQUFJLENBQUMscUJBQXFCLEFBQUM7O1dBRTdCO1NBQ0w7UUFDTjs7WUFBTSxTQUFTLEVBQUMsY0FBYzs7VUFBVSxNQUFNO1NBQVE7T0FDbEQsQ0FDTjtLQUNIOzs7V0FFaUIsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDakM7OztXQUVvQixpQ0FBRztBQUN0QixVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztLQUM1RDs7O1NBbERrQixzQkFBc0I7R0FBUyxvQkFBTSxTQUFTOztxQkFBOUMsc0JBQXNCIiwiZmlsZSI6IlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJBY3Rpb25zJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyBmcm9tICcuL1JlYWN0TmF0aXZlU2VydmVyU3RhdHVzJztcbmltcG9ydCB7QnV0dG9ufSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9CdXR0b24nO1xuXG50eXBlIFByb3BzID0ge1xuICBhY3Rpb25zOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM7XG4gIHN0b3JlOiBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cztcbiAgc2VydmVyQ29tbWFuZDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcHJvcHM6IFByb3BzO1xuICBfc3RvcmVTdWJzY3JpcHRpb246IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9zdG9yZVN1YnNjcmlwdGlvbiA9IHByb3BzLnN0b3JlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKCk7XG4gICAgfSk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZVN0b3BDbGlja2VkID0gdGhpcy5faGFuZGxlU3RvcENsaWNrZWQuYmluZCh0aGlzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlUmVzdGFydENsaWNrZWQgPSB0aGlzLl9oYW5kbGVSZXN0YXJ0Q2xpY2tlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fc3RvcmVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQWRkIGFub3RoZXIgYnV0dG9uIHRvIGFsbG93IGRlYnVnZ2luZyBSTiBKYXZhc2NyaXB0LlxuICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMucHJvcHMuc3RvcmUuaXNTZXJ2ZXJSdW5uaW5nKClcbiAgICAgID8gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1zdWNjZXNzXCI+UnVubmluZzwvc3Bhbj5cbiAgICAgIDogPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1lcnJvclwiPlN0b3BwZWQ8L3NwYW4+O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImluc2V0LXBhbmVsIHBhZGRlZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jay10aWdodFwiXG4gICAgICAgICAgICBpY29uPVwicHJpbWl0aXZlLXNxdWFyZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9oYW5kbGVTdG9wQ2xpY2tlZH0+XG4gICAgICAgICAgICBTdG9wXG4gICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICAgIGljb249XCJzeW5jXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX2hhbmRsZVJlc3RhcnRDbGlja2VkfT5cbiAgICAgICAgICAgIFJlc3RhcnRcbiAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlN0YXR1czoge3N0YXR1c308L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZVN0b3BDbGlja2VkKCkge1xuICAgIHRoaXMucHJvcHMuYWN0aW9ucy5zdG9wU2VydmVyKCk7XG4gIH1cblxuICBfaGFuZGxlUmVzdGFydENsaWNrZWQoKSB7XG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLnJlc3RhcnRTZXJ2ZXIodGhpcy5wcm9wcy5zZXJ2ZXJDb21tYW5kKTtcbiAgfVxufVxuIl19