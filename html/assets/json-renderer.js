(function () {
  function formatLabel(value) {
    return String(value).replace(/_/g, " ");
  }

  function getColumnLabel(value) {
    var labels = {
      difficulty_rank: "rank",
      level: "L",
      strength: "str",
      new: "n",
      type: "type",
    };
    return labels[value] || formatLabel(value);
  }

  function getColumnWidth(value) {
    var widths = {
      word: "minmax(320px, 2.2fr)",
      level: "42px",
      strength: "52px",
      difficulty_rank: "58px",
      new: "30px",
      type: "110px",
      score: "70px",
      reviews: "90px",
      result: "120px",
      first: "110px",
      last: "110px",
      next: "110px",
    };
    return widths[value] || "minmax(300px, 1fr)";
  }

  function parseEmbeddedJson() {
    var node = document.getElementById("json-data");
    if (!node) {
      return null;
    }
    var decoder = document.createElement("textarea");
    decoder.innerHTML = node.textContent;
    return JSON.parse(decoder.value);
  }

  function formatPrimitiveString(value) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value.slice(5);
    }
    return value;
  }

  function createPrimitive(value) {
    var span = document.createElement("span");
    if (value === null) {
      span.className = "json-null";
      span.textContent = "";
      return span;
    }

    if (typeof value === "string") {
      span.className = "json-string";
      span.textContent = formatPrimitiveString(value);
      return span;
    }

    if (typeof value === "number") {
      span.className = "json-number";
      span.textContent = String(value);
      return span;
    }

    if (typeof value === "boolean") {
      span.className = "json-boolean";
      span.textContent = String(value);
      return span;
    }

    span.textContent = String(value);
    return span;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isArrayOfPlainObjects(value) {
    return Array.isArray(value) && value.length > 0 && value.every(isPlainObject);
  }

  function isWordRecord(value) {
    return isPlainObject(value) && ("en" in value || "word" in value);
  }

  function isArrayOfWordRecords(value) {
    return Array.isArray(value) && value.length > 0 && value.every(isWordRecord);
  }

  function unwrapSingleRootField(value) {
    if (!isPlainObject(value)) {
      return value;
    }

    var keys = Object.keys(value);
    if (keys.length !== 1) {
      return value;
    }

    var first = value[keys[0]];
    if (Array.isArray(first) || isPlainObject(first)) {
      return first;
    }

    return value;
  }

  function collectColumns(items) {
    var columns = [];
    items.forEach(function (item) {
      Object.keys(item).forEach(function (key) {
        if (key === "inserted") {
          return;
        }
        if (!columns.includes(key)) {
          columns.push(key);
        }
      });
    });
    return columns;
  }

  function formatValueForLine(value) {
    if (value === null || value === undefined || value === "") {
      return "";
    }

    if (Array.isArray(value)) {
      return value.map(formatValueForLine).filter(Boolean).join(", ");
    }

    if (typeof value === "string") {
      return formatPrimitiveString(value);
    }

    return String(value);
  }

  function appendTextBlock(parent, className, text, strongPrefix) {
    if (!text) {
      return;
    }

    var line = document.createElement("div");
    line.className = className;

    if (strongPrefix) {
      var strong = document.createElement("strong");
      strong.textContent = strongPrefix;
      line.appendChild(strong);
      line.appendChild(document.createTextNode(" - " + text));
    } else {
      line.textContent = text;
    }

    parent.appendChild(line);
  }

  function buildLabeledLine(label, value) {
    var text = formatValueForLine(value);
    if (!text) {
      return "";
    }
    return label + " " + text;
  }

  function renderWordRecordList(items, key) {
    var wrapper = document.createElement("article");
    wrapper.className = "json-node";

    if (key !== undefined) {
      var title = document.createElement("h3");
      title.className = "json-key";
      title.textContent = formatLabel(key);
      wrapper.appendChild(title);
    }

    var list = document.createElement("div");
    list.className = "word-record-list";

    var metaLabelMap = {
      inserted: "ins.",
      first: "first",
      last: "last",
      next: "next",
      reviews: "rev.",
      result: "res.",
      score: "scr.",
      strength: "str.",
      difficulty_rank: "rank",
      level: "lvl",
      new: "new",
    };

    items.forEach(function (item) {
      var card = document.createElement("article");
      card.className = "word-record";

      var primary = item.en || item.word || "";
      var secondary = formatValueForLine(item.cz || item.type || "");
      appendTextBlock(card, "word-line word-main", secondary, primary);

      var lineTwo = [];
      ["explanation", "example_sentence", "example"].forEach(function (field) {
        if (field in item) {
          var text = formatValueForLine(item[field]);
          if (text) {
            lineTwo.push(text);
          }
        }
      });
      appendTextBlock(card, "word-line word-detail", lineTwo.join(" | "));

      var lineThree = [];
      ["usage_context", "usage_content", "context"].forEach(function (field) {
        if (field in item) {
          var text = formatValueForLine(item[field]);
          if (text) {
            lineThree.push(text);
          }
        }
      });
      var synLine = buildLabeledLine("syn:", item.synonyms);
      var antLine = buildLabeledLine("ant:", item.antonyms);
      if (synLine) {
        lineThree.push(synLine);
      }
      if (antLine) {
        lineThree.push(antLine);
      }
      appendTextBlock(card, "word-line word-subdetail", lineThree.join(" | "));

      var metaValues = [];
      Object.keys(metaLabelMap).forEach(function (field) {
        if (field in item) {
          var metaText = formatValueForLine(item[field]);
          if (metaText) {
            metaValues.push(metaLabelMap[field] + " " + metaText);
          }
        }
      });

      appendTextBlock(card, "word-line word-meta", metaValues.join("   "));
      list.appendChild(card);
    });

    wrapper.appendChild(list);
    return wrapper;
  }

  function renderInlineValue(value) {
    if (Array.isArray(value)) {
      var list = document.createElement("div");
      list.className = "json-inline-list";
      value.forEach(function (item) {
        if (isPlainObject(item) || Array.isArray(item)) {
          list.appendChild(renderValue(item));
        } else {
          list.appendChild(createPrimitive(item));
        }
      });
      return list;
    }

    if (isPlainObject(value)) {
      return renderValue(value);
    }

    return createPrimitive(value);
  }

  function renderObjectList(items, key) {
    var wrapper = document.createElement("article");
    wrapper.className = "json-node";

    if (key !== undefined) {
      var title = document.createElement("h3");
      title.className = "json-key";
      title.textContent = formatLabel(key);
      wrapper.appendChild(title);
    }

    var meta = document.createElement("p");
    meta.className = "json-meta";
    meta.textContent = items.length + " item(s)";
    wrapper.appendChild(meta);

    var columns = collectColumns(items);
    var table = document.createElement("div");
    table.className = "json-table";
    table.style.gridTemplateColumns = columns.map(getColumnWidth).join(" ");

    columns.forEach(function (column) {
      var head = document.createElement("div");
      head.className = "json-head";
      head.classList.add("col-" + column.replace(/[^a-z0-9]+/gi, "-").toLowerCase());
      head.textContent = getColumnLabel(column);
      table.appendChild(head);
    });

    items.forEach(function (item) {
      columns.forEach(function (column) {
        var cell = document.createElement("div");
        cell.className = "json-cell";
        cell.classList.add("col-" + column.replace(/[^a-z0-9]+/gi, "-").toLowerCase());
        if (column === "word") {
          cell.classList.add("is-word");
        }
        if (column in item) {
          cell.appendChild(renderInlineValue(item[column]));
        } else {
          cell.appendChild(createPrimitive(""));
        }
        table.appendChild(cell);
      });
    });

    wrapper.appendChild(table);
    return wrapper;
  }

  function renderValue(value, key) {
    if (key === "root") {
      return renderValue(value);
    }

    var wrapper = document.createElement("article");
    wrapper.className = "json-node";

    if (key !== undefined) {
      var title = document.createElement("h3");
      title.className = "json-key";
      title.textContent = formatLabel(key);
      wrapper.appendChild(title);
    }

    if (Array.isArray(value)) {
      if (isArrayOfWordRecords(value)) {
        return renderWordRecordList(value, key);
      }

      if (isArrayOfPlainObjects(value)) {
        return renderObjectList(value, key);
      }

      var meta = document.createElement("p");
      meta.className = "json-meta";
      meta.textContent = value.length + " item(s)";
      wrapper.appendChild(meta);

      var list = document.createElement("div");
      list.className = "json-array";
      value.forEach(function (item) {
        list.appendChild(renderValue(item));
      });
      wrapper.appendChild(list);
      return wrapper;
    }

    if (value && typeof value === "object") {
      var entries = Object.entries(value);
      var metaObj = document.createElement("p");
      metaObj.className = "json-meta";
      metaObj.textContent = entries.length + " field(s)";
      wrapper.appendChild(metaObj);

      var grid = document.createElement("div");
      grid.className = "json-object";
      entries.forEach(function (entry) {
        var row = document.createElement("div");
        row.className = "json-row";

        var label = document.createElement("div");
        label.className = "json-label";
        label.textContent = formatLabel(entry[0]);
        row.appendChild(label);

        var content = document.createElement("div");
        content.className = "json-value";
        if (entry[1] && typeof entry[1] === "object") {
          content.appendChild(renderValue(entry[1]));
        } else {
          content.appendChild(createPrimitive(entry[1]));
        }

        row.appendChild(content);
        grid.appendChild(row);
      });
      wrapper.appendChild(grid);
      return wrapper;
    }

    wrapper.appendChild(createPrimitive(value));
    return wrapper;
  }

  var target = document.getElementById("json-root");
  if (!target) {
    return;
  }

  try {
    var data = unwrapSingleRootField(parseEmbeddedJson());
    target.appendChild(renderValue(data));
  } catch (error) {
    var message = document.createElement("p");
    message.className = "json-error";
    message.textContent = "Failed to parse embedded JSON: " + error.message;
    target.appendChild(message);
  }
})();
