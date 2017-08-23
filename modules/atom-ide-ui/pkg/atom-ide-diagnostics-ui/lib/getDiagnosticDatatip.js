/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  CodeAction,
  CodeActionFetcher,
} from '../../atom-ide-code-actions/lib/types';
import type {Datatip} from '../../atom-ide-datatip/lib/types';
import type {FileDiagnosticMessage} from '../../atom-ide-diagnostics/lib/types';

import invariant from 'assert';
import React from 'react';
import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import {DiagnosticsPopup} from './DiagnosticsPopup';

async function getCodeActionsForDiagnostic(
  codeActionFetcher: CodeActionFetcher,
  message: FileDiagnosticMessage,
  editor: atom$TextEditor,
): Promise<Map<string, CodeAction>> {
  const codeActions = await codeActionFetcher.getCodeActionForDiagnostic(
    message,
    editor,
  );
  // For RPC reasons, the getTitle function of a CodeAction is async. Therefore,
  // we immediately request the title after we have each CodeAction.
  return new Map(
    await Promise.all(
      codeActions.map(async codeAction =>
        Promise.resolve([await codeAction.getTitle(), codeAction]),
      ),
    ),
  );
}

function makeDatatipComponent(
  messages: Array<FileDiagnosticMessage>,
  fixer: (message: FileDiagnosticMessage) => void,
  codeActionsForMessage: Map<FileDiagnosticMessage, Map<string, CodeAction>>,
): React.Element<*> {
  return (
    <DiagnosticsPopup
      messages={messages}
      fixer={fixer}
      goToLocation={goToLocation}
      codeActionsForMessage={codeActionsForMessage}
    />
  );
}

export default (async function getDiagnosticDatatip(
  editor: TextEditor,
  position: atom$Point,
  messagesForFile: Array<FileDiagnosticMessage>,
  fixer: (message: FileDiagnosticMessage) => void,
  codeActionFetcher: ?CodeActionFetcher,
): Promise<?Datatip> {
  const messagesAtPosition = messagesForFile.filter(
    message => message.range != null && message.range.containsPoint(position),
  );
  if (messagesAtPosition.length === 0) {
    return null;
  }
  const codeActionsForMessage = new Map(
    await Promise.all(
      messagesAtPosition.map(async message => {
        return [
          message,
          codeActionFetcher != null
            ? await getCodeActionsForDiagnostic(
                codeActionFetcher,
                message,
                editor,
              )
            : new Map(),
        ];
      }),
    ),
  );
  let range = null;
  for (const message of messagesAtPosition) {
    if (message.range != null) {
      range = range == null ? message.range : message.range.union(range);
    }
  }
  invariant(range != null);
  return {
    component: makeDatatipComponent.bind(
      null,
      messagesAtPosition,
      fixer,
      codeActionsForMessage,
    ),
    pinnable: false,
    range,
  };
});
