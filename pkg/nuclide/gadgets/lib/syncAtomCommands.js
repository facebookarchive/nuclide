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

  return gadget$.debounce(500).distinctUntilChanged().forEach(function (gadgets) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bmNBdG9tQ29tbWFuZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQW1Cd0IsZ0JBQWdCOzs7Ozs7Ozs7Ozs7a0NBUlQsc0JBQXNCOzs7Ozs7Ozs7QUFRdEMsU0FBUyxnQkFBZ0IsQ0FDdEMsT0FBcUMsRUFDckMsV0FBbUIsRUFDTjtBQUNiLE1BQUksWUFBMEIsWUFBQSxDQUFDOztBQUUvQixTQUFPLE9BQU8sQ0FDWCxRQUFRLENBQUMsR0FBRyxDQUFDLENBQ2Isb0JBQW9CLEVBQUUsQ0FDdEIsT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJOzs7QUFHbEIsUUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLGtCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEI7O0FBRUQsUUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDL0Isa0JBQVksR0FBRyxxQ0FBbUIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3pEO0dBQ0YsQ0FBQyxDQUFDO0NBQ04iLCJmaWxlIjoic3luY0F0b21Db21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVBdG9tQ29tbWFuZHMgZnJvbSAnLi9jcmVhdGVBdG9tQ29tbWFuZHMnO1xuaW1wb3J0IHR5cGUgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdyeCc7XG5cbi8qKlxuICogS2VlcCB0aGUgQXRvbSBjb21tYW5kcyBpbiBzeW5jIHdpdGggdGhlIGFwcGxpY2F0aW9uIHN0YXRlLiBJZiB0aGUgcmV0dXJuZWQgc3Vic2NyaXB0aW9uIGlzXG4gKiBkaXNwb3NlZCwgdGhlIEF0b20gY29tbWFuZHMgd2lsbCBiZSByZW1vdmVkLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzeW5jQXRvbUNvbW1hbmRzKFxuICBnYWRnZXQkOiBSeC5PYnNlcnZhYmxlPEltbXV0YWJsZS5NYXA+LFxuICBhcHBDb21tYW5kczogT2JqZWN0LFxuKTogSURpc3Bvc2FibGUge1xuICBsZXQgYXRvbUNvbW1hbmRzOiA/SURpc3Bvc2FibGU7XG5cbiAgcmV0dXJuIGdhZGdldCRcbiAgICAuZGVib3VuY2UoNTAwKVxuICAgIC5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpXG4gICAgLmZvckVhY2goZ2FkZ2V0cyA9PiB7XG4gICAgICAvLyBBZGQgQXRvbSBjb21tYW5kcyBpZGVtcG90ZW50bHkuLi5cbiAgICAgIC8vIERpc3Bvc2Ugb2YgdGhlIHByZXZpb3VzIGNvbW1hbmRzLlxuICAgICAgaWYgKGF0b21Db21tYW5kcyAhPSBudWxsKSB7XG4gICAgICAgIGF0b21Db21tYW5kcy5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbmV3IG9uZXMuXG4gICAgICBpZiAoZ2FkZ2V0cyAmJiBnYWRnZXRzLnNpemUgPiAwKSB7XG4gICAgICAgIGF0b21Db21tYW5kcyA9IGNyZWF0ZUF0b21Db21tYW5kcyhnYWRnZXRzLCBhcHBDb21tYW5kcyk7XG4gICAgICB9XG4gICAgfSk7XG59XG4iXX0=