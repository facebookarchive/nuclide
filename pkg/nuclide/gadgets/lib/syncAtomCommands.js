Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = syncAtomCommands;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createAtomCommands = require('./createAtomCommands');

var _createAtomCommands2 = _interopRequireDefault(_createAtomCommands);

/**
 * Keep the Atom commands in sync with the application state. If the returned subscription is
 * disposed, the Atom commands will be removed.
 */

function syncAtomCommands(gadget$, appCommands) {
  var atomCommands = undefined;

  return gadget$.distinctUntilChanged().forEach(function (gadgets) {
    // Add Atom commands idempotently...
    // Dispose of the previous commands.
    if (atomCommands != null) {
      atomCommands.dispose();
    }
    // Add new ones.
    if (gadgets && gadgets.size > 0) {
      atomCommands = (0, _createAtomCommands2['default'])(gadgets, appCommands);
    }
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bmNBdG9tQ29tbWFuZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQW1Cd0IsZ0JBQWdCOzs7Ozs7Ozs7Ozs7a0NBUlQsc0JBQXNCOzs7Ozs7Ozs7QUFRdEMsU0FBUyxnQkFBZ0IsQ0FDdEMsT0FBcUMsRUFDckMsV0FBbUIsRUFDTjtBQUNiLE1BQUksWUFBMEIsWUFBQSxDQUFDOztBQUUvQixTQUFPLE9BQU8sQ0FDWCxvQkFBb0IsRUFBRSxDQUN0QixPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7OztBQUdsQixRQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7QUFDeEIsa0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7QUFFRCxRQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUMvQixrQkFBWSxHQUFHLHFDQUFtQixPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDekQ7R0FDRixDQUFDLENBQUM7Q0FDTiIsImZpbGUiOiJzeW5jQXRvbUNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNyZWF0ZUF0b21Db21tYW5kcyBmcm9tICcuL2NyZWF0ZUF0b21Db21tYW5kcyc7XG5pbXBvcnQgdHlwZSBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcblxuLyoqXG4gKiBLZWVwIHRoZSBBdG9tIGNvbW1hbmRzIGluIHN5bmMgd2l0aCB0aGUgYXBwbGljYXRpb24gc3RhdGUuIElmIHRoZSByZXR1cm5lZCBzdWJzY3JpcHRpb24gaXNcbiAqIGRpc3Bvc2VkLCB0aGUgQXRvbSBjb21tYW5kcyB3aWxsIGJlIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHN5bmNBdG9tQ29tbWFuZHMoXG4gIGdhZGdldCQ6IFJ4Lk9ic2VydmFibGU8SW1tdXRhYmxlLk1hcD4sXG4gIGFwcENvbW1hbmRzOiBPYmplY3QsXG4pOiBJRGlzcG9zYWJsZSB7XG4gIGxldCBhdG9tQ29tbWFuZHM6ID9JRGlzcG9zYWJsZTtcblxuICByZXR1cm4gZ2FkZ2V0JFxuICAgIC5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpXG4gICAgLmZvckVhY2goZ2FkZ2V0cyA9PiB7XG4gICAgICAvLyBBZGQgQXRvbSBjb21tYW5kcyBpZGVtcG90ZW50bHkuLi5cbiAgICAgIC8vIERpc3Bvc2Ugb2YgdGhlIHByZXZpb3VzIGNvbW1hbmRzLlxuICAgICAgaWYgKGF0b21Db21tYW5kcyAhPSBudWxsKSB7XG4gICAgICAgIGF0b21Db21tYW5kcy5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbmV3IG9uZXMuXG4gICAgICBpZiAoZ2FkZ2V0cyAmJiBnYWRnZXRzLnNpemUgPiAwKSB7XG4gICAgICAgIGF0b21Db21tYW5kcyA9IGNyZWF0ZUF0b21Db21tYW5kcyhnYWRnZXRzLCBhcHBDb21tYW5kcyk7XG4gICAgICB9XG4gICAgfSk7XG59XG4iXX0=