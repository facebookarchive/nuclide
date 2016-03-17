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

var _textEditor = require('./text-editor');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function onWillDestroyTextBuffer(callback) {
  return atom.workspace.onWillDestroyPaneItem(function (_ref) {
    var item = _ref.item;

    if (!(0, _textEditor.isTextEditor)(item)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9uLXdpbGwtZGVzdHJveS10ZXh0LWJ1ZmZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7cUJBY3dCLHVCQUF1Qjs7Ozs7Ozs7Ozs7OzBCQUhwQixlQUFlOztzQkFDcEIsUUFBUTs7OztBQUVmLFNBQVMsdUJBQXVCLENBQUMsUUFBNEMsRUFDMUU7QUFDaEIsU0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLFVBQUMsSUFBTSxFQUFLO1FBQVYsSUFBSSxHQUFMLElBQU0sQ0FBTCxJQUFJOztBQUNoRCxRQUFJLENBQUMsOEJBQWEsSUFBSSxDQUFDLEVBQUU7QUFDdkIsYUFBTztLQUNSOztBQUVELFFBQU0sTUFBdUIsR0FBSSxJQUFJLEFBQU0sQ0FBQztBQUM1QyxRQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO0FBQ3BELDZCQUNFLGVBQWUsS0FBSyxDQUFDLEVBQ3JCLDJEQUEyRCxDQUM1RCxDQUFDO0FBQ0YsUUFBSSxlQUFlLEtBQUssQ0FBQyxFQUFFO0FBQ3pCLGNBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztLQUM5QjtHQUNGLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6Im9uLXdpbGwtZGVzdHJveS10ZXh0LWJ1ZmZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7aXNUZXh0RWRpdG9yfSBmcm9tICcuL3RleHQtZWRpdG9yJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb25XaWxsRGVzdHJveVRleHRCdWZmZXIoY2FsbGJhY2s6IChidWZmZXI6IGF0b20kVGV4dEJ1ZmZlcikgPT4gbWl4ZWQpXG4gICAgOiBJRGlzcG9zYWJsZSB7XG4gIHJldHVybiBhdG9tLndvcmtzcGFjZS5vbldpbGxEZXN0cm95UGFuZUl0ZW0oKHtpdGVtfSkgPT4ge1xuICAgIGlmICghaXNUZXh0RWRpdG9yKGl0ZW0pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IgPSAoaXRlbTogYW55KTtcbiAgICBjb25zdCBvcGVuQnVmZmVyQ291bnQgPSBlZGl0b3IuZ2V0QnVmZmVyKCkucmVmY291bnQ7XG4gICAgaW52YXJpYW50KFxuICAgICAgb3BlbkJ1ZmZlckNvdW50ICE9PSAwLFxuICAgICAgJ1RoZSBmaWxlIHRoYXQgaXMgYWJvdXQgdG8gYmUgY2xvc2VkIHNob3VsZCBzdGlsbCBiZSBvcGVuLidcbiAgICApO1xuICAgIGlmIChvcGVuQnVmZmVyQ291bnQgPT09IDEpIHtcbiAgICAgIGNhbGxiYWNrKGVkaXRvci5nZXRCdWZmZXIoKSk7XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==