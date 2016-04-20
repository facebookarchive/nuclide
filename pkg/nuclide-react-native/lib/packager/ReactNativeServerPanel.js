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

var _ReactNativeServerStatus = require('./ReactNativeServerStatus');

var _ReactNativeServerStatus2 = _interopRequireDefault(_ReactNativeServerStatus);

var _nuclideUiLibButton = require('../../../nuclide-ui/lib/Button');

var ReactNativeServerPanel = (function (_React$Component) {
  _inherits(ReactNativeServerPanel, _React$Component);

  function ReactNativeServerPanel(props) {
    var _this = this;

    _classCallCheck(this, ReactNativeServerPanel);

    _get(Object.getPrototypeOf(ReactNativeServerPanel.prototype), 'constructor', this).call(this, props);
    this._storeSubscription = props.store.subscribe(function () {
      _this.forceUpdate();
    });
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
              onClick: this.props.stopServer },
            'Stop'
          ),
          _reactForAtom.React.createElement(
            _nuclideUiLibButton.Button,
            {
              className: 'inline-block-tight',
              icon: 'sync',
              onClick: this.props.restartServer },
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
  }]);

  return ReactNativeServerPanel;
})(_reactForAtom.React.Component);

exports['default'] = ReactNativeServerPanel;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOzt1Q0FDQSwyQkFBMkI7Ozs7a0NBQzFDLGdDQUFnQzs7SUFRaEMsc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFLOUIsV0FMUSxzQkFBc0IsQ0FLN0IsS0FBWSxFQUFFOzs7MEJBTFAsc0JBQXNCOztBQU12QywrQkFOaUIsc0JBQXNCLDZDQU1qQyxLQUFLLEVBQUU7QUFDYixRQUFJLENBQUMsa0JBQWtCLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBTTtBQUNwRCxZQUFLLFdBQVcsRUFBRSxDQUFDO0tBQ3BCLENBQUMsQ0FBQztHQUNKOztlQVZrQixzQkFBc0I7O1dBWXJCLGdDQUFHO0FBQ3JCLFVBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNuQzs7O1dBRUssa0JBQWtCOztBQUV0QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxlQUFlLEVBQUUsR0FDN0M7O1VBQU0sU0FBUyxFQUFDLGdDQUFnQzs7T0FBZSxHQUMvRDs7VUFBTSxTQUFTLEVBQUMsOEJBQThCOztPQUFlLENBQUM7QUFDbEUsYUFDRTs7VUFBSyxTQUFTLEVBQUMsb0JBQW9CO1FBQ2pDOztZQUFLLFNBQVMsRUFBQyxjQUFjO1VBQzNCOzs7QUFDRSx1QkFBUyxFQUFDLG9CQUFvQjtBQUM5QixrQkFBSSxFQUFDLGtCQUFrQjtBQUN2QixxQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxBQUFDOztXQUV4QjtVQUNUOzs7QUFDRSx1QkFBUyxFQUFDLG9CQUFvQjtBQUM5QixrQkFBSSxFQUFDLE1BQU07QUFDWCxxQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxBQUFDOztXQUUzQjtTQUNMO1FBQ047O1lBQU0sU0FBUyxFQUFDLGNBQWM7O1VBQVUsTUFBTTtTQUFRO09BQ2xELENBQ047S0FDSDs7O1NBeENrQixzQkFBc0I7R0FBUyxvQkFBTSxTQUFTOztxQkFBOUMsc0JBQXNCIiwiZmlsZSI6IlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1JlYWN0fSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQgUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXMgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlclN0YXR1cyc7XG5pbXBvcnQge0J1dHRvbn0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS11aS9saWIvQnV0dG9uJztcblxudHlwZSBQcm9wcyA9IHtcbiAgc3RvcmU6IFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzO1xuICByZXN0YXJ0U2VydmVyOiAoKSA9PiB2b2lkO1xuICBzdG9wU2VydmVyOiAoKSA9PiB2b2lkO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx2b2lkLCBQcm9wcywgdm9pZD4ge1xuICBwcm9wczogUHJvcHM7XG5cbiAgX3N0b3JlU3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3RvcmVTdWJzY3JpcHRpb24gPSBwcm9wcy5zdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fc3RvcmVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIC8vIFRPRE8obmF0dGh1KTogQWRkIGFub3RoZXIgYnV0dG9uIHRvIGFsbG93IGRlYnVnZ2luZyBSTiBKYXZhc2NyaXB0LlxuICAgIGNvbnN0IHN0YXR1cyA9IHRoaXMucHJvcHMuc3RvcmUuaXNTZXJ2ZXJSdW5uaW5nKClcbiAgICAgID8gPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1zdWNjZXNzXCI+UnVubmluZzwvc3Bhbj5cbiAgICAgIDogPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIGhpZ2hsaWdodC1lcnJvclwiPlN0b3BwZWQ8L3NwYW4+O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImluc2V0LXBhbmVsIHBhZGRlZFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1ibG9ja1wiPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jay10aWdodFwiXG4gICAgICAgICAgICBpY29uPVwicHJpbWl0aXZlLXNxdWFyZVwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLnN0b3BTZXJ2ZXJ9PlxuICAgICAgICAgICAgU3RvcFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1ibG9jay10aWdodFwiXG4gICAgICAgICAgICBpY29uPVwic3luY1wiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLnByb3BzLnJlc3RhcnRTZXJ2ZXJ9PlxuICAgICAgICAgICAgUmVzdGFydFxuICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+U3RhdHVzOiB7c3RhdHVzfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuIl19