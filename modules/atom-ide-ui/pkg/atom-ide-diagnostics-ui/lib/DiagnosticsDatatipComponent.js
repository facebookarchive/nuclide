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

import type {FileDiagnosticMessage} from '../../atom-ide-diagnostics/lib/types';
import type {CodeAction} from '../../atom-ide-code-actions/lib/types';

import {goToLocation} from 'nuclide-commons-atom/go-to-location';
import React from 'react';
import {
  DiagnosticsMessageNoHeader,
  DiagnosticsMessage,
} from './DiagnosticsMessage';
import DiagnosticsCodeActions from './DiagnosticsCodeActions';

type DiagnosticsDatatipComponentProps = {
  message: FileDiagnosticMessage,
  codeActions: Map<string, CodeAction>,
};

const NOOP = () => {};

export class DiagnosticsDatatipComponent extends React.Component {
  props: DiagnosticsDatatipComponentProps;

  render(): React.Element<any> {
    // Remove the `fix` property to prevent the fix button from showing up (for now).
    const message = {...this.props.message, fix: undefined};
    if (this.props.codeActions.size > 0) {
      return (
        <div className="nuclide-diagnostics-datatip">
          <DiagnosticsCodeActions codeActions={this.props.codeActions} />
          <DiagnosticsMessageNoHeader
            message={message}
            goToLocation={goToLocation}
            fixer={NOOP}
          />
        </div>
      );
    }
    return (
      <div className="nuclide-diagnostics-datatip">
        <DiagnosticsMessage
          message={message}
          goToLocation={goToLocation}
          fixer={NOOP}
        />
      </div>
    );
  }
}

export function makeDiagnosticsDatatipComponent(
  message: FileDiagnosticMessage,
  codeActions: Map<string, CodeAction>,
): ReactClass<any> {
  return () =>
    <DiagnosticsDatatipComponent message={message} codeActions={codeActions} />;
}
