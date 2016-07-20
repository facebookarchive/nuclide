var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var readFileContents = _asyncToGenerator(function* (uri) {
  var localPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(uri);
  var contents = undefined;
  try {
    contents = (yield (0, (_nuclideClient2 || _nuclideClient()).getFileSystemServiceByNuclideUri)(uri).readFile(localPath)).toString('utf8');
  } catch (e) {
    (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('find-references: could not load file ' + uri, e);
    return null;
  }
  return contents;
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeCollection2;

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideClient2;

function _nuclideClient() {
  return _nuclideClient2 = require('../../nuclide-client');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var FRAGMENT_GRAMMARS = {
  'text.html.hack': 'source.hackfragment',
  'text.html.php': 'source.hackfragment'
};

function compareLocation(x, y) {
  var lineDiff = x.line - y.line;
  if (lineDiff) {
    return lineDiff;
  }
  return x.column - y.column;
}

function compareReference(x, y) {
  return compareLocation(x.start, y.start) || compareLocation(x.end, y.end);
}

function addReferenceGroup(groups, references, startLine, endLine) {
  if (references.length) {
    groups.push({ references: references, startLine: startLine, endLine: endLine });
  }
}

var FindReferencesModel = (function () {

  /**
   * @param basePath    Base path of the project. Used to display paths in a friendly way.
   * @param symbolName  The name of the symbol we're finding references for.
   * @param references  A list of references to `symbolName`.
   * @param options     See `FindReferencesOptions`.
   */

  function FindReferencesModel(basePath, symbolName, references, options) {
    _classCallCheck(this, FindReferencesModel);

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

  _createClass(FindReferencesModel, [{
    key: 'getFileReferences',
    value: _asyncToGenerator(function* (offset, limit) {
      var fileReferences = yield Promise.all(this._references.slice(offset, offset + limit).map(this._makeFileReferences.bind(this)));
      return (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(fileReferences);
    })
  }, {
    key: 'getBasePath',
    value: function getBasePath() {
      return this._basePath;
    }
  }, {
    key: 'getSymbolName',
    value: function getSymbolName() {
      return this._symbolName;
    }
  }, {
    key: 'getReferenceCount',
    value: function getReferenceCount() {
      return this._referenceCount;
    }
  }, {
    key: 'getFileCount',
    value: function getFileCount() {
      return this._references.length;
    }
  }, {
    key: 'getPreviewContext',
    value: function getPreviewContext() {
      return this._options.previewContext || 1;
    }
  }, {
    key: '_groupReferencesByFile',
    value: function _groupReferencesByFile(references) {
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
        var _entry = _slicedToArray(entry, 2);

        var fileUri = _entry[0];
        var entryReferences = _entry[1];

        entryReferences.sort(compareReference);
        // Group references that are <= 1 line apart together.
        var groups = [];
        var curGroup = [];
        var curStartLine = -11;
        var curEndLine = -11;
        for (var ref of entryReferences) {
          if (ref.start.line <= curEndLine + 1 + this.getPreviewContext()) {
            // Remove references with the same range (happens in C++ with templates)
            if (curGroup.length > 0 && compareReference(curGroup[curGroup.length - 1], ref) !== 0) {
              curGroup.push(ref);
              curEndLine = Math.max(curEndLine, ref.end.line);
            } else {
              this._referenceCount--;
            }
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
      this._references.sort(function (x, y) {
        return x[0].localeCompare(y[0]);
      });
    }

    /**
     * Fetch file previews and expand line ranges with context.
     */
  }, {
    key: '_makeFileReferences',
    value: _asyncToGenerator(function* (fileReferences) {
      var _this = this;

      var uri = fileReferences[0];
      var refGroups = fileReferences[1];
      var fileContents = yield readFileContents(uri);
      if (!fileContents) {
        return null;
      }
      var fileLines = fileContents.split('\n');
      var previewText = [];
      refGroups = refGroups.map(function (group) {
        var references = group.references;
        var startLine = group.startLine;
        var endLine = group.endLine;

        // Expand start/end lines with context.
        startLine = Math.max(startLine - _this.getPreviewContext(), 1);
        endLine = Math.min(endLine + _this.getPreviewContext(), fileLines.length);
        // However, don't include blank lines.
        while (startLine < endLine && fileLines[startLine - 1] === '') {
          startLine++;
        }
        while (startLine < endLine && fileLines[endLine - 1] === '') {
          endLine--;
        }

        previewText.push(fileLines.slice(startLine - 1, endLine).join('\n'));
        return { references: references, startLine: startLine, endLine: endLine };
      });
      var grammar = atom.grammars.selectGrammar(uri, fileContents);
      var fragmentGrammar = FRAGMENT_GRAMMARS[grammar.scopeName];
      if (fragmentGrammar) {
        grammar = atom.grammars.grammarForScopeName(fragmentGrammar) || grammar;
      }
      return {
        uri: uri,
        grammar: grammar,
        previewText: previewText,
        refGroups: refGroups
      };
    })
  }]);

  return FindReferencesModel;
})();

module.exports = FindReferencesModel;

// Lines of context to show around each preview block. Defaults to 1.