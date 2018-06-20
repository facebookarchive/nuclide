'use strict';

var _createUtmUrl;

function _load_createUtmUrl() {
  return _createUtmUrl = _interopRequireDefault(require('./createUtmUrl'));
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _viewableFromReactElement;

function _load_viewableFromReactElement() {
  return _viewableFromReactElement = require('../../commons-atom/viewableFromReactElement');
}

var _HomePaneItem;

function _load_HomePaneItem() {
  return _HomePaneItem = _interopRequireDefault(require('./HomePaneItem'));
}

var _HomePaneItem2;

function _load_HomePaneItem2() {
  return _HomePaneItem2 = require('./HomePaneItem');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _destroyItemWhere;

function _load_destroyItemWhere() {
  return _destroyItemWhere = require('../../../modules/nuclide-commons-atom/destroyItemWhere');
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _electron = require('electron');

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SHOW_NUCLIDE_ONBOARDING_GATEKEEPER = 'nuclide_onboarding'; /**
                                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                                  * All rights reserved.
                                                                  *
                                                                  * This source code is licensed under the license found in the LICENSE file in
                                                                  * the root directory of this source tree.
                                                                  *
                                                                  * 
                                                                  * @format
                                                                  */

class Activation {
  // A stream of all of the fragments. This is essentially the state of our panel.
  constructor(state) {
    this._allHomeFragmentsStream = new _rxjsBundlesRxMinJs.BehaviorSubject((_immutable || _load_immutable()).Set());

    this._subscriptions = this._registerCommandAndOpener();
    this._considerDisplayingHome();
    this._subscriptions.add(
    // eslint-disable-next-line nuclide-internal/atom-apis
    atom.commands.add('atom-workspace', 'nuclide-home:open-docs', e => {
      const url = (0, (_createUtmUrl || _load_createUtmUrl()).default)('https://nuclide.io/docs', 'help');
      _electron.shell.openExternal(url);
    }));
  }

  setHomeFragments(homeFragments) {
    this._allHomeFragmentsStream.next(this._allHomeFragmentsStream.getValue().add(homeFragments));
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._allHomeFragmentsStream.next(this._allHomeFragmentsStream.getValue().remove(homeFragments));
    });
  }

  dispose() {
    this._allHomeFragmentsStream.next((_immutable || _load_immutable()).Set());
    this._subscriptions.dispose();
  }

  async _considerDisplayingHome() {
    const showHome = (_featureConfig || _load_featureConfig()).default.get('nuclide-home.showHome') && (await !(0, (_passesGK || _load_passesGK()).default)(SHOW_NUCLIDE_ONBOARDING_GATEKEEPER));

    // flowlint-next-line sketchy-null-mixed:off
    if (showHome) {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open((_HomePaneItem2 || _load_HomePaneItem2()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
    }
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(atom.workspace.addOpener(uri => {
      if (uri === (_HomePaneItem2 || _load_HomePaneItem2()).WORKSPACE_VIEW_URI) {
        return (0, (_viewableFromReactElement || _load_viewableFromReactElement()).viewableFromReactElement)(_react.createElement((_HomePaneItem || _load_HomePaneItem()).default, {
          allHomeFragmentsStream: this._allHomeFragmentsStream
        }));
      }
    }), () => (0, (_destroyItemWhere || _load_destroyItemWhere()).destroyItemWhere)(item => item instanceof (_HomePaneItem || _load_HomePaneItem()).default), atom.commands.add('atom-workspace', 'nuclide-home:toggle', () => {
      atom.workspace.toggle((_HomePaneItem2 || _load_HomePaneItem2()).WORKSPACE_VIEW_URI);
    }), atom.commands.add('atom-workspace', 'nuclide-docs:open', () => {
      _electron.shell.openExternal('https://nuclide.io/');
    }));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);