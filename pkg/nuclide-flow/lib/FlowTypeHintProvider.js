/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';

import invariant from 'assert';
import {wordAtPosition} from '../../commons-atom/range';
import featureConfig from '../../commons-atom/featureConfig';
import {getFlowServiceByNuclideUri} from './FlowServiceFactory';
import {Range} from 'atom';
import {JAVASCRIPT_WORD_REGEX} from '../../nuclide-flow-common';

export class FlowTypeHintProvider {
  async typeHint(editor: TextEditor, position: atom$Point): Promise<?TypeHint> {
    const enabled = featureConfig.get('nuclide-flow.enableTypeHints');
    if (!enabled) {
      return null;
    }
    const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
    if (scopes.find(scope => scope.includes('comment')) !== undefined) {
      return null;
    }
    const filePath = editor.getPath();
    if (filePath == null) {
      return null;
    }
    const contents = editor.getText();
    const flowService = await getFlowServiceByNuclideUri(filePath);
    invariant(flowService);

    const hint = await flowService.flowGetType(
      filePath,
      contents,
      position.row,
      position.column,
    );
    if (hint == null) {
      return null;
    }

    // TODO(nmote) refine this regex to better capture JavaScript expressions.
    // Having this regex be not quite right is just a display issue, though --
    // it only affects the location of the tooltip.
    const word = wordAtPosition(editor, position, JAVASCRIPT_WORD_REGEX);
    let range;
    if (word) {
      range = word.range;
    } else {
      range = new Range(position, position);
    }
    return {
      hint: hint.hint,
      range,
    };
  }
}
