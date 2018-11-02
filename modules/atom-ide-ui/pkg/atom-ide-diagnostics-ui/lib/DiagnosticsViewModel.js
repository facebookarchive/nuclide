"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsViewModel = exports.WORKSPACE_VIEW_URI = void 0;

function _dockForLocation() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/dock-for-location"));

  _dockForLocation = function () {
    return data;
  };

  return data;
}

function _goToLocation() {
  const data = require("../../../../nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _memoizeUntilChanged() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/memoizeUntilChanged"));

  _memoizeUntilChanged = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _observePaneItemVisibility() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/observePaneItemVisibility"));

  _observePaneItemVisibility = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../../nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _react = _interopRequireDefault(require("react"));

function _analytics() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/analytics"));

  _analytics = function () {
    return data;
  };

  return data;
}

function _Model() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/Model"));

  _Model = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../../nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _bindObservableAsProps() {
  const data = require("../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _RegExpFilter() {
  const data = require("../../../../nuclide-commons-ui/RegExpFilter");

  _RegExpFilter = function () {
    return data;
  };

  return data;
}

function GroupUtils() {
  const data = _interopRequireWildcard(require("./GroupUtils"));

  GroupUtils = function () {
    return data;
  };

  return data;
}

function _DiagnosticsView() {
  const data = _interopRequireDefault(require("./ui/DiagnosticsView"));

  _DiagnosticsView = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

const WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics';
exports.WORKSPACE_VIEW_URI = WORKSPACE_VIEW_URI;

class DiagnosticsViewModel {
  constructor(globalStates) {
    _initialiseProps.call(this);

    // Memoize `_filterDiagnostics()`
    this._filterDiagnostics = (0, _memoizeUntilChanged().default)(this._filterDiagnostics, (diagnostics, pattern, hiddenGroups, filterByActiveTextEditor, filterPath) => ({
      diagnostics,
      pattern,
      hiddenGroups,
      filterByActiveTextEditor,
      filterPath
    }), (a, b) => patternsAreEqual(a.pattern, b.pattern) && (0, _collection().areSetsEqual)(a.hiddenGroups, b.hiddenGroups) && (0, _collection().arrayEqual)(a.diagnostics, b.diagnostics) && a.filterByActiveTextEditor === b.filterByActiveTextEditor && a.filterPath === b.filterPath);
    const {
      pattern,
      invalid
    } = (0, _RegExpFilter().getFilterPattern)('', false);
    this._model = new (_Model().default)({
      // TODO: Get this from constructor/serialization.
      hiddenGroups: new Set(),
      textFilter: {
        text: '',
        isRegExp: false,
        pattern,
        invalid
      },
      selectedMessage: null
    });
    const visibility = (0, _observePaneItemVisibility().default)(this).distinctUntilChanged();
    this._disposables = new (_UniversalDisposable().default)(visibility.let((0, _observable().fastDebounce)(1000)).distinctUntilChanged().filter(Boolean).subscribe(() => {
      _analytics().default.track('diagnostics-show-table');
    }), atom.commands.add('.diagnostics-ui-table-container', 'diagnostics:copy', () => {
      if (window.getSelection().toString() === '') {
        // if there is a selectedMessage and no selected text, copy
        // selectedMessage.text to the clipboard
        const currentMessageText = this._model.state.selectedMessage ? this._model.state.selectedMessage.text : null;

        if (currentMessageText != null) {
          atom.clipboard.write(currentMessageText);
        }
      } else {
        document.execCommand('copy');
      }
    }), atom.contextMenu.add({
      '.diagnostics-ui-table-container .nuclide-ui-table-row-selected': [{
        command: 'diagnostics:copy',
        label: 'Copy',

        shouldDisplay() {
          return window.getSelection().toString() !== '';
        }

      }]
    })); // Combine the state that's shared between instances, the state that's unique to this instance,
    // and unchanging callbacks, to get the props for our component.

    const props = _rxjsCompatUmdMin.Observable.combineLatest(globalStates, this._model.toObservable(), visibility, (globalState, instanceState, isVisible) => {
      const {
        pathToActiveTextEditor
      } = globalState,
            globalStateWithoutPathToActiveTextEditor = _objectWithoutProperties(globalState, ["pathToActiveTextEditor"]);

      return Object.assign({}, globalStateWithoutPathToActiveTextEditor, instanceState, {
        isVisible,
        diagnostics: this._filterDiagnostics(globalState.diagnostics, instanceState.textFilter.pattern, instanceState.hiddenGroups, globalState.filterByActiveTextEditor, pathToActiveTextEditor),
        onTypeFilterChange: this._handleTypeFilterChange,
        onTextFilterChange: this._handleTextFilterChange,
        selectMessage: this._selectMessage,
        gotoMessageLocation: goToDiagnosticLocation,
        supportedMessageKinds: globalState.supportedMessageKinds
      });
    });

    this._props = this._trackVisibility(props);
  } // If autoVisibility setting is on, then automatically show/hide on changes.


  _trackVisibility(props) {
    let lastDiagnostics = [];
    return props.do(newProps => {
      if (newProps.autoVisibility && !(0, _collection().arrayEqual)(newProps.diagnostics, lastDiagnostics, (a, b) => a.text === b.text)) {
        const pane = atom.workspace.paneForItem(this);

        if (newProps.diagnostics.length > 0 && !newProps.isVisible) {
          // We want to call workspace.open but it has no option to
          // show the new pane without activating it.
          // So instead we find the dock for the pane and show() it directly.
          // https://github.com/atom/atom/issues/16007
          if (pane != null) {
            pane.activateItem(this);
            const dock = (0, _dockForLocation().default)(pane.getContainer().getLocation());

            if (dock != null) {
              dock.show();
            }
          }
        } else if (newProps.diagnostics.length === 0 && newProps.isVisible) {
          // Only hide the diagnostics if it's the only item in its pane.
          if (pane != null) {
            const items = pane.getItems();

            if (items.length === 1 && items[0] instanceof DiagnosticsViewModel) {
              atom.workspace.hide(this);
            }
          }
        }

        lastDiagnostics = newProps.diagnostics;
      }
    });
  }

  destroy() {
    this._disposables.dispose();
  }

  getTitle() {
    return 'Diagnostics';
  }

  getIconName() {
    return 'law';
  }

  getURI() {
    return WORKSPACE_VIEW_URI;
  }

  getDefaultLocation() {
    return 'bottom';
  }

  serialize() {
    const {
      hiddenGroups
    } = this._model.state;
    return {
      deserializer: 'atom-ide-ui.DiagnosticsViewModel',
      state: {
        hiddenGroups: [...hiddenGroups]
      }
    };
  }

  getElement() {
    if (this._element == null) {
      const Component = (0, _bindObservableAsProps().bindObservableAsProps)(this._props, _DiagnosticsView().default);
      const element = (0, _renderReactRoot().renderReactRoot)(_react.default.createElement(Component, null), 'DiagnosticsRoot');
      element.classList.add('diagnostics-ui');
      this._element = element;
    }

    return this._element;
  }
  /**
   * Toggle the filter.
   */


  _filterDiagnostics(diagnostics, pattern, hiddenGroups, filterByActiveTextEditor, filterByPath) {
    return diagnostics.filter(message => {
      if (hiddenGroups.has(GroupUtils().getGroup(message))) {
        return false;
      }

      if (filterByActiveTextEditor && message.filePath !== filterByPath) {
        return false;
      }

      if (pattern == null) {
        return true;
      }

      return message.text != null && pattern.test(message.text) || message.html != null && pattern.test(message.html) || pattern.test(message.providerName) || pattern.test(message.filePath);
    });
  }

}

exports.DiagnosticsViewModel = DiagnosticsViewModel;

var _initialiseProps = function () {
  this._handleTypeFilterChange = type => {
    const {
      hiddenGroups
    } = this._model.state;
    const hidden = hiddenGroups.has(type);
    const nextHiddenTypes = new Set(hiddenGroups);

    if (hidden) {
      nextHiddenTypes.delete(type);
    } else {
      nextHiddenTypes.add(type);
    }

    this._model.setState({
      hiddenGroups: nextHiddenTypes
    });

    _analytics().default.track('diagnostics-panel-change-filter');
  };

  this._handleTextFilterChange = value => {
    const {
      text,
      isRegExp
    } = value; // TODO: Fuzzy if !isRegExp?

    const {
      invalid,
      pattern
    } = (0, _RegExpFilter().getFilterPattern)(text, isRegExp);

    this._model.setState({
      textFilter: {
        text,
        isRegExp,
        invalid,
        pattern
      }
    });

    _analytics().default.track('diagnostics-panel-change-filter');
  };

  this._selectMessage = message => {
    this._model.setState({
      selectedMessage: message
    });
  };
};

function goToDiagnosticLocation(message, options) {
  // TODO: what should we do for project-path diagnostics?
  if (_nuclideUri().default.endsWithSeparator(message.filePath)) {
    return;
  }

  _analytics().default.track('diagnostics-panel-goto-location');

  const uri = message.filePath; // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.

  const line = Math.max(message.range ? message.range.start.row : 0, 0);
  const column = 0;
  (0, _goToLocation().goToLocation)(uri, {
    line,
    column,
    activatePane: options.focusEditor,
    pending: options.pendingPane
  });
}

function patternsAreEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a == null && b == null) {
    return true;
  }

  if (a == null || b == null) {
    return false;
  }

  return a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.ignoreCase === b.ignoreCase;
}