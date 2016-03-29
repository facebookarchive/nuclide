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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztzQkFhc0IsUUFBUTs7OztlQUlULE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQTdCLFVBQVUsWUFBVixVQUFVOztBQUVqQixJQUFJLGVBQXFDLEdBQUcsSUFBSSxDQUFDOztBQUVqRCxJQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQzs7QUFFekMsTUFBTSxDQUFDLE9BQU8sR0FBRzs7QUFFZixVQUFRLEVBQUEsa0JBQUMsS0FBVyxFQUFRO0FBQzFCLFFBQUksQ0FBQyxlQUFlLEVBQUU7QUFDcEIsVUFBTSxlQUFlLEdBQUcsT0FBTyxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckQscUJBQWUsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO0tBQ3pDO0dBQ0Y7O0FBRUQseUJBQXVCLEVBQUEsaUNBQUMsUUFBMEIsRUFBZTtBQUMvRCw2QkFBVSxlQUFlLENBQUMsQ0FBQztBQUMzQixtQkFBZSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN0QyxXQUFPLElBQUksVUFBVSxDQUFDLFlBQU07QUFDMUIsVUFBSSxlQUFlLElBQUksSUFBSSxFQUFFO0FBQzNCLHVCQUFlLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzFDO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7O0FBRUQsdUJBQXFCLEVBQUEsaUNBQVc7QUFDOUIsNkJBQVUsZUFBZSxDQUFDLENBQUM7QUFDM0IsUUFBTSxPQUFPLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDOUQsV0FBTztBQUNMLG1CQUFhLEVBQUU7ZUFBTSxJQUFJO09BQUE7QUFDekIsa0JBQVksRUFBRSxZQUFZO0FBQzFCLHVCQUFpQixFQUFFLENBQUM7QUFDcEIsYUFBTyxFQUFQLE9BQU87S0FDUixDQUFDO0dBQ0g7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxlQUFlLEVBQUU7QUFDbkIscUJBQWUsR0FBRyxJQUFJLENBQUM7S0FDeEI7R0FDRjs7Q0FFRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7VHlwZUhpbnRQcm92aWRlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS10eXBlLWhpbnQtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUgVHlwZUhpbnRNYW5hZ2VyVHlwZSBmcm9tICcuL1R5cGVIaW50TWFuYWdlcic7XG5cbmNvbnN0IHtEaXNwb3NhYmxlfSA9IHJlcXVpcmUoJ2F0b20nKTtcblxubGV0IHR5cGVIaW50TWFuYWdlcjogP1R5cGVIaW50TWFuYWdlclR5cGUgPSBudWxsO1xuXG5jb25zdCBQQUNLQUdFX05BTUUgPSAnbnVjbGlkZS10eXBlLWhpbnQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY3RpdmF0ZShzdGF0ZTogP2FueSk6IHZvaWQge1xuICAgIGlmICghdHlwZUhpbnRNYW5hZ2VyKSB7XG4gICAgICBjb25zdCBUeXBlSGludE1hbmFnZXIgPSByZXF1aXJlKCcuL1R5cGVIaW50TWFuYWdlcicpO1xuICAgICAgdHlwZUhpbnRNYW5hZ2VyID0gbmV3IFR5cGVIaW50TWFuYWdlcigpO1xuICAgIH1cbiAgfSxcblxuICBjb25zdW1lVHlwZWhpbnRQcm92aWRlcihwcm92aWRlcjogVHlwZUhpbnRQcm92aWRlcik6IElEaXNwb3NhYmxlIHtcbiAgICBpbnZhcmlhbnQodHlwZUhpbnRNYW5hZ2VyKTtcbiAgICB0eXBlSGludE1hbmFnZXIuYWRkUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBpZiAodHlwZUhpbnRNYW5hZ2VyICE9IG51bGwpIHtcbiAgICAgICAgdHlwZUhpbnRNYW5hZ2VyLnJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBjcmVhdGVEYXRhdGlwUHJvdmlkZXIoKTogT2JqZWN0IHtcbiAgICBpbnZhcmlhbnQodHlwZUhpbnRNYW5hZ2VyKTtcbiAgICBjb25zdCBkYXRhdGlwID0gdHlwZUhpbnRNYW5hZ2VyLmRhdGF0aXAuYmluZCh0eXBlSGludE1hbmFnZXIpO1xuICAgIHJldHVybiB7XG4gICAgICB2YWxpZEZvclNjb3BlOiAoKSA9PiB0cnVlLCAvLyBUT0RPXG4gICAgICBwcm92aWRlck5hbWU6IFBBQ0tBR0VfTkFNRSxcbiAgICAgIGluY2x1c2lvblByaW9yaXR5OiAxLFxuICAgICAgZGF0YXRpcCxcbiAgICB9O1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgaWYgKHR5cGVIaW50TWFuYWdlcikge1xuICAgICAgdHlwZUhpbnRNYW5hZ2VyID0gbnVsbDtcbiAgICB9XG4gIH0sXG5cbn07XG4iXX0=