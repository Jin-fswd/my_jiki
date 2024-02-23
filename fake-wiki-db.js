let pages = {
  init: {
    code_name: "init",
    name: "init",
    contents: "This is a simple initial page to prove that pages work",
  },
  testname: {
    code_name: "testname",
    name: "testname",
    contents: "test contents siuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu",
  },
  testwikiLink: {
    code_name: "testwikiLink",
    name: "testwikiLink",
    contents:
      "testwikiLink   " + "Your WikiLink and http://example.com content",
  },
  Jin: {
    code_name: "Jin",
    name: "Jin",
    contents: "im jin hi",
  },
  Jinswife: {
    code_name: "Jinswife",
    name: "Jinswife",
    contents: "im jinswife hello there",
  },
};

function debug_db() {
  // This function might be useful to call from index.js for debugging, idk
  console.log(JSON.stringify(pages, null, 2));
}

function article_getByEncodedName(code_name) {
  return pages[code_name] || pages[encodeURIComponent(code_name)];
}

function article_create(name, contents) {
  if (pages[name]) {
    throw new Error("page already exists");
  }
  let code_name = encodeURIComponent(name);
  pages[code_name] = {
    code_name,
    name,
    contents,
  };
  return pages[code_name];
}

function article_deleteByEncodedName(code_name) {
  if (pages[code_name]) {
    delete pages[code_name];
  } else {
    throw new Error("page does not exist");
  }
}

function article_editByEncodedName(code_name, contents) {
  if (pages[code_name]) {
    pages[code_name].contents = contents;
    return pages[code_name];
  } else {
    throw new Error("page does not exist");
  }
}

function article_searchByTerms(searchterms) {
  let results = Object.values(pages);
  for (let term of searchterms) {
    if (term.length > 0) {
      results = results.filter((a) => a.contents.includes(term));
    }
  }

  return results;
}

function article_getRandoms(n) {
  let results_index_set = new Set();
  let pages_array = Object.values(pages);
  while (results_index_set.size < Math.min(n, pages_array.length)) {
    results_index_set.add(Math.floor(Math.random() * pages_array.length));
  }
  return Array.from(results_index_set).map((i) => pages_array[i]);
}

module.exports = {
  article_getByEncodedName,
  article_create,
  article_deleteByEncodedName,
  article_editByEncodedName,
  article_searchByTerms,
  article_getRandoms,
  debug_db,
};
