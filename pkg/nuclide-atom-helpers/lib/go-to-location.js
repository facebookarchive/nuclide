

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

var _rx = require('rx');

var goToLocationSubject = new _rx.Subject();

// Scrolls to the given line/column at the given editor
// broadcasts the editor instance on an observable (subject) available
// through the getGoToLocation
function goToLocationInEditor(editor, line, column) {
  var center = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  editor.setCursorBufferPosition([line, column]);
  if (center) {
    editor.scrollToBufferPosition([line, column], { center: true });
  }

  goToLocationSubject.onNext(editor);
}

function observeNavigatingEditors() {
  return goToLocationSubject;
}

module.exports = {
  goToLocation: goToLocation,
  goToLocationInEditor: goToLocationInEditor,
  observeNavigatingEditors: observeNavigatingEditors
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdvLXRvLWxvY2F0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0lBZ0JlLFlBQVkscUJBQTNCLFdBQ0ksSUFBWSxFQUNaLElBQVksRUFDWixNQUFjLEVBQ29DO01BQWxELE1BQWUseURBQUcsSUFBSTs7QUFDeEIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDN0MsZUFBVyxFQUFFLElBQUk7QUFDakIsaUJBQWEsRUFBRSxNQUFNO0FBQ3JCLGtCQUFjLEVBQUUsSUFBSTtHQUNyQixDQUFDLENBQUM7O0FBRUgsTUFBSSxNQUFNLEVBQUU7QUFDVixVQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztHQUMvRDtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7Ozs7Ozs7Ozs7OztrQkFwQnFCLElBQUk7O0FBd0IxQixJQUFNLG1CQUFtQixHQUFHLGlCQUFhLENBQUM7Ozs7O0FBSzFDLFNBQVMsb0JBQW9CLENBQzNCLE1BQXVCLEVBQ3ZCLElBQVksRUFDWixNQUFjLEVBRVI7TUFETixNQUFlLHlEQUFHLElBQUk7O0FBRXRCLFFBQU0sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQy9DLE1BQUksTUFBTSxFQUFFO0FBQ1YsVUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7R0FDL0Q7O0FBRUQscUJBQW1CLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0NBQ3BDOztBQUdELFNBQVMsd0JBQXdCLEdBQWdDO0FBQy9ELFNBQU8sbUJBQW1CLENBQUM7Q0FDNUI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRztBQUNmLGNBQVksRUFBWixZQUFZO0FBQ1osc0JBQW9CLEVBQXBCLG9CQUFvQjtBQUNwQiwwQkFBd0IsRUFBeEIsd0JBQXdCO0NBQ3pCLENBQUMiLCJmaWxlIjoiZ28tdG8tbG9jYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge1N1YmplY3R9IGZyb20gJ3J4JztcbmltcG9ydCB0eXBlIHtPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbi8vIE9wZW5zIHRoZSBnaXZlbiBmaWxlIGF0IHRoZSBsaW5lL2NvbHVtbi5cbi8vIEJ5IGRlZmF1bHQgd2lsbCBjZW50ZXIgdGhlIG9wZW5lZCB0ZXh0IGVkaXRvci5cbmFzeW5jIGZ1bmN0aW9uIGdvVG9Mb2NhdGlvbihcbiAgICBmaWxlOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIGNlbnRlcjogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPGF0b20kVGV4dEVkaXRvcj4ge1xuICBjb25zdCBlZGl0b3IgPSBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGUsIHtcbiAgICBpbml0aWFsTGluZTogbGluZSxcbiAgICBpbml0aWFsQ29sdW1uOiBjb2x1bW4sXG4gICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gIH0pO1xuXG4gIGlmIChjZW50ZXIpIHtcbiAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZSwgY29sdW1uXSwge2NlbnRlcjogdHJ1ZX0pO1xuICB9XG4gIHJldHVybiBlZGl0b3I7XG59XG5cblxuXG5jb25zdCBnb1RvTG9jYXRpb25TdWJqZWN0ID0gbmV3IFN1YmplY3QoKTtcblxuLy8gU2Nyb2xscyB0byB0aGUgZ2l2ZW4gbGluZS9jb2x1bW4gYXQgdGhlIGdpdmVuIGVkaXRvclxuLy8gYnJvYWRjYXN0cyB0aGUgZWRpdG9yIGluc3RhbmNlIG9uIGFuIG9ic2VydmFibGUgKHN1YmplY3QpIGF2YWlsYWJsZVxuLy8gdGhyb3VnaCB0aGUgZ2V0R29Ub0xvY2F0aW9uXG5mdW5jdGlvbiBnb1RvTG9jYXRpb25JbkVkaXRvcihcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIGxpbmU6IG51bWJlcixcbiAgY29sdW1uOiBudW1iZXIsXG4gIGNlbnRlcjogYm9vbGVhbiA9IHRydWVcbik6IHZvaWQge1xuICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oW2xpbmUsIGNvbHVtbl0pO1xuICBpZiAoY2VudGVyKSB7XG4gICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmUsIGNvbHVtbl0sIHtjZW50ZXI6IHRydWV9KTtcbiAgfVxuXG4gIGdvVG9Mb2NhdGlvblN1YmplY3Qub25OZXh0KGVkaXRvcik7XG59XG5cblxuZnVuY3Rpb24gb2JzZXJ2ZU5hdmlnYXRpbmdFZGl0b3JzKCk6IE9ic2VydmFibGU8YXRvbSRUZXh0RWRpdG9yPiB7XG4gIHJldHVybiBnb1RvTG9jYXRpb25TdWJqZWN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZ29Ub0xvY2F0aW9uLFxuICBnb1RvTG9jYXRpb25JbkVkaXRvcixcbiAgb2JzZXJ2ZU5hdmlnYXRpbmdFZGl0b3JzLFxufTtcbiJdfQ==