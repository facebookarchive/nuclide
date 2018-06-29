/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {Provider} from 'nuclide-commons-atom/ProviderRegistry';
import type {TextEdit} from 'nuclide-commons-atom/text-edit';

import {Observable} from 'rxjs';
import ProviderRegistry from 'nuclide-commons-atom/ProviderRegistry';
import {applyTextEdits} from 'nuclide-commons-atom/text-edit';
import {arrayFlatten} from 'nuclide-commons/collection';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

export type FileEventHandlersConfig = {|
  supportsOnWillSave: boolean,
  onWillSaveTimeout?: number,
  onWillSavePriority?: number,
|};

type OnWillSaveProvider = Provider & {
  timeout: number,
  callback: (e: atom$TextEditor) => Observable<TextEdit>,
};

const onWillSaveProviders: ProviderRegistry<
  OnWillSaveProvider,
> = new ProviderRegistry();

function onWillSave(editor: atom$TextEditor): IDisposable {
  return editor.getBuffer().onWillSave(async _ => {
    const providers = Array.from(
      onWillSaveProviders.getAllProvidersForEditor(editor),
    );
    const textEdits: Array<Array<TextEdit>> = await Promise.all(
      providers.map(async provider =>
        provider
          .callback(editor)
          .toArray()
          .race(Observable.of([]).delay(provider.timeout))
          .toPromise(),
      ),
    );
    const path = editor.getPath();
    if (path != null) {
      await applyTextEdits(path, ...arrayFlatten(textEdits));
    }
  });
}

export function registerOnWillSave(provider: OnWillSaveProvider): IDisposable {
  return onWillSaveProviders.addProvider(provider);
}

export function observeTextEditors(): IDisposable {
  const disposables = new UniversalDisposable();
  disposables.add(
    atom.workspace.observeTextEditors(editor => {
      disposables.add(onWillSave(editor));
    }),
  );
  return disposables;
}
