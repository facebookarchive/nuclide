/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Row} from 'nuclide-commons-ui/Table';
import type {DisplayDiagnostic} from './ui/ExperimentalDiagnosticsTable';

/*
 * Sorts the diagnostics according to given column and sort direction
 */
export default function sortDiagnostics(
  diagnostics: Array<Row<*>>,
  sortedColumnName: ?string,
  sortDescending: boolean,
): Array<Row<DisplayDiagnostic>> {
  // TODO: Implement this.
  return diagnostics;
}
