/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Directory as LocalDirectoryType} from 'atom';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import nullthrows from 'nullthrows';

import {RemoteConnection} from './RemoteConnection';
import {RemoteDirectory} from './RemoteDirectory';
import {RemoteFile} from './RemoteFile';
import {ServerConnection} from './ServerConnection';
import {ConnectionCache} from './ConnectionCache';

import {
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
} from './SshHandshake';

import {
  getService,
  getServiceByConnection,
  getServiceByNuclideUri,
  awaitServiceByNuclideUri,
  getlocalService,
} from './service-manager';

export type Directory = LocalDirectoryType | RemoteDirectory;

export {
  RemoteConnection,
  RemoteDirectory,
  RemoteFile,
  ServerConnection,
  ConnectionCache,
  SshHandshake,
  decorateSshConnectionDelegateWithTracking,
  getService,
  getServiceByConnection,
  getServiceByNuclideUri,
  getlocalService,
};

export {
  bufferForUri,
  existingBufferForUri,
  loadBufferForUri,
} from './remote-text-buffer';

export {
  default as RemoteDirectoryPlaceholder,
} from './RemoteDirectoryPlaceholder';

import typeof * as AdbService from '../../nuclide-adb-sdb-rpc/lib/AdbService';
import typeof * as BuckService from '../../nuclide-buck-rpc';
import typeof * as ClangService from '../../nuclide-clang-rpc';
import typeof * as CodeSearchService from '../../nuclide-code-search-rpc/lib/CodeSearchService';
import typeof * as CtagsService from '../../nuclide-ctags-rpc';
import typeof * as DefinitionPreviewService from '../../nuclide-definition-preview-rpc';
import typeof * as FileSystemService from '../../nuclide-server/lib/services/FileSystemService';
import typeof * as FileWatcherService from '../../nuclide-filewatcher-rpc';
import typeof * as FlowService from '../../nuclide-flow-rpc';
import typeof * as FuzzyFileSearchService from '../../nuclide-fuzzy-file-search-rpc';
import typeof * as GeneratedFileService from '../../nuclide-generated-files-rpc';
import typeof * as GrepService from '../../nuclide-grep-rpc';
import typeof * as HackService from '../../nuclide-hack-rpc';
import typeof * as HgService from '../../nuclide-hg-rpc/lib/HgService';
import typeof * as InfoService from '../../nuclide-server/lib/services/InfoService';
import typeof * as JavaDebuggerHelpersService from '../../nuclide-debugger-java-rpc/lib/JavaDebuggerHelpersService';
import typeof * as MetroService from '../../nuclide-metro-rpc/lib/MetroService';
import typeof * as OpenFilesService from '../../nuclide-open-files-rpc/lib/OpenFilesService';
import typeof * as HhvmDebuggerService from '../../nuclide-debugger-hhvm-rpc';
import typeof * as PythonService from '../../nuclide-python-rpc';
import typeof * as RemoteCommandService from '../../nuclide-remote-atom-rpc';
import typeof * as SdbService from '../../nuclide-adb-sdb-rpc/lib/SdbService';
import typeof * as SocketService from '../../nuclide-socket-rpc';
import typeof * as SourceControlService from '../../nuclide-server/lib/services/SourceControlService';
import typeof * as VSCodeLanguageService from '../../nuclide-vscode-language-service-rpc';
import typeof * as CqueryLSPService from '../../nuclide-cquery-lsp-rpc';
import typeof * as VSCodeDebuggerAdapterService from 'nuclide-debugger-vsps/VSCodeDebuggerAdapterService';

export function getAdbServiceByNuclideUri(uri: NuclideUri): AdbService {
  return nullthrows(getServiceByNuclideUri('AdbService', uri));
}

export function getBuckServiceByNuclideUri(uri: NuclideUri): BuckService {
  return nullthrows(getServiceByNuclideUri('BuckService', uri));
}

export function getClangServiceByNuclideUri(uri: NuclideUri): ClangService {
  return nullthrows(getServiceByNuclideUri('ClangService', uri));
}

export function getCodeSearchServiceByNuclideUri(
  uri: NuclideUri,
): CodeSearchService {
  return nullthrows(getServiceByNuclideUri('CodeSearchService', uri));
}

export function getCtagsServiceByNuclideUri(uri: NuclideUri): CtagsService {
  return nullthrows(getServiceByNuclideUri('CtagsService', uri));
}

export function getDefinitionPreviewServiceByNuclideUri(
  uri: NuclideUri,
): DefinitionPreviewService {
  return nullthrows(getServiceByNuclideUri('DefinitionPreviewService', uri));
}

export function getFileSystemServiceByNuclideUri(
  uri: NuclideUri,
): FileSystemService {
  return nullthrows(getServiceByNuclideUri('FileSystemService', uri));
}

export function getFileWatcherServiceByNuclideUri(
  uri: NuclideUri,
): FileWatcherService {
  return nullthrows(getServiceByNuclideUri('FileWatcherService', uri));
}

export function getFlowServiceByNuclideUri(uri: NuclideUri): FlowService {
  return nullthrows(getServiceByNuclideUri('FlowService', uri));
}

export function getFuzzyFileSearchServiceByNuclideUri(
  uri: NuclideUri,
): FuzzyFileSearchService {
  return nullthrows(getServiceByNuclideUri('FuzzyFileSearchService', uri));
}

export function awaitGeneratedFileServiceByNuclideUri(
  uri: NuclideUri,
): Promise<GeneratedFileService> {
  return awaitServiceByNuclideUri('GeneratedFileService', uri).then(nullthrows);
}

export function getGrepServiceByNuclideUri(uri: NuclideUri): GrepService {
  return nullthrows(getServiceByNuclideUri('GrepService', uri));
}

export function getHackLanguageForUri(uri: NuclideUri): HackService {
  return nullthrows(getServiceByNuclideUri('HackService', uri));
}

export function getHgServiceByNuclideUri(uri: NuclideUri): HgService {
  return nullthrows(getServiceByNuclideUri('HgService', uri));
}

export function getHhvmDebuggerServiceByNuclideUri(
  uri: NuclideUri,
): HhvmDebuggerService {
  return nullthrows(getServiceByNuclideUri('HhvmDebuggerService', uri));
}

export function getInfoServiceByNuclideUri(uri: NuclideUri): InfoService {
  return nullthrows(getServiceByNuclideUri('InfoService', uri));
}

export function getJavaDebuggerHelpersServiceByNuclideUri(
  uri: NuclideUri,
): JavaDebuggerHelpersService {
  return nullthrows(getServiceByNuclideUri('JavaDebuggerHelpersService', uri));
}

export function getMetroServiceByNuclideUri(uri: NuclideUri): MetroService {
  return nullthrows(getServiceByNuclideUri('MetroService', uri));
}

export function getOpenFilesServiceByNuclideUri(
  uri: NuclideUri,
): OpenFilesService {
  return nullthrows(getServiceByNuclideUri('OpenFilesService', uri));
}

export function getPythonServiceByNuclideUri(uri: NuclideUri): PythonService {
  return nullthrows(getServiceByNuclideUri('PythonService', uri));
}

export function getPythonServiceByConnection(
  connection: ?ServerConnection,
): PythonService {
  return getServiceByConnection('PythonService', connection);
}

export function getRemoteCommandServiceByNuclideUri(
  uri: NuclideUri,
): RemoteCommandService {
  return nullthrows(getServiceByNuclideUri('RemoteCommandService', uri));
}

export function getSdbServiceByNuclideUri(uri: NuclideUri): SdbService {
  return nullthrows(getServiceByNuclideUri('SdbService', uri));
}

export function getSocketServiceByNuclideUri(uri: NuclideUri): SocketService {
  return nullthrows(getServiceByNuclideUri('SocketService', uri));
}

export function getSourceControlServiceByNuclideUri(
  uri: NuclideUri,
): SourceControlService {
  return nullthrows(getServiceByNuclideUri('SourceControlService', uri));
}

export function getVSCodeLanguageServiceByConnection(
  connection: ?ServerConnection,
): VSCodeLanguageService {
  return nullthrows(
    getServiceByConnection('VSCodeLanguageService', connection),
  );
}

export function getVSCodeLanguageServiceByNuclideUri(
  uri: NuclideUri,
): VSCodeLanguageService {
  return nullthrows(getServiceByNuclideUri('VSCodeLanguageService', uri));
}

export function getCqueryLSPServiceByConnection(
  connection: ?ServerConnection,
): CqueryLSPService {
  return nullthrows(getServiceByConnection('CqueryLSPService', connection));
}

export function getCqueryLSPServiceByNuclideUri(
  uri: NuclideUri,
): CqueryLSPService {
  return nullthrows(getServiceByNuclideUri('CqueryLSPService', uri));
}

export function getVSCodeDebuggerAdapterServiceByNuclideUri(
  uri: NuclideUri,
): VSCodeDebuggerAdapterService {
  return nullthrows(
    getServiceByNuclideUri('VSCodeDebuggerAdapterService', uri),
  );
}
