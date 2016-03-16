/* Copyright (c) 2013 StrongLoop, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var truncate = require('truncate');

/**
 * Decode payload in the given data URI, return the result as a Buffer.
 * See [RFC2397](http://www.ietf.org/rfc/rfc2397.txt) for the specification
 * of data URL scheme.
 * @param {String} uri
 * @returns {Buffer}
 */
function decode(uri) {

  //  dataurl    := "data:" [ mediatype ] [ ";base64" ] "," data
  //  mediatype  := [ type "/" subtype ] *( ";" parameter )
  //  data       := *urlchar
  //  parameter  := attribute "=" value

  var m = /^data:([^;,]+)?((?:;(?:[^;,]+))*?)(;base64)?,(.*)/.exec(uri);
  if (!m) {
    throw new Error('Not a valid data URI: "' + truncate(uri, 20) + '"');
  }

  var media    = '';
  var b64      = m[3];
  var body     = m[4];
  var result   = null;
  var charset  = null;
  var mimetype = null;

  // If <mediatype> is omitted, it defaults to text/plain;charset=US-ASCII.
  // As a shorthand, "text/plain" can be omitted but the charset parameter
  // supplied.
  if (m[1]) {
    mimetype = m[1];
    media = mimetype + (m[2] || '');
  } else {
    mimetype = 'text/plain';
    if (m[2]) {
      media = mimetype + m[2];
    } else {
      charset = 'US-ASCII';
      media = 'text/plain;charset=US-ASCII';
    }
  }

  // The RFC doesn't say what the default encoding is if there is a mediatype
  // so we will return null.  For example, charset doesn't make sense for
  // binary types like image/png
  if (!charset && m[2]) {
    var cm = /;charset=([^;,]+)/.exec(m[2]);
    if (cm) {
      charset = cm[1];
    }
  }

  if (b64) {
    result = new Buffer(body, 'base64');
  } else {
    result = new Buffer(decodeURIComponent(body), 'ascii');
  }

  result.mimetype  = mimetype;
  result.mediatype = media;
  result.charset   = charset;

  return result;
}

exports.decode = decode;

function encode(input, mediatype) {
  var buf;
  if (Buffer.isBuffer(input)) {
    buf = input;
    mediatype = mediatype || 'application/octet-stream';
  } else if (typeof(input) == 'string') {
    buf = new Buffer(input, 'utf8');
    mediatype = mediatype || 'text/plain;charset=UTF-8';
  } else {
    // TODO: support streams?
    throw new Error('Invalid input, expected Buffer or string');
  }
  // opinionatedly base64
  return 'data:' + mediatype + ';base64,' + buf.toString('base64');
}

exports.encode = encode;
