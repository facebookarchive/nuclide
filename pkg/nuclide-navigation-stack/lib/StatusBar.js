'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React, ReactDOM} from 'react-for-atom';
import {Disposable} from 'atom';
import {Button} from '../../nuclide-ui/lib/Button';
import {ButtonGroup} from '../../nuclide-ui/lib/ButtonGroup';
import {Block} from '../../nuclide-ui/lib/Block';

const STATUS_BAR_PRIORITY = 105;

export function consumeStatusBar(statusBar: atom$StatusBar): IDisposable {
  const item = document.createElement('div');
  item.className = 'inline-block';

  const statusBarTile = statusBar.addLeftTile({
    item,
    priority: STATUS_BAR_PRIORITY,
  });

  ReactDOM.render(
    <NavStackStatusBarTile
      enableBack={true}
      enableForward={true}
      onBack={() => {}}
      onForward={() => {}}
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
        <Button icon="chevron-left" />
        <Button icon="chevron-right" />
      </ButtonGroup>
    </Block>;
}
