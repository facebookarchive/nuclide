/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {CategoryLogger} from '../../nuclide-logging';

import {
  FileCache,
} from '../../nuclide-open-files-rpc';
import {LanguageServerProtocolProcess} from './process';
import {MultiProjectLanguageService} from '../../nuclide-language-service-rpc';
import {createProcessStream} from '../../commons-node/process';

export class PerConnectionLanguageService extends MultiProjectLanguageService {
  constructor(
    logger: CategoryLogger,
    fileCache: FileCache,
    command: string,
    args: Array<string>,
    projectFileName: string,
    fileExtensions: Array<NuclideUri>,
  ) {
    const languageServiceFactory = (projectDir: string) => {
      return LanguageServerProtocolProcess.create(
        logger,
        fileCache,
        () => {
          logger.logInfo(`PerConnectionLanguageService launch: ${command} ${args.join(' ')}`);
          // TODO: This should be cancelable/killable.
          const processStream = createProcessStream(command, args).publish(); // TODO: current dir?
          const processPromise = processStream.take(1).toPromise();
          processStream.connect();
          return processPromise;
        },
        projectDir,
        fileExtensions,
      );
    };
    super(logger, fileCache, projectFileName, fileExtensions, languageServiceFactory);
  }
}
