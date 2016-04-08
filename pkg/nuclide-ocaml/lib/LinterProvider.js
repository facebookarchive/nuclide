'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {MerlinError} from '../../nuclide-ocaml-base';
import type {LinterMessage} from '../../nuclide-diagnostics-base';

import {GRAMMARS} from './constants';
import {trackOperationTiming} from '../../nuclide-analytics';
import {Range} from 'atom';
import {getServiceByNuclideUri} from '../../nuclide-client';

module.exports = {
  name: 'nuclide-ocaml',
  grammarScopes: Array.from(GRAMMARS),
  scope: 'file',
  lintOnFly: false,

  lint(textEditor: atom$TextEditor): Promise<Array<LinterMessage>> {
    return trackOperationTiming('nuclide-ocaml.lint', async () => {
      const filePath = textEditor.getPath();
      if (filePath == null) {
        return [];
      }

      const instance = getServiceByNuclideUri('MerlinService', filePath);
      if (instance == null) {
        return [];
      }
      await instance.pushNewBuffer(filePath, textEditor.getText());
      const diagnostics = await instance.errors(filePath);
      if (diagnostics == null) {
        return [];
      }
      return diagnostics.map((diagnostic: MerlinError): LinterMessage => {
        return {
          type: diagnostic.type === 'warning' ? 'Warning' : 'Error',
          filePath,
          text: diagnostic.message,
          range: new Range(
            [diagnostic.start.line - 1, diagnostic.start.col],
            [diagnostic.end.line - 1, diagnostic.end.col],
          ),
        };
      });
    });
  },
};
