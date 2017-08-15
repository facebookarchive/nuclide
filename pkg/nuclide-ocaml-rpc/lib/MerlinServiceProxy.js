"use strict";

let Observable;

module.exports = _client => {
  const remoteModule = {};

  remoteModule.pushDotMerlinPath = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/pushDotMerlinPath", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "any"
        }
      });
    });
  };

  remoteModule.pushNewBuffer = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "name",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "content",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/pushNewBuffer", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "any"
        }
      });
    });
  };

  remoteModule.locate = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        kind: "number"
      }
    }, {
      name: "kind",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/locate", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "object",
          fields: [{
            name: "file",
            type: {
              kind: "named",
              name: "NuclideUri"
            },
            optional: false
          }, {
            name: "pos",
            type: {
              kind: "object",
              fields: [{
                name: "line",
                type: {
                  kind: "number"
                },
                optional: false
              }, {
                name: "col",
                type: {
                  kind: "number"
                },
                optional: false
              }]
            },
            optional: false
          }]
        }
      });
    });
  };

  remoteModule.enclosingType = function (arg0, arg1, arg2) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        kind: "number"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/enclosingType", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "MerlinType"
          }
        }
      });
    });
  };

  remoteModule.complete = function (arg0, arg1, arg2, arg3) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "line",
      type: {
        kind: "number"
      }
    }, {
      name: "col",
      type: {
        kind: "number"
      }
    }, {
      name: "prefix",
      type: {
        kind: "string"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/complete", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "any"
      });
    });
  };

  remoteModule.errors = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/errors", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "MerlinError"
          }
        }
      });
    });
  };

  remoteModule.outline = function (arg0) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/outline", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "array",
          type: {
            kind: "named",
            name: "MerlinOutline"
          }
        }
      });
    });
  };

  remoteModule.cases = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        kind: "named",
        name: "atom$Point"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/cases", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "MerlinCases"
        }
      });
    });
  };

  remoteModule.occurrences = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "position",
      type: {
        kind: "named",
        name: "atom$Point"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/occurrences", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "nullable",
        type: {
          kind: "named",
          name: "MerlinOccurrences"
        }
      });
    });
  };

  remoteModule.runSingleCommand = function (arg0, arg1) {
    return _client.marshalArguments(Array.from(arguments), [{
      name: "path",
      type: {
        kind: "named",
        name: "NuclideUri"
      }
    }, {
      name: "command",
      type: {
        kind: "mixed"
      }
    }]).then(args => {
      return _client.callRemoteFunction("MerlinService/runSingleCommand", "promise", args);
    }).then(value => {
      return _client.unmarshal(value, {
        kind: "any"
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
    MerlinPosition: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 16
      },
      name: "MerlinPosition",
      definition: {
        kind: "object",
        fields: [{
          name: "line",
          type: {
            kind: "number"
          },
          optional: false
        }, {
          name: "col",
          type: {
            kind: "number"
          },
          optional: false
        }]
      }
    },
    MerlinType: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 21
      },
      name: "MerlinType",
      definition: {
        kind: "object",
        fields: [{
          name: "start",
          type: {
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "tail",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "no"
            }, {
              kind: "string-literal",
              value: "position"
            }, {
              kind: "string-literal",
              value: "call"
            }]
          },
          optional: false
        }]
      }
    },
    MerlinError: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 28
      },
      name: "MerlinError",
      definition: {
        kind: "object",
        fields: [{
          name: "start",
          type: {
            kind: "named",
            name: "MerlinPosition"
          },
          optional: true
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "MerlinPosition"
          },
          optional: true
        }, {
          name: "valid",
          type: {
            kind: "boolean"
          },
          optional: false
        }, {
          name: "message",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "type",
          type: {
            kind: "union",
            types: [{
              kind: "string-literal",
              value: "type"
            }, {
              kind: "string-literal",
              value: "parser"
            }, {
              kind: "string-literal",
              value: "env"
            }, {
              kind: "string-literal",
              value: "warning"
            }, {
              kind: "string-literal",
              value: "unknown"
            }]
          },
          optional: false
        }]
      }
    },
    MerlinOutline: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 36
      },
      name: "MerlinOutline",
      definition: {
        kind: "object",
        fields: [{
          name: "start",
          type: {
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          name: "end",
          type: {
            kind: "named",
            name: "MerlinPosition"
          },
          optional: false
        }, {
          name: "kind",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "name",
          type: {
            kind: "string"
          },
          optional: false
        }, {
          name: "children",
          type: {
            kind: "array",
            type: {
              kind: "named",
              name: "MerlinOutline"
            }
          },
          optional: false
        }]
      }
    },
    MerlinCases: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 44
      },
      name: "MerlinCases",
      definition: {
        kind: "tuple",
        types: [{
          kind: "object",
          fields: [{
            name: "start",
            type: {
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }, {
            name: "end",
            type: {
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }]
        }, {
          kind: "string"
        }]
      }
    },
    MerlinOccurrences: {
      kind: "alias",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 54
      },
      name: "MerlinOccurrences",
      definition: {
        kind: "array",
        type: {
          kind: "object",
          fields: [{
            name: "start",
            type: {
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }, {
            name: "end",
            type: {
              kind: "named",
              name: "MerlinPosition"
            },
            optional: false
          }]
        }
      }
    },
    pushDotMerlinPath: {
      kind: "function",
      name: "pushDotMerlinPath",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 59
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 59
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "any"
            }
          }
        }
      }
    },
    pushNewBuffer: {
      kind: "function",
      name: "pushNewBuffer",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 64
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 64
        },
        kind: "function",
        argumentTypes: [{
          name: "name",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "content",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "any"
            }
          }
        }
      }
    },
    locate: {
      kind: "function",
      name: "locate",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 72
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 72
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "col",
          type: {
            kind: "number"
          }
        }, {
          name: "kind",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "object",
              fields: [{
                name: "file",
                type: {
                  kind: "named",
                  name: "NuclideUri"
                },
                optional: false
              }, {
                name: "pos",
                type: {
                  kind: "object",
                  fields: [{
                    name: "line",
                    type: {
                      kind: "number"
                    },
                    optional: false
                  }, {
                    name: "col",
                    type: {
                      kind: "number"
                    },
                    optional: false
                  }]
                },
                optional: false
              }]
            }
          }
        }
      }
    },
    enclosingType: {
      kind: "function",
      name: "enclosingType",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 92
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 92
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "col",
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
                name: "MerlinType"
              }
            }
          }
        }
      }
    },
    complete: {
      kind: "function",
      name: "complete",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 101
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 101
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "line",
          type: {
            kind: "number"
          }
        }, {
          name: "col",
          type: {
            kind: "number"
          }
        }, {
          name: "prefix",
          type: {
            kind: "string"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "any"
          }
        }
      }
    },
    errors: {
      kind: "function",
      name: "errors",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 111
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 111
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
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
                name: "MerlinError"
              }
            }
          }
        }
      }
    },
    outline: {
      kind: "function",
      name: "outline",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 116
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 116
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
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
                name: "MerlinOutline"
              }
            }
          }
        }
      }
    },
    cases: {
      kind: "function",
      name: "cases",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 123
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 123
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "position",
          type: {
            kind: "named",
            name: "atom$Point"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "MerlinCases"
            }
          }
        }
      }
    },
    occurrences: {
      kind: "function",
      name: "occurrences",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 143
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 143
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "position",
          type: {
            kind: "named",
            name: "atom$Point"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "nullable",
            type: {
              kind: "named",
              name: "MerlinOccurrences"
            }
          }
        }
      }
    },
    runSingleCommand: {
      kind: "function",
      name: "runSingleCommand",
      location: {
        type: "source",
        fileName: "MerlinService.js",
        line: 157
      },
      type: {
        location: {
          type: "source",
          fileName: "MerlinService.js",
          line: 157
        },
        kind: "function",
        argumentTypes: [{
          name: "path",
          type: {
            kind: "named",
            name: "NuclideUri"
          }
        }, {
          name: "command",
          type: {
            kind: "mixed"
          }
        }],
        returnType: {
          kind: "promise",
          type: {
            kind: "any"
          }
        }
      }
    }
  }
});