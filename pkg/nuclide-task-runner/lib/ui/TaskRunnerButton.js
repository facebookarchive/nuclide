/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {ButtonSize} from '../../../nuclide-ui/Button';

import {Button} from '../../../nuclide-ui/Button';
import React from 'react';

type Props = {
  selected?: boolean,
  size?: ButtonSize,
  children?: mixed,
  iconComponent: ?ReactClass<any>,
};

export function TaskRunnerButton(props: Props): React.Element<any> {
  const IconComponent = props.iconComponent;
  const icon = IconComponent ? <IconComponent /> : null;
  const buttonProps = {...props};
  delete buttonProps.label;
  delete buttonProps.iconComponent;
  return (
    <Button
      {...buttonProps}
      className="nuclide-task-runner-task-runner-button">
      <div className="nuclide-task-runner-task-runner-icon-wrapper">
        {icon}
      </div>
      {props.children}
    </Button>
  );
}
