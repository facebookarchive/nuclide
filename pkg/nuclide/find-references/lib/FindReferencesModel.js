'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NuclideUri,
  Reference
} from './types';

type FindReferencesOptions = {
  // Lines of context to show around each preview block. Defaults to 1
  previewContext?: number;
};

class FindReferencesModel {

  _basePath: NuclideUri;
  _symbolName: string;
  _referenceCount: number;
  _options: FindReferencesOptions;

  /**
   * @param basePath    Base path of the project. Used to display paths in a friendly way.
   * @param symbolName  The name of the symbol we're finding references for.
   * @param references  A list of references to `symbolName`.
   * @param options     See `FindReferencesOptions`.
   */
  constructor(
    basePath: NuclideUri,
    symbolName: string,
    references: Array<Reference>,
    options?: FindReferencesOptions
  ) {
    this._basePath = basePath;
    this._symbolName = symbolName;
    this._referenceCount = references.length;
    this._options = options || {};
  }

  getBasePath(): NuclideUri {
    return this._basePath;
  }

  getSymbolName(): string {
    return this._symbolName;
  }

  getReferenceCount(): number {
    return this._referenceCount;
  }

  getPreviewContext(): ?number {
    return this._options.previewContext || 1;
  }

}

module.exports = FindReferencesModel;
