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

var _nuclideDebuggerAtom = require('../../../nuclide-debugger-atom');

var _ReactNativeDebuggerInstance = require('./ReactNativeDebuggerInstance');

var ReactNativeProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(ReactNativeProcessInfo, _DebuggerProcessInfo);

  function ReactNativeProcessInfo(targetUri) {
    _classCallCheck(this, ReactNativeProcessInfo);

    _get(Object.getPrototypeOf(ReactNativeProcessInfo.prototype), 'constructor', this).call(this, 'react-native', targetUri);
  }

  _createClass(ReactNativeProcessInfo, [{
    key: 'debug',
    value: function debug() {
      // This is the port that the V8 debugger usually listens on.
      // TODO(matthewwithanm): Provide a way to override this in the UI.
      return Promise.resolve(new _ReactNativeDebuggerInstance.ReactNativeDebuggerInstance(this, 5858));
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      return 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this.getTargetUri();
    }
  }]);

  return ReactNativeProcessInfo;
})(_nuclideDebuggerAtom.DebuggerProcessInfo);

exports.ReactNativeProcessInfo = ReactNativeProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlYWN0TmF0aXZlUHJvY2Vzc0luZm8uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7bUNBYWtDLGdDQUFnQzs7MkNBQ3hCLCtCQUErQjs7SUFFNUQsc0JBQXNCO1lBQXRCLHNCQUFzQjs7QUFFdEIsV0FGQSxzQkFBc0IsQ0FFckIsU0FBcUIsRUFBRTswQkFGeEIsc0JBQXNCOztBQUcvQiwrQkFIUyxzQkFBc0IsNkNBR3pCLGNBQWMsRUFBRSxTQUFTLEVBQUU7R0FDbEM7O2VBSlUsc0JBQXNCOztXQU01QixpQkFBeUM7OztBQUc1QyxhQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsNkRBQWdDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3JFOzs7V0FFYSx3QkFBQyxLQUEwQixFQUFVO0FBQ2pELGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQzVCOzs7U0FsQlUsc0JBQXNCIiwiZmlsZSI6IlJlYWN0TmF0aXZlUHJvY2Vzc0luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuaW1wb3J0IHtSZWFjdE5hdGl2ZURlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4vUmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlJztcblxuZXhwb3J0IGNsYXNzIFJlYWN0TmF0aXZlUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmkpIHtcbiAgICBzdXBlcigncmVhY3QtbmF0aXZlJywgdGFyZ2V0VXJpKTtcbiAgfVxuXG4gIGRlYnVnKCk6IFByb21pc2U8UmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlPiB7XG4gICAgLy8gVGhpcyBpcyB0aGUgcG9ydCB0aGF0IHRoZSBWOCBkZWJ1Z2dlciB1c3VhbGx5IGxpc3RlbnMgb24uXG4gICAgLy8gVE9ETyhtYXR0aGV3d2l0aGFubSk6IFByb3ZpZGUgYSB3YXkgdG8gb3ZlcnJpZGUgdGhpcyBpbiB0aGUgVUkuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgUmVhY3ROYXRpdmVEZWJ1Z2dlckluc3RhbmNlKHRoaXMsIDU4NTgpKTtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIGRpc3BsYXlTdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUYXJnZXRVcmkoKTtcbiAgfVxuXG59XG4iXX0=