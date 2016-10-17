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
import {PanelComponent} from '../../nuclide-ui/PanelComponent';
import {Button} from '../../nuclide-ui/Button';
import {Icon} from '../../nuclide-ui/Icon';

type Props = {
  initialWidth: number,
  onHide: () => void,
  onResize: (newWidth: number) => void,
  locked: boolean,
  children?: React.Element<any>,
};

/**
 * The Atom panel containing context provider views. This is the sidebar that
 * is rendered in the atom workspace.
 */
export const ContextViewPanel = (props: Props) => {
  return (
    <PanelComponent
    dock="right"
    initialLength={props.initialWidth}
    noScroll
    onResize={props.onResize}>
      <div style={{display: 'flex', flexDirection: 'column', width: '100%'}}>
        <Header onHide={props.onHide} locked={props.locked} />
        <div className="nuclide-context-view-content">
          <p>
            Click on a symbol to see more information about it.
          </p>
          {props.children}
        </div>
      </div>
    </PanelComponent>
  );
};


type HeaderProps = {
  onHide: () => void,
  locked: boolean,
};

const Header = (props: HeaderProps) => {
  return (
    <div className="panel-heading" style={{flexShrink: 0}}>
      <h4>
        <span>Context View</span>
        <div className="pull-right">
          {props.locked ? <Icon icon="lock" /> : null}
          <Button icon="x" onClick={props.onHide} title="Hide context view" />
        </div>
      </h4>
    </div>
  );
};
