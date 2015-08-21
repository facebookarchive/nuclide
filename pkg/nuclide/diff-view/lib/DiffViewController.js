'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HgRepositoryClient} from 'nuclide-hg-repository-client';

type DiffViewState = {
  oldText: string;
  newText: string;
};

type TextDiff = {
  addedLines: Array<number>;
  removedLines: Array<number>;
  oldLineOffsets: {[lineNumber: string]: number};
  newLineOffsets: {[lineNumber: string]: number};
};

type DiffChunk = {
  addedLines: Array<number>;
  removedLines: Array<number>;
  chunks: Array<any>;
};

async function fetchHgDiff(filePath: string): Promise<DiffViewState> {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which is another round-trip and calls the repository providers to get an existing repository.
  // Instead, the first match of the filtering here is the only possible match.
  var {repositoryForPath} = require('nuclide-hg-git-bridge');
  var repository: HgRepositoryClient = repositoryForPath(filePath);

  if (!repository || repository.getType() !== 'hg') {
    var type = repository ? repository.getType() : 'no repository';
    throw new Error(`Diff view only supports hg repositories right now: found ${type}` );
  }
  var committedContents = await repository.fetchFileContentAtRevision(filePath);

  var {getClient} = require('nuclide-client');
  var {getPath} = require('nuclide-remote-uri');

  var client = getClient(filePath);
  if (!client) {
    throw new Error('Nuclide client not found.');
  }
  var localFilePath = getPath(filePath);
  var filesystemContents = await client.readFile(localFilePath, 'utf8');

  return {
    oldText: committedContents,
    newText: filesystemContents,
  };
}

async function fetchInlineComponents(uiProviders: Array<Object>, filePath: string): Promise<Array<Object>> {
  var uiElementPromises = uiProviders.map(provider => provider.composeUiElements(filePath));
  var uiComponentLists = await Promise.all(uiElementPromises);
  // Flatten uiComponentLists from list of lists of components to a list of components.
  var uiComponents = [].concat.apply([], uiComponentLists);
  return uiComponents;
}

function computeDiff(oldText: string, newText: string): TextDiff {
  var {addedLines, removedLines, chunks} = _computeDiffChunks(oldText, newText);
  var {oldLineOffsets, newLineOffsets} = _computeOffsets(chunks);

  return {
    addedLines,
    removedLines,
    oldLineOffsets,
    newLineOffsets,
  };
}

function _computeDiffChunks(oldText: string, newText: string): DiffChunk {

  var JsDiff = require('diff');

  // If the last line has changes, JsDiff doesn't return that.
  // Generally, content with new line ending are easier to calculate offsets for.
  if (oldText[oldText.length - 1] !== '\n' || newText[newText.length - 1] !== '\n') {
    oldText += '\n';
    newText += '\n';
  }

  var lineDiff = JsDiff.diffLines(oldText, newText);
  var chunks = [];

  var addedCount = 0;
  var removedCount = 0;
  var nextOffset = 0;
  var offset = 0;

  var addedLines = [];
  var removedLines = [];
  lineDiff.forEach(part => {
    var {added, removed, value} = part;
    var count = value.split('\n').length - 1;
    if (!added && !removed) {
      addedCount += count;
      removedCount += count;
      offset = nextOffset;
      nextOffset = 0;
    } else if (added) {
      for (var i = 0; i < count; i++) {
        addedLines.push(addedCount + i);
      }
      addedCount += count;
      nextOffset += count;
    } else {
      for (var i = 0; i < count; i++) {
        removedLines.push(removedCount + i);
      }
      removedCount += count;
      nextOffset -= count;
    }
    chunks.push({added, removed, value, count, offset});
    offset = 0;
  });
  return {addedLines, removedLines, chunks};
}

function _computeOffsets(diffChunks: Array<any>): {oldLineOffsets: any; newLineOffsets: any;} {
  var newLineOffsets = {};
  var oldLineOffsets = {};

  var oldLineCount = 0;
  var newLineCount = 0;

  for (var chunk of diffChunks) {
    var {added, removed, offset, count} = chunk;
    if (added) {
      newLineCount += count;
    } else if (removed) {
      oldLineCount += count;
    } else {
      if (offset < 0) {
        // Non zero offset implies this block is neither a removal or an addition,
        // and is thus equal in both versions of the document.
        // Sign of offset indicates which version of document requires the offset
        // (negative -> old version, positive -> new version).
        // Magnitude of offset indicates the number of lines of offset required for respective version.
        newLineOffsets[newLineCount] = offset * -1;
      } else if (offset > 0) {
        oldLineOffsets[oldLineCount] = offset;
      }
      newLineCount += count;
      oldLineCount += count;
    }
  }

  return {
    oldLineOffsets,
    newLineOffsets,
  };
}

module.exports = {
  fetchHgDiff,
  fetchInlineComponents,
  computeDiff,
};
