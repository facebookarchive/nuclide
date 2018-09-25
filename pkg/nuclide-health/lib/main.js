"use strict";

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _viewableFromReactElement() {
  const data = require("../../commons-atom/viewableFromReactElement");

  _viewableFromReactElement = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _HealthPaneItem() {
  const data = _interopRequireWildcard(require("./HealthPaneItem"));

  _HealthPaneItem = function () {
    return data;
  };

  return data;
}

function _getChildProcesses() {
  const data = require("./getChildProcesses");

  _getChildProcesses = function () {
    return data;
  };

  return data;
}

function _getStats() {
  const data = _interopRequireDefault(require("./getStats"));

  _getStats = function () {
    return data;
  };

  return data;
}

function _getDOMCounters() {
  const data = _interopRequireDefault(require("./getDOMCounters"));

  _getDOMCounters = function () {
    return data;
  };

  return data;
}

function _trackKeyLatency() {
  const data = _interopRequireDefault(require("./trackKeyLatency"));

  _trackKeyLatency = function () {
    return data;
  };

  return data;
}

function _trackNewEditorLatency() {
  const data = _interopRequireDefault(require("./trackNewEditorLatency"));

  _trackNewEditorLatency = function () {
    return data;
  };

  return data;
}

function _trackStalls() {
  const data = _interopRequireDefault(require("./trackStalls"));

  _trackStalls = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
// Imports from non-Nuclide modules.
// Imports from other Nuclide packages.
// Imports from within this Nuclide package.
class Activation {
  constructor(state) {
    this._updateAnalytics = this._updateAnalytics.bind(this); // Observe all of the settings.

    const configs = _featureConfig().default.observeAsStream('nuclide-health');

    const viewTimeouts = configs.map(config => config.viewTimeout * 1000).distinctUntilChanged();
    const analyticsTimeouts = configs.map(config => config.analyticsTimeout * 60 * 1000).distinctUntilChanged(); // Update the stats immediately, and then periodically based on the config.

    const statsStream = _RxMin.Observable.of(null).concat(viewTimeouts.switchMap(_RxMin.Observable.interval)).map(_getStats().default).publishReplay(1).refCount();

    const processTreeStream = _RxMin.Observable.of(null).concat(viewTimeouts.switchMap(_RxMin.Observable.interval)).switchMap(() => (0, _getChildProcesses().queryPs)('command')).map(_getChildProcesses().childProcessTree).share(); // Sample analytics streams at about the same time by sharing
    // the timer stream.


    const analyticsInterval = analyticsTimeouts.switchMap(_RxMin.Observable.interval).share(); // These aren't really aggregated because they're too expensive to fetch.
    // We'll just fetch these once per analytics upload cycle.
    // (Which means the first analytics upload won't have DOM counters).

    const domCounterStream = _RxMin.Observable.of(null).concat(analyticsTimeouts.switchMap(_RxMin.Observable.interval)).switchMap(() => (0, _getDOMCounters().default)()).publishReplay(1).refCount();

    this._paneItemStates = _RxMin.Observable.combineLatest(statsStream, domCounterStream, _RxMin.Observable.of(null).concat(processTreeStream), (stats, domCounters, childProcessesTree) => ({
      stats,
      domCounters,
      childProcessesTree
    }));
    this._subscriptions = new (_UniversalDisposable().default)(this._registerCommandAndOpener());

    if ((0, _nuclideAnalytics().isTrackSupported)()) {
      this._subscriptions.add(_RxMin.Observable.zip(statsStream.buffer(analyticsInterval), analyticsInterval.switchMap(_getDOMCounters().default), analyticsInterval.switchMap(() => (0, _getChildProcesses().queryPs)('comm').map(_getChildProcesses().childProcessSummary))).subscribe(([buffer, domCounters, processes]) => {
        this._updateAnalytics(buffer, domCounters, processes);
      }, error => {
        (0, _log4js().getLogger)().error('Failed to gather nuclide-health analytics.', error.stack);
      }), (0, _trackKeyLatency().default)(), (0, _trackNewEditorLatency().default)(), (0, _trackStalls().default)());
    }
  }

  dispose() {
    this._subscriptions.dispose();
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-health');
    this._healthButton = toolBar.addButton({
      icon: 'dashboard',
      callback: 'nuclide-health:toggle',
      tooltip: 'Toggle Nuclide Health Stats',
      priority: -400
    }).element;

    this._healthButton.classList.add('nuclide-health-jewel');

    const disposable = new (_UniversalDisposable().default)(() => {
      this._healthButton = null;
      toolBar.removeItems();
    });

    this._subscriptions.add(disposable);

    return disposable;
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _HealthPaneItem().WORKSPACE_VIEW_URI) {
        return (0, _viewableFromReactElement().viewableFromReactElement)(React.createElement(_HealthPaneItem().default, {
          stateStream: this._paneItemStates
        }));
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _HealthPaneItem().default), atom.commands.add('atom-workspace', 'nuclide-health:toggle', () => {
      atom.workspace.toggle(_HealthPaneItem().WORKSPACE_VIEW_URI);
    }));
  }

  async _updateAnalytics(analyticsBuffer, domCounters, subProcesses) {
    if (analyticsBuffer.length === 0) {
      return;
    } // Aggregates the buffered stats up by suffixing avg, min, max to their names.


    const state = {}; // We don't have aggregates for these - these are just the most recent numbers.

    if (domCounters != null) {
      state.attachedDomNodes = domCounters.attachedNodes;
      state.domNodes = domCounters.nodes;
      state.domListeners = domCounters.jsEventListeners;
    }

    if (subProcesses != null) {
      state.subProcesses = subProcesses;
    } // All analyticsBuffer entries have the same keys; we use the first entry to know what they
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
    (0, _nuclideAnalytics().track)('nuclide-health', state);
  }

}

function aggregateHealth(values) {
  const sum = values.reduce((acc, value) => acc + value, 0);
  const avg = values.length > 0 ? sum / values.length : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    avg,
    min,
    max
  };
}

(0, _createPackage().default)(module.exports, Activation);