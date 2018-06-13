'use strict';

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('../../../modules/nuclide-commons-atom/destroyItemWhere');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _HealthPaneItem;

function _load_HealthPaneItem() {
  return _HealthPaneItem = _interopRequireDefault(require('./HealthPaneItem'));
}

var _HealthPaneItem2;

function _load_HealthPaneItem2() {
  return _HealthPaneItem2 = require('./HealthPaneItem');
}

var _getChildProcesses;

function _load_getChildProcesses() {
  return _getChildProcesses = require('./getChildProcesses');
}

var _getStats;

function _load_getStats() {
  return _getStats = _interopRequireDefault(require('./getStats'));
}

var _getDOMCounters;

function _load_getDOMCounters() {
  return _getDOMCounters = _interopRequireDefault(require('./getDOMCounters'));
}

var _trackKeyLatency;

function _load_trackKeyLatency() {
  return _trackKeyLatency = _interopRequireDefault(require('./trackKeyLatency'));
}

var _trackNewEditorLatency;

function _load_trackNewEditorLatency() {
  return _trackNewEditorLatency = _interopRequireDefault(require('./trackNewEditorLatency'));
}

var _trackStalls;

function _load_trackStalls() {
  return _trackStalls = _interopRequireDefault(require('./trackStalls'));
}

var _ToolbarUtils;

function _load_ToolbarUtils() {
  return _ToolbarUtils = require('../../../modules/nuclide-commons-ui/ToolbarUtils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// Imports from within this Nuclide package.


// Imports from other Nuclide packages.
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
    this._updateAnalytics = this._updateAnalytics.bind(this);

    // Observe all of the settings.
    const configs = (_featureConfig || _load_featureConfig()).default.observeAsStream('nuclide-health');
    const viewTimeouts = configs.map(config => config.viewTimeout * 1000).distinctUntilChanged();
    const analyticsTimeouts = configs.map(config => config.analyticsTimeout * 60 * 1000).distinctUntilChanged();

    // Update the stats immediately, and then periodically based on the config.
    const statsStream = _rxjsBundlesRxMinJs.Observable.of(null).concat(viewTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval)).map((_getStats || _load_getStats()).default).publishReplay(1).refCount();

    const processTreeStream = _rxjsBundlesRxMinJs.Observable.of(null).concat(viewTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval)).switchMap(() => (0, (_getChildProcesses || _load_getChildProcesses()).queryPs)('command')).map((_getChildProcesses || _load_getChildProcesses()).childProcessTree).share();

    // Sample analytics streams at about the same time by sharing
    // the timer stream.
    const analyticsInterval = analyticsTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval).share();

    // These aren't really aggregated because they're too expensive to fetch.
    // We'll just fetch these once per analytics upload cycle.
    // (Which means the first analytics upload won't have DOM counters).
    const domCounterStream = _rxjsBundlesRxMinJs.Observable.of(null).concat(analyticsTimeouts.switchMap(_rxjsBundlesRxMinJs.Observable.interval)).switchMap(() => (0, (_getDOMCounters || _load_getDOMCounters()).default)()).publishReplay(1).refCount();

    this._paneItemStates = _rxjsBundlesRxMinJs.Observable.combineLatest(statsStream, domCounterStream, _rxjsBundlesRxMinJs.Observable.of(null).concat(processTreeStream), (stats, domCounters, childProcessesTree) => ({
      stats,
      domCounters,
      childProcessesTree
    }));

    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._registerCommandAndOpener());

    if ((0, (_nuclideAnalytics || _load_nuclideAnalytics()).isTrackSupported)()) {
      this._subscriptions.add(_rxjsBundlesRxMinJs.Observable.zip(statsStream.buffer(analyticsInterval), analyticsInterval.switchMap((_getDOMCounters || _load_getDOMCounters()).default), analyticsInterval.switchMap(() => (0, (_getChildProcesses || _load_getChildProcesses()).queryPs)('comm').map((_getChildProcesses || _load_getChildProcesses()).childProcessSummary))).subscribe(([buffer, domCounters, processes]) => {
        this._updateAnalytics(buffer, domCounters, processes);
      }, error => {
        (0, (_log4js || _load_log4js()).getLogger)().error('Failed to gather nuclide-health analytics.', error.stack);
      }), (0, (_trackKeyLatency || _load_trackKeyLatency()).default)(), (0, (_trackNewEditorLatency || _load_trackNewEditorLatency()).default)(), (0, (_trackStalls || _load_trackStalls()).default)());
    }
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-health');
    this._healthButton = toolBar.addButton((0, (_ToolbarUtils || _load_ToolbarUtils()).makeToolbarButtonSpec)({
      icon: 'dashboard',
      callback: 'nuclide-health:toggle',
      tooltip: 'Toggle Nuclide Health Stats',
      priority: -400
    })).element;
    this._healthButton.classList.add('nuclide-health-jewel');
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._healthButton = null;
      toolBar.removeItems();
    });
    this._subscriptions.add(disposable);
    return disposable;
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_HealthPaneItem2 || _load_HealthPaneItem2()).WORKSPACE_VIEW_URI) {
        return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_HealthPaneItem || _load_HealthPaneItem()).default, { stateStream: this._paneItemStates }));
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_HealthPaneItem || _load_HealthPaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-health:toggle', () => {
      atom.workspace.toggle((_HealthPaneItem2 || _load_HealthPaneItem2()).WORKSPACE_VIEW_URI);
    }));
  }

  async _updateAnalytics(analyticsBuffer, domCounters, subProcesses) {
    if (analyticsBuffer.length === 0) {
      return;
    }

    // Aggregates the buffered stats up by suffixing avg, min, max to their names.
    const state = {};

    // We don't have aggregates for these - these are just the most recent numbers.
    if (domCounters != null) {
      state.attachedDomNodes = domCounters.attachedNodes;
      state.domNodes = domCounters.nodes;
      state.domListeners = domCounters.jsEventListeners;
    }

    if (subProcesses != null) {
      state.subProcesses = subProcesses;
    }

    // All analyticsBuffer entries have the same keys; we use the first entry to know what they
    // are.
    Object.keys(analyticsBuffer[0]).forEach(statsKey => {
      // These values are not to be aggregated or sent.
      if (statsKey === 'activeHandlesByType') {
        return;
      }

      const aggregates = aggregateHealth(analyticsBuffer.map(stats => typeof stats[statsKey] === 'number' ? stats[statsKey] : 0));
      Object.keys(aggregates).forEach(aggregatesKey => {
        const value = aggregates[aggregatesKey];
        if (value != null) {
          state[`${statsKey}_${aggregatesKey}`] = value.toFixed(2);
        }
      });
    });
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-health', state);
  }
}

// Imports from non-Nuclide modules.


function aggregateHealth(values) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  const avg = values.length > 0 ? sum / values.length : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { avg, min, max };
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);