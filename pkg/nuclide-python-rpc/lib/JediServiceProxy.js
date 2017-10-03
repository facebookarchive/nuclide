"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.get_completions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_completions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "JediCompletion"
          }
        }
      });
    });
  };

  remoteModule.get_definitions = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_definitions", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "JediDefinition"
          }
        }
      });
    });
  };

  remoteModule.get_references = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        kind: "string"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "column",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_references", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "JediReference"
          }
        }
      });
    });
  };

  remoteModule.get_outline = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "src",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "contents",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("get_outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "JediOutlineItem"
          }
        }
      });
    });
  };

  remoteModule.add_paths = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "paths",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }]).then(args => {
      return _client.callRemoteFunction("add_paths", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "string"
          }
        }
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
  value: {
    Object: {
      kind: "alias",
      name: "Object",
      location: {
        type: "builtin"
      }
    },
    Date: {
      kind: "alias",
      name: "Date",
      location: {
        type: "builtin"
      }
    },
    RegExp: {
      kind: "alias",
      name: "RegExp",
      location: {
        type: "builtin"
      }
    },
    Buffer: {
      kind: "alias",
      name: "Buffer",
      location: {
        type: "builtin"
      }
    },
    "fs.Stats": {
      kind: "alias",
      name: "fs.Stats",
      location: {
        type: "builtin"
      }
    },
    NuclideUri: {
      kind: "alias",
      name: "NuclideUri",
      location: {
        type: "builtin"
      }
    },
    atom$Point: {
      kind: "alias",
      name: "atom$Point",
      location: {
        type: "builtin"
      }
    },
    atom$Range: {
      kind: "alias",
      name: "atom$Range",
      location: {
        type: "builtin"
      }
    },
    JediCompletion: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 16
      },
      name: "JediCompletion",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "description",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "params",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    JediDefinition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 23
      },
      name: "JediDefinition",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "column",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    JediReference: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 31
      },
      name: "JediReference",
      definition: {
        kind: "object",
        fields: [{
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "text",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "file",
          type: {
            kind: "named",
            name: "NuclideUri"
          },
          optional: false
        }, {
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "column",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "parentName",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    Position: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 40
      },
      name: "Position",
      definition: {
        kind: "object",
        fields: [{
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "column",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    JediClassItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 55
      },
      name: "JediClassItem",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "class"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "start",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "children",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "JediOutlineItem"
            }
          },
          optional: true
        }, {
          name: "docblock",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "params",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    JediStatementItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 66
      },
      name: "JediStatementItem",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "statement"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "start",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "docblock",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    JediOutlineItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 74
      },
      name: "JediOutlineItem",
      definition: {
        kind: "union",
        types: [{
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "function"
            },
            optional: false
          }, {
            name: "name",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "start",
            type: {
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            name: "end",
            type: {
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            name: "children",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "JediOutlineItem"
              }
            },
            optional: true
          }, {
            name: "docblock",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "params",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "class"
            },
            optional: false
          }, {
            name: "name",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "start",
            type: {
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            name: "end",
            type: {
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            name: "children",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "JediOutlineItem"
              }
            },
            optional: true
          }, {
            name: "docblock",
            type: {
              kind: "string"
            },
            optional: true
          }, {
            name: "params",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            },
            optional: true
          }]
        }, {
          kind: "object",
          fields: [{
            name: "kind",
            type: {
              kind: "string-literal",
              value: "statement"
            },
            optional: false
          }, {
            name: "name",
            type: {
              kind: "string"
            },
            optional: false
          }, {
            name: "start",
            type: {
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            name: "end",
            type: {
              kind: "named",
              name: "Position"
            },
            optional: false
          }, {
            name: "docblock",
            type: {
              kind: "string"
            },
            optional: true
          }]
        }],
        discriminantField: "kind"
      }
    },
    JediFunctionItem: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 45
      },
      name: "JediFunctionItem",
      definition: {
        kind: "object",
        fields: [{
          name: "kind",
          type: {
            kind: "string-literal",
            value: "function"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "start",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "Position"
          },
          optional: false
        }, {
          name: "children",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "JediOutlineItem"
            }
          },
          optional: true
        }, {
          name: "docblock",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "params",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          },
          optional: true
        }]
      }
    },
    get_completions: {
      kind: "function",
      name: "get_completions",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 79
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 79
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "JediCompletion"
              }
            }
          }
        }
      }
    },
    get_definitions: {
      kind: "function",
      name: "get_definitions",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 88
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 88
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "JediDefinition"
              }
            }
          }
        }
      }
    },
    get_references: {
      kind: "function",
      name: "get_references",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 97
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 97
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            kind: "string"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "column",
          type: {
            kind: "number"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "JediReference"
              }
            }
          }
        }
      }
    },
    get_outline: {
      kind: "function",
      name: "get_outline",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 106
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 106
        },
        kind: "function",
        argumentTypes: [{
          name: "src",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "contents",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "named",
                name: "JediOutlineItem"
              }
            }
          }
        }
      }
    },
    add_paths: {
      kind: "function",
      name: "add_paths",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 113
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 113
        },
        kind: "function",
        argumentTypes: [{
          name: "paths",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          }
        }
      }
    }
  }
});