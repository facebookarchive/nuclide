'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  MessageUpdateCallback,
  MessageInvalidationCallback,
} from '../../nuclide-diagnostics-common';
import type {
  DiagnosticProviderUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {DiagnosticsProviderBase} from '../../nuclide-diagnostics-provider-base';

import {Range} from 'atom';

const PROVIDER_NAME = 'Sample';

export default class SampleDiagnosticsProvider {
  _providerBase: DiagnosticsProviderBase;

  constructor() {
    /**
     * Look here:
     * https://github.com/facebook/nuclide/blob/master/pkg/nuclide-diagnostics-provider-base/ for
     * a complete list of options.
     */
    const baseOptions = {
      // This will make our error show up in all files.
      enableForAllGrammars: true,
      // This callback gets called whenever there is a text editor event, such as a file save, that
      // should trigger a run of diagnostics.
      onTextEditorEvent: editor => this._sendDiagnostics(editor),
    };
    this._providerBase = new DiagnosticsProviderBase(baseOptions);
  }

  _sendDiagnostics(editor: TextEditor): void {
    const filePath = editor.getPath();
    // When a New file is created, it will be "untitled" and getPath() will return null.
    if (filePath == null) {
      return;
    }

    const diagnostics: DiagnosticProviderUpdate = {
      filePathToMessages: new Map([[filePath, [
        {
          scope: 'file',
          providerName: PROVIDER_NAME,
          type: 'Error',
          filePath,
          text: 'You have a problem!',
          range: new Range([0, 1], [0, 5]),
        },
      ]]]),
      projectMessages: [
        {
          scope: 'project',
          providerName: PROVIDER_NAME,
          type: 'Warning',
          text: 'You have a project-wide problem!!!',
        },
      ],
    };

    this._providerBase.publishMessageUpdate(diagnostics);
  }

  // Delegate to these DiagnosticsProviderBase methods to satisfy the DiagnosticProvider interface.
  // These manage event subscriptions. A consumer of a diagnostics provider will subscribe to these
  // events. The DiagnosticsProviderBase takes care of the details of event subscription.
  onMessageUpdate(callback: MessageUpdateCallback): IDisposable {
    return this._providerBase.onMessageUpdate(callback);
  }

  onMessageInvalidation(callback: MessageInvalidationCallback): IDisposable {
    return this._providerBase.onMessageInvalidation(callback);
  }
}
