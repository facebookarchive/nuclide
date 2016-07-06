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
import {Range} from 'atom';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import {trackTiming} from '../../nuclide-analytics';

export default class LintHelpers {

  @trackTiming('nuclide-python.lint')
  static async lint(editor: TextEditor): Promise<Array<LinterMessage>> {
    const src = editor.getPath();
    if (src == null) {
      return [];
    }
    const service = getServiceByNuclideUri('PythonService', src);
    invariant(service);

    const diagnostics = await service.getDiagnostics(src, editor.getText());

    const buffer = editor.getBuffer();

    return diagnostics.map(diagnostic => ({
      name: 'flake8: ' + diagnostic.code,
      type: diagnostic.type,
      text: diagnostic.message,
      filePath: diagnostic.file,
      range: new Range(
        [diagnostic.line, 0],
        [diagnostic.line, buffer.lineLengthForRow(diagnostic.line)],
      ),
    }));
  }

}
