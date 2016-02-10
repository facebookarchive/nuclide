'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';
import type {RevisionInfo} from '../../hg-repository-base/lib/hg-constants';

export type FileChangeStatusValue = 1 | 2 | 3 | 4 | 5;

export type FileChange = {
  filePath: NuclideUri,
  statusCode?: FileChangeStatusValue,
};

export type FileChangeState = {
  filePath: NuclideUri,
  oldContents: string,
  newContents: string,
  savedContents?: string,
  inlineComponents?: Array<InlineComponent>,
};

export type RevisionsState = {
  revisions: Array<RevisionInfo>,
  compareCommitId: ?number,
  commitId: number,
};

export type OffsetMap = Map<number, number>;

export type TextDiff = {
  addedLines: Array<number>,
  removedLines: Array<number>,
  oldLineOffsets: OffsetMap,
  newLineOffsets: OffsetMap,
};

export type HgDiffState = {
  committedContents: string,
  filesystemContents: string,
};

export type LineRangesWithOffsets = {
  regions: Array<{bufferRows: number, screenRows: number}>,
  screenLines: Array<any>,
};

export type HighlightedLines = {
  added: Array<number>,
  removed: Array<number>,
};

export type InlineComponent = {
  node: ReactElement,
  bufferRow: number,
};

export type RenderedComponent = {
  container: HTMLElement,
  component: ReactComponent,
  bufferRow: number,
};
