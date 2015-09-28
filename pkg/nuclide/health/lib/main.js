'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

type HealthStats = {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  heapPercentage: number;
  cpuPercentage: number;
  lastKeyLatency: number;
  activeHandles: number;
  activeRequests: number;
};

// This type needs to match the propTypes on the view components that display health data.
type StatsViewProps = {
  cpuPercentage?: number;
  memory?: number;
  heapPercentage?: number;
  lastKeyLatency?: number;
  activeHandles?: number;
  activeRequests?: number;
};

var BASE_ITEM_URI = 'nuclide-health://';

var os = require('os');
var {CompositeDisposable, Disposable, TextEditor} = require('atom');

var disposables: ?CompositeDisposable = null;

var statusBarItem: ?Element;
var paneItem: ?HTMLElement;

var viewTimeout: ?number = null;
var analyticsTimeout: ?number = null;

var analyticsBuffer: Array<HealthStats> = [];

// Variables for tracking where and when a key was pressed, and the time before it had an effect.
var activeEditorDisposables: ?CompositeDisposable = null;
var keyEditorId = 0;
var keyDownTime = 0;
var keyLatency = 0;
var lastKeyLatency = 0;

var currentConfig = {};

var React;
function getReact() {
  if (!React) {
    React = require('react-for-atom');
  }
  return React;
}

function activate(): void {
  disposables = new CompositeDisposable();
  disposables.add(
    atom.config.onDidChange('nuclide-health', (event) => {
      currentConfig = event.newValue;
      // If user changes any config, update the health - and reset the polling cycles.
      updateViews();
      updateAnalytics();
    }),
    atom.workspace.onDidChangeActivePaneItem(timeActiveEditorKeys),
    atom.workspace.addOpener(getHealthPaneItem),
    atom.commands.add(
      'atom-workspace',
      'nuclide-health:open-pane',
      () => atom.workspace.open(BASE_ITEM_URI, {searchAllPanes: true})
    ),
  );
  currentConfig = atom.config.get('nuclide-health');
  timeActiveEditorKeys();
  updateViews();
  updateAnalytics();
}

var config = {
  analyticsTimeout: {
    order: 0,
    type: 'integer',
    default: 10,
    description: 'Polling interval for sending aggregated health stats as analytics (in minutes).',
    minimum: 1,
    maximum: 60,
  },
  viewTimeout: {
    order: 1,
    type: 'integer',
    default: 1,
    description: 'Polling interval for showing health stats in status views (in seconds).',
    minimum: 1,
    maximum: 60,
  },
  showCpu: {
    order: 2,
    type: 'boolean',
    default: false,
    title: 'Show CPU usage as a percentage',
    description:
      'Show CPU average for the last minute as a percentage in status bar (except on Windows).',
  },
  showHeap: {
    order: 3,
    type: 'boolean',
    default: false,
    description: 'Show heap usage as a percentage in status bar.',
  },
  showMemory: {
    order: 4,
    type: 'boolean',
    default: false,
    description: 'Show memory usage in MB in status bar.',
  },
  showKeyLatency: {
    order: 5,
    type: 'boolean',
    default: false,
    description: 'Show latest editor key latency in milliseconds in status bar.',
  },
  showActiveHandles: {
    order: 6,
    type: 'boolean',
    default: false,
    title: 'Show Handles',
    description: 'Show number of active handles open in Node in status bar.',
  },
  showActiveRequests: {
    order: 7,
    type: 'boolean',
    default: false,
    title: 'Show Event Loop',
    description: 'Show number of active requests in the Node event loop in status bar.',
  },
};

function getHealthPaneItem(uri: string): ?HTMLElement {
  if (!uri.startsWith(BASE_ITEM_URI)) {
    return;
  }
  var HealthPaneItem = require('./HealthPaneItem');
  paneItem = new HealthPaneItem().initialize(uri);
  return paneItem;
}

function consumeStatusBar(statusBar: any): void {
  statusBarItem = document.createElement('div');
  statusBarItem.className = 'inline-block nuclide-health';
  var tile = statusBar.addRightTile({
    item: statusBarItem,
    priority: -99, // Quite far right.
  });
  if (disposables) {
    disposables.add(
      atom.tooltips.add(
        statusBarItem,
        {title: 'Click the icon to display and configure Nuclide health stats.'}
      ),
      new Disposable(() => {
        tile.destroy();
        if (statusBarItem) {
          var parentNode = statusBarItem.parentNode;
          if (parentNode) {
            parentNode.removeChild(statusBarItem);
          }
          getReact().unmountComponentAtNode(statusBarItem);
          statusBarItem = null;
        }
      })
    );
  }
}

function timeActiveEditorKeys(): void {
  // Clear out any events & timing data from previous text editor.
  if (activeEditorDisposables) {
    activeEditorDisposables.dispose();
  }
  activeEditorDisposables = new CompositeDisposable();

  // If option is enabled, start timing latency of keys on the new text editor.
  if (!currentConfig.showKeyLatency && !paneItem) {
    return;
  }

  // Ensure the editor is valid and there is a view to attatch the keypress timing to.
  var editor: ?TextEditor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return;
  }
  var view = atom.views.getView(editor);
  if (!view) {
    return;
  }

  // Start the clock when a key is pressed. Function is named so it can be disposed well.
  var startKeyClock = () => {
    if (editor) {
      keyEditorId = editor.id;
      keyDownTime = Date.now();
    }
  };

  // Stop the clock when the (same) editor has changed content.
  var stopKeyClock = () => {
    if (editor && editor.id && keyEditorId === editor.id && keyDownTime) {
      keyLatency = Date.now() - keyDownTime;
      // Reset so that subsequent non-key-initiated buffer updates don't produce silly big numbers.
      keyDownTime = 0;
    }
  };

  // Add the listener to keydown.
  view.addEventListener('keydown', startKeyClock);

  activeEditorDisposables.add(
    // Remove the listener in a home-made disposable for when this editor is no-longer active.
    new Disposable(() => view.removeEventListener('keydown', startKeyClock)),

    // stopKeyClock is fast so attatching it to onDidChange here is OK.
    // onDidStopChanging would be another option - any cost is deferred, but with far less fidelity.
    editor.onDidChange(stopKeyClock),
  );
}

function updateViews(): void {
  var stats = getHealthStats();
  analyticsBuffer.push(stats);
  updateStatusBar(stats);
  updatePaneItem(stats);
  if (currentConfig.viewTimeout) {
    if (viewTimeout !== null) {
      clearTimeout(viewTimeout);
    }
    viewTimeout = setTimeout(updateViews, currentConfig.viewTimeout * 1000);
  }
}

function updateStatusBar(stats: HealthStats): void {
  if (!statusBarItem) {
    return;
  }
  var props: StatsViewProps = {};
  if (currentConfig.showCpu) {
    props.cpuPercentage = stats.cpuPercentage;
  }
  if (currentConfig.showHeap) {
    props.heapPercentage = stats.heapPercentage;
  }
  if (currentConfig.showMemory) {
    props.memory = stats.rss;
  }
  if (currentConfig.showKeyLatency) {
    props.lastKeyLatency = stats.lastKeyLatency;
  }
  if (currentConfig.showActiveHandles) {
    props.activeHandles = stats.activeHandles;
  }
  if (currentConfig.showActiveRequests) {
    props.activeRequests = stats.activeRequests;
  }

  var HealthStatusBarComponent = require('./ui/HealthStatusBarComponent');
  getReact().render(
    <HealthStatusBarComponent
      {...props}
      onClickIcon={openHealthPane}
    />,
    statusBarItem
  );
}

function openHealthPane() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-health:open-pane');
}

function updatePaneItem(stats: HealthStats): void {
  if (!paneItem) {
    return;
  }

  // We need to send the actual handles down to the component to render.
  var activeHandleObjects = getActiveHandles();

  var HealthPaneItemComponent = require('./ui/HealthPaneItemComponent');
  getReact().render(
    <HealthPaneItemComponent
      cpuPercentage={stats.cpuPercentage}
      heapPercentage={stats.heapPercentage}
      memory={stats.rss}
      lastKeyLatency={stats.lastKeyLatency}
      activeHandles={activeHandleObjects.length}
      activeHandleObjects={activeHandleObjects}
      activeRequests={stats.activeRequests}
    />,
    paneItem
  );
}

function updateAnalytics(): void {
  if (analyticsBuffer.length > 0) {
    // Aggregates the buffered stats up by suffixing avg, min, max to their names.
    var aggregateStats = {};

    // All analyticsBuffer entries have the same keys; we use the first entry to know what they are.
    Object.keys(analyticsBuffer[0]).forEach(statsKey => {
      if (statsKey === 'lastKeyLatency') {
        return;
        // This field is only used to for a sticky value in the status bar, and is not to be sent.
      }

      var aggregates = aggregate(
        analyticsBuffer.map(stats => stats[statsKey]),
        (statsKey === 'keyLatency'), // skipZeros: Don't use empty key latency values in aggregates.
      );
      Object.keys(aggregates).forEach(aggregatesKey => {
        var value = aggregates[aggregatesKey];
        if (value !== null && value !== undefined) {
          aggregateStats[`${statsKey}_${aggregatesKey}`] = value.toFixed(2);
        }
      });
    });
    require('nuclide-analytics').track('nuclide-health', aggregateStats);
    analyticsBuffer = [];
  }

  if (currentConfig.analyticsTimeout) {
    if (analyticsTimeout !== null) {
      clearTimeout(analyticsTimeout);
    }
    analyticsTimeout = setTimeout(updateAnalytics, currentConfig.analyticsTimeout * 60 * 1000);
  }
}

function aggregate(
  values: Array<number>,
  skipZeros: boolean = false,
): {avg: ?number, min: ?number, max: ?number} {
  // Some values (like memory usage) might be very high & numerous, so avoid summing them all up.
  if (skipZeros) {
    values = values.filter(value => value !== 0);
    if (values.length === 0) {
      return {avg: null, min: null, max: null};
    }
  }
  var avg = values.reduce((prevValue, currValue, index) => {
    return prevValue + (currValue - prevValue) / (index + 1);
  }, 0);
  var min = Math.min(...values);
  var max = Math.max(...values);
  return {avg, min, max};
}

function getHealthStats(): HealthStats {
  var stats = process.memoryUsage();                                 // RSS, heap and usage.
  stats.heapPercentage = (100 * stats.heapUsed / stats.heapTotal);   // Just for convenience.
  stats.cpuPercentage = os.loadavg()[0];                             // 1 minute CPU average.

  if (keyLatency) {
    lastKeyLatency = keyLatency;
  }
  stats.lastKeyLatency = lastKeyLatency;
  stats.keyLatency = keyLatency;
  keyLatency = 0; // We only want to ever record a key latency time once, and so we reset it.

  stats.activeHandles = getActiveHandles().length;
  stats.activeRequests = getActiveRequests().length;

  return stats;
}

// These two functions are to defend against undocumented Node functions.
function getActiveHandles(): Array<Object> {
  if (process._getActiveHandles) {
    return process._getActiveHandles();
  }
  return [];
}

function getActiveRequests(): Array<Object> {
  if (process._getActiveRequests) {
    return process._getActiveRequests();
  }
  return [];
}

function deactivate(): void {
  if (viewTimeout !== null) {
    clearTimeout(viewTimeout);
    viewTimeout = null;
  }
  if (analyticsTimeout !== null) {
    clearTimeout(analyticsTimeout);
    analyticsTimeout = null;
  }
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
  if (activeEditorDisposables) {
    activeEditorDisposables.dispose();
    activeEditorDisposables = null;
  }
}

atom.deserializers.add({
  name: 'HealthPaneItem',
  deserialize: state => getHealthPaneItem(state.uri),
});

module.exports = {
  activate,
  config,
  consumeStatusBar,
  deactivate,
};
