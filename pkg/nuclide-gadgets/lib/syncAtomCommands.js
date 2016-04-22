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

  return gadget$.distinctUntilChanged().subscribe(function (gadgets) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bmNBdG9tQ29tbWFuZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQW9Cd0IsZ0JBQWdCOzs7Ozs7Ozs7Ozs7a0NBVFQsc0JBQXNCOzs7Ozs7Ozs7QUFTdEMsU0FBUyxnQkFBZ0IsQ0FDdEMsT0FBcUMsRUFDckMsV0FBcUIsRUFDSDtBQUNsQixNQUFJLFlBQTBCLFlBQUEsQ0FBQzs7QUFFL0IsU0FBTyxPQUFPLENBQ1gsb0JBQW9CLEVBQUUsQ0FDdEIsU0FBUyxDQUFDLFVBQUEsT0FBTyxFQUFJOzs7QUFHcEIsUUFBSSxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ3hCLGtCQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDeEI7O0FBRUQsUUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUU7QUFDL0Isa0JBQVksR0FBRyxxQ0FBbUIsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQ3pEO0dBQ0YsQ0FBQyxDQUFDO0NBQ04iLCJmaWxlIjoic3luY0F0b21Db21tYW5kcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBjcmVhdGVBdG9tQ29tbWFuZHMgZnJvbSAnLi9jcmVhdGVBdG9tQ29tbWFuZHMnO1xuaW1wb3J0IHR5cGUgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgdHlwZSBSeCBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuaW1wb3J0IHR5cGUgQ29tbWFuZHMgZnJvbSAnLi9Db21tYW5kcyc7XG5cbi8qKlxuICogS2VlcCB0aGUgQXRvbSBjb21tYW5kcyBpbiBzeW5jIHdpdGggdGhlIGFwcGxpY2F0aW9uIHN0YXRlLiBJZiB0aGUgcmV0dXJuZWQgc3Vic2NyaXB0aW9uIGlzXG4gKiBkaXNwb3NlZCwgdGhlIEF0b20gY29tbWFuZHMgd2lsbCBiZSByZW1vdmVkLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzeW5jQXRvbUNvbW1hbmRzKFxuICBnYWRnZXQkOiBSeC5PYnNlcnZhYmxlPEltbXV0YWJsZS5NYXA+LFxuICBhcHBDb21tYW5kczogQ29tbWFuZHMsXG4pOiByeCRJU3Vic2NyaXB0aW9uIHtcbiAgbGV0IGF0b21Db21tYW5kczogP0lEaXNwb3NhYmxlO1xuXG4gIHJldHVybiBnYWRnZXQkXG4gICAgLmRpc3RpbmN0VW50aWxDaGFuZ2VkKClcbiAgICAuc3Vic2NyaWJlKGdhZGdldHMgPT4ge1xuICAgICAgLy8gQWRkIEF0b20gY29tbWFuZHMgaWRlbXBvdGVudGx5Li4uXG4gICAgICAvLyBEaXNwb3NlIG9mIHRoZSBwcmV2aW91cyBjb21tYW5kcy5cbiAgICAgIGlmIChhdG9tQ29tbWFuZHMgIT0gbnVsbCkge1xuICAgICAgICBhdG9tQ29tbWFuZHMuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgICAgLy8gQWRkIG5ldyBvbmVzLlxuICAgICAgaWYgKGdhZGdldHMgJiYgZ2FkZ2V0cy5zaXplID4gMCkge1xuICAgICAgICBhdG9tQ29tbWFuZHMgPSBjcmVhdGVBdG9tQ29tbWFuZHMoZ2FkZ2V0cywgYXBwQ29tbWFuZHMpO1xuICAgICAgfVxuICAgIH0pO1xufVxuIl19