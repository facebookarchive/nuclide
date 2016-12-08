/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

declare class simpleTextBuffer$TextBuffer {
  constructor(contents: string): void,

  // Mixin
  static deserialize: (state: Object, params: Object) => mixed,

  // Events
  onWillChange(callback: (event: atom$TextEditEvent) => mixed): IDisposable,
  onDidChange(callback: (event: atom$TextEditEvent) => mixed): IDisposable,
  onDidStopChanging(callback: () => mixed): IDisposable,
  onDidChangeModified(callback: () => mixed): IDisposable,
  onDidChangeEncoding(callback: () => mixed): IDisposable,
  onDidDestroy(callback: () => mixed): IDisposable,

  // File Details
  setEncoding(encoding: string): void,
  getEncoding(): string,
  getId(): string,

  // Reading Text
  isEmpty(): boolean,
  getText(): string,
  getTextInRange(range: atom$RangeLike): string,
  getLineCount(): number,
  getLines(): Array<string>,
  getLastLine(): string,
  lineForRow(row: number): string,
  lineEndingForRow(row: number): string,
  lineLengthForRow(row: number): number,
  isRowBlank(row: number): boolean,
  previousNonBlankRow(startRow: number): ?number,
  nextNonBlankRow(startRow: number): ?number,

  // Mutating Text
  setText(text: string): atom$Range,
  setTextInRange(
    range: atom$RangeLike, text: string, options?: Object): atom$Range,
  setTextViaDiff(text: string): void,
  insert(
    position: atom$Point,
    text: string,
    options?: {
      normalizeLineEndings?: boolean,
      undo?: string,
    },
  ): atom$Range,
  append(text: string, options: ?{
    normalizeLineEndings?: boolean,
    undo?: string,
  }): atom$Range,
  delete(range: atom$Range): atom$Range,
  deleteRows(startRow: number, endRow: number): atom$Range,

  // History
  undo(): void,
  redo(): void,
  transact(fn: () => mixed, _: void): void,
  transact(groupingInterval: number, fn: () => mixed): void,
  clearUndoStack(): void,
  createCheckpoint(): atom$TextBufferCheckpoint,
  revertToCheckpoint(checkpoint: atom$TextBufferCheckpoint): boolean,
  groupChangesSinceCheckpoint(checkpoint: atom$TextBufferCheckpoint): boolean,
  // TODO describe the return type more precisely.
  getChangesSinceCheckpoint(checkpoint: atom$TextBufferCheckpoint): Array<mixed>,

  // Search And Replace
  scanInRange(regex: RegExp, range: atom$Range, iterator: TextBufferScanIterator): void,
  backwardsScanInRange(
    regex: RegExp, range: atom$Range, iterator: TextBufferScanIterator): void,

  // Buffer Range Details
  getLastRow(): number,
  getRange(): atom$Range,
  rangeForRow(row: number, includeNewLine?: boolean): atom$Range,

  // Position/Index mapping
  characterIndexForPosition(position: atom$PointLike): number,
  positionForCharacterIndex(index: number): atom$Point,

  // Private APIs
  emitter: atom$Emitter,
  refcount: number,
  changeCount: number,
  destroy(): void,
  isDestroyed(): boolean,

  static Point: typeof atom$Point,
  static Range: typeof atom$Range,
}

declare module 'simple-text-buffer' {
  declare export var Point: typeof atom$Point;
  declare export var Range: typeof atom$Range;
  declare export default typeof simpleTextBuffer$TextBuffer;
}
