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

import type {SymbolInformation} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';

import {SymbolKind} from '../../../nuclide-vscode-language-service-rpc/lib/protocol';

export function isFunction(symbol: SymbolInformation): boolean {
  return (
    symbol.kind === SymbolKind.Function || symbol.kind === SymbolKind.Method
  );
}
