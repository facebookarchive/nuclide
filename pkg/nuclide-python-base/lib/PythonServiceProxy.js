"use strict";

let Observable, trackOperationTiming;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 101
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 102
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 103
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 104
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("PythonService/getCompletions", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 105
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 105
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 105
          },
          kind: "named",
          name: "PythonCompletion"
        }
      }
    }));
  }

  remoteModule.getDefinitions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 116
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 117
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 118
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 119
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("PythonService/getDefinitions", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 120
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 120
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 120
          },
          kind: "named",
          name: "PythonDefinition"
        }
      }
    }));
  }

  remoteModule.getReferences = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 131
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 132
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 133
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 134
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("PythonService/getReferences", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 135
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 135
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 135
          },
          kind: "named",
          name: "PythonReference"
        }
      }
    }));
  }

  remoteModule.getOutline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 146
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 147
        },
        kind: "string"
      }
    }]).then(args => _client.callRemoteFunction("PythonService/getOutline", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 148
      },
      kind: "nullable",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 148
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 148
          },
          kind: "named",
          name: "PythonOutlineItem"
        }
      }
    }));
  }

  remoteModule.formatCode = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 154
        },
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 155
        },
        kind: "string"
      }
    }, {
      name: "start",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 156
        },
        kind: "number"
      }
    }, {
      name: "end",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 157
        },
        kind: "number"
      }
    }]).then(args => _client.callRemoteFunction("PythonService/formatCode", "promise", args)).then(value => _client.unmarshal(value, {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 158
      },
      kind: "string"
    }));
  }

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
    trackOperationTiming = arguments[1];
  }
});
Object.defineProperty(module.exports, "defs", {
  value: new Map([["Object", {
    kind: "alias",
    name: "Object",
    location: {
      type: "builtin"
    }
  }], ["Date", {
    kind: "alias",
    name: "Date",
    location: {
      type: "builtin"
    }
  }], ["RegExp", {
    kind: "alias",
    name: "RegExp",
    location: {
      type: "builtin"
    }
  }], ["Buffer", {
    kind: "alias",
    name: "Buffer",
    location: {
      type: "builtin"
    }
  }], ["fs.Stats", {
    kind: "alias",
    name: "fs.Stats",
    location: {
      type: "builtin"
    }
  }], ["NuclideUri", {
    kind: "alias",
    name: "NuclideUri",
    location: {
      type: "builtin"
    }
  }], ["PythonCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 18
    },
    name: "PythonCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 18
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 19
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 19
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 20
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 20
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 21
        },
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 21
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 22
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 22
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 22
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["PythonDefinition", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 25
    },
    name: "PythonDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 25
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 26
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 26
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 27
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 27
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 28
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 28
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 29
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 29
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 30
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 30
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["PythonReference", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 33
    },
    name: "PythonReference",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 33
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 34
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 34
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 35
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 35
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 36
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 36
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 37
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 37
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 38
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 38
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 39
        },
        name: "parentName",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 39
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["Position", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 42
    },
    name: "Position",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 42
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 43
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 43
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 44
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 44
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["PythonFunctionItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 47
    },
    name: "PythonFunctionItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 47
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 48
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 48
          },
          kind: "string-literal",
          value: "function"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 49
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 49
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 50
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 50
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 51
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 51
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 52
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 52
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 52
            },
            kind: "named",
            name: "PythonOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 53
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 53
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 54
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 54
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 54
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["PythonClassItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 57
    },
    name: "PythonClassItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 57
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 58
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 58
          },
          kind: "string-literal",
          value: "class"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 59
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 59
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 60
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 60
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 61
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 61
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 62
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 62
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 62
            },
            kind: "named",
            name: "PythonOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 63
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 63
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 65
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 65
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 65
            },
            kind: "string"
          }
        },
        optional: true
      }]
    }
  }], ["PythonStatementItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 68
    },
    name: "PythonStatementItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 68
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 69
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 69
          },
          kind: "string-literal",
          value: "statement"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 70
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 70
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 71
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 71
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 72
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 73
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }], ["PythonOutlineItem", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 76
    },
    name: "PythonOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 76
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 47
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 48
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 48
            },
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 49
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 49
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 50
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 50
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 51
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 51
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 52
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 52
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 52
              },
              kind: "named",
              name: "PythonOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 53
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 53
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 54
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 54
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 54
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 57
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 58
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 58
            },
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 59
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 59
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 60
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 60
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 61
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 61
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 62
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 62
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 62
              },
              kind: "named",
              name: "PythonOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 63
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 63
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 65
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 65
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 65
              },
              kind: "string"
            }
          },
          optional: true
        }]
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 68
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 69
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 69
            },
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 70
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 70
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 71
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 71
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 72
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 73
            },
            kind: "string"
          },
          optional: true
        }]
      }],
      discriminantField: "kind"
    }
  }], ["getCompletions", {
    kind: "function",
    name: "getCompletions",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 100
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 100
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 101
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 102
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 103
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 104
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 105
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 105
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 105
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 105
              },
              kind: "named",
              name: "PythonCompletion"
            }
          }
        }
      }
    }
  }], ["getDefinitions", {
    kind: "function",
    name: "getDefinitions",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 115
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 115
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 116
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 117
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 118
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 119
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 120
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 120
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 120
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 120
              },
              kind: "named",
              name: "PythonDefinition"
            }
          }
        }
      }
    }
  }], ["getReferences", {
    kind: "function",
    name: "getReferences",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 130
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 130
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 131
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 132
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 133
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 134
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 135
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 135
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 135
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 135
              },
              kind: "named",
              name: "PythonReference"
            }
          }
        }
      }
    }
  }], ["getOutline", {
    kind: "function",
    name: "getOutline",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 145
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 145
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 146
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 147
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 148
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 148
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 148
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 148
              },
              kind: "named",
              name: "PythonOutlineItem"
            }
          }
        }
      }
    }
  }], ["formatCode", {
    kind: "function",
    name: "formatCode",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 153
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 153
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 154
          },
          kind: "named",
          name: "NuclideUri"
        }
      }, {
        name: "contents",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 155
          },
          kind: "string"
        }
      }, {
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 156
          },
          kind: "number"
        }
      }, {
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 157
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 158
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 158
          },
          kind: "string"
        }
      }
    }
  }]])
});