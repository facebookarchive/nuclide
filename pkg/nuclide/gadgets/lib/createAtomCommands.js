'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable} from 'atom';
import type Immutable from 'immutable';

export default function createAtomCommands(
  gadgets: Immutable.Map,
  appCommands: Object,
): atom$IDisposable {
  const commands = gadgets
    .map(gadget => (
      atom.commands.add(
        'atom-workspace',
        formatCommandName(gadget.gadgetId, 'Show'),
        () => appCommands.showGadget(gadget.gadgetId),
      )
    ));
  return new CompositeDisposable(...commands.toArray());
}

function formatCommandName(gadgetId: string, action: string): string {
  return `${toDashed(gadgetId)}:${toDashed(action)}`;
}

function toDashed(str: string): string {
  return str.replace(/\s+/g, '-').toLowerCase();
}
