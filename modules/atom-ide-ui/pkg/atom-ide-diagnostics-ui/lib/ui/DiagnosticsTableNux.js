/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {Nuclicon} from 'nuclide-commons-ui/Icon';

import {Icon} from 'nuclide-commons-ui/Icon';
import * as React from 'react';
import {Notice} from 'nuclide-commons-ui/TextEditorBanner';
import {Button} from 'nuclide-commons-ui/Button';

type Props = {|
  onDismiss: () => mixed,
|};

export default function DiagnosticsTableNux(props: Props): React$Node {
  return (
    <Notice messageType="info" contentStyle={{alignItems: 'center'}}>
      <div style={{marginRight: 16}}>
        <p style={{marginBottom: 0}}>
          You can open/close this table by clicking the{' '}
          <CenteredIcon icon="nuclicon-error" /> and{' '}
          <CenteredIcon icon="nuclicon-warning" /> icons in the bottom left.
          Note, we've only auto opened it{' '}
          <strong>
            <em>one time</em>
          </strong>{' '}
          to help you discover it. Thanks!
        </p>
      </div>
      <Button buttonType="PRIMARY" onClick={props.onDismiss}>
        Got it
      </Button>
    </Notice>
  );
}

function CenteredIcon({icon}: {icon: Nuclicon}): React$Node {
  return <Icon icon={icon} style={{marginLeft: 4, verticalAlign: 'middle'}} />;
}
