'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {array} = require('nuclide-commons');
import type DebuggerModel from './DebuggerModel';

class RemoteControlService {
  _getModel: () => ?DebuggerModel;

  /**
   * @param getModel function always returning the latest singleton model.
   *
   * NB: Deactivating and reactivating will result in a new Model instance (and
   * new instances of everything else). This object exists in other packages
   * outside of any model, so objects vended early must still always manipulate
   * the latest model's state.
   */
  constructor(getModel: () => ?DebuggerModel) {
    this._getModel = getModel;
  }

  debugLLDB(pid: number, basepath: string): Promise {
    // Nullable values are captured as nullable in lambdas, as they may change
    // between lambda capture and lambda evaluation. Assigning to a
    // non-nullable value after checking placates flow in this regard.
    var modelNullable = this._getModel();
    if (!modelNullable) {
      return Promise.reject(new Error('Package is not activated.'));
    }
    var model = modelNullable;
    return model.getStore().getProcessInfoList('lldb')
      .then(processes => {
        var process = array.find(processes, p => p.pid === pid);
        if (process) {
          process.basepath = basepath;
          model.getActions().attachToProcess(process);
        } else {
          throw new Error(`Requested process not found: ${pid}.`);
        }
      });
  }

  debugHhvm(scriptTarget: ?string): Promise {
    var modelNullable = this._getModel();
    if (!modelNullable) {
      return Promise.reject(new Error('Package is not activated.'));
    }
    var model = modelNullable;
    return model.getStore().getProcessInfoList('hhvm')
      .then(processes => {
        // TODO[jeffreytan]: currently HHVM debugger getProcessInfoList() always
        // returns the first remote server for attaching we should modify it to
        // return all available remote servers.
        if (processes.length > 0) {
          model.getActions().attachToProcess(processes[0], scriptTarget);
        } else {
          Promise.reject('No hhvm process to debug.');
        }
      });
  }

  debugNode(pid: number): Promise {
    const model = this._getModel();
    if (!model) {
      return Promise.reject(new Error('Package is not activated.'));
    }
    return model.getStore().getProcessInfoList('node')
      .then(processes => {
        const proc = array.find(processes, p => p.pid === pid);
        if (proc) {
          model.getActions().attachToProcess(proc);
        } else {
          Promise.reject('No node process to debug.');
        }
      });
  }
}

module.exports = RemoteControlService;
