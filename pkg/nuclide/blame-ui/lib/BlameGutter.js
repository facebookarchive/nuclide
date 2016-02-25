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
//# sourceMappingURL=data:application/json;base64,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QWEsQ0FBQyxDQUFDO09BQ2pDOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBQ2IiLCJmaWxlIjoiQmxhbWVHdXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEJsYW1lRm9yRWRpdG9yLFxuICBCbGFtZUluZm8sXG4gIEJsYW1lUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL2JsYW1lLWJhc2UnO1xuXG5jb25zdCB7QkxBTUVfREVDT1JBVElPTl9DTEFTU30gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCBCTEFNRV9HVVRURVJfREVGQVVMVF9XSURUSCA9IDUwO1xuY29uc3QgTE9BRElOR19TUElOTkVSX0lEID0gJ2JsYW1lLWxvYWRpbmctc3Bpbm5lcic7XG5jb25zdCBNU19UT19XQUlUX0JFRk9SRV9TUElOTkVSID0gMjAwMDtcbmNvbnN0IENIQU5HRVNFVF9DU1NfQ0xBU1MgPSAnbnVjbGlkZS1ibGFtZS11aS1oYXNoJztcbmNvbnN0IENMSUNLQUJMRV9DSEFOR0VTRVRfQ1NTX0NMQVNTID0gJ251Y2xpZGUtYmxhbWUtdWktaGFzaC1jbGlja2FibGUnO1xuY29uc3QgSEdfQ0hBTkdFU0VUX0RBVEFfQVRUUklCVVRFID0gJ2hnQ2hhbmdlc2V0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBfZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIF9ibGFtZVByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyO1xuICBfY2hhbmdlc2V0U3BhbkNsYXNzTmFtZTogc3RyaW5nO1xuICBfYnVmZmVyTGluZVRvRGVjb3JhdGlvbjogTWFwPG51bWJlciwgYXRvbSREZWNvcmF0aW9uPjtcbiAgX2d1dHRlcjogYXRvbSRHdXR0ZXI7XG4gIF9sb2FkaW5nU3Bpbm5lcklzUGVuZGluZzogYm9vbGVhbjtcbiAgX2xvYWRpbmdTcGlubmVyRGl2OiA/SFRNTEVsZW1lbnQ7XG4gIF9sb2FkaW5nU3Bpbm5lclRpbWVvdXRJZDogbnVtYmVyO1xuICBfaXNEZXN0cm95ZWQ6IGJvb2xlYW47XG4gIF9pc0VkaXRvckRlc3Ryb3llZDogYm9vbGVhbjtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBndXR0ZXJOYW1lIEEgbmFtZSBmb3IgdGhpcyBndXR0ZXIuIE11c3Qgbm90IGJlIHVzZWQgYnkgYW55IGFub3RoZXJcbiAgICogICBndXR0ZXIgaW4gdGhpcyBUZXh0RWRpdG9yLlxuICAgKiBAcGFyYW0gZWRpdG9yIFRoZSBUZXh0RWRpdG9yIHRoaXMgQmxhbWVHdXR0ZXIgc2hvdWxkIGNyZWF0ZSBVSSBmb3IuXG4gICAqIEBwYXJhbSBibGFtZVByb3ZpZGVyIFRoZSBCbGFtZVByb3ZpZGVyIHRoYXQgcHJvdmlkZXMgdGhlIGFwcHJvcHJpYXRlIGJsYW1lXG4gICAqICAgaW5mb3JtYXRpb24gZm9yIHRoaXMgQmxhbWVHdXR0ZXIuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihndXR0ZXJOYW1lOiBzdHJpbmcsIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLCBibGFtZVByb3ZpZGVyOiBCbGFtZVByb3ZpZGVyKSB7XG4gICAgdGhpcy5faXNEZXN0cm95ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9pc0VkaXRvckRlc3Ryb3llZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fZWRpdG9yID0gZWRpdG9yO1xuICAgIHRoaXMuX2JsYW1lUHJvdmlkZXIgPSBibGFtZVByb3ZpZGVyO1xuICAgIHRoaXMuX2NoYW5nZXNldFNwYW5DbGFzc05hbWUgPSBDSEFOR0VTRVRfQ1NTX0NMQVNTO1xuICAgIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24gPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fZ3V0dGVyID0gZWRpdG9yLmFkZEd1dHRlcih7bmFtZTogZ3V0dGVyTmFtZX0pO1xuICAgIHRoaXMuX3VwZGF0ZUd1dHRlcldpZHRoVG9QaXhlbFdpZHRoKEJMQU1FX0dVVFRFUl9ERUZBVUxUX1dJRFRIKTtcblxuICAgIC8vIElmIGdldFVybEZvclJldmlzaW9uKCkgaXMgYXZhaWxhYmxlLCBhZGQgYSBzaW5nbGUsIHRvcC1sZXZlbCBjbGljayBoYW5kbGVyIGZvciB0aGUgZ3V0dGVyLlxuICAgIGlmICh0eXBlb2YgYmxhbWVQcm92aWRlci5nZXRVcmxGb3JSZXZpc2lvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gV2UgYWxzbyB3YW50IHRvIHN0eWxlIHRoZSBjaGFuZ2VzZXQgZGlmZmVyZW50bHkgaWYgaXQgaXMgY2xpY2thYmxlLlxuICAgICAgdGhpcy5fY2hhbmdlc2V0U3BhbkNsYXNzTmFtZSArPSAnICcgKyBDTElDS0FCTEVfQ0hBTkdFU0VUX0NTU19DTEFTUztcblxuICAgICAgY29uc3Qgb25DbGljazogKGV2dDogRXZlbnQpID0+IFByb21pc2U8dm9pZD4gPSB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgICBjb25zdCBndXR0ZXJWaWV3OiBIVE1MRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9ndXR0ZXIpO1xuICAgICAgZ3V0dGVyVmlldy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQodGhpcy5fZ3V0dGVyLm9uRGlkRGVzdHJveShcbiAgICAgICAgICAoKSA9PiBndXR0ZXJWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljaylcbiAgICAgICkpO1xuICAgIH1cblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgdGhpcy5faXNFZGl0b3JEZXN0cm95ZWQgPSB0cnVlO1xuICAgIH0pKTtcbiAgICB0aGlzLl9mZXRjaEFuZERpc3BsYXlCbGFtZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSB1c2VyIGNsaWNrZWQgb24gYSBDaGFuZ2VTZXQgSUQsIGV4dHJhY3QgaXQgZnJvbSB0aGUgRE9NIGVsZW1lbnQgdmlhIHRoZSBkYXRhLSBhdHRyaWJ1dGVcbiAgICogYW5kIGZpbmQgdGhlIGNvcnJlc3BvbmRpbmcgRGlmZmVyZW50aWFsIHJldmlzaW9uLiBJZiBzdWNjZXNzZnVsLCBvcGVuIHRoZSBVUkwgZm9yIHRoZSByZXZpc2lvbi5cbiAgICovXG4gIGFzeW5jIF9vbkNsaWNrKGU6IEV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhc2V0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9ICh0YXJnZXQ6IGFueSkuZGF0YXNldDtcbiAgICBjb25zdCBjaGFuZ2VzZXQgPSBkYXRhc2V0W0hHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURV07XG4gICAgaWYgKCFjaGFuZ2VzZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBibGFtZVByb3ZpZGVyID0gdGhpcy5fYmxhbWVQcm92aWRlcjtcbiAgICBpbnZhcmlhbnQodHlwZW9mIGJsYW1lUHJvdmlkZXIuZ2V0VXJsRm9yUmV2aXNpb24gPT09ICdmdW5jdGlvbicpO1xuICAgIGNvbnN0IHVybCA9IGF3YWl0IGJsYW1lUHJvdmlkZXIuZ2V0VXJsRm9yUmV2aXNpb24odGhpcy5fZWRpdG9yLCBjaGFuZ2VzZXQpO1xuICAgIGlmICh1cmwpIHtcbiAgICAgIC8vIE5vdGUgdGhhdCAnc2hlbGwnIGlzIG5vdCB0aGUgcHVibGljICdzaGVsbCcgcGFja2FnZSBvbiBucG0gYnV0IGFuIEF0b20gYnVpbHQtaW4uXG4gICAgICByZXF1aXJlKCdzaGVsbCcpLm9wZW5FeHRlcm5hbCh1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhgTm8gVVJMIGZvdW5kIGZvciAke2NoYW5nZXNldH0uYCk7XG4gICAgfVxuXG4gICAgdHJhY2soJ2JsYW1lLWd1dHRlci1jbGljay1yZXZpc2lvbicsIHtcbiAgICAgIGVkaXRvclBhdGg6IHRoaXMuX2VkaXRvci5nZXRQYXRoKCkgfHwgJycsXG4gICAgICB1cmw6IHVybCB8fCAnJyxcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9mZXRjaEFuZERpc3BsYXlCbGFtZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBBZGQgYSBsb2FkaW5nIHNwaW5uZXIgd2hpbGUgd2UgZmV0Y2ggdGhlIGJsYW1lLlxuICAgIHRoaXMuX2FkZExvYWRpbmdTcGlubmVyKCk7XG5cbiAgICBsZXQgbmV3QmxhbWU7XG4gICAgdHJ5IHtcbiAgICAgIG5ld0JsYW1lID0gYXdhaXQgdGhpcy5fYmxhbWVQcm92aWRlci5nZXRCbGFtZUZvckVkaXRvcih0aGlzLl9lZGl0b3IpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgIGBGYWlsZWQgdG8gZmV0Y2ggYmxhbWUgdG8gZGlzcGxheS4gYCArXG4gICAgICAgIGBUaGUgZmlsZSBpcyBlbXB0eSBvciB1bnRyYWNrZWQgb3IgdGhlIHJlcG9zaXRvcnkgY2Fubm90IGJlIHJlYWNoZWQuYCxcbiAgICAgICAgZXJyb3IsXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgQmxhbWVHdXR0ZXIgY291bGQgaGF2ZSBiZWVuIGRlc3Ryb3llZCB3aGlsZSBibGFtZSB3YXMgYmVpbmcgZmV0Y2hlZC5cbiAgICBpZiAodGhpcy5faXNEZXN0cm95ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIGxvYWRpbmcgc3Bpbm5lciBiZWZvcmUgc2V0dGluZyB0aGUgY29udGVudHMgb2YgdGhlIGJsYW1lIGd1dHRlci5cbiAgICB0aGlzLl9jbGVhblVwTG9hZGluZ1NwaW5uZXIoKTtcblxuICAgIHRoaXMuX3VwZGF0ZUJsYW1lKG5ld0JsYW1lKTtcbiAgfVxuXG4gIF9hZGRMb2FkaW5nU3Bpbm5lcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmcgPSB0cnVlO1xuICAgIHRoaXMuX2xvYWRpbmdTcGlubmVyVGltZW91dElkID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmcgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdi5pZCA9IExPQURJTkdfU1BJTk5FUl9JRDtcbiAgICAgIGNvbnN0IGd1dHRlclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcodGhpcy5fZ3V0dGVyKTtcbiAgICAgIGd1dHRlclZpZXcuYXBwZW5kQ2hpbGQodGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYpO1xuICAgIH0sIE1TX1RPX1dBSVRfQkVGT1JFX1NQSU5ORVIpO1xuICB9XG5cbiAgX2NsZWFuVXBMb2FkaW5nU3Bpbm5lcigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmcpIHtcbiAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGhpcy5fbG9hZGluZ1NwaW5uZXJUaW1lb3V0SWQpO1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2KSB7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdi5yZW1vdmUoKTtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZTtcbiAgICB0aGlzLl9jbGVhblVwTG9hZGluZ1NwaW5uZXIoKTtcbiAgICBpZiAoIXRoaXMuX2lzRWRpdG9yRGVzdHJveWVkKSB7XG4gICAgICAvLyBEdWUgdG8gYSBidWcgaW4gdGhlIEd1dHRlciBBUEksIGRlc3Ryb3lpbmcgYSBHdXR0ZXIgYWZ0ZXIgdGhlIGVkaXRvclxuICAgICAgLy8gaGFzIGJlZW4gZGVzdHJveWVkIHJlc3VsdHMgaW4gYW4gZXhjZXB0aW9uLlxuICAgICAgdGhpcy5fZ3V0dGVyLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBkZWNvcmF0aW9uIG9mIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24udmFsdWVzKCkpIHtcbiAgICAgIGRlY29yYXRpb24uZ2V0TWFya2VyKCkuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSBCbGFtZUZvckVkaXRvciBjb21wbGV0ZWx5IHJlcGxhY2VzIGFueSBwcmV2aW91cyBibGFtZSBpbmZvcm1hdGlvbi5cbiAgQHRyYWNrVGltaW5nKCdibGFtZS11aS5ibGFtZS1ndXR0ZXIudXBkYXRlQmxhbWUnKVxuICBfdXBkYXRlQmxhbWUoYmxhbWVGb3JFZGl0b3I6IEJsYW1lRm9yRWRpdG9yKTogdm9pZCB7XG4gICAgaWYgKGJsYW1lRm9yRWRpdG9yLnNpemUgPT09IDApIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvKFxuICAgICAgICAgIGBGb3VuZCBubyBibGFtZSB0byBkaXNwbGF5LiBJcyB0aGlzIGZpbGUgZW1wdHkgb3IgdW50cmFja2VkP1xuICAgICAgICAgIElmIG5vdCwgY2hlY2sgZm9yIGVycm9ycyBpbiB0aGUgTnVjbGlkZSBsb2dzIGxvY2FsIHRvIHlvdXIgcmVwby5gKTtcbiAgICB9XG4gICAgY29uc3QgYWxsUHJldmlvdXNCbGFtZWRMaW5lcyA9IG5ldyBTZXQodGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5rZXlzKCkpO1xuXG4gICAgbGV0IGxvbmdlc3RCbGFtZSA9IDA7XG4gICAgZm9yIChjb25zdCBibGFtZUluZm8gb2YgYmxhbWVGb3JFZGl0b3IudmFsdWVzKCkpIHtcbiAgICAgIGxldCBibGFtZUxlbmd0aCA9IGJsYW1lSW5mby5hdXRob3IubGVuZ3RoO1xuICAgICAgaWYgKGJsYW1lSW5mby5jaGFuZ2VzZXQpIHtcbiAgICAgICAgYmxhbWVMZW5ndGggKz0gYmxhbWVJbmZvLmNoYW5nZXNldC5sZW5ndGggKyAxO1xuICAgICAgfVxuICAgICAgaWYgKGJsYW1lTGVuZ3RoID4gbG9uZ2VzdEJsYW1lKSB7XG4gICAgICAgIGxvbmdlc3RCbGFtZSA9IGJsYW1lTGVuZ3RoO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2J1ZmZlckxpbmUsIGJsYW1lSW5mb10gb2YgYmxhbWVGb3JFZGl0b3IpIHtcbiAgICAgIHRoaXMuX3NldEJsYW1lTGluZShidWZmZXJMaW5lLCBibGFtZUluZm8sIGxvbmdlc3RCbGFtZSk7XG4gICAgICBhbGxQcmV2aW91c0JsYW1lZExpbmVzLmRlbGV0ZShidWZmZXJMaW5lKTtcbiAgICB9XG5cbiAgICAvLyBBbnkgbGluZXMgdGhhdCB3ZXJlbid0IGluIHRoZSBuZXcgYmxhbWVGb3JFZGl0b3IgYXJlIG91dGRhdGVkLlxuICAgIGZvciAoY29uc3Qgb2xkTGluZSBvZiBhbGxQcmV2aW91c0JsYW1lZExpbmVzKSB7XG4gICAgICB0aGlzLl9yZW1vdmVCbGFtZUxpbmUob2xkTGluZSk7XG4gICAgfVxuXG4gICAgLy8gVXBkYXRlIHRoZSB3aWR0aCBvZiB0aGUgZ3V0dGVyIGFjY29yZGluZyB0byB0aGUgbmV3IGNvbnRlbnRzLlxuICAgIHRoaXMuX3VwZGF0ZUd1dHRlcldpZHRoVG9DaGFyYWN0ZXJMZW5ndGgobG9uZ2VzdEJsYW1lKTtcbiAgfVxuXG4gIF91cGRhdGVHdXR0ZXJXaWR0aFRvUGl4ZWxXaWR0aChwaXhlbFdpZHRoOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBndXR0ZXJWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgZ3V0dGVyVmlldy5zdHlsZS53aWR0aCA9IGAke3BpeGVsV2lkdGh9cHhgO1xuICB9XG5cbiAgX3VwZGF0ZUd1dHRlcldpZHRoVG9DaGFyYWN0ZXJMZW5ndGgoY2hhcmFjdGVyczogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgZ3V0dGVyVmlldyA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9ndXR0ZXIpO1xuICAgIGd1dHRlclZpZXcuc3R5bGUud2lkdGggPSBgJHtjaGFyYWN0ZXJzfWNoYDtcbiAgfVxuXG4gIF9zZXRCbGFtZUxpbmUoYnVmZmVyTGluZTogbnVtYmVyLCBibGFtZUluZm86IEJsYW1lSW5mbywgbG9uZ2VzdEJsYW1lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBpdGVtID0gdGhpcy5fY3JlYXRlR3V0dGVySXRlbShibGFtZUluZm8sIGxvbmdlc3RCbGFtZSk7XG4gICAgY29uc3QgZGVjb3JhdGlvblByb3BlcnRpZXMgPSB7XG4gICAgICB0eXBlOiAnZ3V0dGVyJyxcbiAgICAgIGd1dHRlck5hbWU6IHRoaXMuX2d1dHRlci5uYW1lLFxuICAgICAgY2xhc3M6IEJMQU1FX0RFQ09SQVRJT05fQ0xBU1MsXG4gICAgICBpdGVtLFxuICAgIH07XG5cbiAgICBsZXQgZGVjb3JhdGlvbiA9IHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24uZ2V0KGJ1ZmZlckxpbmUpO1xuICAgIGlmICghZGVjb3JhdGlvbikge1xuICAgICAgY29uc3QgYnVmZmVyTGluZUhlYWRQb2ludCA9IFtidWZmZXJMaW5lLCAwXTtcbiAgICAgIC8vIFRoZSByYW5nZSBvZiB0aGlzIE1hcmtlciBkb2Vzbid0IG1hdHRlciwgb25seSB0aGUgbGluZSBpdCBpcyBvbiwgYmVjYXVzZVxuICAgICAgLy8gdGhlIERlY29yYXRpb24gaXMgZm9yIGEgR3V0dGVyLlxuICAgICAgY29uc3QgbWFya2VyID0gdGhpcy5fZWRpdG9yLm1hcmtCdWZmZXJSYW5nZShbYnVmZmVyTGluZUhlYWRQb2ludCwgYnVmZmVyTGluZUhlYWRQb2ludF0pO1xuICAgICAgZGVjb3JhdGlvbiA9IHRoaXMuX2VkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIGRlY29yYXRpb25Qcm9wZXJ0aWVzKTtcbiAgICAgIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24uc2V0KGJ1ZmZlckxpbmUsIGRlY29yYXRpb24pO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWNvcmF0aW9uLnNldFByb3BlcnRpZXMoZGVjb3JhdGlvblByb3BlcnRpZXMpO1xuICAgIH1cbiAgfVxuXG4gIF9yZW1vdmVCbGFtZUxpbmUoYnVmZmVyTGluZTogbnVtYmVyKTogdm9pZCB7XG4gICAgY29uc3QgYmxhbWVEZWNvcmF0aW9uID0gdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5nZXQoYnVmZmVyTGluZSk7XG4gICAgaWYgKCFibGFtZURlY29yYXRpb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVGhlIHJlY29tbWVuZGVkIHdheSBvZiBkZXN0cm95aW5nIGEgZGVjb3JhdGlvbiBpcyBieSBkZXN0cm95aW5nIGl0cyBtYXJrZXIuXG4gICAgYmxhbWVEZWNvcmF0aW9uLmdldE1hcmtlcigpLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLmRlbGV0ZShidWZmZXJMaW5lKTtcbiAgfVxuXG4gIF9jcmVhdGVHdXR0ZXJJdGVtKGJsYW1lSW5mbzogQmxhbWVJbmZvLCBsb25nZXN0QmxhbWU6IG51bWJlcik6IEhUTUxFbGVtZW50IHtcbiAgICBjb25zdCBkb2MgPSB3aW5kb3cuZG9jdW1lbnQ7XG4gICAgY29uc3QgaXRlbSA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIGNvbnN0IGF1dGhvclNwYW4gPSBkb2MuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGF1dGhvclNwYW4uaW5uZXJUZXh0ID0gYmxhbWVJbmZvLmF1dGhvcjtcbiAgICBpdGVtLmFwcGVuZENoaWxkKGF1dGhvclNwYW4pO1xuXG4gICAgaWYgKGJsYW1lSW5mby5jaGFuZ2VzZXQpIHtcbiAgICAgIGNvbnN0IG51bVNwYWNlcyA9IGxvbmdlc3RCbGFtZSAtIGJsYW1lSW5mby5hdXRob3IubGVuZ3RoIC0gYmxhbWVJbmZvLmNoYW5nZXNldC5sZW5ndGg7XG4gICAgICAvLyBJbnNlcnQgbm9uLWJyZWFraW5nIHNwYWNlcyB0byBlbnN1cmUgdGhlIGNoYW5nZXNldCBpcyByaWdodC1hbGlnbmVkLlxuICAgICAgLy8gQWRtaXR0ZWRseSwgdGhpcyBpcyBhIGxpdHRsZSBncm9zcywgYnV0IGl0IHNlZW1zIGJldHRlciB0aGFuIHNldHRpbmcgc3R5bGUud2lkdGggb24gZXZlcnlcbiAgICAgIC8vIGl0ZW0gdGhhdCB3ZSBjcmVhdGUgYW5kIGhhdmluZyB0byBnaXZlIGl0IGEgc3BlY2lhbCBmbGV4Ym94IGxheW91dC4gSG9vcmF5IG1vbm9zcGFjZSFcbiAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKCdcXHUwMEEwJy5yZXBlYXQobnVtU3BhY2VzKSkpO1xuXG4gICAgICBjb25zdCBjaGFuZ2VzZXRTcGFuID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgIGNoYW5nZXNldFNwYW4uY2xhc3NOYW1lID0gdGhpcy5fY2hhbmdlc2V0U3BhbkNsYXNzTmFtZTtcbiAgICAgIGNoYW5nZXNldFNwYW4uZGF0YXNldFtIR19DSEFOR0VTRVRfREFUQV9BVFRSSUJVVEVdID0gYmxhbWVJbmZvLmNoYW5nZXNldDtcbiAgICAgIGNoYW5nZXNldFNwYW4uaW5uZXJUZXh0ID0gYmxhbWVJbmZvLmNoYW5nZXNldDtcbiAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoY2hhbmdlc2V0U3Bhbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0ZW07XG4gIH1cbn1cbiJdfQ==