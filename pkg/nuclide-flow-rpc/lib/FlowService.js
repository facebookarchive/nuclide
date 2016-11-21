'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ConnectableObservable} from 'rxjs';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {TokenizedText} from '../../commons-node/tokenizedText-rpc-types';

// Diagnostic information, returned from findDiagnostics.
export type Diagnostics = {
  // The location of the .flowconfig where these messages came from.
  flowRoot: NuclideUri,
  messages: Array<Diagnostic>,
};

/*
 * Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest.
 */
export type Diagnostic = {
  level: string,
  messageComponents: Array<MessageComponent>,
};

export type MessageComponent = {
  descr: string,
  range: ?Range,
};

export type Range = {
  file: NuclideUri,
  start: Point,
  end: Point,
};

export type Point = {
  line: number,
  column: number,
};

export type Loc = {
  file: NuclideUri,
  point: Point,
};

// If types are added here, make sure to also add them to FlowConstants.js. This needs to be the
// canonical type definition so that we can use these in the service framework.
export type ServerStatusType =
  'failed' |
  'unknown' |
  'not running' |
  'not installed' |
  'busy' |
  'init' |
  'ready';

export type ServerStatusUpdate = {
  pathToRoot: NuclideUri,
  status: ServerStatusType,
};

export type FlowOutlineTree = {
  tokenizedText: TokenizedText,
  representativeName?: string,
  children: Array<FlowOutlineTree>,
  startPosition: Point,
  endPosition: Point,
};

export type FlowCoverageResult = {
  percentage: number,
  uncoveredRanges: Array<{
    start: Point,
    end: Point,
  }>,
};

export type FlowAutocompleteItem = {
  name: string,
  type: string,
  func_details: ?{
    return_type: string,
    params: Array<{name: string, type: string}>,
  },
  path: string,
  line: number,
  endline: number,
  start: number,
  end: number,
};

import {FlowRoot} from './FlowRoot';
import {FlowServiceState} from './FlowServiceState';

let state: ?FlowServiceState = null;

function getState(): FlowServiceState {
  if (state == null) {
    state = new FlowServiceState();
  }
  return state;
}

export function dispose(): void {
  if (state != null) {
    state.dispose();
    state = null;
  }
}

export function getServerStatusUpdates(): ConnectableObservable<ServerStatusUpdate> {
  return getState().getRootContainer().getServerStatusUpdates().publish();
}

export function flowFindDefinition(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number,
): Promise<?Loc> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowFindDefinition(
      file,
      currentContents,
      line,
      column,
    ),
  );
}

export function flowFindDiagnostics(
  file: NuclideUri,
  currentContents: ?string,
): Promise<?Diagnostics> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowFindDiagnostics(
      file,
      currentContents,
    ),
  );
}

export function flowGetAutocompleteSuggestions(
  file: NuclideUri,
  currentContents: string,
  position: atom$Point,
  prefix: string,
): Promise<?Array<FlowAutocompleteItem>> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowGetAutocompleteSuggestions(
      file,
      currentContents,
      position,
      prefix,
    ),
  );
}

export async function flowGetType(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number,
  includeRawType: boolean,
): Promise<?{type: string, rawType: ?string}> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowGetType(
      file,
      currentContents,
      line,
      column,
      includeRawType,
    ),
  );
}

export async function flowGetCoverage(
  file: NuclideUri,
): Promise<?FlowCoverageResult> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowGetCoverage(file),
  );
}

export function flowGetOutline(
  file: ?NuclideUri,
  currentContents: string,
): Promise<?Array<FlowOutlineTree>> {
  return getState().getRootContainer().runWithOptionalRoot(
    file,
    root => FlowRoot.flowGetOutline(root, currentContents, getState().getExecInfoContainer()),
  );
}

export function allowServerRestart(): void {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}
