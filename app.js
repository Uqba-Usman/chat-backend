const express = require("express");
const errorHandlers = require("./handlers/errorHandlers");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require("cors")());

app.use("/user", require("./routes/user"));
app.use("/chatrooms", require("./routes/chatroom"));

app.use(errorHandlers.notFound);
app.use(errorHandlers.mongooseErrors);
if (process.env.ENV === "DEVELOPMENT") {
  app.use(errorHandlers.developmentErrors);
} else {
  app.use(errorHandlers.productionErrors);
}

//Setup Error Handlers

module.exports = app;
