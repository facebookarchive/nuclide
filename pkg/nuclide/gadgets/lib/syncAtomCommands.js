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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN5bmNBdG9tQ29tbWFuZHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O3FCQW1Cd0IsZ0JBQWdCOzs7Ozs7Ozs7Ozs7a0NBUlQsc0JBQXNCOzs7Ozs7Ozs7QUFRdEMsU0FBUyxnQkFBZ0IsQ0FDdEMsT0FBcUMsRUFDckMsV0FBbUIsRUFDSDtBQUNoQixNQUFJLFlBQStCLFlBQUEsQ0FBQzs7QUFFcEMsU0FBTyxPQUFPLENBQ1gsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUNiLG9CQUFvQixFQUFFLENBQ3RCLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTs7O0FBR2xCLFFBQUksWUFBWSxJQUFJLElBQUksRUFBRTtBQUN4QixrQkFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3hCOztBQUVELFFBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO0FBQy9CLGtCQUFZLEdBQUcscUNBQW1CLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztLQUN6RDtHQUNGLENBQUMsQ0FBQztDQUNOIiwiZmlsZSI6InN5bmNBdG9tQ29tbWFuZHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgY3JlYXRlQXRvbUNvbW1hbmRzIGZyb20gJy4vY3JlYXRlQXRvbUNvbW1hbmRzJztcbmltcG9ydCB0eXBlIEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHR5cGUgUnggZnJvbSAncngnO1xuXG4vKipcbiAqIEtlZXAgdGhlIEF0b20gY29tbWFuZHMgaW4gc3luYyB3aXRoIHRoZSBhcHBsaWNhdGlvbiBzdGF0ZS4gSWYgdGhlIHJldHVybmVkIHN1YnNjcmlwdGlvbiBpc1xuICogZGlzcG9zZWQsIHRoZSBBdG9tIGNvbW1hbmRzIHdpbGwgYmUgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3luY0F0b21Db21tYW5kcyhcbiAgZ2FkZ2V0JDogUnguT2JzZXJ2YWJsZTxJbW11dGFibGUuTWFwPixcbiAgYXBwQ29tbWFuZHM6IE9iamVjdCxcbik6IHJ4JElEaXNwb3NhYmxlIHtcbiAgbGV0IGF0b21Db21tYW5kczogP2F0b20kSURpc3Bvc2FibGU7XG5cbiAgcmV0dXJuIGdhZGdldCRcbiAgICAuZGVib3VuY2UoNTAwKVxuICAgIC5kaXN0aW5jdFVudGlsQ2hhbmdlZCgpXG4gICAgLmZvckVhY2goZ2FkZ2V0cyA9PiB7XG4gICAgICAvLyBBZGQgQXRvbSBjb21tYW5kcyBpZGVtcG90ZW50bHkuLi5cbiAgICAgIC8vIERpc3Bvc2Ugb2YgdGhlIHByZXZpb3VzIGNvbW1hbmRzLlxuICAgICAgaWYgKGF0b21Db21tYW5kcyAhPSBudWxsKSB7XG4gICAgICAgIGF0b21Db21tYW5kcy5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgICAvLyBBZGQgbmV3IG9uZXMuXG4gICAgICBpZiAoZ2FkZ2V0cyAmJiBnYWRnZXRzLnNpemUgPiAwKSB7XG4gICAgICAgIGF0b21Db21tYW5kcyA9IGNyZWF0ZUF0b21Db21tYW5kcyhnYWRnZXRzLCBhcHBDb21tYW5kcyk7XG4gICAgICB9XG4gICAgfSk7XG59XG4iXX0=