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
  FileDiagnosticMessage,
} from '../nuclide-diagnostics-common/lib/rpc-types';

import {
  Range,
} from 'atom';
import React from 'react';
import {Block} from './Block';
import {DiagnosticsMessage} from './DiagnosticsMessage';

const GOTOLOCATION = (path: string, line: number) => {
  atom.notifications.addInfo(`Let's pretend I opened "${path}" at line ${line}.`);
};
const FIXER = () => {
  atom.notifications.addInfo('TADA! Fixed.');
};

const messageWarning: FileDiagnosticMessage = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'A word of warning: Something might be broken here.',
};

const messageError: FileDiagnosticMessage = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Error',
  filePath: 'path/to/some/file.js',
  text: 'Error! Something is definitely broken here.',
};

const messageFixable: FileDiagnosticMessage = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'Something looks broken here, but it can be fixed automatically via the "fix" button.',
  fix: {
    oldRange: new Range([1, 1], [1, 6]),
    newText: 'fixed',
  },
};

const messageWithTrace: FileDiagnosticMessage = {
  scope: 'file',
  providerName: 'CoolLinter',
  type: 'Warning',
  filePath: 'path/to/some/file.js',
  text: 'Something is broken here.',
  trace: [
    {
      type: 'Trace',
      text: 'A diagnostics message can contain multiple trace lines',
      filePath: 'path/to/random/file.js',
      range: new Range([1, 1], [1, 6]),
    },
    {
      type: 'Trace',
      text: 'Trace lines can have paths and ranges, too.',
      filePath: 'path/to/another/file.js',
      range: new Range([2, 1], [2, 6]),
    },
    {
      type: 'Trace',
      text: 'Paths and ranges are optional.',
    },
  ],
};

const DiagnosticMessageWarningExample = (): React.Element<any> => (
  <div>
    <Block>
      <DiagnosticsMessage
        message={messageWarning}
        goToLocation={GOTOLOCATION}
        fixer={FIXER}
      />
    </Block>
  </div>
);

const DiagnosticMessageErrorExample = (): React.Element<any> => (
  <div>
    <Block>
      <DiagnosticsMessage
        message={messageError}
        goToLocation={GOTOLOCATION}
        fixer={FIXER}
      />
    </Block>
  </div>
);

const DiagnosticMessageFixableExample = (): React.Element<any> => (
  <div>
    <Block>
      <DiagnosticsMessage
        message={messageFixable}
        goToLocation={GOTOLOCATION}
        fixer={FIXER}
      />
    </Block>
  </div>
);

const DiagnosticMessageTraceExample = (): React.Element<any> => (
  <div>
    <Block>
      <DiagnosticsMessage
        message={messageWithTrace}
        goToLocation={GOTOLOCATION}
        fixer={FIXER}
      />
    </Block>
  </div>
);

export const DiagnosticsExamples = {
  sectionName: 'DiagnosticsMessage',
  description: 'Display warnings & error messages',
  examples: [
    {
      title: 'Warning',
      component: DiagnosticMessageWarningExample,
    },
    {
      title: 'Error',
      component: DiagnosticMessageErrorExample,
    },
    {
      title: 'Fixable warning:',
      component: DiagnosticMessageFixableExample,
    },
    {
      title: 'Warning with traces',
      component: DiagnosticMessageTraceExample,
    },
  ],
};
