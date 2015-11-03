'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export type Store = {
  toggleProvider(service: Provider): void;
}

export type ProviderType = 'DIRECTORY' | 'GLOBAL';

export type Provider<T : FileResult> = {
  executeQuery(query: string, directory?: atom$Directory): Promise<Array<T>>;
  getProviderType(): ProviderType;
  getName(): string;
  isRenderable(): boolean;
  getTabTitle(): string;

  getPromptText?: () => string;
  getAction?: () => string;
  getDebounceDelay?: () => number;
  isEligibleForDirectory?: (directory: atom$Directory) => Promise<boolean>;
  getComponentForItem?: (item: T) => ReactElement;
};

export type FileResult = {
  path: string;
  matchIndexes?: Array<number>;
  score?: number;
  // The original query that prompted this result, e.g. to highlight it in the UI.
  query?: string;
  context?: string;
  timestamp?: number;
};

export type ProviderResult = {
  error: ?Object;
  loading: boolean;
  result: Array<FileResult>;
};

export type DirectoryName = string;
export type ServiceName = string;

export type GroupedResult = {
  [key: DirectoryName]: {
    [key: ServiceName]: ProviderResult
  }
};
