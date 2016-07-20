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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsAtomDestroyPaneItem2;

function _commonsAtomDestroyPaneItem() {
  return _commonsAtomDestroyPaneItem2 = _interopRequireDefault(require('../../commons-atom/destroy-pane-item'));
}

var _createBoundTextBuffer2;

function _createBoundTextBuffer() {
  return _createBoundTextBuffer2 = _interopRequireDefault(require('./createBoundTextBuffer'));
}

var NUCLIDE_PROCESS_OUTPUT_VIEW_URI = 'atom://nuclide/process-output/';
var PROCESS_OUTPUT_HANDLER_KEY = 'nuclide-processOutputHandler';
var PROCESS_OUTPUT_STORE_KEY = 'nuclide-processOutputStore';
var PROCESS_OUTPUT_VIEW_TOP_ELEMENT = 'nuclide-processOutputViewTopElement';

var subscriptions = undefined;
var processOutputStores = undefined;
var logger = undefined;

function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
  }
  return logger;
}

/**
 * @param uri A String consisting of NUCLIDE_PROCESS_OUTPUT_VIEW_URI plus a
 *   tabTitle for the new pane.
 * @param options The same as the `options` passed to the atom.workspace.open()
 *   call that triggered this function. In this case, it should contain special
 *   Nuclide arguments (see `runCommandInNewPane`).
 */
function createProcessOutputView(uri, openOptions) {
  var processOutputStore = openOptions[PROCESS_OUTPUT_STORE_KEY];
  var processOutputHandler = openOptions[PROCESS_OUTPUT_HANDLER_KEY];
  var processOutputViewTopElement = openOptions[PROCESS_OUTPUT_VIEW_TOP_ELEMENT];
  var tabTitle = uri.slice(NUCLIDE_PROCESS_OUTPUT_VIEW_URI.length);

  var ProcessOutputView = require('./ProcessOutputView');
  var component = ProcessOutputView.createView({
    title: tabTitle,
    textBuffer: (0, (_createBoundTextBuffer2 || _createBoundTextBuffer()).default)(processOutputStore, processOutputHandler),
    processOutputStore: processOutputStore,
    processOutputViewTopElement: processOutputViewTopElement
  });

  (0, (_assert2 || _assert()).default)(processOutputStores);
  processOutputStores.add(processOutputStore);

  // When the process exits, we want to remove the reference to the process.
  var handleProcessExit = function handleProcessExit() {
    if (processOutputStores) {
      processOutputStores.delete(processOutputStore);
    }
  };
  var handleProcessExitWithError = function handleProcessExitWithError(error) {
    getLogger().error('runCommandInNewPane encountered an error running: ' + tabTitle, error);
    handleProcessExit();
  };

  processOutputStore.startProcess().then(handleProcessExit, handleProcessExitWithError);
  return component;
}

/**
 * @param options See definition of RunCommandOptions.
 */
function runCommandInNewPane(options) {
  var _openOptions;

  var openOptions = (_openOptions = {}, _defineProperty(_openOptions, PROCESS_OUTPUT_HANDLER_KEY, options.processOutputHandler), _defineProperty(_openOptions, PROCESS_OUTPUT_STORE_KEY, options.processOutputStore), _defineProperty(_openOptions, PROCESS_OUTPUT_VIEW_TOP_ELEMENT, options.processOutputViewTopElement), _openOptions);

  var tabTitle = options.tabTitle;
  if (options.destroyExistingPane) {
    (0, (_commonsAtomDestroyPaneItem2 || _commonsAtomDestroyPaneItem()).default)(tabTitle);
  }
  // Not documented: the 'options' passed to atom.workspace.open() are passed to the opener.
  // There's no other great way for a consumer of this service to specify a ProcessOutputHandler.
  return atom.workspace.open(NUCLIDE_PROCESS_OUTPUT_VIEW_URI + tabTitle, openOptions);
}

/**
 * Set up and Teardown of Atom Opener
 */

function activateModule() {
  if (!subscriptions) {
    subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    // $FlowFixMe: the expando options argument is an undocumented hack.
    subscriptions.add(atom.workspace.addOpener(function (uri, options) {
      if (uri.startsWith(NUCLIDE_PROCESS_OUTPUT_VIEW_URI)) {
        return createProcessOutputView(uri, options);
      }
    }));
    processOutputStores = new Set();
  }
}

function disposeModule() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (processOutputStores) {
    for (var processStore of processOutputStores) {
      processStore.dispose();
    }
    processOutputStores = null;
  }
}

/**
 * "Reference Counting"
 */

var references = 0;
function incrementReferences() {
  if (references === 0) {
    activateModule();
  }
  references++;
}

function decrementReferences() {
  references--;
  if (references < 0) {
    references = 0;
    getLogger.error('getRunCommandInNewPane: number of decrementReferences() ' + 'calls has exceeded the number of incrementReferences() calls.');
  }
  if (references === 0) {
    disposeModule();
  }
}

/**
 * @return a RunCommandFunctionAndCleanup, which has the fields:
 *   - runCommandInNewPane: The function which can be used to create a new pane
 *       with the output of a process.
 *   - disposable: A Disposable which should be disposed when this function is
 *       no longer needed by the caller.
 */
function getRunCommandInNewPane() {
  incrementReferences();
  return {
    runCommandInNewPane: runCommandInNewPane,
    disposable: new (_atom2 || _atom()).Disposable(function () {
      return decrementReferences();
    })
  };
}

module.exports = getRunCommandInNewPane;

/* A title for the tab of the newly opened pane. */

/* The ProcessOutputStore that provides the data to display. */

/**
 * An optional ProcessOutputHandler that is appropriate for the expected output. See the
 * constructor of ProcessOutputView for more information.
 */

/* An optional React component that will be placed at the top of the process output view. */

/* If true, before opening the new tab, it will close any existing tab with the same title. */