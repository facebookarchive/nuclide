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

var _commonsAtomFeatureConfig;

function _load_commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig = _interopRequireDefault(require('../../../commons-atom/featureConfig'));
}

var _commonsNodeProcess;

function _load_commonsNodeProcess() {
  return _commonsNodeProcess = require('../../../commons-node/process');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

var _child_process;

function _load_child_process() {
  return _child_process = _interopRequireDefault(require('child_process'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

/**
 * This function models the executor side of the debugging equation: it receives a stream of
 * instructions from the RN app, executes them, and emits a stream of results.
 */

function executeRequests(requests) {

  // Wait until we get the first request, then spawn a worker process for processing them.
  var workerProcess = requests.first().switchMap(createWorker).share();

  return workerProcess.switchMap(function (process) {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.merge((_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({ kind: 'pid', pid: process.pid }),

    // The messages we're receiving from the worker process.
    (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromEvent(process, 'message'),

    // Send the incoming requests to the worker process for evaluation.
    requests.do(function (request) {
      return process.send(request);
    }).ignoreElements(),

    // Pipe output from forked process. This just makes things easier to debug for us.
    (0, (_commonsNodeProcess || _load_commonsNodeProcess()).getOutputStream)(process).do(function (message) {
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
  return (0, (_commonsNodeProcess || _load_commonsNodeProcess()).createProcessStream)(function () {
    return(
      // TODO: The node location/path needs to be more configurable. We need to figure out a way to
      //   handle this across the board.
      (_child_process || _load_child_process()).default.fork((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(__dirname, 'executor.js'), [], {
        execArgv: ['--debug-brk'],
        execPath: (_commonsAtomFeatureConfig || _load_commonsAtomFeatureConfig()).default.get('nuclide-react-native.pathToNode'),
        silent: true
      })
    );
  });
}