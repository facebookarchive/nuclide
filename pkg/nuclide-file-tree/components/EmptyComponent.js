Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

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

var EmptyComponent = (function (_React$Component) {
  _inherits(EmptyComponent, _React$Component);

  function EmptyComponent() {
    _classCallCheck(this, EmptyComponent);

    _get(Object.getPrototypeOf(EmptyComponent.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(EmptyComponent, [{
    key: 'render',
    value: function render() {
      var _this = this;

      return _reactForAtom.React.createElement(
        'div',
        { className: 'padded' },
        _reactForAtom.React.createElement(
          'button',
          {
            onClick: function () {
              return _this.runCommand('application:add-project-folder');
            },
            className: 'btn btn-block icon icon-device-desktop' },
          'Add Project Folder'
        ),
        _reactForAtom.React.createElement(
          'button',
          {
            onClick: function () {
              return _this.runCommand('nuclide-remote-projects:connect');
            },
            className: 'btn btn-block icon icon-cloud-upload' },
          'Add Remote Project Folder'
        )
      );
    }
  }, {
    key: 'runCommand',
    value: function runCommand(command) {
      atom.commands.dispatch(atom.views.getView(atom.workspace), command);
    }
  }]);

  return EmptyComponent;
})(_reactForAtom.React.Component);

exports.EmptyComponent = EmptyComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVtcHR5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O0lBRXZCLGNBQWM7WUFBZCxjQUFjOztXQUFkLGNBQWM7MEJBQWQsY0FBYzs7K0JBQWQsY0FBYzs7O2VBQWQsY0FBYzs7V0FFbkIsa0JBQWlCOzs7QUFDckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsUUFBUTtRQUNyQjs7O0FBQ0UsbUJBQU8sRUFBRTtxQkFBTSxNQUFLLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQzthQUFBLEFBQUM7QUFDakUscUJBQVMsRUFBQyx3Q0FBd0M7O1NBRTNDO1FBQ1Q7OztBQUNFLG1CQUFPLEVBQUU7cUJBQU0sTUFBSyxVQUFVLENBQUMsaUNBQWlDLENBQUM7YUFBQSxBQUFDO0FBQ2xFLHFCQUFTLEVBQUMsc0NBQXNDOztTQUV6QztPQUNMLENBRU47S0FDSDs7O1dBRVMsb0JBQUMsT0FBZSxFQUFRO0FBQ2hDLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNyRTs7O1NBdEJVLGNBQWM7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkVtcHR5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5leHBvcnQgY2xhc3MgRW1wdHlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5ydW5Db21tYW5kKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLWJsb2NrIGljb24gaWNvbi1kZXZpY2UtZGVza3RvcFwiPlxuICAgICAgICAgIEFkZCBQcm9qZWN0IEZvbGRlclxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucnVuQ29tbWFuZCgnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcpfVxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tYmxvY2sgaWNvbiBpY29uLWNsb3VkLXVwbG9hZFwiPlxuICAgICAgICAgIEFkZCBSZW1vdGUgUHJvamVjdCBGb2xkZXJcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICk7XG4gIH1cblxuICBydW5Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgY29tbWFuZCk7XG4gIH1cblxufVxuIl19