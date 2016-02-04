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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbmRSZWZlcmVuY2VzTW9kZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztJQThDZSxnQkFBZ0IscUJBQS9CLFdBQWdDLEdBQWUsRUFBb0I7QUFDakUsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLE1BQUksUUFBUSxZQUFBLENBQUM7QUFDYixNQUFJO0FBQ0YsWUFBUSxHQUFHLENBQUMsTUFBTSxnQ0FBZ0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUEsQ0FBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDL0YsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUNWLGFBQVMsRUFBRSxDQUFDLEtBQUssMkNBQXlDLEdBQUcsRUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRSxXQUFPLElBQUksQ0FBQztHQUNiO0FBQ0QsU0FBTyxRQUFRLENBQUM7Q0FDakI7Ozs7Ozs7Ozs7Ozs7O2VBaENlLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQWpDLEtBQUssWUFBTCxLQUFLOztnQkFDUSxPQUFPLENBQUMsZUFBZSxDQUFDOztJQUFyQyxTQUFTLGFBQVQsU0FBUzs7Z0JBQzJCLE9BQU8sQ0FBQyxjQUFjLENBQUM7O0lBQTNELGdDQUFnQyxhQUFoQyxnQ0FBZ0M7O2dCQUNyQixPQUFPLENBQUMsa0JBQWtCLENBQUM7O0lBQXRDLE9BQU8sYUFBUCxPQUFPOztBQUVkLElBQU0saUJBQWlCLEdBQUc7QUFDeEIsa0JBQWdCLEVBQUUscUJBQXFCO0FBQ3ZDLGlCQUFlLEVBQUUscUJBQXFCO0NBQ3ZDLENBQUM7O0FBRUYsU0FBUyxlQUFlLENBQUMsQ0FBVyxFQUFFLENBQVcsRUFBVTtBQUN6RCxNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDakMsTUFBSSxRQUFRLEVBQUU7QUFDWixXQUFPLFFBQVEsQ0FBQztHQUNqQjtBQUNELFNBQU8sQ0FB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RSxFQUFFO0FBQzNELGlCQUFPLEVBQUUsQ0FBQztTQUNYOztBQUVELG1CQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNyRSxlQUFPLEVBQUMsVUFBVSxFQUFWLFVBQVUsRUFBRSxTQUFTLEVBQVQsU0FBUyxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUMsQ0FBQztPQUN6QyxDQUFDLENBQUM7QUFDSCxVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDN0QsVUFBTSxlQUFlLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzdELFVBQUksZUFBZSxFQUFFO0FBQ25CLGVBQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxJQUFJLE9BQU8sQ0FBQztPQUN6RTtBQUNELGFBQU87QUFDTCxXQUFHLEVBQUgsR0FBRztBQUNILGVBQU8sRUFBUCxPQUFPO0FBQ1AsbUJBQVcsRUFBWCxXQUFXO0FBQ1gsaUJBQVMsRUFBVCxTQUFTO09BQ1YsQ0FBQztLQUNIOzs7U0F2SkcsbUJBQW1COzs7QUEySnpCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRmluZFJlZmVyZW5jZXNNb2RlbC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRmlsZVJlZmVyZW5jZXMsXG4gIExvY2F0aW9uLFxuICBOdWNsaWRlVXJpLFxuICBSZWZlcmVuY2UsXG4gIFJlZmVyZW5jZUdyb3VwLFxufSBmcm9tICcuL3R5cGVzJztcblxudHlwZSBGaW5kUmVmZXJlbmNlc09wdGlvbnMgPSB7XG4gIC8vIExpbmVzIG9mIGNvbnRleHQgdG8gc2hvdyBhcm91bmQgZWFjaCBwcmV2aWV3IGJsb2NrLiBEZWZhdWx0cyB0byAxLlxuICBwcmV2aWV3Q29udGV4dD86IG51bWJlcjtcbn07XG5cbmNvbnN0IHthcnJheX0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCB7Z2V0TG9nZ2VyfSA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKTtcbmNvbnN0IHtnZXRGaWxlU3lzdGVtU2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9jbGllbnQnKTtcbmNvbnN0IHtnZXRQYXRofSA9IHJlcXVpcmUoJy4uLy4uL3JlbW90ZS11cmknKTtcblxuY29uc3QgRlJBR01FTlRfR1JBTU1BUlMgPSB7XG4gICd0ZXh0Lmh0bWwuaGFjayc6ICdzb3VyY2UuaGFja2ZyYWdtZW50JyxcbiAgJ3RleHQuaHRtbC5waHAnOiAnc291cmNlLmhhY2tmcmFnbWVudCcsXG59O1xuXG5mdW5jdGlvbiBjb21wYXJlTG9jYXRpb24oeDogTG9jYXRpb24sIHk6IExvY2F0aW9uKTogbnVtYmVyIHtcbiAgY29uc3QgbGluZURpZmYgPSB4LmxpbmUgLSB5LmxpbmU7XG4gIGlmIChsaW5lRGlmZikge1xuICAgIHJldHVybiBsaW5lRGlmZjtcbiAgfVxuICByZXR1cm4geC5jb2x1bW4gLSB5LmNvbHVtbjtcbn1cblxuZnVuY3Rpb24gY29tcGFyZVJlZmVyZW5jZSh4OiBSZWZlcmVuY2UsIHk6IFJlZmVyZW5jZSk6IG51bWJlciB7XG4gIHJldHVybiBjb21wYXJlTG9jYXRpb24oeC5zdGFydCwgeS5zdGFydCkgfHwgY29tcGFyZUxvY2F0aW9uKHguZW5kLCB5LmVuZCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlYWRGaWxlQ29udGVudHModXJpOiBOdWNsaWRlVXJpKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gIGNvbnN0IGxvY2FsUGF0aCA9IGdldFBhdGgodXJpKTtcbiAgbGV0IGNvbnRlbnRzO1xuICB0cnkge1xuICAgIGNvbnRlbnRzID0gKGF3YWl0IGdldEZpbGVTeXN0ZW1TZXJ2aWNlQnlOdWNsaWRlVXJpKHVyaSkucmVhZEZpbGUobG9jYWxQYXRoKSkudG9TdHJpbmcoJ3V0ZjgnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdldExvZ2dlcigpLmVycm9yKGBmaW5kLXJlZmVyZW5jZXM6IGNvdWxkIG5vdCBsb2FkIGZpbGUgJHt1cml9YCwgZSk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGNvbnRlbnRzO1xufVxuXG5mdW5jdGlvbiBhZGRSZWZlcmVuY2VHcm91cChcbiAgZ3JvdXBzOiBBcnJheTxSZWZlcmVuY2VHcm91cD4sXG4gIHJlZmVyZW5jZXM6IEFycmF5PFJlZmVyZW5jZT4sXG4gIHN0YXJ0TGluZTogbnVtYmVyLFxuICBlbmRMaW5lOiBudW1iZXJcbikge1xuICBpZiAocmVmZXJlbmNlcy5sZW5ndGgpIHtcbiAgICBncm91cHMucHVzaCh7cmVmZXJlbmNlcywgc3RhcnRMaW5lLCBlbmRMaW5lfSk7XG4gIH1cbn1cblxuY2xhc3MgRmluZFJlZmVyZW5jZXNNb2RlbCB7XG4gIF9iYXNlUGF0aDogTnVjbGlkZVVyaTtcbiAgX3N5bWJvbE5hbWU6IHN0cmluZztcbiAgX3JlZmVyZW5jZXM6IEFycmF5PFtzdHJpbmcsIEFycmF5PFJlZmVyZW5jZUdyb3VwPl0+O1xuICBfcmVmZXJlbmNlQ291bnQ6IG51bWJlcjtcbiAgX29wdGlvbnM6IEZpbmRSZWZlcmVuY2VzT3B0aW9ucztcblxuICAvKipcbiAgICogQHBhcmFtIGJhc2VQYXRoICAgIEJhc2UgcGF0aCBvZiB0aGUgcHJvamVjdC4gVXNlZCB0byBkaXNwbGF5IHBhdGhzIGluIGEgZnJpZW5kbHkgd2F5LlxuICAgKiBAcGFyYW0gc3ltYm9sTmFtZSAgVGhlIG5hbWUgb2YgdGhlIHN5bWJvbCB3ZSdyZSBmaW5kaW5nIHJlZmVyZW5jZXMgZm9yLlxuICAgKiBAcGFyYW0gcmVmZXJlbmNlcyAgQSBsaXN0IG9mIHJlZmVyZW5jZXMgdG8gYHN5bWJvbE5hbWVgLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAgICAgU2VlIGBGaW5kUmVmZXJlbmNlc09wdGlvbnNgLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgYmFzZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgc3ltYm9sTmFtZTogc3RyaW5nLFxuICAgIHJlZmVyZW5jZXM6IEFycmF5PFJlZmVyZW5jZT4sXG4gICAgb3B0aW9ucz86IEZpbmRSZWZlcmVuY2VzT3B0aW9uc1xuICApIHtcbiAgICB0aGlzLl9iYXNlUGF0aCA9IGJhc2VQYXRoO1xuICAgIHRoaXMuX3N5bWJvbE5hbWUgPSBzeW1ib2xOYW1lO1xuICAgIHRoaXMuX3JlZmVyZW5jZUNvdW50ID0gcmVmZXJlbmNlcy5sZW5ndGg7XG4gICAgdGhpcy5fb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB0aGlzLl9ncm91cFJlZmVyZW5jZXNCeUZpbGUocmVmZXJlbmNlcyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1haW4gcHVibGljIGVudHJ5IHBvaW50LlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiByZWZlcmVuY2VzLCBncm91cGVkIGJ5IGZpbGUgKHdpdGggcHJldmlld3MpLFxuICAgKiBhY2NvcmRpbmcgdG8gdGhlIGdpdmVuIG9mZnNldCBhbmQgbGltaXQuXG4gICAqIFJlZmVyZW5jZXMgaW4gZWFjaCBmaWxlIGFyZSBncm91cGVkIHRvZ2V0aGVyIGlmIHRoZXkncmUgYWRqYWNlbnQuXG4gICAqL1xuICBhc3luYyBnZXRGaWxlUmVmZXJlbmNlcyhcbiAgICBvZmZzZXQ6IG51bWJlcixcbiAgICBsaW1pdDogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8RmlsZVJlZmVyZW5jZXM+PiB7XG4gICAgY29uc3QgZmlsZVJlZmVyZW5jZXM6IEFycmF5PD9GaWxlUmVmZXJlbmNlcz4gPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIHRoaXMuX3JlZmVyZW5jZXMuc2xpY2Uob2Zmc2V0LCBvZmZzZXQgKyBsaW1pdCkubWFwKFxuICAgICAgICB0aGlzLl9tYWtlRmlsZVJlZmVyZW5jZXMuYmluZCh0aGlzKVxuICAgICAgKVxuICAgICk7XG4gICAgcmV0dXJuIGFycmF5LmNvbXBhY3QoZmlsZVJlZmVyZW5jZXMpO1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogTnVjbGlkZVVyaSB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgZ2V0U3ltYm9sTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zeW1ib2xOYW1lO1xuICB9XG5cbiAgZ2V0UmVmZXJlbmNlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlQ291bnQ7XG4gIH1cblxuICBnZXRGaWxlQ291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fcmVmZXJlbmNlcy5sZW5ndGg7XG4gIH1cblxuICBnZXRQcmV2aWV3Q29udGV4dCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9vcHRpb25zLnByZXZpZXdDb250ZXh0IHx8IDE7XG4gIH1cblxuICBfZ3JvdXBSZWZlcmVuY2VzQnlGaWxlKHJlZmVyZW5jZXM6IEFycmF5PFJlZmVyZW5jZT4pOiB2b2lkIHtcbiAgICAvLyAxLiBHcm91cCByZWZlcmVuY2VzIGJ5IGZpbGUuXG4gICAgY29uc3QgcmVmc0J5RmlsZSA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IHJlZmVyZW5jZSBvZiByZWZlcmVuY2VzKSB7XG4gICAgICBsZXQgZmlsZVJlZmVyZW5jZXMgPSByZWZzQnlGaWxlLmdldChyZWZlcmVuY2UudXJpKTtcbiAgICAgIGlmIChmaWxlUmVmZXJlbmNlcyA9PSBudWxsKSB7XG4gICAgICAgIHJlZnNCeUZpbGUuc2V0KHJlZmVyZW5jZS51cmksIGZpbGVSZWZlcmVuY2VzID0gW10pO1xuICAgICAgfVxuICAgICAgZmlsZVJlZmVyZW5jZXMucHVzaChyZWZlcmVuY2UpO1xuICAgIH1cblxuICAgIC8vIDIuIEdyb3VwIHJlZmVyZW5jZXMgd2l0aGluIGVhY2ggZmlsZS5cbiAgICB0aGlzLl9yZWZlcmVuY2VzID0gW107XG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiByZWZzQnlGaWxlKSB7XG4gICAgICBjb25zdCBbZmlsZVVyaSwgZW50cnlSZWZlcmVuY2VzXSA9IGVudHJ5O1xuICAgICAgZW50cnlSZWZlcmVuY2VzLnNvcnQoY29tcGFyZVJlZmVyZW5jZSk7XG4gICAgICAvLyBHcm91cCByZWZlcmVuY2VzIHRoYXQgYXJlIDw9IDEgbGluZSBhcGFydCB0b2dldGhlci5cbiAgICAgIGNvbnN0IGdyb3VwcyA9IFtdO1xuICAgICAgbGV0IGN1ckdyb3VwID0gW107XG4gICAgICBsZXQgY3VyU3RhcnRMaW5lID0gLTExO1xuICAgICAgbGV0IGN1ckVuZExpbmUgPSAtMTE7XG4gICAgICBmb3IgKGNvbnN0IHJlZiBvZiBlbnRyeVJlZmVyZW5jZXMpIHtcbiAgICAgICAgaWYgKHJlZi5zdGFydC5saW5lIDw9IGN1ckVuZExpbmUgKyAxICsgdGhpcy5nZXRQcmV2aWV3Q29udGV4dCgpKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHJlZmVyZW5jZXMgd2l0aCB0aGUgc2FtZSByYW5nZSAoaGFwcGVucyBpbiBDKysgd2l0aCB0ZW1wbGF0ZXMpXG4gICAgICAgICAgaWYgKGN1ckdyb3VwLmxlbmd0aCA+IDAgJiYgY29tcGFyZVJlZmVyZW5jZShjdXJHcm91cFtjdXJHcm91cC5sZW5ndGggLSAxXSwgcmVmKSAhPT0gMCkge1xuICAgICAgICAgICAgY3VyR3JvdXAucHVzaChyZWYpO1xuICAgICAgICAgICAgY3VyRW5kTGluZSA9IE1hdGgubWF4KGN1ckVuZExpbmUsIHJlZi5lbmQubGluZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZmVyZW5jZUNvdW50LS07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFkZFJlZmVyZW5jZUdyb3VwKGdyb3VwcywgY3VyR3JvdXAsIGN1clN0YXJ0TGluZSwgY3VyRW5kTGluZSk7XG4gICAgICAgICAgY3VyR3JvdXAgPSBbcmVmXTtcbiAgICAgICAgICBjdXJTdGFydExpbmUgPSByZWYuc3RhcnQubGluZTtcbiAgICAgICAgICBjdXJFbmRMaW5lID0gcmVmLmVuZC5saW5lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBhZGRSZWZlcmVuY2VHcm91cChncm91cHMsIGN1ckdyb3VwLCBjdXJTdGFydExpbmUsIGN1ckVuZExpbmUpO1xuICAgICAgdGhpcy5fcmVmZXJlbmNlcy5wdXNoKFtmaWxlVXJpLCBncm91cHNdKTtcbiAgICB9XG5cbiAgICAvLyBGaW5hbGx5LCBzb3J0IGJ5IGZpbGUgbmFtZS5cbiAgICB0aGlzLl9yZWZlcmVuY2VzLnNvcnQoKHgsIHkpID0+IHhbMF0ubG9jYWxlQ29tcGFyZSh5WzBdKSk7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2ggZmlsZSBwcmV2aWV3cyBhbmQgZXhwYW5kIGxpbmUgcmFuZ2VzIHdpdGggY29udGV4dC5cbiAgICovXG4gIGFzeW5jIF9tYWtlRmlsZVJlZmVyZW5jZXMoXG4gICAgZmlsZVJlZmVyZW5jZXM6IFtzdHJpbmcsIEFycmF5PFJlZmVyZW5jZUdyb3VwPl1cbiAgKTogUHJvbWlzZTw/RmlsZVJlZmVyZW5jZXM+IHtcbiAgICBsZXQgW3VyaSwgcmVmR3JvdXBzXSA9IGZpbGVSZWZlcmVuY2VzO1xuICAgIGNvbnN0IGZpbGVDb250ZW50cyA9IGF3YWl0IHJlYWRGaWxlQ29udGVudHModXJpKTtcbiAgICBpZiAoIWZpbGVDb250ZW50cykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IGZpbGVMaW5lcyA9IGZpbGVDb250ZW50cy5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgcHJldmlld1RleHQgPSBbXTtcbiAgICByZWZHcm91cHMgPSByZWZHcm91cHMubWFwKGdyb3VwID0+IHtcbiAgICAgIGNvbnN0IHtyZWZlcmVuY2VzfSA9IGdyb3VwO1xuICAgICAgbGV0IHtzdGFydExpbmUsIGVuZExpbmV9ID0gZ3JvdXA7XG4gICAgICAvLyBFeHBhbmQgc3RhcnQvZW5kIGxpbmVzIHdpdGggY29udGV4dC5cbiAgICAgIHN0YXJ0TGluZSA9IE1hdGgubWF4KHN0YXJ0TGluZSAtIHRoaXMuZ2V0UHJldmlld0NvbnRleHQoKSwgMSk7XG4gICAgICBlbmRMaW5lID0gTWF0aC5taW4oZW5kTGluZSArIHRoaXMuZ2V0UHJldmlld0NvbnRleHQoKSwgZmlsZUxpbmVzLmxlbmd0aCk7XG4gICAgICAvLyBIb3dldmVyLCBkb24ndCBpbmNsdWRlIGJsYW5rIGxpbmVzLlxuICAgICAgd2hpbGUgKHN0YXJ0TGluZSA8IGVuZExpbmUgJiYgZmlsZUxpbmVzW3N0YXJ0TGluZSAtIDFdID09PSAnJykge1xuICAgICAgICBzdGFydExpbmUrKztcbiAgICAgIH1cbiAgICAgIHdoaWxlIChzdGFydExpbmUgPCBlbmRMaW5lICYmIGZpbGVMaW5lc1tlbmRMaW5lIC0gMV0gPT09ICcnKSB7XG4gICAgICAgIGVuZExpbmUtLTtcbiAgICAgIH1cblxuICAgICAgcHJldmlld1RleHQucHVzaChmaWxlTGluZXMuc2xpY2Uoc3RhcnRMaW5lIC0gMSwgZW5kTGluZSkuam9pbignXFxuJykpO1xuICAgICAgcmV0dXJuIHtyZWZlcmVuY2VzLCBzdGFydExpbmUsIGVuZExpbmV9O1xuICAgIH0pO1xuICAgIGxldCBncmFtbWFyID0gYXRvbS5ncmFtbWFycy5zZWxlY3RHcmFtbWFyKHVyaSwgZmlsZUNvbnRlbnRzKTtcbiAgICBjb25zdCBmcmFnbWVudEdyYW1tYXIgPSBGUkFHTUVOVF9HUkFNTUFSU1tncmFtbWFyLnNjb3BlTmFtZV07XG4gICAgaWYgKGZyYWdtZW50R3JhbW1hcikge1xuICAgICAgZ3JhbW1hciA9IGF0b20uZ3JhbW1hcnMuZ3JhbW1hckZvclNjb3BlTmFtZShmcmFnbWVudEdyYW1tYXIpIHx8IGdyYW1tYXI7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB1cmksXG4gICAgICBncmFtbWFyLFxuICAgICAgcHJldmlld1RleHQsXG4gICAgICByZWZHcm91cHMsXG4gICAgfTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmluZFJlZmVyZW5jZXNNb2RlbDtcbiJdfQ==