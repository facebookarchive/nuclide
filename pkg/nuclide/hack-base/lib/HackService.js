'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {callHHClient} from './HackHelpers';
import type {
  HackDiagnosticsResult,
  HackDiagnostic,
  HackCompletionsResult,
  HackCompletion
} from './types';

import type {NuclideUri} from 'nuclide-remote-uri';

export async function getDiagnostics(
  file: NuclideUri,
  currentContents?: string
): Promise<?HackDiagnosticsResult> {
  var hhResult = await callHHClient(
    /*args*/ [],
    /*errorStream*/ true,
    /*outputJson*/ true,
    /*processInput*/ null,
    /*file*/ file,
  );
  if (!hhResult) {
    return null;
  }
  var {hackRoot, result} = hhResult;
  var messages = ((result.errors: any): Array<HackDiagnostic>);
  return {
    hackRoot,
    messages,
  };
}

export async function getCompletions(
  file: NuclideUri,
  markedContents: string
): Promise<?HackCompletionsResult> {
  var hhResult = await callHHClient(
    /*args*/ ['--auto-complete'],
    /*errorStream*/ false,
    /*outputJson*/ true,
    /*processInput*/ markedContents,
    /*file*/ file,
  );
  if (!hhResult) {
    return null;
  }
  var {hackRoot, result} = hhResult;
  var completions = ((result : any): Array<HackCompletion>);
  return {
    hackRoot,
    completions,
  };
}
