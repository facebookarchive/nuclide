'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BuildSystem, BuildSystemRegistry} from '../../nuclide-build/lib/types';

import {registerGrammarForFileExtension} from '../../nuclide-atom-helpers';
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import HyperclickProvider from './HyperclickProvider';

let disposables: ?CompositeDisposable = null;
let buildSystem: ?BuildSystem = null;

export function activate(rawState: ?Object = {}): void {
  invariant(disposables == null);
  disposables = new CompositeDisposable(
    new Disposable(() => { buildSystem = null; }),
  );
  registerGrammarForFileExtension('source.python', 'BUCK');
  registerGrammarForFileExtension('source.json', 'BUCK.autodeps');
  registerGrammarForFileExtension('source.ini', '.buckconfig');
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

export function consumeBuildSystemRegistry(registry: BuildSystemRegistry): void {
  invariant(disposables != null);
  disposables.add(registry.register(getBuildSystem()));
}

function getBuildSystem(): BuildSystem {
  if (buildSystem == null) {
    invariant(disposables != null);
    const {BuckBuildSystem} = require('./BuckBuildSystem');
    buildSystem = new BuckBuildSystem();
    disposables.add(buildSystem);
  }
  return buildSystem;
}

export function getHyperclickProvider() {
  return HyperclickProvider;
}
