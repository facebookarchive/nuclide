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

/**
 * Search all subdirectories of the header file for a source file that includes it.
 * We handle the two most common types of include statements:
 *
 * 1) Includes relative to the project root (if supplied); e.g. #include <a/b.h>
 * 2) Includes relative to the source file; e.g. #include "../../a.h"
 *
 * Note that we use an Observable here to enable cancellation.
 * The resulting Observable fires and completes as soon as a matching file is found;
 * 'null' will always be emitted if no results are found.
 */
import nuclideUri from 'nuclide-commons/nuclideUri';
import {observeProcess} from 'nuclide-commons/process';
import {Observable} from 'rxjs';
import {track} from '../../../nuclide-analytics';
import {isSourceFile} from '../utils';
import escapeStringRegExp from 'escape-string-regexp';
import {findSubArrayIndex} from './common';
import {getLogger} from 'log4js';

const logger = getLogger('nuclide-clang-rpc');

const INCLUDE_SEARCH_TIMEOUT = 15000;

export function findIncludingSourceFile(
  headerFile: string,
  projectRoot: string,
): Observable<?string> {
  return _findIncludingSourceFile(headerFile, projectRoot)
    .timeout(INCLUDE_SEARCH_TIMEOUT)
    .catch(e => {
      track('nuclide-clang-rpc.source-to-header.grep-error', {
        header: headerFile,
        projectRoot,
        error: e.toString(),
      });
      return Observable.of(null);
    });
}

function getFBProjectRoots(): string[] {
  try {
    // $FlowFB
    return require('./fb-project-roots').getFBProjectRoots();
  } catch (e) {}
  return [];
}

export function getSearchFolder(projectRoot: string, header: string): string {
  const roots = getFBProjectRoots();
  // if the projectRoot is a fb root, then search in the first subdirectory,
  // using the whole root is too expensive and might timeout
  if (roots.some(root => projectRoot.endsWith(root))) {
    const headerParts = nuclideUri.split(header);
    for (const root of roots) {
      const rootParts = nuclideUri.split(root);
      const offset = findSubArrayIndex(headerParts, rootParts);
      if (offset !== -1) {
        return nuclideUri.join(
          ...headerParts.slice(0, offset + rootParts.length + 1),
        );
      }
    }
  }
  return projectRoot;
}

function _findIncludingSourceFile(
  header: string,
  projectRoot: string,
): Observable<?string> {
  const basename = escapeStringRegExp(nuclideUri.basename(header));
  const relativePath = escapeStringRegExp(
    nuclideUri.relative(projectRoot, header),
  );
  const pattern = `^\\s*#include\\s+["<](${relativePath}|(../)*${basename})[">]\\s*$`;
  const regex = new RegExp(pattern);
  // We need both the file and the match to verify relative includes.
  // Relative includes may not always be correct, so we may have to go through all the results.
  // TODO(wallace): use rg
  return observeProcess(
    'grep',
    [
      '-RE', // recursive, extended
      '--null', // separate file/match with \0
      pattern,
      getSearchFolder(projectRoot, header),
    ],
    {/* TODO(T17353599) */ isExitError: () => false},
  )
    .catch(error => Observable.of({kind: 'error', error})) // TODO(T17463635)
    .flatMap(message => {
      switch (message.kind) {
        case 'stdout':
          const file = processGrepResult(message.data, header, regex);
          return file == null || !isSourceFile(file)
            ? Observable.empty()
            : Observable.of(file);
        case 'error':
          throw new Error(String(message.error));
        case 'exit':
          return Observable.of(null);
        default:
          return Observable.empty();
      }
    })
    .do(file => logger.info('found source file by grepping', file))
    .take(1);
}

function processGrepResult(
  result: string,
  headerFile: string,
  includeRegex: RegExp,
): ?string {
  const splitIndex = result.indexOf('\0');
  if (splitIndex === -1) {
    return null;
  }
  const filename = result.substr(0, splitIndex);
  if (!isSourceFile(filename)) {
    return null;
  }
  const match = includeRegex.exec(result.substr(splitIndex + 1));
  if (match == null) {
    return null;
  }
  // Source-relative includes have to be verified.
  // Relative paths will match the (../)* rule (at index 2).
  if (match[2] != null) {
    const includePath = nuclideUri.normalize(
      nuclideUri.join(nuclideUri.dirname(filename), match[1]),
    );
    if (includePath !== headerFile) {
      return null;
    }
  }
  return filename;
}
