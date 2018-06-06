"use strict";

module.exports = _client => {
  const remoteModule = {};

  remoteModule.get_completions = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.callRemoteFunction("get_completions", "promise", _client.marshalArguments(Array.from(arguments), [{
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
      name: "sysPath",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
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
    }])).then(value => {
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

  remoteModule.get_definitions = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.callRemoteFunction("get_definitions", "promise", _client.marshalArguments(Array.from(arguments), [{
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
      name: "sysPath",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
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
    }])).then(value => {
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

  remoteModule.get_references = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.callRemoteFunction("get_references", "promise", _client.marshalArguments(Array.from(arguments), [{
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
      name: "sysPath",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
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
    }])).then(value => {
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

  remoteModule.get_hover = function (arg0, arg1, arg2, arg3, arg4, arg5) {
    return _client.callRemoteFunction("get_hover", "promise", _client.marshalArguments(Array.from(arguments), [{
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
      name: "sysPath",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
      }
    }, {
      name: "word",
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "string"
        }
      });
    });
  };

  remoteModule.get_outline = function (arg0, arg1) {
    return _client.callRemoteFunction("get_outline", "promise", _client.marshalArguments(Array.from(arguments), [{
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
    }])).then(value => {
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

  remoteModule.get_signature_help = function (arg0, arg1, arg2, arg3, arg4) {
    return _client.callRemoteFunction("get_signature_help", "promise", _client.marshalArguments(Array.from(arguments), [{
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
      name: "sysPath",
      type: {
        kind: "array",
        type: {
          kind: "string"
        }
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
    }])).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "SignatureHelp"
        }
      });
    });
  };

  return remoteModule;
};

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
        line: 17
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
            kind: "nullable",
            type: {
              kind: "array",
              type: {
                kind: "string"
              }
            }
          },
          optional: false
        }]
      }
    },
    JediDefinition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 24
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
        line: 32
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
        line: 41
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
        line: 56
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
        line: 67
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
        line: 75
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
        line: 46
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
        line: 80
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 80
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
          name: "sysPath",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
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
        line: 90
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 90
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
          name: "sysPath",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
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
        line: 100
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 100
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
          name: "sysPath",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
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
    get_hover: {
      kind: "function",
      name: "get_hover",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 110
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 110
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
          name: "sysPath",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
          }
        }, {
          name: "word",
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
              kind: "string"
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
        line: 122
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 122
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
    SignatureParameter: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 56
      },
      name: "SignatureParameter",
      definition: {
        kind: "object",
        fields: [{
          name: "label",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "documentation",
          type: {
            kind: "string"
          },
          optional: true
        }]
      }
    },
    Signature: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 50
      },
      name: "Signature",
      definition: {
        kind: "object",
        fields: [{
          name: "label",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "documentation",
          type: {
            kind: "string"
          },
          optional: true
        }, {
          name: "parameters",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "SignatureParameter"
            }
          },
          optional: true
        }]
      }
    },
    SignatureHelp: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "types.js",
        line: 44
      },
      name: "SignatureHelp",
      definition: {
        kind: "object",
        fields: [{
          name: "signatures",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "Signature"
            }
          },
          optional: false
        }, {
          name: "activeSignature",
          type: {
            kind: "number"
          },
          optional: true
        }, {
          name: "activeParameter",
          type: {
            kind: "number"
          },
          optional: true
        }]
      }
    },
    get_signature_help: {
      kind: "function",
      name: "get_signature_help",
      location: {
        type: "source",
        fileName: "JediService.js",
        line: 129
      },
      type: {
        location: {
          type: "source",
          fileName: "JediService.js",
          line: 129
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
          name: "sysPath",
          type: {
            kind: "array",
            type: {
              kind: "string"
            }
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
              kind: "named",
              name: "SignatureHelp"
            }
          }
        }
      }
    }
  }
});