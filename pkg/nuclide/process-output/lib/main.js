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

import {CompositeDisposable} from 'atom';
import invariant from 'assert';

var NUCLIDE_PROCESS_OUTPUT_VIEW_URI = 'atom://nuclide/process-output/';
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
 */
function createProcessOutputView(uri: string): HTMLElement {
  var ProcessOutputWrapper = require('./ProcessOutputWrapper');
  var {ScriptBufferedProcessStore} = require('nuclide-atom-helpers');

  var commandInfo = uri.slice(NUCLIDE_PROCESS_OUTPUT_VIEW_URI.length);
  var {command, args, options} = JSON.parse(commandInfo);

  var processOutputStore = new ScriptBufferedProcessStore(command, args, options);
  var hostElement = new ProcessOutputWrapper();
  hostElement.initialize(processOutputStore, /* title */ command);

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

function runCommandInNewPane(
  command: string,
  args: Array<string>,
  options?: Object = {}) {
    var commandInfo = JSON.stringify({
      command,
      args,
      options,
    });
    atom.workspace.open(NUCLIDE_PROCESS_OUTPUT_VIEW_URI + commandInfo);
}

module.exports = {

  activate(state: ?Object): void {
    if (!subscriptions) {
      subscriptions = new CompositeDisposable();
      subscriptions.add(atom.workspace.addOpener(uri => {
        if (uri.startsWith(NUCLIDE_PROCESS_OUTPUT_VIEW_URI)) {
          return createProcessOutputView(uri);
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
