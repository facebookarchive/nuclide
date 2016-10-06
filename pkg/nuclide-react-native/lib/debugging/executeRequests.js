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

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../../commons-atom/featureConfig'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../../commons-node/process');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../../nuclide-logging');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
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
    return (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.merge((_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.of({ kind: 'pid', pid: process.pid }),

    // The messages we're receiving from the worker process.
    (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'message'),

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
      (_child_process2 || _child_process()).default.fork((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(__dirname, 'executor.js'), [], {
        execArgv: ['--debug-brk'],
        execPath: (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-react-native.pathToNode'),
        silent: true
      })
    );
  });
}