/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {OnboardingFragments} from './types';

import createUtmUrl from './createUtmUrl';
import featureConfig from 'nuclide-commons-atom/feature-config';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import OnboardingPaneItem, {WORKSPACE_VIEW_URI} from './OnboardingPaneItem';
import * as Immutable from 'immutable';
import createPackage from 'nuclide-commons-atom/createPackage';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import * as React from 'react';
import {BehaviorSubject} from 'rxjs';
import {shell} from 'electron';

class Activation {
  // A stream of all of the fragments. This is essentially the state of our panel.
  _allOnboardingFragmentsStream: BehaviorSubject<
    Immutable.Set<OnboardingFragments>,
  > = new BehaviorSubject(Immutable.Set());

  _subscriptions: UniversalDisposable;

  constructor(state: ?Object) {
    this._subscriptions = this._registerCommandAndOpener();
    this._considerDisplayingOnboarding();
    this._subscriptions.add(
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.commands.add('atom-workspace', 'nuclide-onboarding:open-docs', e => {
        const url = createUtmUrl('https://nuclide.io/docs', 'help');
        shell.openExternal(url);
      }),
    );
  }

  setOnboardingFragments(
    onboardingFragments: OnboardingFragments,
  ): UniversalDisposable {
    this._allOnboardingFragmentsStream.next(
      this._allOnboardingFragmentsStream.getValue().add(onboardingFragments),
    );
    return new UniversalDisposable(() => {
      this._allOnboardingFragmentsStream.next(
        this._allOnboardingFragmentsStream
          .getValue()
          .remove(onboardingFragments),
      );
    });
  }

  dispose(): void {
    this._allOnboardingFragmentsStream.next(Immutable.Set());
    this._subscriptions.dispose();
  }

  _considerDisplayingOnboarding() {
    const showOnboarding = featureConfig.get(
      'nuclide-onboarding.showOnboarding',
    );
    // flowlint-next-line sketchy-null-mixed:off
    if (showOnboarding) {
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(WORKSPACE_VIEW_URI, {searchAllPanes: true});
    }
  }

  _registerCommandAndOpener(): UniversalDisposable {
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return viewableFromReactElement(
            <OnboardingPaneItem
              allOnboardingFragmentsStream={this._allOnboardingFragmentsStream}
            />,
          );
        }
      }),
      () => destroyItemWhere(item => item instanceof OnboardingPaneItem),
      atom.commands.add('atom-workspace', 'nuclide-onboarding:toggle', () => {
        atom.workspace.toggle(WORKSPACE_VIEW_URI);
      }),
      atom.commands.add('atom-workspace', 'nuclide-docs:open', () => {
        shell.openExternal('https://nuclide.io/');
      }),
    );
  }
}

createPackage(module.exports, Activation);
