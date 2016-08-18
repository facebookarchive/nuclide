'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  DebuggerLaunchAttachProvider,
} from '../nuclide-debugger-base';
import type {NuclideUri} from '../commons-node/nuclideUri';

export type NuclideDebuggerProvider = {
  name: string,
  getLaunchAttachProvider(connection: NuclideUri): ?DebuggerLaunchAttachProvider,
};

export type NuclideEvaluationExpression = {
  range: atom$Range,
  expression: string,
};

export type NuclideEvaluationExpressionProvider = {
  name: string,
  // A comma-separated list of Atom grammars understood by the provider, e.g. 'source.js.jsx'
  selector: string,
  getEvaluationExpression(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression>,
};
