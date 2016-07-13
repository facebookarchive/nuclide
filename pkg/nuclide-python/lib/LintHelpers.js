'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LinterMessage} from '../../nuclide-diagnostics-base';

import invariant from 'assert';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';
import {getDiagnosticRange} from './diagnostic-range';
import nuclideUri from '../../nuclide-remote-uri';
import {NO_LINT_EXTENSIONS} from './constants';

export default class LintHelpers {

  @trackTiming('nuclide-python.lint')
  static async lint(editor: TextEditor): Promise<Array<LinterMessage>> {
    const src = editor.getPath();
    if (src == null) {
      return [];
    }

    const extname = nuclideUri.extname(src);
    // Strip the dot if extname exists, otherwise use the basename as extension.
    // This matches the extension matching of grammar registration.
    const ext = extname.length > 0 ? extname.slice(1) : nuclideUri.basename(src);

    if (NO_LINT_EXTENSIONS.has(ext)) {
      return [];
    }

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
  }

}
