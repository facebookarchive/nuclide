

// Opens the given file at the line/column.
// By default will center the opened text editor.

var goToLocation = _asyncToGenerator(function* (file, line, column) {
  var center = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  var editor = yield atom.workspace.open(file, {
    initialLine: line,
    initialColumn: column,
    searchAllPanes: true
  });

  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }
  return editor;
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactivexRxjs = require('@reactivex/rxjs');

var goToLocationSubject = new _reactivexRxjs.Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
function goToLocationInEditor(editor, line, column) {
  var center = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }

  goToLocationSubject.next(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}

module.exports = {
  goToLocation: goToLocation,
  goToLocationInEditor: goToLocationInEditor,
  observeNavigatingEditors: observeNavigatingEditors
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdvLXRvLWxvY2F0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBZ0JlLFlBQVkscUJBQTNCLFdBQ0ksSUFBWSxFQUNaLElBQVksRUFDWixNQUFjLEVBQ29DO01BQWxELE1BQWUseURBQUcsSUFBSTs7QUFDeEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDN0MsZUFBVyxFQUFFLElBQUk7QUFDakIsaUJBQWEsRUFBRSxNQUFNO0FBQ3JCLGtCQUFjLEVBQUUsSUFBSTtHQUNyQixDQUFDLENBQUM7O0FBRUgsTUFBSSxNQUFNLEVBQUU7QUFDVixVQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztHQUMvRDtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7Ozs7Ozs7Ozs7Ozs2QkFwQnFCLGlCQUFpQjs7QUF3QnZDLElBQU0sbUJBQW1CLEdBQUcsNEJBQWEsQ0FBQzs7Ozs7QUFLMUMsU0FBUyxvQkFBb0IsQ0FDM0IsTUFBdUIsRUFDdkIsSUFBWSxFQUNaLE1BQWMsRUFFUjtNQUROLE1BQWUseURBQUcsSUFBSTs7QUFFdEIsUUFBTSxDQUFDLHVCQUF1QixDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDL0MsTUFBSSxNQUFNLEVBQUU7QUFDVixVQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztHQUMvRDs7QUFFRCxxQkFBbUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDbEM7O0FBR0QsU0FBUyx3QkFBd0IsR0FBZ0M7QUFDL0QsU0FBTyxtQkFBbUIsQ0FBQztDQUM1Qjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHO0FBQ2YsY0FBWSxFQUFaLFlBQVk7QUFDWixzQkFBb0IsRUFBcEIsb0JBQW9CO0FBQ3BCLDBCQUF3QixFQUF4Qix3QkFBd0I7Q0FDekIsQ0FBQyIsImZpbGUiOiJnby10by1sb2NhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB7U3ViamVjdH0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdAcmVhY3RpdmV4L3J4anMnO1xuXG4vLyBPcGVucyB0aGUgZ2l2ZW4gZmlsZSBhdCB0aGUgbGluZS9jb2x1bW4uXG4vLyBCeSBkZWZhdWx0IHdpbGwgY2VudGVyIHRoZSBvcGVuZWQgdGV4dCBlZGl0b3IuXG5hc3luYyBmdW5jdGlvbiBnb1RvTG9jYXRpb24oXG4gICAgZmlsZTogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgICBjZW50ZXI6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhdG9tJFRleHRFZGl0b3I+IHtcbiAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlLCB7XG4gICAgaW5pdGlhbExpbmU6IGxpbmUsXG4gICAgaW5pdGlhbENvbHVtbjogY29sdW1uLFxuICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICB9KTtcblxuICBpZiAoY2VudGVyKSB7XG4gICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmUsIGNvbHVtbl0sIHtjZW50ZXI6IHRydWV9KTtcbiAgfVxuICByZXR1cm4gZWRpdG9yO1xufVxuXG5cblxuY29uc3QgZ29Ub0xvY2F0aW9uU3ViamVjdCA9IG5ldyBTdWJqZWN0KCk7XG5cbi8vIFNjcm9sbHMgdG8gdGhlIGdpdmVuIGxpbmUvY29sdW1uIGF0IHRoZSBnaXZlbiBlZGl0b3Jcbi8vIGJyb2FkY2FzdHMgdGhlIGVkaXRvciBpbnN0YW5jZSBvbiBhbiBvYnNlcnZhYmxlIChzdWJqZWN0KSBhdmFpbGFibGVcbi8vIHRocm91Z2ggdGhlIGdldEdvVG9Mb2NhdGlvblxuZnVuY3Rpb24gZ29Ub0xvY2F0aW9uSW5FZGl0b3IoXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICBsaW5lOiBudW1iZXIsXG4gIGNvbHVtbjogbnVtYmVyLFxuICBjZW50ZXI6IGJvb2xlYW4gPSB0cnVlXG4pOiB2b2lkIHtcbiAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtsaW5lLCBjb2x1bW5dKTtcbiAgaWYgKGNlbnRlcikge1xuICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKFtsaW5lLCBjb2x1bW5dLCB7Y2VudGVyOiB0cnVlfSk7XG4gIH1cblxuICBnb1RvTG9jYXRpb25TdWJqZWN0Lm5leHQoZWRpdG9yKTtcbn1cblxuXG5mdW5jdGlvbiBvYnNlcnZlTmF2aWdhdGluZ0VkaXRvcnMoKTogT2JzZXJ2YWJsZTxhdG9tJFRleHRFZGl0b3I+IHtcbiAgcmV0dXJuIGdvVG9Mb2NhdGlvblN1YmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBnb1RvTG9jYXRpb24sXG4gIGdvVG9Mb2NhdGlvbkluRWRpdG9yLFxuICBvYnNlcnZlTmF2aWdhdGluZ0VkaXRvcnMsXG59O1xuIl19