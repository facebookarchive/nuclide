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

var _require = require('react-for-atom');

var React = _require.React;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkVtcHR5Q29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7ZUFXZ0IsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUFsQyxLQUFLLFlBQUwsS0FBSzs7SUFFTixjQUFjO1lBQWQsY0FBYzs7V0FBZCxjQUFjOzBCQUFkLGNBQWM7OytCQUFkLGNBQWM7OztlQUFkLGNBQWM7O1dBRVosa0JBQWlCOzs7QUFDckIsYUFDRTs7VUFBSyxTQUFTLEVBQUMsUUFBUTtRQUNyQjs7O0FBQ0UsbUJBQU8sRUFBRTtxQkFBTSxNQUFLLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQzthQUFBLEFBQUM7QUFDakUscUJBQVMsRUFBQyx3Q0FBd0M7O1NBRTNDO1FBQ1Q7OztBQUNFLG1CQUFPLEVBQUU7cUJBQU0sTUFBSyxVQUFVLENBQUMsaUNBQWlDLENBQUM7YUFBQSxBQUFDO0FBQ2xFLHFCQUFTLEVBQUMsc0NBQXNDOztTQUV6QztPQUNMLENBRU47S0FDSDs7O1dBRVMsb0JBQUMsT0FBZSxFQUFRO0FBQ2hDLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNyRTs7O1NBdEJHLGNBQWM7R0FBUyxLQUFLLENBQUMsU0FBUzs7QUEwQjVDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDIiwiZmlsZSI6IkVtcHR5Q29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuY29uc3Qge1JlYWN0fSA9IHJlcXVpcmUoJ3JlYWN0LWZvci1hdG9tJyk7XG5cbmNsYXNzIEVtcHR5Q29tcG9uZW50IGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKTogUmVhY3RFbGVtZW50IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWRkZWRcIj5cbiAgICAgICAgPGJ1dHRvblxuICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHRoaXMucnVuQ29tbWFuZCgnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyl9XG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1ibG9jayBpY29uIGljb24tZGV2aWNlLWRlc2t0b3BcIj5cbiAgICAgICAgICBBZGQgUHJvamVjdCBGb2xkZXJcbiAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB0aGlzLnJ1bkNvbW1hbmQoJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnKX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLWJsb2NrIGljb24gaWNvbi1jbG91ZC11cGxvYWRcIj5cbiAgICAgICAgICBBZGQgUmVtb3RlIFByb2plY3QgRm9sZGVyXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICApO1xuICB9XG5cbiAgcnVuQ29tbWFuZChjb21tYW5kOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksIGNvbW1hbmQpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFbXB0eUNvbXBvbmVudDtcbiJdfQ==