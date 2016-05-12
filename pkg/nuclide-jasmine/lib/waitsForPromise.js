function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

function waitsForPromise() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var shouldReject = undefined;
  var timeout = undefined;
  if (args.length > 1) {
    shouldReject = args[0].shouldReject;
    timeout = args[0].timeout;
  } else {
    shouldReject = false;
    timeout = 0;
  }

  var finished = false;

  runs(function () {
    var fn = args[args.length - 1];
    (0, (_assert2 || _assert()).default)(typeof fn === 'function');
    var promise = fn();
    if (shouldReject) {
      promise.then(function () {
        jasmine.getEnv().currentSpec.fail('Expected promise to be rejected, but it was resolved');
      }, function () {
        // Do nothing, it's expected.
      }).then(function () {
        finished = true;
      });
    } else {
      promise.then(function () {
        // Do nothing, it's expected.
      }, function (error) {
        var text = error ? error.stack || error.toString() : 'undefined';
        jasmine.getEnv().currentSpec.fail('Expected promise to be resolved, but it was rejected with ' + text);
      }).then(function () {
        finished = true;
      });
    }
  });

  waitsFor(timeout, function () {
    return finished;
  });
}

module.exports = waitsForPromise;