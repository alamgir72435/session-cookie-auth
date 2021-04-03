const express = require("express");
const app = express();
const session = require("express-session");
const bcrypt = require("bcryptjs");
// session
const MongodbSession = require("connect-mongodb-session")(session);
const keys = require("./config/keys");
const { isAuthenticated } = require("./helpers/auth");
// Models
const { User } = require("./schema");

// db Connect
const config = require("./config/config");
config.__db_connect();

//
const store = new MongodbSession({
  url: keys.mongo_URI,
  collection: "mySessions",
});

//
app.set("view engine", "ejs");
// session
app.use(
  session({
    secret: "secret",
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  var existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.redirect("/register");
  }

  const hashed = await bcrypt.hash(password, 10);

  const newUser = new User({ name, email, password: hashed });
  const user = await newUser.save();
  if (user) {
    res.redirect("/login");
  } else {
    res.redirect("/register");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.redirect("/login");
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.isAuth = true;
    return res.redirect("/dashboard");
  } else {
    return res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/login");
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`server Running on port ${PORT}`));
