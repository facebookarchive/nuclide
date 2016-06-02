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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideProcessOutput2;

function _nuclideProcessOutput() {
  return _nuclideProcessOutput2 = _interopRequireDefault(require('../../nuclide-process-output'));
}

var _nuclideProcessOutputStore2;

function _nuclideProcessOutputStore() {
  return _nuclideProcessOutputStore2 = require('../../nuclide-process-output-store');
}

var _nuclideProcessOutputHandler2;

function _nuclideProcessOutputHandler() {
  return _nuclideProcessOutputHandler2 = require('../../nuclide-process-output-handler');
}

var BUCK_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

exports.default = _asyncToGenerator(function* (_ref) {
  var buckProject = _ref.buckProject;
  var buildTarget = _ref.buildTarget;
  var simulator = _ref.simulator;
  var subcommand = _ref.subcommand;
  var debug = _ref.debug;
  var appArgs = _ref.appArgs;
  return yield* (function* () {
    var _ref2 = (0, (_nuclideProcessOutput2 || _nuclideProcessOutput()).default)();

    var runCommandInNewPane = _ref2.runCommandInNewPane;
    var disposable = _ref2.disposable;

    var run = subcommand === 'install';
    var runProcessWithHandlers = _asyncToGenerator(function* (dataHandlerOptions) {
      var stdout = dataHandlerOptions.stdout;
      var stderr = dataHandlerOptions.stderr;
      var error = dataHandlerOptions.error;
      var exit = dataHandlerOptions.exit;

      var observable = undefined;
      (0, (_assert2 || _assert()).default)(buckProject);
      if (run) {
        observable = yield buckProject.installWithOutput([buildTarget], simulator, { run: run, debug: debug, appArgs: appArgs });
      } else if (subcommand === 'build') {
        observable = yield buckProject.buildWithOutput([buildTarget]);
      } else if (subcommand === 'test') {
        observable = yield buckProject.testWithOutput([buildTarget]);
      } else {
        throw Error('Unknown subcommand: ' + subcommand);
      }
      var onNext = function onNext(data) {
        if (data.stdout) {
          stdout(data.stdout);
        } else {
          stderr(data.stderr || '');
        }
      };
      var onError = function onError(data) {
        error(new Error(data));
        exit(1);
        disposable.dispose();
      };
      var onExit = function onExit() {
        // onExit will only be called if the process completes successfully,
        // i.e. with exit code 0. Unfortunately an Observable cannot pass an
        // argument (e.g. an exit code) on completion.
        exit(0);
        disposable.dispose();
      };
      var subscription = observable.subscribe(onNext, onError, onExit);

      return {
        kill: function kill() {
          subscription.unsubscribe();
          disposable.dispose();
        }
      };
    });

    return new Promise(function (resolve, reject) {
      var processOutputStore = new (_nuclideProcessOutputStore2 || _nuclideProcessOutputStore()).ProcessOutputStore(runProcessWithHandlers);

      var exitSubscription = processOutputStore.onProcessExit(function (exitCode) {
        if (exitCode === 0 && run) {
          // Get the process ID.
          var allBuildOutput = processOutputStore.getStdout() || '';
          var pidMatch = allBuildOutput.match(BUCK_PROCESS_ID_REGEX);
          if (pidMatch) {
            // Index 1 is the captured pid.
            resolve({ pid: parseInt(pidMatch[1], 10) });
          }
        } else {
          resolve({});
        }
        exitSubscription.dispose();
        processOutputStore.dispose();
      });

      runCommandInNewPane({
        tabTitle: 'buck ' + subcommand + ' ' + buildTarget,
        processOutputStore: processOutputStore,
        processOutputHandler: (_nuclideProcessOutputHandler2 || _nuclideProcessOutputHandler()).handleBuckAnsiOutput,
        destroyExistingPane: true
      });
    });
  })();
});
module.exports = exports.default;