const db = require("./fake-wiki-db");
const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
app.set("views", path.join(__dirname, "views")); //* create directories for views, and if necessary for static, etc, and make sure those directory names match your express setup
app.set("view engine", "ejs"); // * get express set up to use EJS for the view engine
app.use(express.static(path.join(__dirname, "public")));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded()); //  get body-parser working (import, app.use) and the same for `express.static` if you need it

const makeClickable = (articleName) => {
  const pages = db.article_getByEncodedName(articleName);
  let result = pages.contents;

  // Convert wikilinks
  result = result.replace(
    /\b([A-Z][a-z]+){2,}\b/g,
    '<a href="./clicklink/$&">$&</a>'
  );

  // Convert external links
  result = result.replace(
    /https?:\/\/\S+/g,
    '<a href="$&" target="_blank">$&</a>'
  );

  const data = {
    code_name: pages.code_name,
    name: pages.name,
    contents: result,
  };

  return data;
};

const validChracter = (title, content, dist = "optional") => {
  if (!title.trim() || title.includes(" ")) {
    return {
      valid: "Title must not be empty and must not contain any spaces.",
      errorCode: `beaver`,
    };
  }

  if (!content.trim()) {
    return { valid: "Content should not be empty.", errorCode: `hamster` };
  }

  if (dist === "create" && db.article_getByEncodedName(title)) {
    return { valid: `Duplicate article name ${title}`, errorCode: `dog` };
  }

  const regex = /[^a-zA-Z0-9_]/;
  if (regex.test(title)) {
    return {
      valid:
        "Title contains invalid characters. Only letters, numbers, and underscores are allowed.",
      errorCode: `cat`,
    };
  }

  return { valid: true };
};
app.get("/", function (req, res) {
  const article = db.article_getRandoms(5);
  res.render("index.ejs", { article });
});
//------------------------read-------------------------
app.get("/article/:articlename", function (req, res) {
  const articlename = req.params.articlename;
  const article = makeClickable(articlename);
  res.render(`init.ejs`, { article });
});
app.get("/article/clicklink/:articlename", function (req, res) {
  const articlename = req.params.articlename;
  if (!db.article_getByEncodedName(articlename)) {
    res.render(`new_article.ejs`, { articlename: articlename });
  } else {
    const article = makeClickable(articlename);
    res.render(`init.ejs`, { article });
  }
});
//------------------------create------------------------
app.get("/newarticle", function (req, res) {
  res.render("new_article.ejs", { articlename: "" });
});
app.post("/newarticle", (req, res) => {
  const params = req.body;
  const title = params.title;
  const contents = params.contents;
  const valid = validChracter(title, contents, "create");
  if (valid.valid === true) {
    db.article_create(title, contents, "create");
    res.redirect("/");
  } else {
    res.send(`${valid.valid} error code: ${valid.errorCode}`);
  }
});
//------------------------edit------------------------
app.get("/article/:articlename/edit", function (req, res) {
  const articlename = req.params.articlename;
  const article = db.article_getByEncodedName(articlename);
  res.render(`edit_article.ejs`, { article });
});
app.post("/article/:articlename/edit", (req, res) => {
  const params = req.body;
  const originalTitle = req.params.articlename;
  const title = params.title;
  if (title !== originalTitle) {
    return res.send("The title cannot be changed");
  }
  const article = db.article_getByEncodedName(title);
  if (!article) {
    return res.send("The article does not exist and cannot be modified.");
  }
  const contents = params.contents;
  const valid = validChracter(title, contents, "edit");
  if (valid.valid === true) {
    db.article_editByEncodedName(title, contents);
    const article = makeClickable(title);
    res.render(`init.ejs`, { article });
  } else {
    res.send(`${valid.valid} error code: ${valid.errorCode}`);
  }
});
//------------------------delete----------------------
app.get("/article/:articlename/delete", function (req, res) {
  const articlename = req.params.articlename;
  const article = db.article_getByEncodedName(articlename);
  res.render(`delete.ejs`, { article });
});
app.post("/article/:articlename/delete", (req, res) => {
  const params = req.body;
  const title = params.title;
  const article = db.article_getByEncodedName(title);
  if (!article) {
    return res.send("The article does not exist and cannot be modified.");
  }
  const valid = validChracter(title, "true");
  if (valid.valid === true) {
    db.article_deleteByEncodedName(title);
    res.redirect("/");
  } else {
    res.send(`${valid.valid} error code: ${valid.errorCode}`);
  }
});
//------------------------search----------------------
app.get("/search", (req, res) => {
  const term = req.query.term;
  const article = db.article_searchByTerms(term);
  res.render("search_result.ejs", { article, term });
});
app.listen(3000);
