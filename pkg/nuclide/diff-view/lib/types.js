'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
// adding a new line and saving
export type FileChangeStatusValue = 1 | 2 | 3 | 4 | 5;

export type FileChange = {
  filePath: NuclideUri;
  statusCode?: FileChangeStatusValue;
};

export type FileChangeState = {
  filePath: string;
  oldContents: string;
  newContents: string;
  savedContents?: string;
  inlineComponents?: Array<InlineComponent>;
};

export type TextDiff = {
  addedLines: Array<number>;
  removedLines: Array<number>;
  oldLineOffsets: {[lineNumber: string]: number};
  newLineOffsets: {[lineNumber: string]: number};
};

export type LineRangesWithOffsets = {
  regions: Array<{bufferRows: number; screenRows: number}>;
  screenLines: Array<any>;
};

export type HighlightedLines = {
  added: Array<number>;
  removed: Array<number>;
};

export type InlineComponent = {
  node: ReactElement;
  bufferRow: number;
};

export type RenderedComponent = {
  container: HTMLElement;
  component: ReactComponent;
  bufferRow: number;
};
