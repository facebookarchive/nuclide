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

import nuclideUri from 'nuclide-commons/nuclideUri';
import {getFileBasename, isHeaderFile, isSourceFile} from '../utils';
import {searchFileWithBasename, findSubArrayIndex} from './common';
import {
  getRelatedHeaderForSourceFromFramework,
  getRelatedSourceForHeaderFromFramework,
} from './objc-framework';
import {findIncludingSourceFile} from './grep-finder';

export class RelatedFileFinder {
  async getRelatedHeaderForSource(src: string): Promise<?string> {
    // search in folder
    const header = await searchFileWithBasename(
      nuclideUri.dirname(src),
      getFileBasename(src),
      isHeaderFile,
    );
    if (header != null) {
      return header;
    }
    // special case for obj-c frameworks
    return getRelatedHeaderForSourceFromFramework(src);
  }

  async getRelatedSourceForHeader(
    header: string,
    projectRoot: ?string,
  ): Promise<?string> {
    // search in folder
    let source = await searchFileWithBasename(
      nuclideUri.dirname(header),
      getFileBasename(header),
      isSourceFile,
    );
    if (source != null) {
      return source;
    }
    // special case for obj-c frameworks
    source = await getRelatedSourceForHeaderFromFramework(header);
    if (source != null) {
      return source;
    }

    if (projectRoot != null) {
      source = await findIncludingSourceFile(header, projectRoot).toPromise();
      if (source != null) {
        return source;
      }
    }

    return findIncludingSourceFile(
      header,
      this._inferProjectRoot(header),
    ).toPromise();
  }

  _getProjectRoots(): string[] {
    try {
      // $FlowFB
      return require('./fb-project-roots').getFBProjectRoots();
    } catch (e) {}
    return [];
  }

  /**
   * Given a file path, find out from the list of registered hardcoded project
   * roots which one is part of it and use it as project root. Otherwise, this
   * uses the file's parent dir as fallback.
   */
  _inferProjectRoot(file: string): string {
    const pathParts = nuclideUri.split(file);
    for (const root of this._getProjectRoots()) {
      const offset = findSubArrayIndex(pathParts, nuclideUri.split(root));
      if (offset !== -1) {
        return nuclideUri.join(...pathParts.slice(0, offset), root);
      }
    }
    return nuclideUri.dirname(file);
  }
}
