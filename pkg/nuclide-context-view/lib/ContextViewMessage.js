'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * A message view to be shown in Context View.
 */

import {React} from 'react-for-atom';
import {Button} from '../../nuclide-ui/lib/Button';

export default class ContextViewMessage extends React.Component {
  static NO_DEFINITION = 'No definition selected.';
  static LOADING = 'Loading...';
  static NOT_LOGGED_IN = (
    <div>
      <div>You need to log in to see this data!</div>
      <Button className="pull-right" onClick={showLoginModal}>Log in</Button>
    </div>
  );

  props: {
    message: string | React.Element<any>,
  };

  render(): React.Element<any> {
    return <div>{this.props.message}</div>;
  }
}

function showLoginModal(): void {
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'fb-login:login-logout',
  );
}
