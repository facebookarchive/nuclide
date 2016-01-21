'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import React from 'react-for-atom';

type TypeHintComponentProps = {
  content: string;
}

/* eslint-disable react/prop-types */
export class TypeHintComponent extends React.Component {

  constructor(props: TypeHintComponentProps) {
    super(props);
  }

  getDefaultProps(): TypeHintComponentProps {
    return {
      content: '<type unavailable>',
    };
  }

  render(): ReactElement {
    return (
      <div>
        <pre>
          {JSON.stringify(this.props.content, null, 2)}
        </pre>
      </div>
    );
  }
}
/* eslint-enable react/prop-types */
