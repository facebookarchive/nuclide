/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import featureConfig from 'nuclide-commons-atom/feature-config';
import {wordAtPosition} from 'nuclide-commons-atom/range';

export async function secondIfFirstIsNull<T>(
  first: ?T,
  second: () => Promise<T>,
): Promise<T> {
  return first != null ? first : second();
}

export function wordUnderPoint(
  editor: atom$TextEditor,
  point: atom$Point,
): ?string {
  const match = wordAtPosition(editor, point);
  if (match != null && match.wordMatch.length > 0) {
    return match.wordMatch[0];
  }
  return null;
}

export function enableLibclangLogsConfig(): boolean {
  return featureConfig.get('nuclide-cquery-lsp.enable-libclang-logs') === true;
}

export function indexerThreadsConfig(): number {
  return ((featureConfig.get(
    'nuclide-cquery-lsp.indexer-threads',
    // $FlowIgnore: defined as integer in package.json
  ): any): number);
}
