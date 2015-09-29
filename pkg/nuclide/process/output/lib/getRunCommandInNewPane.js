'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessOutputStore} from 'nuclide-process-output-store';
import type ProcessOutputHandler from './types';
export type RunCommandFunctionAndCleanup = {
  runCommandInNewPane: (command: string, args: Array<string>, options?: Object) => void;
  disposable: atom$IDisposable;
};

import {CompositeDisposable, Disposable} from 'atom';
import invariant from 'assert';

var NUCLIDE_PROCESS_OUTPUT_VIEW_URI = 'atom://nuclide/process-output/';
var PROCESS_OUTPUT_HANDLER_KEY = 'nuclide-processOutputHandler';
var PROCESS_OUTPUT_STORE_KEY = 'nuclide-processOutputStore';
type CreateProcessOutputViewOptions = {
  // Using the constants here results in a syntax error.
  'nuclide-processOutputHandler': ?ProcessOutputHandler;
  'nuclide-processOutputStore': ProcessOutputStore;
};

var subscriptions: ?CompositeDisposable;
var processToDisposables: ?Map<ProcessOutputStore, CompositeDisposable>;
var logger;

function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
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
function createProcessOutputView(
  uri: string,
  openOptions: CreateProcessOutputViewOptions
): HTMLElement {
  var processOutputStore = openOptions[PROCESS_OUTPUT_STORE_KEY];
  var processOutputHandler = openOptions[PROCESS_OUTPUT_HANDLER_KEY];
  var tabTitle = uri.slice(NUCLIDE_PROCESS_OUTPUT_VIEW_URI.length);

  var ProcessOutputWrapper = require('./ProcessOutputWrapper');
  var hostElement = new ProcessOutputWrapper();
  hostElement.initialize({
    title: tabTitle,
    initialProps: {
      processOutputStore,
      processOutputHandler,
    },
  });

  var processSubscriptions = new CompositeDisposable();
  invariant(processToDisposables);
  processToDisposables.set(processOutputStore, processSubscriptions);

  // When the process exits, we want to remove the reference to the process.
  var handleProcessExit = () => {
    if (processToDisposables) {
      processToDisposables.delete(processOutputStore);
    }
  };
  var handleProcessExitWithError = (error: Error) => {
    getLogger().error(`runCommandInNewPane encountered an error running: ${tabTitle}`, error);
    handleProcessExit();
  };

  processOutputStore.startProcess().then(handleProcessExit, handleProcessExitWithError);
  return hostElement;
}

/**
 * @param tabTitle A title for tne tab of the newly opened pane.
 * @param processOutputStore The ProcessOutputStore that provides the data to display.
 * @param processOutputHandler An optional ProcessOutputHandler that is appropriate
 *   for the expected output. See the constructor of ProcessOutputView for more information.
 */
function runCommandInNewPane(
  tabTitle: string,
  processOutputStore: ProcessOutputStore,
  processOutputHandler?: ProcessOutputHandler,
): Promise<atom$TextEditor> {
  var openOptions = {
    [PROCESS_OUTPUT_HANDLER_KEY]: processOutputHandler,
    [PROCESS_OUTPUT_STORE_KEY]: processOutputStore,
  };
  // Not documented: the 'options' passed to atom.workspace.open() are passed to the opener.
  // There's no other great way for a consumer of this service to specify a ProcessOutputHandler.
  return atom.workspace.open(NUCLIDE_PROCESS_OUTPUT_VIEW_URI + tabTitle, openOptions);
}

/**
 * Set up and Teardown of Atom Opener
 */

function activateModule(): void {
  if (!subscriptions) {
    subscriptions = new CompositeDisposable();
    subscriptions.add(atom.workspace.addOpener((uri, options) => {
      if (uri.startsWith(NUCLIDE_PROCESS_OUTPUT_VIEW_URI)) {
        return createProcessOutputView(uri, options);
      }
    }));
    processToDisposables = new Map();
  }
}

function disposeModule(): void {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (processToDisposables) {
    for (var processStore of processToDisposables.keys()) {
      processStore.dispose();
    }
    processToDisposables = null;
  }
}

/**
 * "Reference Counting"
 */

var references: number = 0;
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
    getLogger.error('getRunCommandInNewPane: number of decrementReferences() ' +
      'calls has exceeded the number of incrementReferences() calls.');
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
function getRunCommandInNewPane(): RunCommandFunctionAndCleanup {
  incrementReferences();
  return {
    runCommandInNewPane,
    disposable: new Disposable(() => decrementReferences()),
  };
}

module.exports = getRunCommandInNewPane;
