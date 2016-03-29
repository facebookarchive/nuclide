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
//# sourceMappingURL=data:application/json;base64,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QUNsRSxDQUFDLENBQUM7S0FDSjs7O1dBRVUscUJBQUMsUUFBeUIsRUFBRTtBQUNyQyxVQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFYSx3QkFBQyxRQUF5QixFQUFRO0FBQzlDLDRCQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDaEQ7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25CLDZCQUFTLHNCQUFzQixDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQy9ELFVBQUksQ0FBQyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN2QyxVQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxVQUFBLGFBQWE7ZUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ3ZFLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDL0I7OztTQXZUVSxjQUFjIiwiZmlsZSI6IkRhdGF0aXBNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBEYXRhdGlwLFxuICBEYXRhdGlwUHJvdmlkZXIsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGF0YXRpcC1pbnRlcmZhY2VzJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuXG5pbXBvcnQge2FycmF5LCBkZWJvdW5jZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmltcG9ydCB7RGF0YXRpcENvbXBvbmVudCwgREFUQVRJUF9BQ1RJT05TfSBmcm9tICcuL0RhdGF0aXBDb21wb25lbnQnO1xuaW1wb3J0IHtQaW5uZWREYXRhdGlwfSBmcm9tICcuL1Bpbm5lZERhdGF0aXAnO1xuXG5pbXBvcnQgZmVhdHVyZUNvbmZpZyBmcm9tICcuLi8uLi9udWNsaWRlLWZlYXR1cmUtY29uZmlnJztcblxuZXhwb3J0IGNsYXNzIERhdGF0aXBNYW5hZ2VyIHtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9kZWJvdW5jZWRNb3VzZU1vdmU6XG4gICAgKGV2ZW50OiBNb3VzZUV2ZW50LCBlZGl0b3I6IFRleHRFZGl0b3IsIGVkaXRvclZpZXc6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpID0+IHZvaWQ7XG4gIF9ib3VuZEhpZGVEYXRhdGlwOiBGdW5jdGlvbjtcbiAgX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgX21hcmtlcjogP2F0b20kTWFya2VyO1xuICBfZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfY3VycmVudFJhbmdlOiA/YXRvbSRSYW5nZTtcbiAgX2lzSG92ZXJpbmdEYXRhdGlwOiBib29sZWFuO1xuICBfZGF0YXRpcFByb3ZpZGVyczogQXJyYXk8RGF0YXRpcFByb3ZpZGVyPjtcbiAgX3Bpbm5lZERhdGF0aXBzOiBTZXQ8UGlubmVkRGF0YXRpcD47XG4gIC8qKlxuICAgKiBUaGlzIGhlbHBzIGRldGVybWluZSBpZiB3ZSBzaG91bGQgc2hvdyB0aGUgZGF0YXRpcCB3aGVuIHRvZ2dsaW5nIGl0IHZpYVxuICAgKiBjb21tYW5kLiBUaGUgdG9nZ2xlIGNvbW1hbmQgZmlyc3QgbmVnYXRlcyB0aGlzLCBhbmQgdGhlbiBpZiB0aGlzIGlzIHRydWVcbiAgICogc2hvd3MgYSBkYXRhdGlwLCBvdGhlcndpc2UgaXQgaGlkZXMgdGhlIGN1cnJlbnQgZGF0YXRpcC5cbiAgICovXG4gIF9kYXRhdGlwVG9nZ2xlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2JvdW5kSGlkZURhdGF0aXAgPSB0aGlzLmhpZGVEYXRhdGlwLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoXG4gICAgICAnYXRvbS10ZXh0LWVkaXRvcicsXG4gICAgICAnbnVjbGlkZS1kYXRhdGlwOnRvZ2dsZScsXG4gICAgICB0aGlzLnRvZ2dsZURhdGF0aXAuYmluZCh0aGlzKVxuICAgICkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ2NvcmU6Y2FuY2VsJyxcbiAgICAgIHRoaXMuX2JvdW5kSGlkZURhdGF0aXBcbiAgICApKTtcbiAgICB0aGlzLl9kZWJvdW5jZWRNb3VzZU1vdmUgPSAoKSA9PiB7fTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGZlYXR1cmVDb25maWcub2JzZXJ2ZShcbiAgICAgICAgJ251Y2xpZGUtZGF0YXRpcC5kYXRhdGlwRGVib3VuY2VEZWxheScsXG4gICAgICAgIGRlYm91bmNlRGVsYXkgPT4gdGhpcy51cGRhdGVEZWJvdW5jZURlbGF5KGRlYm91bmNlRGVsYXkpLFxuICAgICAgKVxuICAgICk7XG4gICAgLy8gVE9ETyhtb3N0KTogUmVwbGFjZSB3aXRoIEBqamlhYSdzIG1vdXNlTGlzdGVuZXJGb3JUZXh0RWRpdG9yIGludHJvZHVjZWQgaW4gRDIwMDU1NDUuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICAvLyBXaGVuIHRoZSBjdXJzb3IgbW92ZXMgdGhlIG5leHQgdGltZSB3ZSBkbyBhIHRvZ2dsZSB3ZSBzaG91bGQgc2hvdyB0aGVcbiAgICAgIC8vIG5ldyBkYXRhdGlwXG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChlZGl0b3Iub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbigoKSA9PiB7XG4gICAgICAgIHRoaXMuX2RhdGF0aXBUb2dnbGUgPSBmYWxzZTtcbiAgICAgIH0pKTtcblxuICAgICAgY29uc3QgZWRpdG9yVmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICAgICAgY29uc3QgbW91c2VNb3ZlTGlzdGVuZXIgPSBldmVudCA9PiB7dGhpcy5oYW5kbGVNb3VzZU1vdmUoZXZlbnQsIGVkaXRvciwgZWRpdG9yVmlldyk7fTtcbiAgICAgIGVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlTGlzdGVuZXIpO1xuICAgICAgY29uc3QgbW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKCgpID0+XG4gICAgICAgICAgZWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVMaXN0ZW5lcikpO1xuICAgICAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUobW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbik7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgIH0pKTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LmNsYXNzTmFtZSA9ICdudWNsaWRlLWRhdGF0aXAtb3ZlcmxheSc7XG5cbiAgICBjb25zdCBkYXRhdGlwTW91c2VFbnRlciA9IGV2ZW50ID0+IHRoaXMuX2hhbmRsZUVsZW1lbnRNb3VzZUVudGVyKGV2ZW50KTtcbiAgICBjb25zdCBkYXRhdGlwTW91c2VMZWF2ZSA9IGV2ZW50ID0+IHRoaXMuX2hhbmRsZUVsZW1lbnRNb3VzZUxlYXZlKGV2ZW50KTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZGF0YXRpcE1vdXNlRW50ZXIpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBkYXRhdGlwTW91c2VMZWF2ZSk7XG5cbiAgICB0aGlzLl9kYXRhdGlwUHJvdmlkZXJzID0gW107XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gZmFsc2U7XG4gICAgdGhpcy5fY3VycmVudFJhbmdlID0gbnVsbDtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IGZhbHNlO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24gPSBudWxsO1xuICB9XG5cbiAgdXBkYXRlRGVib3VuY2VEZWxheShkZWJvdW5jZURlbGF5OiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJvdW5jZWRNb3VzZU1vdmUgPSBkZWJvdW5jZShcbiAgICAgIChldmVudCwgZWRpdG9yLCBlZGl0b3JWaWV3KSA9PiB7XG4gICAgICAgIHRoaXMuX2RhdGF0aXBGb3JNb3VzZUV2ZW50KGV2ZW50LCBlZGl0b3IsIGVkaXRvclZpZXcpO1xuICAgICAgfSxcbiAgICAgIGRlYm91bmNlRGVsYXksXG4gICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2VcbiAgICApO1xuICB9XG5cbiAgaGFuZGxlTW91c2VNb3ZlKGV2ZW50OiBNb3VzZUV2ZW50LCBlZGl0b3I6IFRleHRFZGl0b3IsIGVkaXRvclZpZXc6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9kZWJvdW5jZWRNb3VzZU1vdmUoZXZlbnQsIGVkaXRvciwgZWRpdG9yVmlldyk7XG4gIH1cblxuICB0b2dnbGVEYXRhdGlwKCk6IHZvaWQge1xuICAgIHRoaXMuX2RhdGF0aXBUb2dnbGUgPSAhdGhpcy5fZGF0YXRpcFRvZ2dsZTtcbiAgICBpZiAodGhpcy5fZGF0YXRpcFRvZ2dsZSkge1xuICAgICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgICAgaWYgKGVkaXRvciAhPSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvclNjcmVlblBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuX2RhdGF0aXBJbkVkaXRvcihlZGl0b3IsIHBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIH1cbiAgfVxuXG4gIGhpZGVEYXRhdGlwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9tYXJrZXIgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fZ2xvYmFsS2V5ZG93blN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9nbG9iYWxLZXlkb3duU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIHRoaXMuX21hcmtlci5kZXN0cm95KCk7XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSBudWxsO1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gZmFsc2U7XG4gIH1cblxuICBfaGFuZGxlRWxlbWVudE1vdXNlRW50ZXIoZXZlbnQ6IFN5bnRoZXRpY0V2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5faXNIb3ZlcmluZ0RhdGF0aXAgPSB0cnVlO1xuICB9XG5cbiAgX2hhbmRsZUVsZW1lbnRNb3VzZUxlYXZlKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gZmFsc2U7XG4gIH1cblxuICBfZGF0YXRpcEZvck1vdXNlRXZlbnQoZTogTW91c2VFdmVudCwgZWRpdG9yOiBUZXh0RWRpdG9yLCBlZGl0b3JWaWV3OiBIVE1MRWxlbWVudCk6IHZvaWQge1xuICAgIGlmICghZWRpdG9yVmlldy5jb21wb25lbnQpIHtcbiAgICAgIC8vIFRoZSBlZGl0b3Igd2FzIGRlc3Ryb3llZCwgYnV0IHRoZSBkZXN0cm95IGhhbmRsZXIgaGF2ZW4ndCB5ZXQgYmVlbiBjYWxsZWQgdG8gY2FuY2VsXG4gICAgICAvLyB0aGUgdGltZXIuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHRleHRFZGl0b3JDb21wb25lbnQgPSBlZGl0b3JWaWV3LmNvbXBvbmVudDtcbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IHRleHRFZGl0b3JDb21wb25lbnQuc2NyZWVuUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGUpO1xuICAgIGNvbnN0IHBpeGVsUG9zaXRpb24gPSB0ZXh0RWRpdG9yQ29tcG9uZW50LnBpeGVsUG9zaXRpb25Gb3JNb3VzZUV2ZW50KGUpO1xuICAgIGNvbnN0IHBpeGVsUG9zaXRpb25Gcm9tU2NyZWVuUG9zaXRpb24gPVxuICAgICAgdGV4dEVkaXRvckNvbXBvbmVudC5waXhlbFBvc2l0aW9uRm9yU2NyZWVuUG9zaXRpb24oc2NyZWVuUG9zaXRpb24pO1xuICAgIC8vIERpc3RhbmNlIChpbiBwaXhlbHMpIGJldHdlZW4gc2NyZWVuUG9zaXRpb24gYW5kIHRoZSBjdXJzb3IuXG4gICAgY29uc3QgaG9yaXpvbnRhbERpc3RhbmNlID0gcGl4ZWxQb3NpdGlvbi5sZWZ0IC0gcGl4ZWxQb3NpdGlvbkZyb21TY3JlZW5Qb3NpdGlvbi5sZWZ0O1xuICAgIC8vIGBzY3JlZW5Qb3NpdGlvbkZvck1vdXNlRXZlbnQuY29sdW1uYCBjYW5ub3QgZXhjZWVkIHRoZSBjdXJyZW50IGxpbmUgbGVuZ3RoLlxuICAgIC8vIFRoaXMgaXMgZXNzZW50aWFsbHkgYSBoZXVyaXN0aWMgZm9yIFwibW91c2UgY3Vyc29yIGlzIHRvIHRoZSBsZWZ0IG9yIHJpZ2h0IG9mIHRleHQgY29udGVudFwiLlxuICAgIGlmIChwaXhlbFBvc2l0aW9uLmxlZnQgPCAwIHx8IGhvcml6b250YWxEaXN0YW5jZSA+IGVkaXRvci5nZXREZWZhdWx0Q2hhcldpZHRoKCkpIHtcbiAgICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgYnVmZmVyUG9zaXRpb24gPSBlZGl0b3IuYnVmZmVyUG9zaXRpb25Gb3JTY3JlZW5Qb3NpdGlvbihzY3JlZW5Qb3NpdGlvbik7XG4gICAgdGhpcy5fZGF0YXRpcEluRWRpdG9yKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pO1xuICB9XG5cbiAgYXN5bmMgX2RhdGF0aXBJbkVkaXRvcihlZGl0b3I6IFRleHRFZGl0b3IsIHBvc2l0aW9uOiBhdG9tJFBvaW50KTogUHJvbWlzZSB7XG4gICAgaWYgKHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRSYW5nZSAhPSBudWxsICYmIHRoaXMuX2N1cnJlbnRSYW5nZS5jb250YWluc1BvaW50KHBvc2l0aW9uKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9tYXJrZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIH1cblxuICAgIGNvbnN0IHtzY29wZU5hbWV9ID0gZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgICBjb25zdCBwcm92aWRlcnMgPSB0aGlzLl9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWUpO1xuICAgIGlmIChwcm92aWRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRhdGF0aXBzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICBwcm92aWRlcnMubWFwKGFzeW5jIChwcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyKTogUHJvbWlzZTxPYmplY3Q+ID0+IHtcbiAgICAgICAgbGV0IG5hbWU7XG4gICAgICAgIGlmIChwcm92aWRlci5wcm92aWRlck5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgIG5hbWUgPSBwcm92aWRlci5wcm92aWRlck5hbWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmFtZSA9ICd1bmtub3duJztcbiAgICAgICAgICBjb25zdCBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0RhdGF0aXAgcHJvdmlkZXIgaGFzIG5vIG5hbWUnLCBwcm92aWRlcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YXRpcCA9IGF3YWl0IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgIG5hbWUgKyAnLmRhdGF0aXAnLFxuICAgICAgICAgICgpID0+IHByb3ZpZGVyLmRhdGF0aXAoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgICAgICk7XG4gICAgICAgIGlmICghZGF0YXRpcCB8fCB0aGlzLl9tYXJrZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qge3Bpbm5hYmxlLCBjb21wb25lbnQsIHJhbmdlfSA9IGRhdGF0aXA7XG4gICAgICAgIC8vIFdlIHRyYWNrIHRoZSB0aW1pbmcgYWJvdmUsIGJ1dCB3ZSBzdGlsbCB3YW50IHRvIGtub3cgdGhlIG51bWJlciBvZiBwb3B1cHMgdGhhdCBhcmUgc2hvd24uXG4gICAgICAgIHRyYWNrKCdkYXRhdGlwLXBvcHVwJywge1xuICAgICAgICAgICdzY29wZSc6IHNjb3BlTmFtZSxcbiAgICAgICAgICAncHJvdmlkZXJOYW1lJzogbmFtZSxcbiAgICAgICAgICByYW5nZVN0YXJ0Um93OiBTdHJpbmcocmFuZ2Uuc3RhcnQucm93KSxcbiAgICAgICAgICByYW5nZVN0YXJ0Q29sdW1uOiBTdHJpbmcocmFuZ2Uuc3RhcnQuY29sdW1uKSxcbiAgICAgICAgICByYW5nZUVuZFJvdzogU3RyaW5nKHJhbmdlLmVuZC5yb3cpLFxuICAgICAgICAgIHJhbmdlRW5kQ29sdW1uOiBTdHJpbmcocmFuZ2UuZW5kLmNvbHVtbiksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSByYW5nZTtcbiAgICAgICAgbGV0IGFjdGlvbiwgYWN0aW9uVGl0bGU7XG4gICAgICAgIC8vIERhdGF0aXBzIGFyZSBwaW5uYWJsZSBieSBkZWZhdWx0LCB1bmxlc3MgZXhwbGljaXRseSBzcGVjaWZpZWQgb3RoZXJ3aXNlLlxuICAgICAgICBpZiAocGlubmFibGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgYWN0aW9uID0gREFUQVRJUF9BQ1RJT05TLlBJTjtcbiAgICAgICAgICBhY3Rpb25UaXRsZSA9ICdQaW4gdGhpcyBEYXRhdGlwJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgIHBpbm5hYmxlLFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgYWN0aW9uLFxuICAgICAgICAgIGFjdGlvblRpdGxlLFxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IG5vbkVtcHR5RGF0YXRpcHMgPSBkYXRhdGlwcy5maWx0ZXIoZGF0YXRpcCA9PiBkYXRhdGlwICE9IG51bGwpO1xuICAgIGlmIChub25FbXB0eURhdGF0aXBzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJlZFByb3ZpZGVycyA9IG5vbkVtcHR5RGF0YXRpcHMubWFwKGRhdGF0aXAgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgYWN0aW9uVGl0bGUsXG4gICAgICB9ID0gZGF0YXRpcDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxEYXRhdGlwQ29tcG9uZW50XG4gICAgICAgICAgYWN0aW9uPXthY3Rpb259XG4gICAgICAgICAgYWN0aW9uVGl0bGU9e2FjdGlvblRpdGxlfVxuICAgICAgICAgIG9uQWN0aW9uQ2xpY2s9e3RoaXMuX2hhbmRsZVBpbkNsaWNrZWQuYmluZCh0aGlzLCBlZGl0b3IsIGRhdGF0aXApfVxuICAgICAgICAgIGtleT17bmFtZX0+XG4gICAgICAgICAge2NvbXBvbmVudH1cbiAgICAgICAgPC9EYXRhdGlwQ29tcG9uZW50PlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGxldCBjb21iaW5lZFJhbmdlID0gbm9uRW1wdHlEYXRhdGlwc1swXS5yYW5nZTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vbkVtcHR5RGF0YXRpcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbWJpbmVkUmFuZ2UgPSBjb21iaW5lZFJhbmdlLnVuaW9uKG5vbkVtcHR5RGF0YXRpcHNbaV0ucmFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgbWF0Y2hlZCBlbGVtZW50IHJhbmdlIHRvIHRoZSBoaW50IHJhbmdlLlxuICAgIGNvbnN0IG1hcmtlcjogYXRvbSRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKGNvbWJpbmVkUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPGRpdj57cmVuZGVyZWRQcm92aWRlcnN9PC9kaXY+LFxuICAgICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnRcbiAgICApO1xuICAgIC8vIFRoaXMgcmVsYXRpdmUgcG9zaXRpb25pbmcgaXMgdG8gd29yayBhcm91bmQgdGhlIGlzc3VlIHRoYXQgYHBvc2l0aW9uOiAnaGVhZCdgXG4gICAgLy8gZG9lc24ndCB3b3JrIGZvciBvdmVybGF5IGRlY29yYXRvcnMgYXJlIHJlbmRlcmVkIG9uIHRoZSBib3R0b20gcmlnaHQgb2YgdGhlIGdpdmVuIHJhbmdlLlxuICAgIC8vIEF0b20gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY2OTVcbiAgICBjb25zdCBleHByZXNzaW9uTGVuZ3RoID0gY29tYmluZWRSYW5nZS5lbmQuY29sdW1uIC0gY29tYmluZWRSYW5nZS5zdGFydC5jb2x1bW47XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUubGVmdCA9XG4gICAgICAtKGV4cHJlc3Npb25MZW5ndGggKiBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKSArICAncHgnO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgIHBvc2l0aW9uOiAnaGVhZCcsXG4gICAgICAgIGl0ZW06IHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LFxuICAgICAgfVxuICAgICk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6ICdudWNsaWRlLWRhdGF0aXAtaGlnaGxpZ2h0LXJlZ2lvbicsXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpYmVUb0dsb2JhbEtleWRvd24oKTtcbiAgfVxuXG4gIF9zdWJzY3JpYmVUb0dsb2JhbEtleWRvd24oKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKTtcbiAgICBlZGl0b3IuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JvdW5kSGlkZURhdGF0aXApO1xuICAgIHRoaXMuX2dsb2JhbEtleWRvd25TdWJzY3JpcHRpb24gPSBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICBlZGl0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JvdW5kSGlkZURhdGF0aXApO1xuICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZVBpbkNsaWNrZWQoZWRpdG9yOiBUZXh0RWRpdG9yLCBkYXRhdGlwOiBEYXRhdGlwKTogdm9pZCB7XG4gICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmFkZChuZXcgUGlubmVkRGF0YXRpcChkYXRhdGlwLCBlZGl0b3IsIHBpbm5lZERhdGF0aXAgPT4ge1xuICAgICAgdGhpcy5fcGlubmVkRGF0YXRpcHMuZGVsZXRlKHBpbm5lZERhdGF0aXApO1xuICAgIH0pKTtcbiAgfVxuXG4gIF9nZXRNYXRjaGluZ1Byb3ZpZGVyc0ZvclNjb3BlTmFtZShzY29wZU5hbWU6IHN0cmluZyk6IEFycmF5PERhdGF0aXBQcm92aWRlcj4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhdGlwUHJvdmlkZXJzLmZpbHRlcigocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyLmluY2x1c2lvblByaW9yaXR5ID4gMCAmJiBwcm92aWRlci52YWxpZEZvclNjb3BlKHNjb3BlTmFtZSk7XG4gICAgfSkuc29ydCgocHJvdmlkZXJBOiBEYXRhdGlwUHJvdmlkZXIsIHByb3ZpZGVyQjogRGF0YXRpcFByb3ZpZGVyKSA9PiB7XG4gICAgICByZXR1cm4gcHJvdmlkZXJBLmluY2x1c2lvblByaW9yaXR5IC0gcHJvdmlkZXJCLmluY2x1c2lvblByaW9yaXR5O1xuICAgIH0pO1xuICB9XG5cbiAgYWRkUHJvdmlkZXIocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcikge1xuICAgIHRoaXMuX2RhdGF0aXBQcm92aWRlcnMucHVzaChwcm92aWRlcik7XG4gIH1cblxuICByZW1vdmVQcm92aWRlcihwcm92aWRlcjogRGF0YXRpcFByb3ZpZGVyKTogdm9pZCB7XG4gICAgYXJyYXkucmVtb3ZlKHRoaXMuX2RhdGF0aXBQcm92aWRlcnMsIHByb3ZpZGVyKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5oaWRlRGF0YXRpcCgpO1xuICAgIFJlYWN0RE9NLnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnJlbW92ZSgpO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmZvckVhY2gocGlubmVkRGF0YXRpcCA9PiBwaW5uZWREYXRhdGlwLmRpc3Bvc2UoKSk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==