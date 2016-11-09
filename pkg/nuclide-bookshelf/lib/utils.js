'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEmptBookShelfState() {
  return {
    repositoryPathToState: (_immutable || _load_immutable()).default.Map()
  };
}

// Maps are serialized as key/value pairs array to match Map `enries` format.
function serializeBookShelfState(bookShelfState) {
  const repositoryPathToState = bookShelfState.repositoryPathToState;

  const serializedRepositoryPathToState = Array.from(repositoryPathToState.entries()).map((_ref) => {
    var _ref2 = _slicedToArray(_ref, 2);

    let repositoryPath = _ref2[0],
        repositoryState = _ref2[1];

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
  const repositoryPathToState = (_immutable || _load_immutable()).default.Map(serializedBookShelfState.repositoryPathToState.map((_ref3) => {
    var _ref4 = _slicedToArray(_ref3, 2);

    let repositoryPath = _ref4[0],
        repositoryState = _ref4[1];

    return [repositoryPath, {
      activeShortHead: repositoryState.activeShortHead,
      isRestoring: false,
      shortHeadsToFileList: (_immutable || _load_immutable()).default.Map(repositoryState.shortHeadsToFileList)
    }];
  }));
  return {
    repositoryPathToState: repositoryPathToState
  };
}

function getRepoPathToEditors() {
  const reposToEditors = new Map();
  atom.workspace.getTextEditors().filter(textEditor => textEditor.getPath() != null && textEditor.getPath() !== '').map(textEditor => ({
    textEditor: textEditor,
    repository: (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(textEditor.getPath() || '')
  })).filter((_ref5) => {
    let repository = _ref5.repository;
    return repository != null;
  }).forEach((_ref6) => {
    let repository = _ref6.repository,
        textEditor = _ref6.textEditor;

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
    const newShortHeadDisplayText = newShortHead.length > 0 ? `to \`${ newShortHead }\`` : '';

    const shortHeadChangeNotification = atom.notifications.addInfo(`\`${ workingDirectoryName }\`'s active bookmark has changed ${ newShortHeadDisplayText }`, {
      detail: 'Would you like to open the files you had active then?\n \n' + 'ProTip: Change the default behavior from \'Nuclide Settings>IDE Settings>Book Shelf\'',
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
  return states.pairwise().flatMap((_ref7) => {
    var _ref8 = _slicedToArray(_ref7, 2);

    let oldBookShelfState = _ref8[0],
        newBookShelfState = _ref8[1];
    const oldRepositoryPathToState = oldBookShelfState.repositoryPathToState;


    return _rxjsBundlesRxMinJs.Observable.from(Array.from(newBookShelfState.repositoryPathToState.entries()).filter((_ref9) => {
      var _ref10 = _slicedToArray(_ref9, 2);

      let repositoryPath = _ref10[0],
          newRepositoryState = _ref10[1];

      const oldRepositoryState = oldRepositoryPathToState.get(repositoryPath);
      return oldRepositoryState != null && oldRepositoryState.activeShortHead !== newRepositoryState.activeShortHead;
    }).map((_ref11) => {
      var _ref12 = _slicedToArray(_ref11, 2);

      let repositoryPath = _ref12[0],
          newRepositoryState = _ref12[1];
      const activeShortHead = newRepositoryState.activeShortHead;

      return {
        repositoryPath: repositoryPath,
        activeShortHead: activeShortHead
      };
    }));
  });
}