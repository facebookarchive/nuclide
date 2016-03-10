Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.safeRegExpFromString = safeRegExpFromString;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Escapes non-RegExp-safe characters such as slashes in the query string.
 */

function safeRegExpFromString(query) {
  // Taken from http://stackoverflow.com/questions/6300183/sanitize-string-of-regex-characters-before-regexp-build/6300266#6300266
  var sanitizedQuery = query.replace(/[#-.]|[[-^]|[?|{}]/g, '\\$&');
  return new RegExp(sanitizedQuery, 'i');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZ2V4cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQWNPLFNBQVMsb0JBQW9CLENBQUMsS0FBYSxFQUFVOztBQUUxRCxNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3BFLFNBQU8sSUFBSSxNQUFNLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3hDIiwiZmlsZSI6InJlZ2V4cC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogRXNjYXBlcyBub24tUmVnRXhwLXNhZmUgY2hhcmFjdGVycyBzdWNoIGFzIHNsYXNoZXMgaW4gdGhlIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhZmVSZWdFeHBGcm9tU3RyaW5nKHF1ZXJ5OiBzdHJpbmcpOiBSZWdFeHAge1xuICAvLyBUYWtlbiBmcm9tIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNjMwMDE4My9zYW5pdGl6ZS1zdHJpbmctb2YtcmVnZXgtY2hhcmFjdGVycy1iZWZvcmUtcmVnZXhwLWJ1aWxkLzYzMDAyNjYjNjMwMDI2NlxuICBjb25zdCBzYW5pdGl6ZWRRdWVyeSA9IHF1ZXJ5LnJlcGxhY2UoL1sjLS5dfFtbLV5dfFs/fHt9XS9nLCAnXFxcXCQmJyk7XG4gIHJldHVybiBuZXcgUmVnRXhwKHNhbml0aXplZFF1ZXJ5LCAnaScpO1xufVxuIl19