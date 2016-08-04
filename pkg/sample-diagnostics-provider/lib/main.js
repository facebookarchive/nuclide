'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DiagnosticProvider} from '../../nuclide-diagnostics-common';
import SampleDiagnosticsProvider from './SampleDiagnosticsProvider';

export function provideDiagnostics(): DiagnosticProvider {
  return new SampleDiagnosticsProvider();
}
