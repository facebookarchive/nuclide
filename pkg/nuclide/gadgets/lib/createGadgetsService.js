'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Commands} from '../types/Commands';
import type {Gadget, GadgetsService} from '../../gadgets-interfaces';

import {Disposable} from 'atom';

function createGadgetsService(getCommands: () => ?Commands): GadgetsService {
  return {

    registerGadget(gadget: Gadget): Disposable {
      const commands = getCommands();
      if (commands) {
        commands.registerGadget(gadget);
      }
      return new Disposable(() => {
        if (commands == null) {
          return;
        }
        commands.unregisterGadget(gadget.gadgetId);
      });
    },

    showGadget(gadgetId: string): void {
      const commands = getCommands();
      if (commands == null) {
        return;
      }
      commands.showGadget(gadgetId);
    },

  };
}

module.exports = createGadgetsService;
