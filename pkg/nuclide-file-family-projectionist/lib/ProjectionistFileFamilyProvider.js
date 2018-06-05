'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideProjectionist;

function _load_nuclideProjectionist() {
  return _nuclideProjectionist = _interopRequireDefault(require('../../nuclide-projectionist'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ProjectionistFileFamilyProvider {

  constructor(cwdApis) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(cwdApis.switchMap(cwdApi => cwdApi == null ? _rxjsBundlesRxMinJs.Observable.of(null) : (0, (_event || _load_event()).observableFromSubscribeFunction)(cwdApi.observeCwd.bind(cwdApi))).switchMap(cwd => {
      if (cwd == null) {
        return _rxjsBundlesRxMinJs.Observable.of([null, null]);
      }

      return Promise.all([(0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(cwd), cwd]);
    }).switchMap(([fsService, cwd]) => {
      if (fsService == null || cwd == null) {
        return _rxjsBundlesRxMinJs.Observable.of([null, null, null]);
      }

      return Promise.all([fsService.findNearestAncestorNamed('.projections.json', cwd), fsService, cwd]);
    }).switchMap(([configPath, fsService, cwd]) => configPath == null || fsService == null ? _rxjsBundlesRxMinJs.Observable.of([null, cwd]) : Promise.all([fsService.readFile(configPath), cwd])).subscribe(([rulesStr, cwd]) => {
      if (rulesStr != null) {
        let rules;
        try {
          rules = JSON.parse(rulesStr.toString());
        } catch (e) {}
        if (rules != null) {
          this._projectionist = new (_nuclideProjectionist || _load_nuclideProjectionist()).default(rules);
        }
      }
      this._cwd = cwd;
    }));
  }

  async getRelatedFiles(path) {
    const projectionist = this._projectionist;
    const cwd = this._cwd;
    if (projectionist == null || cwd == null) {
      return {
        files: new Map(),
        relations: []
      };
    }

    const alternates = projectionist.getAlternates((_nuclideUri || _load_nuclideUri()).default.relative(cwd, path));

    const files = new Map([[path, { labels: new Set() }], ...alternates.map(alternate => {
      const type = projectionist.getType(alternate);
      return [(_nuclideUri || _load_nuclideUri()).default.resolve(cwd, alternate), {
        labels: type == null ? new Set() : new Set([type])
      }];
    })]);

    const relations = alternates.map(alternate => {
      const labels = new Set(['alternate']);
      const type = projectionist.getType(alternate);
      if (type != null) {
        labels.add(type);
      }
      return {
        from: path,
        to: (_nuclideUri || _load_nuclideUri()).default.resolve(cwd, alternate),
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
exports.default = ProjectionistFileFamilyProvider; /**
                                                    * Copyright (c) 2015-present, Facebook, Inc.
                                                    * All rights reserved.
                                                    *
                                                    * This source code is licensed under the license found in the LICENSE file in
                                                    * the root directory of this source tree.
                                                    *
                                                    *  strict-local
                                                    * @format
                                                    */