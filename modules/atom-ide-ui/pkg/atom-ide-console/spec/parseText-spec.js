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

import parseText from '../lib/parseText';

describe('parseText', () => {
  it('parses url pattern', () => {
    const chunks = parseText('Message: https://facebook.com');
    expect(chunks.length).toBe(3);
    expect(chunks[0]).toBe('Message: ');
    expect(chunks[2]).toBe('');

    const reactElement = chunks[1];
    expect(typeof reactElement).toBe('object'); // type React.Element

    if (typeof reactElement === 'object') {
      expect(reactElement.type).toBe('a');
      expect(reactElement.props.href).toBe('https://facebook.com');
      expect(reactElement.props.children).toBe('https://facebook.com');
    }
  });

  it('parses absolute file path', () => {
    const chunks = parseText(
      'Message: /absolute/file/path/file.js should be parsed.',
    );
    expect(chunks.length).toBe(3);
    expect(chunks[0]).toBe('Message: ');
    expect(chunks[2]).toBe(' should be parsed.');

    const reactElement = chunks[1];
    expect(typeof reactElement).toBe('object'); // type React.Element

    if (typeof reactElement === 'object') {
      expect(reactElement.type).toBe('a');
      expect(reactElement.props.onClick).toBeDefined();
      expect(reactElement.props.children).toBe('/absolute/file/path/file.js');
    }
  });

  it('parses absolute file path with line number', () => {
    const chunks = parseText(
      'Message: /absolute/file/path/file.js:10 should be parsed.',
    );
    expect(chunks.length).toBe(3);
    expect(chunks[0]).toBe('Message: ');
    expect(chunks[2]).toBe(' should be parsed.');

    const reactElement = chunks[1];
    expect(typeof reactElement).toBe('object'); // type React.Element

    if (typeof reactElement === 'object') {
      expect(reactElement.type).toBe('a');
      expect(reactElement.props.onClick).toBeDefined();
      expect(reactElement.props.children).toBe(
        '/absolute/file/path/file.js:10',
      );
    }
  });

  it('parses absolute file path with line number and column number', () => {
    const chunks = parseText(
      'Message: /absolute/file/path/file.js:1:17 should be parsed.',
    );
    expect(chunks.length).toBe(3);
    expect(chunks[0]).toBe('Message: ');
    expect(chunks[2]).toBe(' should be parsed.');

    const reactElement = chunks[1];
    expect(typeof reactElement).toBe('object'); // type React.Element

    if (typeof reactElement === 'object') {
      expect(reactElement.type).toBe('a');
      expect(reactElement.props.onClick).toBeDefined();
      expect(reactElement.props.children).toBe(
        '/absolute/file/path/file.js:1:17',
      );
    }
  });

  it('parses relative file path', () => {
    const chunks = parseText('relative/path/file.js:1:17 should be parsed.');
    expect(chunks.length).toBe(3);
    expect(chunks[0]).toBe('');
    expect(chunks[2]).toBe(' should be parsed.');

    const reactElement = chunks[1];
    expect(typeof reactElement).toBe('object'); // type React.Element

    if (typeof reactElement === 'object') {
      expect(reactElement.type).toBe('a');
      expect(reactElement.props.onClick).toBeDefined();
      expect(reactElement.props.children).toBe('relative/path/file.js:1:17');
    }
  });

  it('parses mutliple file paths', () => {
    const chunks = parseText(
      'Message: relative/path/file.js:1:17 and /Absolute/path/file.file.js should be parsed.',
    );
    expect(chunks.length).toBe(5);
    expect(chunks[0]).toBe('Message: ');
    expect(chunks[2]).toBe(' and ');
    expect(chunks[4]).toBe(' should be parsed.');

    const reactElementRelative = chunks[1];
    const reactElementAbsolute = chunks[3];
    expect(typeof reactElementRelative).toBe('object');
    expect(typeof reactElementAbsolute).toBe('object');

    if (
      typeof reactElementRelative === 'object' &&
      typeof reactElementAbsolute === 'object'
    ) {
      expect(reactElementRelative.type).toBe('a');
      expect(reactElementRelative.props.onClick).toBeDefined();
      expect(reactElementRelative.props.children).toBe(
        'relative/path/file.js:1:17',
      );

      expect(reactElementAbsolute.type).toBe('a');
      expect(reactElementAbsolute.props.onClick).toBeDefined();
      expect(reactElementAbsolute.props.children).toBe(
        '/Absolute/path/file.file.js',
      );
    }
  });
});
