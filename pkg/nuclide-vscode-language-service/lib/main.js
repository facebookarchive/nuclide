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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {CategoryLogger} from '../../nuclide-logging';
import type {
  HostServices,
} from '../../nuclide-language-service-rpc/lib/rpc-types';

import {FileCache} from '../../nuclide-open-files-rpc';
import {LspLanguageService} from './LspLanguageService';
import {
  MultiProjectLanguageService,
  forkHostServices,
} from '../../nuclide-language-service-rpc';

export function createMultiLspLanguageService(
  logger: CategoryLogger,
  fileCache: FileCache,
  host: HostServices,
  consoleSource: string,
  command: string,
  args: Array<string>,
  projectFileName: string,
  fileExtensions: Array<NuclideUri>,
): MultiProjectLanguageService<LspLanguageService> {
  const languageServiceFactory = async (projectDir: string) => {
    const lsp = new LspLanguageService(
      logger,
      fileCache,
      (await forkHostServices(host, logger)),
      consoleSource,
      command,
      args,
      projectDir,
      fileExtensions,
    );
    await lsp._ensureProcess();
    return lsp;
  };

  return new MultiProjectLanguageService(
    logger,
    fileCache,
    host,
    projectFileName,
    fileExtensions,
    languageServiceFactory,
  );
}
