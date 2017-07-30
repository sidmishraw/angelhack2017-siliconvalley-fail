// Author: Michael Symonds
// July 30, 2017


'use strict'

var Alexa = require('alexa-sdk');
//var UserFinder = require('./UserFinder');
let Request = require("request");

var APP_ID = undefined;
//var recipient = null;
//var msgContent = null;
var HELP_MESSAGE = "Give me a name and a message and I'll send that message to the person you name. Say send a message.";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Goodbye!";
var recipient = null;
var content = null;
var myUser = null;
var HelpMessage = 'unhandled exception was called';

exports.handler = function (event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.APP_ID = APP_ID;
  alexa.registerHandlers(handlers, verifiedUserModeHandlers, needPasswordModeHandlers);
  alexa.execute();
};

var states = {
  VERIFIEDUSERMODE: '_VERIFIEDUSERMODE', // User has been verfied.
  NEEDPASSWORDMODE: '_NEEDPASSWORDMODE'   // user needs to be verified
};

var handlers = {
  'LaunchRequest': function () {
    this.emit('LaunchIntent');
  },
  'HandshakeIntent': function () {
    var userId = null; //this.event.session.user.userId;
    if (this.event.request.intent.slots.name === undefined) {
      userId = 'recipient slot is undefined';
    } else {
      userId = 'recipient slot is: ' + this.event.request.intent.slots.name.value;
    }
    let x = "";
    //Request.get("http://ec2-34-212-93-88.us-west-2.compute.amazonaws.com:3030/", (error, response, body) => {
    //  x = body;
    //  this.emit(':tell', 'handshake request sent, the response is ' + userId + "     " + x);
    //});
    this.emit(':tell', userId);
  },
  'LaunchIntent': function () {
    //this.handler.state = states.NEEDPASSWORDMODE
    recipient = null;
    content = null;
    this.emit('verifyUserIntent');
  },
  'LaunchWithRecipientIntent': function () {
    content = null;
    recipient = this.event.request.intent.slots.name.value;
    //this.handler.state = states.NEEDPASSWORDMODE
    this.emit('verifyUserIntent');
  },
  'LaunchWithRecipientAndContentIntent': function () {
    recipient = this.event.request.intent.slots.name.value;
    content = this.event.request.intent.slots.content.value;
    //this.handler.state = states.NEEDPASSWORDMODE
    this.emit('verifyUserIntent');
  },
  'verifyUserIntent': function () {
    var userId = this.event.session.user.userId;
    Request(
      {
        "method": "POST",
        "uri": "http://ec2-34-212-93-88.us-west-2.compute.amazonaws.com:3030/findUser",
        "form": { "amazonId": userId }
      }, (error, response, body) => {

        body = JSON.parse(body);

        if (error) {
          // handle request error
          this.emit(':tell', 'Oh snap, I done got broke trying to make an HTML request!');
        } else {
          if (body.error) {
            // handle no user found
            let speechOutput = 'As a new user, please say the validation word you were given when you registered on the webservice.';
            let repromptSpeech = 'You never registered on the servie, did you? Wow, you are a prize.';
            this.handler.state = states.NEEDPASSWORDMODE;
            this.emit(':ask', speechOutput, repromptSpeech);
          } else if (body.success) {
            // handle success
            myUser = body.user;
            this.handler.state = states.VERIFIEDUSERMODE
            this.emit('processVerifiedUserIntent');
          } else {
            // default to some 
            this.emit(':tell', 'Oh snap, I done got broke trying to make an HTML request!');
          }
        }
      }
    )
  },
  'processVerifiedUserIntent': function () {
    if (!recipient && this.event.request.intent.slots.name != null) {
      recipient = this.event.request.intent.slots.name.value;
    }
    if (!content && this.event.request.intent.slots.content != null) {
      content = this.event.request.intent.slots.content.value;
    }

    if (recipient === null) {
      this.emit(':ask', '(handlers)Who am I sending your message to?');
    }
    if (content === null) {
      // get content from user
      let speech = '(handlers)What do you want to say to ' + recipient + '?';
      this.emit(':ask', speech, speech);
    }

    // request email service with nickname and content
    if (recipient != null && content != null) {

      let mycontent = content;
      let email = myUser["bouncingEmail"];
      let firstname = myUser["firstname"];
      let lastname = myUser["lastname"];
      let recipients = [];

      for (let i = 0; i < myUser["contacts"].length; i++) {
        if (myUser["contacts"][i]["nickname"].toLowerCase() == recipient.toLowerCase()) {
          recipients.push(
            {
              "address": myUser["contacts"][i]["email"]
            }
          );
        }
      }

      Request(
        {
          "method": "POST",
          "uri": "http://ec2-34-212-93-88.us-west-2.compute.amazonaws.com:3030/sendMail",
          "form": {
            "from": email,
            "recipients": recipients,
            "firstname": firstname,
            "lastname": lastname,
            "text": mycontent
          }
        }, function (error, response, body) {

          if (error) {

            this.emit(":tell", "Shit up fucked up yo! I mailed it up my butt!");
          } else {

            if (body.length > 0) {

              this.emit(':tell', 'the message for ' + recipient + 'is as follows: ' + mycontent);
            } else {

              this.emit(':tell', 'the message was not delivered for some reason ');
            }
          }
        }
      );
    }
  },
  'AMAZON.HelpIntent': function () {
    var speechOutput = HELP_MESSAGE;
    var reprompt = HELP_REPROMPT;
    this.emit(':ask', speechOutput, reprompt);
  },
  'AMAZON.CancelIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  },
  'AMAZON.StopIntent': function () {
    this.emit(':tell', STOP_MESSAGE);
  }
};

var verifiedUserModeHandlers = Alexa.CreateStateHandler(states.VERIFIEDUSERMODE, {
  'processVerifiedUserIntent': function () {
    if (!recipient && this.event.request.intent.slots.name != null) {
      recipient = this.event.request.intent.slots.name.value;
    }
    if (!content && this.event.request.intent.slots.content != null) {
      content = this.event.request.intent.slots.content.value;
    }

    if (recipient === null) {
      this.emit(':ask', '(VerfiedUsrs)Who am I sending your message to?');
    }
    if (content === null) {
      // get content from user
      let speech = '(VerfiedUsrs)What do you want to say to ' + recipient + '?';
      this.emit(':ask', speech, speech);
    }

    // request email service with nickname and content
    if (recipient != null && content != null) {

      let mycontent = content;
      let email = myUser["bouncingEmail"];
      let firstname = myUser["firstname"];
      let lastname = myUser["lastname"];
      let recipients = [];

      for (let i = 0; i < myUser["contacts"].length; i++) {
        if (myUser["contacts"][i]["nickname"].toLowerCase() == recipient.toLowerCase()) {
          recipients.push(
            {
              "address": myUser["contacts"][i]["email"]
            }
          );
        }
      }

      Request(
        {
          "method": "POST",
          "uri": "http://ec2-34-212-93-88.us-west-2.compute.amazonaws.com:3030/sendMail",
          "form": {
            "from": email,
            "recipients": recipients,
            "firstname": firstname,
            "lastname": lastname,
            "text": mycontent
          }
        }, function (error, response, body) {

          if (error) {

            this.emit(":tell", "Shit up fucked up yo! I mailed it up my butt!");
          } else {

            if (body.length > 0) {

              this.emit(':tell', 'the message for ' + recipient + 'is as follows: ' + mycontent);
            } else {

              this.emit(':tell', 'the message was not delivered for some reason ');
            }
          }
        }
      );
    }
  }

});

var needPasswordModeHandlers = Alexa.CreateStateHandler(states.NEEDPASSWORDMODE, {
  'Unhandled': function () {
    this.emit(':ask', HelpMessage, HelpMessage);
  },
  'verifyUserIntent': function () {
    var userId = this.event.session.user.userId;
    let x = "";

  },
  'verifyPasswordIntent': function () {
    var password = this.event.request.intent.slots.password.value;
    var userId = this.event.session.user.userId;

    // send userId and password to webservice and get back good or bad result and act accordingly
    Request(
      {
        "method": "POST",
        "uri": "http://ec2-34-212-93-88.us-west-2.compute.amazonaws.com:3030/activateUser",
        "form": { "amazonId": userId, "passphrase": password }
      }, (error, response, body) => {

        body = JSON.parse(body);

        if (error) {
          // handle request error
          this.emit(':tell', 'Oh snap, I done got broke trying to make an HTML request!');
        } else {
          if (body.error) {
            // handle no user found
            let speechOutput = 'Uh-oh, I could not find a match for your password.';
            let repromptSpeech = 'You never registered on the servie, did you? Wow, you are a prize.';
            this.handler.state = states.NEEDPASSWORDMODE;
            this.emit(':tell', speechOutput);
          } else if (body.success) {
            // handle success
            myUser = body.user;
            this.handler.state = states.VERIFIEDUSERMODE;
            this.emit('processVerifiedUserIntent');
          } else {
            // default to some 
            this.emit(':tell', 'Oh snap, I done got broke trying to make an HTML request!');
          }
        }
      }
    )
  },
  'processVerifiedUserIntent': function () {
    if (this.event.request.intent.slots.name != null) {
      recipient = this.event.request.intent.slots.name.value;
    }
    if (this.event.request.intent.slots.content != null) {
      content = this.event.request.intent.slots.content.value;
    }

    if (recipient === null) {
      this.emit(':ask', '(needPassword)Who am I sending your message to?');
    }
    if (content === null) {
      // get content from user
      let speech = '(needPassword)What do you want to say to ' + recipient + '?';
      this.emit(':ask', speech, speech);
    }

    // request email service with nickname and content
    if (recipient != null && content != null) {

      let mycontent = content;
      let email = myUser["bouncingEmail"];
      let firstname = myUser["firstname"];
      let lastname = myUser["lastname"];
      let recipients = [];

      for (let i = 0; i < myUser["contacts"].length; i++) {
        if (myUser["contacts"][i]["nickname"].toLowerCase() == recipient.toLowerCase()) {
          recipients.push(
            {
              "address": myUser["contacts"][i]["email"]
            }
          );
        }
      }

      Request(
        {
          "method": "POST",
          "uri": "http://ec2-34-212-93-88.us-west-2.compute.amazonaws.com:3030/sendMail",
          "form": {
            "from": email,
            "recipients": recipients,
            "firstname": firstname,
            "lastname": lastname,
            "text": mycontent
          }
        }, function (error, response, body) {

          if (error) {

            this.emit(":tell", "Shit up fucked up yo! I mailed it up my butt!");
          } else {

            if (body.length > 0) {

              this.emit(':tell', 'the message for ' + recipient + 'is as follows: ' + mycontent);
            } else {

              this.emit(':tell', 'the message was not delivered for some reason ');
            }
          }
        }
      );
    }
  }
});

