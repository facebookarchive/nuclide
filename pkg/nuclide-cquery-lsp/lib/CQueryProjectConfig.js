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
import type {CqueryProjectConfig} from '../../nuclide-cquery-lsp-rpc/lib/types';

import nuclideUri from 'nuclide-commons/nuclideUri';
// eslint-disable-next-line rulesdir/no-cross-atom-imports
import {
  getClangRequestSettings,
  getDefaultFlags,
} from '../../nuclide-clang/lib/libclang';

type PartialCqueryProjectConfig =
  | {|hasCompilationDb: true, compilationDb: string, flagsFile: string|}
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

function resolveFlagsFile(compilationDb: string, flagsFile: ?string): string {
  return flagsFile != null ? flagsFile : compilationDb;
}

function getCompilationDbAndFlagsFileFromClangRequestSettings(
  settings: ?ClangRequestSettings,
): PartialCqueryProjectConfig {
  if (
    settings == null ||
    settings.compilationDatabase == null ||
    settings.compilationDatabase.file == null
  ) {
    return {hasCompilationDb: false, defaultFlags: getDefaultFlags()};
  }
  const compilationDb = settings.compilationDatabase.file;
  const flagsFile = resolveFlagsFile(
    compilationDb,
    settings.compilationDatabase.flagsFile,
  );
  return {
    hasCompilationDb: true,
    compilationDb,
    flagsFile,
  };
}

export async function getCqueryProjectConfig(
  path: string,
): Promise<CqueryProjectConfig> {
  const settings = await getClangRequestSettings(path);
  const projectRoot = getProjectRootFromClangRequestSettingsOrAtom(
    settings,
    path,
  );
  const compilationDbAndFlags = getCompilationDbAndFlagsFileFromClangRequestSettings(
    settings,
  );
  // We have to do this because flow needs a path in the AST that leads to
  // true/false values for the hasCompilationDb flag.
  return compilationDbAndFlags.hasCompilationDb
    ? {...compilationDbAndFlags, projectRoot}
    : {...compilationDbAndFlags, projectRoot};
}
