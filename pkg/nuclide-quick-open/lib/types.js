/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';

import {React} from 'react-for-atom';

export type FileResult = {
  path: NuclideUri,
  matchIndexes?: Array<number>,
  score?: number,
  // The original query that prompted this result, e.g. to highlight it in the UI.
  query?: string,
  context?: string,
  timestamp?: number,
  // Jump to line/column if provided.
  line?: number,
  column?: number,
};

export type ProviderType = 'DIRECTORY' | 'GLOBAL';

export type Provider = {
  executeQuery(query: string, directory?: atom$Directory): Promise<Array<FileResult>>,
  getProviderType(): ProviderType,
  getName(): string,
  isRenderable(): boolean,
  getTabTitle(): string,

  getPromptText?: () => string,
  getAction?: () => string,
  getCanOpenAll?: () => boolean,
  getDebounceDelay?: () => number,
  isEligibleForDirectory?: (directory: atom$Directory) => Promise<boolean>,
  getComponentForItem?: (item: FileResult) => React.Element<any>,
  /**
   * An optional number ≥ 0 used to determine ranking order in OmniSearch.
   * 0 == highest rank, +Infinity == lowest rank. Defaults to Number.POSITIVE_INFINITY.
   */
  getPriority?: () => number,
};
