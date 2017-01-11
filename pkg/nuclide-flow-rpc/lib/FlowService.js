/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ConnectableObservable} from 'rxjs';

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {TokenizedText} from '../../commons-node/tokenizedText-rpc-types';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';

import type {TypeHint} from '../../nuclide-type-hint/lib/rpc-types';
import type {
  Definition,
  DefinitionQueryResult,
} from '../../nuclide-definition-service/lib/rpc-types';
import type {Outline} from '../../nuclide-outline-view/lib/rpc-types';
import type {CoverageResult} from '../../nuclide-type-coverage/lib/rpc-types';
import type {FindReferencesReturn} from '../../nuclide-find-references/lib/rpc-types';
import type {
  DiagnosticProviderUpdate,
  FileDiagnosticUpdate,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';
import {ServerLanguageService} from '../../nuclide-language-service-rpc';

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
  start: atom$Point,
  end: atom$Point,
};

export type Loc = {
  file: NuclideUri,
  point: atom$Point,
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
  startPosition: atom$Point,
  endPosition: atom$Point,
};

export type FlowCoverageResult = {
  percentage: number,
  uncoveredRanges: Array<{
    start: atom$Point,
    end: atom$Point,
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

export async function initialize(
  fileNotifier: FileNotifier,
): Promise<LanguageService> {
  return new ServerLanguageService(
    fileNotifier,
    new FlowSingleFileLanguageService(fileNotifier),
  );
}

class FlowSingleFileLanguageService {
  constructor(fileNotifier: FileNotifier) { }

  dispose(): void { }

  getDiagnostics(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?DiagnosticProviderUpdate> {
    throw new Error('Not Yet Implemented');
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    throw new Error('Not Yet Implemented');
  }

  getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
  ): Promise<Array<Completion>> {
    throw new Error('Not Yet Implemented');
  }

  getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    throw new Error('Not Yet Implemented');
  }

  getDefinitionById(
    file: NuclideUri,
    id: string,
  ): Promise<?Definition> {
    throw new Error('Not Yet Implemented');
  }

  findReferences(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?FindReferencesReturn> {
    throw new Error('Not Yet Implemented');
  }

  getCoverage(
    filePath: NuclideUri,
  ): Promise<?CoverageResult> {
    throw new Error('Not Yet Implemented');
  }

  getOutline(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline> {
    throw new Error('Not Yet Implemented');
  }

  typeHint(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?TypeHint> {
    throw new Error('Not Yet Implemented');
  }

  highlight(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<Array<atom$Range>> {
    throw new Error('Not Yet Implemented');
  }

  formatSource(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?string> {
    throw new Error('Not Yet Implemented');
  }

  formatEntireFile(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    range: atom$Range,
  ): Promise<?{
    newCursor?: number,
    formatted: string,
  }> {
    throw new Error('Not implemented');
  }

  getEvaluationExpression(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?NuclideEvaluationExpression> {
    throw new Error('Not Yet Implemented');
  }

  getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    throw new Error('Not Yet Implemented');
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    throw new Error('Not Yet Implemented');
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

export function flowGetAst(
  file: ?NuclideUri,
  currentContents: string,
): Promise<any> {
  return getState().getRootContainer().runWithOptionalRoot(
    file,
    root => FlowRoot.flowGetAst(root, currentContents, getState().getExecInfoContainer()),
  );
}

export function allowServerRestart(): void {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}
