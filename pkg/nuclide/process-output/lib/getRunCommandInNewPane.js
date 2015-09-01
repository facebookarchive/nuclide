'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type BufferedProcessError from 'nuclide-atom-helpers/ScriptBufferedProcessStore';
import type {ScriptBufferedProcessStore} from 'nuclide-atom-helpers';
import type ProcessOutputHandler from './types';

import {CompositeDisposable} from 'atom';
import invariant from 'assert';

var NUCLIDE_PROCESS_OUTPUT_VIEW_URI = 'atom://nuclide/process-output/';
var PROCESS_OUTPUT_HANDLER_KEY = 'nuclide-processOutputHandler';
type CreateProcessOutputViewOptions = {
  // Using the PROCESS_OUTPUT_HANDLER_KEY constant here results in a syntax error.
  'nuclide-processOutputHandler': ?ProcessOutputHandler;
};

var subscriptions: ?CompositeDisposable;
var processToDisposables: ?Map<ScriptBufferedProcessStore, CompositeDisposable>;
var logger;

function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

/**
 * @param uri A String consisting of NUCLIDE_PROCESS_OUTPUT_VIEW_URI plus a
 * a stringify'd JSON object of the form:
 *   - command
 *   - args
 *   - options
 * where each field corresponds to the arguments to Node's `spawn`.
 * @param options The same as the `options` passed to the atom.workspace.open()
 *   call that triggered this function. In this case, it should contain special
 *   Nuclide arguments (see `runCommandInNewPane`).
 */
function createProcessOutputView(uri: string, openOptions: CreateProcessOutputViewOptions): HTMLElement {
  var ProcessOutputWrapper = require('./ProcessOutputWrapper');
  var {ScriptBufferedProcessStore} = require('nuclide-atom-helpers');

  var commandInfo = uri.slice(NUCLIDE_PROCESS_OUTPUT_VIEW_URI.length);
  var {command, args, options} = JSON.parse(commandInfo);
  var processOutputHandler = openOptions[PROCESS_OUTPUT_HANDLER_KEY];

  var processOutputStore = new ScriptBufferedProcessStore(command, args, options);
  var hostElement = new ProcessOutputWrapper();
  hostElement.initialize(processOutputStore, {title: command, processOutputHandler});

  var processSubscriptions = new CompositeDisposable();
  invariant(processToDisposables);
  processToDisposables.set(processOutputStore, processSubscriptions);

  // We want to handle errors from the process by logging them.
  processSubscriptions.add(
    processOutputStore.onWillThrowError((errorObject: BufferedProcessError) => {
      var joinedArgs = args.join(' ');
      getLogger().error(`ScriptBufferedProcess encountered an error running: ${command} ${joinedArgs}`, errorObject.error);
      errorObject.handle();
    })
  );
  // When the process exits, we want to remove the reference to the process.
  var handleProcessExit = () => {
    if (processToDisposables) {
      processToDisposables.delete(processOutputStore);
    }
  };

  processOutputStore.startProcess().then(handleProcessExit, handleProcessExit);
  return hostElement;
}

/**
 * @param command Same as the `command` argument to Node's ChildProcess.spawn().
 * @param args Same as the `args` argument to Node's ChildProcess.spawn().
 * @param commandOptions Same as the `options` argument to Node's ChildProcess.spawn().
 * @param processOutputHandler An optional ProcessOutputHandler that is appropriate
 *   for the expected output. See the constructor of ProcessOutputView for more information.
 */
function runCommandInNewPane(
  command: string,
  args: Array<string>,
  options?: Object = {},
  processOutputHandler?: ProcessOutputHandler,
): Promise<atom$TextEditor> {
  var commandInfo = JSON.stringify({
    command,
    args,
    options,
  });
  var openOptions = {
    [PROCESS_OUTPUT_HANDLER_KEY]: processOutputHandler,
  };
  // Not documented: the 'options' passed to atom.workspace.open() are passed to the opener.
  // There's no other great way for a consumer of this service to specify a ProcessOutputHandler.
  atom.workspace.open(NUCLIDE_PROCESS_OUTPUT_VIEW_URI + commandInfo, openOptions);
}

module.exports = {

  activate(state: ?Object): void {
    if (!subscriptions) {
      subscriptions = new CompositeDisposable();
      subscriptions.add(atom.workspace.addOpener((uri, options) => {
        if (uri.startsWith(NUCLIDE_PROCESS_OUTPUT_VIEW_URI)) {
          return createProcessOutputView(uri, options);
        }
      }));
      processToDisposables = new Map();
    }
  },

  deactivate() {
    if (subscriptions) {
      subscriptions.dispose();
    }
    if (processToDisposables) {
      for (var processStore of processToDisposables.keys()) {
        processStore.dispose();
      }
    }
  },

  provideProcessOutput(): (command: string, args: Array<string>, options?: Object) => void {
    return runCommandInNewPane;
  },
};
