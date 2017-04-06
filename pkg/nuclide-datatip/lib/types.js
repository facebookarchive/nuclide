/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

// Borrowed from the LSP API.
export type MarkedString =
  | {
      type: 'markdown',
      value: string,
    }
  | {
      type: 'snippet',
      grammar: atom$Grammar,
      value: string,
    };

export type Datatip =
  | {|
      component: ReactClass<any>,
      range: atom$Range,
      pinnable?: boolean,
    |}
  | {|
      markedStrings: Array<MarkedString>,
      range: atom$Range,
      pinnable?: boolean,
    |};

export type PinnedDatatip = {
  dispose(): void,
};

export type DatatipProvider = {
  datatip(
    editor: atom$TextEditor,
    bufferPosition: atom$Point,
    // The mouse event that triggered the datatip.
    // This is null for manually toggled datatips.
    mouseEvent: ?MouseEvent,
  ): Promise<?Datatip>,
  inclusionPriority: number,
  validForScope(scopeName: string): boolean,
  // A unique name for the provider to be used for analytics.
  // It is recommended that it be the name of the provider's package.
  providerName: string,
};

export type DatatipService = {
  addProvider(provider: DatatipProvider): IDisposable,
  createPinnedDataTip(datatip: Datatip, editor: TextEditor): PinnedDatatip,
};
