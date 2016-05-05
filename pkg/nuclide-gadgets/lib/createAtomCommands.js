'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {AtomCommands} from '../../nuclide-atom-helpers';
import type Commands from './Commands';
import type {Gadget} from './types';

import normalizeEventString from './normalizeEventString';

export default function createAtomCommands(gadget: Gadget, appCommands: Commands): AtomCommands {
  return {
    'atom-workspace': {
      [formatCommandName(gadget.gadgetId, 'Show')]:
        () => appCommands.showGadget(gadget.gadgetId),
      [formatCommandName(gadget.gadgetId, 'Hide')]:
        () => appCommands.hideGadget(gadget.gadgetId),
      [formatCommandName(gadget.gadgetId, 'Toggle')]:
        () => appCommands.toggleGadget(gadget.gadgetId),
    },
  };
}

function formatCommandName(gadgetId: string, action: string): string {
  return `${normalizeEventString(gadgetId)}:${normalizeEventString(action)}`;
}
