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

var PACKAGE_NAME = 'nuclide-type-hint';

module.exports = {

  activate: function activate(state) {
    if (!typeHintManager) {
      var TypeHintManager = require('./TypeHintManager');
      typeHintManager = new TypeHintManager();
    }
  },

  consumeTypehintProvider: function consumeTypehintProvider(provider) {
    (0, _assert2['default'])(typeHintManager);
    typeHintManager.addProvider(provider);
    return new Disposable(function () {
      if (typeHintManager != null) {
        typeHintManager.removeProvider(provider);
      }
    });
  },

  createDatatipProvider: function createDatatipProvider() {
    (0, _assert2['default'])(typeHintManager);
    var datatip = typeHintManager.datatip.bind(typeHintManager);
    return {
      validForScope: function validForScope() {
        return true;
      }, // TODO
      providerName: PACKAGE_NAME,
      inclusionPriority: 1,
      datatip: datatip
    };
  },

  deactivate: function deactivate() {
    if (typeHintManager) {
      typeHintManager = null;
    }
  }

};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7OztlQUlULE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsWUFBVixVQUFVOztBQUVqQixJQUFJLGVBQXFDLEdBQUcsSUFBSSxDQUFDOztBQUVqRCxJQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQzs7QUFFekMsTUFBTSxDQUFDLE9BQU8sR0FBRzs7QUFFZixVQUFRLEVBQUEsa0JBQUMsS0FBVyxFQUFRO0FBQzFCLFFBQUksQ0FBQyxlQUFlLEVBQUU7QUFDcEIsVUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckQscUJBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0tBQ3pDO0dBQ0Y7O0FBRUQseUJBQXVCLEVBQUEsaUNBQUMsUUFBMEIsRUFBZTtBQUMvRCw2QkFBVSxlQUFlLENBQUMsQ0FBQztBQUMzQixtQkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN0QyxXQUFPLElBQUksVUFBVSxDQUFDLFlBQU07QUFDMUIsVUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO0FBQzNCLHVCQUFlLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzFDO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsdUJBQXFCLEVBQUEsaUNBQVc7QUFDOUIsNkJBQVUsZUFBZSxDQUFDLENBQUM7QUFDM0IsUUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDOUQsV0FBTztBQUNMLG1CQUFhLEVBQUU7ZUFBTSxJQUFJO09BQUE7QUFDekIsa0JBQVksRUFBRSxZQUFZO0FBQzFCLHVCQUFpQixFQUFFLENBQUM7QUFDcEIsYUFBTyxFQUFQLE9BQU87S0FDUixDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxlQUFlLEVBQUU7QUFDbkIscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7R0FDRjs7Q0FFRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vdHlwZS1oaW50LWludGVyZmFjZXMnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB0eXBlIFR5cGVIaW50TWFuYWdlclR5cGUgZnJvbSAnLi9UeXBlSGludE1hbmFnZXInO1xuXG5jb25zdCB7RGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmxldCB0eXBlSGludE1hbmFnZXI6ID9UeXBlSGludE1hbmFnZXJUeXBlID0gbnVsbDtcblxuY29uc3QgUEFDS0FHRV9OQU1FID0gJ251Y2xpZGUtdHlwZS1oaW50JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWN0aXZhdGUoc3RhdGU6ID9hbnkpOiB2b2lkIHtcbiAgICBpZiAoIXR5cGVIaW50TWFuYWdlcikge1xuICAgICAgY29uc3QgVHlwZUhpbnRNYW5hZ2VyID0gcmVxdWlyZSgnLi9UeXBlSGludE1hbmFnZXInKTtcbiAgICAgIHR5cGVIaW50TWFuYWdlciA9IG5ldyBUeXBlSGludE1hbmFnZXIoKTtcbiAgICB9XG4gIH0sXG5cbiAgY29uc3VtZVR5cGVoaW50UHJvdmlkZXIocHJvdmlkZXI6IFR5cGVIaW50UHJvdmlkZXIpOiBJRGlzcG9zYWJsZSB7XG4gICAgaW52YXJpYW50KHR5cGVIaW50TWFuYWdlcik7XG4gICAgdHlwZUhpbnRNYW5hZ2VyLmFkZFByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICByZXR1cm4gbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgaWYgKHR5cGVIaW50TWFuYWdlciAhPSBudWxsKSB7XG4gICAgICAgIHR5cGVIaW50TWFuYWdlci5yZW1vdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgY3JlYXRlRGF0YXRpcFByb3ZpZGVyKCk6IE9iamVjdCB7XG4gICAgaW52YXJpYW50KHR5cGVIaW50TWFuYWdlcik7XG4gICAgY29uc3QgZGF0YXRpcCA9IHR5cGVIaW50TWFuYWdlci5kYXRhdGlwLmJpbmQodHlwZUhpbnRNYW5hZ2VyKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmFsaWRGb3JTY29wZTogKCkgPT4gdHJ1ZSwgLy8gVE9ET1xuICAgICAgcHJvdmlkZXJOYW1lOiBQQUNLQUdFX05BTUUsXG4gICAgICBpbmNsdXNpb25Qcmlvcml0eTogMSxcbiAgICAgIGRhdGF0aXAsXG4gICAgfTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmICh0eXBlSGludE1hbmFnZXIpIHtcbiAgICAgIHR5cGVIaW50TWFuYWdlciA9IG51bGw7XG4gICAgfVxuICB9LFxuXG59O1xuIl19