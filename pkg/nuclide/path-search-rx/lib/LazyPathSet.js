'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type Path = string;
type PathSegment = string;
type PathSet = Set<Path>;
type PathSetIndex = {
  segments: Map<PathSegment, PathSet>,
  filenames: Map<PathSegment, PathSet>,
};

const SPLIT_CHARS = /[\/\s]/;
const ONLY_NON_ALPHANUMERIC_CHARS = /^[\W]*$/;
function splitFilePath(path: string): {last: PathSegment; paths: Array<PathSegment>;} {
  const split = path.split(SPLIT_CHARS).filter(p => !p.match(ONLY_NON_ALPHANUMERIC_CHARS));
  return {
    last: split.pop(),
    paths: split,
  };
}

export default class LazyPathSet {
  _paths: PathSet;
  _index: PathSetIndex;

  constructor(options: {paths?: {[key: string]: boolean}} = {}) {
    const rawPaths = options.paths || {};
    const paths = new Set();
    for (const path in rawPaths) {
      paths.add(path);
    }
    this._paths = paths;
    this._buildIndex();
  }

  // For testing purposes only.
  _getPaths(): PathSet {
    return this._paths;
  }

  // For testing purposes only.
  _getIndex(): PathSetIndex {
    return this._index;
  }

  _buildIndex(): void {
    const segments = new Map();
    const filenames = new Map();
    for (const path of this._paths) {
      const lowercasePath = path.toLowerCase();
      const {paths, last} = splitFilePath(lowercasePath);
      for (const segment of paths) {
        const pathsContainingSegment = segments.get(segment) || new Set();
        pathsContainingSegment.add(path);
        segments.set(segment, pathsContainingSegment);
      }
      const pathsEndingWithFilename = filenames.get(last) || new Set();
      pathsEndingWithFilename.add(path);
      filenames.set(last, pathsEndingWithFilename);
    }

    this._index = {
      segments,
      filenames,
    };
  }
}
