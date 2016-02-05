'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

import {getServiceByNuclideUri} from '../../remote-connection';
import {basename, dirname, getPath, join} from '../../remote-uri';

/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal` or `-inl`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`, `Foo-inl.h`
 *
 * For now, we only search in the given path's directory for related files.
 */
export default class RelatedFileFinder {

  /**
   * Returns the related files and the given file's index in that array.
   * The given file must be in the related files array.
   * @param filePath The filepath for which to get related files.
   * @return The related files and the given path's index into it.
   */
  async find(filePath: NuclideUri): Promise<{relatedFiles: Array<string>; index: number}> {
    const dirName = dirname(filePath);
    const prefix = this._getPrefix(filePath);

    const listing = await getServiceByNuclideUri('FileSystemService', filePath)
      .readdir(getPath(dirName));
    const relatedFiles = listing
      .filter(otherFilePath => {
        return otherFilePath.stats.isFile() && this._getPrefix(otherFilePath.file) === prefix;
      })
      .map(otherFilePath => join(dirName, otherFilePath.file))
      .sort();

    const index = relatedFiles.indexOf(filePath);
    if (index === -1) {
      throw new Error('Given path must be in `relatedFiles`: ' + filePath);
    }

    return {
      relatedFiles: relatedFiles,
      index: index,
    };
  }

  _getPrefix(filePath: NuclideUri): string {
    let base = basename(filePath);
    // Strip off the extension.
    const pos = base.lastIndexOf('.');
    if (pos !== -1) {
      base = base.substring(0, pos);
    }
    // In Objective-C we often have the X + XInternal.h for implementation methods.
    // Similarly, C++ users often use X.h + X-inl.h.
    return base.replace(/(Internal|-inl)$/, '');
  }

}
