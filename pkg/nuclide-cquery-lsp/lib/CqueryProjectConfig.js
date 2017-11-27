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

type PartialCqueryProjectConfig =
  | {|hasCompilationDb: true, compilationDbDir: string, flagsFile: string|}
  | {|hasCompilationDb: false, defaultFlags: ?Array<string>|};

function getProjectRootFromClangRequestSettingsOrAtom(
  settings: ?ClangRequestSettings,
  path: string,
): string {
  if (settings != null && settings.projectRoot != null) {
    return settings.projectRoot;
  }
  const atomProjectPath = atom.project.relativizePath(path)[0];
  return atomProjectPath != null ? atomProjectPath : nuclideUri.dirname(path);
}

function secondIfFirstIsNull<T>(first: ?T, second: T): T {
  return first != null ? first : second;
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

async function getCompilationDbAndFlagsFile(
  settings: ?ClangRequestSettings,
  source: string,
): Promise<PartialCqueryProjectConfig> {
  const compilationDbDir = secondIfFirstIsNull(
    getCompilationDbDirFromSettings(settings),
    await getCqueryLSPServiceByNuclideUri(source).findCompilationDbDir(source),
  );
  if (compilationDbDir == null) {
    return {hasCompilationDb: false, defaultFlags: getDefaultFlags()};
  }
  const flagsFile = secondIfFirstIsNull(
    getFlagsFileFromSettings(settings),
    nuclideUri.join(compilationDbDir, COMPILATION_DATABASE_FILE),
  );
  return {
    hasCompilationDb: true,
    compilationDbDir,
    flagsFile,
  };
}

export async function getCqueryProject(path: string): Promise<CqueryProject> {
  const settings = await getClangRequestSettings(path);
  const projectRoot = getProjectRootFromClangRequestSettingsOrAtom(
    settings,
    path,
  );
  const compilationDbAndFlags = await getCompilationDbAndFlagsFile(
    settings,
    path,
  );
  // We have to do this because flow needs a path in the AST that leads to
  // true/false values for the hasCompilationDb flag.
  return compilationDbAndFlags.hasCompilationDb
    ? {...compilationDbAndFlags, projectRoot}
    : {...compilationDbAndFlags, projectRoot};
}
