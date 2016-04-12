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

exports.activate = activate;
exports.deactivate = deactivate;
exports.provideOutlines = provideOutlines;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _JSONOutlineProvider = require('./JSONOutlineProvider');

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable();
  }

  _createClass(Activation, [{
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;

function activate(state) {
  if (activation == null) {
    activation = new Activation(state);
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function provideOutlines() {
  return {
    grammarScopes: ['source.json'],
    priority: 1,
    name: 'Nuclide JSON',
    getOutline: function getOutline(editor) {
      return Promise.resolve((0, _JSONOutlineProvider.getOutline)(editor.getText()));
    }
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYWtDLE1BQU07O21DQUVmLHVCQUF1Qjs7SUFFMUMsVUFBVTtBQUdILFdBSFAsVUFBVSxDQUdGLEtBQWMsRUFBRTswQkFIeEIsVUFBVTs7QUFJWixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0dBQy9DOztlQUxHLFVBQVU7O1dBT1AsbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0FURyxVQUFVOzs7QUFZaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEM7Q0FDRjs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQyxNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRjs7QUFFTSxTQUFTLGVBQWUsR0FBb0I7QUFDakQsU0FBTztBQUNMLGlCQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDOUIsWUFBUSxFQUFFLENBQUM7QUFDWCxRQUFJLEVBQUUsY0FBYztBQUNwQixjQUFVLEVBQUEsb0JBQUMsTUFBdUIsRUFBcUI7QUFDckQsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLHFDQUFXLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdEQ7R0FDRixDQUFDO0NBQ0giLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtPdXRsaW5lLCBPdXRsaW5lUHJvdmlkZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtb3V0bGluZS12aWV3JztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcblxuaW1wb3J0IHtnZXRPdXRsaW5lfSBmcm9tICcuL0pTT05PdXRsaW5lUHJvdmlkZXInO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubGV0IGFjdGl2YXRpb246ID9BY3RpdmF0aW9uID0gbnVsbDtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KTogdm9pZCB7XG4gIGlmIChhY3RpdmF0aW9uID09IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uID0gbmV3IEFjdGl2YXRpb24oc3RhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICBpZiAoYWN0aXZhdGlvbiAhPSBudWxsKSB7XG4gICAgYWN0aXZhdGlvbi5kaXNwb3NlKCk7XG4gICAgYWN0aXZhdGlvbiA9IG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVPdXRsaW5lcygpOiBPdXRsaW5lUHJvdmlkZXIge1xuICByZXR1cm4ge1xuICAgIGdyYW1tYXJTY29wZXM6IFsnc291cmNlLmpzb24nXSxcbiAgICBwcmlvcml0eTogMSxcbiAgICBuYW1lOiAnTnVjbGlkZSBKU09OJyxcbiAgICBnZXRPdXRsaW5lKGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTw/T3V0bGluZT4ge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShnZXRPdXRsaW5lKGVkaXRvci5nZXRUZXh0KCkpKTtcbiAgICB9LFxuICB9O1xufVxuIl19