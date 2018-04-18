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

import * as React from 'react';
import Anser from 'anser';
import escapeCarriageReturn from 'escape-carriage';

function ansiToJSON(input) {
  return Anser.ansiToJson(escapeCarriageReturn(input), {
    json: true,
    remove_empty: true,
  });
}

function ansiJSONtoStyleBundle(ansiBundle) {
  const style = {};
  if (ansiBundle.bg) {
    style.backgroundColor = `rgb(${ansiBundle.bg})`;
  }
  if (ansiBundle.fg) {
    style.color = `rgb(${ansiBundle.fg})`;
  }
  return {
    content: ansiBundle.content,
    style,
  };
}

function ansiToInlineStyle(text) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

type Props = {
  children?: string,
  renderSegment?: RenderSegmentProps => React.Node,
};

export type RenderSegmentProps = {key: string, style: Object, content: string};

function defaultRenderSegment({key, style, content}: RenderSegmentProps) {
  return (
    <span key={key} style={style}>
      {content}
    </span>
  );
}

export default class Ansi extends React.PureComponent<Props> {
  render() {
    const {
      children,
      renderSegment = defaultRenderSegment,
      ...passThroughProps
    } = this.props;
    return (
      <code {...passThroughProps}>
        {ansiToInlineStyle(children).map(({style, content}, key) =>
          renderSegment({key: String(key), style, content}),
        )}
      </code>
    );
  }
}
