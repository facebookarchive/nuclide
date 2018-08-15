"use strict";

function _createUtmUrl() {
  const data = _interopRequireDefault(require("./createUtmUrl"));

  _createUtmUrl = function () {
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

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _viewableFromReactElement() {
  const data = require("../../commons-atom/viewableFromReactElement");

  _viewableFromReactElement = function () {
    return data;
  };

  return data;
}

function _HomePaneItem() {
  const data = _interopRequireWildcard(require("./HomePaneItem"));

  _HomePaneItem = function () {
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

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

var _electron = require("electron");

function _passesGK() {
  const data = _interopRequireDefault(require("../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const SHOW_NUCLIDE_ONBOARDING_GATEKEEPER = 'nuclide_onboarding';

class Activation {
  // A stream of all of the fragments. This is essentially the state of our panel.
  constructor(state) {
    this._allHomeFragmentsStream = new _RxMin.BehaviorSubject(Immutable().Set());
    this._subscriptions = this._registerCommandAndOpener();

    this._considerDisplayingHome();

    this._subscriptions.add( // eslint-disable-next-line nuclide-internal/atom-apis
    atom.commands.add('atom-workspace', 'nuclide-home:open-docs', e => {
      const url = (0, _createUtmUrl().default)('https://nuclide.io/docs', 'help');

      _electron.shell.openExternal(url);
    }));
  }

  setHomeFragments(homeFragments) {
    this._allHomeFragmentsStream.next(this._allHomeFragmentsStream.getValue().add(homeFragments));

    return new (_UniversalDisposable().default)(() => {
      this._allHomeFragmentsStream.next(this._allHomeFragmentsStream.getValue().remove(homeFragments));
    });
  }

  dispose() {
    this._allHomeFragmentsStream.next(Immutable().Set());

    this._subscriptions.dispose();
  }

  async _considerDisplayingHome() {
    const showHome = _featureConfig().default.get('nuclide-home.showHome') && (await !(0, _passesGK().default)(SHOW_NUCLIDE_ONBOARDING_GATEKEEPER)); // flowlint-next-line sketchy-null-mixed:off

    if (showHome) {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(_HomePaneItem().WORKSPACE_VIEW_URI, {
        searchAllPanes: true
      });
    }
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _HomePaneItem().WORKSPACE_VIEW_URI) {
        return (0, _viewableFromReactElement().viewableFromReactElement)(React.createElement(_HomePaneItem().default, {
          allHomeFragmentsStream: this._allHomeFragmentsStream
        }));
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _HomePaneItem().default), atom.commands.add('atom-workspace', 'nuclide-home:toggle', () => {
      atom.workspace.toggle(_HomePaneItem().WORKSPACE_VIEW_URI);
    }), atom.commands.add('atom-workspace', 'nuclide-docs:open', () => {
      _electron.shell.openExternal('https://nuclide.io/');
    }));
  }

}

(0, _createPackage().default)(module.exports, Activation);