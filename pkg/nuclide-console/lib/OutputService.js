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

import {Disposable} from 'atom';

export default class OutputService {
  _commands: Commands;

  constructor(commands: Commands) {
    this._commands = commands;
  }

  registerOutputProvider(outputProvider: OutputProvider): IDisposable {
    this._commands.registerOutputProvider(outputProvider);
    return new Disposable(() => {
      this._commands.removeSource(outputProvider.source);
    });
  }

}
