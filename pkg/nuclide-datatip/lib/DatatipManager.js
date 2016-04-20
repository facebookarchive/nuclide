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

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _DatatipComponent = require('./DatatipComponent');

var _PinnedDatatip = require('./PinnedDatatip');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var DatatipManager = (function () {
  function DatatipManager() {
    var _this = this;

    _classCallCheck(this, DatatipManager);

    this._boundHideDatatip = this.hideDatatip.bind(this);
    this._subscriptions = new _atom.CompositeDisposable();
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-datatip:toggle', this.toggleDatatip.bind(this)));
    this._subscriptions.add(atom.commands.add('atom-text-editor', 'core:cancel', this._boundHideDatatip));
    this._debouncedMouseMove = function () {};
    this._subscriptions.add(_nuclideFeatureConfig2['default'].observe('nuclide-datatip.datatipDebounceDelay', function (debounceDelay) {
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

      this._debouncedMouseMove = (0, _nuclideCommons.debounce)(function (event, editor, editorView) {
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
          var logger = require('../../nuclide-logging').getLogger();
          logger.error('Datatip provider has no name', provider);
        }
        var datatip = yield (0, _nuclideAnalytics.trackOperationTiming)(name + '.datatip', function () {
          return provider.datatip(editor, position);
        });
        if (!datatip || _this3._marker) {
          return;
        }
        var pinnable = datatip.pinnable;
        var component = datatip.component;
        var range = datatip.range;

        // We track the timing above, but we still want to know the number of popups that are shown.
        (0, _nuclideAnalytics.track)('datatip-popup', {
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
        var ProvidedComponent = datatip.component;
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
          _reactForAtom.React.createElement(ProvidedComponent, null)
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
      _nuclideCommons.array.remove(this._datatipProviders, provider);
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
//# sourceMappingURL=data:application/json;base64,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QUMsaUJBQWlCLENBQUM7T0FDbEUsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLFFBQXlCLEVBQUU7QUFDckMsVUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUN2Qzs7O1dBRWEsd0JBQUMsUUFBeUIsRUFBUTtBQUM5Qyw0QkFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNuQiw2QkFBUyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMvRCxVQUFJLENBQUMsd0JBQXdCLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkMsVUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsVUFBQSxhQUFhO2VBQUksYUFBYSxDQUFDLE9BQU8sRUFBRTtPQUFBLENBQUMsQ0FBQztBQUN2RSxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0F2VFUsY0FBYyIsImZpbGUiOiJEYXRhdGlwTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcCxcbiAgRGF0YXRpcFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRhdGF0aXAtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge1xuICBSZWFjdCxcbiAgUmVhY3RET00sXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcblxuaW1wb3J0IHthcnJheSwgZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge3RyYWNrLCB0cmFja09wZXJhdGlvblRpbWluZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5pbXBvcnQge0RhdGF0aXBDb21wb25lbnQsIERBVEFUSVBfQUNUSU9OU30gZnJvbSAnLi9EYXRhdGlwQ29tcG9uZW50JztcbmltcG9ydCB7UGlubmVkRGF0YXRpcH0gZnJvbSAnLi9QaW5uZWREYXRhdGlwJztcblxuaW1wb3J0IGZlYXR1cmVDb25maWcgZnJvbSAnLi4vLi4vbnVjbGlkZS1mZWF0dXJlLWNvbmZpZyc7XG5cbmV4cG9ydCBjbGFzcyBEYXRhdGlwTWFuYWdlciB7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGVib3VuY2VkTW91c2VNb3ZlOlxuICAgIChldmVudDogTW91c2VFdmVudCwgZWRpdG9yOiBUZXh0RWRpdG9yLCBlZGl0b3JWaWV3OiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KSA9PiB2b2lkO1xuICBfYm91bmRIaWRlRGF0YXRpcDogRnVuY3Rpb247XG4gIF9nbG9iYWxLZXlkb3duU3Vic2NyaXB0aW9uOiA/SURpc3Bvc2FibGU7XG4gIF9tYXJrZXI6ID9hdG9tJE1hcmtlcjtcbiAgX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX2N1cnJlbnRSYW5nZTogP2F0b20kUmFuZ2U7XG4gIF9pc0hvdmVyaW5nRGF0YXRpcDogYm9vbGVhbjtcbiAgX2RhdGF0aXBQcm92aWRlcnM6IEFycmF5PERhdGF0aXBQcm92aWRlcj47XG4gIF9waW5uZWREYXRhdGlwczogU2V0PFBpbm5lZERhdGF0aXA+O1xuICAvKipcbiAgICogVGhpcyBoZWxwcyBkZXRlcm1pbmUgaWYgd2Ugc2hvdWxkIHNob3cgdGhlIGRhdGF0aXAgd2hlbiB0b2dnbGluZyBpdCB2aWFcbiAgICogY29tbWFuZC4gVGhlIHRvZ2dsZSBjb21tYW5kIGZpcnN0IG5lZ2F0ZXMgdGhpcywgYW5kIHRoZW4gaWYgdGhpcyBpcyB0cnVlXG4gICAqIHNob3dzIGEgZGF0YXRpcCwgb3RoZXJ3aXNlIGl0IGhpZGVzIHRoZSBjdXJyZW50IGRhdGF0aXAuXG4gICAqL1xuICBfZGF0YXRpcFRvZ2dsZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9ib3VuZEhpZGVEYXRhdGlwID0gdGhpcy5oaWRlRGF0YXRpcC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtZGF0YXRpcDp0b2dnbGUnLFxuICAgICAgdGhpcy50b2dnbGVEYXRhdGlwLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICB0aGlzLl9ib3VuZEhpZGVEYXRhdGlwXG4gICAgKSk7XG4gICAgdGhpcy5fZGVib3VuY2VkTW91c2VNb3ZlID0gKCkgPT4ge307XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBmZWF0dXJlQ29uZmlnLm9ic2VydmUoXG4gICAgICAgICdudWNsaWRlLWRhdGF0aXAuZGF0YXRpcERlYm91bmNlRGVsYXknLFxuICAgICAgICBkZWJvdW5jZURlbGF5ID0+IHRoaXMudXBkYXRlRGVib3VuY2VEZWxheShkZWJvdW5jZURlbGF5KSxcbiAgICAgIClcbiAgICApO1xuICAgIC8vIFRPRE8obW9zdCk6IFJlcGxhY2Ugd2l0aCBAamppYWEncyBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvciBpbnRyb2R1Y2VkIGluIEQyMDA1NTQ1LlxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgY3Vyc29yIG1vdmVzIHRoZSBuZXh0IHRpbWUgd2UgZG8gYSB0b2dnbGUgd2Ugc2hvdWxkIHNob3cgdGhlXG4gICAgICAvLyBuZXcgZGF0YXRpcFxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gZmFsc2U7XG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcbiAgICAgIGNvbnN0IG1vdXNlTW92ZUxpc3RlbmVyID0gZXZlbnQgPT4ge3RoaXMuaGFuZGxlTW91c2VNb3ZlKGV2ZW50LCBlZGl0b3IsIGVkaXRvclZpZXcpO307XG4gICAgICBlZGl0b3JWaWV3LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG1vdXNlTW92ZUxpc3RlbmVyKTtcbiAgICAgIGNvbnN0IG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PlxuICAgICAgICAgIGVkaXRvclZpZXcucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlTGlzdGVuZXIpKTtcbiAgICAgIGNvbnN0IGRlc3Ryb3lTdWJzY3JpcHRpb24gPSBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgbW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKG1vdXNlTGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLnJlbW92ZShkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQobW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChkZXN0cm95U3Vic2NyaXB0aW9uKTtcbiAgICB9KSk7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5jbGFzc05hbWUgPSAnbnVjbGlkZS1kYXRhdGlwLW92ZXJsYXknO1xuXG4gICAgY29uc3QgZGF0YXRpcE1vdXNlRW50ZXIgPSBldmVudCA9PiB0aGlzLl9oYW5kbGVFbGVtZW50TW91c2VFbnRlcihldmVudCk7XG4gICAgY29uc3QgZGF0YXRpcE1vdXNlTGVhdmUgPSBldmVudCA9PiB0aGlzLl9oYW5kbGVFbGVtZW50TW91c2VMZWF2ZShldmVudCk7XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIGRhdGF0aXBNb3VzZUVudGVyKTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgZGF0YXRpcE1vdXNlTGVhdmUpO1xuXG4gICAgdGhpcy5fZGF0YXRpcFByb3ZpZGVycyA9IFtdO1xuICAgIHRoaXMuX21hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fZGF0YXRpcFRvZ2dsZSA9IGZhbHNlO1xuICAgIHRoaXMuX2N1cnJlbnRSYW5nZSA9IG51bGw7XG4gICAgdGhpcy5faXNIb3ZlcmluZ0RhdGF0aXAgPSBmYWxzZTtcbiAgICB0aGlzLl9waW5uZWREYXRhdGlwcyA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9nbG9iYWxLZXlkb3duU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgfVxuXG4gIHVwZGF0ZURlYm91bmNlRGVsYXkoZGVib3VuY2VEZWxheTogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZGVib3VuY2VkTW91c2VNb3ZlID0gZGVib3VuY2UoXG4gICAgICAoZXZlbnQsIGVkaXRvciwgZWRpdG9yVmlldykgPT4ge1xuICAgICAgICB0aGlzLl9kYXRhdGlwRm9yTW91c2VFdmVudChldmVudCwgZWRpdG9yLCBlZGl0b3JWaWV3KTtcbiAgICAgIH0sXG4gICAgICBkZWJvdW5jZURlbGF5LFxuICAgICAgLyogaW1tZWRpYXRlICovIGZhbHNlXG4gICAgKTtcbiAgfVxuXG4gIGhhbmRsZU1vdXNlTW92ZShldmVudDogTW91c2VFdmVudCwgZWRpdG9yOiBUZXh0RWRpdG9yLCBlZGl0b3JWaWV3OiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KTogdm9pZCB7XG4gICAgdGhpcy5fZGVib3VuY2VkTW91c2VNb3ZlKGV2ZW50LCBlZGl0b3IsIGVkaXRvclZpZXcpO1xuICB9XG5cbiAgdG9nZ2xlRGF0YXRpcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gIXRoaXMuX2RhdGF0aXBUb2dnbGU7XG4gICAgaWYgKHRoaXMuX2RhdGF0aXBUb2dnbGUpIHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIGlmIChlZGl0b3IgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpO1xuICAgICAgICB0aGlzLl9kYXRhdGlwSW5FZGl0b3IoZWRpdG9yLCBwb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICB9XG4gIH1cblxuICBoaWRlRGF0YXRpcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbWFya2VyID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZ2xvYmFsS2V5ZG93blN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICB0aGlzLl9nbG9iYWxLZXlkb3duU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl9tYXJrZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX21hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudFJhbmdlID0gbnVsbDtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IGZhbHNlO1xuICB9XG5cbiAgX2hhbmRsZUVsZW1lbnRNb3VzZUVudGVyKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gdHJ1ZTtcbiAgfVxuXG4gIF9oYW5kbGVFbGVtZW50TW91c2VMZWF2ZShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IGZhbHNlO1xuICB9XG5cbiAgX2RhdGF0aXBGb3JNb3VzZUV2ZW50KGU6IE1vdXNlRXZlbnQsIGVkaXRvcjogVGV4dEVkaXRvciwgZWRpdG9yVmlldzogSFRNTEVsZW1lbnQpOiB2b2lkIHtcbiAgICBpZiAoIWVkaXRvclZpZXcuY29tcG9uZW50KSB7XG4gICAgICAvLyBUaGUgZWRpdG9yIHdhcyBkZXN0cm95ZWQsIGJ1dCB0aGUgZGVzdHJveSBoYW5kbGVyIGhhdmVuJ3QgeWV0IGJlZW4gY2FsbGVkIHRvIGNhbmNlbFxuICAgICAgLy8gdGhlIHRpbWVyLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0ZXh0RWRpdG9yQ29tcG9uZW50ID0gZWRpdG9yVmlldy5jb21wb25lbnQ7XG4gICAgY29uc3Qgc2NyZWVuUG9zaXRpb24gPSB0ZXh0RWRpdG9yQ29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChlKTtcbiAgICBjb25zdCBwaXhlbFBvc2l0aW9uID0gdGV4dEVkaXRvckNvbXBvbmVudC5waXhlbFBvc2l0aW9uRm9yTW91c2VFdmVudChlKTtcbiAgICBjb25zdCBwaXhlbFBvc2l0aW9uRnJvbVNjcmVlblBvc2l0aW9uID1cbiAgICAgIHRleHRFZGl0b3JDb21wb25lbnQucGl4ZWxQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKTtcbiAgICAvLyBEaXN0YW5jZSAoaW4gcGl4ZWxzKSBiZXR3ZWVuIHNjcmVlblBvc2l0aW9uIGFuZCB0aGUgY3Vyc29yLlxuICAgIGNvbnN0IGhvcml6b250YWxEaXN0YW5jZSA9IHBpeGVsUG9zaXRpb24ubGVmdCAtIHBpeGVsUG9zaXRpb25Gcm9tU2NyZWVuUG9zaXRpb24ubGVmdDtcbiAgICAvLyBgc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50LmNvbHVtbmAgY2Fubm90IGV4Y2VlZCB0aGUgY3VycmVudCBsaW5lIGxlbmd0aC5cbiAgICAvLyBUaGlzIGlzIGVzc2VudGlhbGx5IGEgaGV1cmlzdGljIGZvciBcIm1vdXNlIGN1cnNvciBpcyB0byB0aGUgbGVmdCBvciByaWdodCBvZiB0ZXh0IGNvbnRlbnRcIi5cbiAgICBpZiAocGl4ZWxQb3NpdGlvbi5sZWZ0IDwgMCB8fCBob3Jpem9udGFsRGlzdGFuY2UgPiBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKSB7XG4gICAgICB0aGlzLmhpZGVEYXRhdGlwKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGJ1ZmZlclBvc2l0aW9uID0gZWRpdG9yLmJ1ZmZlclBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICAgIHRoaXMuX2RhdGF0aXBJbkVkaXRvcihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKTtcbiAgfVxuXG4gIGFzeW5jIF9kYXRhdGlwSW5FZGl0b3IoZWRpdG9yOiBUZXh0RWRpdG9yLCBwb3NpdGlvbjogYXRvbSRQb2ludCk6IFByb21pc2Uge1xuICAgIGlmICh0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jdXJyZW50UmFuZ2UgIT0gbnVsbCAmJiB0aGlzLl9jdXJyZW50UmFuZ2UuY29udGFpbnNQb2ludChwb3NpdGlvbikpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbWFya2VyICE9IG51bGwpIHtcbiAgICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7c2NvcGVOYW1lfSA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gICAgY29uc3QgcHJvdmlkZXJzID0gdGhpcy5fZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lKTtcbiAgICBpZiAocHJvdmlkZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkYXRhdGlwcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgcHJvdmlkZXJzLm1hcChhc3luYyAocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcik6IFByb21pc2U8T2JqZWN0PiA9PiB7XG4gICAgICAgIGxldCBuYW1lO1xuICAgICAgICBpZiAocHJvdmlkZXIucHJvdmlkZXJOYW1lICE9IG51bGwpIHtcbiAgICAgICAgICBuYW1lID0gcHJvdmlkZXIucHJvdmlkZXJOYW1lO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5hbWUgPSAndW5rbm93bic7XG4gICAgICAgICAgY29uc3QgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdEYXRhdGlwIHByb3ZpZGVyIGhhcyBubyBuYW1lJywgcHJvdmlkZXIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRhdGF0aXAgPSBhd2FpdCB0cmFja09wZXJhdGlvblRpbWluZyhcbiAgICAgICAgICBuYW1lICsgJy5kYXRhdGlwJyxcbiAgICAgICAgICAoKSA9PiBwcm92aWRlci5kYXRhdGlwKGVkaXRvciwgcG9zaXRpb24pLFxuICAgICAgICApO1xuICAgICAgICBpZiAoIWRhdGF0aXAgfHwgdGhpcy5fbWFya2VyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHtwaW5uYWJsZSwgY29tcG9uZW50LCByYW5nZX0gPSBkYXRhdGlwO1xuICAgICAgICAvLyBXZSB0cmFjayB0aGUgdGltaW5nIGFib3ZlLCBidXQgd2Ugc3RpbGwgd2FudCB0byBrbm93IHRoZSBudW1iZXIgb2YgcG9wdXBzIHRoYXQgYXJlIHNob3duLlxuICAgICAgICB0cmFjaygnZGF0YXRpcC1wb3B1cCcsIHtcbiAgICAgICAgICAnc2NvcGUnOiBzY29wZU5hbWUsXG4gICAgICAgICAgJ3Byb3ZpZGVyTmFtZSc6IG5hbWUsXG4gICAgICAgICAgcmFuZ2VTdGFydFJvdzogU3RyaW5nKHJhbmdlLnN0YXJ0LnJvdyksXG4gICAgICAgICAgcmFuZ2VTdGFydENvbHVtbjogU3RyaW5nKHJhbmdlLnN0YXJ0LmNvbHVtbiksXG4gICAgICAgICAgcmFuZ2VFbmRSb3c6IFN0cmluZyhyYW5nZS5lbmQucm93KSxcbiAgICAgICAgICByYW5nZUVuZENvbHVtbjogU3RyaW5nKHJhbmdlLmVuZC5jb2x1bW4pLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fY3VycmVudFJhbmdlID0gcmFuZ2U7XG4gICAgICAgIGxldCBhY3Rpb24sIGFjdGlvblRpdGxlO1xuICAgICAgICAvLyBEYXRhdGlwcyBhcmUgcGlubmFibGUgYnkgZGVmYXVsdCwgdW5sZXNzIGV4cGxpY2l0bHkgc3BlY2lmaWVkIG90aGVyd2lzZS5cbiAgICAgICAgaWYgKHBpbm5hYmxlICE9PSBmYWxzZSkge1xuICAgICAgICAgIGFjdGlvbiA9IERBVEFUSVBfQUNUSU9OUy5QSU47XG4gICAgICAgICAgYWN0aW9uVGl0bGUgPSAnUGluIHRoaXMgRGF0YXRpcCc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJhbmdlLFxuICAgICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgICBwaW5uYWJsZSxcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGFjdGlvbixcbiAgICAgICAgICBhY3Rpb25UaXRsZSxcbiAgICAgICAgfTtcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb25zdCBub25FbXB0eURhdGF0aXBzID0gZGF0YXRpcHMuZmlsdGVyKGRhdGF0aXAgPT4gZGF0YXRpcCAhPSBudWxsKTtcbiAgICBpZiAobm9uRW1wdHlEYXRhdGlwcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcmVuZGVyZWRQcm92aWRlcnMgPSBub25FbXB0eURhdGF0aXBzLm1hcChkYXRhdGlwID0+IHtcbiAgICAgIGNvbnN0IHtcbiAgICAgICAgY29tcG9uZW50OiBQcm92aWRlZENvbXBvbmVudCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgYWN0aW9uLFxuICAgICAgICBhY3Rpb25UaXRsZSxcbiAgICAgIH0gPSBkYXRhdGlwO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPERhdGF0aXBDb21wb25lbnRcbiAgICAgICAgICBhY3Rpb249e2FjdGlvbn1cbiAgICAgICAgICBhY3Rpb25UaXRsZT17YWN0aW9uVGl0bGV9XG4gICAgICAgICAgb25BY3Rpb25DbGljaz17dGhpcy5faGFuZGxlUGluQ2xpY2tlZC5iaW5kKHRoaXMsIGVkaXRvciwgZGF0YXRpcCl9XG4gICAgICAgICAga2V5PXtuYW1lfT5cbiAgICAgICAgICA8UHJvdmlkZWRDb21wb25lbnQgLz5cbiAgICAgICAgPC9EYXRhdGlwQ29tcG9uZW50PlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGxldCBjb21iaW5lZFJhbmdlID0gbm9uRW1wdHlEYXRhdGlwc1swXS5yYW5nZTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vbkVtcHR5RGF0YXRpcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbWJpbmVkUmFuZ2UgPSBjb21iaW5lZFJhbmdlLnVuaW9uKG5vbkVtcHR5RGF0YXRpcHNbaV0ucmFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgbWF0Y2hlZCBlbGVtZW50IHJhbmdlIHRvIHRoZSBoaW50IHJhbmdlLlxuICAgIGNvbnN0IG1hcmtlcjogYXRvbSRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKGNvbWJpbmVkUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPGRpdj57cmVuZGVyZWRQcm92aWRlcnN9PC9kaXY+LFxuICAgICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnRcbiAgICApO1xuICAgIC8vIFRoaXMgcmVsYXRpdmUgcG9zaXRpb25pbmcgaXMgdG8gd29yayBhcm91bmQgdGhlIGlzc3VlIHRoYXQgYHBvc2l0aW9uOiAnaGVhZCdgXG4gICAgLy8gZG9lc24ndCB3b3JrIGZvciBvdmVybGF5IGRlY29yYXRvcnMgYXJlIHJlbmRlcmVkIG9uIHRoZSBib3R0b20gcmlnaHQgb2YgdGhlIGdpdmVuIHJhbmdlLlxuICAgIC8vIEF0b20gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY2OTVcbiAgICBjb25zdCBleHByZXNzaW9uTGVuZ3RoID0gY29tYmluZWRSYW5nZS5lbmQuY29sdW1uIC0gY29tYmluZWRSYW5nZS5zdGFydC5jb2x1bW47XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUubGVmdCA9XG4gICAgICAtKGV4cHJlc3Npb25MZW5ndGggKiBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKSArICAncHgnO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgIHBvc2l0aW9uOiAnaGVhZCcsXG4gICAgICAgIGl0ZW06IHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LFxuICAgICAgfVxuICAgICk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6ICdudWNsaWRlLWRhdGF0aXAtaGlnaGxpZ2h0LXJlZ2lvbicsXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb0dsb2JhbEtleWRvd24oKTtcbiAgfVxuXG4gIF9zdWJzY3JpYmVUb0dsb2JhbEtleWRvd24oKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBlZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JvdW5kSGlkZURhdGF0aXApO1xuICAgIHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBlZGl0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JvdW5kSGlkZURhdGF0aXApO1xuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVBpbkNsaWNrZWQoZWRpdG9yOiBUZXh0RWRpdG9yLCBkYXRhdGlwOiBEYXRhdGlwKTogdm9pZCB7XG4gICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmFkZChuZXcgUGlubmVkRGF0YXRpcChkYXRhdGlwLCBlZGl0b3IsIHBpbm5lZERhdGF0aXAgPT4ge1xuICAgICAgdGhpcy5fcGlubmVkRGF0YXRpcHMuZGVsZXRlKHBpbm5lZERhdGF0aXApO1xuICAgIH0pKTtcbiAgfVxuXG4gIF9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWU6IHN0cmluZyk6IEFycmF5PERhdGF0aXBQcm92aWRlcj4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhdGlwUHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ID4gMCAmJiBwcm92aWRlci52YWxpZEZvclNjb3BlKHNjb3BlTmFtZSk7XG4gICAgfSkuc29ydCgocHJvdmlkZXJBOiBEYXRhdGlwUHJvdmlkZXIsIHByb3ZpZGVyQjogRGF0YXRpcFByb3ZpZGVyKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJBLmluY2x1c2lvblByaW9yaXR5IC0gcHJvdmlkZXJCLmluY2x1c2lvblByaW9yaXR5O1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcikge1xuICAgIHRoaXMuX2RhdGF0aXBQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyKTogdm9pZCB7XG4gICAgYXJyYXkucmVtb3ZlKHRoaXMuX2RhdGF0aXBQcm92aWRlcnMsIHByb3ZpZGVyKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnJlbW92ZSgpO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmZvckVhY2gocGlubmVkRGF0YXRpcCA9PiBwaW5uZWREYXRhdGlwLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==