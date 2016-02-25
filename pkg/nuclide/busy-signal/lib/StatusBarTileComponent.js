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

var SPINNER = '';

/* eslint-disable react/prop-types */

var StatusBarTileComponent = (function (_React$Component) {
  _inherits(StatusBarTileComponent, _React$Component);

  function StatusBarTileComponent(props) {
    _classCallCheck(this, StatusBarTileComponent);

    _get(Object.getPrototypeOf(StatusBarTileComponent.prototype), 'constructor', this).call(this, props);
  }

  _createClass(StatusBarTileComponent, [{
    key: 'render',
    value: function render() {
      var classes = ['nuclide-busy-signal-status-bar'];
      if (this.props.busy) {
        classes.push('nuclide-busy-signal-status-bar-busy');
      } else {
        classes.push('nuclide-busy-signal-status-bar-idle');
      }
      return _reactForAtom.React.createElement(
        'div',
        { className: classes.join(' ') },
        SPINNER
      );
    }
  }]);

  return StatusBarTileComponent;
})(_reactForAtom.React.Component);

exports.StatusBarTileComponent = StatusBarTileComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlN0YXR1c0JhclRpbGVDb21wb25lbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJBV29CLGdCQUFnQjs7QUFNcEMsSUFBTSxPQUFPLEdBQUcsR0FBUSxDQUFDOzs7O0lBR1osc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFHdEIsV0FIQSxzQkFBc0IsQ0FHckIsS0FBWSxFQUFFOzBCQUhmLHNCQUFzQjs7QUFJL0IsK0JBSlMsc0JBQXNCLDZDQUl6QixLQUFLLEVBQUU7R0FDZDs7ZUFMVSxzQkFBc0I7O1dBTzNCLGtCQUFpQjtBQUNyQixVQUFNLE9BQU8sR0FBRyxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDbkQsVUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtBQUNuQixlQUFPLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxDQUFDLENBQUM7T0FDckQsTUFBTTtBQUNMLGVBQU8sQ0FBQyxJQUFJLENBQUMscUNBQXFDLENBQUMsQ0FBQztPQUNyRDtBQUNELGFBQ0U7O1VBQUssU0FBUyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEFBQUM7UUFBRSxPQUFPO09BQU8sQ0FDbEQ7S0FDSDs7O1NBakJVLHNCQUFzQjtHQUFTLG9CQUFNLFNBQVMiLCJmaWxlIjoiU3RhdHVzQmFyVGlsZUNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxudHlwZSBQcm9wcyA9IHtcbiAgYnVzeTogYm9vbGVhbjtcbn1cblxuY29uc3QgU1BJTk5FUiA9ICdcXHVGMDg3JztcblxuLyogZXNsaW50LWRpc2FibGUgcmVhY3QvcHJvcC10eXBlcyAqL1xuZXhwb3J0IGNsYXNzIFN0YXR1c0JhclRpbGVDb21wb25lbnQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBwcm9wczogUHJvcHM7XG5cbiAgY29uc3RydWN0b3IocHJvcHM6IFByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgcmVuZGVyKCk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2xhc3NlcyA9IFsnbnVjbGlkZS1idXN5LXNpZ25hbC1zdGF0dXMtYmFyJ107XG4gICAgaWYgKHRoaXMucHJvcHMuYnVzeSkge1xuICAgICAgY2xhc3Nlcy5wdXNoKCdudWNsaWRlLWJ1c3ktc2lnbmFsLXN0YXR1cy1iYXItYnVzeScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjbGFzc2VzLnB1c2goJ251Y2xpZGUtYnVzeS1zaWduYWwtc3RhdHVzLWJhci1pZGxlJyk7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3Nlcy5qb2luKCcgJyl9PntTUElOTkVSfTwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==