'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_DEBUGGER_DEV_GK = undefined;
exports.getJavaConfig = getJavaConfig;
exports.getCustomControlButtonsForJavaSourcePaths = getCustomControlButtonsForJavaSourcePaths;
exports.getDefaultSourceSearchPaths = getDefaultSourceSearchPaths;
exports.getSavedPathsFromConfig = getSavedPathsFromConfig;
exports.persistSourcePathsToConfig = persistSourcePathsToConfig;
exports.getDialogValues = getDialogValues;
exports.getSourcePathString = getSourcePathString;
exports.getSourcePathClickSubscriptionsOnVspInstance = getSourcePathClickSubscriptionsOnVspInstance;
exports.getSourcePathClickSubscriptions = getSourcePathClickSubscriptions;
exports.resolveConfiguration = resolveConfiguration;
exports.setSourcePathsService = setSourcePathsService;
exports.setRpcService = setRpcService;
exports.getJavaDebuggerHelpersServiceByNuclideUri = getJavaDebuggerHelpersServiceByNuclideUri;

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../nuclide-commons-atom/feature-config'));
}

var _showModal;

function _load_showModal() {
  return _showModal = _interopRequireDefault(require('../nuclide-commons-ui/showModal'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _react = _interopRequireWildcard(require('react'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../nuclide-commons/UniversalDisposable'));
}

var _constants;

function _load_constants() {
  return _constants = require('../nuclide-debugger-common/constants');
}

var _JavaDebuggerHelpersService;

function _load_JavaDebuggerHelpersService() {
  return _JavaDebuggerHelpersService = _interopRequireWildcard(require('./JavaDebuggerHelpersService'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _SourceFilePathsModal;

function _load_SourceFilePathsModal() {
  return _SourceFilePathsModal = require('./SourceFilePathsModal');
}

var _analytics;

function _load_analytics() {
  return _analytics = require('../nuclide-commons/analytics');
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
 *  strict-local
 * @format
 */

let _sourcePathsService;
let _rpcService = null;

const NUCLIDE_DEBUGGER_DEV_GK = exports.NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';

function getJavaConfig() {
  const entryPointClass = {
    name: 'entryPointClass',
    type: 'string',
    description: 'Input the Java entry point name you want to launch',
    required: true,
    visible: true
  };
  const classPath = {
    name: 'classPath',
    type: 'string',
    description: 'Java class path',
    required: true,
    visible: true
  };
  const javaJdwpPort = {
    name: 'javaJdwpPort',
    type: 'number',
    description: 'Java debugger port',
    required: true,
    visible: true
  };
  return {
    launch: {
      launch: true,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA,
      threads: true,
      properties: [entryPointClass, classPath],
      cwdPropertyName: 'cwd',
      header: null,
      getProcessName(values) {
        return values.entryPointClass + ' (Java)';
      }
    },
    attach: {
      launch: false,
      vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA,
      threads: true,
      properties: [javaJdwpPort],
      header: null,
      getProcessName(values) {
        return 'Port: ' + values.javaJdwpPort + ' (Java)';
      }
    }
  };
}

function getCustomControlButtonsForJavaSourcePaths(clickEvents) {
  return [{
    icon: 'file-code',
    title: 'Set Source Path',
    onClick: () => clickEvents.next()
  }];
}

function getDefaultSourceSearchPaths(targetUri) {
  const searchPaths = [];
  const remote = (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri);

  // Add all the project root paths as potential source locations the Java debugger server should
  // check for resolving source.
  // NOTE: the Java debug server will just ignore any directory path that doesn't exist.
  atom.project.getPaths().forEach(path => {
    if (remote && (_nuclideUri || _load_nuclideUri()).default.isRemote(path) || !remote && (_nuclideUri || _load_nuclideUri()).default.isLocal(path)) {
      const translatedPath = remote ? (_nuclideUri || _load_nuclideUri()).default.getPath(path) : path;
      searchPaths.push(translatedPath);

      if (_sourcePathsService != null) {
        _sourcePathsService.addKnownJavaSubdirectoryPaths(remote, translatedPath, searchPaths);
      }
    }
  });

  return searchPaths;
}

function getSavedPathsFromConfig() {
  const paths = (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-java.sourceFilePaths');
  // flowlint-next-line sketchy-null-mixed:off
  if (paths && typeof paths === 'string') {
    return paths.split(';');
  } else {
    (_featureConfig || _load_featureConfig()).default.set('nuclide-debugger-java.sourceFilePaths', '');
  }
  return [];
}

function persistSourcePathsToConfig(newSourcePaths) {
  (_featureConfig || _load_featureConfig()).default.set('nuclide-debugger-java.sourceFilePaths', newSourcePaths.join(';'));
}

function getDialogValues(clickEvents) {
  let userSourcePaths = getSavedPathsFromConfig();
  return clickEvents.switchMap(() => {
    return _rxjsBundlesRxMinJs.Observable.create(observer => {
      const modalDisposable = (0, (_showModal || _load_showModal()).default)(({ dismiss }) => _react.createElement((_SourceFilePathsModal || _load_SourceFilePathsModal()).SourceFilePathsModal, {
        initialSourcePaths: userSourcePaths,
        sourcePathsChanged: newPaths => {
          userSourcePaths = newPaths;
          persistSourcePathsToConfig(newPaths);
          observer.next(newPaths);
        },
        onClosed: dismiss
      }), { className: 'sourcepath-modal-container' });

      (0, (_analytics || _load_analytics()).track)('fb-java-debugger-source-dialog-shown');
      return () => {
        modalDisposable.dispose();
      };
    });
  });
}

function getSourcePathString(searchPaths) {
  return searchPaths.join(';');
}

function getSourcePathClickSubscriptionsOnVspInstance(targetUri, vspInstance, clickEvents) {
  const defaultValues = getDefaultSourceSearchPaths(targetUri);
  return [getDialogValues(clickEvents).startWith(getSavedPathsFromConfig()).subscribe(userValues => {
    vspInstance.customRequest('setSourcePath', {
      sourcePath: getSourcePathString(defaultValues.concat(userValues))
    });
  }), clickEvents];
}

function getSourcePathClickSubscriptions(targetUri, debugSession, clickEvents, additionalSourcePaths = []) {
  const defaultValues = getDefaultSourceSearchPaths(targetUri).concat(additionalSourcePaths);
  return [getDialogValues(clickEvents).startWith(getSavedPathsFromConfig()).subscribe(userValues => {
    debugSession.custom('setSourcePath', {
      sourcePath: getSourcePathString(defaultValues.concat(userValues))
    });
  }), clickEvents];
}

async function resolveConfiguration(configuration) {
  const { adapterExecutable, targetUri } = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }

  const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  const clickEvents = new _rxjsBundlesRxMinJs.Subject();
  const customDisposable = configuration.customDisposable || new (_UniversalDisposable || _load_UniversalDisposable()).default();
  customDisposable.add(subscriptions);

  const javaAdapterExecutable = await getJavaDebuggerHelpersServiceByNuclideUri(targetUri).getJavaVSAdapterExecutableInfo(false);
  return Object.assign({}, configuration, {
    customControlButtons: getCustomControlButtonsForJavaSourcePaths(clickEvents),
    adapterExecutable: javaAdapterExecutable,
    customDisposable,
    onInitializeCallback: async session => {
      customDisposable.add(...getSourcePathClickSubscriptions(targetUri, session, clickEvents));
    }
  });
}

function setSourcePathsService(sourcePathsService) {
  _sourcePathsService = sourcePathsService;
}

function setRpcService(rpcService) {
  _rpcService = rpcService;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _rpcService = null;
  });
}

function getJavaDebuggerHelpersServiceByNuclideUri(uri) {
  if (_rpcService == null && !(_nuclideUri || _load_nuclideUri()).default.isRemote(uri)) {
    return _JavaDebuggerHelpersService || _load_JavaDebuggerHelpersService();
  }

  return (0, (_nullthrows || _load_nullthrows()).default)(_rpcService).getServiceByNuclideUri('JavaDebuggerHelpersService', uri);
}