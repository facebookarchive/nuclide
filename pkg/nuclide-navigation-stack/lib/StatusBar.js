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
import type {Observable} from 'rxjs';

import {React, ReactDOM} from 'react-for-atom';
import {Disposable} from 'atom';
import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import {Block} from '../../nuclide-ui/lib/Block';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';

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

  const onBack = () => controller.navigateBackwards();
  const onForward = () => controller.navigateForwards();

  const props: Observable<Props> = controller.observeStackChanges()
    .map(stack => ({
      enableBack: stack.hasPrevious(),
      enableForward: stack.hasNext(),
      onBack,
      onForward,
    }));

  const Tile = bindObservableAsProps(props, NavStackStatusBarTile);
  ReactDOM.render(<Tile />,
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

// $FlowFixMe: `bindObservableAsProps` needs to be typed better.
function NavStackStatusBarTile(props: Props): React.Element<any> {
  return <Block>
      <ButtonGroup>
        <Button icon="chevron-left" onClick={props.onBack} disabled={!props.enableBack} />
        <Button icon="chevron-right" onClick={props.onForward} disabled={!props.enableForward} />
      </ButtonGroup>
    </Block>;
}
