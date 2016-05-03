'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Commands from './Commands';
import type {Gadget} from './types';

import {Disposable} from 'atom';

class GadgetsService {

  _commands: Commands;

  constructor(commands: Commands) {
    this._commands = commands;
  }

  destroyGadget(gadgetId: string): void {
    this._commands.destroyGadget(gadgetId);
  }

  registerGadget(gadget: Gadget): IDisposable {
    this._commands.registerGadget(gadget);
    return new Disposable(() => {
      this._commands.unregisterGadget(gadget.gadgetId);
    });
  }

  showGadget(gadgetId: string): void {
    this._commands.showGadget(gadgetId);
  }

}

module.exports = GadgetsService;
