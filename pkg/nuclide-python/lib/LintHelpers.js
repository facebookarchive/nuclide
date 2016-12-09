/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {LinterMessage} from '../../nuclide-diagnostics-common';

import invariant from 'assert';
import nuclideUri from '../../commons-node/nuclideUri';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';
import {getDiagnosticRange} from './diagnostic-range';
import {getEnableLinting, getLintExtensionBlacklist} from './config';

export default class LintHelpers {

  static lint(editor: TextEditor): Promise<Array<LinterMessage>> {
    const src = editor.getPath();
    if (src == null || !getEnableLinting() ||
        getLintExtensionBlacklist().includes(nuclideUri.extname(src))) {
      return Promise.resolve([]);
    }

    return trackTiming('nuclide-python.lint', async () => {
      const service = getServiceByNuclideUri('PythonService', src);
      invariant(service);

      const diagnostics = await service.getDiagnostics(src, editor.getText());
      return diagnostics.map(diagnostic => ({
        name: 'flake8: ' + diagnostic.code,
        type: diagnostic.type,
        text: diagnostic.message,
        filePath: diagnostic.file,
        range: getDiagnosticRange(diagnostic, editor),
      }));
    });
  }

}
