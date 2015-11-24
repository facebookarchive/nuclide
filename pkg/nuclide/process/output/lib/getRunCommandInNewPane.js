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

export type RunCommandOptions = {
  /* A title for the tab of the newly opened pane. */
  tabTitle: string;
  /* The ProcessOutputStore that provides the data to display. */
  processOutputStore: ProcessOutputStore;
  /**
   * An optional ProcessOutputHandler that is appropriate for the expected output. See the
   * constructor of ProcessOutputView for more information.
   */
  processOutputHandler?: ProcessOutputHandler;
  /* An optional React component that will be placed at the top of the process output view. */
  processOutputViewTopElement?: ReactElement;
  /* If true, before opening the new tab, it will close any existing tab with the same title. */
  destroyExistingPane?: boolean;
};
export type RunCommandFunctionAndCleanup = {
  runCommandInNewPane: (options: RunCommandOptions) => HTMLElement;
  disposable: atom$IDisposable;
};

import {CompositeDisposable, Disposable} from 'atom';
import invariant from 'assert';
import {destroyPaneItemWithTitle} from 'nuclide-atom-helpers';

const NUCLIDE_PROCESS_OUTPUT_VIEW_URI = 'atom://nuclide/process-output/';
const PROCESS_OUTPUT_HANDLER_KEY = 'nuclide-processOutputHandler';
const PROCESS_OUTPUT_STORE_KEY = 'nuclide-processOutputStore';
const PROCESS_OUTPUT_VIEW_TOP_ELEMENT = 'nuclide-processOutputViewTopElement';
type CreateProcessOutputViewOptions = {
  PROCESS_OUTPUT_HANDLER_KEY: ?ProcessOutputHandler;
  PROCESS_OUTPUT_STORE_KEY: ProcessOutputStore;
  PROCESS_OUTPUT_VIEW_TOP_ELEMENT: ?ReactElement;
};

let subscriptions: ?CompositeDisposable;
let processOutputStores: ?Set<ProcessOutputStore>;
let logger;

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
  const processOutputStore = openOptions[PROCESS_OUTPUT_STORE_KEY];
  const processOutputHandler = openOptions[PROCESS_OUTPUT_HANDLER_KEY];
  const processOutputViewTopElement = openOptions[PROCESS_OUTPUT_VIEW_TOP_ELEMENT];
  const tabTitle = uri.slice(NUCLIDE_PROCESS_OUTPUT_VIEW_URI.length);

  const ProcessOutputWrapper = require('./ProcessOutputWrapper');
  const hostElement = new ProcessOutputWrapper();
  hostElement.initialize({
    title: tabTitle,
    initialProps: {
      processOutputStore,
      processOutputHandler,
      processOutputViewTopElement,
    },
  });

  invariant(processOutputStores);
  processOutputStores.add(processOutputStore);

  // When the process exits, we want to remove the reference to the process.
  const handleProcessExit = () => {
    if (processOutputStores) {
      processOutputStores.delete(processOutputStore);
    }
  };
  const handleProcessExitWithError = (error: Error) => {
    getLogger().error(`runCommandInNewPane encountered an error running: ${tabTitle}`, error);
    handleProcessExit();
  };

  processOutputStore.startProcess().then(handleProcessExit, handleProcessExitWithError);
  return hostElement;
}

/**
 * @param options See definition of RunCommandOptions.
 */
async function runCommandInNewPane(options: RunCommandOptions): Promise<HTMLElement> {
  const openOptions = {
    [PROCESS_OUTPUT_HANDLER_KEY]: options.processOutputHandler,
    [PROCESS_OUTPUT_STORE_KEY]: options.processOutputStore,
    [PROCESS_OUTPUT_VIEW_TOP_ELEMENT]: options.processOutputViewTopElement,
  };

  const tabTitle = options.tabTitle;
  if (options.destroyExistingPane) {
    destroyPaneItemWithTitle(tabTitle);
  }
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
    processOutputStores = new Set();
  }
}

function disposeModule(): void {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (processOutputStores) {
    for (const processStore of processOutputStores) {
      processStore.dispose();
    }
    processOutputStores = null;
  }
}

/**
 * "Reference Counting"
 */

let references: number = 0;
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
