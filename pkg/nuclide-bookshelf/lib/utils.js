'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getEmptBookShelfState = getEmptBookShelfState;
exports.serializeBookShelfState = serializeBookShelfState;
exports.deserializeBookShelfState = deserializeBookShelfState;
exports.getRepoPathToEditors = getRepoPathToEditors;
exports.shortHeadChangedNotification = shortHeadChangedNotification;
exports.getShortHeadChangesFromStateStream = getShortHeadChangesFromStateStream;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function getEmptBookShelfState() {
  return {
    repositoryPathToState: (_immutable || _load_immutable()).default.Map()
  };
}

// Maps are serialized as key/value pairs array to match Map `enries` format.
function serializeBookShelfState(bookShelfState) {
  const { repositoryPathToState } = bookShelfState;
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
  const repositoryPathToState = (_immutable || _load_immutable()).default.Map(serializedBookShelfState.repositoryPathToState.map(([repositoryPath, repositoryState]) => {
    return [repositoryPath, {
      activeShortHead: repositoryState.activeShortHead,
      isRestoring: false,
      shortHeadsToFileList: (_immutable || _load_immutable()).default.Map(repositoryState.shortHeadsToFileList)
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
    repository: (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(textEditor.getPath() || '')
  })).filter(({ repository }) => repository != null).forEach(({ repository, textEditor }) => {
    if (!repository) {
      throw new Error('Invariant violation: "repository"');
    }

    const repositoryPath = repository.getWorkingDirectory();
    reposToEditors.set(repositoryPath, (reposToEditors.get(repositoryPath) || []).concat([textEditor]));
  });
  return reposToEditors;
}

function shortHeadChangedNotification(repository, newShortHead, restorePaneItemState) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    const workingDirectoryName = (_nuclideUri || _load_nuclideUri()).default.basename(repository.getWorkingDirectory());

    // TODO(most): Should we handle empty bookmark switches differently?
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
          (_featureConfig || _load_featureConfig()).default.set((_constants || _load_constants()).ACTIVE_SHORTHEAD_CHANGE_BEHAVIOR_CONFIG, (_constants || _load_constants()).ActiveShortHeadChangeBehavior.ALWAYS_IGNORE);
          observer.complete();
        },
        text: 'Always ignore'
      }]
    });

    const dismissSubscription = shortHeadChangeNotification.onDidDismiss(() => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-dismiss-restore-prompt');
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

    return _rxjsBundlesRxMinJs.Observable.from(Array.from(newBookShelfState.repositoryPathToState.entries()).filter(([repositoryPath, newRepositoryState]) => {
      const oldRepositoryState = oldRepositoryPathToState.get(repositoryPath);
      return oldRepositoryState != null && oldRepositoryState.activeShortHead !== newRepositoryState.activeShortHead;
    }).map(([repositoryPath, newRepositoryState]) => {
      const { activeShortHead } = newRepositoryState;
      return {
        repositoryPath,
        activeShortHead
      };
    }));
  });
}