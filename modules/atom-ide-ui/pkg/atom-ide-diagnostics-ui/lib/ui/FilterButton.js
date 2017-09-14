/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {IconName} from 'nuclide-commons-ui/Icon';
import type {FilterType} from '../types';

import {Button, ButtonSizes} from 'nuclide-commons-ui/Button';
import * as React from 'react';

type Props = {|
  type: FilterType,
  selected: boolean,
  onClick: () => mixed,
|};

export default function FilterButton(props: Props): React.Node {
  const {selected, type} = props;
  const typeName = getFilterTypeDisplayName(type);
  const title = props.selected ? `Hide ${typeName}` : `Show ${typeName}`;
  return (
    <Button
      icon={getIcon(type)}
      size={ButtonSizes.SMALL}
      selected={selected}
      onClick={props.onClick}
      tooltip={{title}}
    />
  );
}

function getFilterTypeDisplayName(type: FilterType): string {
  switch (type) {
    case 'errors':
      return 'Errors';
    case 'warnings':
      return 'Warnings & Info';
    case 'feedback':
      return 'Feedback';
    default:
      throw new Error(`Invalid filter type: ${type}`);
  }
}

function getIcon(type: FilterType): IconName {
  switch (type) {
    case 'errors':
      return 'nuclicon-stop';
    case 'warnings':
      return 'alert';
    case 'feedback':
      return 'nuclicon-comment-discussion';
    default:
      throw new Error(`Invalid filter type: ${type}`);
  }
}
