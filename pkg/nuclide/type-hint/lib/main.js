function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('atom');

var Disposable = _require.Disposable;

var typeHintManager = null;

module.exports = {

  activate: function activate(state) {
    if (!typeHintManager) {
      var TypeHintManager = require('./TypeHintManager');
      typeHintManager = new TypeHintManager();
    }
  },

  consumeProvider: function consumeProvider(provider) {
    (0, _assert2['default'])(typeHintManager);
    typeHintManager.addProvider(provider);
    return new Disposable(function () {
      if (typeHintManager != null) {
        typeHintManager.removeProvider(provider);
      }
    });
  },

  deactivate: function deactivate() {
    if (typeHintManager) {
      typeHintManager.dispose();
      typeHintManager = null;
    }
  }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7OztlQUlULE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsWUFBVixVQUFVOztBQUVqQixJQUFJLGVBQXFDLEdBQUcsSUFBSSxDQUFDOztBQUVqRCxNQUFNLENBQUMsT0FBTyxHQUFHOztBQUVmLFVBQVEsRUFBQSxrQkFBQyxLQUFXLEVBQVE7QUFDMUIsUUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNwQixVQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxxQkFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7S0FDekM7R0FDRjs7QUFFRCxpQkFBZSxFQUFBLHlCQUFDLFFBQTBCLEVBQWM7QUFDdEQsNkJBQVUsZUFBZSxDQUFDLENBQUM7QUFDM0IsbUJBQWUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDdEMsV0FBTyxJQUFJLFVBQVUsQ0FBQyxZQUFNO0FBQzFCLFVBQUksZUFBZSxJQUFJLElBQUksRUFBRTtBQUMzQix1QkFBZSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztPQUMxQztLQUNGLENBQUMsQ0FBQztHQUNKOztBQUVELFlBQVUsRUFBQSxzQkFBRztBQUNYLFFBQUksZUFBZSxFQUFFO0FBQ25CLHFCQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDMUIscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7R0FDRjs7Q0FFRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB0eXBlIFR5cGVIaW50TWFuYWdlclR5cGUgZnJvbSAnLi9UeXBlSGludE1hbmFnZXInO1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmxldCB0eXBlSGludE1hbmFnZXI6ID9UeXBlSGludE1hbmFnZXJUeXBlID0gbnVsbDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9hbnkpOiB2b2lkIHtcbiAgICBpZiAoIXR5cGVIaW50TWFuYWdlcikge1xuICAgICAgY29uc3QgVHlwZUhpbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9UeXBlSGludE1hbmFnZXInKTtcbiAgICAgIHR5cGVIaW50TWFuYWdlciA9IG5ldyBUeXBlSGludE1hbmFnZXIoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZVByb3ZpZGVyKHByb3ZpZGVyOiBUeXBlSGludFByb3ZpZGVyKTogRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KHR5cGVIaW50TWFuYWdlcik7XG4gICAgdHlwZUhpbnRNYW5hZ2VyLmFkZFByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVIaW50TWFuYWdlciAhPSBudWxsKSB7XG4gICAgICAgIHR5cGVIaW50TWFuYWdlci5yZW1vdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICBpZiAodHlwZUhpbnRNYW5hZ2VyKSB7XG4gICAgICB0eXBlSGludE1hbmFnZXIuZGlzcG9zZSgpO1xuICAgICAgdHlwZUhpbnRNYW5hZ2VyID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbn07XG4iXX0=