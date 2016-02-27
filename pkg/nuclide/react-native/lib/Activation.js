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

var Activation = (function () {
  function Activation(state) {
    _classCallCheck(this, Activation);

    this._disposables = new _atom.CompositeDisposable(new _debuggingDebuggingActivation.DebuggingActivation(), new _packagerPackagerActivation.PackagerActivation());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQkFXa0MsTUFBTTs7NENBQ04saUNBQWlDOzswQ0FDbEMsK0JBQStCOztJQUVuRCxVQUFVO0FBR1YsV0FIQSxVQUFVLENBR1QsS0FBYyxFQUFFOzBCQUhqQixVQUFVOztBQUluQixRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQix1REFBeUIsRUFDekIsb0RBQXdCLENBQ3pCLENBQUM7R0FDSDs7ZUFSVSxVQUFVOztXQVVkLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBWlUsVUFBVSIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RGVidWdnaW5nQWN0aXZhdGlvbn0gZnJvbSAnLi9kZWJ1Z2dpbmcvRGVidWdnaW5nQWN0aXZhdGlvbic7XG5pbXBvcnQge1BhY2thZ2VyQWN0aXZhdGlvbn0gZnJvbSAnLi9wYWNrYWdlci9QYWNrYWdlckFjdGl2YXRpb24nO1xuXG5leHBvcnQgY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGVidWdnaW5nQWN0aXZhdGlvbigpLFxuICAgICAgbmV3IFBhY2thZ2VyQWN0aXZhdGlvbigpLFxuICAgICk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG4iXX0=