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

exports.executeRequests = executeRequests;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

/**
 * This function models the executor side of the debugging equation: it receives a stream of
 * instructions from the RN app, executes them, and emits a stream of results.
 */

function executeRequests(requests) {

  // Wait until we get the first request, then spawn a worker process for processing them.
  var workerProcess = requests.first().switchMap(createWorker).share();

  return workerProcess.switchMap(function (process) {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({ kind: 'pid', pid: process.pid }),

    // The messages we're receiving from the worker process.
    (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromEvent(process, 'message'),

    // Send the incoming requests to the worker process for evaluation.
    requests.do(function (request) {
      return process.send(request);
    }).ignoreElements(),

    // Pipe output from forked process. This just makes things easier to debug for us.
    (0, (_commonsNodeProcess2 || _commonsNodeProcess()).getOutputStream)(process).do(function (message) {
      switch (message.kind) {
        case 'error':
          logger.error(message.error.message);
          return;
        case 'stderr':
        case 'stdout':
          logger.info(message.data.toString());
          return;
      }
    }).ignoreElements());
  }).share();
}

function createWorker() {
  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).createProcessStream)(function () {
    return(
      // TODO: The node location/path needs to be more configurable. We need to figure out a way to
      //   handle this across the board.
      (0, (_commonsNodeProcess2 || _commonsNodeProcess()).forkWithExecEnvironment)((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, 'executor.js'), [], {
        execArgv: ['--debug-brk'],
        execPath: (_nuclideFeatureConfig2 || _nuclideFeatureConfig()).default.get('nuclide-react-native.pathToNode'),
        silent: true
      })
    );
  });
}