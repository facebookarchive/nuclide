'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NavigationStackController} from './NavigationStackController';

import {React, ReactDOM} from 'react-for-atom';
import {Disposable} from 'atom';
import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import {Block} from '../../nuclide-ui/lib/Block';

// Since this is a button which can change the current file, place it where
// it won't change position when the current file name changes, which means way left.
const STATUS_BAR_PRIORITY = -100;

export function consumeStatusBar(
  statusBar: atom$StatusBar,
  controller: NavigationStackController,
): IDisposable {
  const item = document.createElement('div');
  item.className = 'inline-block';

  const statusBarTile = statusBar.addLeftTile({
    item,
    priority: STATUS_BAR_PRIORITY,
  });

  const navigateBack = () => controller.navigateBackwards();
  const navigateForward = () => controller.navigateForwards();

  ReactDOM.render(
    <NavStackStatusBarTile
      enableBack={true}
      enableForward={true}
      onBack={navigateBack}
      onForward={navigateForward}
    />,
    item,
  );
  return new Disposable(() => {
    ReactDOM.unmountComponentAtNode(item);
    statusBarTile.destroy();
  });
}

type Props = {
  enableBack: boolean,
  enableForward: boolean,
  onBack: () => mixed,
  onForward: () => mixed,
};

export function NavStackStatusBarTile(props: Props): React.Element<any> {
  return <Block>
      <ButtonGroup>
        <Button icon="chevron-left" onClick={props.onBack} />
        <Button icon="chevron-right" onClick={props.onForward} />
      </ButtonGroup>
    </Block>;
}
