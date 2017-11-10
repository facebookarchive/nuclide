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

import * as React from 'react';
import RelayFBEnvironment from '../commons-atom/fb-relay-environment';
import {QueryRenderer} from '../commons-atom/fb-relay-modern';
import {LoadingSpinner} from 'nuclide-commons-ui/LoadingSpinner';

type Props = {
  render: (props: any) => React.Node,
  query: string,
  variables?: any,
};

export default class QueryRendererWrapper extends React.Component<Props> {
  render(): React.Node {
    const {render, ...queryProps} = this.props;

    return (
      <QueryRenderer
        environment={RelayFBEnvironment}
        {...queryProps}
        render={({error, props}) => {
          if (error != null) {
            atom.notifications.addError(
              'Sorry, there was an issue loading the results.',
              {
                dismissable: true,
                detail: error.message,
              },
            );
            return null;
          } else if (props != null) {
            return render(props);
          }
          return <LoadingSpinner className="nuclide-relay-renderer-spinner" />;
        }}
      />
    );
  }
}
