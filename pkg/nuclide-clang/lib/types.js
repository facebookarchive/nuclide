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

import type {
  ClangCompilationDatabase,
  ClangCursor,
} from '../../nuclide-clang-rpc/lib/rpc-types';

export type ClangCompilationDatabaseProvider = {
  getCompilationDatabase: (path: string) => Promise<?ClangCompilationDatabase>,
  reset: (host: string) => void,
  resetForSource: (src: string) => void,
};

export type ClangDeclarationInfoProvider = {
  getDeclarationInfo: (
    editor: atom$TextEditor,
    line: number,
    column: number,
  ) => Promise<?Array<ClangCursor>>,
};
