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
 * unspy is a ported utility from Atom's `spec-helper.coffee` that restores the jasmine spied
 * function on an object to its original value.
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
//# sourceMappingURL=data:application/json;base64,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QUMsY0FBYyxDQUFDLENBQUM7QUFDeEQsT0FBSyxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztDQUM3RCxDQUFDLENBQUMiLCJmaWxlIjoiZmFrZXRpbWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuLyoqXG4gKiBQb3J0IG9mIEF0b20ncyB0aW1lciB1dGlscyAoaHR0cHM6Ly9mYnVybC5jb20vMTA0NzE0NDU0KSB3aGljaCBpcyB1c2VmdWwgZm9yIHVuaXR0ZXN0LlxuICogVXNlIGZha2VTZXRUaW1lb3V0LCBmYWtlQ2xlYXJUaW1lb3V0LCBmYWtlU2V0SW50ZXJ2YWwgYW5kIGZha2VDbGVhckludGVydmFsIHRvIG1vY2sgTm9kZS5qcydzXG4gKiBUaW1lciB1dGlscywgYW5kIHVzaW5nIGFkdmFuY2VDbG9jayB0byBhZHZhbmNlIHRoZSBmYWtlIHRpbWVyIHRvIHRyaWdnZXIgdGltZWQgY2FsbGJhY2suXG4gKi9cbnJlcXVpcmUoJ2phc21pbmUtbm9kZScpO1xuXG5sZXQgbm93ID0gMDtcbmxldCB0aW1lb3V0Q291bnQgPSAwO1xubGV0IGludGVydmFsQ291bnQgPSAwO1xubGV0IHRpbWVvdXRzID0gW107XG5sZXQgaW50ZXJ2YWxUaW1lb3V0cyA9IHt9O1xuXG5mdW5jdGlvbiByZXNldFRpbWVvdXRzKCk6IHZvaWQge1xuICBub3cgPSAwO1xuICB0aW1lb3V0Q291bnQgPSAwO1xuICBpbnRlcnZhbENvdW50ID0gMDtcbiAgdGltZW91dHMgPSBbXTtcbiAgaW50ZXJ2YWxUaW1lb3V0cyA9IHt9O1xufVxuXG5mdW5jdGlvbiBmYWtlU2V0VGltZW91dChjYWxsYmFjazogKCkgPT4gP2FueSwgbXM6IG51bWJlcik6IG51bWJlciB7XG4gIGNvbnN0IGlkID0gKyt0aW1lb3V0Q291bnQ7XG4gIHRpbWVvdXRzLnB1c2goW2lkLCBub3cgKyBtcywgY2FsbGJhY2tdKTtcbiAgdGltZW91dHMgPSB0aW1lb3V0c1xuICAgICAgLnNvcnQoKFtpZDAsIHN0cmlrZVRpbWUwLCBjYjBdLCBbaWQxLCBzdHJpa2VUaW1lMSwgY2IxXSkgPT4gc3RyaWtlVGltZTAgLSBzdHJpa2VUaW1lMSk7XG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gZmFrZUNsZWFyVGltZW91dChpZFRvQ2xlYXI6IG51bWJlcik6IHZvaWQge1xuICB0aW1lb3V0cyA9IHRpbWVvdXRzXG4gICAgICAuZmlsdGVyKChbaWQsIHN0cmlrZVRpbWUsIGNhbGxiYWNrXSkgPT4gKGlkICE9PSBpZFRvQ2xlYXIpKTtcbn1cblxuZnVuY3Rpb24gZmFrZVNldEludGVydmFsKGNhbGxiYWNrOiAoKSA9PiA/YW55LCBtczogbnVtYmVyKTogbnVtYmVyIHtcbiAgY29uc3QgaWQgPSArK2ludGVydmFsQ291bnQ7XG4gIGNvbnN0IGFjdGlvbiA9ICgpID0+IHtcbiAgICBjYWxsYmFjaygpO1xuICAgIGludGVydmFsVGltZW91dHNbaWRdID0gZmFrZVNldFRpbWVvdXQoYWN0aW9uLCBtcyk7XG4gIH07XG4gIGludGVydmFsVGltZW91dHNbaWRdID0gZmFrZVNldFRpbWVvdXQoYWN0aW9uLCBtcyk7XG4gIHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gZmFrZUNsZWFySW50ZXJ2YWwoaWRUb0NsZWFyOiBudW1iZXIpOiB2b2lkIHtcbiAgZmFrZUNsZWFyVGltZW91dChpbnRlcnZhbFRpbWVvdXRzW2lkVG9DbGVhcl0pO1xufVxuXG5mdW5jdGlvbiBhZHZhbmNlQ2xvY2soZGVsdGFNczogbnVtYmVyKTogdm9pZCB7XG4gIGNvbnN0IGFkdmFuY2VUbyA9IG5vdyArIGRlbHRhTXM7XG5cbiAgd2hpbGUgKHRpbWVvdXRzLmxlbmd0aCAhPT0gMCAmJiB0aW1lb3V0c1swXVsxXSA8PSBhZHZhbmNlVG8pIHtcbiAgICBjb25zdCBbICwgc3RyaWtlVGltZSwgY2FsbGJhY2tdID0gdGltZW91dHMuc2hpZnQoKTtcbiAgICBub3cgPSBzdHJpa2VUaW1lO1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBub3cgPSBhZHZhbmNlVG87XG59XG5cbi8qKlxuICogQWxsb3dzIHRlc3RzIHRvIHVzZSB0aGUgbm9uLWZha2Ugc2V0VGltZW91dCBhbmQgY2xlYXJUaW1lb3V0IGZ1bmN0aW9ucy5cbiAqL1xuZnVuY3Rpb24gdXNlUmVhbENsb2NrKCk6IHZvaWQge1xuICB1bnNweShnbG9iYWwsICdzZXRUaW1lb3V0Jyk7XG4gIHVuc3B5KGdsb2JhbCwgJ2NsZWFyVGltZW91dCcpO1xuICB1bnNweShEYXRlLCAnbm93Jyk7XG59XG5cbi8qKlxuICogdW5zcHkgaXMgYSBwb3J0ZWQgdXRpbGl0eSBmcm9tIEF0b20ncyBgc3BlYy1oZWxwZXIuY29mZmVlYCB0aGF0IHJlc3RvcmVzIHRoZSBqYXNtaW5lIHNwaWVkXG4gKiBmdW5jdGlvbiBvbiBhbiBvYmplY3QgdG8gaXRzIG9yaWdpbmFsIHZhbHVlLlxuICovXG5mdW5jdGlvbiB1bnNweShvYmplY3Q6IE9iamVjdCwgbWV0aG9kTmFtZTogc3RyaW5nKSB7XG4gIGlmICghb2JqZWN0W21ldGhvZE5hbWVdLmhhc093blByb3BlcnR5KCdvcmlnaW5hbFZhbHVlJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBhIHNweScpO1xuICB9XG4gIG9iamVjdFttZXRob2ROYW1lXSA9IG9iamVjdFttZXRob2ROYW1lXS5vcmlnaW5hbFZhbHVlO1xufVxuXG4vLyBFeHBvc2UgdGhlIGZha2UgdGltZXIgdXRpbHMgdG8gZ2xvYmFsIHRvIGJlIHVzZWQgYnkgbnBtIHNwZWMgdGVzdHMuXG5nbG9iYWwucmVzZXRUaW1lb3V0cyA9IHJlc2V0VGltZW91dHM7XG5nbG9iYWwuZmFrZVNldFRpbWVvdXQgPSBmYWtlU2V0VGltZW91dDtcbmdsb2JhbC5mYWtlQ2xlYXJUaW1lb3V0ID0gZmFrZUNsZWFyVGltZW91dDtcbmdsb2JhbC5mYWtlU2V0SW50ZXJ2YWwgPSBmYWtlU2V0SW50ZXJ2YWw7XG5nbG9iYWwuZmFrZUNsZWFySW50ZXJ2YWwgPSBmYWtlQ2xlYXJJbnRlcnZhbDtcbmdsb2JhbC5hZHZhbmNlQ2xvY2sgPSBhZHZhbmNlQ2xvY2s7XG5nbG9iYWwudXNlUmVhbENsb2NrID0gdXNlUmVhbENsb2NrO1xuZ2xvYmFsLnVuc3B5ID0gdW5zcHk7XG5nbG9iYWwubm93ID0gdW5zcHk7XG5jb25zdCBhdHRyaWJ1dGVzID0ge307XG5hdHRyaWJ1dGVzWydnZXQnXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gbm93OyB9O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbCwgJ25vdycsIGF0dHJpYnV0ZXMpO1xuXG4vKipcbiAqIFRoaXMgaG9vayBpcyBhIHRoZSBmaXJzdCBpbml0aWFsaXphdGlvbiBjb2RlIHRoYXQgaGFwcGVucyBiZWZvcmUgYW55IGphc21pbmUgdGVzdCBjYXNlIGlzXG4gKiBleGVjdXRlZC4gVGhpcyBhbGxvd3MgdG8gdXNlIHRoZSBmYWtlIHRpbWluZyBieSBkZWZhdWx0IGFuZCBpcyBhIGRpcmVjdCBwb3J0IGZyb20gQXRvbSdzXG4gKiBgc3BlYy1oZWxwZXIuY29mZmVlYFxuICovXG5iZWZvcmVFYWNoKCgpID0+IHtcbiAgcmVzZXRUaW1lb3V0cygpO1xuICBzcHlPbihEYXRlLCAnbm93JykuYW5kQ2FsbEZha2UoKCkgPT4gbm93KTtcbiAgc3B5T24oZ2xvYmFsLCAnc2V0VGltZW91dCcpLmFuZENhbGxGYWtlKGZha2VTZXRUaW1lb3V0KTtcbiAgc3B5T24oZ2xvYmFsLCAnY2xlYXJUaW1lb3V0JykuYW5kQ2FsbEZha2UoZmFrZUNsZWFyVGltZW91dCk7XG59KTtcbiJdfQ==