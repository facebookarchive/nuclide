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
} from '../../nuclide-diagnostics-common/lib/rpc-types';
import type {Completion} from '../../nuclide-language-service/lib/LanguageService';
import type {NuclideEvaluationExpression} from '../../nuclide-debugger-interfaces/rpc-types';

import {ServerLanguageService} from '../../nuclide-language-service-rpc';

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

import {FlowSingleProjectLanguageService} from './FlowSingleProjectLanguageService';
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
    return getState().getRootContainer().runWithRoot(
      filePath,
      root => root.getDiagnostics(
        filePath,
        buffer,
      ),
    );
  }

  observeDiagnostics(): ConnectableObservable<FileDiagnosticUpdate> {
    throw new Error('Not Yet Implemented');
  }

  getAutocompleteSuggestions(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
    activatedManually: boolean,
    prefix: string,
  ): Promise<?Array<Completion>> {
    return getState().getRootContainer().runWithRoot(
      filePath,
      root => root.getAutocompleteSuggestions(
        filePath,
        buffer,
        position,
        activatedManually,
        prefix,
      ),
    );
  }

  getDefinition(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?DefinitionQueryResult> {
    return getState().getRootContainer().runWithRoot(
      filePath,
      root => root.getDefinition(
        filePath,
        buffer,
        position,
      ),
    );
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
    return getState().getRootContainer().runWithRoot(
      filePath,
      root => root.getCoverage(filePath),
    );
  }

  getOutline(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
  ): Promise<?Outline> {
    return getState().getRootContainer().runWithOptionalRoot(
      filePath,
      root => FlowSingleProjectLanguageService
          .getOutline(filePath, buffer, root, getState().getExecInfoContainer()),
    );
  }

  typeHint(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?TypeHint> {
    return getState().getRootContainer().runWithRoot(
      filePath,
      root => root.typeHint(
        filePath,
        buffer,
        position,
      ),
    );
  }

  highlight(
    filePath: NuclideUri,
    buffer: simpleTextBuffer$TextBuffer,
    position: atom$Point,
  ): Promise<?Array<atom$Range>> {
    return getState().getRootContainer().runWithRoot(
      filePath,
      root => root.highlight(
        filePath,
        buffer,
        position,
      ),
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

  async getProjectRoot(fileUri: NuclideUri): Promise<?NuclideUri> {
    const flowRoot = await getState().getRootContainer().getRootForPath(fileUri);
    return flowRoot == null ? null : flowRoot.getPathToRoot();
  }

  isFileInProject(fileUri: NuclideUri): Promise<boolean> {
    throw new Error('Not Yet Implemented');
  }
}

export function getServerStatusUpdates(): ConnectableObservable<ServerStatusUpdate> {
  return getState().getRootContainer().getServerStatusUpdates().publish();
}

export function flowGetAst(
  file: ?NuclideUri,
  currentContents: string,
): Promise<any> {
  return getState().getRootContainer().runWithOptionalRoot(
    file,
    root => FlowSingleProjectLanguageService
        .flowGetAst(root, currentContents, getState().getExecInfoContainer()),
  );
}

export function allowServerRestart(): void {
  for (const root of getState().getRootContainer().getAllRoots()) {
    root.allowServerRestart();
  }
}
