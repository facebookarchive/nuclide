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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _reactForAtom = require('react-for-atom');

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var _DatatipComponent = require('./DatatipComponent');

var _PinnedDatatip = require('./PinnedDatatip');

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
    this._pinnedDatatips = new Set();
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
      var _this2 = this;

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
        if (!datatip || _this2._marker) {
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
        _this2._currentRange = range;
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
            onActionClick: _this2._handlePinClicked.bind(_this2, editor, datatip),
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
    })
  }, {
    key: '_handlePinClicked',
    value: function _handlePinClicked(editor, datatip) {
      var _this3 = this;

      this.hideDatatip();
      this._pinnedDatatips.add(new _PinnedDatatip.PinnedDatatip(datatip, editor, function (pinnedDatatip) {
        _this3._pinnedDatatips['delete'](pinnedDatatip);
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
//# sourceMappingURL=data:application/json;base64,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Y0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQy9COzs7U0F4UVUsY0FBYyIsImZpbGUiOiJEYXRhdGlwTWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgRGF0YXRpcCxcbiAgRGF0YXRpcFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9kYXRhdGlwLWludGVyZmFjZXMnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5cbmltcG9ydCB7YXJyYXksIGRlYm91bmNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7dHJhY2ssIHRyYWNrT3BlcmF0aW9uVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQge0RhdGF0aXBDb21wb25lbnQsIERBVEFUSVBfQUNUSU9OU30gZnJvbSAnLi9EYXRhdGlwQ29tcG9uZW50JztcbmltcG9ydCB7UGlubmVkRGF0YXRpcH0gZnJvbSAnLi9QaW5uZWREYXRhdGlwJztcblxuY29uc3QgREFUQVRJUF9ERUxBWV9NUyA9IDUwO1xuXG5leHBvcnQgY2xhc3MgRGF0YXRpcE1hbmFnZXIge1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX21hcmtlcjogP2F0b20kTWFya2VyO1xuICBfZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfY3VycmVudFJhbmdlOiA/YXRvbSRSYW5nZTtcbiAgX2lzSG92ZXJpbmdEYXRhdGlwOiBib29sZWFuO1xuICBfZGF0YXRpcFByb3ZpZGVyczogQXJyYXk8RGF0YXRpcFByb3ZpZGVyPjtcbiAgX3Bpbm5lZERhdGF0aXBzOiBTZXQ8UGlubmVkRGF0YXRpcD47XG4gIC8qKlxuICAgKiBUaGlzIGhlbHBzIGRldGVybWluZSBpZiB3ZSBzaG91bGQgc2hvdyB0aGUgZGF0YXRpcCB3aGVuIHRvZ2dsaW5nIGl0IHZpYVxuICAgKiBjb21tYW5kLiBUaGUgdG9nZ2xlIGNvbW1hbmQgZmlyc3QgbmVnYXRlcyB0aGlzLCBhbmQgdGhlbiBpZiB0aGlzIGlzIHRydWVcbiAgICogc2hvd3MgYSBkYXRhdGlwLCBvdGhlcndpc2UgaXQgaGlkZXMgdGhlIGN1cnJlbnQgZGF0YXRpcC5cbiAgICovXG4gIF9kYXRhdGlwVG9nZ2xlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKFxuICAgICAgJ2F0b20tdGV4dC1lZGl0b3InLFxuICAgICAgJ251Y2xpZGUtZGF0YXRpcDp0b2dnbGUnLFxuICAgICAgdGhpcy50b2dnbGVEYXRhdGlwLmJpbmQodGhpcylcbiAgICApKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChcbiAgICAgICdhdG9tLXRleHQtZWRpdG9yJyxcbiAgICAgICdjb3JlOmNhbmNlbCcsXG4gICAgICB0aGlzLmhpZGVEYXRhdGlwLmJpbmQodGhpcylcbiAgICApKTtcblxuICAgIC8vIFRPRE8obW9zdCk6IFJlcGxhY2Ugd2l0aCBAamppYWEncyBtb3VzZUxpc3RlbmVyRm9yVGV4dEVkaXRvciBpbnRyb2R1Y2VkIGluIEQyMDA1NTQ1LlxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyhlZGl0b3IgPT4ge1xuICAgICAgLy8gV2hlbiB0aGUgY3Vyc29yIG1vdmVzIHRoZSBuZXh0IHRpbWUgd2UgZG8gYSB0b2dnbGUgd2Ugc2hvdWxkIHNob3cgdGhlXG4gICAgICAvLyBuZXcgZGF0YXRpcFxuICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oKCkgPT4ge1xuICAgICAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gZmFsc2U7XG4gICAgICB9KSk7XG5cbiAgICAgIGNvbnN0IGVkaXRvclZpZXcgPSBhdG9tLnZpZXdzLmdldFZpZXcoZWRpdG9yKTtcbiAgICAgIGNvbnN0IG1vdXNlTW92ZUxpc3RlbmVyID0gZGVib3VuY2UoXG4gICAgICAgIGUgPT4ge3RoaXMuX2RhdGF0aXBGb3JNb3VzZUV2ZW50KCgoZTogYW55KTogTW91c2VFdmVudCksIGVkaXRvciwgZWRpdG9yVmlldyk7fSxcbiAgICAgICAgREFUQVRJUF9ERUxBWV9NUyxcbiAgICAgICAgLyogaW1tZWRpYXRlICovIGZhbHNlLFxuICAgICAgKTtcbiAgICAgIGVkaXRvclZpZXcuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgbW91c2VNb3ZlTGlzdGVuZXIpO1xuICAgICAgY29uc3QgbW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbiA9IG5ldyBEaXNwb3NhYmxlKCgpID0+XG4gICAgICAgICAgZWRpdG9yVmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBtb3VzZU1vdmVMaXN0ZW5lcikpO1xuICAgICAgY29uc3QgZGVzdHJveVN1YnNjcmlwdGlvbiA9IGVkaXRvci5vbkRpZERlc3Ryb3koKCkgPT4ge1xuICAgICAgICBtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5yZW1vdmUobW91c2VMaXN0ZW5lclN1YnNjcmlwdGlvbik7XG4gICAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMucmVtb3ZlKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChtb3VzZUxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKGRlc3Ryb3lTdWJzY3JpcHRpb24pO1xuICAgIH0pKTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LmNsYXNzTmFtZSA9ICdudWNsaWRlLWRhdGF0aXAtb3ZlcmxheSc7XG5cbiAgICBjb25zdCBkYXRhdGlwTW91c2VFbnRlciA9IGV2ZW50ID0+IHRoaXMuX2hhbmRsZUVsZW1lbnRNb3VzZUVudGVyKGV2ZW50KTtcbiAgICBjb25zdCBkYXRhdGlwTW91c2VMZWF2ZSA9IGV2ZW50ID0+IHRoaXMuX2hhbmRsZUVsZW1lbnRNb3VzZUxlYXZlKGV2ZW50KTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgZGF0YXRpcE1vdXNlRW50ZXIpO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBkYXRhdGlwTW91c2VMZWF2ZSk7XG5cbiAgICB0aGlzLl9kYXRhdGlwUHJvdmlkZXJzID0gW107XG4gICAgdGhpcy5fbWFya2VyID0gbnVsbDtcbiAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gZmFsc2U7XG4gICAgdGhpcy5fY3VycmVudFJhbmdlID0gbnVsbDtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IGZhbHNlO1xuICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzID0gbmV3IFNldCgpO1xuICB9XG5cbiAgdG9nZ2xlRGF0YXRpcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kYXRhdGlwVG9nZ2xlID0gIXRoaXMuX2RhdGF0aXBUb2dnbGU7XG4gICAgaWYgKHRoaXMuX2RhdGF0aXBUb2dnbGUpIHtcbiAgICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICAgIGlmIChlZGl0b3IgIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IGVkaXRvci5nZXRDdXJzb3JTY3JlZW5Qb3NpdGlvbigpO1xuICAgICAgICB0aGlzLl9kYXRhdGlwSW5FZGl0b3IoZWRpdG9yLCBwb3NpdGlvbik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICB9XG4gIH1cblxuICBoaWRlRGF0YXRpcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbWFya2VyID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB0aGlzLl9tYXJrZXIuZGVzdHJveSgpO1xuICAgIHRoaXMuX21hcmtlciA9IG51bGw7XG4gICAgdGhpcy5fY3VycmVudFJhbmdlID0gbnVsbDtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IGZhbHNlO1xuICB9XG5cbiAgX2hhbmRsZUVsZW1lbnRNb3VzZUVudGVyKGV2ZW50OiBTeW50aGV0aWNFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuX2lzSG92ZXJpbmdEYXRhdGlwID0gdHJ1ZTtcbiAgfVxuXG4gIF9oYW5kbGVFbGVtZW50TW91c2VMZWF2ZShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLl9pc0hvdmVyaW5nRGF0YXRpcCA9IGZhbHNlO1xuICB9XG5cbiAgX2RhdGF0aXBGb3JNb3VzZUV2ZW50KGU6IE1vdXNlRXZlbnQsIGVkaXRvcjogVGV4dEVkaXRvciwgZWRpdG9yVmlldzogSFRNTEVsZW1lbnQpIHtcbiAgICBpZiAoIWVkaXRvclZpZXcuY29tcG9uZW50KSB7XG4gICAgICAvLyBUaGUgZWRpdG9yIHdhcyBkZXN0cm95ZWQsIGJ1dCB0aGUgZGVzdHJveSBoYW5kbGVyIGhhdmVuJ3QgeWV0IGJlZW4gY2FsbGVkIHRvIGNhbmNlbFxuICAgICAgLy8gdGhlIHRpbWVyLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzY3JlZW5Qb3NpdGlvbiA9IGVkaXRvclZpZXcuY29tcG9uZW50LnNjcmVlblBvc2l0aW9uRm9yTW91c2VFdmVudChlKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IGVkaXRvci5idWZmZXJQb3NpdGlvbkZvclNjcmVlblBvc2l0aW9uKHNjcmVlblBvc2l0aW9uKTtcbiAgICB0aGlzLl9kYXRhdGlwSW5FZGl0b3IoZWRpdG9yLCBwb3NpdGlvbik7XG4gIH1cblxuICBhc3luYyBfZGF0YXRpcEluRWRpdG9yKGVkaXRvcjogVGV4dEVkaXRvciwgcG9zaXRpb246IGF0b20kUG9pbnQpOiBQcm9taXNlIHtcbiAgICBpZiAodGhpcy5faXNIb3ZlcmluZ0RhdGF0aXApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fY3VycmVudFJhbmdlICE9IG51bGwgJiYgdGhpcy5fY3VycmVudFJhbmdlLmNvbnRhaW5zUG9pbnQocG9zaXRpb24pKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX21hcmtlciAhPSBudWxsKSB7XG4gICAgICB0aGlzLmhpZGVEYXRhdGlwKCk7XG4gICAgfVxuXG4gICAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICAgIGNvbnN0IHByb3ZpZGVycyA9IHRoaXMuX2dldE1hdGNoaW5nUHJvdmlkZXJzRm9yU2NvcGVOYW1lKHNjb3BlTmFtZSk7XG4gICAgaWYgKHByb3ZpZGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGF0YXRpcHMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgIHByb3ZpZGVycy5tYXAoYXN5bmMgKHByb3ZpZGVyOiBEYXRhdGlwUHJvdmlkZXIpOiBQcm9taXNlPE9iamVjdD4gPT4ge1xuICAgICAgICBsZXQgbmFtZTtcbiAgICAgICAgaWYgKHByb3ZpZGVyLnByb3ZpZGVyTmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgbmFtZSA9IHByb3ZpZGVyLnByb3ZpZGVyTmFtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuYW1lID0gJ3Vua25vd24nO1xuICAgICAgICAgIGNvbnN0IGxvZ2dlciA9IHJlcXVpcmUoJy4uLy4uL2xvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ0RhdGF0aXAgcHJvdmlkZXIgaGFzIG5vIG5hbWUnLCBwcm92aWRlcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZGF0YXRpcCA9IGF3YWl0IHRyYWNrT3BlcmF0aW9uVGltaW5nKFxuICAgICAgICAgIG5hbWUgKyAnLmRhdGF0aXAnLFxuICAgICAgICAgICgpID0+IHByb3ZpZGVyLmRhdGF0aXAoZWRpdG9yLCBwb3NpdGlvbiksXG4gICAgICAgICk7XG4gICAgICAgIGlmICghZGF0YXRpcCB8fCB0aGlzLl9tYXJrZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qge3Bpbm5hYmxlLCBjb21wb25lbnQsIHJhbmdlfSA9IGRhdGF0aXA7XG4gICAgICAgIC8vIFdlIHRyYWNrIHRoZSB0aW1pbmcgYWJvdmUsIGJ1dCB3ZSBzdGlsbCB3YW50IHRvIGtub3cgdGhlIG51bWJlciBvZiBwb3B1cHMgdGhhdCBhcmUgc2hvd24uXG4gICAgICAgIHRyYWNrKCdkYXRhdGlwLXBvcHVwJywge1xuICAgICAgICAgICdzY29wZSc6IHNjb3BlTmFtZSxcbiAgICAgICAgICAncHJvdmlkZXJOYW1lJzogbmFtZSxcbiAgICAgICAgICByYW5nZVN0YXJ0Um93OiBTdHJpbmcocmFuZ2Uuc3RhcnQucm93KSxcbiAgICAgICAgICByYW5nZVN0YXJ0Q29sdW1uOiBTdHJpbmcocmFuZ2Uuc3RhcnQuY29sdW1uKSxcbiAgICAgICAgICByYW5nZUVuZFJvdzogU3RyaW5nKHJhbmdlLmVuZC5yb3cpLFxuICAgICAgICAgIHJhbmdlRW5kQ29sdW1uOiBTdHJpbmcocmFuZ2UuZW5kLmNvbHVtbiksXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLl9jdXJyZW50UmFuZ2UgPSByYW5nZTtcbiAgICAgICAgbGV0IGFjdGlvbiwgYWN0aW9uVGl0bGU7XG4gICAgICAgIC8vIERhdGF0aXBzIGFyZSBwaW5uYWJsZSBieSBkZWZhdWx0LCB1bmxlc3MgZXhwbGljaXRseSBzcGVjaWZpZWQgb3RoZXJ3aXNlLlxuICAgICAgICBpZiAocGlubmFibGUgIT09IGZhbHNlKSB7XG4gICAgICAgICAgYWN0aW9uID0gREFUQVRJUF9BQ1RJT05TLlBJTjtcbiAgICAgICAgICBhY3Rpb25UaXRsZSA9ICdQaW4gdGhpcyBEYXRhdGlwJztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgcmFuZ2UsXG4gICAgICAgICAgY29tcG9uZW50LFxuICAgICAgICAgIHBpbm5hYmxlLFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgYWN0aW9uLFxuICAgICAgICAgIGFjdGlvblRpdGxlLFxuICAgICAgICB9O1xuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IG5vbkVtcHR5RGF0YXRpcHMgPSBkYXRhdGlwcy5maWx0ZXIoZGF0YXRpcCA9PiBkYXRhdGlwICE9IG51bGwpO1xuICAgIGlmIChub25FbXB0eURhdGF0aXBzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByZW5kZXJlZFByb3ZpZGVycyA9IG5vbkVtcHR5RGF0YXRpcHMubWFwKGRhdGF0aXAgPT4ge1xuICAgICAgY29uc3Qge1xuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIGFjdGlvbixcbiAgICAgICAgYWN0aW9uVGl0bGUsXG4gICAgICB9ID0gZGF0YXRpcDtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxEYXRhdGlwQ29tcG9uZW50XG4gICAgICAgICAgYWN0aW9uPXthY3Rpb259XG4gICAgICAgICAgYWN0aW9uVGl0bGU9e2FjdGlvblRpdGxlfVxuICAgICAgICAgIG9uQWN0aW9uQ2xpY2s9e3RoaXMuX2hhbmRsZVBpbkNsaWNrZWQuYmluZCh0aGlzLCBlZGl0b3IsIGRhdGF0aXApfVxuICAgICAgICAgIGtleT17bmFtZX0+XG4gICAgICAgICAge2NvbXBvbmVudH1cbiAgICAgICAgPC9EYXRhdGlwQ29tcG9uZW50PlxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIGxldCBjb21iaW5lZFJhbmdlID0gbm9uRW1wdHlEYXRhdGlwc1swXS5yYW5nZTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8IG5vbkVtcHR5RGF0YXRpcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbWJpbmVkUmFuZ2UgPSBjb21iaW5lZFJhbmdlLnVuaW9uKG5vbkVtcHR5RGF0YXRpcHNbaV0ucmFuZ2UpO1xuICAgIH1cblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgbWF0Y2hlZCBlbGVtZW50IHJhbmdlIHRvIHRoZSBoaW50IHJhbmdlLlxuICAgIGNvbnN0IG1hcmtlcjogYXRvbSRNYXJrZXIgPSBlZGl0b3IubWFya0J1ZmZlclJhbmdlKGNvbWJpbmVkUmFuZ2UsIHtpbnZhbGlkYXRlOiAnbmV2ZXInfSk7XG4gICAgdGhpcy5fbWFya2VyID0gbWFya2VyO1xuXG4gICAgUmVhY3RET00ucmVuZGVyKFxuICAgICAgPGRpdj57cmVuZGVyZWRQcm92aWRlcnN9PC9kaXY+LFxuICAgICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnRcbiAgICApO1xuICAgIC8vIFRoaXMgcmVsYXRpdmUgcG9zaXRpb25pbmcgaXMgdG8gd29yayBhcm91bmQgdGhlIGlzc3VlIHRoYXQgYHBvc2l0aW9uOiAnaGVhZCdgXG4gICAgLy8gZG9lc24ndCB3b3JrIGZvciBvdmVybGF5IGRlY29yYXRvcnMgYXJlIHJlbmRlcmVkIG9uIHRoZSBib3R0b20gcmlnaHQgb2YgdGhlIGdpdmVuIHJhbmdlLlxuICAgIC8vIEF0b20gaXNzdWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vaXNzdWVzLzY2OTVcbiAgICBjb25zdCBleHByZXNzaW9uTGVuZ3RoID0gY29tYmluZWRSYW5nZS5lbmQuY29sdW1uIC0gY29tYmluZWRSYW5nZS5zdGFydC5jb2x1bW47XG4gICAgdGhpcy5fZXBoZW1lcmFsRGF0YXRpcEVsZW1lbnQuc3R5bGUubGVmdCA9XG4gICAgICAtKGV4cHJlc3Npb25MZW5ndGggKiBlZGl0b3IuZ2V0RGVmYXVsdENoYXJXaWR0aCgpKSArICAncHgnO1xuICAgIHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnb3ZlcmxheScsXG4gICAgICAgIHBvc2l0aW9uOiAnaGVhZCcsXG4gICAgICAgIGl0ZW06IHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50LFxuICAgICAgfVxuICAgICk7XG4gICAgZWRpdG9yLmRlY29yYXRlTWFya2VyKFxuICAgICAgbWFya2VyLFxuICAgICAge1xuICAgICAgICB0eXBlOiAnaGlnaGxpZ2h0JyxcbiAgICAgICAgY2xhc3M6ICdudWNsaWRlLWRhdGF0aXAtaGlnaGxpZ2h0LXJlZ2lvbicsXG4gICAgICB9XG4gICAgKTtcbiAgfVxuXG4gIF9oYW5kbGVQaW5DbGlja2VkKGVkaXRvcjogVGV4dEVkaXRvciwgZGF0YXRpcDogRGF0YXRpcCk6IHZvaWQge1xuICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICB0aGlzLl9waW5uZWREYXRhdGlwcy5hZGQobmV3IFBpbm5lZERhdGF0aXAoZGF0YXRpcCwgZWRpdG9yLCBwaW5uZWREYXRhdGlwID0+IHtcbiAgICAgIHRoaXMuX3Bpbm5lZERhdGF0aXBzLmRlbGV0ZShwaW5uZWREYXRhdGlwKTtcbiAgICB9KSk7XG4gIH1cblxuICBfZ2V0TWF0Y2hpbmdQcm92aWRlcnNGb3JTY29wZU5hbWUoc2NvcGVOYW1lOiBzdHJpbmcpOiBBcnJheTxEYXRhdGlwUHJvdmlkZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YXRpcFByb3ZpZGVycy5maWx0ZXIoKHByb3ZpZGVyOiBEYXRhdGlwUHJvdmlkZXIpID0+IHtcbiAgICAgIHJldHVybiBwcm92aWRlci5pbmNsdXNpb25Qcmlvcml0eSA+IDAgJiYgcHJvdmlkZXIudmFsaWRGb3JTY29wZShzY29wZU5hbWUpO1xuICAgIH0pLnNvcnQoKHByb3ZpZGVyQTogRGF0YXRpcFByb3ZpZGVyLCBwcm92aWRlckI6IERhdGF0aXBQcm92aWRlcikgPT4ge1xuICAgICAgcmV0dXJuIHByb3ZpZGVyQS5pbmNsdXNpb25Qcmlvcml0eSAtIHByb3ZpZGVyQi5pbmNsdXNpb25Qcmlvcml0eTtcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFByb3ZpZGVyKHByb3ZpZGVyOiBEYXRhdGlwUHJvdmlkZXIpIHtcbiAgICB0aGlzLl9kYXRhdGlwUHJvdmlkZXJzLnB1c2gocHJvdmlkZXIpO1xuICB9XG5cbiAgcmVtb3ZlUHJvdmlkZXIocHJvdmlkZXI6IERhdGF0aXBQcm92aWRlcik6IHZvaWQge1xuICAgIGFycmF5LnJlbW92ZSh0aGlzLl9kYXRhdGlwUHJvdmlkZXJzLCBwcm92aWRlcik7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuaGlkZURhdGF0aXAoKTtcbiAgICBSZWFjdERPTS51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX2VwaGVtZXJhbERhdGF0aXBFbGVtZW50KTtcbiAgICB0aGlzLl9lcGhlbWVyYWxEYXRhdGlwRWxlbWVudC5yZW1vdmUoKTtcbiAgICB0aGlzLl9waW5uZWREYXRhdGlwcy5mb3JFYWNoKHBpbm5lZERhdGF0aXAgPT4gcGlubmVkRGF0YXRpcC5kaXNwb3NlKCkpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=