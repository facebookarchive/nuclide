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
  FileReferences,
  Location,
  NuclideUri,
  Reference,
  ReferenceGroup,
} from './types';

type FindReferencesOptions = {
  // Lines of context to show around each preview block. Defaults to 1.
  previewContext?: number;
};

var {getLogger} = require('nuclide-logging');
var {getFileSystemServiceByNuclideUri} = require('nuclide-client');
var {getPath} = require('nuclide-remote-uri');

var FRAGMENT_GRAMMARS = {
  'text.html.hack': 'source.hackfragment',
  'text.html.php': 'source.hackfragment',
};

function compareLocation(x: Location, y: Location): number {
  var lineDiff = x.line - y.line;
  if (lineDiff) {
    return lineDiff;
  }
  return x.column - y.column;
}

function compareReference(x: Reference, y: Reference): number {
  return compareLocation(x.start, y.start) || compareLocation(x.end, y.end);
}

async function readFileContents(uri: NuclideUri): Promise<?string> {
  var localPath = getPath(uri);
  try {
    var contents =
        (await getFileSystemServiceByNuclideUri(uri).readFile(localPath)).toString('utf8');
  } catch (e) {
    getLogger().error(`find-references: could not load file ${uri}`, e);
    return null;
  }
  return contents;
}

function addReferenceGroup(
  groups: Array<ReferenceGroup>,
  references: Array<Reference>,
  startLine: number,
  endLine: number
) {
  if (references.length) {
    groups.push({references, startLine, endLine});
  }
}

class FindReferencesModel {
  _basePath: NuclideUri;
  _symbolName: string;
  _references: Array<[string, Array<ReferenceGroup>]>;
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

    this._groupReferencesByFile(references);
  }

  /**
   * The main public entry point.
   * Returns a list of references, grouped by file (with previews),
   * according to the given offset and limit.
   * References in each file are grouped together if they're adjacent.
   */
  async getFileReferences(
    offset: number,
    limit: number
  ): Promise<Array<FileReferences>> {
    var fileReferences: Array<?FileReferences> = await Promise.all(
      this._references.slice(offset, offset + limit).map(
        this._makeFileReferences.bind(this)
      )
    );
    /* $FlowFixMe - need array compact function */
    return fileReferences.filter(x => !!x);
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

  getFileCount(): number {
    return this._references.length;
  }

  getPreviewContext(): number {
    return this._options.previewContext || 1;
  }

  _groupReferencesByFile(references: Array<Reference>): void {
    // 1. Group references by file.
    var refsByFile = new Map();
    for (var reference of references) {
      var fileReferences = refsByFile.get(reference.uri);
      if (fileReferences == null) {
        refsByFile.set(reference.uri, fileReferences = []);
      }
      fileReferences.push(reference);
    }

    // 2. Group references within each file.
    this._references = [];
    for (var entry of refsByFile) {
      var [fileUri, references] = entry;
      references.sort(compareReference);
      // Group references that are <= 1 line apart together.
      var groups = [];
      var curGroup = [];
      var curStartLine = -11;
      var curEndLine = -11;
      for (var ref of references) {
        if (ref.start.line <= curEndLine + 1 + this.getPreviewContext()) {
          curGroup.push(ref);
          curEndLine = Math.max(curEndLine, ref.end.line);
        } else {
          addReferenceGroup(groups, curGroup, curStartLine, curEndLine);
          curGroup = [ref];
          curStartLine = ref.start.line;
          curEndLine = ref.end.line;
        }
      }
      addReferenceGroup(groups, curGroup, curStartLine, curEndLine);
      this._references.push([fileUri, groups]);
    }

    // Finally, sort by file name.
    this._references.sort((x, y) => x[0].localeCompare(y[0]));
  }

  /**
   * Fetch file previews and expand line ranges with context.
   */
  async _makeFileReferences(
    fileReferences: [string, Array<ReferenceGroup>]
  ): Promise<?FileReferences> {
    var [uri, refGroups] = fileReferences;
    var fileContents = await readFileContents(uri);
    if (!fileContents) {
      return null;
    }
    var fileLines = fileContents.split('\n');
    var previewText = [];
    refGroups = refGroups.map(group => {
      var {references, startLine, endLine} = group;
      // Expand start/end lines with context.
      startLine = Math.max(startLine - this.getPreviewContext(), 1);
      endLine = Math.min(endLine + this.getPreviewContext(), fileLines.length);
      // However, don't include blank lines.
      while (startLine < endLine && fileLines[startLine - 1] === '') {
        startLine++;
      }
      while (startLine < endLine && fileLines[endLine - 1] === '') {
        endLine--;
      }

      previewText.push(fileLines.slice(startLine - 1, endLine).join('\n'));
      return {references, startLine, endLine};
    });
    var grammar = atom.grammars.selectGrammar(uri, fileContents);
    var fragmentGrammar = FRAGMENT_GRAMMARS[grammar.scopeName];
    if (fragmentGrammar) {
      grammar = atom.grammars.grammarForScopeName(fragmentGrammar) || grammar;
    }
    return {
      uri,
      grammar,
      previewText,
      refGroups,
    };
  }

}

module.exports = FindReferencesModel;
