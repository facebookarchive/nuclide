"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _nuclideProjectionist() {
  const data = _interopRequireDefault(require("../../nuclide-projectionist"));

  _nuclideProjectionist = function () {
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
class ProjectionistFileFamilyProvider {
  constructor(cwdApis) {
    this._disposables = new (_UniversalDisposable().default)(cwdApis.switchMap(cwdApi => cwdApi == null ? _RxMin.Observable.of(null) : (0, _event().observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi))).switchMap(cwd => {
      if (cwd == null) {
        return _RxMin.Observable.of([null, null]);
      }

      return Promise.all([(0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(cwd), cwd]);
    }).switchMap(([fsService, cwd]) => {
      if (fsService == null || cwd == null) {
        return _RxMin.Observable.of([null, null, null]);
      }

      return Promise.all([fsService.findNearestAncestorNamed('.projections.json', cwd), fsService, cwd]);
    }).switchMap(([configPath, fsService, cwd]) => configPath == null || fsService == null ? _RxMin.Observable.of([null, cwd]) : Promise.all([fsService.readFile(configPath), cwd])).subscribe(([rulesStr, cwd]) => {
      if (rulesStr != null) {
        let rules;

        try {
          rules = JSON.parse(rulesStr.toString());
        } catch (e) {}

        if (rules != null) {
          this._projectionist = new (_nuclideProjectionist().default)(rules);
        }
      }

      this._cwd = cwd;
    }));
  }

  async getRelatedFiles(path) {
    const projectionist = this._projectionist;
    const cwd = this._cwd;

    if (projectionist == null || cwd == null || !_nuclideUri().default.contains(cwd, path)) {
      return {
        files: new Map(),
        relations: []
      };
    }

    const alternates = await Promise.all(projectionist.getAlternates(_nuclideUri().default.relative(cwd, path)).map(async uri => {
      const fullUri = _nuclideUri().default.join(cwd, uri);

      const fsService = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(fullUri);
      return {
        uri,
        exists: await fsService.exists(fullUri)
      };
    }));
    const files = new Map([[path, {
      labels: new Set()
    }], ...alternates.map(({
      uri,
      exists
    }) => {
      const type = projectionist.getType(uri);
      return [_nuclideUri().default.resolve(cwd, uri), {
        labels: type == null ? new Set() : new Set([type]),
        exists
      }];
    })]);
    const relations = alternates.map(({
      uri
    }) => {
      const labels = new Set(['alternate']);
      const type = projectionist.getType(uri);

      if (type != null) {
        labels.add(type);
      }

      return {
        from: path,
        to: _nuclideUri().default.resolve(cwd, uri),
        labels,
        directed: true
      };
    });
    return {
      files,
      relations
    };
  }

}

exports.default = ProjectionistFileFamilyProvider;