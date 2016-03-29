var formatCode = _asyncToGenerator(function* (options, editor) {
  editor = editor || atom.workspace.getActiveTextEditor();
  if (!editor) {
    logger.info('- format-js: No active text editor');
    return;
  }

  track('format-js-formatCode');

  // Save things
  var buffer = editor.getBuffer();
  var oldSource = buffer.getText();
  var source = oldSource;

  // Reprint transform.
  if (featureConfig.get('nuclide-format-js.reprint')) {
    var _require3 = require('../../nuclide-reprint-js');

    var reprint = _require3.reprint;

    var reprintResult = reprint(source, {
      maxLineLength: 80,
      useSpaces: true,
      tabWidth: 2
    });
    source = reprintResult.source;
  }

  // Auto-require transform.
  // TODO: Add a limit so the transform is not run on files over a certain size.

  var _require4 = require('../../nuclide-format-js-base');

  var transform = _require4.transform;

  source = transform(source, options);

  // Update the source and position after all transforms are done. Do nothing
  // if the source did not change at all.
  if (source === oldSource) {
    return;
  }

  var range = buffer.getRange();
  var position = editor.getCursorBufferPosition();
  editor.setTextInBufferRange(range, source);

  var _updateCursor = updateCursor(oldSource, position, source);

  var row = _updateCursor.row;
  var column = _updateCursor.column;

  editor.setCursorBufferPosition([row, column]);

  // Save the file if that option is specified.
  if (featureConfig.get('nuclide-format-js.saveAfterRun')) {
    editor.save();
  }
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var logger = require('../../nuclide-logging').getLogger();
var featureConfig = require('../../nuclide-feature-config');

var _require = require('../../nuclide-analytics');

var track = _require.track;

var _require2 = require('../../nuclide-update-cursor');

var updateCursor = _require2.updateCursor;

module.exports = formatCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm1hdENvZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBa0JlLFVBQVUscUJBQXpCLFdBQTBCLE9BQXNCLEVBQUUsTUFBbUIsRUFBaUI7QUFDcEYsUUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEQsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUNsRCxXQUFPO0dBQ1I7O0FBRUQsT0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7OztBQUc5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25DLE1BQUksTUFBTSxHQUFHLFNBQVMsQ0FBQzs7O0FBR3ZCLE1BQUksYUFBYSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO29CQUNoQyxPQUFPLENBQUMsMEJBQTBCLENBQUM7O1FBQTlDLE9BQU8sYUFBUCxPQUFPOztBQUNkLFFBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDcEMsbUJBQWEsRUFBRSxFQUFFO0FBQ2pCLGVBQVMsRUFBRSxJQUFJO0FBQ2YsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDLENBQUM7QUFDSCxVQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztHQUMvQjs7Ozs7a0JBSW1CLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQzs7TUFBcEQsU0FBUyxhQUFULFNBQVM7O0FBQ2hCLFFBQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7O0FBSXBDLE1BQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUN4QixXQUFPO0dBQ1I7O0FBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0FBQ2xELFFBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O3NCQUNyQixZQUFZLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7O01BQXhELEdBQUcsaUJBQUgsR0FBRztNQUFFLE1BQU0saUJBQU4sTUFBTTs7QUFDbEIsUUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztBQUc5QyxNQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsRUFBRTtBQUN2RCxVQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDZjtDQUNGOzs7Ozs7Ozs7Ozs7QUFuREQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLHVCQUF1QixDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDNUQsSUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O2VBQzlDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQzs7SUFBM0MsS0FBSyxZQUFMLEtBQUs7O2dCQUNXLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQzs7SUFBdEQsWUFBWSxhQUFaLFlBQVk7O0FBa0RuQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJmb3JtYXRDb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1NvdXJjZU9wdGlvbnN9IGZyb20gJy4uLy4uL251Y2xpZGUtZm9ybWF0LWpzLWJhc2UvbGliL29wdGlvbnMvU291cmNlT3B0aW9ucyc7XG5cbmNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZmVhdHVyZS1jb25maWcnKTtcbmNvbnN0IHt0cmFja30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWFuYWx5dGljcycpO1xuY29uc3Qge3VwZGF0ZUN1cnNvcn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLXVwZGF0ZS1jdXJzb3InKTtcblxuYXN5bmMgZnVuY3Rpb24gZm9ybWF0Q29kZShvcHRpb25zOiBTb3VyY2VPcHRpb25zLCBlZGl0b3I6ID9UZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGVkaXRvciA9IGVkaXRvciB8fCBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGlmICghZWRpdG9yKSB7XG4gICAgbG9nZ2VyLmluZm8oJy0gZm9ybWF0LWpzOiBObyBhY3RpdmUgdGV4dCBlZGl0b3InKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cmFjaygnZm9ybWF0LWpzLWZvcm1hdENvZGUnKTtcblxuICAvLyBTYXZlIHRoaW5nc1xuICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gIGNvbnN0IG9sZFNvdXJjZSA9IGJ1ZmZlci5nZXRUZXh0KCk7XG4gIGxldCBzb3VyY2UgPSBvbGRTb3VyY2U7XG5cbiAgLy8gUmVwcmludCB0cmFuc2Zvcm0uXG4gIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1mb3JtYXQtanMucmVwcmludCcpKSB7XG4gICAgY29uc3Qge3JlcHJpbnR9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1yZXByaW50LWpzJyk7XG4gICAgY29uc3QgcmVwcmludFJlc3VsdCA9IHJlcHJpbnQoc291cmNlLCB7XG4gICAgICBtYXhMaW5lTGVuZ3RoOiA4MCxcbiAgICAgIHVzZVNwYWNlczogdHJ1ZSxcbiAgICAgIHRhYldpZHRoOiAyLFxuICAgIH0pO1xuICAgIHNvdXJjZSA9IHJlcHJpbnRSZXN1bHQuc291cmNlO1xuICB9XG5cbiAgLy8gQXV0by1yZXF1aXJlIHRyYW5zZm9ybS5cbiAgLy8gVE9ETzogQWRkIGEgbGltaXQgc28gdGhlIHRyYW5zZm9ybSBpcyBub3QgcnVuIG9uIGZpbGVzIG92ZXIgYSBjZXJ0YWluIHNpemUuXG4gIGNvbnN0IHt0cmFuc2Zvcm19ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1mb3JtYXQtanMtYmFzZScpO1xuICBzb3VyY2UgPSB0cmFuc2Zvcm0oc291cmNlLCBvcHRpb25zKTtcblxuICAvLyBVcGRhdGUgdGhlIHNvdXJjZSBhbmQgcG9zaXRpb24gYWZ0ZXIgYWxsIHRyYW5zZm9ybXMgYXJlIGRvbmUuIERvIG5vdGhpbmdcbiAgLy8gaWYgdGhlIHNvdXJjZSBkaWQgbm90IGNoYW5nZSBhdCBhbGwuXG4gIGlmIChzb3VyY2UgPT09IG9sZFNvdXJjZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHJhbmdlID0gYnVmZmVyLmdldFJhbmdlKCk7XG4gIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgc291cmNlKTtcbiAgY29uc3Qge3JvdywgY29sdW1ufSA9IHVwZGF0ZUN1cnNvcihvbGRTb3VyY2UsIHBvc2l0aW9uLCBzb3VyY2UpO1xuICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW3JvdywgY29sdW1uXSk7XG5cbiAgLy8gU2F2ZSB0aGUgZmlsZSBpZiB0aGF0IG9wdGlvbiBpcyBzcGVjaWZpZWQuXG4gIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1mb3JtYXQtanMuc2F2ZUFmdGVyUnVuJykpIHtcbiAgICBlZGl0b3Iuc2F2ZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZm9ybWF0Q29kZTtcbiJdfQ==