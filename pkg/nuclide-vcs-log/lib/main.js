'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shortNameForAuthor = undefined;
exports.activate = activate;
exports.deactivate = deactivate;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;

var _atom = require('atom');

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _VcsLogComponent;

function _load_VcsLogComponent() {
  return _VcsLogComponent = _interopRequireDefault(require('./VcsLogComponent'));
}

var _VcsLogGadget;

function _load_VcsLogGadget() {
  return _VcsLogGadget = _interopRequireDefault(require('./VcsLogGadget'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _projects;

function _load_projects() {
  return _projects = require('nuclide-commons-atom/projects');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _querystring = _interopRequireDefault(require('querystring'));

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _util;

function _load_util() {
  return _util = require('./util');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _url = _interopRequireDefault(require('url'));

var _react = _interopRequireWildcard(require('react'));

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SHOW_LOG_FILE_TREE_CONTEXT_MENU_PRIORITY = 500; /**
                                                       * Copyright (c) 2015-present, Facebook, Inc.
                                                       * All rights reserved.
                                                       *
                                                       * This source code is licensed under the license found in the LICENSE file in
                                                       * the root directory of this source tree.
                                                       *
                                                       * 
                                                       * @format
                                                       */

// TODO: Make it possible to move or split a pane with a VcsLogPaneItem.

const NUM_LOG_RESULTS = 100;

const CONTEXT_MENU_LABEL = 'Show history';
const VCS_LOG_URI_PREFIX = 'atom://nucide-vcs-log/view';
const VCS_LOG_URI_PATHS_QUERY_PARAM = 'path';

class Activation {

  constructor() {
    this._subscriptions = new _atom.CompositeDisposable();
    this._registerOpener();
  }

  _registerOpener() {
    this._subscriptions.add(atom.workspace.addOpener(uriToOpen => {
      if (!uriToOpen.startsWith(VCS_LOG_URI_PREFIX)) {
        return;
      }

      const { query } = _url.default.parse(uriToOpen, /* parseQueryString */true);

      if (!query) {
        throw new Error('Invariant violation: "query"');
      }

      // Make sure a non-zero number of paths have been specified.


      const path = query[VCS_LOG_URI_PATHS_QUERY_PARAM];
      const component = createLogPaneForPath(path);
      return component ? (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(component) : null;
    }));

    // TODO(mbolin): Once the nuclide-file-tree.context-menu is generalized to automatically add
    // menu items to the editor context menu, as appropriate, it should be possible to eliminate
    // (or at least reduce) the logic here.

    this._subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-vcs-log:show-log-for-active-editor', () => {
      const uri = getActiveTextEditorURI();
      if (uri != null) {
        openLogPaneForURI(uri);
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-vcs-log:open-from-text-editor');
      }
    }), atom.contextMenu.add({
      'atom-text-editor': [{
        label: 'Source Control',
        submenu: [{
          label: CONTEXT_MENU_LABEL,
          command: 'nuclide-vcs-log:show-log-for-active-editor',
          shouldDisplay() {
            const uri = getActiveTextEditorURI();
            return getRepositoryWithLogMethodForPath(uri) != null;
          }
        }]
      }]
    }));
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const contextDisposable = contextMenu.addItemToSourceControlMenu({
      label: CONTEXT_MENU_LABEL,
      callback() {
        const node = contextMenu.getSingleSelectedNode();
        if (node == null) {
          return;
        }

        const { uri } = node;
        const repository = getRepositoryWithLogMethodForPath(uri);
        if (repository == null) {
          return;
        }

        openLogPaneForURI(uri);
        (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-vcs-log:open-from-file-tree');
      },
      shouldDisplay() {
        const node = contextMenu.getSingleSelectedNode();
        if (node == null) {
          return false;
        }

        return getRepositoryWithLogMethodForPath(node.uri) != null;
      }
    }, SHOW_LOG_FILE_TREE_CONTEXT_MENU_PRIORITY);

    this._subscriptions.add(contextDisposable);

    // We don't need to dispose of the contextDisposable when the provider is disabled -
    // it needs to be handled by the provider itself. We only should remove it from the list
    // of the disposables we maintain.
    return new _atom.Disposable(() => this._subscriptions.remove(contextDisposable));
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

function getRepositoryWithLogMethodForPath(path) {
  if (path == null) {
    return null;
  }

  const repository = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(path);
  // For now, we only expect HgRepository to work. We should also find a way to
  // make this work for Git.
  if (repository != null && repository.getType() === 'hg') {
    return repository;
  } else {
    return null;
  }
}

function getActiveTextEditorURI() {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    return null;
  }

  const filePath = editor.getPath();
  if (filePath == null) {
    return null;
  }

  return filePath;
}

function openLogPaneForURI(uri) {
  (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-vcs-log:open');
  const openerURI = VCS_LOG_URI_PREFIX + '?' + _querystring.default.stringify({
    [VCS_LOG_URI_PATHS_QUERY_PARAM]: uri
  });
  // Not a file URI
  // eslint-disable-next-line nuclide-internal/atom-apis
  atom.workspace.open(openerURI);
}

function createLogPaneForPath(path) {
  if (path == null) {
    return null;
  }

  const repository = getRepositoryWithLogMethodForPath(path);
  if (repository == null) {
    return null;
  }

  const { showDifferentialRevision } = (_featureConfig || _load_featureConfig()).default.get('nuclide-vcs-log');

  if (!(typeof showDifferentialRevision === 'boolean')) {
    throw new Error('Invariant violation: "typeof showDifferentialRevision === \'boolean\'"');
  }

  const title = `${repository.getType()} log ${(0, (_string || _load_string()).maybeToString)((0, (_projects || _load_projects()).getAtomProjectRelativePath)(path))}`;

  const currentDiff = new _rxjsBundlesRxMinJs.BehaviorSubject({
    oldId: null,
    newId: null
  });
  const onDiffClick = (oldId, newId) => {
    currentDiff.next({
      oldId: null,
      newId: null
    });
    currentDiff.next({
      oldId,
      newId
    });
  };

  const contentLoader = currentDiff.switchMap(ids => {
    const { oldId, newId } = ids;
    if (oldId == null || newId == null) {
      return _rxjsBundlesRxMinJs.Observable.of({ oldContent: null, newContent: null });
    }
    return _rxjsBundlesRxMinJs.Observable.forkJoin(oldId !== '' ? repository.fetchFileContentAtRevision(path, oldId) : _rxjsBundlesRxMinJs.Observable.of(''), newId !== '' ? repository.fetchFileContentAtRevision(path, newId) : _rxjsBundlesRxMinJs.Observable.of('')).startWith([null, null]).map(([oldContent, newContent]) => ({ oldContent, newContent }));
  });

  const props = _rxjsBundlesRxMinJs.Observable.combineLatest(_rxjsBundlesRxMinJs.Observable.fromPromise(repository.log([path], NUM_LOG_RESULTS)).map(log => log.entries).startWith(null), contentLoader).map(([logEntries, content]) => {
    return {
      files: [path],
      showDifferentialRevision,
      repository,
      onDiffClick,
      logEntries,
      oldContent: content.oldContent,
      newContent: content.newContent
    };
  });

  const component = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(props, (_VcsLogComponent || _load_VcsLogComponent()).default);
  return _react.createElement((_VcsLogGadget || _load_VcsLogGadget()).default, { iconName: 'repo', title: title, component: component });
}

let activation;

function activate(state) {
  if (activation == null) {
    activation = new Activation();
  }
}

function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}

function addItemsToFileTreeContextMenu(contextMenu) {
  if (!activation) {
    throw new Error('Invariant violation: "activation"');
  }

  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

const shortNameForAuthor = exports.shortNameForAuthor = (_util || _load_util()).shortNameForAuthor;