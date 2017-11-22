/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

// Provides some extra commands on top of base Lsp.
import type {TextEdit} from '../../nuclide-vscode-language-service-rpc/lib/protocol';

import {
  lspUri_localPath,
  lspTextEdits_atomTextEdits,
} from '../../nuclide-vscode-language-service-rpc/lib/convert';
import {LspLanguageService} from '../../nuclide-vscode-language-service-rpc/lib/LspLanguageService';

type CqueryProgressNotification = {
  indexRequestCount: number,
  doIdMapCount: number,
  loadPreviousIndexCount: number,
  onIdMappedCount: number,
  onIndexedCount: number,
};

// FIXME pelmers: tracking cquery/issues/30
// https://github.com/jacobdufault/cquery/issues/30#issuecomment-345536318
function shortenByOneCharacter({newText, range}: TextEdit): TextEdit {
  return {
    newText,
    range: {
      start: range.start,
      end: {line: range.end.line, character: range.end.character - 1},
    },
  };
}

export class CqueryLanguageClient extends LspLanguageService {
  start(): Promise<void> {
    // Workaround for https://github.com/babel/babel/issues/3930
    return super.start().then(() => this.startCquery());
  }

  async startCquery(): Promise<void> {
    this._lspConnection._jsonRpcConnection.onNotification(
      {method: '$cquery/progress'},
      (args: CqueryProgressNotification) => {
        const {
          indexRequestCount,
          doIdMapCount,
          loadPreviousIndexCount,
          onIdMappedCount,
          onIndexedCount,
        } = args;
        const total =
          indexRequestCount +
          doIdMapCount +
          loadPreviousIndexCount +
          onIdMappedCount +
          onIndexedCount;
        if (total === 0) {
          this._handleProgressNotification({
            id: 'cquery-progress',
            label: null,
          });
        } else {
          const label = `cquery: ${total} jobs`;
          this._handleProgressNotification({id: 'cquery-progress', label});
        }
      },
    );
    // TODO pelmers Register handlers for other custom cquery messages.
  }

  _executeCommand(command: string, args?: Array<any>): Promise<void> {
    if (command === 'cquery._applyFixIt' && args != null && args.length === 2) {
      return this._applyFixIt(...args).then(result => {
        if (!result) {
          this._host.dialogNotification('warning', 'Cquery: fixit failed.');
        }
      });
    } else {
      return super._executeCommand(command, args);
    }
    // TODO pelmers: handle cquery._autoImplement, cquery._insertInclude
  }

  // TODO pelmers: remove this when cquery implements workspace/applyEdit
  async _applyFixIt(file: string, edits: Array<TextEdit>): Promise<boolean> {
    return this._host.applyTextEditsForMultipleFiles(
      new Map([
        [
          lspUri_localPath(file),
          lspTextEdits_atomTextEdits(edits.map(shortenByOneCharacter)),
        ],
      ]),
    );
  }
}
