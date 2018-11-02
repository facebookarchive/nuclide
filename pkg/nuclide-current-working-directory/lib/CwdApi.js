"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _memoize2() {
  const data = _interopRequireDefault(require("lodash/memoize"));

  _memoize2 = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
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

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function FileTreeHelpers() {
  const data = _interopRequireWildcard(require("../../nuclide-file-tree/lib/FileTreeHelpers"));

  FileTreeHelpers = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
class CwdApi {
  constructor(initialPath) {
    this._disposed = new _rxjsCompatUmdMin.ReplaySubject(1);
    this._getPaths = (0, _memoize2().default)(() => {
      // Since adding and removing projects can affect the validity of cwdPath, we need to re-query
      // every time it happens.
      const projectPathChanges = (0, _event().observableFromSubscribeFunction)(cb => atom.project.onDidChangePaths(cb)).mapTo(null).share();
      return _rxjsCompatUmdMin.Observable.merge(this._explicitlySetPaths, projectPathChanges).map(() => this.getCwd()).distinctUntilChanged().takeUntil(this._disposed);
    });
    this._explicitlySetPaths = new _rxjsCompatUmdMin.BehaviorSubject(initialPath);
  }

  setCwd(path) {
    if (getDirectory(path) == null) {
      throw new Error(`Path does not belong to a project root: ${path}`);
    }

    this._explicitlySetPaths.next(path);
  }

  observeCwd(callback) {
    return new (_UniversalDisposable().default)(this._getPaths().subscribe(path => {
      callback(path);
    }));
  }

  dispose() {
    this._disposed.next();
  }
  /**
   * Create an observable that represents the CWD path changes.
   */


  _getDefaultPath() {
    for (const directory of atom.project.getDirectories()) {
      if (isValidDirectory(directory)) {
        return directory.getPath();
      }
    }

    return null;
  }

  getCwd() {
    if (isValidDirectoryPath(this._explicitlySetPaths.getValue())) {
      return this._explicitlySetPaths.getValue();
    } else if (isValidDirectoryPath(this._getDefaultPath())) {
      return this._getDefaultPath();
    }

    return null;
  }

}

exports.default = CwdApi;

function getDirectory(path) {
  if (path == null) {
    return null;
  }

  for (const directory of atom.project.getDirectories()) {
    if (!isValidDirectory(directory)) {
      continue;
    }

    const dirPath = directory.getPath();

    if (_nuclideUri().default.contains(dirPath, path)) {
      const relative = _nuclideUri().default.relative(dirPath, path);

      return directory.getSubdirectory(relative);
    }
  }
}

function isValidDirectoryPath(path) {
  return getDirectory(path) != null;
}

function isValidDirectory(directory) {
  if (directory == null) {
    return true;
  }

  return FileTreeHelpers().isValidDirectory(directory);
}