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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.executeRnRequests = executeRnRequests;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _nuclideCommonsLibProcess = require('../../nuclide-commons/lib/process');

var _nuclideLogging = require('../../nuclide-logging');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rxjs = require('rxjs');

var logger = (0, _nuclideLogging.getLogger)();

function executeRnRequests(rnRequests) {
  var workerProcess = (0, _nuclideCommonsLibProcess.createProcessStream)(function () {
    return(
      // TODO: The node location/path needs to be more configurable. We need to figure out a way to
      //   handle this across the board.
      (0, _nuclideCommonsLibProcess.forkWithExecEnvironment)(_path2['default'].join(__dirname, 'executor.js'), [], {
        execArgv: ['--debug-brk'],
        execPath: _nuclideFeatureConfig2['default'].get('nuclide-react-native.pathToNode'),
        silent: true
      })
    );
  }).share();

  return _rxjs.Observable.merge(workerProcess.map(function (process) {
    return {
      kind: 'pid',
      pid: process.pid
    };
  }),

  // The messages we're receiving from the worker process.
  workerProcess.flatMap(function (process) {
    return _rxjs.Observable.fromEvent(process, 'message');
  }), _rxjs.Observable.create(function () {
    return new _nuclideCommons.CompositeSubscription(
    // Send the incoming requests to the worker process for evaluation.
    rnRequests.withLatestFrom(workerProcess, function (r, p) {
      return [r, p];
    }).subscribe(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var request = _ref2[0];
      var process = _ref2[1];
      process.send(request);
    }),

    // Pipe output from forked process. This just makes things easier to debug for us.
    workerProcess.switchMap(function (process) {
      return (0, _nuclideCommonsLibProcess.getOutputStream)(process);
    }).subscribe(function (message) {
      switch (message.kind) {
        case 'error':
          logger.error(message.error.message);
          return;
        case 'stderr':
        case 'stdout':
          logger.info(message.data.toString());
          return;
      }
    }));
  })).share();
}