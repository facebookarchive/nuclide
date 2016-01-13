var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var readFileContents = _asyncToGenerator(function* (uri) {
  var localPath = getPath(uri);
  var contents = undefined;
  try {
    contents = (yield getFileSystemServiceByNuclideUri(uri).readFile(localPath)).toString('utf8');
  } catch (e) {
    getLogger().error('find-references: could not load file ' + uri, e);
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

var _require = require('../../commons');

var array = _require.array;

var _require2 = require('../../logging');

var getLogger = _require2.getLogger;

var _require3 = require('../../client');

var getFileSystemServiceByNuclideUri = _require3.getFileSystemServiceByNuclideUri;

var _require4 = require('../../remote-uri');

var getPath = _require4.getPath;

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
      return array.compact(fileReferences);
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

      var _fileReferences = _slicedToArray(fileReferences, 2);

      var uri = _fileReferences[0];
      var refGroups = _fileReferences[1];

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzTW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQThDZSxnQkFBZ0IscUJBQS9CLFdBQWdDLEdBQWUsRUFBb0I7QUFDakUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLE1BQUksUUFBUSxZQUFBLENBQUM7QUFDYixNQUFJO0FBQ0YsWUFBUSxHQUFHLENBQUMsTUFBTSxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUEsQ0FBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDL0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQVMsRUFBRSxDQUFDLEtBQUssMkNBQXlDLEdBQUcsRUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRSxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxRQUFRLENBQUM7Q0FDakI7Ozs7Ozs7Ozs7Ozs7O2VBaENlLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQWpDLEtBQUssWUFBTCxLQUFLOztnQkFDUSxPQUFPLENBQUMsZUFBZSxDQUFDOztJQUFyQyxTQUFTLGFBQVQsU0FBUzs7Z0JBQzJCLE9BQU8sQ0FBQyxjQUFjLENBQUM7O0lBQTNELGdDQUFnQyxhQUFoQyxnQ0FBZ0M7O2dCQUNyQixPQUFPLENBQUMsa0JBQWtCLENBQUM7O0lBQXRDLE9BQU8sYUFBUCxPQUFPOztBQUVkLElBQU0saUJBQWlCLEdBQUc7QUFDeEIsa0JBQWdCLEVBQUUscUJBQXFCO0FBQ3ZDLGlCQUFlLEVBQUUscUJBQXFCO0NBQ3ZDLENBQUM7O0FBRUYsU0FBUyxlQUFlLENBQUMsQ0FBVyxFQUFFLENBQVcsRUFBVTtBQUN6RCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDakMsTUFBSSxRQUFRLEVBQUU7QUFDWixXQUFPLFFBQVEsQ0FBQztHQUNqQjtBQUNELFNBQU8sQ0FB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QUUsRUFBRTtBQUMzRCxpQkFBTyxFQUFFLENBQUM7U0FDWDs7QUFFRCxtQkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDckUsZUFBTyxFQUFDLFVBQVUsRUFBVixVQUFVLEVBQUUsU0FBUyxFQUFULFNBQVMsRUFBRSxPQUFPLEVBQVAsT0FBTyxFQUFDLENBQUM7T0FDekMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzdELFVBQU0sZUFBZSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM3RCxVQUFJLGVBQWUsRUFBRTtBQUNuQixlQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsSUFBSSxPQUFPLENBQUM7T0FDekU7QUFDRCxhQUFPO0FBQ0wsV0FBRyxFQUFILEdBQUc7QUFDSCxlQUFPLEVBQVAsT0FBTztBQUNQLG1CQUFXLEVBQVgsV0FBVztBQUNYLGlCQUFTLEVBQVQsU0FBUztPQUNWLENBQUM7S0FDSDs7O1NBdEpHLG1CQUFtQjs7O0FBMEp6QixNQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDIiwiZmlsZSI6IkZpbmRSZWZlcmVuY2VzTW9kZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVSZWZlcmVuY2VzLFxuICBMb2NhdGlvbixcbiAgTnVjbGlkZVVyaSxcbiAgUmVmZXJlbmNlLFxuICBSZWZlcmVuY2VHcm91cCxcbn0gZnJvbSAnLi90eXBlcyc7XG5cbnR5cGUgRmluZFJlZmVyZW5jZXNPcHRpb25zID0ge1xuICAvLyBMaW5lcyBvZiBjb250ZXh0IHRvIHNob3cgYXJvdW5kIGVhY2ggcHJldmlldyBibG9jay4gRGVmYXVsdHMgdG8gMS5cbiAgcHJldmlld0NvbnRleHQ/OiBudW1iZXI7XG59O1xuXG5jb25zdCB7YXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3Qge2dldExvZ2dlcn0gPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJyk7XG5jb25zdCB7Z2V0RmlsZVN5c3RlbVNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vY2xpZW50Jyk7XG5jb25zdCB7Z2V0UGF0aH0gPSByZXF1aXJlKCcuLi8uLi9yZW1vdGUtdXJpJyk7XG5cbmNvbnN0IEZSQUdNRU5UX0dSQU1NQVJTID0ge1xuICAndGV4dC5odG1sLmhhY2snOiAnc291cmNlLmhhY2tmcmFnbWVudCcsXG4gICd0ZXh0Lmh0bWwucGhwJzogJ3NvdXJjZS5oYWNrZnJhZ21lbnQnLFxufTtcblxuZnVuY3Rpb24gY29tcGFyZUxvY2F0aW9uKHg6IExvY2F0aW9uLCB5OiBMb2NhdGlvbik6IG51bWJlciB7XG4gIGNvbnN0IGxpbmVEaWZmID0geC5saW5lIC0geS5saW5lO1xuICBpZiAobGluZURpZmYpIHtcbiAgICByZXR1cm4gbGluZURpZmY7XG4gIH1cbiAgcmV0dXJuIHguY29sdW1uIC0geS5jb2x1bW47XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVSZWZlcmVuY2UoeDogUmVmZXJlbmNlLCB5OiBSZWZlcmVuY2UpOiBudW1iZXIge1xuICByZXR1cm4gY29tcGFyZUxvY2F0aW9uKHguc3RhcnQsIHkuc3RhcnQpIHx8IGNvbXBhcmVMb2NhdGlvbih4LmVuZCwgeS5lbmQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWFkRmlsZUNvbnRlbnRzKHVyaTogTnVjbGlkZVVyaSk6IFByb21pc2U8P3N0cmluZz4ge1xuICBjb25zdCBsb2NhbFBhdGggPSBnZXRQYXRoKHVyaSk7XG4gIGxldCBjb250ZW50cztcbiAgdHJ5IHtcbiAgICBjb250ZW50cyA9IChhd2FpdCBnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaSh1cmkpLnJlYWRGaWxlKGxvY2FsUGF0aCkpLnRvU3RyaW5nKCd1dGY4Jyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnZXRMb2dnZXIoKS5lcnJvcihgZmluZC1yZWZlcmVuY2VzOiBjb3VsZCBub3QgbG9hZCBmaWxlICR7dXJpfWAsIGUpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBjb250ZW50cztcbn1cblxuZnVuY3Rpb24gYWRkUmVmZXJlbmNlR3JvdXAoXG4gIGdyb3VwczogQXJyYXk8UmVmZXJlbmNlR3JvdXA+LFxuICByZWZlcmVuY2VzOiBBcnJheTxSZWZlcmVuY2U+LFxuICBzdGFydExpbmU6IG51bWJlcixcbiAgZW5kTGluZTogbnVtYmVyXG4pIHtcbiAgaWYgKHJlZmVyZW5jZXMubGVuZ3RoKSB7XG4gICAgZ3JvdXBzLnB1c2goe3JlZmVyZW5jZXMsIHN0YXJ0TGluZSwgZW5kTGluZX0pO1xuICB9XG59XG5cbmNsYXNzIEZpbmRSZWZlcmVuY2VzTW9kZWwge1xuICBfYmFzZVBhdGg6IE51Y2xpZGVVcmk7XG4gIF9zeW1ib2xOYW1lOiBzdHJpbmc7XG4gIF9yZWZlcmVuY2VzOiBBcnJheTxbc3RyaW5nLCBBcnJheTxSZWZlcmVuY2VHcm91cD5dPjtcbiAgX3JlZmVyZW5jZUNvdW50OiBudW1iZXI7XG4gIF9vcHRpb25zOiBGaW5kUmVmZXJlbmNlc09wdGlvbnM7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBiYXNlUGF0aCAgICBCYXNlIHBhdGggb2YgdGhlIHByb2plY3QuIFVzZWQgdG8gZGlzcGxheSBwYXRocyBpbiBhIGZyaWVuZGx5IHdheS5cbiAgICogQHBhcmFtIHN5bWJvbE5hbWUgIFRoZSBuYW1lIG9mIHRoZSBzeW1ib2wgd2UncmUgZmluZGluZyByZWZlcmVuY2VzIGZvci5cbiAgICogQHBhcmFtIHJlZmVyZW5jZXMgIEEgbGlzdCBvZiByZWZlcmVuY2VzIHRvIGBzeW1ib2xOYW1lYC5cbiAgICogQHBhcmFtIG9wdGlvbnMgICAgIFNlZSBgRmluZFJlZmVyZW5jZXNPcHRpb25zYC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGJhc2VQYXRoOiBOdWNsaWRlVXJpLFxuICAgIHN5bWJvbE5hbWU6IHN0cmluZyxcbiAgICByZWZlcmVuY2VzOiBBcnJheTxSZWZlcmVuY2U+LFxuICAgIG9wdGlvbnM/OiBGaW5kUmVmZXJlbmNlc09wdGlvbnNcbiAgKSB7XG4gICAgdGhpcy5fYmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgICB0aGlzLl9zeW1ib2xOYW1lID0gc3ltYm9sTmFtZTtcbiAgICB0aGlzLl9yZWZlcmVuY2VDb3VudCA9IHJlZmVyZW5jZXMubGVuZ3RoO1xuICAgIHRoaXMuX29wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5fZ3JvdXBSZWZlcmVuY2VzQnlGaWxlKHJlZmVyZW5jZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBtYWluIHB1YmxpYyBlbnRyeSBwb2ludC5cbiAgICogUmV0dXJucyBhIGxpc3Qgb2YgcmVmZXJlbmNlcywgZ3JvdXBlZCBieSBmaWxlICh3aXRoIHByZXZpZXdzKSxcbiAgICogYWNjb3JkaW5nIHRvIHRoZSBnaXZlbiBvZmZzZXQgYW5kIGxpbWl0LlxuICAgKiBSZWZlcmVuY2VzIGluIGVhY2ggZmlsZSBhcmUgZ3JvdXBlZCB0b2dldGhlciBpZiB0aGV5J3JlIGFkamFjZW50LlxuICAgKi9cbiAgYXN5bmMgZ2V0RmlsZVJlZmVyZW5jZXMoXG4gICAgb2Zmc2V0OiBudW1iZXIsXG4gICAgbGltaXQ6IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PEZpbGVSZWZlcmVuY2VzPj4ge1xuICAgIGNvbnN0IGZpbGVSZWZlcmVuY2VzOiBBcnJheTw/RmlsZVJlZmVyZW5jZXM+ID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICB0aGlzLl9yZWZlcmVuY2VzLnNsaWNlKG9mZnNldCwgb2Zmc2V0ICsgbGltaXQpLm1hcChcbiAgICAgICAgdGhpcy5fbWFrZUZpbGVSZWZlcmVuY2VzLmJpbmQodGhpcylcbiAgICAgIClcbiAgICApO1xuICAgIHJldHVybiBhcnJheS5jb21wYWN0KGZpbGVSZWZlcmVuY2VzKTtcbiAgfVxuXG4gIGdldEJhc2VQYXRoKCk6IE51Y2xpZGVVcmkge1xuICAgIHJldHVybiB0aGlzLl9iYXNlUGF0aDtcbiAgfVxuXG4gIGdldFN5bWJvbE5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fc3ltYm9sTmFtZTtcbiAgfVxuXG4gIGdldFJlZmVyZW5jZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZUNvdW50O1xuICB9XG5cbiAgZ2V0RmlsZUNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3JlZmVyZW5jZXMubGVuZ3RoO1xuICB9XG5cbiAgZ2V0UHJldmlld0NvbnRleHQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fb3B0aW9ucy5wcmV2aWV3Q29udGV4dCB8fCAxO1xuICB9XG5cbiAgX2dyb3VwUmVmZXJlbmNlc0J5RmlsZShyZWZlcmVuY2VzOiBBcnJheTxSZWZlcmVuY2U+KTogdm9pZCB7XG4gICAgLy8gMS4gR3JvdXAgcmVmZXJlbmNlcyBieSBmaWxlLlxuICAgIGNvbnN0IHJlZnNCeUZpbGUgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCByZWZlcmVuY2Ugb2YgcmVmZXJlbmNlcykge1xuICAgICAgbGV0IGZpbGVSZWZlcmVuY2VzID0gcmVmc0J5RmlsZS5nZXQocmVmZXJlbmNlLnVyaSk7XG4gICAgICBpZiAoZmlsZVJlZmVyZW5jZXMgPT0gbnVsbCkge1xuICAgICAgICByZWZzQnlGaWxlLnNldChyZWZlcmVuY2UudXJpLCBmaWxlUmVmZXJlbmNlcyA9IFtdKTtcbiAgICAgIH1cbiAgICAgIGZpbGVSZWZlcmVuY2VzLnB1c2gocmVmZXJlbmNlKTtcbiAgICB9XG5cbiAgICAvLyAyLiBHcm91cCByZWZlcmVuY2VzIHdpdGhpbiBlYWNoIGZpbGUuXG4gICAgdGhpcy5fcmVmZXJlbmNlcyA9IFtdO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgcmVmc0J5RmlsZSkge1xuICAgICAgY29uc3QgW2ZpbGVVcmksIGVudHJ5UmVmZXJlbmNlc10gPSBlbnRyeTtcbiAgICAgIGVudHJ5UmVmZXJlbmNlcy5zb3J0KGNvbXBhcmVSZWZlcmVuY2UpO1xuICAgICAgLy8gR3JvdXAgcmVmZXJlbmNlcyB0aGF0IGFyZSA8PSAxIGxpbmUgYXBhcnQgdG9nZXRoZXIuXG4gICAgICBjb25zdCBncm91cHMgPSBbXTtcbiAgICAgIGxldCBjdXJHcm91cCA9IFtdO1xuICAgICAgbGV0IGN1clN0YXJ0TGluZSA9IC0xMTtcbiAgICAgIGxldCBjdXJFbmRMaW5lID0gLTExO1xuICAgICAgZm9yIChjb25zdCByZWYgb2YgZW50cnlSZWZlcmVuY2VzKSB7XG4gICAgICAgIGlmIChyZWYuc3RhcnQubGluZSA8PSBjdXJFbmRMaW5lICsgMSArIHRoaXMuZ2V0UHJldmlld0NvbnRleHQoKSkge1xuICAgICAgICAgIC8vIFJlbW92ZSByZWZlcmVuY2VzIHdpdGggdGhlIHNhbWUgcmFuZ2UgKGhhcHBlbnMgaW4gQysrIHdpdGggdGVtcGxhdGVzKVxuICAgICAgICAgIGlmIChjdXJHcm91cC5sZW5ndGggPiAwICYmIGNvbXBhcmVSZWZlcmVuY2UoY3VyR3JvdXBbY3VyR3JvdXAubGVuZ3RoIC0gMV0sIHJlZikgIT09IDApIHtcbiAgICAgICAgICAgIGN1ckdyb3VwLnB1c2gocmVmKTtcbiAgICAgICAgICAgIGN1ckVuZExpbmUgPSBNYXRoLm1heChjdXJFbmRMaW5lLCByZWYuZW5kLmxpbmUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZlcmVuY2VDb3VudC0tO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhZGRSZWZlcmVuY2VHcm91cChncm91cHMsIGN1ckdyb3VwLCBjdXJTdGFydExpbmUsIGN1ckVuZExpbmUpO1xuICAgICAgICAgIGN1ckdyb3VwID0gW3JlZl07XG4gICAgICAgICAgY3VyU3RhcnRMaW5lID0gcmVmLnN0YXJ0LmxpbmU7XG4gICAgICAgICAgY3VyRW5kTGluZSA9IHJlZi5lbmQubGluZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWRkUmVmZXJlbmNlR3JvdXAoZ3JvdXBzLCBjdXJHcm91cCwgY3VyU3RhcnRMaW5lLCBjdXJFbmRMaW5lKTtcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMucHVzaChbZmlsZVVyaSwgZ3JvdXBzXSk7XG4gICAgfVxuXG4gICAgLy8gRmluYWxseSwgc29ydCBieSBmaWxlIG5hbWUuXG4gICAgdGhpcy5fcmVmZXJlbmNlcy5zb3J0KCh4LCB5KSA9PiB4WzBdLmxvY2FsZUNvbXBhcmUoeVswXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoIGZpbGUgcHJldmlld3MgYW5kIGV4cGFuZCBsaW5lIHJhbmdlcyB3aXRoIGNvbnRleHQuXG4gICAqL1xuICBhc3luYyBfbWFrZUZpbGVSZWZlcmVuY2VzKFxuICAgIGZpbGVSZWZlcmVuY2VzOiBbc3RyaW5nLCBBcnJheTxSZWZlcmVuY2VHcm91cD5dXG4gICk6IFByb21pc2U8P0ZpbGVSZWZlcmVuY2VzPiB7XG4gICAgbGV0IFt1cmksIHJlZkdyb3Vwc10gPSBmaWxlUmVmZXJlbmNlcztcbiAgICBjb25zdCBmaWxlQ29udGVudHMgPSBhd2FpdCByZWFkRmlsZUNvbnRlbnRzKHVyaSk7XG4gICAgaWYgKCFmaWxlQ29udGVudHMpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBmaWxlTGluZXMgPSBmaWxlQ29udGVudHMuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IHByZXZpZXdUZXh0ID0gW107XG4gICAgcmVmR3JvdXBzID0gcmVmR3JvdXBzLm1hcChncm91cCA9PiB7XG4gICAgICBsZXQge3JlZmVyZW5jZXMsIHN0YXJ0TGluZSwgZW5kTGluZX0gPSBncm91cDtcbiAgICAgIC8vIEV4cGFuZCBzdGFydC9lbmQgbGluZXMgd2l0aCBjb250ZXh0LlxuICAgICAgc3RhcnRMaW5lID0gTWF0aC5tYXgoc3RhcnRMaW5lIC0gdGhpcy5nZXRQcmV2aWV3Q29udGV4dCgpLCAxKTtcbiAgICAgIGVuZExpbmUgPSBNYXRoLm1pbihlbmRMaW5lICsgdGhpcy5nZXRQcmV2aWV3Q29udGV4dCgpLCBmaWxlTGluZXMubGVuZ3RoKTtcbiAgICAgIC8vIEhvd2V2ZXIsIGRvbid0IGluY2x1ZGUgYmxhbmsgbGluZXMuXG4gICAgICB3aGlsZSAoc3RhcnRMaW5lIDwgZW5kTGluZSAmJiBmaWxlTGluZXNbc3RhcnRMaW5lIC0gMV0gPT09ICcnKSB7XG4gICAgICAgIHN0YXJ0TGluZSsrO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHN0YXJ0TGluZSA8IGVuZExpbmUgJiYgZmlsZUxpbmVzW2VuZExpbmUgLSAxXSA9PT0gJycpIHtcbiAgICAgICAgZW5kTGluZS0tO1xuICAgICAgfVxuXG4gICAgICBwcmV2aWV3VGV4dC5wdXNoKGZpbGVMaW5lcy5zbGljZShzdGFydExpbmUgLSAxLCBlbmRMaW5lKS5qb2luKCdcXG4nKSk7XG4gICAgICByZXR1cm4ge3JlZmVyZW5jZXMsIHN0YXJ0TGluZSwgZW5kTGluZX07XG4gICAgfSk7XG4gICAgbGV0IGdyYW1tYXIgPSBhdG9tLmdyYW1tYXJzLnNlbGVjdEdyYW1tYXIodXJpLCBmaWxlQ29udGVudHMpO1xuICAgIGNvbnN0IGZyYWdtZW50R3JhbW1hciA9IEZSQUdNRU5UX0dSQU1NQVJTW2dyYW1tYXIuc2NvcGVOYW1lXTtcbiAgICBpZiAoZnJhZ21lbnRHcmFtbWFyKSB7XG4gICAgICBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5ncmFtbWFyRm9yU2NvcGVOYW1lKGZyYWdtZW50R3JhbW1hcikgfHwgZ3JhbW1hcjtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIHVyaSxcbiAgICAgIGdyYW1tYXIsXG4gICAgICBwcmV2aWV3VGV4dCxcbiAgICAgIHJlZkdyb3VwcyxcbiAgICB9O1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kUmVmZXJlbmNlc01vZGVsO1xuIl19