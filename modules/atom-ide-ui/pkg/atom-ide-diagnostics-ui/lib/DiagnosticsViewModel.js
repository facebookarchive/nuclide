'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DiagnosticsViewModel = exports.WORKSPACE_VIEW_URI = undefined;

var _dockForLocation;

function _load_dockForLocation() {
  return _dockForLocation = _interopRequireDefault(require('nuclide-commons-atom/dock-for-location'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _memoizeUntilChanged;

function _load_memoizeUntilChanged() {
  return _memoizeUntilChanged = _interopRequireDefault(require('nuclide-commons/memoizeUntilChanged'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _observePaneItemVisibility;

function _load_observePaneItemVisibility() {
  return _observePaneItemVisibility = _interopRequireDefault(require('nuclide-commons-atom/observePaneItemVisibility'));
}

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireDefault(require('react'));

var _analytics;

function _load_analytics() {
  return _analytics = _interopRequireDefault(require('nuclide-commons-atom/analytics'));
}

var _Model;

function _load_Model() {
  return _Model = _interopRequireDefault(require('nuclide-commons/Model'));
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('nuclide-commons-ui/renderReactRoot');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _RegExpFilter;

function _load_RegExpFilter() {
  return _RegExpFilter = require('nuclide-commons-ui/RegExpFilter');
}

var _GroupUtils;

function _load_GroupUtils() {
  return _GroupUtils = _interopRequireWildcard(require('./GroupUtils'));
}

var _DiagnosticsView;

function _load_DiagnosticsView() {
  return _DiagnosticsView = _interopRequireDefault(require('./ui/DiagnosticsView'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

const WORKSPACE_VIEW_URI = exports.WORKSPACE_VIEW_URI = 'atom://nuclide/diagnostics';

class DiagnosticsViewModel {

  constructor(globalStates) {
    _initialiseProps.call(this);

    // Memoize `_filterDiagnostics()`
    this._filterDiagnostics = (0, (_memoizeUntilChanged || _load_memoizeUntilChanged()).default)(this._filterDiagnostics, (diagnostics, pattern, hiddenGroups) => ({
      diagnostics,
      pattern,
      hiddenGroups
    }), (a, b) => patternsAreEqual(a.pattern, b.pattern) && (0, (_collection || _load_collection()).areSetsEqual)(a.hiddenGroups, b.hiddenGroups) && (0, (_collection || _load_collection()).arrayEqual)(a.diagnostics, b.diagnostics));

    const { pattern, invalid } = (0, (_RegExpFilter || _load_RegExpFilter()).getFilterPattern)('', false);
    this._model = new (_Model || _load_Model()).default({
      // TODO: Get this from constructor/serialization.
      hiddenGroups: new Set(),
      textFilter: { text: '', isRegExp: false, pattern, invalid },
      selectedMessage: null
    });
    const visibility = (0, (_observePaneItemVisibility || _load_observePaneItemVisibility()).default)(this).distinctUntilChanged();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(visibility.let((0, (_observable || _load_observable()).fastDebounce)(1000)).distinctUntilChanged().filter(Boolean).subscribe(() => {
      (_analytics || _load_analytics()).default.track('diagnostics-show-table');
    }));

    // Combine the state that's shared between instances, the state that's unique to this instance,
    // and unchanging callbacks, to get the props for our component.
    const props = _rxjsBundlesRxMinJs.Observable.combineLatest(globalStates, this._model.toObservable(), visibility, (globalState, instanceState, isVisible) => Object.assign({}, globalState, instanceState, {
      isVisible,
      diagnostics: this._filterDiagnostics(globalState.diagnostics, instanceState.textFilter.pattern, instanceState.hiddenGroups),
      onTypeFilterChange: this._handleTypeFilterChange,
      onTextFilterChange: this._handleTextFilterChange,
      selectMessage: this._selectMessage,
      gotoMessageLocation: goToDiagnosticLocation,
      supportedMessageKinds: globalState.supportedMessageKinds
    }));

    this._props = this._trackVisibility(props);
  }

  // If autoVisibility setting is on, then automatically show/hide on changes.
  // Otherwise mute the props stream to prevent unnecessary updates.
  _trackVisibility(props) {
    let lastDiagnostics = [];
    return props.do(newProps => {
      if (newProps.autoVisibility && !(0, (_collection || _load_collection()).arrayEqual)(newProps.diagnostics, lastDiagnostics, (a, b) => a.text === b.text)) {
        const pane = atom.workspace.paneForItem(this);
        if (newProps.diagnostics.length > 0 && !newProps.isVisible) {
          // We want to call workspace.open but it has no option to
          // show the new pane without activating it.
          // So instead we find the dock for the pane and show() it directly.
          // https://github.com/atom/atom/issues/16007
          if (pane != null) {
            pane.activateItem(this);
            const dock = (0, (_dockForLocation || _load_dockForLocation()).default)(pane.getContainer().getLocation());
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
    const { hiddenGroups } = this._model.state;
    return {
      deserializer: 'atom-ide-ui.DiagnosticsViewModel',
      state: {
        hiddenGroups: [...hiddenGroups]
      }
    };
  }

  getElement() {
    if (this._element == null) {
      const Component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(this._props, (_DiagnosticsView || _load_DiagnosticsView()).default);
      const element = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.default.createElement(Component, null));
      element.classList.add('diagnostics-ui');
      this._element = element;
    }
    return this._element;
  }

  /**
   * Toggle the filter.
   */


  _filterDiagnostics(diagnostics, pattern, hiddenGroups) {
    return diagnostics.filter(message => {
      if (hiddenGroups.has((_GroupUtils || _load_GroupUtils()).getGroup(message))) {
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
    const { hiddenGroups } = this._model.state;
    const hidden = hiddenGroups.has(type);
    const nextHiddenTypes = new Set(hiddenGroups);
    if (hidden) {
      nextHiddenTypes.delete(type);
    } else {
      nextHiddenTypes.add(type);
    }
    this._model.setState({ hiddenGroups: nextHiddenTypes });
  };

  this._handleTextFilterChange = value => {
    const { text, isRegExp } = value;
    // TODO: Fuzzy if !isRegExp?
    const { invalid, pattern } = (0, (_RegExpFilter || _load_RegExpFilter()).getFilterPattern)(text, isRegExp);
    this._model.setState({
      textFilter: { text, isRegExp, invalid, pattern }
    });
  };

  this._selectMessage = message => {
    this._model.setState({ selectedMessage: message });
  };
};

function goToDiagnosticLocation(message, options) {
  // TODO: what should we do for project-path diagnostics?
  if ((_nuclideUri || _load_nuclideUri()).default.endsWithSeparator(message.filePath)) {
    return;
  }

  (_analytics || _load_analytics()).default.track('diagnostics-panel-goto-location');

  const uri = message.filePath;
  // If initialLine is N, Atom will navigate to line N+1.
  // Flow sometimes reports a row of -1, so this ensures the line is at least one.
  const line = Math.max(message.range ? message.range.start.row : 0, 0);
  const column = 0;
  (0, (_goToLocation || _load_goToLocation()).goToLocation)(uri, {
    line,
    column,
    activatePane: options.focusEditor,
    pending: true
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