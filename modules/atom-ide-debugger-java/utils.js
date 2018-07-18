"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
exports.NUCLIDE_DEBUGGER_DEV_GK = void 0;

function _featureConfig() {
  const data = _interopRequireDefault(require("../nuclide-commons-atom/feature-config"));

  _featureConfig = function () {
    return data;
  };

  return data;
}

function _showModal() {
  const data = _interopRequireDefault(require("../nuclide-commons-ui/showModal"));

  _showModal = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

var React = _interopRequireWildcard(require("react"));

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../nuclide-debugger-common/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function JavaDebuggerHelpersServiceLocal() {
  const data = _interopRequireWildcard(require("./JavaDebuggerHelpersService"));

  JavaDebuggerHelpersServiceLocal = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _SourceFilePathsModal() {
  const data = require("./SourceFilePathsModal");

  _SourceFilePathsModal = function () {
    return data;
  };

  return data;
}

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';
exports.NUCLIDE_DEBUGGER_DEV_GK = NUCLIDE_DEBUGGER_DEV_GK;

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
      vsAdapterType: _constants().VsAdapterTypes.JAVA,
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
      vsAdapterType: _constants().VsAdapterTypes.JAVA,
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

  const remote = _nuclideUri().default.isRemote(targetUri); // Add all the project root paths as potential source locations the Java debugger server should
  // check for resolving source.
  // NOTE: the Java debug server will just ignore any directory path that doesn't exist.


  atom.project.getPaths().forEach(path => {
    if (remote && _nuclideUri().default.isRemote(path) || !remote && _nuclideUri().default.isLocal(path)) {
      const translatedPath = remote ? _nuclideUri().default.getPath(path) : path;
      searchPaths.push(translatedPath);

      if (_sourcePathsService != null) {
        _sourcePathsService.addKnownJavaSubdirectoryPaths(remote, translatedPath, searchPaths);
      }
    }
  });
  return searchPaths;
}

function getSavedPathsFromConfig() {
  const paths = _featureConfig().default.get('nuclide-debugger-java.sourceFilePaths'); // flowlint-next-line sketchy-null-mixed:off


  if (paths && typeof paths === 'string') {
    return paths.split(';');
  } else {
    _featureConfig().default.set('nuclide-debugger-java.sourceFilePaths', '');
  }

  return [];
}

function persistSourcePathsToConfig(newSourcePaths) {
  _featureConfig().default.set('nuclide-debugger-java.sourceFilePaths', newSourcePaths.join(';'));
}

function getDialogValues(clickEvents) {
  let userSourcePaths = getSavedPathsFromConfig();
  return clickEvents.switchMap(() => {
    return _RxMin.Observable.create(observer => {
      const modalDisposable = (0, _showModal().default)(({
        dismiss
      }) => React.createElement(_SourceFilePathsModal().SourceFilePathsModal, {
        initialSourcePaths: userSourcePaths,
        sourcePathsChanged: newPaths => {
          userSourcePaths = newPaths;
          persistSourcePathsToConfig(newPaths);
          observer.next(newPaths);
        },
        onClosed: dismiss
      }), {
        className: 'sourcepath-modal-container'
      });
      (0, _analytics().track)('fb-java-debugger-source-dialog-shown');
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
  const {
    adapterExecutable,
    targetUri
  } = configuration;

  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }

  const subscriptions = new (_UniversalDisposable().default)();
  const clickEvents = new _RxMin.Subject();
  const customDisposable = configuration.customDisposable || new (_UniversalDisposable().default)();
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
  return new (_UniversalDisposable().default)(() => {
    _rpcService = null;
  });
}

function getJavaDebuggerHelpersServiceByNuclideUri(uri) {
  if (_rpcService == null && !_nuclideUri().default.isRemote(uri)) {
    return JavaDebuggerHelpersServiceLocal();
  }

  return (0, _nullthrows().default)(_rpcService).getServiceByNuclideUri('JavaDebuggerHelpersService', uri);
}