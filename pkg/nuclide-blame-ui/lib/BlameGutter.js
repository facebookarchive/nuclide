Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAnalytics = require('../../nuclide-analytics');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _require = require('./constants');

var BLAME_DECORATION_CLASS = _require.BLAME_DECORATION_CLASS;

var MS_TO_WAIT_BEFORE_SPINNER = 2000;
var CHANGESET_CSS_CLASS = 'nuclide-blame-ui-hash';
var CLICKABLE_CHANGESET_CSS_CLASS = 'nuclide-blame-ui-hash-clickable';
var HG_CHANGESET_DATA_ATTRIBUTE = 'hgChangeset';

var _default = (function () {

  /**
   * @param gutterName A name for this gutter. Must not be used by any another
   *   gutter in this TextEditor.
   * @param editor The TextEditor this BlameGutter should create UI for.
   * @param blameProvider The BlameProvider that provides the appropriate blame
   *   information for this BlameGutter.
   */

  function _default(gutterName, editor, blameProvider) {
    var _this = this;

    _classCallCheck(this, _default);

    this._isDestroyed = false;
    this._isEditorDestroyed = false;

    this._subscriptions = new _atom.CompositeDisposable();
    this._editor = editor;
    this._blameProvider = blameProvider;
    this._changesetSpanClassName = CHANGESET_CSS_CLASS;
    this._bufferLineToDecoration = new Map();
    this._gutter = editor.addGutter({ name: gutterName });
    var gutterView = atom.views.getView(this._gutter);
    gutterView.classList.add('nuclide-blame');

    // If getUrlForRevision() is available, add a single, top-level click handler for the gutter.
    if (typeof blameProvider.getUrlForRevision === 'function') {
      (function () {
        // We also want to style the changeset differently if it is clickable.
        _this._changesetSpanClassName += ' ' + CLICKABLE_CHANGESET_CSS_CLASS;

        var onClick = _this._onClick.bind(_this);
        gutterView.addEventListener('click', onClick);
        _this._subscriptions.add(_this._gutter.onDidDestroy(function () {
          return gutterView.removeEventListener('click', onClick);
        }));
      })();
    }

    this._subscriptions.add(editor.onDidDestroy(function () {
      _this._isEditorDestroyed = true;
    }));
    this._fetchAndDisplayBlame();
  }

  /**
   * If the user clicked on a ChangeSet ID, extract it from the DOM element via the data- attribute
   * and find the corresponding Differential revision. If successful, open the URL for the revision.
   */

  _createDecoratedClass(_default, [{
    key: '_onClick',
    value: _asyncToGenerator(function* (e) {
      var target = e.target;
      if (!target) {
        return;
      }

      var dataset = target.dataset;
      var changeset = dataset[HG_CHANGESET_DATA_ATTRIBUTE];
      if (!changeset) {
        return;
      }

      var blameProvider = this._blameProvider;
      (0, _assert2['default'])(typeof blameProvider.getUrlForRevision === 'function');
      var url = yield blameProvider.getUrlForRevision(this._editor, changeset);
      if (url) {
        // Note that 'shell' is not the public 'shell' package on npm but an Atom built-in.
        _shell2['default'].openExternal(url);
      } else {
        atom.notifications.addWarning('No URL found for ' + changeset + '.');
      }

      (0, _nuclideAnalytics.track)('blame-gutter-click-revision', {
        editorPath: this._editor.getPath() || '',
        url: url || ''
      });
    })
  }, {
    key: '_fetchAndDisplayBlame',
    value: _asyncToGenerator(function* () {
      // Add a loading spinner while we fetch the blame.
      this._addLoadingSpinner();

      var newBlame = undefined;
      try {
        newBlame = yield this._blameProvider.getBlameForEditor(this._editor);
      } catch (error) {
        atom.notifications.addError('Failed to fetch blame to display. ' + 'The file is empty or untracked or the repository cannot be reached.', error);
        return;
      }
      // The BlameGutter could have been destroyed while blame was being fetched.
      if (this._isDestroyed) {
        return;
      }

      // Remove the loading spinner before setting the contents of the blame gutter.
      this._cleanUpLoadingSpinner();

      this._updateBlame(newBlame);
    })
  }, {
    key: '_addLoadingSpinner',
    value: function _addLoadingSpinner() {
      var _this2 = this;

      if (this._loadingSpinnerIsPending) {
        return;
      }
      this._loadingSpinnerIsPending = true;
      this._loadingSpinnerTimeoutId = window.setTimeout(function () {
        _this2._loadingSpinnerIsPending = false;
        _this2._loadingSpinnerDiv = document.createElement('div');
        _this2._loadingSpinnerDiv.className = 'nuclide-blame-ui-spinner';
        var gutterView = atom.views.getView(_this2._gutter);
        gutterView.appendChild(_this2._loadingSpinnerDiv);
      }, MS_TO_WAIT_BEFORE_SPINNER);
    }
  }, {
    key: '_cleanUpLoadingSpinner',
    value: function _cleanUpLoadingSpinner() {
      if (this._loadingSpinnerIsPending) {
        window.clearTimeout(this._loadingSpinnerTimeoutId);
        this._loadingSpinnerIsPending = false;
      }
      if (this._loadingSpinnerDiv) {
        this._loadingSpinnerDiv.remove();
        this._loadingSpinnerDiv = null;
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._isDestroyed = true;
      this._cleanUpLoadingSpinner();
      if (!this._isEditorDestroyed) {
        // Due to a bug in the Gutter API, destroying a Gutter after the editor
        // has been destroyed results in an exception.
        this._gutter.destroy();
      }
      for (var decoration of this._bufferLineToDecoration.values()) {
        decoration.getMarker().destroy();
      }
    }

    // The BlameForEditor completely replaces any previous blame information.
  }, {
    key: '_updateBlame',
    decorators: [(0, _nuclideAnalytics.trackTiming)('blame-ui.blame-gutter.updateBlame')],
    value: function _updateBlame(blameForEditor) {
      if (blameForEditor.size === 0) {
        atom.notifications.addInfo('Found no blame to display. Is this file empty or untracked?\n          If not, check for errors in the Nuclide logs local to your repo.');
      }
      var allPreviousBlamedLines = new Set(this._bufferLineToDecoration.keys());

      var longestBlame = 0;
      for (var blameInfo of blameForEditor.values()) {
        var blameLength = blameInfo.author.length;
        if (blameInfo.changeset) {
          blameLength += blameInfo.changeset.length + 1;
        }
        if (blameLength > longestBlame) {
          longestBlame = blameLength;
        }
      }

      for (var _ref3 of blameForEditor) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var bufferLine = _ref2[0];
        var blameInfo = _ref2[1];

        this._setBlameLine(bufferLine, blameInfo, longestBlame);
        allPreviousBlamedLines['delete'](bufferLine);
      }

      // Any lines that weren't in the new blameForEditor are outdated.
      for (var oldLine of allPreviousBlamedLines) {
        this._removeBlameLine(oldLine);
      }

      // Update the width of the gutter according to the new contents.
      this._updateGutterWidthToCharacterLength(longestBlame);
    }
  }, {
    key: '_updateGutterWidthToCharacterLength',
    value: function _updateGutterWidthToCharacterLength(characters) {
      var gutterView = atom.views.getView(this._gutter);
      gutterView.style.width = characters + 'ch';
    }
  }, {
    key: '_setBlameLine',
    value: function _setBlameLine(bufferLine, blameInfo, longestBlame) {
      var item = this._createGutterItem(blameInfo, longestBlame);
      var decorationProperties = {
        type: 'gutter',
        gutterName: this._gutter.name,
        'class': BLAME_DECORATION_CLASS,
        item: item
      };

      var decoration = this._bufferLineToDecoration.get(bufferLine);
      if (!decoration) {
        var bufferLineHeadPoint = [bufferLine, 0];
        // The range of this Marker doesn't matter, only the line it is on, because
        // the Decoration is for a Gutter.
        var marker = this._editor.markBufferRange([bufferLineHeadPoint, bufferLineHeadPoint]);
        decoration = this._editor.decorateMarker(marker, decorationProperties);
        this._bufferLineToDecoration.set(bufferLine, decoration);
      } else {
        decoration.setProperties(decorationProperties);
      }
    }
  }, {
    key: '_removeBlameLine',
    value: function _removeBlameLine(bufferLine) {
      var blameDecoration = this._bufferLineToDecoration.get(bufferLine);
      if (!blameDecoration) {
        return;
      }
      // The recommended way of destroying a decoration is by destroying its marker.
      blameDecoration.getMarker().destroy();
      this._bufferLineToDecoration['delete'](bufferLine);
    }
  }, {
    key: '_createGutterItem',
    value: function _createGutterItem(blameInfo, longestBlame) {
      var doc = window.document;
      var item = doc.createElement('div');

      var authorSpan = doc.createElement('span');
      authorSpan.innerText = blameInfo.author;
      item.appendChild(authorSpan);

      if (blameInfo.changeset) {
        var numSpaces = longestBlame - blameInfo.author.length - blameInfo.changeset.length;
        // Insert non-breaking spaces to ensure the changeset is right-aligned.
        // Admittedly, this is a little gross, but it seems better than setting style.width on every
        // item that we create and having to give it a special flexbox layout. Hooray monospace!
        item.appendChild(doc.createTextNode(' '.repeat(numSpaces)));

        var changesetSpan = doc.createElement('span');
        changesetSpan.className = this._changesetSpanClassName;
        changesetSpan.dataset[HG_CHANGESET_DATA_ATTRIBUTE] = blameInfo.changeset;
        changesetSpan.innerText = blameInfo.changeset;
        item.appendChild(changesetSpan);
      }

      return item;
    }
  }]);

  return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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LENBQUMsUUFBUSxDQUFDO0FBQzVCLFVBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXRDLFVBQU0sVUFBVSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0MsZ0JBQVUsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztBQUN4QyxVQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUU3QixVQUFJLFNBQVMsQ0FBQyxTQUFTLEVBQUU7QUFDdkIsWUFBTSxTQUFTLEdBQUcsWUFBWSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDOzs7O0FBSXRGLFlBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxHQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFakUsWUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRCxxQkFBYSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7QUFDdkQscUJBQWEsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLENBQUMsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0FBQ3pFLHFCQUFhLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDOUMsWUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztPQUNqQzs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiIiwiZmlsZSI6IkJsYW1lR3V0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBCbGFtZUZvckVkaXRvcixcbiAgQmxhbWVJbmZvLFxuICBCbGFtZVByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWJsYW1lLWJhc2UnO1xuXG5jb25zdCB7QkxBTUVfREVDT1JBVElPTl9DTEFTU30gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuXG5jb25zdCBNU19UT19XQUlUX0JFRk9SRV9TUElOTkVSID0gMjAwMDtcbmNvbnN0IENIQU5HRVNFVF9DU1NfQ0xBU1MgPSAnbnVjbGlkZS1ibGFtZS11aS1oYXNoJztcbmNvbnN0IENMSUNLQUJMRV9DSEFOR0VTRVRfQ1NTX0NMQVNTID0gJ251Y2xpZGUtYmxhbWUtdWktaGFzaC1jbGlja2FibGUnO1xuY29uc3QgSEdfQ0hBTkdFU0VUX0RBVEFfQVRUUklCVVRFID0gJ2hnQ2hhbmdlc2V0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBfZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIF9ibGFtZVByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyO1xuICBfY2hhbmdlc2V0U3BhbkNsYXNzTmFtZTogc3RyaW5nO1xuICBfYnVmZmVyTGluZVRvRGVjb3JhdGlvbjogTWFwPG51bWJlciwgYXRvbSREZWNvcmF0aW9uPjtcbiAgX2d1dHRlcjogYXRvbSRHdXR0ZXI7XG4gIF9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZzogYm9vbGVhbjtcbiAgX2xvYWRpbmdTcGlubmVyRGl2OiA/SFRNTEVsZW1lbnQ7XG4gIF9sb2FkaW5nU3Bpbm5lclRpbWVvdXRJZDogbnVtYmVyO1xuICBfaXNEZXN0cm95ZWQ6IGJvb2xlYW47XG4gIF9pc0VkaXRvckRlc3Ryb3llZDogYm9vbGVhbjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBndXR0ZXJOYW1lIEEgbmFtZSBmb3IgdGhpcyBndXR0ZXIuIE11c3Qgbm90IGJlIHVzZWQgYnkgYW55IGFub3RoZXJcbiAgICogICBndXR0ZXIgaW4gdGhpcyBUZXh0RWRpdG9yLlxuICAgKiBAcGFyYW0gZWRpdG9yIFRoZSBUZXh0RWRpdG9yIHRoaXMgQmxhbWVHdXR0ZXIgc2hvdWxkIGNyZWF0ZSBVSSBmb3IuXG4gICAqIEBwYXJhbSBibGFtZVByb3ZpZGVyIFRoZSBCbGFtZVByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgdGhlIGFwcHJvcHJpYXRlIGJsYW1lXG4gICAqICAgaW5mb3JtYXRpb24gZm9yIHRoaXMgQmxhbWVHdXR0ZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihndXR0ZXJOYW1lOiBzdHJpbmcsIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBibGFtZVByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyKSB7XG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0VkaXRvckRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX2JsYW1lUHJvdmlkZXIgPSBibGFtZVByb3ZpZGVyO1xuICAgIHRoaXMuX2NoYW5nZXNldFNwYW5DbGFzc05hbWUgPSBDSEFOR0VTRVRfQ1NTX0NMQVNTO1xuICAgIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZ3V0dGVyID0gZWRpdG9yLmFkZEd1dHRlcih7bmFtZTogZ3V0dGVyTmFtZX0pO1xuICAgIGNvbnN0IGd1dHRlclZpZXc6IEhUTUxFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgZ3V0dGVyVmlldy5jbGFzc0xpc3QuYWRkKCdudWNsaWRlLWJsYW1lJyk7XG5cbiAgICAvLyBJZiBnZXRVcmxGb3JSZXZpc2lvbigpIGlzIGF2YWlsYWJsZSwgYWRkIGEgc2luZ2xlLCB0b3AtbGV2ZWwgY2xpY2sgaGFuZGxlciBmb3IgdGhlIGd1dHRlci5cbiAgICBpZiAodHlwZW9mIGJsYW1lUHJvdmlkZXIuZ2V0VXJsRm9yUmV2aXNpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIFdlIGFsc28gd2FudCB0byBzdHlsZSB0aGUgY2hhbmdlc2V0IGRpZmZlcmVudGx5IGlmIGl0IGlzIGNsaWNrYWJsZS5cbiAgICAgIHRoaXMuX2NoYW5nZXNldFNwYW5DbGFzc05hbWUgKz0gJyAnICsgQ0xJQ0tBQkxFX0NIQU5HRVNFVF9DU1NfQ0xBU1M7XG5cbiAgICAgIGNvbnN0IG9uQ2xpY2s6IChldnQ6IEV2ZW50KSA9PiBQcm9taXNlPHZvaWQ+ID0gdGhpcy5fb25DbGljay5iaW5kKHRoaXMpO1xuICAgICAgZ3V0dGVyVmlldy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZ3V0dGVyLm9uRGlkRGVzdHJveShcbiAgICAgICAgICAoKSA9PiBndXR0ZXJWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljaylcbiAgICAgICkpO1xuICAgIH1cblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5faXNFZGl0b3JEZXN0cm95ZWQgPSB0cnVlO1xuICAgIH0pKTtcbiAgICB0aGlzLl9mZXRjaEFuZERpc3BsYXlCbGFtZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBDaGFuZ2VTZXQgSUQsIGV4dHJhY3QgaXQgZnJvbSB0aGUgRE9NIGVsZW1lbnQgdmlhIHRoZSBkYXRhLSBhdHRyaWJ1dGVcbiAgICogYW5kIGZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgRGlmZmVyZW50aWFsIHJldmlzaW9uLiBJZiBzdWNjZXNzZnVsLCBvcGVuIHRoZSBVUkwgZm9yIHRoZSByZXZpc2lvbi5cbiAgICovXG4gIGFzeW5jIF9vbkNsaWNrKGU6IEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhc2V0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9ICh0YXJnZXQ6IGFueSkuZGF0YXNldDtcbiAgICBjb25zdCBjaGFuZ2VzZXQgPSBkYXRhc2V0W0hHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURV07XG4gICAgaWYgKCFjaGFuZ2VzZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibGFtZVByb3ZpZGVyID0gdGhpcy5fYmxhbWVQcm92aWRlcjtcbiAgICBpbnZhcmlhbnQodHlwZW9mIGJsYW1lUHJvdmlkZXIuZ2V0VXJsRm9yUmV2aXNpb24gPT09ICdmdW5jdGlvbicpO1xuICAgIGNvbnN0IHVybCA9IGF3YWl0IGJsYW1lUHJvdmlkZXIuZ2V0VXJsRm9yUmV2aXNpb24odGhpcy5fZWRpdG9yLCBjaGFuZ2VzZXQpO1xuICAgIGlmICh1cmwpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCAnc2hlbGwnIGlzIG5vdCB0aGUgcHVibGljICdzaGVsbCcgcGFja2FnZSBvbiBucG0gYnV0IGFuIEF0b20gYnVpbHQtaW4uXG4gICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwodXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoYE5vIFVSTCBmb3VuZCBmb3IgJHtjaGFuZ2VzZXR9LmApO1xuICAgIH1cblxuICAgIHRyYWNrKCdibGFtZS1ndXR0ZXItY2xpY2stcmV2aXNpb24nLCB7XG4gICAgICBlZGl0b3JQYXRoOiB0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpIHx8ICcnLFxuICAgICAgdXJsOiB1cmwgfHwgJycsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfZmV0Y2hBbmREaXNwbGF5QmxhbWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gQWRkIGEgbG9hZGluZyBzcGlubmVyIHdoaWxlIHdlIGZldGNoIHRoZSBibGFtZS5cbiAgICB0aGlzLl9hZGRMb2FkaW5nU3Bpbm5lcigpO1xuXG4gICAgbGV0IG5ld0JsYW1lO1xuICAgIHRyeSB7XG4gICAgICBuZXdCbGFtZSA9IGF3YWl0IHRoaXMuX2JsYW1lUHJvdmlkZXIuZ2V0QmxhbWVGb3JFZGl0b3IodGhpcy5fZWRpdG9yKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICBgRmFpbGVkIHRvIGZldGNoIGJsYW1lIHRvIGRpc3BsYXkuIGAgK1xuICAgICAgICBgVGhlIGZpbGUgaXMgZW1wdHkgb3IgdW50cmFja2VkIG9yIHRoZSByZXBvc2l0b3J5IGNhbm5vdCBiZSByZWFjaGVkLmAsXG4gICAgICAgIGVycm9yLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVGhlIEJsYW1lR3V0dGVyIGNvdWxkIGhhdmUgYmVlbiBkZXN0cm95ZWQgd2hpbGUgYmxhbWUgd2FzIGJlaW5nIGZldGNoZWQuXG4gICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBsb2FkaW5nIHNwaW5uZXIgYmVmb3JlIHNldHRpbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBibGFtZSBndXR0ZXIuXG4gICAgdGhpcy5fY2xlYW5VcExvYWRpbmdTcGlubmVyKCk7XG5cbiAgICB0aGlzLl91cGRhdGVCbGFtZShuZXdCbGFtZSk7XG4gIH1cblxuICBfYWRkTG9hZGluZ1NwaW5uZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lclRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYuY2xhc3NOYW1lID0gJ251Y2xpZGUtYmxhbWUtdWktc3Bpbm5lcic7XG4gICAgICBjb25zdCBndXR0ZXJWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgICBndXR0ZXJWaWV3LmFwcGVuZENoaWxkKHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2KTtcbiAgICB9LCBNU19UT19XQUlUX0JFRk9SRV9TUElOTkVSKTtcbiAgfVxuXG4gIF9jbGVhblVwTG9hZGluZ1NwaW5uZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX2xvYWRpbmdTcGlubmVyVGltZW91dElkKTtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdikge1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYucmVtb3ZlKCk7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fY2xlYW5VcExvYWRpbmdTcGlubmVyKCk7XG4gICAgaWYgKCF0aGlzLl9pc0VkaXRvckRlc3Ryb3llZCkge1xuICAgICAgLy8gRHVlIHRvIGEgYnVnIGluIHRoZSBHdXR0ZXIgQVBJLCBkZXN0cm95aW5nIGEgR3V0dGVyIGFmdGVyIHRoZSBlZGl0b3JcbiAgICAgIC8vIGhhcyBiZWVuIGRlc3Ryb3llZCByZXN1bHRzIGluIGFuIGV4Y2VwdGlvbi5cbiAgICAgIHRoaXMuX2d1dHRlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZGVjb3JhdGlvbiBvZiB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLnZhbHVlcygpKSB7XG4gICAgICBkZWNvcmF0aW9uLmdldE1hcmtlcigpLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgQmxhbWVGb3JFZGl0b3IgY29tcGxldGVseSByZXBsYWNlcyBhbnkgcHJldmlvdXMgYmxhbWUgaW5mb3JtYXRpb24uXG4gIEB0cmFja1RpbWluZygnYmxhbWUtdWkuYmxhbWUtZ3V0dGVyLnVwZGF0ZUJsYW1lJylcbiAgX3VwZGF0ZUJsYW1lKGJsYW1lRm9yRWRpdG9yOiBCbGFtZUZvckVkaXRvcik6IHZvaWQge1xuICAgIGlmIChibGFtZUZvckVkaXRvci5zaXplID09PSAwKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICBgRm91bmQgbm8gYmxhbWUgdG8gZGlzcGxheS4gSXMgdGhpcyBmaWxlIGVtcHR5IG9yIHVudHJhY2tlZD9cbiAgICAgICAgICBJZiBub3QsIGNoZWNrIGZvciBlcnJvcnMgaW4gdGhlIE51Y2xpZGUgbG9ncyBsb2NhbCB0byB5b3VyIHJlcG8uYCk7XG4gICAgfVxuICAgIGNvbnN0IGFsbFByZXZpb3VzQmxhbWVkTGluZXMgPSBuZXcgU2V0KHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24ua2V5cygpKTtcblxuICAgIGxldCBsb25nZXN0QmxhbWUgPSAwO1xuICAgIGZvciAoY29uc3QgYmxhbWVJbmZvIG9mIGJsYW1lRm9yRWRpdG9yLnZhbHVlcygpKSB7XG4gICAgICBsZXQgYmxhbWVMZW5ndGggPSBibGFtZUluZm8uYXV0aG9yLmxlbmd0aDtcbiAgICAgIGlmIChibGFtZUluZm8uY2hhbmdlc2V0KSB7XG4gICAgICAgIGJsYW1lTGVuZ3RoICs9IGJsYW1lSW5mby5jaGFuZ2VzZXQubGVuZ3RoICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChibGFtZUxlbmd0aCA+IGxvbmdlc3RCbGFtZSkge1xuICAgICAgICBsb25nZXN0QmxhbWUgPSBibGFtZUxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtidWZmZXJMaW5lLCBibGFtZUluZm9dIG9mIGJsYW1lRm9yRWRpdG9yKSB7XG4gICAgICB0aGlzLl9zZXRCbGFtZUxpbmUoYnVmZmVyTGluZSwgYmxhbWVJbmZvLCBsb25nZXN0QmxhbWUpO1xuICAgICAgYWxsUHJldmlvdXNCbGFtZWRMaW5lcy5kZWxldGUoYnVmZmVyTGluZSk7XG4gICAgfVxuXG4gICAgLy8gQW55IGxpbmVzIHRoYXQgd2VyZW4ndCBpbiB0aGUgbmV3IGJsYW1lRm9yRWRpdG9yIGFyZSBvdXRkYXRlZC5cbiAgICBmb3IgKGNvbnN0IG9sZExpbmUgb2YgYWxsUHJldmlvdXNCbGFtZWRMaW5lcykge1xuICAgICAgdGhpcy5fcmVtb3ZlQmxhbWVMaW5lKG9sZExpbmUpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgd2lkdGggb2YgdGhlIGd1dHRlciBhY2NvcmRpbmcgdG8gdGhlIG5ldyBjb250ZW50cy5cbiAgICB0aGlzLl91cGRhdGVHdXR0ZXJXaWR0aFRvQ2hhcmFjdGVyTGVuZ3RoKGxvbmdlc3RCbGFtZSk7XG4gIH1cblxuICBfdXBkYXRlR3V0dGVyV2lkdGhUb0NoYXJhY3Rlckxlbmd0aChjaGFyYWN0ZXJzOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBndXR0ZXJWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgZ3V0dGVyVmlldy5zdHlsZS53aWR0aCA9IGAke2NoYXJhY3RlcnN9Y2hgO1xuICB9XG5cbiAgX3NldEJsYW1lTGluZShidWZmZXJMaW5lOiBudW1iZXIsIGJsYW1lSW5mbzogQmxhbWVJbmZvLCBsb25nZXN0QmxhbWU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jcmVhdGVHdXR0ZXJJdGVtKGJsYW1lSW5mbywgbG9uZ2VzdEJsYW1lKTtcbiAgICBjb25zdCBkZWNvcmF0aW9uUHJvcGVydGllcyA9IHtcbiAgICAgIHR5cGU6ICdndXR0ZXInLFxuICAgICAgZ3V0dGVyTmFtZTogdGhpcy5fZ3V0dGVyLm5hbWUsXG4gICAgICBjbGFzczogQkxBTUVfREVDT1JBVElPTl9DTEFTUyxcbiAgICAgIGl0ZW0sXG4gICAgfTtcblxuICAgIGxldCBkZWNvcmF0aW9uID0gdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5nZXQoYnVmZmVyTGluZSk7XG4gICAgaWYgKCFkZWNvcmF0aW9uKSB7XG4gICAgICBjb25zdCBidWZmZXJMaW5lSGVhZFBvaW50ID0gW2J1ZmZlckxpbmUsIDBdO1xuICAgICAgLy8gVGhlIHJhbmdlIG9mIHRoaXMgTWFya2VyIGRvZXNuJ3QgbWF0dGVyLCBvbmx5IHRoZSBsaW5lIGl0IGlzIG9uLCBiZWNhdXNlXG4gICAgICAvLyB0aGUgRGVjb3JhdGlvbiBpcyBmb3IgYSBHdXR0ZXIuXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtidWZmZXJMaW5lSGVhZFBvaW50LCBidWZmZXJMaW5lSGVhZFBvaW50XSk7XG4gICAgICBkZWNvcmF0aW9uID0gdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwgZGVjb3JhdGlvblByb3BlcnRpZXMpO1xuICAgICAgdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5zZXQoYnVmZmVyTGluZSwgZGVjb3JhdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhkZWNvcmF0aW9uUHJvcGVydGllcyk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUJsYW1lTGluZShidWZmZXJMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBibGFtZURlY29yYXRpb24gPSB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLmdldChidWZmZXJMaW5lKTtcbiAgICBpZiAoIWJsYW1lRGVjb3JhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgcmVjb21tZW5kZWQgd2F5IG9mIGRlc3Ryb3lpbmcgYSBkZWNvcmF0aW9uIGlzIGJ5IGRlc3Ryb3lpbmcgaXRzIG1hcmtlci5cbiAgICBibGFtZURlY29yYXRpb24uZ2V0TWFya2VyKCkuZGVzdHJveSgpO1xuICAgIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24uZGVsZXRlKGJ1ZmZlckxpbmUpO1xuICB9XG5cbiAgX2NyZWF0ZUd1dHRlckl0ZW0oYmxhbWVJbmZvOiBCbGFtZUluZm8sIGxvbmdlc3RCbGFtZTogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcbiAgICBjb25zdCBpdGVtID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29uc3QgYXV0aG9yU3BhbiA9IGRvYy5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYXV0aG9yU3Bhbi5pbm5lclRleHQgPSBibGFtZUluZm8uYXV0aG9yO1xuICAgIGl0ZW0uYXBwZW5kQ2hpbGQoYXV0aG9yU3Bhbik7XG5cbiAgICBpZiAoYmxhbWVJbmZvLmNoYW5nZXNldCkge1xuICAgICAgY29uc3QgbnVtU3BhY2VzID0gbG9uZ2VzdEJsYW1lIC0gYmxhbWVJbmZvLmF1dGhvci5sZW5ndGggLSBibGFtZUluZm8uY2hhbmdlc2V0Lmxlbmd0aDtcbiAgICAgIC8vIEluc2VydCBub24tYnJlYWtpbmcgc3BhY2VzIHRvIGVuc3VyZSB0aGUgY2hhbmdlc2V0IGlzIHJpZ2h0LWFsaWduZWQuXG4gICAgICAvLyBBZG1pdHRlZGx5LCB0aGlzIGlzIGEgbGl0dGxlIGdyb3NzLCBidXQgaXQgc2VlbXMgYmV0dGVyIHRoYW4gc2V0dGluZyBzdHlsZS53aWR0aCBvbiBldmVyeVxuICAgICAgLy8gaXRlbSB0aGF0IHdlIGNyZWF0ZSBhbmQgaGF2aW5nIHRvIGdpdmUgaXQgYSBzcGVjaWFsIGZsZXhib3ggbGF5b3V0LiBIb29yYXkgbW9ub3NwYWNlIVxuICAgICAgaXRlbS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoJ1xcdTAwQTAnLnJlcGVhdChudW1TcGFjZXMpKSk7XG5cbiAgICAgIGNvbnN0IGNoYW5nZXNldFNwYW4gPSBkb2MuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgY2hhbmdlc2V0U3Bhbi5jbGFzc05hbWUgPSB0aGlzLl9jaGFuZ2VzZXRTcGFuQ2xhc3NOYW1lO1xuICAgICAgY2hhbmdlc2V0U3Bhbi5kYXRhc2V0W0hHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURV0gPSBibGFtZUluZm8uY2hhbmdlc2V0O1xuICAgICAgY2hhbmdlc2V0U3Bhbi5pbm5lclRleHQgPSBibGFtZUluZm8uY2hhbmdlc2V0O1xuICAgICAgaXRlbS5hcHBlbmRDaGlsZChjaGFuZ2VzZXRTcGFuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxufVxuIl19