/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

export type Datatip = {
  component: ReactClass<any>,
  range: atom$Range,
  pinnable?: boolean,
};

export type PinnedDatatip = {
  dispose(): void,
};

export type DatatipProvider = {
  datatip(editor: atom$TextEditor, bufferPosition: atom$Point): Promise<?Datatip>,
  inclusionPriority: number,
  validForScope(scopeName: string): boolean,
  // A unique name for the provider to be used for analytics.
  // It is recommended that it be the name of the provider's package.
  providerName: string,
};

export type DatatipService = {
  addProvider(provider: DatatipProvider): void,
  removeProvider(provider: DatatipProvider): void,
  createPinnedDataTip(component: ReactClass<any>, range: atom$Range, pinnable?: boolean,
    editor: TextEditor, onDispose: (pinnedDatatip: PinnedDatatip) => void): PinnedDatatip,
  deletePinnedDatatip(datatip: PinnedDatatip): void,
};
