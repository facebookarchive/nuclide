'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';
import {fsPromise} from '../../nuclide-commons';
import {pythonTextToOutline} from '../lib/outline';

describe('Python outline', () => {

  it('conversion from JSON to outline', () => {
    waitsForPromise(async () => {
      const contents = await fsPromise.readFile(path.join(__dirname, './fixtures/t.py'), 'utf8');
      const result = await pythonTextToOutline(true, contents);
      expect(result).toEqual(JSON.parse(expected));
    });
  });
});

const expected = `{
  "outlineTrees": [
    {
      "tokenizedText": [
        {
          "kind": "plain",
          "value": "CONST"
        }
      ],
      "startPosition": {
        "row": 9,
        "column": 0
      },
      "children": []
    },
    {
      "tokenizedText": [
        {
          "kind": "keyword",
          "value": "def"
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "method",
          "value": "check_output"
        },
        {
          "kind": "plain",
          "value": "("
        },
        {
          "kind": "plain",
          "value": "*"
        },
        {
          "kind": "param",
          "value": "popenargs"
        },
        {
          "kind": "plain",
          "value": ","
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "plain",
          "value": "**"
        },
        {
          "kind": "param",
          "value": "kwargs"
        },
        {
          "kind": "plain",
          "value": ")"
        }
      ],
      "startPosition": {
        "row": 12,
        "column": 0
      },
      "children": []
    },
    {
      "tokenizedText": [
        {
          "kind": "keyword",
          "value": "class"
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "method",
          "value": "MyClass"
        }
      ],
      "startPosition": {
        "row": 16,
        "column": 0
      },
      "children": [
        {
          "tokenizedText": [
            {
              "kind": "keyword",
              "value": "def"
            },
            {
              "kind": "whitespace",
              "value": " "
            },
            {
              "kind": "method",
              "value": "__init"
            },
            {
              "kind": "plain",
              "value": "("
            },
            {
              "kind": "param",
              "value": "self"
            },
            {
              "kind": "plain",
              "value": ")"
            }
          ],
          "startPosition": {
            "row": 17,
            "column": 4
          },
          "children": []
        }
      ]
    },
    {
      "tokenizedText": [
        {
          "kind": "keyword",
          "value": "def"
        },
        {
          "kind": "whitespace",
          "value": " "
        },
        {
          "kind": "method",
          "value": "load_package_configs"
        },
        {
          "kind": "plain",
          "value": "("
        },
        {
          "kind": "plain",
          "value": ")"
        }
      ],
      "startPosition": {
        "row": 21,
        "column": 0
      },
      "children": []
    },
    {
      "tokenizedText": [
        {
          "kind": "plain",
          "value": "var"
        }
      ],
      "startPosition": {
        "row": 42,
        "column": 0
      },
      "children": []
    }
  ]
}`;
