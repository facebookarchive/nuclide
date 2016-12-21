/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {trackTiming} from '../../nuclide-analytics';
import {getPythonServiceByNuclideUri} from '../../nuclide-remote-connection';

export default class CodeFormatHelpers {

  static formatEntireFile(editor: atom$TextEditor, range: atom$Range): Promise<{
    newCursor?: number,
    formatted: string,
  }> {
    return trackTiming('python.formatCode', async () => {
      const buffer = editor.getBuffer();
      const src = editor.getPath();
      if (!src) {
        return {
          formatted: buffer.getText(),
        };
      }

      const service = getPythonServiceByNuclideUri(src);
      const formatted = await service.formatCode(
        src,
        buffer.getText(),
        range.start.row + 1,
        range.end.row + 1,
      );

      return {formatted};
    });
  }

}
