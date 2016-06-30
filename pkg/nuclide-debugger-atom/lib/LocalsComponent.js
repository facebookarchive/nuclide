'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Locals} from './LocalsStore';

import {
  React,
} from 'react-for-atom';

type LocalsComponentProps = {
  locals: Locals;
};

export class LocalsComponent extends React.Component {
  props: LocalsComponentProps;

  constructor(props: LocalsComponentProps) {
    super(props);
  }

  render(): ?React.Element<any> {
    const {
      locals,
    } = this.props;
    const expressions = locals.map(local => {
      const {name} = local;
      return <div key={name}>{name}</div>;
    });
    return (
      <div>
        {expressions}
      </div>
    );
  }
}
