'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as GadgetUri from './GadgetUri';
import type {Commands} from '../types/Commands';
import type {Gadget} from '../types/Gadget';

import * as ActionTypes from './ActionTypes';
import Rx from 'rx';

/**
 * Create an object that provides commands ("action creators")
 */
export default function createCommands(observer: Rx.Observer): Commands {

  return {

    registerGadget(gadget: Gadget): void {
      observer.onNext({
        type: ActionTypes.REGISTER_GADGET,
        payload: {gadget},
      });
    },

    /**
     * Ensure that a gadget of the specified gadgetId is visible, creating one if necessary.
     */
    showGadget(gadgetId: string): void {
      const uri = GadgetUri.format({gadgetId});
      atom.workspace.open(uri, {searchAllPanes: true});
    },

  };

}
