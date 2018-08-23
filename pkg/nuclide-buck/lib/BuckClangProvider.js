"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getClangProvider = getClangProvider;

function _SimpleCache() {
  const data = require("../../../modules/nuclide-commons/SimpleCache");

  _SimpleCache = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("../../nuclide-buck-rpc/lib/types");

  _types = function () {
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

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _BuckTaskRunner() {
  const data = require("./BuckTaskRunner");

  _BuckTaskRunner = function () {
    return data;
  };

  return data;
}

function _ClangFlagsFileWatcher() {
  const data = require("../../nuclide-clang-base/lib/ClangFlagsFileWatcher");

  _ClangFlagsFileWatcher = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const WARNING_HINT = 'Hint: Try **Nuclide > Clang > Clean and Rebuild** once fixed.';
const SHOW_NOTIFICATION_CONFIG = 'nuclide-buck.buildDbErrorNotify'; // Strip off remote error, which is JSON object on last line of error message.

function cleanupErrorMessage(message) {
  const trimmed = message.trim();
  const lastNewline = trimmed.lastIndexOf('\n');

  if (lastNewline !== -1) {
    return trimmed.substring(0, lastNewline);
  }

  return trimmed;
}

function constructNotificationOptions(clickCallback) {
  const buttons = [{
    text: 'Show in console',
    onDidClick: () => {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(_BuckTaskRunner().CONSOLE_VIEW_URI, {
        searchAllPanes: true
      });

      if (clickCallback) {
        clickCallback();
      }
    }
  }, {
    text: 'Never show again',
    onDidClick: () => {
      _featureConfig().default.set(SHOW_NOTIFICATION_CONFIG, false);

      if (clickCallback) {
        clickCallback();
      }
    }
  }];
  return {
    dismissable: true,
    buttons
  };
}

function emitCompilationDbWarnings(db, consolePrinter) {
  if (db.warnings.length > 0) {
    if (consolePrinter) {
      db.warnings.forEach(text => consolePrinter({
        text,
        level: 'warning'
      }));
    }

    if (_featureConfig().default.get(SHOW_NOTIFICATION_CONFIG)) {
      const notification = atom.notifications.addWarning(['Buck: warnings detected while fetching compile commands,', 'some language services may not work properly.', WARNING_HINT].join(' '), constructNotificationOptions(() => // Notification doesn't dismiss itself on click.
      notification.dismiss()));
    }
  }
}

function emitCompilationDbError(errorMessage, consolePrinter) {
  if (consolePrinter) {
    consolePrinter({
      text: cleanupErrorMessage(errorMessage),
      level: 'error'
    });
  }

  if (_featureConfig().default.get(SHOW_NOTIFICATION_CONFIG)) {
    const notification = atom.notifications.addError(['Buck error: build failed while fetching compile commands.', WARNING_HINT].join(' '), constructNotificationOptions(() => notification.dismiss()));
  }
}

class Provider {
  constructor(host, params) {
    this._projectRootCache = new (_SimpleCache().SimpleCache)();
    this._compilationDBCache = new (_SimpleCache().SimpleCache)();
    this._host = host;
    this._flagsFileWatcher = new (_ClangFlagsFileWatcher().ClangFlagsFileWatcher)(host);
    this._params = params;
  }

  _reportCompilationDBBusySignalWhile(src, getBusySignalService, dbPromise) {
    const busySignal = getBusySignalService();
    return busySignal == null ? dbPromise : busySignal.reportBusyWhile('Generating Buck compilation database for "' + _nuclideUri().default.basename(src) + '"', () => dbPromise);
  }

  getCompilationDatabase(src, getBusySignalService, getConsolePrinter) {
    const consolePrinter = getConsolePrinter();
    return this._compilationDBCache.getOrCreate(src, () => {
      return this._reportCompilationDBBusySignalWhile(src, getBusySignalService, (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(this._host).getCompilationDatabase(src, this._params).refCount().do(db => {
        if (db != null && db.flagsFile != null) {
          this._flagsFileWatcher.watch(db.flagsFile, src, () => this.resetForSource(src));
        }

        if (db != null) {
          emitCompilationDbWarnings(db, consolePrinter);
        }

        (0, _nuclideAnalytics().track)('buck-clang.getSettings', {
          src,
          db,
          warningsLength: db != null ? db.warnings.length : 0
        });
      }).toPromise().catch(error => {
        emitCompilationDbError(error.message, consolePrinter);
      }));
    });
  }

  getProjectRoot(src) {
    return this._projectRootCache.getOrCreate(src, () => (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(this._host).getRootForPath(src));
  }

  resetForSource(src) {
    this._compilationDBCache.delete(src);

    (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(this._host).resetCompilationDatabaseForSource(src, this._params);

    this._flagsFileWatcher.resetForSource(src);
  }

  reset() {
    this._compilationDBCache.clear();

    (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(this._host).resetCompilationDatabase(this._params);

    this._flagsFileWatcher.reset();
  }

}

const providersCache = new (_SimpleCache().SimpleCache)({
  keyFactory: ([host, params]) => JSON.stringify([_nuclideUri().default.getHostnameOpt(host) || '', params]),
  dispose: provider => provider.reset()
});

function getProvider(host, params) {
  return providersCache.getOrCreate([host, params], () => new Provider(host, params));
}

const supportsSourceCache = new (_SimpleCache().SimpleCache)();

function getClangProvider(taskRunner, getBusySignalService, getConsolePrinter) {
  return {
    async supportsSource(src) {
      return supportsSourceCache.getOrCreate(src, async () => (await (0, _nuclideRemoteConnection().getBuckServiceByNuclideUri)(src).getRootForPath(src)) != null);
    },

    async getSettings(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      const provider = getProvider(src, params);
      const [buckCompilationDatabase, projectRoot] = await Promise.all([provider.getCompilationDatabase(src, getBusySignalService, getConsolePrinter), provider.getProjectRoot(src)]);

      if (projectRoot == null) {
        return null;
      }

      return {
        projectRoot,
        compilationDatabase: (0, _types().convertBuckClangCompilationDatabase)(buckCompilationDatabase)
      };
    },

    resetForSource(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      getProvider(src, params).resetForSource(src);
      supportsSourceCache.delete(src);
    },

    reset(src) {
      const params = taskRunner.getCompilationDatabaseParamsForCurrentContext();
      providersCache.delete([src, params]);
      supportsSourceCache.clear();
    },

    priority: 100
  };
}