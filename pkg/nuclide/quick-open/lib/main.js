var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _reactForAtom = require('react-for-atom');

var _QuickSelectionComponent = require('./QuickSelectionComponent');

var _QuickSelectionComponent2 = _interopRequireDefault(_QuickSelectionComponent);

var _atom = require('atom');

var _featureConfig = require('../../feature-config');

var _featureConfig2 = _interopRequireDefault(_featureConfig);

var _analytics = require('../../analytics');

var debounceFunction = null;
function debounce() {
  var debounceFunc = debounceFunction || (debounceFunction = require('../../commons').debounce);

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return debounceFunc.apply(null, args);
}

function getSearchResultManager() {
  return require('./SearchResultManager')['default'].getInstance();
}

var DEFAULT_PROVIDER = 'OmniSearchResultProvider';
var TOPBAR_APPROX_HEIGHT = 100; // A reasonable heuristic that prevents us from having to measure.
var MODAL_MARGIN = 32;
// don't pre-fill search input if selection is longer than this
var MAX_SELECTION_LENGTH = 1000;

/**
 * A "session" for the purpose of analytics. It exists from the moment the quick-open UI becomes
 * visible until it gets closed, either via file selection or cancellation.
 */
var analyticsSessionId = null;
var AnalyticsEvents = {
  CHANGE_SELECTION: 'quickopen-change-selection',
  CHANGE_TAB: 'quickopen-change-tab',
  CLOSE_PANEL: 'quickopen-close-panel',
  OPEN_PANEL: 'quickopen-open-panel',
  SELECT_FILE: 'quickopen-select-file'
};
var AnalyticsDebounceDelays = {
  CHANGE_TAB: 100,
  CHANGE_SELECTION: 100
};

var trackProviderChange = debounce(function (providerName) {
  analyticsSessionId = analyticsSessionId || Date.now().toString();
  (0, _analytics.track)(AnalyticsEvents.CHANGE_TAB, {
    'quickopen-provider': providerName,
    'quickopen-session': analyticsSessionId
  });
}, AnalyticsDebounceDelays.CHANGE_TAB);

var Activation = (function () {
  function Activation() {
    var _this = this;

    _classCallCheck(this, Activation);

    this._previousFocus = null;
    this._maxScrollableAreaHeight = 10000;
    this._subscriptions = new _atom.CompositeDisposable();
    this._currentProvider = getSearchResultManager().getProviderByName(DEFAULT_PROVIDER);
    var QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
    QuickSelectionDispatcher.getInstance().register(function (action) {
      if (action.actionType === QuickSelectionDispatcher.ActionType.ACTIVE_PROVIDER_CHANGED) {
        _this.toggleProvider(action.providerName);
        _this._render();
      }
    });
    this._reactDiv = document.createElement('div');
    this._searchPanel = atom.workspace.addModalPanel({ item: this._reactDiv, visible: false });
    this._debouncedUpdateModalPosition = debounce(this._updateScrollableHeight.bind(this), 200);
    window.addEventListener('resize', this._debouncedUpdateModalPosition);
    this._customizeModalElement();
    this._updateScrollableHeight();

    this._searchComponent = this._render();

    this._searchComponent.onSelection(function (selection) {
      var options = {};
      if (selection.line) {
        options.initialLine = selection.line;
      }
      if (selection.column) {
        options.initialColumn = selection.column;
      }

      atom.workspace.open(selection.path, options).then(function (textEditor) {
        atom.commands.dispatch(atom.views.getView(textEditor), 'tabs:keep-preview-tab');
      });

      var query = _this._searchComponent.getInputTextEditor().textContent;
      var providerName = _this._currentProvider.name;
      // default to empty string because `track` enforces string-only values
      var sourceProvider = selection.sourceProvider || '';
      (0, _analytics.track)(AnalyticsEvents.SELECT_FILE, {
        'quickopen-filepath': selection.path,
        'quickopen-query': query,
        'quickopen-provider': providerName, // The currently open "tab".
        'quickopen-session': analyticsSessionId || '',
        // Because the `provider` is usually OmniSearch, also track the original provider.
        'quickopen-provider-source': sourceProvider
      });
      _this.closeSearchPanel();
    });

    this._subscriptions.add(atom.commands.add('body', 'core:cancel', function () {
      if (_this._searchPanel && _this._searchPanel.isVisible()) {
        _this.closeSearchPanel();
      }
    }));

    this._searchComponent.onCancellation(function () {
      return _this.closeSearchPanel();
    });
    this._searchComponent.onSelectionChanged(debounce(function (selection) {
      // Only track user-initiated selection-change events.
      if (analyticsSessionId != null) {
        (0, _analytics.track)(AnalyticsEvents.CHANGE_SELECTION, {
          'quickopen-selected-index': selection.selectedItemIndex.toString(),
          'quickopen-selected-service': selection.selectedService,
          'quickopen-selected-directory': selection.selectedDirectory,
          'quickopen-session': analyticsSessionId
        });
      }
    }, AnalyticsDebounceDelays.CHANGE_SELECTION));
  }

  // Customize the element containing the modal.

  _createClass(Activation, [{
    key: '_customizeModalElement',
    value: function _customizeModalElement() {
      var modalElement = this._searchPanel.getItem().parentNode;
      modalElement.style.setProperty('margin-left', '0');
      modalElement.style.setProperty('width', 'auto');
      modalElement.style.setProperty('left', MODAL_MARGIN + 'px');
      modalElement.style.setProperty('right', MODAL_MARGIN + 'px');
    }
  }, {
    key: '_updateScrollableHeight',
    value: function _updateScrollableHeight() {
      var _document$documentElement$getBoundingClientRect = document.documentElement.getBoundingClientRect();

      var height = _document$documentElement$getBoundingClientRect.height;

      this._maxScrollableAreaHeight = height - MODAL_MARGIN - TOPBAR_APPROX_HEIGHT;
      // Force a re-render to update _maxScrollableAreaHeight.
      this._searchComponent = this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      return _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(_QuickSelectionComponent2['default'], {
        activeProvider: this._currentProvider,
        onProviderChange: this.handleActiveProviderChange.bind(this),
        maxScrollableAreaHeight: this._maxScrollableAreaHeight
      }), this._reactDiv);
    }
  }, {
    key: 'handleActiveProviderChange',
    value: function handleActiveProviderChange(newProviderName) {
      trackProviderChange(newProviderName);
      this._currentProvider = getSearchResultManager().getProviderByName(newProviderName);
      this._searchComponent = this._render();
    }
  }, {
    key: 'toggleOmniSearchProvider',
    value: function toggleOmniSearchProvider() {
      require('./QuickSelectionActions').changeActiveProvider('OmniSearchResultProvider');
    }
  }, {
    key: 'toggleProvider',
    value: function toggleProvider(providerName) {
      analyticsSessionId = analyticsSessionId || Date.now().toString();
      (0, _analytics.track)(AnalyticsEvents.CHANGE_TAB, {
        'quickopen-provider': providerName,
        'quickopen-session': analyticsSessionId
      });
      var provider = getSearchResultManager().getProviderByName(providerName);
      // "toggle" behavior
      if (this._searchPanel !== null && this._searchPanel.isVisible() && providerName === this._currentProvider.name) {
        this.closeSearchPanel();
        return;
      }

      this._currentProvider = provider;
      if (this._searchComponent) {
        this._searchComponent = this._render();
      }
      this.showSearchPanel();
    }
  }, {
    key: 'showSearchPanel',
    value: function showSearchPanel() {
      this._previousFocus = document.activeElement;
      if (this._searchComponent && this._searchPanel) {
        // Start a new search "session" for analytics purposes.
        (0, _analytics.track)(AnalyticsEvents.OPEN_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        // showSearchPanel gets called when changing providers even if it's already shown.
        var isAlreadyVisible = this._searchPanel.isVisible();
        this._searchPanel.show();
        this._searchComponent.focus();
        if (_featureConfig2['default'].get('nuclide-quick-open.useSelection') && !isAlreadyVisible) {
          var selectedText = this._getFirstSelectionText();
          if (selectedText && selectedText.length <= MAX_SELECTION_LENGTH) {
            this._searchComponent.setInputValue(selectedText.split('\n')[0]);
          }
        }
        this._searchComponent.selectInput();
      }
    }
  }, {
    key: 'closeSearchPanel',
    value: function closeSearchPanel() {
      if (this._searchComponent && this._searchPanel) {
        (0, _analytics.track)(AnalyticsEvents.CLOSE_PANEL, {
          'quickopen-session': analyticsSessionId || ''
        });
        this._searchPanel.hide();
        this._searchComponent.blur();
        analyticsSessionId = null;
      }

      if (this._previousFocus != null) {
        this._previousFocus.focus();
        this._previousFocus = null;
      }
    }
  }, {
    key: '_getFirstSelectionText',
    value: function _getFirstSelectionText() {
      var editor = atom.workspace.getActiveTextEditor();
      if (editor) {
        return editor.getSelections()[0].getText();
      }
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return Activation;
})();

var activation = null;
function getActivation() {
  if (activation == null) {
    activation = new Activation();
  }
  return activation;
}

var listeners = null;

module.exports = {
  activate: function activate() {
    listeners = new _atom.CompositeDisposable();
    listeners.add(atom.commands.add('atom-workspace', {
      'nuclide-quick-open:find-anything-via-omni-search': function nuclideQuickOpenFindAnythingViaOmniSearch() {
        getActivation().toggleOmniSearchProvider();
      }
    }));
    getActivation();
  },

  registerProvider: function registerProvider(service) {
    return getSearchResultManager().registerProvider(service);
  },

  registerStore: function registerStore() {
    return getSearchResultManager();
  },

  getHomeFragments: function getHomeFragments() {
    return {
      feature: {
        title: 'Quick Open',
        icon: 'search',
        description: 'A powerful search box to quickly find local and remote files and content.',
        command: 'nuclide-quick-open:find-anything-via-omni-search'
      },
      priority: 10
    };
  },

  deactivate: function deactivate() {
    if (activation) {
      activation.dispose();
      activation = null;
    }
    if (listeners) {
      listeners.dispose();
      listeners = null;
    }
    getSearchResultManager().dispose();
  }
};
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsMkVBQTJFO0FBQ3hGLGVBQU8sRUFBRSxrREFBa0Q7T0FDNUQ7QUFDRCxjQUFRLEVBQUUsRUFBRTtLQUNiLENBQUM7R0FDSDs7QUFFRCxZQUFVLEVBQUEsc0JBQVM7QUFDakIsUUFBSSxVQUFVLEVBQUU7QUFDZCxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3JCLGdCQUFVLEdBQUcsSUFBSSxDQUFDO0tBQ25CO0FBQ0QsUUFBSSxTQUFTLEVBQUU7QUFDYixlQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDcEIsZUFBUyxHQUFHLElBQUksQ0FBQztLQUNsQjtBQUNELDBCQUFzQixFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDcEM7Q0FDRixDQUFDIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIFByb3ZpZGVyLFxufSBmcm9tICcuLi8uLi9xdWljay1vcGVuLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUge0hvbWVGcmFnbWVudHN9IGZyb20gJy4uLy4uL2hvbWUtaW50ZXJmYWNlcyc7XG5cbmltcG9ydCB7XG4gIFJlYWN0LFxuICBSZWFjdERPTSxcbn0gZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IFF1aWNrU2VsZWN0aW9uQ29tcG9uZW50IGZyb20gJy4vUXVpY2tTZWxlY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBmZWF0dXJlQ29uZmlnIGZyb20gJy4uLy4uL2ZlYXR1cmUtY29uZmlnJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmxldCBkZWJvdW5jZUZ1bmN0aW9uID0gbnVsbDtcbmZ1bmN0aW9uIGRlYm91bmNlKC4uLmFyZ3MpIHtcbiAgY29uc3QgZGVib3VuY2VGdW5jID0gZGVib3VuY2VGdW5jdGlvbiB8fCAoZGVib3VuY2VGdW5jdGlvbiA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKS5kZWJvdW5jZSk7XG4gIHJldHVybiBkZWJvdW5jZUZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG59XG5cbmZ1bmN0aW9uIGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKSB7XG4gIHJldHVybiByZXF1aXJlKCcuL1NlYXJjaFJlc3VsdE1hbmFnZXInKS5kZWZhdWx0LmdldEluc3RhbmNlKCk7XG59XG5cbmNvbnN0IERFRkFVTFRfUFJPVklERVIgPSAnT21uaVNlYXJjaFJlc3VsdFByb3ZpZGVyJztcbmNvbnN0IFRPUEJBUl9BUFBST1hfSEVJR0hUID0gMTAwOyAvLyBBIHJlYXNvbmFibGUgaGV1cmlzdGljIHRoYXQgcHJldmVudHMgdXMgZnJvbSBoYXZpbmcgdG8gbWVhc3VyZS5cbmNvbnN0IE1PREFMX01BUkdJTiA9IDMyO1xuLy8gZG9uJ3QgcHJlLWZpbGwgc2VhcmNoIGlucHV0IGlmIHNlbGVjdGlvbiBpcyBsb25nZXIgdGhhbiB0aGlzXG5jb25zdCBNQVhfU0VMRUNUSU9OX0xFTkdUSCA9IDEwMDA7XG5cbi8qKlxuICogQSBcInNlc3Npb25cIiBmb3IgdGhlIHB1cnBvc2Ugb2YgYW5hbHl0aWNzLiBJdCBleGlzdHMgZnJvbSB0aGUgbW9tZW50IHRoZSBxdWljay1vcGVuIFVJIGJlY29tZXNcbiAqIHZpc2libGUgdW50aWwgaXQgZ2V0cyBjbG9zZWQsIGVpdGhlciB2aWEgZmlsZSBzZWxlY3Rpb24gb3IgY2FuY2VsbGF0aW9uLlxuICovXG5sZXQgYW5hbHl0aWNzU2Vzc2lvbklkID0gbnVsbDtcbmNvbnN0IEFuYWx5dGljc0V2ZW50cyA9IHtcbiAgQ0hBTkdFX1NFTEVDVElPTjogJ3F1aWNrb3Blbi1jaGFuZ2Utc2VsZWN0aW9uJyxcbiAgQ0hBTkdFX1RBQjogICAgICAgJ3F1aWNrb3Blbi1jaGFuZ2UtdGFiJyxcbiAgQ0xPU0VfUEFORUw6ICAgICAgJ3F1aWNrb3Blbi1jbG9zZS1wYW5lbCcsXG4gIE9QRU5fUEFORUw6ICAgICAgICdxdWlja29wZW4tb3Blbi1wYW5lbCcsXG4gIFNFTEVDVF9GSUxFOiAgICAgICdxdWlja29wZW4tc2VsZWN0LWZpbGUnLFxufTtcbmNvbnN0IEFuYWx5dGljc0RlYm91bmNlRGVsYXlzID0ge1xuICBDSEFOR0VfVEFCOiAxMDAsXG4gIENIQU5HRV9TRUxFQ1RJT046IDEwMCxcbn07XG5cbmNvbnN0IHRyYWNrUHJvdmlkZXJDaGFuZ2UgPSBkZWJvdW5jZShwcm92aWRlck5hbWUgPT4ge1xuICBhbmFseXRpY3NTZXNzaW9uSWQgPSBhbmFseXRpY3NTZXNzaW9uSWQgfHwgRGF0ZS5ub3coKS50b1N0cmluZygpO1xuICB0cmFjayhcbiAgICBBbmFseXRpY3NFdmVudHMuQ0hBTkdFX1RBQixcbiAgICB7XG4gICAgICAncXVpY2tvcGVuLXByb3ZpZGVyJzogcHJvdmlkZXJOYW1lLFxuICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkLFxuICAgIH1cbiAgKTtcbn0sIEFuYWx5dGljc0RlYm91bmNlRGVsYXlzLkNIQU5HRV9UQUIpO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2N1cnJlbnRQcm92aWRlcjogT2JqZWN0O1xuICBfcHJldmlvdXNGb2N1czogP0hUTUxFbGVtZW50O1xuICBfcmVhY3REaXY6IEhUTUxFbGVtZW50O1xuICBfc2VhcmNoQ29tcG9uZW50OiBRdWlja1NlbGVjdGlvbkNvbXBvbmVudDtcbiAgX3NlYXJjaFBhbmVsOiBhdG9tJFBhbmVsO1xuICBfc3Vic2NyaXB0aW9uczogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfZGVib3VuY2VkVXBkYXRlTW9kYWxQb3NpdGlvbjogKCkgPT4gdm9pZDtcbiAgX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0OiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fcHJldmlvdXNGb2N1cyA9IG51bGw7XG4gICAgdGhpcy5fbWF4U2Nyb2xsYWJsZUFyZWFIZWlnaHQgPSAxMDAwMDtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9jdXJyZW50UHJvdmlkZXIgPSBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZ2V0UHJvdmlkZXJCeU5hbWUoREVGQVVMVF9QUk9WSURFUik7XG4gICAgY29uc3QgUXVpY2tTZWxlY3Rpb25EaXNwYXRjaGVyID0gcmVxdWlyZSgnLi9RdWlja1NlbGVjdGlvbkRpc3BhdGNoZXInKTtcbiAgICBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKS5yZWdpc3RlcihhY3Rpb24gPT4ge1xuICAgICAgaWYgKGFjdGlvbi5hY3Rpb25UeXBlID09PSBRdWlja1NlbGVjdGlvbkRpc3BhdGNoZXIuQWN0aW9uVHlwZS5BQ1RJVkVfUFJPVklERVJfQ0hBTkdFRCkge1xuICAgICAgICB0aGlzLnRvZ2dsZVByb3ZpZGVyKGFjdGlvbi5wcm92aWRlck5hbWUpO1xuICAgICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9yZWFjdERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX3NlYXJjaFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogdGhpcy5fcmVhY3REaXYsIHZpc2libGU6IGZhbHNlfSk7XG4gICAgdGhpcy5fZGVib3VuY2VkVXBkYXRlTW9kYWxQb3NpdGlvbiA9IGRlYm91bmNlKHRoaXMuX3VwZGF0ZVNjcm9sbGFibGVIZWlnaHQuYmluZCh0aGlzKSwgMjAwKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5fZGVib3VuY2VkVXBkYXRlTW9kYWxQb3NpdGlvbik7XG4gICAgdGhpcy5fY3VzdG9taXplTW9kYWxFbGVtZW50KCk7XG4gICAgdGhpcy5fdXBkYXRlU2Nyb2xsYWJsZUhlaWdodCgpO1xuXG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50ID0gdGhpcy5fcmVuZGVyKCk7XG5cbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQub25TZWxlY3Rpb24oc2VsZWN0aW9uID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbnMgPSB7fTtcbiAgICAgIGlmIChzZWxlY3Rpb24ubGluZSkge1xuICAgICAgICBvcHRpb25zLmluaXRpYWxMaW5lID0gc2VsZWN0aW9uLmxpbmU7XG4gICAgICB9XG4gICAgICBpZiAoc2VsZWN0aW9uLmNvbHVtbikge1xuICAgICAgICBvcHRpb25zLmluaXRpYWxDb2x1bW4gPSBzZWxlY3Rpb24uY29sdW1uO1xuICAgICAgfVxuXG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHNlbGVjdGlvbi5wYXRoLCBvcHRpb25zKS50aGVuKHRleHRFZGl0b3IgPT4ge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0Vmlldyh0ZXh0RWRpdG9yKSwgJ3RhYnM6a2VlcC1wcmV2aWV3LXRhYicpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IHF1ZXJ5ID0gdGhpcy5fc2VhcmNoQ29tcG9uZW50LmdldElucHV0VGV4dEVkaXRvcigpLnRleHRDb250ZW50O1xuICAgICAgY29uc3QgcHJvdmlkZXJOYW1lID0gdGhpcy5fY3VycmVudFByb3ZpZGVyLm5hbWU7XG4gICAgICAvLyBkZWZhdWx0IHRvIGVtcHR5IHN0cmluZyBiZWNhdXNlIGB0cmFja2AgZW5mb3JjZXMgc3RyaW5nLW9ubHkgdmFsdWVzXG4gICAgICBjb25zdCBzb3VyY2VQcm92aWRlciA9IHNlbGVjdGlvbi5zb3VyY2VQcm92aWRlciB8fCAnJztcbiAgICAgIHRyYWNrKFxuICAgICAgICBBbmFseXRpY3NFdmVudHMuU0VMRUNUX0ZJTEUsXG4gICAgICAgIHtcbiAgICAgICAgICAncXVpY2tvcGVuLWZpbGVwYXRoJzogc2VsZWN0aW9uLnBhdGgsXG4gICAgICAgICAgJ3F1aWNrb3Blbi1xdWVyeSc6IHF1ZXJ5LFxuICAgICAgICAgICdxdWlja29wZW4tcHJvdmlkZXInOiBwcm92aWRlck5hbWUsIC8vIFRoZSBjdXJyZW50bHkgb3BlbiBcInRhYlwiLlxuICAgICAgICAgICdxdWlja29wZW4tc2Vzc2lvbic6IGFuYWx5dGljc1Nlc3Npb25JZCB8fCAnJyxcbiAgICAgICAgICAvLyBCZWNhdXNlIHRoZSBgcHJvdmlkZXJgIGlzIHVzdWFsbHkgT21uaVNlYXJjaCwgYWxzbyB0cmFjayB0aGUgb3JpZ2luYWwgcHJvdmlkZXIuXG4gICAgICAgICAgJ3F1aWNrb3Blbi1wcm92aWRlci1zb3VyY2UnOiBzb3VyY2VQcm92aWRlcixcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIHRoaXMuY2xvc2VTZWFyY2hQYW5lbCgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYm9keScsICdjb3JlOmNhbmNlbCcsICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlYXJjaFBhbmVsICYmIHRoaXMuX3NlYXJjaFBhbmVsLmlzVmlzaWJsZSgpKSB7XG4gICAgICAgICAgdGhpcy5jbG9zZVNlYXJjaFBhbmVsKCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5vbkNhbmNlbGxhdGlvbigoKSA9PiB0aGlzLmNsb3NlU2VhcmNoUGFuZWwoKSk7XG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50Lm9uU2VsZWN0aW9uQ2hhbmdlZChkZWJvdW5jZSgoc2VsZWN0aW9uOiBhbnkpID0+IHtcbiAgICAgIC8vIE9ubHkgdHJhY2sgdXNlci1pbml0aWF0ZWQgc2VsZWN0aW9uLWNoYW5nZSBldmVudHMuXG4gICAgICBpZiAoYW5hbHl0aWNzU2Vzc2lvbklkICE9IG51bGwpIHtcbiAgICAgICAgdHJhY2soXG4gICAgICAgICAgQW5hbHl0aWNzRXZlbnRzLkNIQU5HRV9TRUxFQ1RJT04sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ3F1aWNrb3Blbi1zZWxlY3RlZC1pbmRleCc6IHNlbGVjdGlvbi5zZWxlY3RlZEl0ZW1JbmRleC50b1N0cmluZygpLFxuICAgICAgICAgICAgJ3F1aWNrb3Blbi1zZWxlY3RlZC1zZXJ2aWNlJzogc2VsZWN0aW9uLnNlbGVjdGVkU2VydmljZSxcbiAgICAgICAgICAgICdxdWlja29wZW4tc2VsZWN0ZWQtZGlyZWN0b3J5Jzogc2VsZWN0aW9uLnNlbGVjdGVkRGlyZWN0b3J5LFxuICAgICAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkLFxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LCBBbmFseXRpY3NEZWJvdW5jZURlbGF5cy5DSEFOR0VfU0VMRUNUSU9OKSk7XG4gIH1cblxuICAvLyBDdXN0b21pemUgdGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgbW9kYWwuXG4gIF9jdXN0b21pemVNb2RhbEVsZW1lbnQoKSB7XG4gICAgY29uc3QgbW9kYWxFbGVtZW50ID0gKCh0aGlzLl9zZWFyY2hQYW5lbC5nZXRJdGVtKCkucGFyZW50Tm9kZTogYW55KTogSFRNTEVsZW1lbnQpO1xuICAgIG1vZGFsRWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnbWFyZ2luLWxlZnQnLCAnMCcpO1xuICAgIG1vZGFsRWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnd2lkdGgnLCAnYXV0bycpO1xuICAgIG1vZGFsRWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgnbGVmdCcsIE1PREFMX01BUkdJTiArICdweCcpO1xuICAgIG1vZGFsRWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSgncmlnaHQnLCBNT0RBTF9NQVJHSU4gKyAncHgnKTtcbiAgfVxuXG4gIF91cGRhdGVTY3JvbGxhYmxlSGVpZ2h0KCkge1xuICAgIGNvbnN0IHtoZWlnaHR9ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHRoaXMuX21heFNjcm9sbGFibGVBcmVhSGVpZ2h0ID0gaGVpZ2h0IC0gTU9EQUxfTUFSR0lOIC0gVE9QQkFSX0FQUFJPWF9IRUlHSFQ7XG4gICAgLy8gRm9yY2UgYSByZS1yZW5kZXIgdG8gdXBkYXRlIF9tYXhTY3JvbGxhYmxlQXJlYUhlaWdodC5cbiAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQgPSB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgcmV0dXJuIFJlYWN0RE9NLnJlbmRlcihcbiAgICAgIDxRdWlja1NlbGVjdGlvbkNvbXBvbmVudFxuICAgICAgICBhY3RpdmVQcm92aWRlcj17dGhpcy5fY3VycmVudFByb3ZpZGVyfVxuICAgICAgICBvblByb3ZpZGVyQ2hhbmdlPXt0aGlzLmhhbmRsZUFjdGl2ZVByb3ZpZGVyQ2hhbmdlLmJpbmQodGhpcyl9XG4gICAgICAgIG1heFNjcm9sbGFibGVBcmVhSGVpZ2h0PXt0aGlzLl9tYXhTY3JvbGxhYmxlQXJlYUhlaWdodH1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fcmVhY3REaXZcbiAgICApO1xuICB9XG5cbiAgaGFuZGxlQWN0aXZlUHJvdmlkZXJDaGFuZ2UobmV3UHJvdmlkZXJOYW1lOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0cmFja1Byb3ZpZGVyQ2hhbmdlKG5ld1Byb3ZpZGVyTmFtZSk7XG4gICAgdGhpcy5fY3VycmVudFByb3ZpZGVyID0gZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpLmdldFByb3ZpZGVyQnlOYW1lKG5ld1Byb3ZpZGVyTmFtZSk7XG4gICAgdGhpcy5fc2VhcmNoQ29tcG9uZW50ID0gdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICB0b2dnbGVPbW5pU2VhcmNoUHJvdmlkZXIoKTogdm9pZCB7XG4gICAgcmVxdWlyZSgnLi9RdWlja1NlbGVjdGlvbkFjdGlvbnMnKS5jaGFuZ2VBY3RpdmVQcm92aWRlcignT21uaVNlYXJjaFJlc3VsdFByb3ZpZGVyJyk7XG4gIH1cblxuICB0b2dnbGVQcm92aWRlcihwcm92aWRlck5hbWU6IHN0cmluZykge1xuICAgIGFuYWx5dGljc1Nlc3Npb25JZCA9IGFuYWx5dGljc1Nlc3Npb25JZCB8fCBEYXRlLm5vdygpLnRvU3RyaW5nKCk7XG4gICAgdHJhY2soXG4gICAgICBBbmFseXRpY3NFdmVudHMuQ0hBTkdFX1RBQixcbiAgICAgIHtcbiAgICAgICAgJ3F1aWNrb3Blbi1wcm92aWRlcic6IHByb3ZpZGVyTmFtZSxcbiAgICAgICAgJ3F1aWNrb3Blbi1zZXNzaW9uJzogYW5hbHl0aWNzU2Vzc2lvbklkLFxuICAgICAgfVxuICAgICk7XG4gICAgY29uc3QgcHJvdmlkZXIgPSBnZXRTZWFyY2hSZXN1bHRNYW5hZ2VyKCkuZ2V0UHJvdmlkZXJCeU5hbWUocHJvdmlkZXJOYW1lKTtcbiAgICAvLyBcInRvZ2dsZVwiIGJlaGF2aW9yXG4gICAgaWYgKFxuICAgICAgdGhpcy5fc2VhcmNoUGFuZWwgIT09IG51bGwgJiZcbiAgICAgIHRoaXMuX3NlYXJjaFBhbmVsLmlzVmlzaWJsZSgpICYmXG4gICAgICBwcm92aWRlck5hbWUgPT09IHRoaXMuX2N1cnJlbnRQcm92aWRlci5uYW1lXG4gICAgKSB7XG4gICAgICB0aGlzLmNsb3NlU2VhcmNoUGFuZWwoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9jdXJyZW50UHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICBpZiAodGhpcy5fc2VhcmNoQ29tcG9uZW50KSB7XG4gICAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQgPSB0aGlzLl9yZW5kZXIoKTtcbiAgICB9XG4gICAgdGhpcy5zaG93U2VhcmNoUGFuZWwoKTtcbiAgfVxuXG4gIHNob3dTZWFyY2hQYW5lbCgpIHtcbiAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICBpZiAodGhpcy5fc2VhcmNoQ29tcG9uZW50ICYmIHRoaXMuX3NlYXJjaFBhbmVsKSB7XG4gICAgICAvLyBTdGFydCBhIG5ldyBzZWFyY2ggXCJzZXNzaW9uXCIgZm9yIGFuYWx5dGljcyBwdXJwb3Nlcy5cbiAgICAgIHRyYWNrKFxuICAgICAgICBBbmFseXRpY3NFdmVudHMuT1BFTl9QQU5FTCxcbiAgICAgICAge1xuICAgICAgICAgICdxdWlja29wZW4tc2Vzc2lvbic6IGFuYWx5dGljc1Nlc3Npb25JZCB8fCAnJyxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICAgIC8vIHNob3dTZWFyY2hQYW5lbCBnZXRzIGNhbGxlZCB3aGVuIGNoYW5naW5nIHByb3ZpZGVycyBldmVuIGlmIGl0J3MgYWxyZWFkeSBzaG93bi5cbiAgICAgIGNvbnN0IGlzQWxyZWFkeVZpc2libGUgPSB0aGlzLl9zZWFyY2hQYW5lbC5pc1Zpc2libGUoKTtcbiAgICAgIHRoaXMuX3NlYXJjaFBhbmVsLnNob3coKTtcbiAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5mb2N1cygpO1xuICAgICAgaWYgKGZlYXR1cmVDb25maWcuZ2V0KCdudWNsaWRlLXF1aWNrLW9wZW4udXNlU2VsZWN0aW9uJykgJiYgIWlzQWxyZWFkeVZpc2libGUpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gdGhpcy5fZ2V0Rmlyc3RTZWxlY3Rpb25UZXh0KCk7XG4gICAgICAgIGlmIChzZWxlY3RlZFRleHQgJiYgc2VsZWN0ZWRUZXh0Lmxlbmd0aCA8PSBNQVhfU0VMRUNUSU9OX0xFTkdUSCkge1xuICAgICAgICAgIHRoaXMuX3NlYXJjaENvbXBvbmVudC5zZXRJbnB1dFZhbHVlKHNlbGVjdGVkVGV4dC5zcGxpdCgnXFxuJylbMF0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQuc2VsZWN0SW5wdXQoKTtcbiAgICB9XG4gIH1cblxuICBjbG9zZVNlYXJjaFBhbmVsKCkge1xuICAgIGlmICh0aGlzLl9zZWFyY2hDb21wb25lbnQgJiYgdGhpcy5fc2VhcmNoUGFuZWwpIHtcbiAgICAgIHRyYWNrKFxuICAgICAgICBBbmFseXRpY3NFdmVudHMuQ0xPU0VfUEFORUwsXG4gICAgICAgIHtcbiAgICAgICAgICAncXVpY2tvcGVuLXNlc3Npb24nOiBhbmFseXRpY3NTZXNzaW9uSWQgfHwgJycsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgICB0aGlzLl9zZWFyY2hQYW5lbC5oaWRlKCk7XG4gICAgICB0aGlzLl9zZWFyY2hDb21wb25lbnQuYmx1cigpO1xuICAgICAgYW5hbHl0aWNzU2Vzc2lvbklkID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcHJldmlvdXNGb2N1cyAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9wcmV2aW91c0ZvY3VzLmZvY3VzKCk7XG4gICAgICB0aGlzLl9wcmV2aW91c0ZvY3VzID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfZ2V0Rmlyc3RTZWxlY3Rpb25UZXh0KCk6ID9zdHJpbmcge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoZWRpdG9yKSB7XG4gICAgICByZXR1cm4gZWRpdG9yLmdldFNlbGVjdGlvbnMoKVswXS5nZXRUZXh0KCk7XG4gICAgfVxuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5sZXQgYWN0aXZhdGlvbjogP0FjdGl2YXRpb24gPSBudWxsO1xuZnVuY3Rpb24gZ2V0QWN0aXZhdGlvbigpOiBBY3RpdmF0aW9uIHtcbiAgaWYgKGFjdGl2YXRpb24gPT0gbnVsbCkge1xuICAgIGFjdGl2YXRpb24gPSBuZXcgQWN0aXZhdGlvbigpO1xuICB9XG4gIHJldHVybiBhY3RpdmF0aW9uO1xufVxuXG5sZXQgbGlzdGVuZXJzOiA/Q29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGw7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBsaXN0ZW5lcnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIGxpc3RlbmVycy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLXF1aWNrLW9wZW46ZmluZC1hbnl0aGluZy12aWEtb21uaS1zZWFyY2gnOiAoKSA9PiB7XG4gICAgICAgICAgZ2V0QWN0aXZhdGlvbigpLnRvZ2dsZU9tbmlTZWFyY2hQcm92aWRlcigpO1xuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgKTtcbiAgICBnZXRBY3RpdmF0aW9uKCk7XG4gIH0sXG5cbiAgcmVnaXN0ZXJQcm92aWRlcihzZXJ2aWNlOiBQcm92aWRlciApOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKS5yZWdpc3RlclByb3ZpZGVyKHNlcnZpY2UpO1xuICB9LFxuXG4gIHJlZ2lzdGVyU3RvcmUoKSB7XG4gICAgcmV0dXJuIGdldFNlYXJjaFJlc3VsdE1hbmFnZXIoKTtcbiAgfSxcblxuICBnZXRIb21lRnJhZ21lbnRzKCk6IEhvbWVGcmFnbWVudHMge1xuICAgIHJldHVybiB7XG4gICAgICBmZWF0dXJlOiB7XG4gICAgICAgIHRpdGxlOiAnUXVpY2sgT3BlbicsXG4gICAgICAgIGljb246ICdzZWFyY2gnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0EgcG93ZXJmdWwgc2VhcmNoIGJveCB0byBxdWlja2x5IGZpbmQgbG9jYWwgYW5kIHJlbW90ZSBmaWxlcyBhbmQgY29udGVudC4nLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1xdWljay1vcGVuOmZpbmQtYW55dGhpbmctdmlhLW9tbmktc2VhcmNoJyxcbiAgICAgIH0sXG4gICAgICBwcmlvcml0eTogMTAsXG4gICAgfTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmIChhY3RpdmF0aW9uKSB7XG4gICAgICBhY3RpdmF0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIGFjdGl2YXRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAobGlzdGVuZXJzKSB7XG4gICAgICBsaXN0ZW5lcnMuZGlzcG9zZSgpO1xuICAgICAgbGlzdGVuZXJzID0gbnVsbDtcbiAgICB9XG4gICAgZ2V0U2VhcmNoUmVzdWx0TWFuYWdlcigpLmRpc3Bvc2UoKTtcbiAgfSxcbn07XG4iXX0=