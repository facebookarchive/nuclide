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
import type {Gadget, GadgetsService} from './types';

import {Disposable} from 'atom';

type Result = IDisposable & {service: GadgetsService};

/**
 * Create an object that other packages can use (via Atom services) to interact with this package.
 */
export default function createGadgetsService(commands_: Commands): Result {
  // Create a local, nullable variable to close over so that other packages won't keep the
  // `Commands` instance in memory after this package has been deactivated.
  let commands = commands_;

  const service = {
    destroyGadget(gadgetId: string): void {
      if (commands != null) {
        commands.destroyGadget(gadgetId);
      }
    },

    registerGadget(gadget: Gadget): IDisposable {
      if (commands != null) {
        commands.registerGadget(gadget);
      }
      return new Disposable(() => {
        if (commands != null) {
          commands.unregisterGadget(gadget.gadgetId);
        }
      });
    },

    showGadget(gadgetId: string): void {
      if (commands != null) {
        commands.showGadget(gadgetId);
      }
    },
  };

  return {
    service,
    dispose: () => { commands = null; },
  };
}
