/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileResult} from './rpc-types';

import {React} from 'react-for-atom';

export type ProviderSpec = {
  action?: string,
  debounceDelay?: number,
  name: string,
  prompt?: string,
  title: string,
  priority?: number,
};

export type Store = {
  toggleProvider(service: Provider): void,
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
  getDebounceDelay?: () => number,
  isEligibleForDirectory?: (directory: atom$Directory) => Promise<boolean>,
  getComponentForItem?: (item: FileResult) => React.Element<any>,
  /**
   * An optional number ≥ 0 used to determine ranking order in OmniSearch.
   * 0 == highest rank, +Infinity == lowest rank. Defaults to Number.POSITIVE_INFINITY.
   */
  getPriority?: () => number,
};

export type ProviderResult = {
  error: ?Object,
  loading: boolean,
  results: Array<FileResult>,
};

export type DirectoryName = NuclideUri;
export type ServiceName = string;

export type GroupedResult = {
  [key: ServiceName]: {
    results: {
      [key: DirectoryName]: ProviderResult,
    },
    title: string,
  },
};
