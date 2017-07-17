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

import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {HostServices} from '../../nuclide-language-service-rpc/lib/rpc-types';
import type {LanguageService} from '../../nuclide-language-service/lib/LanguageService';

import invariant from 'assert';

import passesGK from '../../commons-node/passesGK';
import {FileCache} from '../../nuclide-open-files-rpc';
import type {FileNotifier} from '../../nuclide-open-files-rpc/lib/rpc-types';
import {createMultiLspLanguageService} from '../../nuclide-vscode-language-service';
import {getLogger} from 'log4js';

export async function getUseLspConnection(): Promise<boolean> {
  return passesGK('nuclide_ocaml_lsp');
}

const logger = getLogger('OCamlService');

export async function initializeLsp(
  command: string,
  args: Array<string>,
  projectFileName: string,
  fileExtensions: Array<NuclideUri>,
  logLevel: LogLevel,
  fileNotifier: FileNotifier,
  host: HostServices,
): Promise<LanguageService> {
  invariant(fileNotifier instanceof FileCache);
  logger.setLevel(logLevel);
  return createMultiLspLanguageService(
    logger,
    fileNotifier,
    host,
    'ocaml',
    command,
    args,
    {},
    projectFileName,
    fileExtensions,
    {
      codelens: {
        unicode: true,
      },
      debounce: {
        linter: 500,
      },
      path: {
        ocamlfind: 'ocamlfind',
        ocamlmerlin: 'ocamlmerlin',
        opam: 'opam',
        rebuild: 'rebuild',
        refmt: 'refmt',
        refmterr: 'refmterr',
        rtop: 'rtop',
      },
      server: {
        languages: ['ocaml'],
      },
    },
  );
}
