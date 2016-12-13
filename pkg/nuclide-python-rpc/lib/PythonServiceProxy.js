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
          line: 113
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
          line: 114
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 115
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 116
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
          line: 117
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 117
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 117
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
          line: 128
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
          line: 129
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 130
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 131
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
          line: 132
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 132
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 132
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
          line: 143
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
          line: 144
        },
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 145
        },
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 146
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
          line: 147
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 147
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 147
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
          line: 158
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
          line: 159
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
          line: 160
        },
        kind: "nullable",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 160
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 160
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
          line: 169
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
          line: 170
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
          line: 171
        },
        kind: "array",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 171
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
          line: 224
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
          line: 225
        },
        kind: "string"
      }
    }, {
      name: "start",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 226
        },
        kind: "number"
      }
    }, {
      name: "end",
      type: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 227
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
          line: 228
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
      line: 20
    },
    name: "PythonCompletion",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 20
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 21
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 21
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 22
        },
        name: "text",
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
        name: "description",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 23
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 24
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 24
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 24
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
      line: 27
    },
    name: "PythonDefinition",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 27
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 28
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 28
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 29
        },
        name: "text",
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
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 30
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 31
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 31
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 32
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 32
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
      line: 35
    },
    name: "PythonReference",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 35
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 36
        },
        name: "type",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 36
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 37
        },
        name: "text",
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
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 38
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 39
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 39
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 40
        },
        name: "column",
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
        name: "parentName",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 41
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
      line: 44
    },
    name: "Position",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 44
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 45
        },
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 45
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 46
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 46
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
      line: 49
    },
    name: "PythonFunctionItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 49
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 50
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 50
          },
          kind: "string-literal",
          value: "function"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 51
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 51
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 52
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 52
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 53
        },
        name: "end",
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
        name: "children",
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
            kind: "named",
            name: "PythonOutlineItem"
          }
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 55
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 55
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 56
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 56
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 56
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
      line: 59
    },
    name: "PythonClassItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 59
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 60
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 60
          },
          kind: "string-literal",
          value: "class"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 61
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 61
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 62
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 62
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 63
        },
        name: "end",
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
        name: "children",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 64
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 64
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
          line: 65
        },
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 65
          },
          kind: "string"
        },
        optional: true
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 67
        },
        name: "params",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 67
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 67
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
      line: 70
    },
    name: "PythonStatementItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 70
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 71
        },
        name: "kind",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 71
          },
          kind: "string-literal",
          value: "statement"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 72
        },
        name: "name",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 73
        },
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          kind: "named",
          name: "Position"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 74
        },
        name: "end",
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
        name: "docblock",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 75
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
      line: 78
    },
    name: "PythonOutlineItem",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 78
      },
      kind: "union",
      types: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 49
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 50
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 50
            },
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 51
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 51
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 52
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 52
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 53
          },
          name: "end",
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
          name: "children",
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
              kind: "named",
              name: "PythonOutlineItem"
            }
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 55
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 55
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 56
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 56
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 56
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
          line: 59
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 60
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 60
            },
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 61
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 61
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 62
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 62
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 63
          },
          name: "end",
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
          name: "children",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 64
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 64
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
            line: 65
          },
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 65
            },
            kind: "string"
          },
          optional: true
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 67
          },
          name: "params",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 67
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 67
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
          line: 70
        },
        kind: "object",
        fields: [{
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 71
          },
          name: "kind",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 71
            },
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 72
          },
          name: "name",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 72
            },
            kind: "string"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 73
          },
          name: "start",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 73
            },
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 74
          },
          name: "end",
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
          name: "docblock",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 75
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
      line: 80
    },
    name: "PythonDiagnostic",
    definition: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 80
      },
      kind: "object",
      fields: [{
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 81
        },
        name: "file",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 81
          },
          kind: "named",
          name: "NuclideUri"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 82
        },
        name: "code",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 82
          },
          kind: "string"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 83
        },
        name: "message",
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
        name: "type",
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
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 85
          },
          kind: "number"
        },
        optional: false
      }, {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 86
        },
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 86
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
      line: 112
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 112
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 113
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
            line: 114
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 115
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 116
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 117
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 117
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 117
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 117
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
      line: 127
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 127
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 128
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
            line: 129
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 130
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 131
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 132
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 132
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 132
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 132
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
      line: 142
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 142
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 143
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
            line: 144
          },
          kind: "string"
        }
      }, {
        name: "line",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 145
          },
          kind: "number"
        }
      }, {
        name: "column",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 146
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 147
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 147
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 147
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 147
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
      line: 157
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 157
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 158
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
            line: 159
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 160
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 160
          },
          kind: "nullable",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 160
            },
            kind: "array",
            type: {
              location: {
                type: "source",
                fileName: "PythonService.js",
                line: 160
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
      line: 168
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 168
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 169
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
            line: 170
          },
          kind: "string"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 171
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 171
          },
          kind: "array",
          type: {
            location: {
              type: "source",
              fileName: "PythonService.js",
              line: 171
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
      line: 223
    },
    type: {
      location: {
        type: "source",
        fileName: "PythonService.js",
        line: 223
      },
      kind: "function",
      argumentTypes: [{
        name: "src",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 224
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
            line: 225
          },
          kind: "string"
        }
      }, {
        name: "start",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 226
          },
          kind: "number"
        }
      }, {
        name: "end",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 227
          },
          kind: "number"
        }
      }],
      returnType: {
        location: {
          type: "source",
          fileName: "PythonService.js",
          line: 228
        },
        kind: "promise",
        type: {
          location: {
            type: "source",
            fileName: "PythonService.js",
            line: 228
          },
          kind: "string"
        }
      }
    }
  }]])
});