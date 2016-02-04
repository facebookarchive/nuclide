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

var ReactNativeServerPanel = (function (_React$Component) {
  _inherits(ReactNativeServerPanel, _React$Component);

  function ReactNativeServerPanel(props) {
    var _this = this;

    _classCallCheck(this, ReactNativeServerPanel);

    _get(Object.getPrototypeOf(ReactNativeServerPanel.prototype), 'constructor', this).call(this, props);
    this._storeSubscription = props.store.subscribe(function () {
      _this.forceUpdate();
    });
    this._stopServer = this._handleStopClicked.bind(this);
    this._restartServer = this._handleRestartClicked.bind(this);
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
            'button',
            {
              className: 'btn icon icon-primitive-square inline-block-tight',
              onClick: this._stopServer
            },
            'Stop'
          ),
          _reactForAtom.React.createElement(
            'button',
            {
              className: 'btn icon icon-sync inline-block-tight',
              onClick: this._restartServer
            },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlU2VydmVyUGFuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFXb0IsZ0JBQWdCOzt3Q0FDQyw0QkFBNEI7Ozs7dUNBQzdCLDJCQUEyQjs7OztJQVExQyxzQkFBc0I7WUFBdEIsc0JBQXNCOztBQUk5QixXQUpRLHNCQUFzQixDQUk3QixLQUFZLEVBQUU7OzswQkFKUCxzQkFBc0I7O0FBS3ZDLCtCQUxpQixzQkFBc0IsNkNBS2pDLEtBQUssRUFBRTtBQUNiLFFBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxZQUFNO0FBQ3BELFlBQUssV0FBVyxFQUFFLENBQUM7S0FDcEIsQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RELFFBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM3RDs7ZUFYa0Isc0JBQXNCOztXQWFyQixnQ0FBRztBQUNyQixVQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbkM7OztXQUVLLGtCQUFpQjs7QUFFckIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLEdBQzdDOztVQUFNLFNBQVMsRUFBQyxnQ0FBZ0M7O09BQWUsR0FDL0Q7O1VBQU0sU0FBUyxFQUFDLDhCQUE4Qjs7T0FBZSxDQUFDO0FBQ2xFLGFBQ0U7O1VBQUssU0FBUyxFQUFDLG9CQUFvQjtRQUNqQzs7WUFBSyxTQUFTLEVBQUMsY0FBYztVQUMzQjs7O0FBQ0UsdUJBQVMsRUFBQyxtREFBbUQ7QUFDN0QscUJBQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxBQUFDOzs7V0FHbkI7VUFDVDs7O0FBQ0UsdUJBQVMsRUFBQyx1Q0FBdUM7QUFDakQscUJBQU8sRUFBRSxJQUFJLENBQUMsY0FBYyxBQUFDOzs7V0FHdEI7U0FDTDtRQUNOOztZQUFNLFNBQVMsRUFBQyxjQUFjOztVQUFVLE1BQU07U0FBUTtPQUNsRCxDQUNOO0tBQ0g7OztXQUVpQiw4QkFBRztBQUNuQixVQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNqQzs7O1dBRW9CLGlDQUFHO0FBQ3RCLFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzVEOzs7U0FqRGtCLHNCQUFzQjtHQUFTLG9CQUFNLFNBQVM7O3FCQUE5QyxzQkFBc0IiLCJmaWxlIjoiUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMgZnJvbSAnLi9SZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnMnO1xuaW1wb3J0IFJlYWN0TmF0aXZlU2VydmVyU3RhdHVzIGZyb20gJy4vUmVhY3ROYXRpdmVTZXJ2ZXJTdGF0dXMnO1xuXG50eXBlIFByb3BzID0ge1xuICBhY3Rpb25zOiBSZWFjdE5hdGl2ZVNlcnZlckFjdGlvbnM7XG4gIHN0b3JlOiBSZWFjdE5hdGl2ZVNlcnZlclN0YXR1cztcbiAgc2VydmVyQ29tbWFuZDogc3RyaW5nO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVhY3ROYXRpdmVTZXJ2ZXJQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgX3N0b3JlU3Vic2NyaXB0aW9uOiBJRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5fc3RvcmVTdWJzY3JpcHRpb24gPSBwcm9wcy5zdG9yZS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5mb3JjZVVwZGF0ZSgpO1xuICAgIH0pO1xuICAgIHRoaXMuX3N0b3BTZXJ2ZXIgPSB0aGlzLl9oYW5kbGVTdG9wQ2xpY2tlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3Jlc3RhcnRTZXJ2ZXIgPSB0aGlzLl9oYW5kbGVSZXN0YXJ0Q2xpY2tlZC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgdGhpcy5fc3RvcmVTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETyhuYXR0aHUpOiBBZGQgYW5vdGhlciBidXR0b24gdG8gYWxsb3cgZGVidWdnaW5nIFJOIEphdmFzY3JpcHQuXG4gICAgY29uc3Qgc3RhdHVzID0gdGhpcy5wcm9wcy5zdG9yZS5pc1NlcnZlclJ1bm5pbmcoKVxuICAgICAgPyA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgaGlnaGxpZ2h0LXN1Y2Nlc3NcIj5SdW5uaW5nPC9zcGFuPlxuICAgICAgOiA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtYmxvY2sgaGlnaGxpZ2h0LWVycm9yXCI+U3RvcHBlZDwvc3Bhbj47XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5zZXQtcGFuZWwgcGFkZGVkXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGljb24gaWNvbi1wcmltaXRpdmUtc3F1YXJlIGlubGluZS1ibG9jay10aWdodFwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLl9zdG9wU2VydmVyfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIFN0b3BcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJidG4gaWNvbiBpY29uLXN5bmMgaW5saW5lLWJsb2NrLXRpZ2h0XCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX3Jlc3RhcnRTZXJ2ZXJ9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgUmVzdGFydFxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrXCI+U3RhdHVzOiB7c3RhdHVzfTwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICBfaGFuZGxlU3RvcENsaWNrZWQoKSB7XG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLnN0b3BTZXJ2ZXIoKTtcbiAgfVxuXG4gIF9oYW5kbGVSZXN0YXJ0Q2xpY2tlZCgpIHtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMucmVzdGFydFNlcnZlcih0aGlzLnByb3BzLnNlcnZlckNvbW1hbmQpO1xuICB9XG59XG4iXX0=