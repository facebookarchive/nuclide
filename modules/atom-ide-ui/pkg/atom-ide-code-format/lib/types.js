/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {TextEdit} from 'nuclide-commons-atom/text-edit-rpc-types';

export interface CodeFormatProvider {
  /**
   * Providers should implement at least one of formatCode / formatEntireFile.
   * If formatCode exists, it'll be used if the editor selection isn't empty, or
   * if it's empty but formatEntireFile doesn't exist. Providers can also
   * optionally implement formatAtPosition to support on-type-formatting.
   */

  /**
   * Formats the range specified, and returns a list of text edits to apply.
   * Text edits must be non-overlapping and preferably in reverse-sorted order.
   */
  +formatCode?: (
    editor: atom$TextEditor,
    range: atom$Range,
  ) => Promise<Array<TextEdit>>,

  /**
   * Formats the range specified, but returns the entire file (along with the new cursor position).
   * Useful for less-flexible providers like clang-format.
   */
  +formatEntireFile?: (
    editor: atom$TextEditor,
    range: atom$Range,
  ) => Promise<{
    newCursor?: number,
    formatted: string,
  }>,

  /**
   * Formats around the given position, and returns a list of text edits to
   * apply, similar to `formatCode`. The language server determines the exact
   * range to format based on what's at that position.
   */
  +formatAtPosition?: (
    editor: atom$TextEditor,
    position: atom$Point,
    triggerCharacter: string,
  ) => Promise<Array<TextEdit>>,

  selector: string,
  inclusionPriority: number,
}
