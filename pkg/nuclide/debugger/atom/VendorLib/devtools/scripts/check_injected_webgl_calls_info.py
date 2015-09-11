#!/usr/bin/env python
# Copyright (c) 2013 Google Inc. All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are
# met:
#
#     * Redistributions of source code must retain the above copyright
# notice, this list of conditions and the following disclaimer.
#     * Redistributions in binary form must reproduce the above
# copyright notice, this list of conditions and the following disclaimer
# in the documentation and/or other materials provided with the
# distribution.
#     * Neither the name of Google Inc. nor the names of its
# contributors may be used to endorse or promote products derived from
# this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
# "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
# LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
# OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
# SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
# LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
# DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
# THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
# (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
# OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

import re
import sys
import json


def parse_idl_file(idlFileName):
    idlFile = open(idlFileName, "r")
    source = idlFile.read()
    idlFile.close()

    source = re.sub(r"//.*\n", "", source)     # Remove line comments
    source = re.sub(r"\s+", " ", source)       # Line breaks to spaces, collapse spaces
    source = re.sub(r"/\*.*?\*/", "", source)  # Remove block comments
    source = re.sub(r"\[.*?\]", "", source)    # Remove method parameters and array type suffixes
    source = re.sub(r"\?", "", source)         # Remove optional type suffixes

    parsed_webgl_calls = []

    # Search for method signatures
    for line in source.split(";"):
        match = re.match(r"^\s*(\w[\w\s]*)\s+(\w+)\s*\(([^()]*)\)", line)
        if not match:
            continue

        return_type = match.group(1).strip()
        function_name = match.group(2)
        arguments_string = match.group(3)

        # Search for argument signatures
        argument_types = []
        for argument in arguments_string.split(","):
            match = re.match(r"^\s*(\w[\w\s]*)\s+(\w+)\s*$", argument)
            if not match:
                continue
            argument_types.append(match.group(1).strip())

        # Special case for texParameterf/texParameteri and getTexParameter: treat the parameter as GLenum regardless of the IDL specification:
        #     void texParameterf(GLenum target, GLenum pname, GLfloat param)
        #     void texParameteri(GLenum target, GLenum pname, GLint param)
        #     any getTexParameter(GLenum target, GLenum pname)
        if function_name == "texParameterf" or function_name == "texParameteri":
            argument_types[2] = "GLenum"
        if function_name == "getTexParameter":
            return_type = "GLenum"

        parsed_webgl_calls.append({"function_name": function_name, "return_type": return_type, "argument_types": argument_types})

    return parsed_webgl_calls


def generate_json_lines(parsed_webgl_calls):
    enum_types = ["GLenum", "GLbitfield"]
    hints = {
        "blendFunc": ["ZERO", "ONE"],
        "blendFuncSeparate": ["ZERO", "ONE"],
        "stencilOp": ["ZERO", "ONE"],
        "stencilOpSeparate": ["ZERO", "ONE"],
        "drawArrays": ["POINTS", "LINES"],
        "drawElements": ["POINTS", "LINES"],
        "getError": ["NO_ERROR"],
    }

    json_lines = []
    for call in parsed_webgl_calls:
        function_name = call["function_name"]
        return_type = call["return_type"]
        argument_types = call["argument_types"]

        if not (return_type in enum_types or set(enum_types).intersection(argument_types)):
            continue

        # Using "aname" instead of "name" to make it the first parameter after sorting (for readability sake).
        result = {"aname": function_name}
        if return_type in enum_types:
            result["returnType"] = return_type[2:]

        for enum_type in enum_types:
            if not enum_type in argument_types:
                continue
            result[enum_type[2:]] = [i for i in range(len(argument_types)) if argument_types[i] == enum_type]

        if function_name in hints:
            result["hints"] = hints[function_name]

        result_json = json.dumps(result, sort_keys=True)
        if result_json in json_lines:
            continue
        json_lines.append(result_json)

    return json_lines


def check_injected_script_js_file(jsFileName, json_lines):
    jsFile = open(jsFileName, "r")
    source = jsFile.read()
    jsFile.close()

    missing_lines = []
    for line in json_lines:
        if not line in source:
            missing_lines.append(line)

    if len(missing_lines):
        print "ERROR: Injected script file is missing %d line(s) of generated code: " % len(missing_lines)
        for line in missing_lines:
            print "    %s" % line
    else:
        print "OK"


def main(argv):
    if len(argv) < 2:
        print('Usage: %s path/to/WebGLRenderingContext.idl [path/to/InjectedScriptCanvasModuleSource.js]' % argv[0])
        return 1

    parsed_webgl_calls = parse_idl_file(argv[1])
    json_lines = generate_json_lines(parsed_webgl_calls)

    if len(json_lines) < 50:
        print "WARNING: too few WebGL methods parsed: %d! Something wrong with the IDL file parsing?" % len(json_lines)

    if len(argv) > 2:
        check_injected_script_js_file(argv[2], json_lines)

if __name__ == '__main__':
    sys.exit(main(sys.argv))
