"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEmptBookShelfState = getEmptBookShelfState;
exports.serializeBookShelfState = serializeBookShelfState;
exports.deserializeBookShelfState = deserializeBookShelfState;
exports.getRepoPathToEditors = getRepoPathToEditors;
exports.shortHeadChangedNotification = shortHeadChangedNotification;
exports.getShortHeadChangesFromStateStream = getShortHeadChangesFromStateStream;

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _featureConfig() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
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

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
function getEmptBookShelfState() {
  return {
    repositoryPathToState: Immutable().Map()
  };
} // Maps are serialized as key/value pairs array to match Map `enries` format.


function serializeBookShelfState(bookShelfState) {
  const {
    repositoryPathToState
  } = bookShelfState;
  const serializedRepositoryPathToState = Array.from(repositoryPathToState.entries()).map(([repositoryPath, repositoryState]) => {
    const serializedShortHeadToFileList = {
      activeShortHead: repositoryState.activeShortHead,
      shortHeadsToFileList: Array.from(repositoryState.shortHeadsToFileList.entries())
    };
    return [repositoryPath, serializedShortHeadToFileList];
  });
  return {
    repositoryPathToState: serializedRepositoryPathToState
  };
}

function deserializeBookShelfState(serializedBookShelfState) {
  if (serializedBookShelfState == null || serializedBookShelfState.repositoryPathToState == null) {
    return getEmptBookShelfState();
  }

  const repositoryPathToState = Immutable().Map(serializedBookShelfState.repositoryPathToState.map(([repositoryPath, repositoryState]) => {
    return [repositoryPath, {
      activeShortHead: repositoryState.activeShortHead,
      isRestoring: false,
      shortHeadsToFileList: Immutable().Map(repositoryState.shortHeadsToFileList)
    }];
  }));
  return {
    repositoryPathToState
  };
}

function getRepoPathToEditors() {
  const reposToEditors = new Map();
  atom.workspace.getTextEditors().filter(textEditor => textEditor.getPath() != null && textEditor.getPath() !== '').map(textEditor => ({
    textEditor,
    repository: (0, _nuclideVcsBase().repositoryForPath)(textEditor.getPath() || '')
  })).filter(({
    repository
  }) => repository != null).forEach(({
    repository,
    textEditor
  }) => {
    if (!repository) {
      throw new Error("Invariant violation: \"repository\"");
    }

    const repositoryPath = repository.getWorkingDirectory();
    reposToEditors.set(repositoryPath, (reposToEditors.get(repositoryPath) || []).concat([textEditor]));
  });
  return reposToEditors;
}

function shortHeadChangedNotification(repository, newShortHead, restorePaneItemState) {
  return _RxMin.Observable.create(observer => {
    const workingDirectoryName = _nuclideUri().default.basename(repository.getWorkingDirectory()); // TODO(most): Should we handle empty bookmark switches differently?


    const newShortHeadDisplayText = newShortHead.length > 0 ? `to \`${newShortHead}\`` : '';
    const shortHeadChangeNotification = atom.notifications.addInfo(`\`${workingDirectoryName}\`'s active bookmark has changed ${newShortHeadDisplayText}`, {
      detail: 'Would you like to open the files you had active then?\n \n' + "ProTip: Change the default behavior from 'Nuclide Settings>Nuclide-bookshelf'",
      dismissable: true,
      buttons: [{
        onDidClick: () => {
          restorePaneItemState(repository, newShortHead);
          observer.complete();
        },
        text: 'Open files'
      }, {
        onDidClick: () => {
          _featureConfig().default.set(_constants().ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG, _constants().ActiveShortHeadChangeBehavior.ALWAYS_IGNORE);

          observer.complete();
        },
        text: 'Always ignore'
      }]
    });
    const dismissSubscription = shortHeadChangeNotification.onDidDismiss(() => {
      (0, _nuclideAnalytics().track)('bookshelf-dismiss-restore-prompt');
      observer.complete();
    });
    return function unsubscribe() {
      dismissSubscription.dispose();
      shortHeadChangeNotification.dismiss();
    };
  });
}

function getShortHeadChangesFromStateStream(states) {
  return states.pairwise().flatMap(([oldBookShelfState, newBookShelfState]) => {
    const {
      repositoryPathToState: oldRepositoryPathToState
    } = oldBookShelfState;
    return _RxMin.Observable.from(Array.from(newBookShelfState.repositoryPathToState.entries()).filter(([repositoryPath, newRepositoryState]) => {
      const oldRepositoryState = oldRepositoryPathToState.get(repositoryPath);
      return oldRepositoryState != null && oldRepositoryState.activeShortHead !== newRepositoryState.activeShortHead;
    }).map(([repositoryPath, newRepositoryState]) => {
      const {
        activeShortHead
      } = newRepositoryState;
      return {
        repositoryPath,
        activeShortHead
      };
    }));
  });
}