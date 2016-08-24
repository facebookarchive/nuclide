'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from './types';
import type {BehaviorSubject} from 'rxjs';

import Immutable from 'immutable';
import {React} from 'react-for-atom';
import HomeFeatureComponent from './HomeFeatureComponent';
import NuclideLogo from './NuclideLogo';
import createUtmUrl from './createUtmUrl';
import featureConfig from '../../commons-atom/featureConfig';

const NUCLIDE_DOCS_URL = createUtmUrl('http://nuclide.io', 'welcome');
const DEFAULT_WELCOME = (
  <div>
    <p>
      Thanks for trying Nuclide, Facebook's
      <br />
      unified developer environment.
    </p>
    <ul className="text-left">
      <li>
        <a href={NUCLIDE_DOCS_URL}>Get Started!</a> In-depth docs on our features.
      </li>
      <li>
        <a href="https://github.com/facebook/nuclide">GitHub</a> Pull requests, issues, and feedback.
      </li>
    </ul>
    <p>
      We hope you enjoy using Nuclide
      <br />
      at least as much as we enjoy building it.
    </p>
  </div>
);

type Props = {
  allHomeFragmentsStream: BehaviorSubject<Immutable.Set<HomeFragments>>,
};

export default class HomePaneItem extends React.Component {
  props: Props;
  state: {
    allHomeFragments: Immutable.Set<string, React.Element<any>>,
  };

  _homeFragmentsSubscription: rx$ISubscription;

  constructor(props: Props) {
    super(props);
    this.state = {
      allHomeFragments: Immutable.Set(),
    };
  }

  componentDidMount() {
    // Note: We're assuming that the allHomeFragmentsStream prop never changes.
    this._homeFragmentsSubscription = this.props.allHomeFragmentsStream.subscribe(
      allHomeFragments => this.setState({allHomeFragments}),
    );

    featureConfig.set('nuclide-home.showHome', true);
  }

  render() {
    const welcomes = [];
    const features = [];
    const sortedHomeFragments = Array.from(this.state.allHomeFragments).sort(
      (fragmentA, fragmentB) => (fragmentB.priority || 0) - (fragmentA.priority || 0),
    );
    sortedHomeFragments.forEach(fragment => {
      const {welcome, feature} = fragment;
      if (welcome) {
        welcomes.push(<div key={welcomes.length}>{welcome}</div>);
      }
      if (feature) {
        features.push(<HomeFeatureComponent key={features.length} {...feature} />);
      }
    });

    const containers = [
      <div key="welcome" className="nuclide-home-container">
        <section className="text-center">
          <NuclideLogo className="nuclide-home-logo" />
          <h1 className="nuclide-home-title">Welcome to Nuclide</h1>
        </section>
        <section className="text-center">
          {welcomes.length > 0 ? welcomes : DEFAULT_WELCOME}
        </section>
      </div>,
    ];

    if (features.length > 0) {
      containers.push(<div key="features" className="nuclide-home-container">{features}</div>);
    }

    return (
      // Re-use styles from the Atom welcome pane where possible.
      <div className="nuclide-home pane-item padded nuclide-home-containers">
        {containers}
      </div>
    );
  }

  getTitle(): string {
    return 'Home';
  }

  getIconName(): string {
    return 'home';
  }

  // Return false to prevent the tab getting split (since we only update a singleton health pane).
  copy() {
    return false;
  }

  componentWillUnmount() {
    featureConfig.set('nuclide-home.showHome', false);

    if (this._homeFragmentsSubscription) {
      this._homeFragmentsSubscription.unsubscribe();
    }
  }

}
