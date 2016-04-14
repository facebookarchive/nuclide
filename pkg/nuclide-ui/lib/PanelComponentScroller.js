'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import classnames from 'classnames';
import {React} from 'react-for-atom';

type Props = {
  children: React.Element;
  flexDirection?: 'column';
  overflowX?: string;
};

export const PanelComponentScroller = (props: Props): React.Element => {
  const style = (props.overflowX == null) ? null : {overflowX: props.overflowX};
  const className = classnames('nuclide-ui-panel-component-scroller', {
    'nuclide-ui-panel-component-scroller--column': (props.flexDirection === 'column'),
  });

  return (
    <div className={className} style={style}>
      {props.children}
    </div>
  );
};
