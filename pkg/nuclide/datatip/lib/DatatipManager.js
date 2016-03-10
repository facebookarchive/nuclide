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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var _DatatipComponent = require('./DatatipComponent');

var _PinnedDatatip = require('./PinnedDatatip');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var DatatipManager = (function () {
  function DatatipManager() {
    var _this = this;

    _classCallCheck(this, DatatipManager);

    this._boundHideDatatip = this.hideDatatip.bind(this);
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-datatip:toggle', this.toggleDatatip.bind(this)));
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'core:cancel', this._boundHideDatatip));
    this._debouncedMouseMove = function () {};
    this._subscriptions.add(_featureConfig2['default'].observe('nuclide-datatip.datatipDebounceDelay', function (debounceDelay) {
      return _this.updateDebounceDelay(debounceDelay);
    }));
    // TODO(most): Replace with @jjiaa's mouseListenerForTextEditor introduced in D2005545.
    this._subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      // When the cursor moves the next time we do a toggle we should show the
      // new datatip
      _this._subscriptions.add(editor.onDidChangeCursorPosition(function () {
        _this._datatipToggle = false;
      }));

      var editorView = atom.views.getView(editor);
      var mouseMoveListener = function mouseMoveListener(event) {
        _this.handleMouseMove(event, editor, editorView);
      };
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
    this._pinnedDatatips = new Set();
    this._globalKeydownSubscription = null;
  }

  _createClass(DatatipManager, [{
    key: 'updateDebounceDelay',
    value: function updateDebounceDelay(debounceDelay) {
      var _this2 = this;

      this._debouncedMouseMove = (0, _commons.debounce)(function (event, editor, editorView) {
        _this2._datatipForMouseEvent(event, editor, editorView);
      }, debounceDelay,
      /* immediate */false);
    }
  }, {
    key: 'handleMouseMove',
    value: function handleMouseMove(event, editor, editorView) {
      this._debouncedMouseMove(event, editor, editorView);
    }
  }, {
    key: 'toggleDatatip',
    value: function toggleDatatip() {
      this._datatipToggle = !this._datatipToggle;
      if (this._datatipToggle) {
        var _editor = atom.workspace.getActiveTextEditor();
        if (_editor != null) {
          var position = _editor.getCursorScreenPosition();
          this._datatipInEditor(_editor, position);
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
      if (this._globalKeydownSubscription != null) {
        this._globalKeydownSubscription.dispose();
        this._globalKeydownSubscription = null;
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
      var textEditorComponent = editorView.component;
      var screenPosition = textEditorComponent.screenPositionForMouseEvent(e);
      var pixelPosition = textEditorComponent.pixelPositionForMouseEvent(e);
      var pixelPositionFromScreenPosition = textEditorComponent.pixelPositionForScreenPosition(screenPosition);
      // Distance (in pixels) between screenPosition and the cursor.
      var horizontalDistance = pixelPosition.left - pixelPositionFromScreenPosition.left;
      // `screenPositionForMouseEvent.column` cannot exceed the current line length.
      // This is essentially a heuristic for "mouse cursor is to the left or right of text content".
      if (pixelPosition.left < 0 || horizontalDistance > editor.getDefaultCharWidth()) {
        this.hideDatatip();
        return;
      }
      var bufferPosition = editor.bufferPositionForScreenPosition(screenPosition);
      this._datatipInEditor(editor, bufferPosition);
    }
  }, {
    key: '_datatipInEditor',
    value: _asyncToGenerator(function* (editor, position) {
      var _this3 = this;

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

      var providers = this._getMatchingProvidersForScopeName(scopeName);
      if (providers.length === 0) {
        return;
      }
      var datatips = yield Promise.all(providers.map(_asyncToGenerator(function* (provider) {
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
        if (!datatip || _this3._marker) {
          return;
        }
        var pinnable = datatip.pinnable;
        var component = datatip.component;
        var range = datatip.range;

        // We track the timing above, but we still want to know the number of popups that are shown.
        (0, _analytics.track)('datatip-popup', {
          'scope': scopeName,
          'providerName': name,
          rangeStartRow: String(range.start.row),
          rangeStartColumn: String(range.start.column),
          rangeEndRow: String(range.end.row),
          rangeEndColumn: String(range.end.column)
        });
        _this3._currentRange = range;
        var action = undefined,
            actionTitle = undefined;
        // Datatips are pinnable by default, unless explicitly specified otherwise.
        if (pinnable !== false) {
          action = _DatatipComponent.DATATIP_ACTIONS.PIN;
          actionTitle = 'Pin this Datatip';
        }

        return {
          range: range,
          component: component,
          pinnable: pinnable,
          name: name,
          action: action,
          actionTitle: actionTitle
        };
      })));
      var nonEmptyDatatips = datatips.filter(function (datatip) {
        return datatip != null;
      });
      if (nonEmptyDatatips.length === 0) {
        return;
      }
      var renderedProviders = nonEmptyDatatips.map(function (datatip) {
        var component = datatip.component;
        var name = datatip.name;
        var action = datatip.action;
        var actionTitle = datatip.actionTitle;

        return _reactForAtom.React.createElement(
          _DatatipComponent.DatatipComponent,
          {
            action: action,
            actionTitle: actionTitle,
            onActionClick: _this3._handlePinClicked.bind(_this3, editor, datatip),
            key: name },
          component
        );
      });

      var combinedRange = nonEmptyDatatips[0].range;
      for (var i = 1; i < nonEmptyDatatips.length; i++) {
        combinedRange = combinedRange.union(nonEmptyDatatips[i].range);
      }

      // Transform the matched element range to the hint range.
      var marker = editor.markBufferRange(combinedRange, { invalidate: 'never' });
      this._marker = marker;

      _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(
        'div',
        null,
        renderedProviders
      ), this._ephemeralDatatipElement);
      // This relative positioning is to work around the issue that `position: 'head'`
      // doesn't work for overlay decorators are rendered on the bottom right of the given range.
      // Atom issue: https://github.com/atom/atom/issues/6695
      var expressionLength = combinedRange.end.column - combinedRange.start.column;
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
      this._subscribeToGlobalKeydown();
    })
  }, {
    key: '_subscribeToGlobalKeydown',
    value: function _subscribeToGlobalKeydown() {
      var _this4 = this;

      var editor = atom.views.getView(atom.workspace);
      editor.addEventListener('keydown', this._boundHideDatatip);
      this._globalKeydownSubscription = new _atom.Disposable(function () {
        editor.removeEventListener('keydown', _this4._boundHideDatatip);
      });
    }
  }, {
    key: '_handlePinClicked',
    value: function _handlePinClicked(editor, datatip) {
      var _this5 = this;

      this.hideDatatip();
      this._pinnedDatatips.add(new _PinnedDatatip.PinnedDatatip(datatip, editor, function (pinnedDatatip) {
        _this5._pinnedDatatips['delete'](pinnedDatatip);
      }));
    }
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
      this._pinnedDatatips.forEach(function (pinnedDatatip) {
        return pinnedDatatip.dispose();
      });
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLFFBQXlCLEVBQUU7QUFDckMsVUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1dBRWEsd0JBQUMsUUFBeUIsRUFBUTtBQUM5QyxxQkFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQiw2QkFBUyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMvRCxVQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxhQUFhO2VBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUN2RSxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0F2VFUsY0FBYyIsImZpbGUiOiJEYXRhdGlwTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcCxcbiAgRGF0YXRpcFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9kYXRhdGlwLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXksIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQge0RhdGF0aXBDb21wb25lbnQsIERBVEFUSVBfQUNUSU9OU30gZnJvbSAnLi9EYXRhdGlwQ29tcG9uZW50JztcbmltcG9ydCB7UGlubmVkRGF0YXRpcH0gZnJvbSAnLi9QaW5uZWREYXRhdGlwJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vZmVhdHVyZS1jb25maWcnO1xuXG5leHBvcnQgY2xhc3MgRGF0YXRpcE1hbmFnZXIge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2RlYm91bmNlZE1vdXNlTW92ZTpcbiAgICAoZXZlbnQ6IE1vdXNlRXZlbnQsIGVkaXRvcjogVGV4dEVkaXRvciwgZWRpdG9yVmlldzogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCkgPT4gdm9pZDtcbiAgX2JvdW5kSGlkZURhdGF0aXA6IEZ1bmN0aW9uO1xuICBfZ2xvYmFsS2V5ZG93blN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuICBfbWFya2VyOiA/YXRvbSRNYXJrZXI7XG4gIF9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIF9jdXJyZW50UmFuZ2U6ID9hdG9tJFJhbmdlO1xuICBfaXNIb3ZlcmluZ0RhdGF0aXA6IGJvb2xlYW47XG4gIF9kYXRhdGlwUHJvdmlkZXJzOiBBcnJheTxEYXRhdGlwUHJvdmlkZXI+O1xuICBfcGlubmVkRGF0YXRpcHM6IFNldDxQaW5uZWREYXRhdGlwPjtcbiAgLyoqXG4gICAqIFRoaXMgaGVscHMgZGV0ZXJtaW5lIGlmIHdlIHNob3VsZCBzaG93IHRoZSBkYXRhdGlwIHdoZW4gdG9nZ2xpbmcgaXQgdmlhXG4gICAqIGNvbW1hbmQuIFRoZSB0b2dnbGUgY29tbWFuZCBmaXJzdCBuZWdhdGVzIHRoaXMsIGFuZCB0aGVuIGlmIHRoaXMgaXMgdHJ1ZVxuICAgKiBzaG93cyBhIGRhdGF0aXAsIG90aGVyd2lzZSBpdCBoaWRlcyB0aGUgY3VycmVudCBkYXRhdGlwLlxuICAgKi9cbiAgX2RhdGF0aXBUb2dnbGU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fYm91bmRIaWRlRGF0YXRpcCA9IHRoaXMuaGlkZURhdGF0aXAuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdudWNsaWRlLWRhdGF0aXA6dG9nZ2xlJyxcbiAgICAgIHRoaXMudG9nZ2xlRGF0YXRpcC5iaW5kKHRoaXMpXG4gICAgKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnY29yZTpjYW5jZWwnLFxuICAgICAgdGhpcy5fYm91bmRIaWRlRGF0YXRpcFxuICAgICkpO1xuICAgIHRoaXMuX2RlYm91bmNlZE1vdXNlTW92ZSA9ICgpID0+IHt9O1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgZmVhdHVyZUNvbmZpZy5vYnNlcnZlKFxuICAgICAgICAnbnVjbGlkZS1kYXRhdGlwLmRhdGF0aXBEZWJvdW5jZURlbGF5JyxcbiAgICAgICAgZGVib3VuY2VEZWxheSA9PiB0aGlzLnVwZGF0ZURlYm91bmNlRGVsYXkoZGVib3VuY2VEZWxheSksXG4gICAgICApXG4gICAgKTtcbiAgICAvLyBUT0RPKG1vc3QpOiBSZXBsYWNlIHdpdGggQGpqaWFhJ3MgbW91c2VMaXN0ZW5lckZvclRleHRFZGl0b3IgaW50cm9kdWNlZCBpbiBEMjAwNTU0NS5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMoZWRpdG9yID0+IHtcbiAgICAgIC8vIFdoZW4gdGhlIGN1cnNvciBtb3ZlcyB0aGUgbmV4dCB0aW1lIHdlIGRvIGEgdG9nZ2xlIHdlIHNob3VsZCBzaG93IHRoZVxuICAgICAgLy8gbmV3IGRhdGF0aXBcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKCgpID0+IHtcbiAgICAgICAgdGhpcy5fZGF0YXRpcFRvZ2dsZSA9IGZhbHNlO1xuICAgICAgfSkpO1xuXG4gICAgICBjb25zdCBlZGl0b3JWaWV3ID0gYXRvbS52aWV3cy5nZXRWaWV3KGVkaXRvcik7XG4gICAgICBjb25zdCBtb3VzZU1vdmVMaXN0ZW5lciA9IGV2ZW50ID0+IHt0aGlzLmhhbmRsZU1vdXNlTW92ZShldmVudCwgZWRpdG9yLCBlZGl0b3JWaWV3KTt9O1xuICAgICAgZWRpdG9yVmlldy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVMaXN0ZW5lcik7XG4gICAgICBjb25zdCBtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uID0gbmV3IERpc3Bvc2FibGUoKCkgPT5cbiAgICAgICAgICBlZGl0b3JWaWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZUxpc3RlbmVyKSk7XG4gICAgICBjb25zdCBkZXN0cm95U3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZGVzdHJveVN1YnNjcmlwdGlvbik7XG4gICAgfSkpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuY2xhc3NOYW1lID0gJ251Y2xpZGUtZGF0YXRpcC1vdmVybGF5JztcblxuICAgIGNvbnN0IGRhdGF0aXBNb3VzZUVudGVyID0gZXZlbnQgPT4gdGhpcy5faGFuZGxlRWxlbWVudE1vdXNlRW50ZXIoZXZlbnQpO1xuICAgIGNvbnN0IGRhdGF0aXBNb3VzZUxlYXZlID0gZXZlbnQgPT4gdGhpcy5faGFuZGxlRWxlbWVudE1vdXNlTGVhdmUoZXZlbnQpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBkYXRhdGlwTW91c2VFbnRlcik7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGRhdGF0aXBNb3VzZUxlYXZlKTtcblxuICAgIHRoaXMuX2RhdGF0aXBQcm92aWRlcnMgPSBbXTtcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX2RhdGF0aXBUb2dnbGUgPSBmYWxzZTtcbiAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gZmFsc2U7XG4gICAgdGhpcy5fcGlubmVkRGF0YXRpcHMgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZ2xvYmFsS2V5ZG93blN1YnNjcmlwdGlvbiA9IG51bGw7XG4gIH1cblxuICB1cGRhdGVEZWJvdW5jZURlbGF5KGRlYm91bmNlRGVsYXk6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2RlYm91bmNlZE1vdXNlTW92ZSA9IGRlYm91bmNlKFxuICAgICAgKGV2ZW50LCBlZGl0b3IsIGVkaXRvclZpZXcpID0+IHtcbiAgICAgICAgdGhpcy5fZGF0YXRpcEZvck1vdXNlRXZlbnQoZXZlbnQsIGVkaXRvciwgZWRpdG9yVmlldyk7XG4gICAgICB9LFxuICAgICAgZGVib3VuY2VEZWxheSxcbiAgICAgIC8qIGltbWVkaWF0ZSAqLyBmYWxzZVxuICAgICk7XG4gIH1cblxuICBoYW5kbGVNb3VzZU1vdmUoZXZlbnQ6IE1vdXNlRXZlbnQsIGVkaXRvcjogVGV4dEVkaXRvciwgZWRpdG9yVmlldzogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCk6IHZvaWQge1xuICAgIHRoaXMuX2RlYm91bmNlZE1vdXNlTW92ZShldmVudCwgZWRpdG9yLCBlZGl0b3JWaWV3KTtcbiAgfVxuXG4gIHRvZ2dsZURhdGF0aXAoKTogdm9pZCB7XG4gICAgdGhpcy5fZGF0YXRpcFRvZ2dsZSA9ICF0aGlzLl9kYXRhdGlwVG9nZ2xlO1xuICAgIGlmICh0aGlzLl9kYXRhdGlwVG9nZ2xlKSB7XG4gICAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgICBpZiAoZWRpdG9yICE9IG51bGwpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5fZGF0YXRpcEluRWRpdG9yKGVkaXRvciwgcG9zaXRpb24pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhpZGVEYXRhdGlwKCk7XG4gICAgfVxuICB9XG5cbiAgaGlkZURhdGF0aXAoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21hcmtlciA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9nbG9iYWxLZXlkb3duU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgdGhpcy5fZ2xvYmFsS2V5ZG93blN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgdGhpcy5fbWFya2VyLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9tYXJrZXIgPSBudWxsO1xuICAgIHRoaXMuX2N1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgdGhpcy5faXNIb3ZlcmluZ0RhdGF0aXAgPSBmYWxzZTtcbiAgfVxuXG4gIF9oYW5kbGVFbGVtZW50TW91c2VFbnRlcihldmVudDogU3ludGhldGljRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IHRydWU7XG4gIH1cblxuICBfaGFuZGxlRWxlbWVudE1vdXNlTGVhdmUoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNIb3ZlcmluZ0RhdGF0aXAgPSBmYWxzZTtcbiAgfVxuXG4gIF9kYXRhdGlwRm9yTW91c2VFdmVudChlOiBNb3VzZUV2ZW50LCBlZGl0b3I6IFRleHRFZGl0b3IsIGVkaXRvclZpZXc6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgaWYgKCFlZGl0b3JWaWV3LmNvbXBvbmVudCkge1xuICAgICAgLy8gVGhlIGVkaXRvciB3YXMgZGVzdHJveWVkLCBidXQgdGhlIGRlc3Ryb3kgaGFuZGxlciBoYXZlbid0IHlldCBiZWVuIGNhbGxlZCB0byBjYW5jZWxcbiAgICAgIC8vIHRoZSB0aW1lci5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGV4dEVkaXRvckNvbXBvbmVudCA9IGVkaXRvclZpZXcuY29tcG9uZW50O1xuICAgIGNvbnN0IHNjcmVlblBvc2l0aW9uID0gdGV4dEVkaXRvckNvbXBvbmVudC5zY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQoZSk7XG4gICAgY29uc3QgcGl4ZWxQb3NpdGlvbiA9IHRleHRFZGl0b3JDb21wb25lbnQucGl4ZWxQb3NpdGlvbkZvck1vdXNlRXZlbnQoZSk7XG4gICAgY29uc3QgcGl4ZWxQb3NpdGlvbkZyb21TY3JlZW5Qb3NpdGlvbiA9XG4gICAgICB0ZXh0RWRpdG9yQ29tcG9uZW50LnBpeGVsUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbik7XG4gICAgLy8gRGlzdGFuY2UgKGluIHBpeGVscykgYmV0d2VlbiBzY3JlZW5Qb3NpdGlvbiBhbmQgdGhlIGN1cnNvci5cbiAgICBjb25zdCBob3Jpem9udGFsRGlzdGFuY2UgPSBwaXhlbFBvc2l0aW9uLmxlZnQgLSBwaXhlbFBvc2l0aW9uRnJvbVNjcmVlblBvc2l0aW9uLmxlZnQ7XG4gICAgLy8gYHNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudC5jb2x1bW5gIGNhbm5vdCBleGNlZWQgdGhlIGN1cnJlbnQgbGluZSBsZW5ndGguXG4gICAgLy8gVGhpcyBpcyBlc3NlbnRpYWxseSBhIGhldXJpc3RpYyBmb3IgXCJtb3VzZSBjdXJzb3IgaXMgdG8gdGhlIGxlZnQgb3IgcmlnaHQgb2YgdGV4dCBjb250ZW50XCIuXG4gICAgaWYgKHBpeGVsUG9zaXRpb24ubGVmdCA8IDAgfHwgaG9yaXpvbnRhbERpc3RhbmNlID4gZWRpdG9yLmdldERlZmF1bHRDaGFyV2lkdGgoKSkge1xuICAgICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBidWZmZXJQb3NpdGlvbiA9IGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKTtcbiAgICB0aGlzLl9kYXRhdGlwSW5FZGl0b3IoZWRpdG9yLCBidWZmZXJQb3NpdGlvbik7XG4gIH1cblxuICBhc3luYyBfZGF0YXRpcEluRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlIHtcbiAgICBpZiAodGhpcy5faXNIb3ZlcmluZ0RhdGF0aXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3VycmVudFJhbmdlICE9IG51bGwgJiYgdGhpcy5fY3VycmVudFJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21hcmtlciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmhpZGVEYXRhdGlwKCk7XG4gICAgfVxuXG4gICAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IHByb3ZpZGVycyA9IHRoaXMuX2dldE1hdGNoaW5nUHJvdmlkZXJzRm9yU2NvcGVOYW1lKHNjb3BlTmFtZSk7XG4gICAgaWYgKHByb3ZpZGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGF0YXRpcHMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIHByb3ZpZGVycy5tYXAoYXN5bmMgKHByb3ZpZGVyOiBEYXRhdGlwUHJvdmlkZXIpOiBQcm9taXNlPE9iamVjdD4gPT4ge1xuICAgICAgICBsZXQgbmFtZTtcbiAgICAgICAgaWYgKHByb3ZpZGVyLnByb3ZpZGVyTmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgbmFtZSA9IHByb3ZpZGVyLnByb3ZpZGVyTmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gJ3Vua25vd24nO1xuICAgICAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0RhdGF0aXAgcHJvdmlkZXIgaGFzIG5vIG5hbWUnLCBwcm92aWRlcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YXRpcCA9IGF3YWl0IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgIG5hbWUgKyAnLmRhdGF0aXAnLFxuICAgICAgICAgICgpID0+IHByb3ZpZGVyLmRhdGF0aXAoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgICAgICk7XG4gICAgICAgIGlmICghZGF0YXRpcCB8fCB0aGlzLl9tYXJrZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qge3Bpbm5hYmxlLCBjb21wb25lbnQsIHJhbmdlfSA9IGRhdGF0aXA7XG4gICAgICAgIC8vIFdlIHRyYWNrIHRoZSB0aW1pbmcgYWJvdmUsIGJ1dCB3ZSBzdGlsbCB3YW50IHRvIGtub3cgdGhlIG51bWJlciBvZiBwb3B1cHMgdGhhdCBhcmUgc2hvd24uXG4gICAgICAgIHRyYWNrKCdkYXRhdGlwLXBvcHVwJywge1xuICAgICAgICAgICdzY29wZSc6IHNjb3BlTmFtZSxcbiAgICAgICAgICAncHJvdmlkZXJOYW1lJzogbmFtZSxcbiAgICAgICAgICByYW5nZVN0YXJ0Um93OiBTdHJpbmcocmFuZ2Uuc3RhcnQucm93KSxcbiAgICAgICAgICByYW5nZVN0YXJ0Q29sdW1uOiBTdHJpbmcocmFuZ2Uuc3RhcnQuY29sdW1uKSxcbiAgICAgICAgICByYW5nZUVuZFJvdzogU3RyaW5nKHJhbmdlLmVuZC5yb3cpLFxuICAgICAgICAgIHJhbmdlRW5kQ29sdW1uOiBTdHJpbmcocmFuZ2UuZW5kLmNvbHVtbiksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSByYW5nZTtcbiAgICAgICAgbGV0IGFjdGlvbiwgYWN0aW9uVGl0bGU7XG4gICAgICAgIC8vIERhdGF0aXBzIGFyZSBwaW5uYWJsZSBieSBkZWZhdWx0LCB1bmxlc3MgZXhwbGljaXRseSBzcGVjaWZpZWQgb3RoZXJ3aXNlLlxuICAgICAgICBpZiAocGlubmFibGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgYWN0aW9uID0gREFUQVRJUF9BQ1RJT05TLlBJTjtcbiAgICAgICAgICBhY3Rpb25UaXRsZSA9ICdQaW4gdGhpcyBEYXRhdGlwJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgIHBpbm5hYmxlLFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgYWN0aW9uLFxuICAgICAgICAgIGFjdGlvblRpdGxlLFxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IG5vbkVtcHR5RGF0YXRpcHMgPSBkYXRhdGlwcy5maWx0ZXIoZGF0YXRpcCA9PiBkYXRhdGlwICE9IG51bGwpO1xuICAgIGlmIChub25FbXB0eURhdGF0aXBzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJlZFByb3ZpZGVycyA9IG5vbkVtcHR5RGF0YXRpcHMubWFwKGRhdGF0aXAgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgYWN0aW9uVGl0bGUsXG4gICAgICB9ID0gZGF0YXRpcDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxEYXRhdGlwQ29tcG9uZW50XG4gICAgICAgICAgYWN0aW9uPXthY3Rpb259XG4gICAgICAgICAgYWN0aW9uVGl0bGU9e2FjdGlvblRpdGxlfVxuICAgICAgICAgIG9uQWN0aW9uQ2xpY2s9e3RoaXMuX2hhbmRsZVBpbkNsaWNrZWQuYmluZCh0aGlzLCBlZGl0b3IsIGRhdGF0aXApfVxuICAgICAgICAgIGtleT17bmFtZX0+XG4gICAgICAgICAge2NvbXBvbmVudH1cbiAgICAgICAgPC9EYXRhdGlwQ29tcG9uZW50PlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGxldCBjb21iaW5lZFJhbmdlID0gbm9uRW1wdHlEYXRhdGlwc1swXS5yYW5nZTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vbkVtcHR5RGF0YXRpcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbWJpbmVkUmFuZ2UgPSBjb21iaW5lZFJhbmdlLnVuaW9uKG5vbkVtcHR5RGF0YXRpcHNbaV0ucmFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgbWF0Y2hlZCBlbGVtZW50IHJhbmdlIHRvIHRoZSBoaW50IHJhbmdlLlxuICAgIGNvbnN0IG1hcmtlcjogYXRvbSRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKGNvbWJpbmVkUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPGRpdj57cmVuZGVyZWRQcm92aWRlcnN9PC9kaXY+LFxuICAgICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnRcbiAgICApO1xuICAgIC8vIFRoaXMgcmVsYXRpdmUgcG9zaXRpb25pbmcgaXMgdG8gd29yayBhcm91bmQgdGhlIGlzc3VlIHRoYXQgYHBvc2l0aW9uOiAnaGVhZCdgXG4gICAgLy8gZG9lc24ndCB3b3JrIGZvciBvdmVybGF5IGRlY29yYXRvcnMgYXJlIHJlbmRlcmVkIG9uIHRoZSBib3R0b20gcmlnaHQgb2YgdGhlIGdpdmVuIHJhbmdlLlxuICAgIC8vIEF0b20gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY2OTVcbiAgICBjb25zdCBleHByZXNzaW9uTGVuZ3RoID0gY29tYmluZWRSYW5nZS5lbmQuY29sdW1uIC0gY29tYmluZWRSYW5nZS5zdGFydC5jb2x1bW47XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUubGVmdCA9XG4gICAgICAtKGV4cHJlc3Npb25MZW5ndGggKiBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKSArICAncHgnO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgIHBvc2l0aW9uOiAnaGVhZCcsXG4gICAgICAgIGl0ZW06IHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LFxuICAgICAgfVxuICAgICk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6ICdudWNsaWRlLWRhdGF0aXAtaGlnaGxpZ2h0LXJlZ2lvbicsXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb0dsb2JhbEtleWRvd24oKTtcbiAgfVxuXG4gIF9zdWJzY3JpYmVUb0dsb2JhbEtleWRvd24oKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBlZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JvdW5kSGlkZURhdGF0aXApO1xuICAgIHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBlZGl0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JvdW5kSGlkZURhdGF0aXApO1xuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVBpbkNsaWNrZWQoZWRpdG9yOiBUZXh0RWRpdG9yLCBkYXRhdGlwOiBEYXRhdGlwKTogdm9pZCB7XG4gICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmFkZChuZXcgUGlubmVkRGF0YXRpcChkYXRhdGlwLCBlZGl0b3IsIHBpbm5lZERhdGF0aXAgPT4ge1xuICAgICAgdGhpcy5fcGlubmVkRGF0YXRpcHMuZGVsZXRlKHBpbm5lZERhdGF0aXApO1xuICAgIH0pKTtcbiAgfVxuXG4gIF9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWU6IHN0cmluZyk6IEFycmF5PERhdGF0aXBQcm92aWRlcj4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhdGlwUHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ID4gMCAmJiBwcm92aWRlci52YWxpZEZvclNjb3BlKHNjb3BlTmFtZSk7XG4gICAgfSkuc29ydCgocHJvdmlkZXJBOiBEYXRhdGlwUHJvdmlkZXIsIHByb3ZpZGVyQjogRGF0YXRpcFByb3ZpZGVyKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJBLmluY2x1c2lvblByaW9yaXR5IC0gcHJvdmlkZXJCLmluY2x1c2lvblByaW9yaXR5O1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcikge1xuICAgIHRoaXMuX2RhdGF0aXBQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyKTogdm9pZCB7XG4gICAgYXJyYXkucmVtb3ZlKHRoaXMuX2RhdGF0aXBQcm92aWRlcnMsIHByb3ZpZGVyKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnJlbW92ZSgpO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmZvckVhY2gocGlubmVkRGF0YXRpcCA9PiBwaW5uZWREYXRhdGlwLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==