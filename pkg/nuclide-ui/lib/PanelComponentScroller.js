'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';

type Props = {
  children: React.Element;
  overflowX: ?string;
};

export const PanelComponentScroller = (props: Props): React.Element => {
  const style = (props.overflowX == null) ? null : {overflowX: props.overflowX};
  return (
    <div className="nuclide-ui-panel-component-scroller" style={style}>
      {props.children}
    </div>
  );
};
