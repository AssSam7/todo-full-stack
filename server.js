// Embedding express and mongodb to our application
let express = require("express");
let mongodb = require("mongodb");
let sanitizeHtml = require("sanitize-html");

let app = express();
let db;
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

// Making our app able to access other folders
app.use(express.static("public"));

// Connection to the mongodb
let connectionString =
  "mongodb+srv://m001-student:m001-mongodb-basics@sandbox-zwxrj.mongodb.net/TodoApp?retryWrites=true&w=majority";
mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    db = client.db();

    // Making the app listen on the port no. 3000 local and remote dynamically
    app.listen(port);
  }
);

// Boilerplate to body object access
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Home page request (GET)
function passwordProtected(req, res, next) {
  res.set("WWW-Authenticate", 'Basic realm="Simple ToDo App"');
  console.log(req.headers.authorization);
  if (req.headers.authorization == "Basic bGVhcm46amF2YXNjcmlwdA==") {
    next();
  } else {
    res.status(401).send("Authentication required!");
  }
}

app.get("/", passwordProtected, (req, res) => {
  db.collection("items")
    .find()
    .toArray((err, items) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Simple To-Do App</title>
          <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
          <style>
            body {
              background: #83a4d4;  /* fallback for old browsers */
              background: -webkit-linear-gradient(to right, #b6fbff, #83a4d4);  /* Chrome 10-25, Safari 5.1-6 */
              background: linear-gradient(to right, #b6fbff, #83a4d4); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
            }

            #input-form{
              background: rgba(255, 255, 255, 0.3);
            }

            #item-list li {
              background: rgba(255, 255, 255, 0.5);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="display-4 text-center py-1" style="color: #222">To-Do App</h1>
            
            <div id="input-form" class="jumbotron p-3 shadow-sm">
              <form id="create-form" action="/create-item" method="POST">
                <div class="d-flex align-items-center">
                  <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                  <button class="btn btn-primary">Add New Item</button>
                </div>
              </form>
            </div>
            
            <ul id="item-list" class="list-group pb-5">
            </ul>
            
          </div>

          <script>
                let items = ${JSON.stringify(items)};
          </script>
          
          <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
          <script src="/browser.js"></script>
        </body>
        </html>
    `);
    });
});

// Handling the submit event from the form to perform CRUD to-dos
app.post("/create-item", (req, res) => {
  let safeText = sanitizeHtml(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").insertOne({ text: safeText }, (err, info) => {
    res.json(info.ops[0]);
  });
});

// Handling the request to update the item
app.post("/update-item", (req, res) => {
  let safeText = sanitizeHtml(req.body.text, {
    allowedTags: [],
    allowedAttributes: {},
  });
  db.collection("items").findOneAndUpdate(
    { _id: new mongodb.ObjectId(req.body.id) },
    { $set: { text: safeText } },
    () => {
      res.send("Success!");
    }
  );
});

// Handling the request to delete the item
app.post("/delete-item", function (req, res) {
  db.collection("items").deleteOne(
    { _id: new mongodb.ObjectId(req.body.id) },
    function () {
      res.send("Success");
    }
  );
});
