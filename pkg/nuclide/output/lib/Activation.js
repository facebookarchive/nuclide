'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService, Gadget} from '../../gadgets-interfaces';

import {CompositeDisposable} from 'atom';
import createOutputGadget from './createOutputGadget';
import OutputService from './OutputService';

class Activation {
  _disposables: CompositeDisposable;
  _outputService: OutputService;

  constructor(rawState: ?Object) {
    this._outputService = new OutputService();
    this._disposables = new CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeGadgetsService(gadgetsApi: GadgetsService): atom$Disposable {
    const OutputGadget = createOutputGadget();
    return gadgetsApi.registerGadget(((OutputGadget: any): Gadget));

  }
  provideOutputService(): OutputService {
    return this._outputService;
  }

}

module.exports = Activation;
