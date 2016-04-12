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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFVJQ29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQWNvQixnQkFBZ0I7O3FDQUNaLGdDQUFnQzs7SUFPM0MsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsS0FBZ0IsRUFBRTswQkFIbkIsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLEtBQUssRUFBRTtBQUNiLEFBQUMsUUFBSSxDQUFPLGtCQUFrQixHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckU7O2VBTlUsaUJBQWlCOztXQVF0QixrQkFBaUI7Ozs7QUFJckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsT0FBTztRQUNwQjs7OztTQUEyQjtRQUMzQjtBQUNFLGFBQUcsRUFBQyxrQkFBa0I7QUFDdEIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQyw4Q0FBOEM7VUFDOUQ7UUFDRjs7OztTQUEwQjtRQUMxQjtBQUNFLGFBQUcsRUFBQyxpQkFBaUI7QUFDckIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQyw2QkFBNkI7VUFDN0M7UUFDRjs7OztTQUFrQztRQUNsQztBQUNFLGFBQUcsRUFBQyx3QkFBd0I7QUFDNUIsa0JBQVEsRUFBQyxJQUFJO0FBQ2IseUJBQWUsRUFBQywrQ0FBK0M7VUFDL0Q7UUFDRjs7WUFBUSxTQUFTLEVBQUMsS0FBSyxFQUFDLFFBQVEsRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQUFBQzs7U0FBZ0I7T0FDbkYsQ0FDTjtLQUNIOzs7V0FFaUIsOEJBQVM7O0FBRXpCLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ3hFLFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUN0RSxVQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs7QUFFcEYsVUFBTSxZQUFZLEdBQUc7QUFDbkIsc0JBQWMsRUFBRSxnQkFBZ0I7QUFDaEMsaUJBQVMsRUFBRSxlQUFlO0FBQzFCLDRCQUFvQixFQUFFLEVBQUU7QUFDeEIsd0JBQWdCLEVBQUUsc0JBQXNCO09BQ3pDLENBQUM7O0FBRUYsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ2hELFVBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztLQUMvQzs7O1NBckRVLGlCQUFpQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiTGF1bmNoVUlDb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TGF1bmNoQXR0YWNoU3RvcmV9IGZyb20gJy4vTGF1bmNoQXR0YWNoU3RvcmUnO1xuaW1wb3J0IHR5cGUge0xhdW5jaEF0dGFjaEFjdGlvbnN9IGZyb20gJy4vTGF1bmNoQXR0YWNoQWN0aW9ucyc7XG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7QXRvbUlucHV0fSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9BdG9tSW5wdXQnO1xuXG50eXBlIFByb3BzVHlwZSA9IHtcbiAgc3RvcmU6IExhdW5jaEF0dGFjaFN0b3JlO1xuICBhY3Rpb25zOiBMYXVuY2hBdHRhY2hBY3Rpb25zO1xufTtcblxuZXhwb3J0IGNsYXNzIExhdW5jaFVJQ29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PHZvaWQsIFByb3BzVHlwZSwgdm9pZD4ge1xuICBwcm9wczogUHJvcHNUeXBlO1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wc1R5cGUpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgKHRoaXM6IGFueSkuX2hhbmRsZUxhdW5jaENsaWNrID0gdGhpcy5faGFuZGxlTGF1bmNoQ2xpY2suYmluZCh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIC8vIFRPRE86IHNtYXJ0IGZpbGwgdGhlIHdvcmtpbmcgZGlyZWN0b3J5IHRleHRib3guXG4gICAgLy8gVE9ETzogbWFrZSB0YWIgc3RvcCBiZXR3ZWVuIHRleHRib3ggd29yay5cbiAgICAvLyBSZXNlcnZlIHRhYkluZGV4IFsxfjEwXSB0byBoZWFkZXIgcG9ydGlvbiBvZiB0aGUgVUkgc28gd2Ugc3RhcnQgZnJvbSBcIjExXCIgaGVyZS5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJibG9ja1wiPlxuICAgICAgICA8bGFiZWw+RXhlY3V0YWJsZTogPC9sYWJlbD5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cImxhdW5jaEV4ZWN1dGFibGVcIlxuICAgICAgICAgIHRhYkluZGV4PVwiMTFcIlxuICAgICAgICAgIHBsYWNlaG9sZGVyVGV4dD1cIklucHV0IHRoZSBleGVjdXRhYmxlIHBhdGggeW91IHdhbnQgdG8gbGF1bmNoXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGxhYmVsPkFyZ3VtZW50czogPC9sYWJlbD5cbiAgICAgICAgPEF0b21JbnB1dFxuICAgICAgICAgIHJlZj1cImxhdW5jaEFyZ3VtZW50c1wiXG4gICAgICAgICAgdGFiSW5kZXg9XCIxMlwiXG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiQXJndW1lbnRzIHRvIHRoZSBleGVjdXRhYmxlXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGxhYmVsPldvcmtpbmcgZGlyZWN0b3J5OiA8L2xhYmVsPlxuICAgICAgICA8QXRvbUlucHV0XG4gICAgICAgICAgcmVmPVwibGF1bmNoV29ya2luZ0RpcmVjdG9yeVwiXG4gICAgICAgICAgdGFiSW5kZXg9XCIxM1wiXG4gICAgICAgICAgcGxhY2Vob2xkZXJUZXh0PVwiV29ya2luZyBkaXJlY3RvcnkgZm9yIHRoZSBsYXVuY2hlZCBleGVjdXRhYmxlXCJcbiAgICAgICAgLz5cbiAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJidG5cIiB0YWJJbmRleD1cIjE0XCIgb25DbGljaz17dGhpcy5faGFuZGxlTGF1bmNoQ2xpY2t9PkxhdW5jaDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVMYXVuY2hDbGljaygpOiB2b2lkIHtcbiAgICAvLyBUT0RPOiBwZXJmb3JtIHNvbWUgdmFsaWRhdGlvbiBmb3IgdGhlIGlucHV0LlxuICAgIGNvbnN0IGxhdW5jaEV4ZWN1dGFibGUgPSB0aGlzLnJlZnNbJ2xhdW5jaEV4ZWN1dGFibGUnXS5nZXRUZXh0KCkudHJpbSgpO1xuICAgIGNvbnN0IGxhdW5jaEFyZ3VtZW50cyA9IHRoaXMucmVmc1snbGF1bmNoQXJndW1lbnRzJ10uZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICBjb25zdCBsYXVuY2hXb3JraW5nRGlyZWN0b3J5ID0gdGhpcy5yZWZzWydsYXVuY2hXb3JraW5nRGlyZWN0b3J5J10uZ2V0VGV4dCgpLnRyaW0oKTtcbiAgICAvLyBUT0RPOiBmaWxsIG90aGVyIGZpZWxkcyBmcm9tIFVJLlxuICAgIGNvbnN0IGxhdW5jaFRhcmdldCA9IHtcbiAgICAgIGV4ZWN1dGFibGVQYXRoOiBsYXVuY2hFeGVjdXRhYmxlLFxuICAgICAgYXJndW1lbnRzOiBsYXVuY2hBcmd1bWVudHMsXG4gICAgICBlbnZpcm9ubWVudFZhcmlhYmxlczogW10sXG4gICAgICB3b3JraW5nRGlyZWN0b3J5OiBsYXVuY2hXb3JraW5nRGlyZWN0b3J5LFxuICAgIH07XG4gICAgLy8gRmlyZSBhbmQgZm9yZ2V0LlxuICAgIHRoaXMucHJvcHMuYWN0aW9ucy5sYXVuY2hEZWJ1Z2dlcihsYXVuY2hUYXJnZXQpO1xuICAgIHRoaXMucHJvcHMuYWN0aW9ucy5zaG93RGVidWdnZXJQYW5lbCgpO1xuICAgIHRoaXMucHJvcHMuYWN0aW9ucy50b2dnbGVMYXVuY2hBdHRhY2hEaWFsb2coKTtcbiAgfVxufVxuIl19