'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class ClangService {
  compile(
    src: NuclideUri,
    contents: string
  ): Promise<{
    diagnostics: Array<{
      spelling: string;
      severity: number;
      location: {
        column: number;
        file: NuclideUri;
        line: number;
      };
      ranges: any;
    }>
  }> {
    return Promise.reject('Not implemented');
  }

  getCompletions(src: NuclideUri, contents: string, line: number, column: number,
      tokenStartColumn: number, prefix: string): Promise<any> {
    return Promise.reject('Not implemented');
  }

  getDeclaration(src: NuclideUri, contents: string, line: number, column: number
      ): Promise<?{file: NuclideUri; line: number; column: number; spelling: string;}> {
    return Promise.reject('Not implemented');
  }

  getDeclarationInfo(
    src: NuclideUri,
    contents: string,
    line: number,
    column: number
  ): Promise<?{file: NuclideUri; line: number; column: number; info: Array<Declaration>}> {
    return Promise.reject('Not implemented');
  }
}

module.exports = ClangService;
