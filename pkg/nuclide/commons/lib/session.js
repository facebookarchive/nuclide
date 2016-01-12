

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Since nuclide-commons is a Node package, we might end up having multiple copy of it running in
// Node/Atom. To make sure we only have one copy of sessionId, we store it as a property of `global`
// object with SESSION_ID_KEY as key.
var SESSION_ID_KEY = '_nuclide_session_id_key';

module.exports = Object.defineProperties({

  reset: function reset() {
    require('./singleton').clear(SESSION_ID_KEY);
  }
}, {
  id: {
    /**
     * Get a RFC4122 (http://www.ietf.org/rfc/rfc4122.txt) v4 UUID as current session's ID.
     * Unless node process is terminated or `reset()` is called, the session id will keep identical.
     */

    get: function get() {
      return require('./singleton').get(SESSION_ID_KEY, require('uuid').v4);
    },
    configurable: true,
    enumerable: true
  }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlc3Npb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQWNBLElBQU0sY0FBYyxHQUFHLHlCQUF5QixDQUFDOztBQUVqRCxNQUFNLENBQUMsT0FBTywyQkFBRzs7QUFXZixPQUFLLEVBQUEsaUJBQVM7QUFDWixXQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0dBQzlDO0NBQ0Y7QUFUSyxJQUFFOzs7Ozs7U0FBQSxlQUFXO0FBQ2YsYUFBTyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUMvQixjQUFjLEVBQ2QsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQ3ZCOzs7O0VBS0YsQ0FBQyIsImZpbGUiOiJzZXNzaW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLy8gU2luY2UgbnVjbGlkZS1jb21tb25zIGlzIGEgTm9kZSBwYWNrYWdlLCB3ZSBtaWdodCBlbmQgdXAgaGF2aW5nIG11bHRpcGxlIGNvcHkgb2YgaXQgcnVubmluZyBpblxuLy8gTm9kZS9BdG9tLiBUbyBtYWtlIHN1cmUgd2Ugb25seSBoYXZlIG9uZSBjb3B5IG9mIHNlc3Npb25JZCwgd2Ugc3RvcmUgaXQgYXMgYSBwcm9wZXJ0eSBvZiBgZ2xvYmFsYFxuLy8gb2JqZWN0IHdpdGggU0VTU0lPTl9JRF9LRVkgYXMga2V5LlxuY29uc3QgU0VTU0lPTl9JRF9LRVkgPSAnX251Y2xpZGVfc2Vzc2lvbl9pZF9rZXknO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLyoqXG4gICAqIEdldCBhIFJGQzQxMjIgKGh0dHA6Ly93d3cuaWV0Zi5vcmcvcmZjL3JmYzQxMjIudHh0KSB2NCBVVUlEIGFzIGN1cnJlbnQgc2Vzc2lvbidzIElELlxuICAgKiBVbmxlc3Mgbm9kZSBwcm9jZXNzIGlzIHRlcm1pbmF0ZWQgb3IgYHJlc2V0KClgIGlzIGNhbGxlZCwgdGhlIHNlc3Npb24gaWQgd2lsbCBrZWVwIGlkZW50aWNhbC5cbiAgICovXG4gIGdldCBpZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiByZXF1aXJlKCcuL3NpbmdsZXRvbicpLmdldChcbiAgICAgIFNFU1NJT05fSURfS0VZLFxuICAgICAgcmVxdWlyZSgndXVpZCcpLnY0KTtcbiAgfSxcblxuICByZXNldCgpOiB2b2lkIHtcbiAgICByZXF1aXJlKCcuL3NpbmdsZXRvbicpLmNsZWFyKFNFU1NJT05fSURfS0VZKTtcbiAgfSxcbn07XG4iXX0=