'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GadgetsService} from '../../gadgets-interfaces';
import type {HomeFragments} from '../../home-interfaces';

const {CompositeDisposable, Disposable} = require('atom');
const featureConfig = require('../../feature-config');
const Immutable = require('immutable');
const Rx = require('rx');

let disposables: ?CompositeDisposable = null;
let gadgetsApi: ?GadgetsService = null;

// A stream of all of the fragments. This is essentially the state of our panel.
const allHomeFragmentsStream: Rx.BehaviorSubject<Immutable.Set<HomeFragments>> =
  new Rx.BehaviorSubject(Immutable.Set());

function activate(): void {
  considerDisplayingHome();
}

function setHomeFragments(homeFragments: HomeFragments): Disposable {
  allHomeFragmentsStream.onNext(allHomeFragmentsStream.getValue().add(homeFragments));
  return new Disposable(() => {
    allHomeFragmentsStream.onNext(allHomeFragmentsStream.getValue().remove(homeFragments));
  });
}

function considerDisplayingHome() {
  if (gadgetsApi == null) {
    return;
  }
  const showHome = featureConfig.get('nuclide-home.showHome');
  if (showHome) {
    gadgetsApi.showGadget('nuclide-home');
  }
}

function deactivate(): void {
  gadgetsApi = null;
  allHomeFragmentsStream.onNext(Immutable.Set());
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
}

function consumeGadgetsService(api: GadgetsService): IDisposable {
  const createHomePaneItem = require('./createHomePaneItem');
  gadgetsApi = api;
  const gadget = createHomePaneItem(allHomeFragmentsStream);
  const disposable = api.registerGadget(gadget);
  considerDisplayingHome();
  return disposable;
}

module.exports = {
  activate,
  setHomeFragments,
  deactivate,
  consumeGadgetsService,
};
