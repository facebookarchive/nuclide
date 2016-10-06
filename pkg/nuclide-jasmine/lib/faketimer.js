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
  jasmine.unspy(global, 'setInterval');
  jasmine.unspy(global, 'clearInterval');
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
attributes.get = function () {
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
  spyOn(global, 'setInterval').andCallFake(fakeSetInterval);
  spyOn(global, 'clearInterval').andCallFake(fakeClearInterval);
});