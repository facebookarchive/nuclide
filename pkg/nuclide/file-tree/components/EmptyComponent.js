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

var React = require('react-for-atom');

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

      return React.createElement(
        'div',
        { className: 'padded' },
        React.createElement(
          'button',
          {
            onClick: function () {
              return _this.runCommand('application:add-project-folder');
            },
            className: 'btn btn-block icon icon-device-desktop' },
          'Add Project Folder'
        ),
        React.createElement(
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
})(React.Component);

module.exports = EmptyComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVtcHR5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFXQSxJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7SUFFbEMsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOzs7ZUFBZCxjQUFjOztXQUVaLGtCQUFpQjs7O0FBQ3JCLGFBQ0U7O1VBQUssU0FBUyxFQUFDLFFBQVE7UUFDckI7OztBQUNFLG1CQUFPLEVBQUU7cUJBQU0sTUFBSyxVQUFVLENBQUMsZ0NBQWdDLENBQUM7YUFBQSxBQUFDO0FBQ2pFLHFCQUFTLEVBQUMsd0NBQXdDOztTQUUzQztRQUNUOzs7QUFDRSxtQkFBTyxFQUFFO3FCQUFNLE1BQUssVUFBVSxDQUFDLGlDQUFpQyxDQUFDO2FBQUEsQUFBQztBQUNsRSxxQkFBUyxFQUFDLHNDQUFzQzs7U0FFekM7T0FDTCxDQUVOO0tBQ0g7OztXQUVTLG9CQUFDLE9BQWUsRUFBUTtBQUNoQyxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckU7OztTQXRCRyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O0FBMEI1QyxNQUFNLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyIsImZpbGUiOiJFbXB0eUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QtZm9yLWF0b20nKTtcblxuY2xhc3MgRW1wdHlDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpOiBSZWFjdEVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5ydW5Db21tYW5kKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLWJsb2NrIGljb24gaWNvbi1kZXZpY2UtZGVza3RvcFwiPlxuICAgICAgICAgIEFkZCBQcm9qZWN0IEZvbGRlclxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucnVuQ29tbWFuZCgnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcpfVxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBidG4tYmxvY2sgaWNvbiBpY29uLWNsb3VkLXVwbG9hZFwiPlxuICAgICAgICAgIEFkZCBSZW1vdGUgUHJvamVjdCBGb2xkZXJcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICk7XG4gIH1cblxuICBydW5Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgY29tbWFuZCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEVtcHR5Q29tcG9uZW50O1xuIl19