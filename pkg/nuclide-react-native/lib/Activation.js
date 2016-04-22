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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _debuggingDebuggingActivation = require('./debugging/DebuggingActivation');

var _packagerPackagerActivation = require('./packager/PackagerActivation');

var _shellShellActivation = require('./shell/ShellActivation');

var _atom = require('atom');

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable(this._debuggingActivation = new _debuggingDebuggingActivation.DebuggingActivation(), new _packagerPackagerActivation.PackagerActivation(), new _shellShellActivation.ShellActivation());
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }, {
    key: 'provideNuclideDebugger',
    value: function provideNuclideDebugger() {
      return this._debuggingActivation.provideNuclideDebugger();
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs0Q0Fha0MsaUNBQWlDOzswQ0FDbEMsK0JBQStCOztvQ0FDbEMseUJBQXlCOztvQkFDckIsTUFBTTs7SUFFM0IsVUFBVTtBQUlWLFdBSkEsVUFBVSxDQUlULEtBQWMsRUFBRTswQkFKakIsVUFBVTs7QUFLbkIsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIsSUFBSSxDQUFDLG9CQUFvQixHQUFHLHVEQUF5QixFQUNyRCxvREFBd0IsRUFDeEIsMkNBQXFCLENBQ3RCLENBQUM7R0FDSDs7ZUFWVSxVQUFVOztXQVlkLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRXFCLGtDQUE2QjtBQUNqRCxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0tBQzNEOzs7U0FsQlUsVUFBVSIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge251Y2xpZGVfZGVidWdnZXIkU2VydmljZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuXG5pbXBvcnQge0RlYnVnZ2luZ0FjdGl2YXRpb259IGZyb20gJy4vZGVidWdnaW5nL0RlYnVnZ2luZ0FjdGl2YXRpb24nO1xuaW1wb3J0IHtQYWNrYWdlckFjdGl2YXRpb259IGZyb20gJy4vcGFja2FnZXIvUGFja2FnZXJBY3RpdmF0aW9uJztcbmltcG9ydCB7U2hlbGxBY3RpdmF0aW9ufSBmcm9tICcuL3NoZWxsL1NoZWxsQWN0aXZhdGlvbic7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuXG5leHBvcnQgY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kZWJ1Z2dpbmdBY3RpdmF0aW9uOiBEZWJ1Z2dpbmdBY3RpdmF0aW9uO1xuICBfZGlzcG9zYWJsZXM6IElEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIHRoaXMuX2RlYnVnZ2luZ0FjdGl2YXRpb24gPSBuZXcgRGVidWdnaW5nQWN0aXZhdGlvbigpLFxuICAgICAgbmV3IFBhY2thZ2VyQWN0aXZhdGlvbigpLFxuICAgICAgbmV3IFNoZWxsQWN0aXZhdGlvbigpLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHByb3ZpZGVOdWNsaWRlRGVidWdnZXIoKTogbnVjbGlkZV9kZWJ1Z2dlciRTZXJ2aWNlIHtcbiAgICByZXR1cm4gdGhpcy5fZGVidWdnaW5nQWN0aXZhdGlvbi5wcm92aWRlTnVjbGlkZURlYnVnZ2VyKCk7XG4gIH1cblxufVxuIl19