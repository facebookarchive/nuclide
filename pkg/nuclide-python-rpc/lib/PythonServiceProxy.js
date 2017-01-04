"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.getCompletions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 114
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
          line: 115
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 116
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 117
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getCompletions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 118
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 118
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 118
            },
            kind: "named",
            name: "PythonCompletion"
          }
        }
      });
    });
  };

  remoteModule.getDefinitions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 129
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
          line: 130
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 131
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 132
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getDefinitions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 133
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 133
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 133
            },
            kind: "named",
            name: "PythonDefinition"
          }
        }
      });
    });
  };

  remoteModule.getReferences = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 144
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
          line: 145
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 146
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 147
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getReferences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
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
            name: "PythonReference"
          }
        }
      });
    });
  };

  remoteModule.getOutline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 159
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
          line: 160
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getOutline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 161
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 161
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 161
            },
            kind: "named",
            name: "PythonOutlineItem"
          }
        }
      });
    });
  };

  remoteModule.getDiagnostics = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 170
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
          line: 171
        },
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/getDiagnostics", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 172
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 172
          },
          kind: "named",
          name: "PythonDiagnostic"
        }
      });
    });
  };

  remoteModule.formatCode = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 225
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
          line: 226
        },
        kind: "string"
      }
    }, {
      name: "start",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 227
        },
        kind: "number"
      }
    }, {
      name: "end",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 228
        },
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("PythonService/formatCode", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 229
        },
        kind: "string"
      });
    });
  };

  return remoteModule;
};

Object.defineProperty(module.exports, "inject", {
  value: function () {
    Observable = arguments[0];
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
  }], ["atom$Point", {
    kind: "alias",
    name: "atom$Point",
    location: {
      type: "builtin"
    }
  }], ["atom$Range", {
    kind: "alias",
    name: "atom$Range",
    location: {
      type: "builtin"
    }
  }], ["PythonCompletion", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 21
    },
    name: "PythonCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 21
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 22
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 22
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 23
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 23
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 24
        },
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 24
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 25
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 25
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 25
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
      line: 28
    },
    name: "PythonDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 28
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 29
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 29
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 30
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 30
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 31
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 31
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 32
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 32
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 33
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 33
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
      line: 36
    },
    name: "PythonReference",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 36
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 37
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 37
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 38
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 38
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 39
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 39
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 40
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 40
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 41
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 41
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 42
        },
        name: "parentName",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 42
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
      line: 45
    },
    name: "Position",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 45
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 46
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 46
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 47
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 47
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
      line: 50
    },
    name: "PythonFunctionItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 50
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 51
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 51
          },
          kind: "string-literal",
          value: "function"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 52
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 52
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 53
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 53
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 54
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 54
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 55
        },
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 55
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 55
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
          line: 56
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 56
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 57
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 57
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 57
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
      line: 60
    },
    name: "PythonClassItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 60
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 61
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 61
          },
          kind: "string-literal",
          value: "class"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 62
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 62
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 63
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 63
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 64
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 64
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 65
        },
        name: "children",
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
            kind: "named",
            name: "PythonOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 66
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 66
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 68
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 68
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 68
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
      line: 71
    },
    name: "PythonStatementItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 71
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 72
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          kind: "string-literal",
          value: "statement"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 73
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 74
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 74
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 75
        },
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 75
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 76
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 76
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
      line: 79
    },
    name: "PythonOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 79
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 50
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 51
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 51
            },
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 52
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 52
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 53
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 53
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 54
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 54
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 55
          },
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 55
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 55
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
            line: 56
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 56
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 57
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 57
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 57
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
          line: 60
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 61
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 61
            },
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 62
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 62
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 63
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 63
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 64
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 64
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 65
          },
          name: "children",
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
              kind: "named",
              name: "PythonOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 66
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 66
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 68
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 68
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 68
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
          line: 71
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 72
            },
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 73
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 74
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 74
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 75
          },
          name: "end",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 75
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 76
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 76
            },
            kind: "string"
          },
          optional: true
        }]
      }],
      discriminantField: "kind"
    }
  }], ["PythonDiagnostic", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 81
    },
    name: "PythonDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 81
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 82
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 82
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 83
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 83
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 84
        },
        name: "message",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 84
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 85
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 85
          },
          kind: "named",
          name: "MessageType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 86
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 86
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 87
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 87
          },
          kind: "number"
        },
        optional: false
      }]
    }
  }], ["getCompletions", {
    kind: "function",
    name: "getCompletions",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 113
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 113
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 114
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
            line: 115
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 116
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 117
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 118
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 118
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 118
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 118
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
      line: 128
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 128
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 129
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
            line: 130
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 131
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 132
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 133
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 133
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 133
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 133
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
      line: 143
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 143
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 144
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
            line: 145
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 146
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 147
          },
          kind: "number"
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
      line: 158
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 158
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 159
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
            line: 160
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 161
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 161
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 161
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 161
              },
              kind: "named",
              name: "PythonOutlineItem"
            }
          }
        }
      }
    }
  }], ["getDiagnostics", {
    kind: "function",
    name: "getDiagnostics",
    location: {
      type: "source",
      fileName: "PythonService.js",
      line: 169
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 169
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 170
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
            line: 171
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 172
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 172
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 172
            },
            kind: "named",
            name: "PythonDiagnostic"
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
      line: 224
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 224
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 225
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
            line: 226
          },
          kind: "string"
        }
      }, {
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 227
          },
          kind: "number"
        }
      }, {
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 228
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 229
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 229
          },
          kind: "string"
        }
      }
    }
  }], ["InvalidationMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 15
    },
    name: "InvalidationMessage",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 15
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 16
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 16
            },
            kind: "string-literal",
            value: "file"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 17
          },
          name: "filePaths",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 17
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 17
              },
              kind: "named",
              name: "NuclideUri"
            }
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 18
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 19
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 19
            },
            kind: "string-literal",
            value: "project"
          },
          optional: false
        }]
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 20
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 21
          },
          name: "scope",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 21
            },
            kind: "string-literal",
            value: "all"
          },
          optional: false
        }]
      }],
      discriminantField: "scope"
    }
  }], ["DiagnosticProviderUpdate", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 31
    },
    name: "DiagnosticProviderUpdate",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 31
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 32
        },
        name: "filePathToMessages",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 32
          },
          kind: "map",
          keyType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 32
            },
            kind: "named",
            name: "NuclideUri"
          },
          valueType: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 32
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "rpc-types.js",
                line: 32
              },
              kind: "named",
              name: "FileDiagnosticMessage"
            }
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 33
        },
        name: "projectMessages",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 33
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 33
            },
            kind: "named",
            name: "ProjectDiagnosticMessage"
          }
        },
        optional: true
      }]
    }
  }], ["FileDiagnosticUpdate", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 36
    },
    name: "FileDiagnosticUpdate",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 36
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 37
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 37
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 38
        },
        name: "messages",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 38
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 38
            },
            kind: "named",
            name: "FileDiagnosticMessage"
          }
        },
        optional: false
      }]
    }
  }], ["MessageType", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 41
    },
    name: "MessageType",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 41
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 41
        },
        kind: "string-literal",
        value: "Error"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 41
        },
        kind: "string-literal",
        value: "Warning"
      }]
    }
  }], ["Trace", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 43
    },
    name: "Trace",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 43
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 44
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 44
          },
          kind: "string-literal",
          value: "Trace"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 45
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 45
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 46
        },
        name: "html",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 46
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 47
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 47
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 48
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 48
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }]
    }
  }], ["Fix", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 51
    },
    name: "Fix",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 51
      },
      kind: "intersection",
      types: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        kind: "named",
        name: "TextEdit"
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          name: "speculative",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 55
            },
            kind: "boolean"
          },
          optional: true
        }]
      }],
      flattened: {
        kind: "object",
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 51
        },
        fields: [{
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 12
          },
          name: "oldRange",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 12
            },
            kind: "named",
            name: "atom$Range"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          name: "newText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 13
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          name: "oldText",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 15
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 55
          },
          name: "speculative",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 55
            },
            kind: "boolean"
          },
          optional: true
        }]
      }
    }
  }], ["FileDiagnosticMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 58
    },
    name: "FileDiagnosticMessage",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 58
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 59
        },
        name: "scope",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 59
          },
          kind: "string-literal",
          value: "file"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 60
        },
        name: "providerName",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 60
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 61
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 61
          },
          kind: "named",
          name: "MessageType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 62
        },
        name: "filePath",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 62
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 63
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 63
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 64
        },
        name: "html",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 64
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 65
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 65
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 66
        },
        name: "trace",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 66
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 66
            },
            kind: "named",
            name: "Trace"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 67
        },
        name: "fix",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 67
          },
          kind: "named",
          name: "Fix"
        },
        optional: true
      }]
    }
  }], ["ProjectDiagnosticMessage", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 70
    },
    name: "ProjectDiagnosticMessage",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 70
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 71
        },
        name: "scope",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 71
          },
          kind: "string-literal",
          value: "project"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 72
        },
        name: "providerName",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 72
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 73
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 73
          },
          kind: "named",
          name: "MessageType"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 74
        },
        name: "text",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 74
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 75
        },
        name: "html",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 75
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 76
        },
        name: "range",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 76
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 77
        },
        name: "trace",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 77
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "rpc-types.js",
              line: 77
            },
            kind: "named",
            name: "Trace"
          }
        },
        optional: true
      }]
    }
  }], ["TextEdit", {
    kind: "alias",
    location: {
      type: "source",
      fileName: "rpc-types.js",
      line: 11
    },
    name: "TextEdit",
    definition: {
      location: {
        type: "source",
        fileName: "rpc-types.js",
        line: 11
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 12
        },
        name: "oldRange",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 12
          },
          kind: "named",
          name: "atom$Range"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 13
        },
        name: "newText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 13
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "rpc-types.js",
          line: 15
        },
        name: "oldText",
        type: {
          location: {
            type: "source",
            fileName: "rpc-types.js",
            line: 15
          },
          kind: "string"
        },
        optional: true
      }]
    }
  }]])
});