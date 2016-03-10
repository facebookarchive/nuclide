Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _atom = require('atom');

var _debuggingDebuggingActivation = require('./debugging/DebuggingActivation');

var _packagerPackagerActivation = require('./packager/PackagerActivation');

var _shellShellActivation = require('./shell/ShellActivation');

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable(new _debuggingDebuggingActivation.DebuggingActivation(), new _packagerPackagerActivation.PackagerActivation(), new _shellShellActivation.ShellActivation());
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

exports.Activation = Activation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQkFXa0MsTUFBTTs7NENBQ04saUNBQWlDOzswQ0FDbEMsK0JBQStCOztvQ0FDbEMseUJBQXlCOztJQUUxQyxVQUFVO0FBR1YsV0FIQSxVQUFVLENBR1QsS0FBYyxFQUFFOzBCQUhqQixVQUFVOztBQUluQixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQix1REFBeUIsRUFDekIsb0RBQXdCLEVBQ3hCLDJDQUFxQixDQUN0QixDQUFDO0dBQ0g7O2VBVFUsVUFBVTs7V0FXZCxtQkFBUztBQUNkLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQWJVLFVBQVUiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0RlYnVnZ2luZ0FjdGl2YXRpb259IGZyb20gJy4vZGVidWdnaW5nL0RlYnVnZ2luZ0FjdGl2YXRpb24nO1xuaW1wb3J0IHtQYWNrYWdlckFjdGl2YXRpb259IGZyb20gJy4vcGFja2FnZXIvUGFja2FnZXJBY3RpdmF0aW9uJztcbmltcG9ydCB7U2hlbGxBY3RpdmF0aW9ufSBmcm9tICcuL3NoZWxsL1NoZWxsQWN0aXZhdGlvbic7XG5cbmV4cG9ydCBjbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEZWJ1Z2dpbmdBY3RpdmF0aW9uKCksXG4gICAgICBuZXcgUGFja2FnZXJBY3RpdmF0aW9uKCksXG4gICAgICBuZXcgU2hlbGxBY3RpdmF0aW9uKCksXG4gICAgKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG5cbn1cbiJdfQ==