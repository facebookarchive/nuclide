'use strict';

var _atom = require('atom');

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('nuclide-commons-atom/destroyItemWhere');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _HealthPaneItem;

function _load_HealthPaneItem() {
  return _HealthPaneItem = _interopRequireDefault(require('./HealthPaneItem'));
}

var _HealthPaneItem2;

function _load_HealthPaneItem2() {
  return _HealthPaneItem2 = require('./HealthPaneItem');
}

var _getChildProcessesTree;

function _load_getChildProcessesTree() {
  return _getChildProcessesTree = _interopRequireDefault(require('./getChildProcessesTree'));
}

var _getStats;

function _load_getStats() {
  return _getStats = _interopRequireDefault(require('./getStats'));
}

var _trackStalls;

function _load_trackStalls() {
  return _trackStalls = _interopRequireDefault(require('./trackStalls'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Imports from within this Nuclide package.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor(state) {
    this._updateToolbarJewel = this._updateToolbarJewel.bind(this);
    this._updateAnalytics = this._updateAnalytics.bind(this);

    // Observe all of the settings.
    const configs = (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-health');
    const viewTimeouts = configs.map(config => config.viewTimeout * 1000).distinctUntilChanged();
    const analyticsTimeouts = configs.map(config => config.analyticsTimeout * 60 * 1000).distinctUntilChanged();
    const toolbarJewels = configs.map(config => config.toolbarJewel || '').distinctUntilChanged();

    // Update the stats immediately, and then periodically based on the config.
    const statsStream = _rxjsBundlesRxMinJs.Observable.of(null).concat(viewTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval)).map((_getStats || _load_getStats()).default).share();

    const childProcessesTreeStream = _rxjsBundlesRxMinJs.Observable.of(null).concat(viewTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval)).switchMap((_getChildProcessesTree || _load_getChildProcessesTree()).default).share();

    const packageStates = (0, (_observable || _load_observable()).cacheWhileSubscribed)(statsStream.withLatestFrom(toolbarJewels).map(([stats, toolbarJewel]) => ({ stats, toolbarJewel })).share());

    const updateToolbarJewel = value => {
      (_featureConfig || _load_featureConfig()).default.set('nuclide-health.toolbarJewel', value);
    };
    this._paneItemStates = _rxjsBundlesRxMinJs.Observable.combineLatest(packageStates, _rxjsBundlesRxMinJs.Observable.of(null).concat(childProcessesTreeStream), (packageState, childProcessesTree) => Object.assign({}, packageState, {
      childProcessesTree,
      updateToolbarJewel
    }));

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(
    // Keep the toolbar jewel up-to-date.
    packageStates.map(formatToolbarJewelLabel).subscribe(this._updateToolbarJewel),
    // Buffer the stats and send analytics periodically.
    statsStream.buffer(analyticsTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval)).subscribe(this._updateAnalytics), (0, (_trackStalls || _load_trackStalls()).default)(), this._registerCommandAndOpener());
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-health');
    this._healthButton = toolBar.addButton({
      icon: 'dashboard',
      callback: 'nuclide-health:toggle',
      tooltip: 'Toggle Nuclide health stats',
      priority: -400
    }).element;
    this._healthButton.classList.add('nuclide-health-jewel');
    const disposable = new _atom.Disposable(() => {
      this._healthButton = null;
      toolBar.removeItems();
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  _registerCommandAndOpener() {
    if (!this._paneItemStates) {
      throw new Error('Invariant violation: "this._paneItemStates"');
    }

    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_HealthPaneItem2 || _load_HealthPaneItem2()).WORKSPACE_VIEW_URI) {
        if (!(this._paneItemStates != null)) {
          throw new Error('Invariant violation: "this._paneItemStates != null"');
        }

        return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_HealthPaneItem || _load_HealthPaneItem()).default, { stateStream: this._paneItemStates }));
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_HealthPaneItem || _load_HealthPaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-health:toggle', () => {
      atom.workspace.toggle((_HealthPaneItem2 || _load_HealthPaneItem2()).WORKSPACE_VIEW_URI);
    }));
  }

  _updateToolbarJewel(label) {
    const healthButton = this._healthButton;
    if (healthButton != null) {
      healthButton.classList.toggle('updated', healthButton.dataset.jewelValue !== label);
      healthButton.dataset.jewelValue = label;
    }
  }

  _updateAnalytics(analyticsBuffer) {
    if (analyticsBuffer.length === 0) {
      return;
    }

    // Aggregates the buffered stats up by suffixing avg, min, max to their names.
    const aggregateStats = {};

    // All analyticsBuffer entries have the same keys; we use the first entry to know what they
    // are.
    Object.keys(analyticsBuffer[0]).forEach(statsKey => {
      // These values are not to be aggregated or sent.
      if (statsKey === 'activeHandlesByType') {
        return;
      }

      const aggregates = aggregate(analyticsBuffer.map(stats => typeof stats[statsKey] === 'number' ? stats[statsKey] : 0));
      Object.keys(aggregates).forEach(aggregatesKey => {
        const value = aggregates[aggregatesKey];
        if (value !== null && value !== undefined) {
          aggregateStats[`${statsKey}_${aggregatesKey}`] = value.toFixed(2);
        }
      });
    });
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-health', aggregateStats);
  }
}

// Imports from other Nuclide packages.


// Imports from non-Nuclide modules.


function aggregate(values) {
  const avg = values.reduce((prevValue, currValue, index) => {
    return prevValue + (currValue - prevValue) / (index + 1);
  }, 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { avg, min, max };
}

function formatToolbarJewelLabel(opts) {
  const { stats, toolbarJewel } = opts;
  switch (toolbarJewel) {
    case 'CPU':
      return `${stats.cpuPercentage.toFixed(0)}%`;
    case 'Heap':
      return `${stats.heapPercentage.toFixed(0)}%`;
    case 'Memory':
      return `${Math.floor(stats.rss / 1024 / 1024)}M`;
    case 'Handles':
      return `${stats.activeHandles}`;
    case 'Child processes':
      return `${stats.activeHandlesByType.childprocess.length}`;
    case 'Event loop':
      return `${stats.activeRequests}`;
    default:
      return '';
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);