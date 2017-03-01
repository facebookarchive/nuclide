/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {
  Datatip,
  DatatipProvider,
  DatatipService,
} from '../../nuclide-datatip/lib/types';
import type {
  DiagnosticUpdater,
  FileMessageUpdate,
} from '../../nuclide-diagnostics-common';
import type {
  FileDiagnosticMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {
  CompositeDisposable,
  Disposable,
} from 'atom';
import invariant from 'assert';
import {makeDiagnosticsDatatipComponent} from './DiagnosticsDatatipComponent';
import {observeTextEditors} from '../../commons-atom/text-editor';

const DATATIP_PACKAGE_NAME = 'nuclide-diagnostics-datatip';
export async function datatip(editor: TextEditor, position: atom$Point): Promise<?Datatip> {
  invariant(fileDiagnostics);
  const messagesForFile = fileDiagnostics.get(editor);
  if (messagesForFile == null) {
    return null;
  }
  const messagesAtPosition = messagesForFile.filter(
    message => message.range != null && message.range.containsPoint(position),
  );
  if (messagesAtPosition.length === 0) {
    return null;
  }
  const [message] = messagesAtPosition;
  const {range} = message;
  invariant(range);
  return {
    component: makeDiagnosticsDatatipComponent(message),
    pinnable: false,
    range,
  };
}

function getDatatipProvider(): DatatipProvider {
  return {
    // show this datatip for every type of file
    validForScope: (scope: string) => true,
    providerName: DATATIP_PACKAGE_NAME,
    inclusionPriority: 1,
    datatip,
  };
}

export function consumeDatatipService(service: DatatipService): IDisposable {
  const datatipProvider = getDatatipProvider();
  invariant(disposables);
  service.addProvider(datatipProvider);
  const disposable = new Disposable(() => service.removeProvider(datatipProvider));
  disposables.add(disposable);
  return disposable;
}

let disposables: ?CompositeDisposable = null;
let fileDiagnostics: ?WeakMap<TextEditor, Array<FileDiagnosticMessage>> = null;

export function activate(state: ?mixed): void {
  disposables = new CompositeDisposable();
  fileDiagnostics = new WeakMap();
}

export function consumeDiagnosticUpdates(diagnosticUpdater: DiagnosticUpdater): void {
  invariant(disposables);
  disposables.add(observeTextEditors((editor: TextEditor) => {
    invariant(fileDiagnostics);
    const filePath = editor.getPath();
    if (!filePath) {
      return;
    }
    fileDiagnostics.set(editor, []);
    const callback = (update: FileMessageUpdate) => {
      invariant(fileDiagnostics);
      fileDiagnostics.set(editor, update.messages);
    };
    const disposable = diagnosticUpdater.onFileMessagesDidUpdate(callback, filePath);

    editor.onDidDestroy(() => {
      disposable.dispose();
      if (fileDiagnostics != null) {
        fileDiagnostics.delete(editor);
      }
    });
    invariant(disposables);
    disposables.add(disposable);
  }));
}

export function deactivate(): void {
  if (disposables != null) {
    disposables.dispose();
    disposables = null;
  }
  fileDiagnostics = null;
}
