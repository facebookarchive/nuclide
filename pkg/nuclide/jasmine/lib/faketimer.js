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
  unspy(global, 'setTimeout');
  unspy(global, 'clearTimeout');
  unspy(Date, 'now');
}

/**
 * unspy is a ported utility from Atom's `spec-helper.coffee` that restores the jasmine spied function
 * on an object to its original value.
 */
function unspy(object, methodName) {
  if (!object[methodName].hasOwnProperty('originalValue')) {
    throw new Error('Not a spy');
  }
  object[methodName] = object[methodName].originalValue;
}

// Expose the fake timer utils to global to be used by npm spec tests.
global.resetTimeouts = resetTimeouts;
global.fakeSetTimeout = fakeSetTimeout;
global.fakeClearTimeout = fakeClearTimeout;
global.fakeSetInterval = fakeSetInterval;
global.fakeClearInterval = fakeClearInterval;
global.advanceClock = advanceClock;
global.useRealClock = useRealClock;
global.unspy = unspy;
global.now = unspy;
var attributes = {};
attributes['get'] = function () {
  return now;
};
Object.defineProperty(global, 'now', attributes);

/**
 * This hook is a the first initialization code that happens before any jasmine test case is executed.
 * This allows to use the fake timing by default and is a direct port from Atom's `spec-helper.coffee`
 */
beforeEach(function () {
  resetTimeouts();
  spyOn(Date, 'now').andCallFake(function () {
    return now;
  });
  spyOn(global, 'setTimeout').andCallFake(fakeSetTimeout);
  spyOn(global, 'clearTimeout').andCallFake(fakeClearTimeout);
});
//# sourceMappingURL=data:application/json;base64,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QyxjQUFjLENBQUMsQ0FBQztBQUN4RCxPQUFLLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzdELENBQUMsQ0FBQyIsImZpbGUiOiJmYWtldGltZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKipcbiAqIFBvcnQgb2YgQXRvbSdzIHRpbWVyIHV0aWxzIChodHRwczovL2ZidXJsLmNvbS8xMDQ3MTQ0NTQpIHdoaWNoIGlzIHVzZWZ1bCBmb3IgdW5pdHRlc3QuXG4gKiBVc2UgZmFrZVNldFRpbWVvdXQsIGZha2VDbGVhclRpbWVvdXQsIGZha2VTZXRJbnRlcnZhbCBhbmQgZmFrZUNsZWFySW50ZXJ2YWwgdG8gbW9jayBOb2RlLmpzJ3NcbiAqIFRpbWVyIHV0aWxzLCBhbmQgdXNpbmcgYWR2YW5jZUNsb2NrIHRvIGFkdmFuY2UgdGhlIGZha2UgdGltZXIgdG8gdHJpZ2dlciB0aW1lZCBjYWxsYmFjay5cbiAqL1xucmVxdWlyZSgnamFzbWluZS1ub2RlJyk7XG5cbmxldCBub3cgPSAwO1xubGV0IHRpbWVvdXRDb3VudCA9IDA7XG5sZXQgaW50ZXJ2YWxDb3VudCA9IDA7XG5sZXQgdGltZW91dHMgPSBbXTtcbmxldCBpbnRlcnZhbFRpbWVvdXRzID0ge307XG5cbmZ1bmN0aW9uIHJlc2V0VGltZW91dHMoKTogdm9pZCB7XG4gIG5vdyA9IDA7XG4gIHRpbWVvdXRDb3VudCA9IDA7XG4gIGludGVydmFsQ291bnQgPSAwO1xuICB0aW1lb3V0cyA9IFtdO1xuICBpbnRlcnZhbFRpbWVvdXRzID0ge307XG59XG5cbmZ1bmN0aW9uIGZha2VTZXRUaW1lb3V0KGNhbGxiYWNrOiAoKSA9PiA/YW55LCBtczogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgaWQgPSArK3RpbWVvdXRDb3VudDtcbiAgdGltZW91dHMucHVzaChbaWQsIG5vdyArIG1zLCBjYWxsYmFja10pO1xuICB0aW1lb3V0cyA9IHRpbWVvdXRzXG4gICAgICAuc29ydCgoW2lkMCwgc3RyaWtlVGltZTAsIGNiMF0sIFtpZDEsIHN0cmlrZVRpbWUxLCBjYjFdKSA9PiBzdHJpa2VUaW1lMCAtIHN0cmlrZVRpbWUxKTtcbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBmYWtlQ2xlYXJUaW1lb3V0KGlkVG9DbGVhcjogbnVtYmVyKTogdm9pZCB7XG4gIHRpbWVvdXRzID0gdGltZW91dHNcbiAgICAgIC5maWx0ZXIoKFtpZCwgc3RyaWtlVGltZSwgY2FsbGJhY2tdKSA9PiAoaWQgIT09IGlkVG9DbGVhcikpO1xufVxuXG5mdW5jdGlvbiBmYWtlU2V0SW50ZXJ2YWwoY2FsbGJhY2s6ICgpID0+ID9hbnksIG1zOiBudW1iZXIpOiBudW1iZXIge1xuICBjb25zdCBpZCA9ICsraW50ZXJ2YWxDb3VudDtcbiAgY29uc3QgYWN0aW9uID0gKCkgPT4ge1xuICAgIGNhbGxiYWNrKCk7XG4gICAgaW50ZXJ2YWxUaW1lb3V0c1tpZF0gPSBmYWtlU2V0VGltZW91dChhY3Rpb24sIG1zKTtcbiAgfTtcbiAgaW50ZXJ2YWxUaW1lb3V0c1tpZF0gPSBmYWtlU2V0VGltZW91dChhY3Rpb24sIG1zKTtcbiAgcmV0dXJuIGlkO1xufVxuXG5mdW5jdGlvbiBmYWtlQ2xlYXJJbnRlcnZhbChpZFRvQ2xlYXI6IG51bWJlcik6IHZvaWQge1xuICBmYWtlQ2xlYXJUaW1lb3V0KGludGVydmFsVGltZW91dHNbaWRUb0NsZWFyXSk7XG59XG5cbmZ1bmN0aW9uIGFkdmFuY2VDbG9jayhkZWx0YU1zOiBudW1iZXIpOiB2b2lkIHtcbiAgY29uc3QgYWR2YW5jZVRvID0gbm93ICsgZGVsdGFNcztcblxuICB3aGlsZSAodGltZW91dHMubGVuZ3RoICE9PSAwICYmIHRpbWVvdXRzWzBdWzFdIDw9IGFkdmFuY2VUbykge1xuICAgIGNvbnN0IFsgLCBzdHJpa2VUaW1lLCBjYWxsYmFja10gPSB0aW1lb3V0cy5zaGlmdCgpO1xuICAgIG5vdyA9IHN0cmlrZVRpbWU7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIG5vdyA9IGFkdmFuY2VUbztcbn1cblxuLyoqXG4gKiBBbGxvd3MgdGVzdHMgdG8gdXNlIHRoZSBub24tZmFrZSBzZXRUaW1lb3V0IGFuZCBjbGVhclRpbWVvdXQgZnVuY3Rpb25zLlxuICovXG5mdW5jdGlvbiB1c2VSZWFsQ2xvY2soKTogdm9pZCB7XG4gIHVuc3B5KGdsb2JhbCwgJ3NldFRpbWVvdXQnKTtcbiAgdW5zcHkoZ2xvYmFsLCAnY2xlYXJUaW1lb3V0Jyk7XG4gIHVuc3B5KERhdGUsICdub3cnKTtcbn1cblxuLyoqXG4gKiB1bnNweSBpcyBhIHBvcnRlZCB1dGlsaXR5IGZyb20gQXRvbSdzIGBzcGVjLWhlbHBlci5jb2ZmZWVgIHRoYXQgcmVzdG9yZXMgdGhlIGphc21pbmUgc3BpZWQgZnVuY3Rpb25cbiAqIG9uIGFuIG9iamVjdCB0byBpdHMgb3JpZ2luYWwgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHVuc3B5KG9iamVjdDogT2JqZWN0LCBtZXRob2ROYW1lOiBzdHJpbmcpIHtcbiAgaWYgKCFvYmplY3RbbWV0aG9kTmFtZV0uaGFzT3duUHJvcGVydHkoJ29yaWdpbmFsVmFsdWUnKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignTm90IGEgc3B5Jyk7XG4gIH1cbiAgb2JqZWN0W21ldGhvZE5hbWVdID0gb2JqZWN0W21ldGhvZE5hbWVdLm9yaWdpbmFsVmFsdWU7XG59XG5cbi8vIEV4cG9zZSB0aGUgZmFrZSB0aW1lciB1dGlscyB0byBnbG9iYWwgdG8gYmUgdXNlZCBieSBucG0gc3BlYyB0ZXN0cy5cbmdsb2JhbC5yZXNldFRpbWVvdXRzID0gcmVzZXRUaW1lb3V0cztcbmdsb2JhbC5mYWtlU2V0VGltZW91dCA9IGZha2VTZXRUaW1lb3V0O1xuZ2xvYmFsLmZha2VDbGVhclRpbWVvdXQgPSBmYWtlQ2xlYXJUaW1lb3V0O1xuZ2xvYmFsLmZha2VTZXRJbnRlcnZhbCA9IGZha2VTZXRJbnRlcnZhbDtcbmdsb2JhbC5mYWtlQ2xlYXJJbnRlcnZhbCA9IGZha2VDbGVhckludGVydmFsO1xuZ2xvYmFsLmFkdmFuY2VDbG9jayA9IGFkdmFuY2VDbG9jaztcbmdsb2JhbC51c2VSZWFsQ2xvY2sgPSB1c2VSZWFsQ2xvY2s7XG5nbG9iYWwudW5zcHkgPSB1bnNweTtcbmdsb2JhbC5ub3cgPSB1bnNweTtcbmNvbnN0IGF0dHJpYnV0ZXMgPSB7fTtcbmF0dHJpYnV0ZXNbJ2dldCddID0gZnVuY3Rpb24oKSB7IHJldHVybiBub3c7IH07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsLCAnbm93JywgYXR0cmlidXRlcyk7XG5cbi8qKlxuICogVGhpcyBob29rIGlzIGEgdGhlIGZpcnN0IGluaXRpYWxpemF0aW9uIGNvZGUgdGhhdCBoYXBwZW5zIGJlZm9yZSBhbnkgamFzbWluZSB0ZXN0IGNhc2UgaXMgZXhlY3V0ZWQuXG4gKiBUaGlzIGFsbG93cyB0byB1c2UgdGhlIGZha2UgdGltaW5nIGJ5IGRlZmF1bHQgYW5kIGlzIGEgZGlyZWN0IHBvcnQgZnJvbSBBdG9tJ3MgYHNwZWMtaGVscGVyLmNvZmZlZWBcbiAqL1xuYmVmb3JlRWFjaCgoKSA9PiB7XG4gIHJlc2V0VGltZW91dHMoKTtcbiAgc3B5T24oRGF0ZSwgJ25vdycpLmFuZENhbGxGYWtlKCgpID0+IG5vdyk7XG4gIHNweU9uKGdsb2JhbCwgJ3NldFRpbWVvdXQnKS5hbmRDYWxsRmFrZShmYWtlU2V0VGltZW91dCk7XG4gIHNweU9uKGdsb2JhbCwgJ2NsZWFyVGltZW91dCcpLmFuZENhbGxGYWtlKGZha2VDbGVhclRpbWVvdXQpO1xufSk7XG4iXX0=