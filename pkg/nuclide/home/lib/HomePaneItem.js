'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var React = require('react-for-atom');

class HomePaneItem extends HTMLElement {

  uri: string;

  initialize(uri: string): HomePaneItem {
    this.uri = uri;
    // Re-use styles from the Atom welcome pane where possible.
    this.className = 'welcome pane-item padded';
    atom.config.set('nuclide-home.showHome', true);

    var home = (
      <div className="welcome-container">
        <header className="welcome-header">
          <div className="nuclide-home-logo" />
          <h1 className="welcome-title">Welcome to Nuclide</h1>
        </header>

        <section className="welcome-panel text-center">
          <p>
            Thanks for choosing and using Nuclide, Facebook's unified developer environment.
            We hope you enjoy using it as much as we enjoy building it.
          </p>

          <p>
            We would love your feedback and contributions to continue to make it better. Please
            raise issues and pull-requests directly on
            our <a href="https://github.com/facebook/nuclide">GitHub repo</a>. Thank you!
          </p>
        </section>
      </div>
    );

    React.render(home, this);
    return this;
  }

  getTitle(): string {
    return 'Home';
  }

  getIconName(): string {
    return 'home';
  }

  getURI(): string {
    return this.uri;
  }

  // Return false to prevent the tab getting split (since we only update a singleton health pane).
  copy() {
    return false;
  }

  destroy(): void {
    React.unmountComponentAtNode(this);
    atom.config.set('nuclide-home.showHome', false);
  }

  serialize() {
    return {
      deserializer: 'HomePaneItem',
      uri: this.getURI(),
    };
  }
}

module.exports = HomePaneItem = document.registerElement(
  'nuclide-home-item',
  {prototype: HomePaneItem.prototype},
);
