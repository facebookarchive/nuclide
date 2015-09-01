'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from 'nuclide-remote-uri';

// Diagnostic information, returned from findDiagnostics.
export type Diagnostics = {
  // The location of the .flowconfig where these messages came from.
  flowRoot: NuclideUri,
  messages: Array<Diagnostic>,
};

/* Each error or warning can consist of any number of different messages from
 * Flow to help explain the problem and point to different locations that may be
 * of interest. */
export type Diagnostic = Array<SingleMessage>;

export type SingleMessage = {
  path: NuclideUri;
  descr: string;
  code: number;
  line: number;
  endline: number;
  start: number;
  end: number;
}

class FlowService {

  findDefinition(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number
  ): Promise<?{file:NuclideUri; line:number; column:number}> {
    return Promise.reject('Not implemented');
  }
  dispose(): Promise<void> {
    return Promise.reject('Not implemented');
  }

  findDiagnostics(
    file: NuclideUri,
    currentContents: ?string
  ): Promise<?{
      flowRoot: NuclideUri;
      messages:
        Array<Array<{
          path: NuclideUri;
          descr: string;
          code: number;
          line: number;
          endline: number;
          start: number;
          end: number;
        }>>
    }>
  /* Ideally, this would just be Promise<Diagnostics>, but the service
   * framework doesn't pick up on NuclideUri if it's embedded in a type defined
   * elsewhere. */
  {
    return Promise.reject('Not implemented');
  }

  getAutocompleteSuggestions(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number,
    prefix: string
  ): Promise<any> {
    return Promise.reject('Not implemented');
  }

  getType(
    file: NuclideUri,
    currentContents: string,
    line: number,
    column: number
  ): Promise<?string> {
    return Promise.reject('Not implemented');
  }
}

module.exports = FlowService;
