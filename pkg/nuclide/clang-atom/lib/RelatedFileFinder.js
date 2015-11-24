'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const fs = require('fs');
const path = require('path');

module.exports =
/**
 * Finds related files, to be used in `JumpToRelatedFile`.
 *
 * Files are related if they have the same filename but different extension,
 * or if the filename is appended with `Internal`. For example, these files
 * would all be related: `Foo.h`, `Foo.m`, `FooInternal.h`
 *
 * For now, we only search in the given path's directory for related files.
 */
class RelatedFileFinder {

  /**
   * Returns the related files and the given file's index in that array.
   * The given file must be in the related files array.
   * @param filePath The filepath for which to get related files.
   * @return The related files and the given path's index into it.
   */
  find(filePath: string): {relatedFiles: Array<string>; index: number} {
    const dirname = path.dirname(filePath);
    const prefix = this._getPrefix(filePath);

    const relatedFiles = fs.readdirSync(dirname)
        .filter((otherFilePath) => this._getPrefix(otherFilePath) === prefix)
        .map((otherFilePath) => path.join(dirname, otherFilePath))
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

  _getPrefix(filePath: string) {
    const extname = path.extname(filePath);
    const basename = path.basename(filePath, extname);
    return basename.replace(/Internal$/, '');
  }

}
