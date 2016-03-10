var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Port of Atom's timer utils (https://fburl.com/104714454) which is useful for unittest.
 * Use fakeSetTimeout, fakeClearTimeout, fakeSetInterval and fakeClearInterval to mock Node.js's
 * Timer utils, and using advanceClock to advance the fake timer to trigger timed callback.
 */
require('jasmine-node');

var now = 0;
var timeoutCount = 0;
var intervalCount = 0;
var timeouts = [];
var intervalTimeouts = {};

function resetTimeouts() {
  now = 0;
  timeoutCount = 0;
  intervalCount = 0;
  timeouts = [];
  intervalTimeouts = {};
}

function fakeSetTimeout(callback, ms) {
  var id = ++timeoutCount;
  timeouts.push([id, now + ms, callback]);
  timeouts = timeouts.sort(function (_ref, _ref3) {
    var _ref2 = _slicedToArray(_ref, 3);

    var id0 = _ref2[0];
    var strikeTime0 = _ref2[1];
    var cb0 = _ref2[2];

    var _ref32 = _slicedToArray(_ref3, 3);

    var id1 = _ref32[0];
    var strikeTime1 = _ref32[1];
    var cb1 = _ref32[2];
    return strikeTime0 - strikeTime1;
  });
  return id;
}

function fakeClearTimeout(idToClear) {
  timeouts = timeouts.filter(function (_ref4) {
    var _ref42 = _slicedToArray(_ref4, 3);

    var id = _ref42[0];
    var strikeTime = _ref42[1];
    var callback = _ref42[2];
    return id !== idToClear;
  });
}

function fakeSetInterval(callback, ms) {
  var id = ++intervalCount;
  var action = function action() {
    callback();
    intervalTimeouts[id] = fakeSetTimeout(action, ms);
  };
  intervalTimeouts[id] = fakeSetTimeout(action, ms);
  return id;
}

function fakeClearInterval(idToClear) {
  fakeClearTimeout(intervalTimeouts[idToClear]);
}

function advanceClock(deltaMs) {
  var advanceTo = now + deltaMs;

  while (timeouts.length !== 0 && timeouts[0][1] <= advanceTo) {
    var _timeouts$shift = timeouts.shift();

    var _timeouts$shift2 = _slicedToArray(_timeouts$shift, 3);

    var strikeTime = _timeouts$shift2[1];
    var callback = _timeouts$shift2[2];

    now = strikeTime;
    callback();
  }

  now = advanceTo;
}

/**
 * Allows tests to use the non-fake setTimeout and clearTimeout functions.
 */
function useRealClock() {
  jasmine.unspy(global, 'setTimeout');
  jasmine.unspy(global, 'clearTimeout');
  jasmine.unspy(Date, 'now');
}

// Expose the fake timer utils to global to be used by npm spec tests.
global.resetTimeouts = resetTimeouts;
global.fakeSetTimeout = fakeSetTimeout;
global.fakeClearTimeout = fakeClearTimeout;
global.fakeSetInterval = fakeSetInterval;
global.fakeClearInterval = fakeClearInterval;
global.advanceClock = advanceClock;
jasmine.useRealClock = useRealClock;
var attributes = {};
attributes['get'] = function () {
  return now;
};
Object.defineProperty(global, 'now', attributes);

/**
 * This hook is a the first initialization code that happens before any jasmine test case is
 * executed. This allows to use the fake timing by default and is a direct port from Atom's
 * `spec-helper.coffee`
 */
beforeEach(function () {
  resetTimeouts();
  spyOn(Date, 'now').andCallFake(function () {
    return now;
  });
  spyOn(global, 'setTimeout').andCallFake(fakeSetTimeout);
  spyOn(global, 'clearTimeout').andCallFake(fakeClearTimeout);
});
//# sourceMappingURL=data:application/json;base64,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SyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztDQUM1Qjs7O0FBR0QsTUFBTSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7QUFDckMsTUFBTSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7QUFDdkMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBQzNDLE1BQU0sQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO0FBQ3pDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxpQkFBaUIsQ0FBQztBQUM3QyxNQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNuQyxPQUFPLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztBQUNwQyxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEIsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLFlBQVc7QUFBRSxTQUFPLEdBQUcsQ0FBQztDQUFFLENBQUM7QUFDL0MsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDOzs7Ozs7O0FBT2pELFVBQVUsQ0FBQyxZQUFNO0FBQ2YsZUFBYSxFQUFFLENBQUM7QUFDaEIsT0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxXQUFXLENBQUM7V0FBTSxHQUFHO0dBQUEsQ0FBQyxDQUFDO0FBQzFDLE9BQUssQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQ3hELE9BQUssQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUMsV0FBVyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Q0FDN0QsQ0FBQyxDQUFDIiwiZmlsZSI6ImZha2V0aW1lci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbi8qKlxuICogUG9ydCBvZiBBdG9tJ3MgdGltZXIgdXRpbHMgKGh0dHBzOi8vZmJ1cmwuY29tLzEwNDcxNDQ1NCkgd2hpY2ggaXMgdXNlZnVsIGZvciB1bml0dGVzdC5cbiAqIFVzZSBmYWtlU2V0VGltZW91dCwgZmFrZUNsZWFyVGltZW91dCwgZmFrZVNldEludGVydmFsIGFuZCBmYWtlQ2xlYXJJbnRlcnZhbCB0byBtb2NrIE5vZGUuanMnc1xuICogVGltZXIgdXRpbHMsIGFuZCB1c2luZyBhZHZhbmNlQ2xvY2sgdG8gYWR2YW5jZSB0aGUgZmFrZSB0aW1lciB0byB0cmlnZ2VyIHRpbWVkIGNhbGxiYWNrLlxuICovXG5yZXF1aXJlKCdqYXNtaW5lLW5vZGUnKTtcblxubGV0IG5vdyA9IDA7XG5sZXQgdGltZW91dENvdW50ID0gMDtcbmxldCBpbnRlcnZhbENvdW50ID0gMDtcbmxldCB0aW1lb3V0cyA9IFtdO1xubGV0IGludGVydmFsVGltZW91dHMgPSB7fTtcblxuZnVuY3Rpb24gcmVzZXRUaW1lb3V0cygpOiB2b2lkIHtcbiAgbm93ID0gMDtcbiAgdGltZW91dENvdW50ID0gMDtcbiAgaW50ZXJ2YWxDb3VudCA9IDA7XG4gIHRpbWVvdXRzID0gW107XG4gIGludGVydmFsVGltZW91dHMgPSB7fTtcbn1cblxuZnVuY3Rpb24gZmFrZVNldFRpbWVvdXQoY2FsbGJhY2s6ICgpID0+ID9hbnksIG1zOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBpZCA9ICsrdGltZW91dENvdW50O1xuICB0aW1lb3V0cy5wdXNoKFtpZCwgbm93ICsgbXMsIGNhbGxiYWNrXSk7XG4gIHRpbWVvdXRzID0gdGltZW91dHNcbiAgICAgIC5zb3J0KChbaWQwLCBzdHJpa2VUaW1lMCwgY2IwXSwgW2lkMSwgc3RyaWtlVGltZTEsIGNiMV0pID0+IHN0cmlrZVRpbWUwIC0gc3RyaWtlVGltZTEpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGZha2VDbGVhclRpbWVvdXQoaWRUb0NsZWFyOiBudW1iZXIpOiB2b2lkIHtcbiAgdGltZW91dHMgPSB0aW1lb3V0c1xuICAgICAgLmZpbHRlcigoW2lkLCBzdHJpa2VUaW1lLCBjYWxsYmFja10pID0+IChpZCAhPT0gaWRUb0NsZWFyKSk7XG59XG5cbmZ1bmN0aW9uIGZha2VTZXRJbnRlcnZhbChjYWxsYmFjazogKCkgPT4gP2FueSwgbXM6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGlkID0gKytpbnRlcnZhbENvdW50O1xuICBjb25zdCBhY3Rpb24gPSAoKSA9PiB7XG4gICAgY2FsbGJhY2soKTtcbiAgICBpbnRlcnZhbFRpbWVvdXRzW2lkXSA9IGZha2VTZXRUaW1lb3V0KGFjdGlvbiwgbXMpO1xuICB9O1xuICBpbnRlcnZhbFRpbWVvdXRzW2lkXSA9IGZha2VTZXRUaW1lb3V0KGFjdGlvbiwgbXMpO1xuICByZXR1cm4gaWQ7XG59XG5cbmZ1bmN0aW9uIGZha2VDbGVhckludGVydmFsKGlkVG9DbGVhcjogbnVtYmVyKTogdm9pZCB7XG4gIGZha2VDbGVhclRpbWVvdXQoaW50ZXJ2YWxUaW1lb3V0c1tpZFRvQ2xlYXJdKTtcbn1cblxuZnVuY3Rpb24gYWR2YW5jZUNsb2NrKGRlbHRhTXM6IG51bWJlcik6IHZvaWQge1xuICBjb25zdCBhZHZhbmNlVG8gPSBub3cgKyBkZWx0YU1zO1xuXG4gIHdoaWxlICh0aW1lb3V0cy5sZW5ndGggIT09IDAgJiYgdGltZW91dHNbMF1bMV0gPD0gYWR2YW5jZVRvKSB7XG4gICAgY29uc3QgWyAsIHN0cmlrZVRpbWUsIGNhbGxiYWNrXSA9IHRpbWVvdXRzLnNoaWZ0KCk7XG4gICAgbm93ID0gc3RyaWtlVGltZTtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgbm93ID0gYWR2YW5jZVRvO1xufVxuXG4vKipcbiAqIEFsbG93cyB0ZXN0cyB0byB1c2UgdGhlIG5vbi1mYWtlIHNldFRpbWVvdXQgYW5kIGNsZWFyVGltZW91dCBmdW5jdGlvbnMuXG4gKi9cbmZ1bmN0aW9uIHVzZVJlYWxDbG9jaygpOiB2b2lkIHtcbiAgamFzbWluZS51bnNweShnbG9iYWwsICdzZXRUaW1lb3V0Jyk7XG4gIGphc21pbmUudW5zcHkoZ2xvYmFsLCAnY2xlYXJUaW1lb3V0Jyk7XG4gIGphc21pbmUudW5zcHkoRGF0ZSwgJ25vdycpO1xufVxuXG4vLyBFeHBvc2UgdGhlIGZha2UgdGltZXIgdXRpbHMgdG8gZ2xvYmFsIHRvIGJlIHVzZWQgYnkgbnBtIHNwZWMgdGVzdHMuXG5nbG9iYWwucmVzZXRUaW1lb3V0cyA9IHJlc2V0VGltZW91dHM7XG5nbG9iYWwuZmFrZVNldFRpbWVvdXQgPSBmYWtlU2V0VGltZW91dDtcbmdsb2JhbC5mYWtlQ2xlYXJUaW1lb3V0ID0gZmFrZUNsZWFyVGltZW91dDtcbmdsb2JhbC5mYWtlU2V0SW50ZXJ2YWwgPSBmYWtlU2V0SW50ZXJ2YWw7XG5nbG9iYWwuZmFrZUNsZWFySW50ZXJ2YWwgPSBmYWtlQ2xlYXJJbnRlcnZhbDtcbmdsb2JhbC5hZHZhbmNlQ2xvY2sgPSBhZHZhbmNlQ2xvY2s7XG5qYXNtaW5lLnVzZVJlYWxDbG9jayA9IHVzZVJlYWxDbG9jaztcbmNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcbmF0dHJpYnV0ZXNbJ2dldCddID0gZnVuY3Rpb24oKSB7IHJldHVybiBub3c7IH07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsLCAnbm93JywgYXR0cmlidXRlcyk7XG5cbi8qKlxuICogVGhpcyBob29rIGlzIGEgdGhlIGZpcnN0IGluaXRpYWxpemF0aW9uIGNvZGUgdGhhdCBoYXBwZW5zIGJlZm9yZSBhbnkgamFzbWluZSB0ZXN0IGNhc2UgaXNcbiAqIGV4ZWN1dGVkLiBUaGlzIGFsbG93cyB0byB1c2UgdGhlIGZha2UgdGltaW5nIGJ5IGRlZmF1bHQgYW5kIGlzIGEgZGlyZWN0IHBvcnQgZnJvbSBBdG9tJ3NcbiAqIGBzcGVjLWhlbHBlci5jb2ZmZWVgXG4gKi9cbmJlZm9yZUVhY2goKCkgPT4ge1xuICByZXNldFRpbWVvdXRzKCk7XG4gIHNweU9uKERhdGUsICdub3cnKS5hbmRDYWxsRmFrZSgoKSA9PiBub3cpO1xuICBzcHlPbihnbG9iYWwsICdzZXRUaW1lb3V0JykuYW5kQ2FsbEZha2UoZmFrZVNldFRpbWVvdXQpO1xuICBzcHlPbihnbG9iYWwsICdjbGVhclRpbWVvdXQnKS5hbmRDYWxsRmFrZShmYWtlQ2xlYXJUaW1lb3V0KTtcbn0pO1xuIl19