'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskRunnerServiceApi} from '../../nuclide-task-runner/lib/types';
import type {BuckBuildSystem as BuckBuildSystemType} from './BuckBuildSystem';
import type {BuckBuilderBuildOptions} from '../../nuclide-buck/lib/types';
import type {OutputService} from '../../nuclide-console/lib/types';
import type {HyperclickProvider} from '../../hyperclick/lib/types';
import type {BuckBuilder, SerializedState} from './types';

import registerGrammar from '../../commons-atom/register-grammar';
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {getSuggestion} from './HyperclickProvider';
import {BuckBuildSystem} from './BuckBuildSystem';

let disposables: ?CompositeDisposable = null;
let buildSystem: ?BuckBuildSystemType = null;
let initialState: ?Object = null;

export function activate(rawState: ?Object): void {
  invariant(disposables == null);
  initialState = rawState;
  disposables = new CompositeDisposable(
    new Disposable(() => { buildSystem = null; }),
    new Disposable(() => { initialState = null; }),
  );
  registerGrammar('source.python', 'BUCK');
  registerGrammar('source.json', 'BUCK.autodeps');
  registerGrammar('source.ini', '.buckconfig');
}

export function deactivate(): void {
  invariant(disposables != null);
  disposables.dispose();
  disposables = null;
}

export function consumeTaskRunnerServiceApi(api: TaskRunnerServiceApi): void {
  invariant(disposables != null);
  disposables.add(api.register(getBuildSystem()));
}

function getBuildSystem(): BuckBuildSystem {
  if (buildSystem == null) {
    invariant(disposables != null);
    buildSystem = new BuckBuildSystem(initialState);
    disposables.add(buildSystem);
  }
  return buildSystem;
}

export function consumeOutputService(service: OutputService): void {
  invariant(disposables != null);
  disposables.add(service.registerOutputProvider({
    messages: getBuildSystem().getOutputMessages(),
    id: 'Buck',
  }));
}

export function provideObservableDiagnosticUpdates() {
  return getBuildSystem().getDiagnosticProvider();
}

export function serialize(): ?SerializedState {
  if (buildSystem != null) {
    return buildSystem.serialize();
  }
}

export function getHyperclickProvider(): HyperclickProvider {
  return {
    priority: 200,
    providerName: 'nuclide-buck',
    getSuggestion(editor, position) {
      return getSuggestion(editor, position);
    },
  };
}

export function provideBuckBuilder(): BuckBuilder {
  return {
    build: (options: BuckBuilderBuildOptions) => getBuildSystem().buildArtifact(options),
  };
}
