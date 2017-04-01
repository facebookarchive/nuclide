/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {TextBuffer} from 'atom';
import React from 'react';
import {AtomTextEditor} from '../../nuclide-ui/AtomTextEditor';

// Complex types can end up being super long. Truncate them.
const MAX_LENGTH = 100;

type TypeHintComponentProps = {
  content: string,
  grammar: atom$Grammar,
};

type TypeHintComponentState = {
  isExpanded: boolean,
};

export function makeTypeHintComponent(
  content: string,
  grammar: atom$Grammar,
): ReactClass<any> {
  return () => <TypeHintComponent content={content} grammar={grammar} />;
}

class TypeHintComponent extends React.Component {
  props: TypeHintComponentProps;
  state: TypeHintComponentState;

  constructor(props: TypeHintComponentProps) {
    super(props);
    this.state = {
      isExpanded: false,
    };
  }

  render(): React.Element<any> {
    const value = this.props.content;
    const shouldTruncate = value.length > MAX_LENGTH && !this.state.isExpanded;
    const buffer = new TextBuffer(
      shouldTruncate ? value.substr(0, MAX_LENGTH) + '...' : value,
    );
    const {grammar} = this.props;
    return (
      <div
        className="nuclide-type-hint-text-editor-container"
        onClick={(e: SyntheticEvent) => {
          this.setState({isExpanded: !this.state.isExpanded});
          e.stopPropagation();
        }}>
        <AtomTextEditor
          className="nuclide-type-hint-text-editor"
          gutterHidden={true}
          readOnly={true}
          syncTextContents={false}
          autoGrow={true}
          grammar={grammar}
          textBuffer={buffer}
        />
      </div>
    );
  }
}
