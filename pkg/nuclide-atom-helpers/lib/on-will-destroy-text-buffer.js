Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = onWillDestroyTextBuffer;

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

function onWillDestroyTextBuffer(callback) {
  return atom.workspace.onWillDestroyPaneItem(function (_ref) {
    var item = _ref.item;

    if (!atom.workspace.isTextEditor(item)) {
      return;
    }

    var editor = item;
    var openBufferCount = editor.getBuffer().refcount;
    (0, _assert2['default'])(openBufferCount !== 0, 'The file that is about to be closed should still be open.');
    if (openBufferCount === 1) {
      callback(editor.getBuffer());
    }
  });
}

module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9uLXdpbGwtZGVzdHJveS10ZXh0LWJ1ZmZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7cUJBYXdCLHVCQUF1Qjs7Ozs7Ozs7Ozs7O3NCQUZ6QixRQUFROzs7O0FBRWYsU0FBUyx1QkFBdUIsQ0FBQyxRQUE0QyxFQUMxRTtBQUNoQixTQUFPLElBQUksQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsVUFBQyxJQUFNLEVBQUs7UUFBVixJQUFJLEdBQUwsSUFBTSxDQUFMLElBQUk7O0FBQ2hELFFBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0QyxhQUFPO0tBQ1I7O0FBRUQsUUFBTSxNQUF1QixHQUFJLElBQUksQUFBTSxDQUFDO0FBQzVDLFFBQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUM7QUFDcEQsNkJBQ0UsZUFBZSxLQUFLLENBQUMsRUFDckIsMkRBQTJELENBQzVELENBQUM7QUFDRixRQUFJLGVBQWUsS0FBSyxDQUFDLEVBQUU7QUFDekIsY0FBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0tBQzlCO0dBQ0YsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoib24td2lsbC1kZXN0cm95LXRleHQtYnVmZmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvbldpbGxEZXN0cm95VGV4dEJ1ZmZlcihjYWxsYmFjazogKGJ1ZmZlcjogYXRvbSRUZXh0QnVmZmVyKSA9PiBtaXhlZClcbiAgICA6IElEaXNwb3NhYmxlIHtcbiAgcmV0dXJuIGF0b20ud29ya3NwYWNlLm9uV2lsbERlc3Ryb3lQYW5lSXRlbSgoe2l0ZW19KSA9PiB7XG4gICAgaWYgKCFhdG9tLndvcmtzcGFjZS5pc1RleHRFZGl0b3IoaXRlbSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlZGl0b3I6IGF0b20kVGV4dEVkaXRvciA9IChpdGVtOiBhbnkpO1xuICAgIGNvbnN0IG9wZW5CdWZmZXJDb3VudCA9IGVkaXRvci5nZXRCdWZmZXIoKS5yZWZjb3VudDtcbiAgICBpbnZhcmlhbnQoXG4gICAgICBvcGVuQnVmZmVyQ291bnQgIT09IDAsXG4gICAgICAnVGhlIGZpbGUgdGhhdCBpcyBhYm91dCB0byBiZSBjbG9zZWQgc2hvdWxkIHN0aWxsIGJlIG9wZW4uJ1xuICAgICk7XG4gICAgaWYgKG9wZW5CdWZmZXJDb3VudCA9PT0gMSkge1xuICAgICAgY2FsbGJhY2soZWRpdG9yLmdldEJ1ZmZlcigpKTtcbiAgICB9XG4gIH0pO1xufVxuIl19