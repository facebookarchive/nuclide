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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _reactForAtom = require('react-for-atom');

var _nuclideUiLibAtomInput = require('../../nuclide-ui/lib/AtomInput');

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
      // TODO: smart fill the working directory textbox.
      // TODO: make tab stop between textbox work.
      // Reserve tabIndex [1~10] to header portion of the UI so we start from "11" here.
      return _reactForAtom.React.createElement(
        'div',
        { className: 'block' },
        _reactForAtom.React.createElement(
          'label',
          null,
          'Executable: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'launchExecutable',
          tabIndex: '11',
          placeholderText: 'Input the executable path you want to launch'
        }),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Arguments: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'launchArguments',
          tabIndex: '12',
          placeholderText: 'Arguments to the executable'
        }),
        _reactForAtom.React.createElement(
          'label',
          null,
          'Working directory: '
        ),
        _reactForAtom.React.createElement(_nuclideUiLibAtomInput.AtomInput, {
          ref: 'launchWorkingDirectory',
          tabIndex: '13',
          placeholderText: 'Working directory for the launched executable'
        }),
        _reactForAtom.React.createElement(
          'button',
          { className: 'btn', tabIndex: '14', onClick: this._handleLaunchClick },
          'Launch'
        )
      );
    }
  }, {
    key: '_handleLaunchClick',
    value: function _handleLaunchClick() {
      // TODO: perform some validation for the input.
      var launchExecutable = this.refs['launchExecutable'].getText().trim();
      var launchArguments = this.refs['launchArguments'].getText().trim();
      var launchWorkingDirectory = this.refs['launchWorkingDirectory'].getText().trim();
      // TODO: fill other fields from UI.
      var launchTarget = {
        executablePath: launchExecutable,
        arguments: launchArguments,
        environmentVariables: [],
        workingDirectory: launchWorkingDirectory
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWNvQixnQkFBZ0I7O3FDQUNaLGdDQUFnQzs7SUFPM0MsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckU7O2VBTlUsaUJBQWlCOztXQVF0QixrQkFBaUI7Ozs7QUFJckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsT0FBTztRQUNwQjs7OztTQUEyQjtRQUMzQjtBQUNFLGFBQUcsRUFBQyxrQkFBa0I7QUFDdEIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQyw4Q0FBOEM7VUFDOUQ7UUFDRjs7OztTQUEwQjtRQUMxQjtBQUNFLGFBQUcsRUFBQyxpQkFBaUI7QUFDckIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQyw2QkFBNkI7VUFDN0M7UUFDRjs7OztTQUFrQztRQUNsQztBQUNFLGFBQUcsRUFBQyx3QkFBd0I7QUFDNUIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQywrQ0FBK0M7VUFDL0Q7UUFDRjs7WUFBUSxTQUFTLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQUFBQzs7U0FBZ0I7T0FDbkYsQ0FDTjtLQUNIOzs7V0FFaUIsOEJBQVM7O0FBRXpCLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3hFLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN0RSxVQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFcEYsVUFBTSxZQUFZLEdBQUc7QUFDbkIsc0JBQWMsRUFBRSxnQkFBZ0I7QUFDaEMsaUJBQVMsRUFBRSxlQUFlO0FBQzFCLDRCQUFvQixFQUFFLEVBQUU7QUFDeEIsd0JBQWdCLEVBQUUsc0JBQXNCO09BQ3pDLENBQUM7O0FBRUYsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztLQUMvQzs7O1NBckRVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiTGF1bmNoVUlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoU3RvcmV9IGZyb20gJy4vTGF1bmNoQXR0YWNoU3RvcmUnO1xuaW1wb3J0IHR5cGUge0xhdW5jaEF0dGFjaEFjdGlvbnN9IGZyb20gJy4vTGF1bmNoQXR0YWNoQWN0aW9ucyc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QXRvbUlucHV0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgc3RvcmU6IExhdW5jaEF0dGFjaFN0b3JlO1xuICBhY3Rpb25zOiBMYXVuY2hBdHRhY2hBY3Rpb25zO1xufVxuXG5leHBvcnQgY2xhc3MgTGF1bmNoVUlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQ8dm9pZCwgUHJvcHNUeXBlLCB2b2lkPiB7XG4gIHByb3BzOiBQcm9wc1R5cGU7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzVHlwZSkge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICAodGhpczogYW55KS5faGFuZGxlTGF1bmNoQ2xpY2sgPSB0aGlzLl9oYW5kbGVMYXVuY2hDbGljay5iaW5kKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgLy8gVE9ETzogc21hcnQgZmlsbCB0aGUgd29ya2luZyBkaXJlY3RvcnkgdGV4dGJveC5cbiAgICAvLyBUT0RPOiBtYWtlIHRhYiBzdG9wIGJldHdlZW4gdGV4dGJveCB3b3JrLlxuICAgIC8vIFJlc2VydmUgdGFiSW5kZXggWzF+MTBdIHRvIGhlYWRlciBwb3J0aW9uIG9mIHRoZSBVSSBzbyB3ZSBzdGFydCBmcm9tIFwiMTFcIiBoZXJlLlxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJsb2NrXCI+XG4gICAgICAgIDxsYWJlbD5FeGVjdXRhYmxlOiA8L2xhYmVsPlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgcmVmPVwibGF1bmNoRXhlY3V0YWJsZVwiXG4gICAgICAgICAgdGFiSW5kZXg9XCIxMVwiXG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiSW5wdXQgdGhlIGV4ZWN1dGFibGUgcGF0aCB5b3Ugd2FudCB0byBsYXVuY2hcIlxuICAgICAgICAvPlxuICAgICAgICA8bGFiZWw+QXJndW1lbnRzOiA8L2xhYmVsPlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgcmVmPVwibGF1bmNoQXJndW1lbnRzXCJcbiAgICAgICAgICB0YWJJbmRleD1cIjEyXCJcbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJBcmd1bWVudHMgdG8gdGhlIGV4ZWN1dGFibGVcIlxuICAgICAgICAvPlxuICAgICAgICA8bGFiZWw+V29ya2luZyBkaXJlY3Rvcnk6IDwvbGFiZWw+XG4gICAgICAgIDxBdG9tSW5wdXRcbiAgICAgICAgICByZWY9XCJsYXVuY2hXb3JraW5nRGlyZWN0b3J5XCJcbiAgICAgICAgICB0YWJJbmRleD1cIjEzXCJcbiAgICAgICAgICBwbGFjZWhvbGRlclRleHQ9XCJXb3JraW5nIGRpcmVjdG9yeSBmb3IgdGhlIGxhdW5jaGVkIGV4ZWN1dGFibGVcIlxuICAgICAgICAvPlxuICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT1cImJ0blwiIHRhYkluZGV4PVwiMTRcIiBvbkNsaWNrPXt0aGlzLl9oYW5kbGVMYXVuY2hDbGlja30+TGF1bmNoPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgX2hhbmRsZUxhdW5jaENsaWNrKCk6IHZvaWQge1xuICAgIC8vIFRPRE86IHBlcmZvcm0gc29tZSB2YWxpZGF0aW9uIGZvciB0aGUgaW5wdXQuXG4gICAgY29uc3QgbGF1bmNoRXhlY3V0YWJsZSA9IHRoaXMucmVmc1snbGF1bmNoRXhlY3V0YWJsZSddLmdldFRleHQoKS50cmltKCk7XG4gICAgY29uc3QgbGF1bmNoQXJndW1lbnRzID0gdGhpcy5yZWZzWydsYXVuY2hBcmd1bWVudHMnXS5nZXRUZXh0KCkudHJpbSgpO1xuICAgIGNvbnN0IGxhdW5jaFdvcmtpbmdEaXJlY3RvcnkgPSB0aGlzLnJlZnNbJ2xhdW5jaFdvcmtpbmdEaXJlY3RvcnknXS5nZXRUZXh0KCkudHJpbSgpO1xuICAgIC8vIFRPRE86IGZpbGwgb3RoZXIgZmllbGRzIGZyb20gVUkuXG4gICAgY29uc3QgbGF1bmNoVGFyZ2V0ID0ge1xuICAgICAgZXhlY3V0YWJsZVBhdGg6IGxhdW5jaEV4ZWN1dGFibGUsXG4gICAgICBhcmd1bWVudHM6IGxhdW5jaEFyZ3VtZW50cyxcbiAgICAgIGVudmlyb25tZW50VmFyaWFibGVzOiBbXSxcbiAgICAgIHdvcmtpbmdEaXJlY3Rvcnk6IGxhdW5jaFdvcmtpbmdEaXJlY3RvcnksXG4gICAgfTtcbiAgICAvLyBGaXJlIGFuZCBmb3JnZXQuXG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLmxhdW5jaERlYnVnZ2VyKGxhdW5jaFRhcmdldCk7XG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLnNob3dEZWJ1Z2dlclBhbmVsKCk7XG4gICAgdGhpcy5wcm9wcy5hY3Rpb25zLnRvZ2dsZUxhdW5jaEF0dGFjaERpYWxvZygpO1xuICB9XG59XG4iXX0=