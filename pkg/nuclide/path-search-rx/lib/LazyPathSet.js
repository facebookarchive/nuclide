'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {array} from '../../commons';
import type {QueryScore} from './QueryScore';
import {enumerateAllCombinations, intersectMany} from './pathSetLogic';
import {Observable} from 'rx';
type Path = string;
type PathSegment = string;
type PathSet = Set<Path>;
type PathSetIndex = {
  segments: Map<PathSegment, PathSet>,
  filenames: Map<PathSegment, PathSet>,
};

const MAX_RESULTS_COUNT = 25;

function findIn(query: string, corpus: Iterator<string>): Array<string> {
  const results = [];
  for (const str of corpus) {
    if (str.indexOf(query) !== -1) {
      results.push(str);
    }
  }
  return results;
}

const SPLIT_CHARS = /[\/\s]/;
const ONLY_NON_ALPHANUMERIC_CHARS = /^[\W]*$/;
function splitFilePath(path: string): {last: PathSegment; paths: Array<PathSegment>;} {
  const split = path.split(SPLIT_CHARS).filter(p => !p.match(ONLY_NON_ALPHANUMERIC_CHARS));
  return {
    last: split.pop(),
    paths: split,
  };
}

function splitQuery(query: string): Array<string> {
  return query.split(SPLIT_CHARS).filter(segment => !segment.match(ONLY_NON_ALPHANUMERIC_CHARS));
}

function approximateMatchIndicesFor(
  query: string,
  path: string,
  matchedSegments: Array<string>, // assumed to be lowercase path segments.
): Array<number> {
  const matchedIndices = new Set();
  // Add indices of matched segments
  for (const segment of matchedSegments) {
    const startIndex = path.toLowerCase().indexOf(segment);
    for (let index = startIndex; index < startIndex + segment.length; index++) {
      matchedIndices.add(index);
    }
  }
  return array.from(matchedIndices);
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

  doQuery(query: string): Observable<QueryScore> {
    const results: Map<Path, QueryScore> = new Map();

    const querySegmentsToMatch: Set<PathSegment> = new Set(splitQuery(query.toLowerCase()));
    const matchedQuerySegments: Map<PathSegment, Array<Set<Path>>> = new Map();

    // Try to match segments directly.
    for (const segment of querySegmentsToMatch) {
      const candidate = this._index.segments.get(segment);
      if (candidate != null) {
        // It is safe to delete the current element while iterating using Iterators.
        querySegmentsToMatch.delete(segment);
        matchedQuerySegments.set(segment, [candidate]);
      }
    }

    // Try to match remaining segments fuzzily.
    for (const segment of querySegmentsToMatch) {
      const matches = findIn(segment, this._index.segments.keys());
      if (matches.length > 0) {
        querySegmentsToMatch.delete(segment);
        // TODO consider the remaining matchedSegments
        matchedQuerySegments.set(
          segment,
          matches.map(
            match => this._index.segments.get(match) || new Set()
          )
        );
      }
    }

    if (matchedQuerySegments.size > 0) {//TODO fix this `if`
      const pathSets: Array<Set<Path>> = [];
      for (const matchedSegments of matchedQuerySegments.values()) {
        // TODO consider the remaining matchedSegments
        pathSets.push(matchedSegments[0]);
      }
      // Smaller candidate sets are likely more entropic, so consider them first.
      pathSets.sort((s1, s2) => s1.size - s2.size);
      const setsToIntersect = enumerateAllCombinations(pathSets);

      const unmatchedREs = [];
      for (const unmatchedSegment of querySegmentsToMatch) {
        unmatchedREs.push(new RegExp(unmatchedSegment.split('').join('.*?'), 'i'));
      }

      for (const combination of setsToIntersect) {
        const intersectionOfMatchedSegments = intersectMany(combination);
        for (const potentialMatch of intersectionOfMatchedSegments) {

          if (
            !results.has(potentialMatch) &&
            (unmatchedREs.length === 0 || unmatchedREs.every(re => re.test(potentialMatch)))
          ) {
            results.set(
              potentialMatch,
              {
                value: potentialMatch,
                score: 0,
                matchIndexes: approximateMatchIndicesFor(
                  query,
                  potentialMatch,
                  array.from(matchedQuerySegments.keys())
                    .filter(segment => potentialMatch.toLowerCase().indexOf(segment) !== -1)
                ),
              }
            );
          }
          if (results.size >= MAX_RESULTS_COUNT) {
            break;
          }
        }
        if (results.size >= MAX_RESULTS_COUNT) {
          break;
        }
      }
    }

    return Observable.from(results.values());// TODO stream results as they appear.
  }

}

export const __test__ = {
  approximateMatchIndicesFor,
};
