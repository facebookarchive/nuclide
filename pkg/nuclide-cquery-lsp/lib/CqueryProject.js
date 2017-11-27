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

import type {ClangRequestSettings} from '../../nuclide-clang-rpc/lib/rpc-types';
import type {CqueryProject} from '../../nuclide-cquery-lsp-rpc/lib/types';

import nuclideUri from 'nuclide-commons/nuclideUri';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {
  getClangRequestSettings,
  getDefaultFlags,
} from '../../nuclide-clang/lib/libclang';
import {COMPILATION_DATABASE_FILE} from '../../nuclide-cquery-lsp-rpc/lib/CqueryLanguageServer';
import {getCqueryLSPServiceByNuclideUri} from '../../nuclide-remote-connection';
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
  path: string,
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

function findNearestCompilationDbDir(file: string): Promise<?string> {
  return getCqueryLSPServiceByNuclideUri(file).findNearestCompilationDbDir(
    file,
  );
}

function getCompilationDbFile(compilationDbDir: string): string {
  return nuclideUri.join(compilationDbDir, COMPILATION_DATABASE_FILE);
}

async function getCompilationDbAndFlagsFile(
  settings: ?ClangRequestSettings,
  file: string,
): Promise<RootlessCqueryProject> {
  const compilationDbDir = await secondIfFirstIsNull(
    getCompilationDbDirFromSettings(settings),
    async () => findNearestCompilationDbDir(file),
  );
  if (compilationDbDir == null) {
    return {hasCompilationDb: false, defaultFlags: getDefaultFlags()};
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

export async function determineCqueryProject(
  path: string,
): Promise<CqueryProject> {
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
