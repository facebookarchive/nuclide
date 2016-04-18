'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {RevisionInfo} from '../../nuclide-hg-repository-base/lib/HgService';
import type {UIElement} from '../../nuclide-diff-ui-provider-interfaces';

export type DiffModeType = '1. Browse' | '2. Commit' | '3. Publish';

export type CommitModeType = 'Commit' | 'Amend';

export type CommitModeStateType = 'Ready' | 'Loading Commit Message' | 'Awaiting Commit';

export type PublishModeType = 'Create' | 'Update';

export type PublishModeStateType = 'Ready' | 'Loading Publish Message' | 'Awaiting Publish';

export type DiffOptionType = 'Dirty' | 'Last Commit' | 'Compare Commit';

export type FileChangeStatusValue = 1 | 2 | 3 | 4 | 5;

export type FileChange = {
  filePath: NuclideUri;
  statusCode?: FileChangeStatusValue;
};

export type FileChangeState = {
  filePath: NuclideUri;
  oldContents: string;
  newContents: string;
  savedContents?: string;
  fromRevisionTitle: string;
  toRevisionTitle: string;
  compareRevisionInfo: ?RevisionInfo;
  inlineComponents?: Array<UIElement>;
};

export type RevisionsState = {
  revisions: Array<RevisionInfo>;
  compareCommitId: ?number;
  commitId: number;
};

export type OffsetMap = Map<number, number>;

export type TextDiff = {
  addedLines: Array<number>;
  removedLines: Array<number>;
  oldLineOffsets: OffsetMap;
  newLineOffsets: OffsetMap;
};

export type HgDiffState = {
  revisionInfo: RevisionInfo;
  committedContents: string;
};

export type LineRangesWithOffsets = {
  regions: Array<{bufferRows: number; screenRows: number}>;
  screenLines: Array<any>;
};

export type HighlightedLines = {
  added: Array<number>;
  removed: Array<number>;
};
