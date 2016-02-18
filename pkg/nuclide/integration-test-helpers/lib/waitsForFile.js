Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.waitsForFile = waitsForFile;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

/**
 * Waits for the specified file to become the active text editor.
 * Can only be used in a Jasmine context.
 */

function waitsForFile(filename) {
  var timeoutMs = arguments.length <= 1 || arguments[1] === undefined ? 10000 : arguments[1];

  waitsFor(filename + ' to become active', timeoutMs, function () {
    var editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return false;
    }
    var editorPath = editor.getPath();
    if (editorPath == null) {
      return false;
    }
    return _path2['default'].basename(editorPath) === filename;
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndhaXRzRm9yRmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7b0JBV2lCLE1BQU07Ozs7Ozs7OztBQU1oQixTQUFTLFlBQVksQ0FBQyxRQUFnQixFQUFtQztNQUFqQyxTQUFpQix5REFBRyxLQUFLOztBQUN0RSxVQUFRLENBQUksUUFBUSx3QkFBcUIsU0FBUyxFQUFFLFlBQU07QUFDeEQsUUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELFFBQUksTUFBTSxJQUFJLElBQUksRUFBRTtBQUNsQixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsUUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BDLFFBQUksVUFBVSxJQUFJLElBQUksRUFBRTtBQUN0QixhQUFPLEtBQUssQ0FBQztLQUNkO0FBQ0QsV0FBTyxrQkFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssUUFBUSxDQUFDO0dBQy9DLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IndhaXRzRm9yRmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vKipcbiAqIFdhaXRzIGZvciB0aGUgc3BlY2lmaWVkIGZpbGUgdG8gYmVjb21lIHRoZSBhY3RpdmUgdGV4dCBlZGl0b3IuXG4gKiBDYW4gb25seSBiZSB1c2VkIGluIGEgSmFzbWluZSBjb250ZXh0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gd2FpdHNGb3JGaWxlKGZpbGVuYW1lOiBzdHJpbmcsIHRpbWVvdXRNczogbnVtYmVyID0gMTAwMDApOiB2b2lkIHtcbiAgd2FpdHNGb3IoYCR7ZmlsZW5hbWV9IHRvIGJlY29tZSBhY3RpdmVgLCB0aW1lb3V0TXMsICgpID0+IHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGVkaXRvciA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGVkaXRvclBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmIChlZGl0b3JQYXRoID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGguYmFzZW5hbWUoZWRpdG9yUGF0aCkgPT09IGZpbGVuYW1lO1xuICB9KTtcbn1cbiJdfQ==