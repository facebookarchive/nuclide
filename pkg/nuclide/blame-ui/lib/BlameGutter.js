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

var _analytics = require('../../analytics');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _require = require('./constants');

var BLAME_DECORATION_CLASS = _require.BLAME_DECORATION_CLASS;

var BLAME_GUTTER_DEFAULT_WIDTH = 50;
var LOADING_SPINNER_ID = 'blame-loading-spinner';
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
    this._updateGutterWidthToPixelWidth(BLAME_GUTTER_DEFAULT_WIDTH);

    // If getUrlForRevision() is available, add a single, top-level click handler for the gutter.
    if (typeof blameProvider.getUrlForRevision === 'function') {
      (function () {
        // We also want to style the changeset differently if it is clickable.
        _this._changesetSpanClassName += ' ' + CLICKABLE_CHANGESET_CSS_CLASS;

        // $FlowIssue: https://github.com/facebook/flow/issues/1242
        var onClick = _this._onClick.bind(_this);
        var gutterView = atom.views.getView(_this._gutter);
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
        require('shell').openExternal(url);
      } else {
        atom.notifications.addWarning('No URL found for ' + changeset + '.');
      }

      (0, _analytics.track)('blame-gutter-click-revision', {
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
        _this2._loadingSpinnerDiv.id = LOADING_SPINNER_ID;
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
    decorators: [(0, _analytics.trackTiming)('blame-ui.blame-gutter.updateBlame')],
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
    key: '_updateGutterWidthToPixelWidth',
    value: function _updateGutterWidthToPixelWidth(pixelWidth) {
      var gutterView = atom.views.getView(this._gutter);
      gutterView.style.width = pixelWidth + 'px';
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
//# sourceMappingURL=data:application/json;base64,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QUFhLENBQUMsQ0FBQztPQUNqQzs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUNiIiwiZmlsZSI6IkJsYW1lR3V0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBCbGFtZUZvckVkaXRvcixcbiAgQmxhbWVJbmZvLFxuICBCbGFtZVByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9ibGFtZS1iYXNlJztcblxuY29uc3Qge0JMQU1FX0RFQ09SQVRJT05fQ0xBU1N9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcbmltcG9ydCB7dHJhY2ssIHRyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgQkxBTUVfR1VUVEVSX0RFRkFVTFRfV0lEVEggPSA1MDtcbmNvbnN0IExPQURJTkdfU1BJTk5FUl9JRCA9ICdibGFtZS1sb2FkaW5nLXNwaW5uZXInO1xuY29uc3QgTVNfVE9fV0FJVF9CRUZPUkVfU1BJTk5FUiA9IDIwMDA7XG5jb25zdCBDSEFOR0VTRVRfQ1NTX0NMQVNTID0gJ251Y2xpZGUtYmxhbWUtdWktaGFzaCc7XG5jb25zdCBDTElDS0FCTEVfQ0hBTkdFU0VUX0NTU19DTEFTUyA9ICdudWNsaWRlLWJsYW1lLXVpLWhhc2gtY2xpY2thYmxlJztcbmNvbnN0IEhHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURSA9ICdoZ0NoYW5nZXNldCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcbiAgX2VkaXRvcjogYXRvbSRUZXh0RWRpdG9yO1xuICBfYmxhbWVQcm92aWRlcjogQmxhbWVQcm92aWRlcjtcbiAgX2NoYW5nZXNldFNwYW5DbGFzc05hbWU6IHN0cmluZztcbiAgX2J1ZmZlckxpbmVUb0RlY29yYXRpb246IE1hcDxudW1iZXIsIGF0b20kRGVjb3JhdGlvbj47XG4gIF9ndXR0ZXI6IGF0b20kR3V0dGVyO1xuICBfbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmc6IGJvb2xlYW47XG4gIF9sb2FkaW5nU3Bpbm5lckRpdjogP0hUTUxFbGVtZW50O1xuICBfbG9hZGluZ1NwaW5uZXJUaW1lb3V0SWQ6IG51bWJlcjtcbiAgX2lzRGVzdHJveWVkOiBib29sZWFuO1xuICBfaXNFZGl0b3JEZXN0cm95ZWQ6IGJvb2xlYW47XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ3V0dGVyTmFtZSBBIG5hbWUgZm9yIHRoaXMgZ3V0dGVyLiBNdXN0IG5vdCBiZSB1c2VkIGJ5IGFueSBhbm90aGVyXG4gICAqICAgZ3V0dGVyIGluIHRoaXMgVGV4dEVkaXRvci5cbiAgICogQHBhcmFtIGVkaXRvciBUaGUgVGV4dEVkaXRvciB0aGlzIEJsYW1lR3V0dGVyIHNob3VsZCBjcmVhdGUgVUkgZm9yLlxuICAgKiBAcGFyYW0gYmxhbWVQcm92aWRlciBUaGUgQmxhbWVQcm92aWRlciB0aGF0IHByb3ZpZGVzIHRoZSBhcHByb3ByaWF0ZSBibGFtZVxuICAgKiAgIGluZm9ybWF0aW9uIGZvciB0aGlzIEJsYW1lR3V0dGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZ3V0dGVyTmFtZTogc3RyaW5nLCBlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgYmxhbWVQcm92aWRlcjogQmxhbWVQcm92aWRlcikge1xuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5faXNFZGl0b3JEZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9ibGFtZVByb3ZpZGVyID0gYmxhbWVQcm92aWRlcjtcbiAgICB0aGlzLl9jaGFuZ2VzZXRTcGFuQ2xhc3NOYW1lID0gQ0hBTkdFU0VUX0NTU19DTEFTUztcbiAgICB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2d1dHRlciA9IGVkaXRvci5hZGRHdXR0ZXIoe25hbWU6IGd1dHRlck5hbWV9KTtcbiAgICB0aGlzLl91cGRhdGVHdXR0ZXJXaWR0aFRvUGl4ZWxXaWR0aChCTEFNRV9HVVRURVJfREVGQVVMVF9XSURUSCk7XG5cbiAgICAvLyBJZiBnZXRVcmxGb3JSZXZpc2lvbigpIGlzIGF2YWlsYWJsZSwgYWRkIGEgc2luZ2xlLCB0b3AtbGV2ZWwgY2xpY2sgaGFuZGxlciBmb3IgdGhlIGd1dHRlci5cbiAgICBpZiAodHlwZW9mIGJsYW1lUHJvdmlkZXIuZ2V0VXJsRm9yUmV2aXNpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIFdlIGFsc28gd2FudCB0byBzdHlsZSB0aGUgY2hhbmdlc2V0IGRpZmZlcmVudGx5IGlmIGl0IGlzIGNsaWNrYWJsZS5cbiAgICAgIHRoaXMuX2NoYW5nZXNldFNwYW5DbGFzc05hbWUgKz0gJyAnICsgQ0xJQ0tBQkxFX0NIQU5HRVNFVF9DU1NfQ0xBU1M7XG5cbiAgICAgIC8vICRGbG93SXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8xMjQyXG4gICAgICBjb25zdCBvbkNsaWNrOiAoZXZ0OiBFdmVudCkgPT4gUHJvbWlzZTx2b2lkPiA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgIGNvbnN0IGd1dHRlclZpZXc6IEhUTUxFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgICBndXR0ZXJWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZCh0aGlzLl9ndXR0ZXIub25EaWREZXN0cm95KFxuICAgICAgICAgICgpID0+IGd1dHRlclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKVxuICAgICAgKSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLl9pc0VkaXRvckRlc3Ryb3llZCA9IHRydWU7XG4gICAgfSkpO1xuICAgIHRoaXMuX2ZldGNoQW5kRGlzcGxheUJsYW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIHVzZXIgY2xpY2tlZCBvbiBhIENoYW5nZVNldCBJRCwgZXh0cmFjdCBpdCBmcm9tIHRoZSBET00gZWxlbWVudCB2aWEgdGhlIGRhdGEtIGF0dHJpYnV0ZVxuICAgKiBhbmQgZmluZCB0aGUgY29ycmVzcG9uZGluZyBEaWZmZXJlbnRpYWwgcmV2aXNpb24uIElmIHN1Y2Nlc3NmdWwsIG9wZW4gdGhlIFVSTCBmb3IgdGhlIHJldmlzaW9uLlxuICAgKi9cbiAgYXN5bmMgX29uQ2xpY2soZTogRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRhdGFzZXQ6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0gKHRhcmdldDogYW55KS5kYXRhc2V0O1xuICAgIGNvbnN0IGNoYW5nZXNldCA9IGRhdGFzZXRbSEdfQ0hBTkdFU0VUX0RBVEFfQVRUUklCVVRFXTtcbiAgICBpZiAoIWNoYW5nZXNldCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGJsYW1lUHJvdmlkZXIgPSB0aGlzLl9ibGFtZVByb3ZpZGVyO1xuICAgIGludmFyaWFudCh0eXBlb2YgYmxhbWVQcm92aWRlci5nZXRVcmxGb3JSZXZpc2lvbiA9PT0gJ2Z1bmN0aW9uJyk7XG4gICAgY29uc3QgdXJsID0gYXdhaXQgYmxhbWVQcm92aWRlci5nZXRVcmxGb3JSZXZpc2lvbih0aGlzLl9lZGl0b3IsIGNoYW5nZXNldCk7XG4gICAgaWYgKHVybCkge1xuICAgICAgLy8gTm90ZSB0aGF0ICdzaGVsbCcgaXMgbm90IHRoZSBwdWJsaWMgJ3NoZWxsJyBwYWNrYWdlIG9uIG5wbSBidXQgYW4gQXRvbSBidWlsdC1pbi5cbiAgICAgIHJlcXVpcmUoJ3NoZWxsJykub3BlbkV4dGVybmFsKHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKGBObyBVUkwgZm91bmQgZm9yICR7Y2hhbmdlc2V0fS5gKTtcbiAgICB9XG5cbiAgICB0cmFjaygnYmxhbWUtZ3V0dGVyLWNsaWNrLXJldmlzaW9uJywge1xuICAgICAgZWRpdG9yUGF0aDogdGhpcy5fZWRpdG9yLmdldFBhdGgoKSB8fCAnJyxcbiAgICAgIHVybDogdXJsIHx8ICcnLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2ZldGNoQW5kRGlzcGxheUJsYW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIEFkZCBhIGxvYWRpbmcgc3Bpbm5lciB3aGlsZSB3ZSBmZXRjaCB0aGUgYmxhbWUuXG4gICAgdGhpcy5fYWRkTG9hZGluZ1NwaW5uZXIoKTtcblxuICAgIGxldCBuZXdCbGFtZTtcbiAgICB0cnkge1xuICAgICAgbmV3QmxhbWUgPSBhd2FpdCB0aGlzLl9ibGFtZVByb3ZpZGVyLmdldEJsYW1lRm9yRWRpdG9yKHRoaXMuX2VkaXRvcik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgYEZhaWxlZCB0byBmZXRjaCBibGFtZSB0byBkaXNwbGF5LiBgICtcbiAgICAgICAgYFRoZSBmaWxlIGlzIGVtcHR5IG9yIHVudHJhY2tlZCBvciB0aGUgcmVwb3NpdG9yeSBjYW5ub3QgYmUgcmVhY2hlZC5gLFxuICAgICAgICBlcnJvcixcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIFRoZSBCbGFtZUd1dHRlciBjb3VsZCBoYXZlIGJlZW4gZGVzdHJveWVkIHdoaWxlIGJsYW1lIHdhcyBiZWluZyBmZXRjaGVkLlxuICAgIGlmICh0aGlzLl9pc0Rlc3Ryb3llZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFJlbW92ZSB0aGUgbG9hZGluZyBzcGlubmVyIGJlZm9yZSBzZXR0aW5nIHRoZSBjb250ZW50cyBvZiB0aGUgYmxhbWUgZ3V0dGVyLlxuICAgIHRoaXMuX2NsZWFuVXBMb2FkaW5nU3Bpbm5lcigpO1xuXG4gICAgdGhpcy5fdXBkYXRlQmxhbWUobmV3QmxhbWUpO1xuICB9XG5cbiAgX2FkZExvYWRpbmdTcGlubmVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZyA9IHRydWU7XG4gICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJUaW1lb3V0SWQgPSB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZyA9IGZhbHNlO1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2LmlkID0gTE9BRElOR19TUElOTkVSX0lEO1xuICAgICAgY29uc3QgZ3V0dGVyVmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9ndXR0ZXIpO1xuICAgICAgZ3V0dGVyVmlldy5hcHBlbmRDaGlsZCh0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdik7XG4gICAgfSwgTVNfVE9fV0FJVF9CRUZPUkVfU1BJTk5FUik7XG4gIH1cblxuICBfY2xlYW5VcExvYWRpbmdTcGlubmVyKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZykge1xuICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aGlzLl9sb2FkaW5nU3Bpbm5lclRpbWVvdXRJZCk7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZyA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYpIHtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2LnJlbW92ZSgpO1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSB0cnVlO1xuICAgIHRoaXMuX2NsZWFuVXBMb2FkaW5nU3Bpbm5lcigpO1xuICAgIGlmICghdGhpcy5faXNFZGl0b3JEZXN0cm95ZWQpIHtcbiAgICAgIC8vIER1ZSB0byBhIGJ1ZyBpbiB0aGUgR3V0dGVyIEFQSSwgZGVzdHJveWluZyBhIEd1dHRlciBhZnRlciB0aGUgZWRpdG9yXG4gICAgICAvLyBoYXMgYmVlbiBkZXN0cm95ZWQgcmVzdWx0cyBpbiBhbiBleGNlcHRpb24uXG4gICAgICB0aGlzLl9ndXR0ZXIuZGVzdHJveSgpO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGRlY29yYXRpb24gb2YgdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi52YWx1ZXMoKSkge1xuICAgICAgZGVjb3JhdGlvbi5nZXRNYXJrZXIoKS5kZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIEJsYW1lRm9yRWRpdG9yIGNvbXBsZXRlbHkgcmVwbGFjZXMgYW55IHByZXZpb3VzIGJsYW1lIGluZm9ybWF0aW9uLlxuICBAdHJhY2tUaW1pbmcoJ2JsYW1lLXVpLmJsYW1lLWd1dHRlci51cGRhdGVCbGFtZScpXG4gIF91cGRhdGVCbGFtZShibGFtZUZvckVkaXRvcjogQmxhbWVGb3JFZGl0b3IpOiB2b2lkIHtcbiAgICBpZiAoYmxhbWVGb3JFZGl0b3Iuc2l6ZSA9PT0gMCkge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXG4gICAgICAgICAgYEZvdW5kIG5vIGJsYW1lIHRvIGRpc3BsYXkuIElzIHRoaXMgZmlsZSBlbXB0eSBvciB1bnRyYWNrZWQ/XG4gICAgICAgICAgSWYgbm90LCBjaGVjayBmb3IgZXJyb3JzIGluIHRoZSBOdWNsaWRlIGxvZ3MgbG9jYWwgdG8geW91ciByZXBvLmApO1xuICAgIH1cbiAgICBjb25zdCBhbGxQcmV2aW91c0JsYW1lZExpbmVzID0gbmV3IFNldCh0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLmtleXMoKSk7XG5cbiAgICBsZXQgbG9uZ2VzdEJsYW1lID0gMDtcbiAgICBmb3IgKGNvbnN0IGJsYW1lSW5mbyBvZiBibGFtZUZvckVkaXRvci52YWx1ZXMoKSkge1xuICAgICAgbGV0IGJsYW1lTGVuZ3RoID0gYmxhbWVJbmZvLmF1dGhvci5sZW5ndGg7XG4gICAgICBpZiAoYmxhbWVJbmZvLmNoYW5nZXNldCkge1xuICAgICAgICBibGFtZUxlbmd0aCArPSBibGFtZUluZm8uY2hhbmdlc2V0Lmxlbmd0aCArIDE7XG4gICAgICB9XG4gICAgICBpZiAoYmxhbWVMZW5ndGggPiBsb25nZXN0QmxhbWUpIHtcbiAgICAgICAgbG9uZ2VzdEJsYW1lID0gYmxhbWVMZW5ndGg7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbYnVmZmVyTGluZSwgYmxhbWVJbmZvXSBvZiBibGFtZUZvckVkaXRvcikge1xuICAgICAgdGhpcy5fc2V0QmxhbWVMaW5lKGJ1ZmZlckxpbmUsIGJsYW1lSW5mbywgbG9uZ2VzdEJsYW1lKTtcbiAgICAgIGFsbFByZXZpb3VzQmxhbWVkTGluZXMuZGVsZXRlKGJ1ZmZlckxpbmUpO1xuICAgIH1cblxuICAgIC8vIEFueSBsaW5lcyB0aGF0IHdlcmVuJ3QgaW4gdGhlIG5ldyBibGFtZUZvckVkaXRvciBhcmUgb3V0ZGF0ZWQuXG4gICAgZm9yIChjb25zdCBvbGRMaW5lIG9mIGFsbFByZXZpb3VzQmxhbWVkTGluZXMpIHtcbiAgICAgIHRoaXMuX3JlbW92ZUJsYW1lTGluZShvbGRMaW5lKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIHdpZHRoIG9mIHRoZSBndXR0ZXIgYWNjb3JkaW5nIHRvIHRoZSBuZXcgY29udGVudHMuXG4gICAgdGhpcy5fdXBkYXRlR3V0dGVyV2lkdGhUb0NoYXJhY3Rlckxlbmd0aChsb25nZXN0QmxhbWUpO1xuICB9XG5cbiAgX3VwZGF0ZUd1dHRlcldpZHRoVG9QaXhlbFdpZHRoKHBpeGVsV2lkdGg6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGd1dHRlclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZ3V0dGVyKTtcbiAgICBndXR0ZXJWaWV3LnN0eWxlLndpZHRoID0gYCR7cGl4ZWxXaWR0aH1weGA7XG4gIH1cblxuICBfdXBkYXRlR3V0dGVyV2lkdGhUb0NoYXJhY3Rlckxlbmd0aChjaGFyYWN0ZXJzOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBndXR0ZXJWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgZ3V0dGVyVmlldy5zdHlsZS53aWR0aCA9IGAke2NoYXJhY3RlcnN9Y2hgO1xuICB9XG5cbiAgX3NldEJsYW1lTGluZShidWZmZXJMaW5lOiBudW1iZXIsIGJsYW1lSW5mbzogQmxhbWVJbmZvLCBsb25nZXN0QmxhbWU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jcmVhdGVHdXR0ZXJJdGVtKGJsYW1lSW5mbywgbG9uZ2VzdEJsYW1lKTtcbiAgICBjb25zdCBkZWNvcmF0aW9uUHJvcGVydGllcyA9IHtcbiAgICAgIHR5cGU6ICdndXR0ZXInLFxuICAgICAgZ3V0dGVyTmFtZTogdGhpcy5fZ3V0dGVyLm5hbWUsXG4gICAgICBjbGFzczogQkxBTUVfREVDT1JBVElPTl9DTEFTUyxcbiAgICAgIGl0ZW0sXG4gICAgfTtcblxuICAgIGxldCBkZWNvcmF0aW9uID0gdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5nZXQoYnVmZmVyTGluZSk7XG4gICAgaWYgKCFkZWNvcmF0aW9uKSB7XG4gICAgICBjb25zdCBidWZmZXJMaW5lSGVhZFBvaW50ID0gW2J1ZmZlckxpbmUsIDBdO1xuICAgICAgLy8gVGhlIHJhbmdlIG9mIHRoaXMgTWFya2VyIGRvZXNuJ3QgbWF0dGVyLCBvbmx5IHRoZSBsaW5lIGl0IGlzIG9uLCBiZWNhdXNlXG4gICAgICAvLyB0aGUgRGVjb3JhdGlvbiBpcyBmb3IgYSBHdXR0ZXIuXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtidWZmZXJMaW5lSGVhZFBvaW50LCBidWZmZXJMaW5lSGVhZFBvaW50XSk7XG4gICAgICBkZWNvcmF0aW9uID0gdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwgZGVjb3JhdGlvblByb3BlcnRpZXMpO1xuICAgICAgdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5zZXQoYnVmZmVyTGluZSwgZGVjb3JhdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhkZWNvcmF0aW9uUHJvcGVydGllcyk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUJsYW1lTGluZShidWZmZXJMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBibGFtZURlY29yYXRpb24gPSB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLmdldChidWZmZXJMaW5lKTtcbiAgICBpZiAoIWJsYW1lRGVjb3JhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgcmVjb21tZW5kZWQgd2F5IG9mIGRlc3Ryb3lpbmcgYSBkZWNvcmF0aW9uIGlzIGJ5IGRlc3Ryb3lpbmcgaXRzIG1hcmtlci5cbiAgICBibGFtZURlY29yYXRpb24uZ2V0TWFya2VyKCkuZGVzdHJveSgpO1xuICAgIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24uZGVsZXRlKGJ1ZmZlckxpbmUpO1xuICB9XG5cbiAgX2NyZWF0ZUd1dHRlckl0ZW0oYmxhbWVJbmZvOiBCbGFtZUluZm8sIGxvbmdlc3RCbGFtZTogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcbiAgICBjb25zdCBpdGVtID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29uc3QgYXV0aG9yU3BhbiA9IGRvYy5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYXV0aG9yU3Bhbi5pbm5lclRleHQgPSBibGFtZUluZm8uYXV0aG9yO1xuICAgIGl0ZW0uYXBwZW5kQ2hpbGQoYXV0aG9yU3Bhbik7XG5cbiAgICBpZiAoYmxhbWVJbmZvLmNoYW5nZXNldCkge1xuICAgICAgY29uc3QgbnVtU3BhY2VzID0gbG9uZ2VzdEJsYW1lIC0gYmxhbWVJbmZvLmF1dGhvci5sZW5ndGggLSBibGFtZUluZm8uY2hhbmdlc2V0Lmxlbmd0aDtcbiAgICAgIC8vIEluc2VydCBub24tYnJlYWtpbmcgc3BhY2VzIHRvIGVuc3VyZSB0aGUgY2hhbmdlc2V0IGlzIHJpZ2h0LWFsaWduZWQuXG4gICAgICAvLyBBZG1pdHRlZGx5LCB0aGlzIGlzIGEgbGl0dGxlIGdyb3NzLCBidXQgaXQgc2VlbXMgYmV0dGVyIHRoYW4gc2V0dGluZyBzdHlsZS53aWR0aCBvbiBldmVyeVxuICAgICAgLy8gaXRlbSB0aGF0IHdlIGNyZWF0ZSBhbmQgaGF2aW5nIHRvIGdpdmUgaXQgYSBzcGVjaWFsIGZsZXhib3ggbGF5b3V0LiBIb29yYXkgbW9ub3NwYWNlIVxuICAgICAgaXRlbS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoJ1xcdTAwQTAnLnJlcGVhdChudW1TcGFjZXMpKSk7XG5cbiAgICAgIGNvbnN0IGNoYW5nZXNldFNwYW4gPSBkb2MuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgY2hhbmdlc2V0U3Bhbi5jbGFzc05hbWUgPSB0aGlzLl9jaGFuZ2VzZXRTcGFuQ2xhc3NOYW1lO1xuICAgICAgY2hhbmdlc2V0U3Bhbi5kYXRhc2V0W0hHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURV0gPSBibGFtZUluZm8uY2hhbmdlc2V0O1xuICAgICAgY2hhbmdlc2V0U3Bhbi5pbm5lclRleHQgPSBibGFtZUluZm8uY2hhbmdlc2V0O1xuICAgICAgaXRlbS5hcHBlbmRDaGlsZChjaGFuZ2VzZXRTcGFuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxufVxuIl19