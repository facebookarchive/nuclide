'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget} from '../../nuclide-gadgets-interfaces';
import type {HomeFragments} from '../../nuclide-home-interfaces';
import type Rx from '@reactivex/rxjs';

const Immutable = require('immutable');
const {React} = require('react-for-atom');
const HomeFeatureComponent = require('./HomeFeatureComponent');
const NuclideLogo = require('./NuclideLogo');

const featureConfig = require('../../nuclide-feature-config');

const DEFAULT_WELCOME = (
  <div>
    <p>
      Thanks for trying Nuclide, Facebook's
      <br />
      unified developer environment.
    </p>
    <p>
      We would love your feedback and contributions to continue to make it better. Please
      raise issues and pull-requests directly on
      our <a href="https://github.com/facebook/nuclide">GitHub repo</a>.
    </p>
    <p>
      Thank you!
    </p>
  </div>
);

/**
 * Create a HomePaneItem component class that's bound to the provided stream of home fragments.
 */
function createHomePaneItem(
  allHomeFragmentsStream: Rx.Observable<Immutable.Set<HomeFragments>>,
): Gadget {

  class HomePaneItem extends React.Component {

    static gadgetId = 'nuclide-home';

    state: {
      allHomeFragments: Immutable.Set<string, ReactElement>;
    };

    _homeFragmentsSubscription: rx$ISubscription;

    constructor(...args) {
      super(...args);
      this.state = {
        allHomeFragments: Immutable.Set(),
      };
    }

    componentDidMount() {
      this._homeFragmentsSubscription = allHomeFragmentsStream.subscribe(
        allHomeFragments => this.setState({allHomeFragments}),
      );

      featureConfig.set('nuclide-home.showHome', true);
    }

    render() {
      const welcomes = [];
      const features = [];
      const sortedHomeFragments = Array.from(this.state.allHomeFragments).sort(
        (fragmentA, fragmentB) => (fragmentB.priority || 0) - (fragmentA.priority || 0)
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

  return ((HomePaneItem: any): Gadget);
}

module.exports = createHomePaneItem;
