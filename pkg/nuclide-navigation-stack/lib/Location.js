Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.getPathOfLocation = getPathOfLocation;
exports.getLocationOfEditor = getLocationOfEditor;

var editorOfLocation = _asyncToGenerator(function* (location) {
  if (location.type === 'uri') {
    return yield atom.workspace.open(location.uri, {
      searchAllPanes: true
    });
  } else {
    (0, _assert2['default'])(location.type === 'editor');
    var _editor = location.editor;
    var pane = atom.workspace.paneForItem(_editor);
    (0, _assert2['default'])(pane != null);
    pane.activateItem(_editor);
    pane.activate();
    return _editor;
  }
});

exports.editorOfLocation = editorOfLocation;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

// A location which can be navigated to. Includes the file (as uri for closed files and as
// atom$TextEditor for open files) as well as the cursor position and scroll.

function getPathOfLocation(location) {
  return location.type === 'uri' ? location.uri : location.editor.getPath();
}

function getLocationOfEditor(editor) {
  return {
    type: 'editor',
    editor: editor,
    bufferPosition: editor.getCursorBufferPosition(),
    scrollTop: (0, _nuclideAtomHelpers.getScrollTop)(editor)
  };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvY2F0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztJQTZDc0IsZ0JBQWdCLHFCQUEvQixXQUFnQyxRQUFrQixFQUE2QjtBQUNwRixNQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFO0FBQzNCLFdBQU8sTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO0FBQzdDLG9CQUFjLEVBQUUsSUFBSTtLQUNyQixDQUFDLENBQUM7R0FDSixNQUFNO0FBQ0wsNkJBQVUsUUFBUSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztBQUN0QyxRQUFNLE9BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0FBQy9CLFFBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQ2hELDZCQUFVLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUN4QixRQUFJLENBQUMsWUFBWSxDQUFDLE9BQU0sQ0FBQyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNoQixXQUFPLE9BQU0sQ0FBQztHQUNmO0NBQ0Y7Ozs7Ozs7O3NCQTlDcUIsUUFBUTs7OztrQ0FDSCw0QkFBNEI7Ozs7O0FBa0JoRCxTQUFTLGlCQUFpQixDQUFDLFFBQWtCLEVBQWU7QUFDakUsU0FBTyxRQUFRLENBQUMsSUFBSSxLQUFLLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDM0U7O0FBRU0sU0FBUyxtQkFBbUIsQ0FBQyxNQUF1QixFQUFrQjtBQUMzRSxTQUFPO0FBQ0wsUUFBSSxFQUFFLFFBQVE7QUFDZCxVQUFNLEVBQU4sTUFBTTtBQUNOLGtCQUFjLEVBQUUsTUFBTSxDQUFDLHVCQUF1QixFQUFFO0FBQ2hELGFBQVMsRUFBRSxzQ0FBYSxNQUFNLENBQUM7R0FDaEMsQ0FBQztDQUNIIiwiZmlsZSI6IkxvY2F0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Z2V0U2Nyb2xsVG9wfSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5cbi8vIEEgbG9jYXRpb24gd2hpY2ggY2FuIGJlIG5hdmlnYXRlZCB0by4gSW5jbHVkZXMgdGhlIGZpbGUgKGFzIHVyaSBmb3IgY2xvc2VkIGZpbGVzIGFuZCBhc1xuLy8gYXRvbSRUZXh0RWRpdG9yIGZvciBvcGVuIGZpbGVzKSBhcyB3ZWxsIGFzIHRoZSBjdXJzb3IgcG9zaXRpb24gYW5kIHNjcm9sbC5cbmV4cG9ydCB0eXBlIFVyaUxvY2F0aW9uID0ge1xuICB0eXBlOiAndXJpJztcbiAgdXJpOiBOdWNsaWRlVXJpO1xuICBidWZmZXJQb3NpdGlvbjogYXRvbSRQb2ludDtcbiAgc2Nyb2xsVG9wOiBudW1iZXI7XG59O1xuZXhwb3J0IHR5cGUgRWRpdG9yTG9jYXRpb24gPSB7XG4gIHR5cGU6ICdlZGl0b3InO1xuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgYnVmZmVyUG9zaXRpb246IGF0b20kUG9pbnQ7XG4gIHNjcm9sbFRvcDogbnVtYmVyO1xufTtcbmV4cG9ydCB0eXBlIExvY2F0aW9uID0gRWRpdG9yTG9jYXRpb24gfCBVcmlMb2NhdGlvbjtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFBhdGhPZkxvY2F0aW9uKGxvY2F0aW9uOiBMb2NhdGlvbik6ID9OdWNsaWRlVXJpIHtcbiAgcmV0dXJuIGxvY2F0aW9uLnR5cGUgPT09ICd1cmknID8gbG9jYXRpb24udXJpIDogbG9jYXRpb24uZWRpdG9yLmdldFBhdGgoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2F0aW9uT2ZFZGl0b3IoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBFZGl0b3JMb2NhdGlvbiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ2VkaXRvcicsXG4gICAgZWRpdG9yLFxuICAgIGJ1ZmZlclBvc2l0aW9uOiBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKSxcbiAgICBzY3JvbGxUb3A6IGdldFNjcm9sbFRvcChlZGl0b3IpLFxuICB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZWRpdG9yT2ZMb2NhdGlvbihsb2NhdGlvbjogTG9jYXRpb24pIDogUHJvbWlzZTxhdG9tJFRleHRFZGl0b3I+IHtcbiAgaWYgKGxvY2F0aW9uLnR5cGUgPT09ICd1cmknKSB7XG4gICAgcmV0dXJuIGF3YWl0IGF0b20ud29ya3NwYWNlLm9wZW4obG9jYXRpb24udXJpLCB7XG4gICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBpbnZhcmlhbnQobG9jYXRpb24udHlwZSA9PT0gJ2VkaXRvcicpO1xuICAgIGNvbnN0IGVkaXRvciA9IGxvY2F0aW9uLmVkaXRvcjtcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0oZWRpdG9yKTtcbiAgICBpbnZhcmlhbnQocGFuZSAhPSBudWxsKTtcbiAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpO1xuICAgIHBhbmUuYWN0aXZhdGUoKTtcbiAgICByZXR1cm4gZWRpdG9yO1xuICB9XG59XG4iXX0=