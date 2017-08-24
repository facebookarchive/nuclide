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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {FileDiagnosticMessage} from '../../../atom-ide-diagnostics/lib/types';
import type {CodeAction} from '../../../atom-ide-code-actions/lib/types';

import React from 'react';
import classnames from 'classnames';
import {DiagnosticsMessage} from './DiagnosticsMessage';
import DiagnosticsCodeActions from './DiagnosticsCodeActions';

type DiagnosticsPopupProps = {
  messages: Array<FileDiagnosticMessage>,
  goToLocation: (filePath: NuclideUri, line: number) => mixed,
  fixer: (message: FileDiagnosticMessage) => void,
  codeActionsForMessage?: Map<FileDiagnosticMessage, Map<string, CodeAction>>,
};

function renderMessage(
  fixer: (message: FileDiagnosticMessage) => void,
  goToLocation: (filePath: NuclideUri, line: number) => mixed,
  codeActionsForMessage: ?Map<FileDiagnosticMessage, Map<string, CodeAction>>,
  message: FileDiagnosticMessage,
  index: number,
): React.Element<any> {
  const className = classnames(
    // native-key-bindings and tabIndex=-1 are both needed to allow copying the text in the popup.
    'native-key-bindings',
    'diagnostics-popup-diagnostic',
    {
      'diagnostics-popup-error': message.type === 'Error',
      'diagnostics-popup-warning': message.type === 'Warning',
      'diagnostics-popup-info': message.type === 'Info',
    },
  );
  const codeActions =
    codeActionsForMessage && codeActionsForMessage.get(message);
  return (
    <div className={className} key={index} tabIndex={-1}>
      <DiagnosticsMessage
        fixer={fixer}
        goToLocation={goToLocation}
        message={message}>
        {codeActions && codeActions.size
          ? <DiagnosticsCodeActions codeActions={codeActions} />
          : null}
      </DiagnosticsMessage>
    </div>
  );
}

// TODO move LESS styles to nuclide-ui
export const DiagnosticsPopup = (props: DiagnosticsPopupProps) => {
  const {fixer, goToLocation, codeActionsForMessage, messages, ...rest} = props;
  return (
    <div className="diagnostics-popup" {...rest}>
      {messages.map(
        renderMessage.bind(null, fixer, goToLocation, codeActionsForMessage),
      )}
    </div>
  );
};
