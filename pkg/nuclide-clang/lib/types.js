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

import {Observable} from 'rxjs';

import type {
  ClangCompilationDatabase,
} from '../../nuclide-clang-rpc/lib/rpc-types';

export type ClangCompilationDatabaseProvider = {
  getCompilationDatabase: (
    path: string,
  ) => Observable<?ClangCompilationDatabase>,
  reset: (host: string) => void,
  resetForSource: (src: string) => void,
};
