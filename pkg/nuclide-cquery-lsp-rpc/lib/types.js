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

import type {TokenizedText} from 'nuclide-commons/tokenized-text';

export type SimpleToken = {
  text: string,
  isBreak: boolean,
};

export type TokenizedSymbol = {
  ancestors: string[],
  tokenizedText: TokenizedText,
};
