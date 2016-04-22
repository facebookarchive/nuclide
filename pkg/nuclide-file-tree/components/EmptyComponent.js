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

var _nuclideUiLibButton = require('../../nuclide-ui/lib/Button');

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
          _nuclideUiLibButton.Button,
          {
            onClick: function () {
              return _this.runCommand('application:add-project-folder');
            },
            icon: 'device-desktop',
            className: 'btn-block' },
          'Add Project Folder'
        ),
        _reactForAtom.React.createElement(
          _nuclideUiLibButton.Button,
          {
            onClick: function () {
              return _this.runCommand('nuclide-remote-projects:connect');
            },
            icon: 'cloud-upload',
            className: 'btn-block' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVtcHR5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQVdvQixnQkFBZ0I7O2tDQUNmLDZCQUE2Qjs7SUFFckMsY0FBYztZQUFkLGNBQWM7O1dBQWQsY0FBYzswQkFBZCxjQUFjOzsrQkFBZCxjQUFjOzs7ZUFBZCxjQUFjOztXQUVuQixrQkFBa0I7OztBQUN0QixhQUNFOztVQUFLLFNBQVMsRUFBQyxRQUFRO1FBQ3JCOzs7QUFDRSxtQkFBTyxFQUFFO3FCQUFNLE1BQUssVUFBVSxDQUFDLGdDQUFnQyxDQUFDO2FBQUEsQUFBQztBQUNqRSxnQkFBSSxFQUFDLGdCQUFnQjtBQUNyQixxQkFBUyxFQUFDLFdBQVc7O1NBRWQ7UUFDVDs7O0FBQ0UsbUJBQU8sRUFBRTtxQkFBTSxNQUFLLFVBQVUsQ0FBQyxpQ0FBaUMsQ0FBQzthQUFBLEFBQUM7QUFDbEUsZ0JBQUksRUFBQyxjQUFjO0FBQ25CLHFCQUFTLEVBQUMsV0FBVzs7U0FFZDtPQUNMLENBRU47S0FDSDs7O1dBRVMsb0JBQUMsT0FBZSxFQUFRO0FBQ2hDLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNyRTs7O1NBeEJVLGNBQWM7R0FBUyxvQkFBTSxTQUFTIiwiZmlsZSI6IkVtcHR5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtSZWFjdH0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHtCdXR0b259IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0J1dHRvbic7XG5cbmV4cG9ydCBjbGFzcyBFbXB0eUNvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCk6IFJlYWN0LkVsZW1lbnQge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZGRlZFwiPlxuICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gdGhpcy5ydW5Db21tYW5kKCdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInKX1cbiAgICAgICAgICBpY29uPVwiZGV2aWNlLWRlc2t0b3BcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0bi1ibG9ja1wiPlxuICAgICAgICAgIEFkZCBQcm9qZWN0IEZvbGRlclxuICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucnVuQ29tbWFuZCgnbnVjbGlkZS1yZW1vdGUtcHJvamVjdHM6Y29ubmVjdCcpfVxuICAgICAgICAgIGljb249XCJjbG91ZC11cGxvYWRcIlxuICAgICAgICAgIGNsYXNzTmFtZT1cImJ0bi1ibG9ja1wiPlxuICAgICAgICAgIEFkZCBSZW1vdGUgUHJvamVjdCBGb2xkZXJcbiAgICAgICAgPC9CdXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICk7XG4gIH1cblxuICBydW5Db21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IHZvaWQge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgY29tbWFuZCk7XG4gIH1cblxufVxuIl19