'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

import invariant from 'assert';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';
import nuclideUri from '../../nuclide-remote-uri';

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
  static async find(
    filePath: NuclideUri,
  ): Promise<{relatedFiles: Array<string>; index: number}> {
    const dirName = nuclideUri.dirname(filePath);
    const prefix = getPrefix(filePath);

    const service = getServiceByNuclideUri('FileSystemService', filePath);
    invariant(service);
    const listing = await service.readdir(nuclideUri.getPath(dirName));
    const relatedFiles = listing
      .filter(otherFilePath => {
        return otherFilePath.stats.isFile() && !otherFilePath.file.endsWith('~') &&
          getPrefix(otherFilePath.file) === prefix;
      })
      .map(otherFilePath => nuclideUri.join(dirName, otherFilePath.file))
      .sort();

    return {
      relatedFiles,
      index: relatedFiles.indexOf(filePath),
    };
  }
}

function getPrefix(filePath: NuclideUri): string {
  let base = nuclideUri.basename(filePath);
  // Strip off the extension.
  const pos = base.lastIndexOf('.');
  if (pos !== -1) {
    base = base.substring(0, pos);
  }
  // In Objective-C we often have the X + XInternal.h for implementation methods.
  // Similarly, C++ users often use X.h + X-inl.h.
  return base.replace(/(Internal|-inl)$/, '');
}
