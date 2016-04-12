'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerModel from './DebuggerModel';
import type DebuggerProcessInfo from './DebuggerProcessInfo';

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

  debugLLDB(pid: number, basepath: string): Promise<void> {
    // Nullable values are captured as nullable in lambdas, as they may change
    // between lambda capture and lambda evaluation. Assigning to a
    // non-nullable value after checking placates flow in this regard.
    const modelNullable = this._getModel();
    if (!modelNullable) {
      return Promise.reject(new Error('Package is not activated.'));
    }
    const model = modelNullable;
    return model.getStore().getProcessInfoList('lldb')
      .then(processes => {
        const process = processes.find(p => p.pid === pid);
        if (process) {
          process.basepath = basepath;
          model.getActions().startDebugging(process);
        } else {
          throw new Error(`Requested process not found: ${pid}.`);
        }
      });
  }

  debugNode(pid: number): Promise<void> {
    const model = this._getModel();
    if (!model) {
      return Promise.reject(new Error('Package is not activated.'));
    }
    return model.getStore().getProcessInfoList('node')
      .then(processes => {
        const proc = processes.find(p => p.pid === pid);
        if (proc) {
          model.getActions().startDebugging(proc);
        } else {
          Promise.reject('No node process to debug.');
        }
      });
  }

  async startDebugging(processInfo: DebuggerProcessInfo): Promise<void> {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    await model.getActions().startDebugging(processInfo);
  }

  isInDebuggingMode(providerName: string): boolean {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    const session = model.getStore().getDebuggerInstance();
    return session != null && session.getProviderName() === providerName;
  }

  killDebugger(): void {
    const model = this._getModel();
    if (model == null) {
      throw new Error('Package is not activated.');
    }
    model.getActions().stopDebugging();
  }
}

module.exports = RemoteControlService;
