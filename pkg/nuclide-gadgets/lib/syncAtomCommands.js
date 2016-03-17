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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bmNBdG9tQ29tbWFuZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQW9Cd0IsZ0JBQWdCOzs7Ozs7Ozs7Ozs7a0NBVFQsc0JBQXNCOzs7Ozs7Ozs7QUFTdEMsU0FBUyxnQkFBZ0IsQ0FDdEMsT0FBcUMsRUFDckMsV0FBcUIsRUFDUjtBQUNiLE1BQUksWUFBMEIsWUFBQSxDQUFDOztBQUUvQixTQUFPLE9BQU8sQ0FDWCxvQkFBb0IsRUFBRSxDQUN0QixPQUFPLENBQUMsVUFBQSxPQUFPLEVBQUk7OztBQUdsQixRQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7QUFDeEIsa0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN4Qjs7QUFFRCxRQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRTtBQUMvQixrQkFBWSxHQUFHLHFDQUFtQixPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7S0FDekQ7R0FDRixDQUFDLENBQUM7Q0FDTiIsImZpbGUiOiJzeW5jQXRvbUNvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNyZWF0ZUF0b21Db21tYW5kcyBmcm9tICcuL2NyZWF0ZUF0b21Db21tYW5kcyc7XG5pbXBvcnQgdHlwZSBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB0eXBlIFJ4IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIENvbW1hbmRzIGZyb20gJy4vQ29tbWFuZHMnO1xuXG4vKipcbiAqIEtlZXAgdGhlIEF0b20gY29tbWFuZHMgaW4gc3luYyB3aXRoIHRoZSBhcHBsaWNhdGlvbiBzdGF0ZS4gSWYgdGhlIHJldHVybmVkIHN1YnNjcmlwdGlvbiBpc1xuICogZGlzcG9zZWQsIHRoZSBBdG9tIGNvbW1hbmRzIHdpbGwgYmUgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3luY0F0b21Db21tYW5kcyhcbiAgZ2FkZ2V0JDogUnguT2JzZXJ2YWJsZTxJbW11dGFibGUuTWFwPixcbiAgYXBwQ29tbWFuZHM6IENvbW1hbmRzLFxuKTogSURpc3Bvc2FibGUge1xuICBsZXQgYXRvbUNvbW1hbmRzOiA/SURpc3Bvc2FibGU7XG5cbiAgcmV0dXJuIGdhZGdldCRcbiAgICAuZGlzdGluY3RVbnRpbENoYW5nZWQoKVxuICAgIC5mb3JFYWNoKGdhZGdldHMgPT4ge1xuICAgICAgLy8gQWRkIEF0b20gY29tbWFuZHMgaWRlbXBvdGVudGx5Li4uXG4gICAgICAvLyBEaXNwb3NlIG9mIHRoZSBwcmV2aW91cyBjb21tYW5kcy5cbiAgICAgIGlmIChhdG9tQ29tbWFuZHMgIT0gbnVsbCkge1xuICAgICAgICBhdG9tQ29tbWFuZHMuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIG5ldyBvbmVzLlxuICAgICAgaWYgKGdhZGdldHMgJiYgZ2FkZ2V0cy5zaXplID4gMCkge1xuICAgICAgICBhdG9tQ29tbWFuZHMgPSBjcmVhdGVBdG9tQ29tbWFuZHMoZ2FkZ2V0cywgYXBwQ29tbWFuZHMpO1xuICAgICAgfVxuICAgIH0pO1xufVxuIl19