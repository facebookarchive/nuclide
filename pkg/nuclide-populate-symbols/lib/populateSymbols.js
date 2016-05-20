'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline, OutlineTree, OutlineProvider} from '../../nuclide-outline-view';
import type {Result} from '../../commons-atom/ActiveEditorRegistry';
import type {Point} from 'atom';

import {compact, toggle} from '../../commons-node/stream';
import {Observable} from 'rxjs';
import invariant from 'assert';

import {getLogger} from '../../nuclide-logging';
const logger = getLogger();

type SymbolsData = {
  path: string;
  symbols: Array<{name: string; position: Point}>;
};

type AssignmentData = {
  path: string;
  symbols: Array<{name: string; position: Point}>;
  tagsCache: Object;
};

const SYMBOLS_VIEW = 'symbols-view';

export default function populateSymbols(
  configValues: Observable<boolean>,
  resultsStream: Observable<Result<OutlineProvider, ?Outline>>,
): rx$ISubscription {
  return assignmentStream(configValues, resultsStream)
  .subscribe(
    data => {
      try {
        data.tagsCache[data.path] = data.symbols;
      } catch (error) {
        logger.error('Failed to update symbols-view with outlines', error);
      }
    },
    error => {
      logger.error('Failed to update symbols-view with outlines', error);
    },
  );
}

function assignmentStream(
  configValues: Observable<boolean>,
  resultsStream: Observable<Result<OutlineProvider, ?Outline>>,
): Observable<AssignmentData> {
  const assignmentData = resultsStream
    .filter(result => {
      return result.kind === 'result' && result.result != null && result.editor.getPath() != null;
    })
    .map(resultToSymbols)
    .map(symData => {
      const tagsCache = getTagsCache();
      if (tagsCache == null) {
        return null;
      }

      return {...symData, tagsCache};
    });

  return toggle(compact(assignmentData), configValues);
}

function getTagsCache(): ?Object {
  const pkg = atom.packages.getLoadedPackage(SYMBOLS_VIEW);

  if (pkg == null || atom.packages.isPackageDisabled(pkg.name)) {
    return null;
  }

  if (!atom.packages.isPackageActive(pkg.name)) {
    atom.packages.activate(pkg.name);
    if (!atom.packages.isPackageActive(pkg.name)) {
      pkg.activateNow();   // Symbols view does not activate on load
    }
  }

  if (pkg.mainModule.fileView == null) {
    pkg.mainModule.createFileView();
  }

  const fileView = pkg.mainModule.fileView;

  if (!fileView.hasOwnProperty('moveToPosition')) {
    // Unset the beginningOfLine param in moveToPosition
    const prevMoveToPosition = fileView.moveToPosition;
    fileView.moveToPosition = position => prevMoveToPosition.apply(fileView, [position, false]);
  }

  return fileView.cachedTags;
}

function resultToSymbols(result: Result<OutlineProvider, ?Outline>): SymbolsData {
  invariant(result.kind === 'result' && result.result != null);
  const outlineTrees = result.result.outlineTrees;
  const editor = result.editor;

  const symbols = [];
  const traverse = (tree: OutlineTree) => {
    if (tree.representativeName != null) {
      symbols.push({name: tree.representativeName, position: tree.startPosition});
    }

    tree.children.forEach(traverse);
  };

  outlineTrees.forEach(traverse);
  const path = editor.getPath();
  invariant(path);
  return {path, symbols};
}
