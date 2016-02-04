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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var DATATIP_DELAY_MS = 50;

var DatatipManager = (function () {
  function DatatipManager() {
    var _this = this;

    _classCallCheck(this, DatatipManager);

    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-datatip:toggle', this.toggleDatatip.bind(this)));
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'core:cancel', this.hideDatatip.bind(this)));

    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      // When the cursor moves the next time we do a toggle we should show the
      // new datatip
      _this._subscriptions.add(editor.onDidChangeCursorPosition(function () {
        _this._datatipToggle = false;
      }));

      var editorView = atom.views.getView(editor);
      var mouseMoveListener = (0, _commons.debounce)(function (e) {
        _this._datatipForMouseEvent(e, editor, editorView);
      }, DATATIP_DELAY_MS,
      /* immediate */false);
      editorView.addEventListener('mousemove', mouseMoveListener);
      var mouseListenerSubscription = new _atom.Disposable(function () {
        return editorView.removeEventListener('mousemove', mouseMoveListener);
      });
      var destroySubscription = editor.onDidDestroy(function () {
        mouseListenerSubscription.dispose();
        _this._subscriptions.remove(mouseListenerSubscription);
        _this._subscriptions.remove(destroySubscription);
      });
      _this._subscriptions.add(mouseListenerSubscription);
      _this._subscriptions.add(destroySubscription);
    }));
    this._ephemeralDatatipElement = document.createElement('div');
    this._ephemeralDatatipElement.className = 'nuclide-datatip-overlay';

    var datatipMouseEnter = function datatipMouseEnter(event) {
      return _this._handleElementMouseEnter(event);
    };
    var datatipMouseLeave = function datatipMouseLeave(event) {
      return _this._handleElementMouseLeave(event);
    };
    this._ephemeralDatatipElement.addEventListener('mouseenter', datatipMouseEnter);
    this._ephemeralDatatipElement.addEventListener('mouseleave', datatipMouseLeave);

    this._datatipProviders = [];
    this._marker = null;
    this._datatipToggle = false;
    this._currentRange = null;
    this._isHoveringDatatip = false;
  }

  _createClass(DatatipManager, [{
    key: 'toggleDatatip',
    value: function toggleDatatip() {
      this._datatipToggle = !this._datatipToggle;
      if (this._datatipToggle) {
        var editor = atom.workspace.getActiveTextEditor();
        if (editor != null) {
          var position = editor.getCursorScreenPosition();
          this._datatipInEditor(editor, position);
        }
      } else {
        this.hideDatatip();
      }
    }
  }, {
    key: 'hideDatatip',
    value: function hideDatatip() {
      if (this._marker == null) {
        return;
      }
      this._ephemeralDatatipElement.style.display = 'none';
      this._marker.destroy();
      this._marker = null;
      this._currentRange = null;
      this._isHoveringDatatip = false;
    }
  }, {
    key: '_handleElementMouseEnter',
    value: function _handleElementMouseEnter(event) {
      this._isHoveringDatatip = true;
    }
  }, {
    key: '_handleElementMouseLeave',
    value: function _handleElementMouseLeave(event) {
      this._isHoveringDatatip = false;
    }
  }, {
    key: '_datatipForMouseEvent',
    value: function _datatipForMouseEvent(e, editor, editorView) {
      if (!editorView.component) {
        // The editor was destroyed, but the destroy handler haven't yet been called to cancel
        // the timer.
        return;
      }
      var screenPosition = editorView.component.screenPositionForMouseEvent(e);
      var position = editor.bufferPositionForScreenPosition(screenPosition);
      this._datatipInEditor(editor, position);
    }
  }, {
    key: '_datatipInEditor',
    value: _asyncToGenerator(function* (editor, position) {
      if (this._isHoveringDatatip) {
        return;
      }

      if (this._currentRange != null && this._currentRange.containsPoint(position)) {
        return;
      }

      if (this._marker != null) {
        this.hideDatatip();
      }

      var _editor$getGrammar = editor.getGrammar();

      var scopeName = _editor$getGrammar.scopeName;

      var _getMatchingProvidersForScopeName2 = this._getMatchingProvidersForScopeName(scopeName);

      var _getMatchingProvidersForScopeName22 = _slicedToArray(_getMatchingProvidersForScopeName2, 1);

      var provider = _getMatchingProvidersForScopeName22[0];

      if (provider == null) {
        return;
      }
      var name = undefined;
      if (provider.providerName != null) {
        name = provider.providerName;
      } else {
        name = 'unknown';
        var logger = require('../../logging').getLogger();
        logger.error('Datatip provider has no name', provider);
      }
      var datatip = yield (0, _analytics.trackOperationTiming)(name + '.datatip', function () {
        return provider.datatip(editor, position);
      });
      if (!datatip || this._marker) {
        return;
      }

      var component = datatip.component;
      var range = datatip.range;

      // We track the timing above, but we still want to know the number of popups that are shown.
      (0, _analytics.track)('datatip-popup', {
        'scope': scopeName
      });
      //TODO add more data to track call
      this._currentRange = range;

      // Transform the matched element range to the hint range.
      var marker = editor.markBufferRange(range, { invalidate: 'never' });
      this._marker = marker;

      _reactForAtom.ReactDOM.render(component, this._ephemeralDatatipElement);
      // This relative positioning is to work around the issue that `position: 'head'`
      // doesn't work for overlay decorators are rendered on the bottom right of the given range.
      // Atom issue: https://github.com/atom/atom/issues/6695
      var expressionLength = range.end.column - range.start.column;
      this._ephemeralDatatipElement.style.left = -(expressionLength * editor.getDefaultCharWidth()) + 'px';
      this._ephemeralDatatipElement.style.display = 'block';

      editor.decorateMarker(marker, {
        type: 'overlay',
        position: 'head',
        item: this._ephemeralDatatipElement
      });
      editor.decorateMarker(marker, {
        type: 'highlight',
        'class': 'nuclide-datatip-highlight-region'
      });
    })
  }, {
    key: '_getMatchingProvidersForScopeName',
    value: function _getMatchingProvidersForScopeName(scopeName) {
      return this._datatipProviders.filter(function (provider) {
        return provider.inclusionPriority > 0 && provider.validForScope(scopeName);
      }).sort(function (providerA, providerB) {
        return providerA.inclusionPriority - providerB.inclusionPriority;
      });
    }
  }, {
    key: 'addProvider',
    value: function addProvider(provider) {
      this._datatipProviders.push(provider);
    }
  }, {
    key: 'removeProvider',
    value: function removeProvider(provider) {
      _commons.array.remove(this._datatipProviders, provider);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.hideDatatip();
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._ephemeralDatatipElement);
      this._ephemeralDatatipElement.remove();
      this._subscriptions.dispose();
    }
  }]);

  return DatatipManager;
})();

exports.DatatipManager = DatatipManager;

/**
 * This helps determine if we should show the datatip when toggling it via
 * command. The toggle command first negates this, and then if this is true
 * shows a datatip, otherwise it hides the current datatip.
 */
//# sourceMappingURL=data:application/json;base64,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QUFDO0tBQy9COzs7U0E5TVUsY0FBYyIsImZpbGUiOiJEYXRhdGlwTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9kYXRhdGlwLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IHthcnJheSwgZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHt0cmFjaywgdHJhY2tPcGVyYXRpb25UaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmNvbnN0IERBVEFUSVBfREVMQVlfTVMgPSA1MDtcblxuZXhwb3J0IGNsYXNzIERhdGF0aXBNYW5hZ2VyIHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9tYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX2N1cnJlbnRSYW5nZTogP2F0b20kUmFuZ2U7XG4gIF9pc0hvdmVyaW5nRGF0YXRpcDogYm9vbGVhbjtcbiAgX2RhdGF0aXBQcm92aWRlcnM6IEFycmF5PERhdGF0aXBQcm92aWRlcj47XG4gIC8qKlxuICAgKiBUaGlzIGhlbHBzIGRldGVybWluZSBpZiB3ZSBzaG91bGQgc2hvdyB0aGUgZGF0YXRpcCB3aGVuIHRvZ2dsaW5nIGl0IHZpYVxuICAgKiBjb21tYW5kLiBUaGUgdG9nZ2xlIGNvbW1hbmQgZmlyc3QgbmVnYXRlcyB0aGlzLCBhbmQgdGhlbiBpZiB0aGlzIGlzIHRydWVcbiAgICogc2hvd3MgYSBkYXRhdGlwLCBvdGhlcndpc2UgaXQgaGlkZXMgdGhlIGN1cnJlbnQgZGF0YXRpcC5cbiAgICovXG4gIF9kYXRhdGlwVG9nZ2xlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtZGF0YXRpcDp0b2dnbGUnLFxuICAgICAgdGhpcy50b2dnbGVEYXRhdGlwLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICB0aGlzLmhpZGVEYXRhdGlwLmJpbmQodGhpcylcbiAgICApKTtcblxuICAgIC8vIFRPRE8obW9zdCk6IFJlcGxhY2Ugd2l0aCBAamppYWEncyBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvciBpbnRyb2R1Y2VkIGluIEQyMDA1NTQ1LlxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgY3Vyc29yIG1vdmVzIHRoZSBuZXh0IHRpbWUgd2UgZG8gYSB0b2dnbGUgd2Ugc2hvdWxkIHNob3cgdGhlXG4gICAgICAvLyBuZXcgZGF0YXRpcFxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gZmFsc2U7XG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcbiAgICAgIGNvbnN0IG1vdXNlTW92ZUxpc3RlbmVyID0gZGVib3VuY2UoXG4gICAgICAgIChlKSA9PiB7dGhpcy5fZGF0YXRpcEZvck1vdXNlRXZlbnQoKChlOiBhbnkpOiBNb3VzZUV2ZW50KSwgZWRpdG9yLCBlZGl0b3JWaWV3KTt9LFxuICAgICAgICBEQVRBVElQX0RFTEFZX01TLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2UsXG4gICAgICApO1xuICAgICAgZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVMaXN0ZW5lcik7XG4gICAgICBjb25zdCBtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoKCkgPT5cbiAgICAgICAgICBlZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZUxpc3RlbmVyKSk7XG4gICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgfSkpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuY2xhc3NOYW1lID0gJ251Y2xpZGUtZGF0YXRpcC1vdmVybGF5JztcblxuICAgIGNvbnN0IGRhdGF0aXBNb3VzZUVudGVyID0gZXZlbnQgPT4gdGhpcy5faGFuZGxlRWxlbWVudE1vdXNlRW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IGRhdGF0aXBNb3VzZUxlYXZlID0gZXZlbnQgPT4gdGhpcy5faGFuZGxlRWxlbWVudE1vdXNlTGVhdmUoZXZlbnQpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBkYXRhdGlwTW91c2VFbnRlcik7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGRhdGF0aXBNb3VzZUxlYXZlKTtcblxuICAgIHRoaXMuX2RhdGF0aXBQcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX2RhdGF0aXBUb2dnbGUgPSBmYWxzZTtcbiAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gZmFsc2U7XG4gIH1cblxuICB0b2dnbGVEYXRhdGlwKCk6IHZvaWQge1xuICAgIHRoaXMuX2RhdGF0aXBUb2dnbGUgPSAhdGhpcy5fZGF0YXRpcFRvZ2dsZTtcbiAgICBpZiAodGhpcy5fZGF0YXRpcFRvZ2dsZSkge1xuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKGVkaXRvciAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuX2RhdGF0aXBJbkVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGVEYXRhdGlwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tYXJrZXIgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuX21hcmtlci5kZXN0cm95KCk7XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gZmFsc2U7XG4gIH1cblxuICBfaGFuZGxlRWxlbWVudE1vdXNlRW50ZXIoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNIb3ZlcmluZ0RhdGF0aXAgPSB0cnVlO1xuICB9XG5cbiAgX2hhbmRsZUVsZW1lbnRNb3VzZUxlYXZlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gZmFsc2U7XG4gIH1cblxuICBfZGF0YXRpcEZvck1vdXNlRXZlbnQoZTogTW91c2VFdmVudCwgZWRpdG9yOiBUZXh0RWRpdG9yLCBlZGl0b3JWaWV3OiBIVE1MRWxlbWVudCkge1xuICAgIGlmICghZWRpdG9yVmlldy5jb21wb25lbnQpIHtcbiAgICAgIC8vIFRoZSBlZGl0b3Igd2FzIGRlc3Ryb3llZCwgYnV0IHRoZSBkZXN0cm95IGhhbmRsZXIgaGF2ZW4ndCB5ZXQgYmVlbiBjYWxsZWQgdG8gY2FuY2VsXG4gICAgICAvLyB0aGUgdGltZXIuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gZWRpdG9yVmlldy5jb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGUpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICAgIHRoaXMuX2RhdGF0aXBJbkVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgfVxuXG4gIGFzeW5jIF9kYXRhdGlwSW5FZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2Uge1xuICAgIGlmICh0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jdXJyZW50UmFuZ2UgIT0gbnVsbCAmJiB0aGlzLl9jdXJyZW50UmFuZ2UuY29udGFpbnNQb2ludChwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbWFya2VyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7c2NvcGVOYW1lfSA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgY29uc3QgW3Byb3ZpZGVyXSA9IHRoaXMuX2dldE1hdGNoaW5nUHJvdmlkZXJzRm9yU2NvcGVOYW1lKHNjb3BlTmFtZSk7XG4gICAgaWYgKHByb3ZpZGVyID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IG5hbWU7XG4gICAgaWYgKHByb3ZpZGVyLnByb3ZpZGVyTmFtZSAhPSBudWxsKSB7XG4gICAgICBuYW1lID0gcHJvdmlkZXIucHJvdmlkZXJOYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gJ3Vua25vd24nO1xuICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICAgICAgbG9nZ2VyLmVycm9yKCdEYXRhdGlwIHByb3ZpZGVyIGhhcyBubyBuYW1lJywgcHJvdmlkZXIpO1xuICAgIH1cbiAgICBjb25zdCBkYXRhdGlwID0gYXdhaXQgdHJhY2tPcGVyYXRpb25UaW1pbmcoXG4gICAgICBuYW1lICsgJy5kYXRhdGlwJyxcbiAgICAgICgpID0+IHByb3ZpZGVyLmRhdGF0aXAoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgKTtcbiAgICBpZiAoIWRhdGF0aXAgfHwgdGhpcy5fbWFya2VyKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qge2NvbXBvbmVudCwgcmFuZ2V9ID0gZGF0YXRpcDtcbiAgICAvLyBXZSB0cmFjayB0aGUgdGltaW5nIGFib3ZlLCBidXQgd2Ugc3RpbGwgd2FudCB0byBrbm93IHRoZSBudW1iZXIgb2YgcG9wdXBzIHRoYXQgYXJlIHNob3duLlxuICAgIHRyYWNrKCdkYXRhdGlwLXBvcHVwJywge1xuICAgICAgJ3Njb3BlJzogc2NvcGVOYW1lLFxuICAgICAgLy9UT0RPIGFkZCBtb3JlIGRhdGEgdG8gdHJhY2sgY2FsbFxuICAgIH0pO1xuICAgIHRoaXMuX2N1cnJlbnRSYW5nZSA9IHJhbmdlO1xuXG4gICAgLy8gVHJhbnNmb3JtIHRoZSBtYXRjaGVkIGVsZW1lbnQgcmFuZ2UgdG8gdGhlIGhpbnQgcmFuZ2UuXG4gICAgY29uc3QgbWFya2VyOiBhdG9tJE1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UocmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgY29tcG9uZW50LFxuICAgICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnRcbiAgICApO1xuICAgIC8vIFRoaXMgcmVsYXRpdmUgcG9zaXRpb25pbmcgaXMgdG8gd29yayBhcm91bmQgdGhlIGlzc3VlIHRoYXQgYHBvc2l0aW9uOiAnaGVhZCdgXG4gICAgLy8gZG9lc24ndCB3b3JrIGZvciBvdmVybGF5IGRlY29yYXRvcnMgYXJlIHJlbmRlcmVkIG9uIHRoZSBib3R0b20gcmlnaHQgb2YgdGhlIGdpdmVuIHJhbmdlLlxuICAgIC8vIEF0b20gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY2OTVcbiAgICBjb25zdCBleHByZXNzaW9uTGVuZ3RoID0gcmFuZ2UuZW5kLmNvbHVtbiAtIHJhbmdlLnN0YXJ0LmNvbHVtbjtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5zdHlsZS5sZWZ0ID1cbiAgICAgIC0oZXhwcmVzc2lvbkxlbmd0aCAqIGVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKCkpICsgICdweCc7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG5cbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICBtYXJrZXIsXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdvdmVybGF5JyxcbiAgICAgICAgcG9zaXRpb246ICdoZWFkJyxcbiAgICAgICAgaXRlbTogdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQsXG4gICAgICB9XG4gICAgKTtcbiAgICBlZGl0b3IuZGVjb3JhdGVNYXJrZXIoXG4gICAgICBtYXJrZXIsXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdoaWdobGlnaHQnLFxuICAgICAgICBjbGFzczogJ251Y2xpZGUtZGF0YXRpcC1oaWdobGlnaHQtcmVnaW9uJyxcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgX2dldE1hdGNoaW5nUHJvdmlkZXJzRm9yU2NvcGVOYW1lKHNjb3BlTmFtZTogc3RyaW5nKTogQXJyYXk8RGF0YXRpcFByb3ZpZGVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGF0aXBQcm92aWRlcnMuZmlsdGVyKChwcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXIuaW5jbHVzaW9uUHJpb3JpdHkgPiAwICYmIHByb3ZpZGVyLnZhbGlkRm9yU2NvcGUoc2NvcGVOYW1lKTtcbiAgICB9KS5zb3J0KChwcm92aWRlckE6IERhdGF0aXBQcm92aWRlciwgcHJvdmlkZXJCOiBEYXRhdGlwUHJvdmlkZXIpID0+IHtcbiAgICAgIHJldHVybiBwcm92aWRlckEuaW5jbHVzaW9uUHJpb3JpdHkgLSBwcm92aWRlckIuaW5jbHVzaW9uUHJpb3JpdHk7XG4gICAgfSk7XG4gIH1cblxuICBhZGRQcm92aWRlcihwcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyKSB7XG4gICAgdGhpcy5fZGF0YXRpcFByb3ZpZGVycy5wdXNoKHByb3ZpZGVyKTtcbiAgfVxuXG4gIHJlbW92ZVByb3ZpZGVyKHByb3ZpZGVyOiBEYXRhdGlwUHJvdmlkZXIpOiB2b2lkIHtcbiAgICBhcnJheS5yZW1vdmUodGhpcy5fZGF0YXRpcFByb3ZpZGVycywgcHJvdmlkZXIpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLmhpZGVEYXRhdGlwKCk7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudCk7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==