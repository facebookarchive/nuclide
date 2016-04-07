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
        require('shell').openExternal(url);
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
//# sourceMappingURL=data:application/json;base64,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LE1BQU0sQ0FBQyxRQUFRLENBQUM7QUFDNUIsVUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFdEMsVUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QyxnQkFBVSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3hDLFVBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7O0FBRTdCLFVBQUksU0FBUyxDQUFDLFNBQVMsRUFBRTtBQUN2QixZQUFNLFNBQVMsR0FBRyxZQUFZLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7Ozs7QUFJdEYsWUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLEdBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVqRSxZQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hELHFCQUFhLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztBQUN2RCxxQkFBYSxDQUFDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDekUscUJBQWEsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM5QyxZQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO09BQ2pDOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBQ2IiLCJmaWxlIjoiQmxhbWVHdXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIEJsYW1lRm9yRWRpdG9yLFxuICBCbGFtZUluZm8sXG4gIEJsYW1lUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtYmxhbWUtYmFzZSc7XG5cbmNvbnN0IHtCTEFNRV9ERUNPUkFUSU9OX0NMQVNTfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5pbXBvcnQge3RyYWNrLCB0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3QgTVNfVE9fV0FJVF9CRUZPUkVfU1BJTk5FUiA9IDIwMDA7XG5jb25zdCBDSEFOR0VTRVRfQ1NTX0NMQVNTID0gJ251Y2xpZGUtYmxhbWUtdWktaGFzaCc7XG5jb25zdCBDTElDS0FCTEVfQ0hBTkdFU0VUX0NTU19DTEFTUyA9ICdudWNsaWRlLWJsYW1lLXVpLWhhc2gtY2xpY2thYmxlJztcbmNvbnN0IEhHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURSA9ICdoZ0NoYW5nZXNldCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcbiAgX2VkaXRvcjogYXRvbSRUZXh0RWRpdG9yO1xuICBfYmxhbWVQcm92aWRlcjogQmxhbWVQcm92aWRlcjtcbiAgX2NoYW5nZXNldFNwYW5DbGFzc05hbWU6IHN0cmluZztcbiAgX2J1ZmZlckxpbmVUb0RlY29yYXRpb246IE1hcDxudW1iZXIsIGF0b20kRGVjb3JhdGlvbj47XG4gIF9ndXR0ZXI6IGF0b20kR3V0dGVyO1xuICBfbG9hZGluZ1NwaW5uZXJJc1BlbmRpbmc6IGJvb2xlYW47XG4gIF9sb2FkaW5nU3Bpbm5lckRpdjogP0hUTUxFbGVtZW50O1xuICBfbG9hZGluZ1NwaW5uZXJUaW1lb3V0SWQ6IG51bWJlcjtcbiAgX2lzRGVzdHJveWVkOiBib29sZWFuO1xuICBfaXNFZGl0b3JEZXN0cm95ZWQ6IGJvb2xlYW47XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ3V0dGVyTmFtZSBBIG5hbWUgZm9yIHRoaXMgZ3V0dGVyLiBNdXN0IG5vdCBiZSB1c2VkIGJ5IGFueSBhbm90aGVyXG4gICAqICAgZ3V0dGVyIGluIHRoaXMgVGV4dEVkaXRvci5cbiAgICogQHBhcmFtIGVkaXRvciBUaGUgVGV4dEVkaXRvciB0aGlzIEJsYW1lR3V0dGVyIHNob3VsZCBjcmVhdGUgVUkgZm9yLlxuICAgKiBAcGFyYW0gYmxhbWVQcm92aWRlciBUaGUgQmxhbWVQcm92aWRlciB0aGF0IHByb3ZpZGVzIHRoZSBhcHByb3ByaWF0ZSBibGFtZVxuICAgKiAgIGluZm9ybWF0aW9uIGZvciB0aGlzIEJsYW1lR3V0dGVyLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZ3V0dGVyTmFtZTogc3RyaW5nLCBlZGl0b3I6IGF0b20kVGV4dEVkaXRvciwgYmxhbWVQcm92aWRlcjogQmxhbWVQcm92aWRlcikge1xuICAgIHRoaXMuX2lzRGVzdHJveWVkID0gZmFsc2U7XG4gICAgdGhpcy5faXNFZGl0b3JEZXN0cm95ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX2VkaXRvciA9IGVkaXRvcjtcbiAgICB0aGlzLl9ibGFtZVByb3ZpZGVyID0gYmxhbWVQcm92aWRlcjtcbiAgICB0aGlzLl9jaGFuZ2VzZXRTcGFuQ2xhc3NOYW1lID0gQ0hBTkdFU0VUX0NTU19DTEFTUztcbiAgICB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2d1dHRlciA9IGVkaXRvci5hZGRHdXR0ZXIoe25hbWU6IGd1dHRlck5hbWV9KTtcbiAgICBjb25zdCBndXR0ZXJWaWV3OiBIVE1MRWxlbWVudCA9IGF0b20udmlld3MuZ2V0Vmlldyh0aGlzLl9ndXR0ZXIpO1xuICAgIGd1dHRlclZpZXcuY2xhc3NMaXN0LmFkZCgnbnVjbGlkZS1ibGFtZScpO1xuXG4gICAgLy8gSWYgZ2V0VXJsRm9yUmV2aXNpb24oKSBpcyBhdmFpbGFibGUsIGFkZCBhIHNpbmdsZSwgdG9wLWxldmVsIGNsaWNrIGhhbmRsZXIgZm9yIHRoZSBndXR0ZXIuXG4gICAgaWYgKHR5cGVvZiBibGFtZVByb3ZpZGVyLmdldFVybEZvclJldmlzaW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBXZSBhbHNvIHdhbnQgdG8gc3R5bGUgdGhlIGNoYW5nZXNldCBkaWZmZXJlbnRseSBpZiBpdCBpcyBjbGlja2FibGUuXG4gICAgICB0aGlzLl9jaGFuZ2VzZXRTcGFuQ2xhc3NOYW1lICs9ICcgJyArIENMSUNLQUJMRV9DSEFOR0VTRVRfQ1NTX0NMQVNTO1xuXG4gICAgICBjb25zdCBvbkNsaWNrOiAoZXZ0OiBFdmVudCkgPT4gUHJvbWlzZTx2b2lkPiA9IHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKTtcbiAgICAgIGd1dHRlclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKHRoaXMuX2d1dHRlci5vbkRpZERlc3Ryb3koXG4gICAgICAgICAgKCkgPT4gZ3V0dGVyVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spXG4gICAgICApKTtcbiAgICB9XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgIHRoaXMuX2lzRWRpdG9yRGVzdHJveWVkID0gdHJ1ZTtcbiAgICB9KSk7XG4gICAgdGhpcy5fZmV0Y2hBbmREaXNwbGF5QmxhbWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgdXNlciBjbGlja2VkIG9uIGEgQ2hhbmdlU2V0IElELCBleHRyYWN0IGl0IGZyb20gdGhlIERPTSBlbGVtZW50IHZpYSB0aGUgZGF0YS0gYXR0cmlidXRlXG4gICAqIGFuZCBmaW5kIHRoZSBjb3JyZXNwb25kaW5nIERpZmZlcmVudGlhbCByZXZpc2lvbi4gSWYgc3VjY2Vzc2Z1bCwgb3BlbiB0aGUgVVJMIGZvciB0aGUgcmV2aXNpb24uXG4gICAqL1xuICBhc3luYyBfb25DbGljayhlOiBFdmVudCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHRhcmdldCA9IGUudGFyZ2V0O1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZGF0YXNldDoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSAodGFyZ2V0OiBhbnkpLmRhdGFzZXQ7XG4gICAgY29uc3QgY2hhbmdlc2V0ID0gZGF0YXNldFtIR19DSEFOR0VTRVRfREFUQV9BVFRSSUJVVEVdO1xuICAgIGlmICghY2hhbmdlc2V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYmxhbWVQcm92aWRlciA9IHRoaXMuX2JsYW1lUHJvdmlkZXI7XG4gICAgaW52YXJpYW50KHR5cGVvZiBibGFtZVByb3ZpZGVyLmdldFVybEZvclJldmlzaW9uID09PSAnZnVuY3Rpb24nKTtcbiAgICBjb25zdCB1cmwgPSBhd2FpdCBibGFtZVByb3ZpZGVyLmdldFVybEZvclJldmlzaW9uKHRoaXMuX2VkaXRvciwgY2hhbmdlc2V0KTtcbiAgICBpZiAodXJsKSB7XG4gICAgICAvLyBOb3RlIHRoYXQgJ3NoZWxsJyBpcyBub3QgdGhlIHB1YmxpYyAnc2hlbGwnIHBhY2thZ2Ugb24gbnBtIGJ1dCBhbiBBdG9tIGJ1aWx0LWluLlxuICAgICAgcmVxdWlyZSgnc2hlbGwnKS5vcGVuRXh0ZXJuYWwodXJsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoYE5vIFVSTCBmb3VuZCBmb3IgJHtjaGFuZ2VzZXR9LmApO1xuICAgIH1cblxuICAgIHRyYWNrKCdibGFtZS1ndXR0ZXItY2xpY2stcmV2aXNpb24nLCB7XG4gICAgICBlZGl0b3JQYXRoOiB0aGlzLl9lZGl0b3IuZ2V0UGF0aCgpIHx8ICcnLFxuICAgICAgdXJsOiB1cmwgfHwgJycsXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfZmV0Y2hBbmREaXNwbGF5QmxhbWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gQWRkIGEgbG9hZGluZyBzcGlubmVyIHdoaWxlIHdlIGZldGNoIHRoZSBibGFtZS5cbiAgICB0aGlzLl9hZGRMb2FkaW5nU3Bpbm5lcigpO1xuXG4gICAgbGV0IG5ld0JsYW1lO1xuICAgIHRyeSB7XG4gICAgICBuZXdCbGFtZSA9IGF3YWl0IHRoaXMuX2JsYW1lUHJvdmlkZXIuZ2V0QmxhbWVGb3JFZGl0b3IodGhpcy5fZWRpdG9yKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICBgRmFpbGVkIHRvIGZldGNoIGJsYW1lIHRvIGRpc3BsYXkuIGAgK1xuICAgICAgICBgVGhlIGZpbGUgaXMgZW1wdHkgb3IgdW50cmFja2VkIG9yIHRoZSByZXBvc2l0b3J5IGNhbm5vdCBiZSByZWFjaGVkLmAsXG4gICAgICAgIGVycm9yLFxuICAgICAgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gVGhlIEJsYW1lR3V0dGVyIGNvdWxkIGhhdmUgYmVlbiBkZXN0cm95ZWQgd2hpbGUgYmxhbWUgd2FzIGJlaW5nIGZldGNoZWQuXG4gICAgaWYgKHRoaXMuX2lzRGVzdHJveWVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBsb2FkaW5nIHNwaW5uZXIgYmVmb3JlIHNldHRpbmcgdGhlIGNvbnRlbnRzIG9mIHRoZSBibGFtZSBndXR0ZXIuXG4gICAgdGhpcy5fY2xlYW5VcExvYWRpbmdTcGlubmVyKCk7XG5cbiAgICB0aGlzLl91cGRhdGVCbGFtZShuZXdCbGFtZSk7XG4gIH1cblxuICBfYWRkTG9hZGluZ1NwaW5uZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nID0gdHJ1ZTtcbiAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lclRpbWVvdXRJZCA9IHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nID0gZmFsc2U7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYuY2xhc3NOYW1lID0gJ251Y2xpZGUtYmxhbWUtdWktc3Bpbm5lcic7XG4gICAgICBjb25zdCBndXR0ZXJWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgICBndXR0ZXJWaWV3LmFwcGVuZENoaWxkKHRoaXMuX2xvYWRpbmdTcGlubmVyRGl2KTtcbiAgICB9LCBNU19UT19XQUlUX0JFRk9SRV9TUElOTkVSKTtcbiAgfVxuXG4gIF9jbGVhblVwTG9hZGluZ1NwaW5uZXIoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nKSB7XG4gICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRoaXMuX2xvYWRpbmdTcGlubmVyVGltZW91dElkKTtcbiAgICAgIHRoaXMuX2xvYWRpbmdTcGlubmVySXNQZW5kaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGlmICh0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdikge1xuICAgICAgdGhpcy5fbG9hZGluZ1NwaW5uZXJEaXYucmVtb3ZlKCk7XG4gICAgICB0aGlzLl9sb2FkaW5nU3Bpbm5lckRpdiA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0Rlc3Ryb3llZCA9IHRydWU7XG4gICAgdGhpcy5fY2xlYW5VcExvYWRpbmdTcGlubmVyKCk7XG4gICAgaWYgKCF0aGlzLl9pc0VkaXRvckRlc3Ryb3llZCkge1xuICAgICAgLy8gRHVlIHRvIGEgYnVnIGluIHRoZSBHdXR0ZXIgQVBJLCBkZXN0cm95aW5nIGEgR3V0dGVyIGFmdGVyIHRoZSBlZGl0b3JcbiAgICAgIC8vIGhhcyBiZWVuIGRlc3Ryb3llZCByZXN1bHRzIGluIGFuIGV4Y2VwdGlvbi5cbiAgICAgIHRoaXMuX2d1dHRlci5kZXN0cm95KCk7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZGVjb3JhdGlvbiBvZiB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLnZhbHVlcygpKSB7XG4gICAgICBkZWNvcmF0aW9uLmdldE1hcmtlcigpLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgQmxhbWVGb3JFZGl0b3IgY29tcGxldGVseSByZXBsYWNlcyBhbnkgcHJldmlvdXMgYmxhbWUgaW5mb3JtYXRpb24uXG4gIEB0cmFja1RpbWluZygnYmxhbWUtdWkuYmxhbWUtZ3V0dGVyLnVwZGF0ZUJsYW1lJylcbiAgX3VwZGF0ZUJsYW1lKGJsYW1lRm9yRWRpdG9yOiBCbGFtZUZvckVkaXRvcik6IHZvaWQge1xuICAgIGlmIChibGFtZUZvckVkaXRvci5zaXplID09PSAwKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcbiAgICAgICAgICBgRm91bmQgbm8gYmxhbWUgdG8gZGlzcGxheS4gSXMgdGhpcyBmaWxlIGVtcHR5IG9yIHVudHJhY2tlZD9cbiAgICAgICAgICBJZiBub3QsIGNoZWNrIGZvciBlcnJvcnMgaW4gdGhlIE51Y2xpZGUgbG9ncyBsb2NhbCB0byB5b3VyIHJlcG8uYCk7XG4gICAgfVxuICAgIGNvbnN0IGFsbFByZXZpb3VzQmxhbWVkTGluZXMgPSBuZXcgU2V0KHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24ua2V5cygpKTtcblxuICAgIGxldCBsb25nZXN0QmxhbWUgPSAwO1xuICAgIGZvciAoY29uc3QgYmxhbWVJbmZvIG9mIGJsYW1lRm9yRWRpdG9yLnZhbHVlcygpKSB7XG4gICAgICBsZXQgYmxhbWVMZW5ndGggPSBibGFtZUluZm8uYXV0aG9yLmxlbmd0aDtcbiAgICAgIGlmIChibGFtZUluZm8uY2hhbmdlc2V0KSB7XG4gICAgICAgIGJsYW1lTGVuZ3RoICs9IGJsYW1lSW5mby5jaGFuZ2VzZXQubGVuZ3RoICsgMTtcbiAgICAgIH1cbiAgICAgIGlmIChibGFtZUxlbmd0aCA+IGxvbmdlc3RCbGFtZSkge1xuICAgICAgICBsb25nZXN0QmxhbWUgPSBibGFtZUxlbmd0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtidWZmZXJMaW5lLCBibGFtZUluZm9dIG9mIGJsYW1lRm9yRWRpdG9yKSB7XG4gICAgICB0aGlzLl9zZXRCbGFtZUxpbmUoYnVmZmVyTGluZSwgYmxhbWVJbmZvLCBsb25nZXN0QmxhbWUpO1xuICAgICAgYWxsUHJldmlvdXNCbGFtZWRMaW5lcy5kZWxldGUoYnVmZmVyTGluZSk7XG4gICAgfVxuXG4gICAgLy8gQW55IGxpbmVzIHRoYXQgd2VyZW4ndCBpbiB0aGUgbmV3IGJsYW1lRm9yRWRpdG9yIGFyZSBvdXRkYXRlZC5cbiAgICBmb3IgKGNvbnN0IG9sZExpbmUgb2YgYWxsUHJldmlvdXNCbGFtZWRMaW5lcykge1xuICAgICAgdGhpcy5fcmVtb3ZlQmxhbWVMaW5lKG9sZExpbmUpO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgd2lkdGggb2YgdGhlIGd1dHRlciBhY2NvcmRpbmcgdG8gdGhlIG5ldyBjb250ZW50cy5cbiAgICB0aGlzLl91cGRhdGVHdXR0ZXJXaWR0aFRvQ2hhcmFjdGVyTGVuZ3RoKGxvbmdlc3RCbGFtZSk7XG4gIH1cblxuICBfdXBkYXRlR3V0dGVyV2lkdGhUb0NoYXJhY3Rlckxlbmd0aChjaGFyYWN0ZXJzOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBndXR0ZXJWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KHRoaXMuX2d1dHRlcik7XG4gICAgZ3V0dGVyVmlldy5zdHlsZS53aWR0aCA9IGAke2NoYXJhY3RlcnN9Y2hgO1xuICB9XG5cbiAgX3NldEJsYW1lTGluZShidWZmZXJMaW5lOiBudW1iZXIsIGJsYW1lSW5mbzogQmxhbWVJbmZvLCBsb25nZXN0QmxhbWU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGl0ZW0gPSB0aGlzLl9jcmVhdGVHdXR0ZXJJdGVtKGJsYW1lSW5mbywgbG9uZ2VzdEJsYW1lKTtcbiAgICBjb25zdCBkZWNvcmF0aW9uUHJvcGVydGllcyA9IHtcbiAgICAgIHR5cGU6ICdndXR0ZXInLFxuICAgICAgZ3V0dGVyTmFtZTogdGhpcy5fZ3V0dGVyLm5hbWUsXG4gICAgICBjbGFzczogQkxBTUVfREVDT1JBVElPTl9DTEFTUyxcbiAgICAgIGl0ZW0sXG4gICAgfTtcblxuICAgIGxldCBkZWNvcmF0aW9uID0gdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5nZXQoYnVmZmVyTGluZSk7XG4gICAgaWYgKCFkZWNvcmF0aW9uKSB7XG4gICAgICBjb25zdCBidWZmZXJMaW5lSGVhZFBvaW50ID0gW2J1ZmZlckxpbmUsIDBdO1xuICAgICAgLy8gVGhlIHJhbmdlIG9mIHRoaXMgTWFya2VyIGRvZXNuJ3QgbWF0dGVyLCBvbmx5IHRoZSBsaW5lIGl0IGlzIG9uLCBiZWNhdXNlXG4gICAgICAvLyB0aGUgRGVjb3JhdGlvbiBpcyBmb3IgYSBHdXR0ZXIuXG4gICAgICBjb25zdCBtYXJrZXIgPSB0aGlzLl9lZGl0b3IubWFya0J1ZmZlclJhbmdlKFtidWZmZXJMaW5lSGVhZFBvaW50LCBidWZmZXJMaW5lSGVhZFBvaW50XSk7XG4gICAgICBkZWNvcmF0aW9uID0gdGhpcy5fZWRpdG9yLmRlY29yYXRlTWFya2VyKG1hcmtlciwgZGVjb3JhdGlvblByb3BlcnRpZXMpO1xuICAgICAgdGhpcy5fYnVmZmVyTGluZVRvRGVjb3JhdGlvbi5zZXQoYnVmZmVyTGluZSwgZGVjb3JhdGlvbik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlY29yYXRpb24uc2V0UHJvcGVydGllcyhkZWNvcmF0aW9uUHJvcGVydGllcyk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUJsYW1lTGluZShidWZmZXJMaW5lOiBudW1iZXIpOiB2b2lkIHtcbiAgICBjb25zdCBibGFtZURlY29yYXRpb24gPSB0aGlzLl9idWZmZXJMaW5lVG9EZWNvcmF0aW9uLmdldChidWZmZXJMaW5lKTtcbiAgICBpZiAoIWJsYW1lRGVjb3JhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBUaGUgcmVjb21tZW5kZWQgd2F5IG9mIGRlc3Ryb3lpbmcgYSBkZWNvcmF0aW9uIGlzIGJ5IGRlc3Ryb3lpbmcgaXRzIG1hcmtlci5cbiAgICBibGFtZURlY29yYXRpb24uZ2V0TWFya2VyKCkuZGVzdHJveSgpO1xuICAgIHRoaXMuX2J1ZmZlckxpbmVUb0RlY29yYXRpb24uZGVsZXRlKGJ1ZmZlckxpbmUpO1xuICB9XG5cbiAgX2NyZWF0ZUd1dHRlckl0ZW0oYmxhbWVJbmZvOiBCbGFtZUluZm8sIGxvbmdlc3RCbGFtZTogbnVtYmVyKTogSFRNTEVsZW1lbnQge1xuICAgIGNvbnN0IGRvYyA9IHdpbmRvdy5kb2N1bWVudDtcbiAgICBjb25zdCBpdGVtID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgY29uc3QgYXV0aG9yU3BhbiA9IGRvYy5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgYXV0aG9yU3Bhbi5pbm5lclRleHQgPSBibGFtZUluZm8uYXV0aG9yO1xuICAgIGl0ZW0uYXBwZW5kQ2hpbGQoYXV0aG9yU3Bhbik7XG5cbiAgICBpZiAoYmxhbWVJbmZvLmNoYW5nZXNldCkge1xuICAgICAgY29uc3QgbnVtU3BhY2VzID0gbG9uZ2VzdEJsYW1lIC0gYmxhbWVJbmZvLmF1dGhvci5sZW5ndGggLSBibGFtZUluZm8uY2hhbmdlc2V0Lmxlbmd0aDtcbiAgICAgIC8vIEluc2VydCBub24tYnJlYWtpbmcgc3BhY2VzIHRvIGVuc3VyZSB0aGUgY2hhbmdlc2V0IGlzIHJpZ2h0LWFsaWduZWQuXG4gICAgICAvLyBBZG1pdHRlZGx5LCB0aGlzIGlzIGEgbGl0dGxlIGdyb3NzLCBidXQgaXQgc2VlbXMgYmV0dGVyIHRoYW4gc2V0dGluZyBzdHlsZS53aWR0aCBvbiBldmVyeVxuICAgICAgLy8gaXRlbSB0aGF0IHdlIGNyZWF0ZSBhbmQgaGF2aW5nIHRvIGdpdmUgaXQgYSBzcGVjaWFsIGZsZXhib3ggbGF5b3V0LiBIb29yYXkgbW9ub3NwYWNlIVxuICAgICAgaXRlbS5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoJ1xcdTAwQTAnLnJlcGVhdChudW1TcGFjZXMpKSk7XG5cbiAgICAgIGNvbnN0IGNoYW5nZXNldFNwYW4gPSBkb2MuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgY2hhbmdlc2V0U3Bhbi5jbGFzc05hbWUgPSB0aGlzLl9jaGFuZ2VzZXRTcGFuQ2xhc3NOYW1lO1xuICAgICAgY2hhbmdlc2V0U3Bhbi5kYXRhc2V0W0hHX0NIQU5HRVNFVF9EQVRBX0FUVFJJQlVURV0gPSBibGFtZUluZm8uY2hhbmdlc2V0O1xuICAgICAgY2hhbmdlc2V0U3Bhbi5pbm5lclRleHQgPSBibGFtZUluZm8uY2hhbmdlc2V0O1xuICAgICAgaXRlbS5hcHBlbmRDaGlsZChjaGFuZ2VzZXRTcGFuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbTtcbiAgfVxufVxuIl19