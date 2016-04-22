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
exports.getHyperclickProvider = getHyperclickProvider;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _JSONOutlineProvider = require('./JSONOutlineProvider');

var _NPMHyperclickProvider = require('./NPMHyperclickProvider');

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

function getHyperclickProvider() {
  return (0, _NPMHyperclickProvider.getNPMHyperclickProvider)();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWNrQyxNQUFNOzttQ0FFZix1QkFBdUI7O3FDQUNULHlCQUF5Qjs7SUFFMUQsVUFBVTtBQUdILFdBSFAsVUFBVSxDQUdGLEtBQWMsRUFBRTswQkFIeEIsVUFBVTs7QUFJWixRQUFJLENBQUMsWUFBWSxHQUFHLCtCQUF5QixDQUFDO0dBQy9DOztlQUxHLFVBQVU7O1dBT1AsbUJBQVM7QUFDZCxVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0FURyxVQUFVOzs7QUFZaEIsSUFBSSxVQUF1QixHQUFHLElBQUksQ0FBQzs7QUFFNUIsU0FBUyxRQUFRLENBQUMsS0FBYyxFQUFRO0FBQzdDLE1BQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixjQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEM7Q0FDRjs7QUFFTSxTQUFTLFVBQVUsR0FBUztBQUNqQyxNQUFJLFVBQVUsSUFBSSxJQUFJLEVBQUU7QUFDdEIsY0FBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGNBQVUsR0FBRyxJQUFJLENBQUM7R0FDbkI7Q0FDRjs7QUFFTSxTQUFTLGVBQWUsR0FBb0I7QUFDakQsU0FBTztBQUNMLGlCQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUM7QUFDOUIsWUFBUSxFQUFFLENBQUM7QUFDWCxRQUFJLEVBQUUsY0FBYztBQUNwQixjQUFVLEVBQUEsb0JBQUMsTUFBdUIsRUFBcUI7QUFDckQsYUFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLHFDQUFXLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdEQ7R0FDRixDQUFDO0NBQ0g7O0FBRU0sU0FBUyxxQkFBcUIsR0FBdUI7QUFDMUQsU0FBTyxzREFBMEIsQ0FBQztDQUNuQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0h5cGVyY2xpY2tQcm92aWRlcn0gZnJvbSAnLi4vLi4vaHlwZXJjbGljayc7XG5pbXBvcnQgdHlwZSB7T3V0bGluZSwgT3V0bGluZVByb3ZpZGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLW91dGxpbmUtdmlldyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5cbmltcG9ydCB7Z2V0T3V0bGluZX0gZnJvbSAnLi9KU09OT3V0bGluZVByb3ZpZGVyJztcbmltcG9ydCB7Z2V0TlBNSHlwZXJjbGlja1Byb3ZpZGVyfSBmcm9tICcuL05QTUh5cGVyY2xpY2tQcm92aWRlcic7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuXG5leHBvcnQgZnVuY3Rpb24gYWN0aXZhdGUoc3RhdGU6ID9PYmplY3QpOiB2b2lkIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbihzdGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gIGlmIChhY3RpdmF0aW9uICE9IG51bGwpIHtcbiAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICBhY3RpdmF0aW9uID0gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZU91dGxpbmVzKCk6IE91dGxpbmVQcm92aWRlciB7XG4gIHJldHVybiB7XG4gICAgZ3JhbW1hclNjb3BlczogWydzb3VyY2UuanNvbiddLFxuICAgIHByaW9yaXR5OiAxLFxuICAgIG5hbWU6ICdOdWNsaWRlIEpTT04nLFxuICAgIGdldE91dGxpbmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPD9PdXRsaW5lPiB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGdldE91dGxpbmUoZWRpdG9yLmdldFRleHQoKSkpO1xuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIeXBlcmNsaWNrUHJvdmlkZXIoKTogSHlwZXJjbGlja1Byb3ZpZGVyIHtcbiAgcmV0dXJuIGdldE5QTUh5cGVyY2xpY2tQcm92aWRlcigpO1xufVxuIl19