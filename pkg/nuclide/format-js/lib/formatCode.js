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
    var _require3 = require('../../reprint-js');

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

  var _require4 = require('../../format-js-base');

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

var logger = require('../../logging').getLogger();
var featureConfig = require('../../feature-config');

var _require = require('../../analytics');

var track = _require.track;

var _require2 = require('../../update-cursor');

var updateCursor = _require2.updateCursor;

module.exports = formatCode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZvcm1hdENvZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IklBa0JlLFVBQVUscUJBQXpCLFdBQTBCLE9BQXNCLEVBQUUsTUFBbUIsRUFBaUI7QUFDcEYsUUFBTSxHQUFHLE1BQU0sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDeEQsTUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFVBQU0sQ0FBQyxJQUFJLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUNsRCxXQUFPO0dBQ1I7O0FBRUQsT0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUM7OztBQUc5QixNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7QUFDbEMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25DLE1BQUksTUFBTSxHQUFHLFNBQVMsQ0FBQzs7O0FBR3ZCLE1BQUksYUFBYSxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxFQUFFO29CQUNoQyxPQUFPLENBQUMsa0JBQWtCLENBQUM7O1FBQXRDLE9BQU8sYUFBUCxPQUFPOztBQUNkLFFBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDcEMsbUJBQWEsRUFBRSxFQUFFO0FBQ2pCLGVBQVMsRUFBRSxJQUFJO0FBQ2YsY0FBUSxFQUFFLENBQUM7S0FDWixDQUFDLENBQUM7QUFDSCxVQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQztHQUMvQjs7Ozs7a0JBSW1CLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7TUFBNUMsU0FBUyxhQUFULFNBQVM7O0FBQ2hCLFFBQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7O0FBSXBDLE1BQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtBQUN4QixXQUFPO0dBQ1I7O0FBRUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ2hDLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO0FBQ2xELFFBQU0sQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7O3NCQUNyQixZQUFZLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7O01BQXhELEdBQUcsaUJBQUgsR0FBRztNQUFFLE1BQU0saUJBQU4sTUFBTTs7QUFDbEIsUUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7OztBQUc5QyxNQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0NBQWdDLENBQUMsRUFBRTtBQUN2RCxVQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDZjtDQUNGOzs7Ozs7Ozs7Ozs7QUFuREQsSUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ3BELElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDOztlQUN0QyxPQUFPLENBQUMsaUJBQWlCLENBQUM7O0lBQW5DLEtBQUssWUFBTCxLQUFLOztnQkFDVyxPQUFPLENBQUMscUJBQXFCLENBQUM7O0lBQTlDLFlBQVksYUFBWixZQUFZOztBQWtEbkIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiZm9ybWF0Q29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtTb3VyY2VPcHRpb25zfSBmcm9tICcuLi8uLi9mb3JtYXQtanMtYmFzZS9saWIvb3B0aW9ucy9Tb3VyY2VPcHRpb25zJztcblxuY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuY29uc3QgZmVhdHVyZUNvbmZpZyA9IHJlcXVpcmUoJy4uLy4uL2ZlYXR1cmUtY29uZmlnJyk7XG5jb25zdCB7dHJhY2t9ID0gcmVxdWlyZSgnLi4vLi4vYW5hbHl0aWNzJyk7XG5jb25zdCB7dXBkYXRlQ3Vyc29yfSA9IHJlcXVpcmUoJy4uLy4uL3VwZGF0ZS1jdXJzb3InKTtcblxuYXN5bmMgZnVuY3Rpb24gZm9ybWF0Q29kZShvcHRpb25zOiBTb3VyY2VPcHRpb25zLCBlZGl0b3I6ID9UZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gIGVkaXRvciA9IGVkaXRvciB8fCBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGlmICghZWRpdG9yKSB7XG4gICAgbG9nZ2VyLmluZm8oJy0gZm9ybWF0LWpzOiBObyBhY3RpdmUgdGV4dCBlZGl0b3InKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0cmFjaygnZm9ybWF0LWpzLWZvcm1hdENvZGUnKTtcblxuICAvLyBTYXZlIHRoaW5nc1xuICBjb25zdCBidWZmZXIgPSBlZGl0b3IuZ2V0QnVmZmVyKCk7XG4gIGNvbnN0IG9sZFNvdXJjZSA9IGJ1ZmZlci5nZXRUZXh0KCk7XG4gIGxldCBzb3VyY2UgPSBvbGRTb3VyY2U7XG5cbiAgLy8gUmVwcmludCB0cmFuc2Zvcm0uXG4gIGlmIChmZWF0dXJlQ29uZmlnLmdldCgnbnVjbGlkZS1mb3JtYXQtanMucmVwcmludCcpKSB7XG4gICAgY29uc3Qge3JlcHJpbnR9ID0gcmVxdWlyZSgnLi4vLi4vcmVwcmludC1qcycpO1xuICAgIGNvbnN0IHJlcHJpbnRSZXN1bHQgPSByZXByaW50KHNvdXJjZSwge1xuICAgICAgbWF4TGluZUxlbmd0aDogODAsXG4gICAgICB1c2VTcGFjZXM6IHRydWUsXG4gICAgICB0YWJXaWR0aDogMixcbiAgICB9KTtcbiAgICBzb3VyY2UgPSByZXByaW50UmVzdWx0LnNvdXJjZTtcbiAgfVxuXG4gIC8vIEF1dG8tcmVxdWlyZSB0cmFuc2Zvcm0uXG4gIC8vIFRPRE86IEFkZCBhIGxpbWl0IHNvIHRoZSB0cmFuc2Zvcm0gaXMgbm90IHJ1biBvbiBmaWxlcyBvdmVyIGEgY2VydGFpbiBzaXplLlxuICBjb25zdCB7dHJhbnNmb3JtfSA9IHJlcXVpcmUoJy4uLy4uL2Zvcm1hdC1qcy1iYXNlJyk7XG4gIHNvdXJjZSA9IHRyYW5zZm9ybShzb3VyY2UsIG9wdGlvbnMpO1xuXG4gIC8vIFVwZGF0ZSB0aGUgc291cmNlIGFuZCBwb3NpdGlvbiBhZnRlciBhbGwgdHJhbnNmb3JtcyBhcmUgZG9uZS4gRG8gbm90aGluZ1xuICAvLyBpZiB0aGUgc291cmNlIGRpZCBub3QgY2hhbmdlIGF0IGFsbC5cbiAgaWYgKHNvdXJjZSA9PT0gb2xkU291cmNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgcmFuZ2UgPSBidWZmZXIuZ2V0UmFuZ2UoKTtcbiAgY29uc3QgcG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKTtcbiAgZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCBzb3VyY2UpO1xuICBjb25zdCB7cm93LCBjb2x1bW59ID0gdXBkYXRlQ3Vyc29yKG9sZFNvdXJjZSwgcG9zaXRpb24sIHNvdXJjZSk7XG4gIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbcm93LCBjb2x1bW5dKTtcblxuICAvLyBTYXZlIHRoZSBmaWxlIGlmIHRoYXQgb3B0aW9uIGlzIHNwZWNpZmllZC5cbiAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLWZvcm1hdC1qcy5zYXZlQWZ0ZXJSdW4nKSkge1xuICAgIGVkaXRvci5zYXZlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmb3JtYXRDb2RlO1xuIl19