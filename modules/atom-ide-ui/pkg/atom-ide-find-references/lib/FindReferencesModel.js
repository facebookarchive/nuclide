'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let readFileContents = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (uri) {
    try {
      const file = (0, (_projects || _load_projects()).getFileForPath)(uri);
      if (file != null) {
        return yield file.read();
      }
    } catch (e) {
      (0, (_log4js || _load_log4js()).getLogger)('atom-ide-find-references').error(`find-references: could not load file ${uri}`, e);
    }
    return null;
  });

  return function readFileContents(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FRAGMENT_GRAMMARS = {
  'text.html.hack': 'source.hackfragment',
  'text.html.php': 'source.hackfragment'
}; /**
    * Copyright (c) 2017-present, Facebook, Inc.
    * All rights reserved.
    *
    * This source code is licensed under the BSD-style license found in the
    * LICENSE file in the root directory of this source tree. An additional grant
    * of patent rights can be found in the PATENTS file in the same directory.
    *
    * 
    * @format
    */

function compareReference(x, y) {
  return x.range.compare(y.range);
}

function addReferenceGroup(groups, references, startLine, endLine) {
  if (references.length) {
    groups.push({ references, startLine, endLine });
  }
}

class FindReferencesModel {

  /**
   * @param basePath    Base path of the project. Used to display paths in a friendly way.
   * @param symbolName  The name of the symbol we're finding references for.
   * @param references  A list of references to `symbolName`.
   * @param options     See `FindReferencesOptions`.
   */
  constructor(basePath, symbolName, references, options) {
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
  getFileReferences(offset, limit) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const fileReferences = yield Promise.all(_this._references.slice(offset, offset + limit).map(_this._makeFileReferences.bind(_this)));
      return (0, (_collection || _load_collection()).arrayCompact)(fileReferences);
    })();
  }

  getBasePath() {
    return this._basePath;
  }

  getSymbolName() {
    return this._symbolName;
  }

  getReferenceCount() {
    return this._referenceCount;
  }

  getFileCount() {
    return this._references.length;
  }

  getPreviewContext() {
    // flowlint-next-line sketchy-null-number:off
    return this._options.previewContext || 1;
  }

  _groupReferencesByFile(references) {
    // 1. Group references by file.
    const refsByFile = new Map();
    for (const reference of references) {
      let fileReferences = refsByFile.get(reference.uri);
      if (fileReferences == null) {
        refsByFile.set(reference.uri, fileReferences = []);
      }
      fileReferences.push(reference);
    }

    // 2. Group references within each file.
    this._references = [];
    for (const entry of refsByFile) {
      const [fileUri, entryReferences] = entry;
      entryReferences.sort(compareReference);
      // Group references that are <= 1 line apart together.
      const groups = [];
      let curGroup = [];
      let curStartLine = -11;
      let curEndLine = -11;
      for (const ref of entryReferences) {
        const range = ref.range;
        if (range.start.row <= curEndLine + 1 + this.getPreviewContext()) {
          // Remove references with the same range (happens in C++ with templates)
          if (curGroup.length > 0 && compareReference(curGroup[curGroup.length - 1], ref) !== 0) {
            curGroup.push(ref);
            curEndLine = Math.max(curEndLine, range.end.row);
          } else {
            this._referenceCount--;
          }
        } else {
          addReferenceGroup(groups, curGroup, curStartLine, curEndLine);
          curGroup = [ref];
          curStartLine = range.start.row;
          curEndLine = range.end.row;
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
  _makeFileReferences(fileReferences) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const uri = fileReferences[0];
      let refGroups = fileReferences[1];
      const fileContents = yield readFileContents(uri);
      // flowlint-next-line sketchy-null-string:off
      if (!fileContents) {
        return null;
      }
      const fileLines = fileContents.split('\n');
      const previewText = [];
      refGroups = refGroups.map(function (group) {
        const { references } = group;
        let { startLine, endLine } = group;
        // Expand start/end lines with context.
        startLine = Math.max(startLine - _this2.getPreviewContext(), 0);
        endLine = Math.min(endLine + _this2.getPreviewContext(), fileLines.length - 1);
        // However, don't include blank lines.
        while (startLine < endLine && fileLines[startLine] === '') {
          startLine++;
        }
        while (startLine < endLine && fileLines[endLine] === '') {
          endLine--;
        }

        previewText.push(fileLines.slice(startLine, endLine + 1).join('\n'));
        return { references, startLine, endLine };
      });
      let grammar = atom.grammars.selectGrammar(uri, fileContents);
      const fragmentGrammar = FRAGMENT_GRAMMARS[grammar.scopeName];
      if (fragmentGrammar) {
        grammar = atom.grammars.grammarForScopeName(fragmentGrammar) || grammar;
      }
      return {
        uri,
        grammar,
        previewText,
        refGroups
      };
    })();
  }
}
exports.default = FindReferencesModel;