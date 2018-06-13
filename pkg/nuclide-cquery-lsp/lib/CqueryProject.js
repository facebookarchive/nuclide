/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {ClangRequestSettings} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {CqueryProject} from '../../nuclide-cquery-lsp-rpc/lib/types';

import nuclideUri from 'nuclide-commons/nuclideUri';
import {isHeaderFile} from '../../nuclide-clang-rpc/lib/utils';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {
  getClangRequestSettings,
  getServerSettings,
} from '../../nuclide-clang/lib/libclang';
import {COMPILATION_DATABASE_FILE} from '../../nuclide-cquery-lsp-rpc/lib/CompilationDatabaseFinder';
import {
  getCqueryLSPServiceByNuclideUri,
  getClangServiceByNuclideUri,
} from '../../nuclide-remote-connection';
import {secondIfFirstIsNull} from './utils';

type RootlessCqueryProject =
  | {|hasCompilationDb: true, compilationDbDir: string, flagsFile: string|}
  | {|hasCompilationDb: false, defaultFlags: ?Array<string>|};

function getProjectRootFromAtom(path: string): string {
  const atomProjectPath = atom.project.relativizePath(path)[0];
  return atomProjectPath != null ? atomProjectPath : nuclideUri.dirname(path);
}

function getProjectRootFromClangRequestSettingsOrAtom(
  settings: ?ClangRequestSettings,
  path: NuclideUri,
): string {
  return settings != null && settings.projectRoot != null
    ? settings.projectRoot
    : getProjectRootFromAtom(path);
}

function getCompilationDbDirFromSettings(
  settings: ?ClangRequestSettings,
): ?string {
  return settings != null &&
    settings.compilationDatabase != null &&
    settings.compilationDatabase.file != null
    ? nuclideUri.dirname(settings.compilationDatabase.file)
    : null;
}

function getFlagsFileFromSettings(settings: ?ClangRequestSettings): ?string {
  return settings != null && settings.compilationDatabase != null
    ? settings.compilationDatabase.flagsFile
    : null;
}

function findNearestCompilationDbDir(file: NuclideUri): Promise<?string> {
  return getCqueryLSPServiceByNuclideUri(file).findNearestCompilationDbDir(
    file,
  );
}

function getCompilationDbFile(compilationDbDir: string): string {
  return nuclideUri.join(compilationDbDir, COMPILATION_DATABASE_FILE);
}

async function getCompilationDbAndFlagsFile(
  settings: ?ClangRequestSettings,
  file: NuclideUri,
): Promise<RootlessCqueryProject> {
  const compilationDbDir = await secondIfFirstIsNull(
    getCompilationDbDirFromSettings(settings),
    async () => findNearestCompilationDbDir(file),
  );
  if (compilationDbDir == null) {
    return {
      hasCompilationDb: false,
      defaultFlags: getServerSettings().defaultFlags,
    };
  }
  return {
    hasCompilationDb: true,
    compilationDbDir,
    flagsFile: await secondIfFirstIsNull(
      getFlagsFileFromSettings(settings),
      async () => getCompilationDbFile(compilationDbDir),
    ),
  };
}

async function findSourcePath(path: NuclideUri): Promise<NuclideUri> {
  if (isHeaderFile(path)) {
    const service = getClangServiceByNuclideUri(path);
    if (service != null) {
      const source = await service.getRelatedSourceOrHeader(path);
      if (source != null) {
        return source;
      }
    }
  }
  return path;
}

export async function determineCqueryProject(
  _path: NuclideUri,
): Promise<CqueryProject> {
  const path = await findSourcePath(_path);
  const settings = await getClangRequestSettings(path);
  const compilationDbAndFlags = await getCompilationDbAndFlagsFile(
    settings,
    path,
  );
  const projectRoot = getProjectRootFromClangRequestSettingsOrAtom(
    settings,
    path,
  );
  // We have to do this because flow needs a path in the AST that leads to
  // true/false values for the hasCompilationDb flag.
  return compilationDbAndFlags.hasCompilationDb
    ? {...compilationDbAndFlags, projectRoot}
    : {...compilationDbAndFlags, projectRoot};
}
