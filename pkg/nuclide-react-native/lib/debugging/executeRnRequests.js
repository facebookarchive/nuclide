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

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../../commons-node/stream');
}

var _nuclideFeatureConfig2;

function _nuclideFeatureConfig() {
  return _nuclideFeatureConfig2 = _interopRequireDefault(require('../../../nuclide-feature-config'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../../commons-node/process');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../../nuclide-logging');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../../nuclide-remote-uri'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var logger = (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)();

function executeRnRequests(rnRequests) {
  var workerProcess = (0, (_commonsNodeProcess2 || _commonsNodeProcess()).createProcessStream)(function () {
    return(
      // TODO: The node location/path needs to be more configurable. We need to figure out a way to
      //   handle this across the board.
      (0, (_commonsNodeProcess2 || _commonsNodeProcess()).forkWithExecEnvironment)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, 'executor.js'), [], {
        execArgv: ['--debug-brk'],
        execPath: (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-react-native.pathToNode'),
        silent: true
      })
    );
  }).share();

  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge(workerProcess.map(function (process) {
    return {
      kind: 'pid',
      pid: process.pid
    };
  }),

  // The messages we're receiving from the worker process.
  workerProcess.flatMap(function (process) {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(process, 'message');
  }), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function () {
    return new (_commonsNodeStream2 || _commonsNodeStream()).CompositeSubscription(
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
      return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).getOutputStream)(process);
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