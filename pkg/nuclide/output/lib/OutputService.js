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
import type {OutputProvider} from './types';

export default class OutputService {
  _commands: Commands;

  constructor(commands: Commands) {
    this._commands = commands;
  }

  registerOutputProvider(outputProvider: OutputProvider): atom$IDisposable {
    return this._commands.registerOutputProvider(outputProvider);
  }

}
