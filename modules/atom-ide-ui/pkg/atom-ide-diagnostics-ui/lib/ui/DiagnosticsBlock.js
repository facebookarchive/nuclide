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

import type {DiagnosticMessage} from '../../../atom-ide-diagnostics/lib/types';

import {Button} from 'nuclide-commons-ui/Button';
import * as React from 'react';
import analytics from 'nuclide-commons/analytics';

type DiagnosticsBlockProps = {
  messages: Array<DiagnosticMessage>,
  onClose: () => void,
};

export default class DiagnosticsBlock extends React.Component<
  DiagnosticsBlockProps,
> {
  componentDidMount() {
    analytics.track('diagnostics-show-block', {
      // Note: there could be multiple providers here (but it's less common).
      providerName: this.props.messages[0].providerName,
    });
  }

  render() {
    const {messages, onClose} = this.props;
    return (
      <div className="diagnostics-block">
        <Button onClick={onClose}>Close</Button>
        {messages.map((message, index) => {
          if (message.getBlockComponent) {
            const Component = message.getBlockComponent();
            return <Component key={index} />;
          }
        })}
      </div>
    );
  }
}
