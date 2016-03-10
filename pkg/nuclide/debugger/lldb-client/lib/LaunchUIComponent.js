Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* eslint-disable react/prop-types */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _uiAtomInput = require('../../../ui/atom-input');

var _uiAtomInput2 = _interopRequireDefault(_uiAtomInput);

var LaunchUIComponent = (function (_React$Component) {
  _inherits(LaunchUIComponent, _React$Component);

  function LaunchUIComponent(props) {
    _classCallCheck(this, LaunchUIComponent);

    _get(Object.getPrototypeOf(LaunchUIComponent.prototype), 'constructor', this).call(this, props);
    this._handleLaunchClick = this._handleLaunchClick.bind(this);
  }

  _createClass(LaunchUIComponent, [{
    key: 'render',
    value: function render() {
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Executable: '
        ),
        _reactForAtom.React.createElement(_uiAtomInput2['default'], {
          ref: 'launchCommandLine',
          placeholderText: 'Input the executable path you want to launch'
        }),
        _reactForAtom.React.createElement(
          'button',
          { className: 'btn', onClick: this._handleLaunchClick },
          'Launch'
        )
      );
    }
  }, {
    key: '_handleLaunchClick',
    value: function _handleLaunchClick() {
      var launchExecutable = this.refs['launchCommandLine'].getText();
      // TODO: fill other fields from UI.
      var launchTarget = {
        executablePath: launchExecutable,
        arguments: [],
        environmentVariables: [],
        workingDirectory: '.'
      };
      // Fire and forget.
      this.props.actions.launchDebugger(launchTarget);
      this.props.actions.showDebuggerPanel();
      this.props.actions.toggleLaunchAttachDialog();
    }
  }]);

  return LaunchUIComponent;
})(_reactForAtom.React.Component);

exports.LaunchUIComponent = LaunchUIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkFnQm9CLGdCQUFnQjs7MkJBQ2Qsd0JBQXdCOzs7O0lBT2pDLGlCQUFpQjtZQUFqQixpQkFBaUI7O0FBQ2pCLFdBREEsaUJBQWlCLENBQ2hCLEtBQWdCLEVBQUU7MEJBRG5CLGlCQUFpQjs7QUFFMUIsK0JBRlMsaUJBQWlCLDZDQUVwQixLQUFLLEVBQUU7QUFDYixBQUFDLFFBQUksQ0FBTyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3JFOztlQUpVLGlCQUFpQjs7V0FNdEIsa0JBQWlCO0FBQ3JCLGFBQ0U7O1VBQUssU0FBUyxFQUFDLE9BQU87UUFDcEI7Ozs7U0FBMkI7UUFDM0I7QUFDRSxhQUFHLEVBQUMsbUJBQW1CO0FBQ3ZCLHlCQUFlLEVBQUMsOENBQThDO1VBQzlEO1FBQ0Y7O1lBQVEsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixBQUFDOztTQUFnQjtPQUNyRSxDQUNOO0tBQ0g7OztXQUVpQiw4QkFBUztBQUN6QixVQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFbEUsVUFBTSxZQUFZLEdBQUc7QUFDbkIsc0JBQWMsRUFBRSxnQkFBZ0I7QUFDaEMsaUJBQVMsRUFBRSxFQUFFO0FBQ2IsNEJBQW9CLEVBQUUsRUFBRTtBQUN4Qix3QkFBZ0IsRUFBRSxHQUFHO09BQ3RCLENBQUM7O0FBRUYsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztLQUMvQzs7O1NBaENVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiTGF1bmNoVUlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSByZWFjdC9wcm9wLXR5cGVzICovXG5cbmltcG9ydCB0eXBlIHtMYXVuY2hBdHRhY2hTdG9yZX0gZnJvbSAnLi9MYXVuY2hBdHRhY2hTdG9yZSc7XG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoQWN0aW9uc30gZnJvbSAnLi9MYXVuY2hBdHRhY2hBY3Rpb25zJztcblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IEF0b21JbnB1dCBmcm9tICcuLi8uLi8uLi91aS9hdG9tLWlucHV0JztcblxudHlwZSBQcm9wc1R5cGUgPSB7XG4gIHN0b3JlOiBMYXVuY2hBdHRhY2hTdG9yZTtcbiAgYWN0aW9uczogTGF1bmNoQXR0YWNoQWN0aW9ucztcbn1cblxuZXhwb3J0IGNsYXNzIExhdW5jaFVJQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgdm9pZD4ge1xuICBjb25zdHJ1Y3Rvcihwcm9wczogUHJvcHNUeXBlKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgICh0aGlzOiBhbnkpLl9oYW5kbGVMYXVuY2hDbGljayA9IHRoaXMuX2hhbmRsZUxhdW5jaENsaWNrLmJpbmQodGhpcyk7XG4gIH1cblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICA8bGFiZWw+RXhlY3V0YWJsZTogPC9sYWJlbD5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cImxhdW5jaENvbW1hbmRMaW5lXCJcbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJJbnB1dCB0aGUgZXhlY3V0YWJsZSBwYXRoIHlvdSB3YW50IHRvIGxhdW5jaFwiXG4gICAgICAgIC8+XG4gICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiYnRuXCIgb25DbGljaz17dGhpcy5faGFuZGxlTGF1bmNoQ2xpY2t9PkxhdW5jaDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVMYXVuY2hDbGljaygpOiB2b2lkIHtcbiAgICBjb25zdCBsYXVuY2hFeGVjdXRhYmxlID0gdGhpcy5yZWZzWydsYXVuY2hDb21tYW5kTGluZSddLmdldFRleHQoKTtcbiAgICAvLyBUT0RPOiBmaWxsIG90aGVyIGZpZWxkcyBmcm9tIFVJLlxuICAgIGNvbnN0IGxhdW5jaFRhcmdldCA9IHtcbiAgICAgIGV4ZWN1dGFibGVQYXRoOiBsYXVuY2hFeGVjdXRhYmxlLFxuICAgICAgYXJndW1lbnRzOiBbXSxcbiAgICAgIGVudmlyb25tZW50VmFyaWFibGVzOiBbXSxcbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6ICcuJyxcbiAgICB9O1xuICAgIC8vIEZpcmUgYW5kIGZvcmdldC5cbiAgICB0aGlzLnByb3BzLmFjdGlvbnMubGF1bmNoRGVidWdnZXIobGF1bmNoVGFyZ2V0KTtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMuc2hvd0RlYnVnZ2VyUGFuZWwoKTtcbiAgICB0aGlzLnByb3BzLmFjdGlvbnMudG9nZ2xlTGF1bmNoQXR0YWNoRGlhbG9nKCk7XG4gIH1cbn1cbiJdfQ==