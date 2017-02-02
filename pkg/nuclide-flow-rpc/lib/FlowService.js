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
  FileDiagnosticMessage,
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';

import {ServerLanguageService} from '../../nuclide-language-service-rpc';
import {wordAtPositionFromBuffer} from '../../commons-node/range';
import {filterResultsByPrefix, JAVASCRIPT_WORD_REGEX} from '../../nuclide-flow-common';

// Diagnostic information, returned from findDiagnostics.
export type Diagnostics = {
  // The location of the .flowconfig where these messages came from.
  flowRoot: NuclideUri,
  messages: Array<Diagnostic>,
};

export type NewDiagnostics = {
  flowRoot: NuclideUri,
  messages: Array<FileDiagnosticMessage>,
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
  rangeInFile: ?RangeInFile,
};

export type RangeInFile = {
  file: NuclideUri,
  range: atom$Range,
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

  async getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?Array<Completion>> {
    const results = await flowGetAutocompleteSuggestions(
      filePath,
      buffer.getText(),
      position,
      activatedManually,
      prefix,
    );
    return filterResultsByPrefix(prefix, results);
  }

  async getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    const match = wordAtPositionFromBuffer(buffer, position, JAVASCRIPT_WORD_REGEX);
    if (match == null) {
      return null;
    }
    const loc = await flowFindDefinition(
      filePath,
      buffer.getText(),
      position.row + 1,
      position.column + 1,
    );
    if (loc == null) {
      return null;
    }
    return {
      queryRange: [match.range],
      definitions: [{
        path: loc.file,
        position: loc.point,
        language: 'Flow',
      }],
    };
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
    return flowGetCoverage(filePath);
  }

  getOutline(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline> {
    return flowGetOutline(filePath, buffer.getText());
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
  ): Promise<?Array<atom$Range>> {
    return flowFindRefs(
      filePath,
      buffer.getText(),
      position,
    );
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
): Promise<?NewDiagnostics> {
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
  activatedManually: ?boolean,
  prefix: string,
): Promise<?Array<Completion>> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowGetAutocompleteSuggestions(
      file,
      currentContents,
      position,
      activatedManually,
      prefix,
    ),
  );
}

export async function flowGetType(
  file: NuclideUri,
  currentContents: string,
  line: number,
  column: number,
): Promise<?string> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowGetType(
      file,
      currentContents,
      line,
      column,
    ),
  );
}

export async function flowGetCoverage(
  file: NuclideUri,
): Promise<?CoverageResult> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowGetCoverage(file),
  );
}

export function flowGetOutline(
  file: ?NuclideUri,
  currentContents: string,
): Promise<?Outline> {
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

export async function flowFindRefs(
  file: NuclideUri,
  currentContents: string,
  position: atom$Point,
): Promise<?Array<atom$Range>> {
  return getState().getRootContainer().runWithRoot(
    file,
    root => root.flowFindRefs(
      file,
      currentContents,
      position,
    ),
  );
}

export function allowServerRestart(): void {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}
