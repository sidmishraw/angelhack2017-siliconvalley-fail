/**
* main.js
* @author sidmishraw
* @description Main entry point of the tellem webapp
* @created Sat Jul 29 2017 17:49:04 GMT-0700 (PDT)
*/
(function () {
  "use strict";

  const express = require("express");
  const path = require("path");
  const favicon = require("serve-favicon");
  const logger = require("morgan");
  const cookieParser = require("cookie-parser");
  const bodyParser = require("body-parser");

  // tellem modules
  const Tellem = require("./routes/tellem.js");

  // intialize the node express application
  const app = express();

  // configure the app
  app.use(logger("dev"));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));

  // setup the view engine
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "pug");

  app.get("/", (request, response) => {

    console.log(`Request:: ${JSON.stringify(request.body)}`);

    response.render("layout");
  });

  /**
   * API endpoint for firsttime user account creation
   */
  app.post("/firstTimeUser", (request, response) => {

    try {

      console.log(`before:: ${JSON.stringify(request.body)}`);

      request.body.tellem = {};

      request.body.tellem["actualEmailId"] = request.body["actualEmailId"];
      request.body.tellem["bouncingEmail"] = request.body["bouncingEmail"] + "@aymlab.com";
      request.body.tellem["firstname"] = request.body["firstname"];
      request.body.tellem["lastname"] = request.body["lastname"];
      request.body.tellem["contacts"] = request.body["contacts"] ? JSON.parse(request.body["contacts"]) : [];
      request.body.tellem["passphrase"] = "";
      request.body.tellem["amazonId"] = "";

      Tellem.getPassPhrase(request, response);
    } catch (e) {

      console.log(`ERROR:: ${JSON.stringify(e)}`);

      response.send(JSON.stringify(
        {
          "error": "OOPS!"
        }
      ));
    }
  });

  /**
   * API user for finding if the user is activated
   */
  app.post("/findUser", (request, response) => {

    try {

      Tellem.findUser(request, response);
    } catch (e) {

      console.log(`ERROR:: ${JSON.stringify(e)}`);

      response.send(JSON.stringify(
        {
          "error": "OOPS!"
        }
      ));
    }
  });

  /**
   * API user for activating the user
   */
  app.post("/activateUser", (request, response) => {

    try {

      Tellem.activateUser(request, response);
    } catch (e) {

      console.log(`ERROR:: ${JSON.stringify(e)}`);

      response.send(JSON.stringify(
        {
          "error": "OOPS!"
        }
      ));
    }
  });

  /**
   * API user for activating the user
   */
  app.post("/sendMail", (request, response) => {

    try {

      Tellem.sendMail(request, response);
    } catch (e) {

      console.log(`ERROR:: ${JSON.stringify(e)}`);

      response.send(JSON.stringify(
        {
          "error": "OOPS!"
        }
      ));
    }
  });

  /**
   * API user for activating the user
   */
  app.post("/receiveMail", (request, response) => {

    try {

      Tellem.receiveMail(request, response);
    } catch (e) {

      console.log(`ERROR:: ${JSON.stringify(e)}`);

      response.send(JSON.stringify(
        {
          "error": "OOPS!"
        }
      ));
    }
  });


  process.title = "tellem_BE";

  app.listen(3030);
}());