

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

module.exports = goToLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImdvLXRvLWxvY2F0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFhZSxZQUFZLHFCQUEzQixXQUNJLElBQVksRUFDWixJQUFZLEVBQ1osTUFBYyxFQUNvQztNQUFsRCxNQUFlLHlEQUFHLElBQUk7O0FBQ3hCLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQzdDLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLGlCQUFhLEVBQUUsTUFBTTtBQUNyQixrQkFBYyxFQUFFLElBQUk7R0FDckIsQ0FBQyxDQUFDOztBQUVILE1BQUksTUFBTSxFQUFFO0FBQ1YsVUFBTSxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7R0FDL0Q7QUFDRCxTQUFPLE1BQU0sQ0FBQztDQUNmOzs7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMiLCJmaWxlIjoiZ28tdG8tbG9jYXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vLyBPcGVucyB0aGUgZ2l2ZW4gZmlsZSBhdCB0aGUgbGluZS9jb2x1bW4uXG4vLyBCeSBkZWZhdWx0IHdpbGwgY2VudGVyIHRoZSBvcGVuZWQgdGV4dCBlZGl0b3IuXG5hc3luYyBmdW5jdGlvbiBnb1RvTG9jYXRpb24oXG4gICAgZmlsZTogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgICBjZW50ZXI6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhdG9tJFRleHRFZGl0b3I+IHtcbiAgY29uc3QgZWRpdG9yID0gYXdhaXQgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlLCB7XG4gICAgaW5pdGlhbExpbmU6IGxpbmUsXG4gICAgaW5pdGlhbENvbHVtbjogY29sdW1uLFxuICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICB9KTtcblxuICBpZiAoY2VudGVyKSB7XG4gICAgZWRpdG9yLnNjcm9sbFRvQnVmZmVyUG9zaXRpb24oW2xpbmUsIGNvbHVtbl0sIHtjZW50ZXI6IHRydWV9KTtcbiAgfVxuICByZXR1cm4gZWRpdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdvVG9Mb2NhdGlvbjtcbiJdfQ==