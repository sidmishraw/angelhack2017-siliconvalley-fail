/**
* tellem.js
* @author sidmishraw
* @description tellem service layer
* @created Sat Jul 29 2017 18:28:30 GMT-0700 (PDT)
*/
(function (exports) {
	"use strict";

	const Request = require("request");
	const sparkpost = require("sparkpost");
	const client = new sparkpost("4369b37febffda316062390cf32c5327584cfee4");

	// queue to hold random passphrase
	let queue = [];

	// Initializing the queue
	queue.push("Apple");
	queue.push("Grapes");
	queue.push("Car");
	queue.push("Star");
	queue.push("Fruits");
	queue.push("Bike");
	queue.push("Chocolate");
	queue.push("Guitar");
	queue.push("Music");
	queue.push("Life");
	queue.push("Love");
	queue.push("Care");
	queue.push("Mouth");
	queue.push("Body");
	queue.push("Soap");
	queue.push("Internet");
	queue.push("Straw");
	queue.push("Girl");
	queue.push("Friend");
	queue.push("Circle");
	queue.push("Club");
	queue.push("Single");
	queue.push("Web");
	queue.push("Lock");
	queue.push("Beautiful");
	queue.push("Mountain");
	queue.push("Night");
	queue.push("Day");
	queue.push("Algorithm");
	queue.push("Mouse");
	queue.push("Computer");

	// tellem dataaccess layer
	const DataAccess = require("./dataaccess.js");

	/**
	 * Gets the passphrase from the queue
	 * 
	 * @param {any} request the incoming request
	 * @param {any} response the outgoing response
	 */

	// function used to activate user over Alexa voice command
	exports.activateUser = function activateUser(request, response) {

		console.log(`BODY:: ${JSON.stringify(request.body)}`);

		let body = request.body;
		let amazonId = body.amazonId;
		let passphrase = body.passphrase;

		DataAccess.activateUser(amazonId, passphrase, response, function (passphrase, response) {

			queue.push(passphrase);

			console.log(`QUEUE:: ${queue.length}`);

			response.send(JSON.stringify(
				{
					"success": "Your account has been successfully activated"
				}
			));
		});
	};

	//function used to get a random pass-phrase and provide that to user
	exports.getPassPhrase = function getPassPhrase(request, response) {

		let tellemObject = request.body["tellem"] ? request.body["tellem"] : {};

		if (queue.length > 0) {

			let passPhrase = queue.shift();

			tellemObject.passphrase = passPhrase.toLowerCase();

			console.log("Pass Phrase is :" + passPhrase.toLowerCase());
		}

		console.log(`Tellem:: ${JSON.stringify(tellemObject)}`);

		DataAccess.createUser(tellemObject, response);
	};

	/**
	 * Finds if the user is registered
	 * 
	 * @param {any} request the incoming request
	 * @param {any} response the outgoing response
	 */
	exports.findUser = function findUser(request, response) {

		console.log(`Body for findUser:: ${JSON.stringify(request.body)}`);

		let body = request.body;

		let amazonId = body["amazonId"];

		DataAccess.findUser(amazonId, response);
	};

	/**
	 * Sends the email through SparkPost API
	 */
	exports.sendMail = function sendMail(request, response) {

		// const API_ENDPOINT = "https://api.sparkpost.com/api/v1/transmissions";
		// const API_KEY = "4369b37febffda316062390cf32c5327584cfee4";

		let subject = `Message from ${request.body["firstname"]}'s through Alexa`;
		let text = request.body["text"];
		let recipients = request.body["recipients"];

		client.transmissions.send({
			"content": {
				"from": {
					"name": request.body["firstname"] + " " + request.body["lastname"],
					"email": request.body["from"]
				},
				"subject": subject,
				"text": text
			},
			"recipients": recipients
		}).then(data => {
			console.log('Congrats you can use our client library!');
			console.log(data);

			response.send({ "success": "Mail sent" });
		}).catch(err => {
			console.log('Whoops! Something went wrong');
			console.log(err);

			response.send({ "error": "Mail wasn't sent" });
		});
	};

	/**
	 * Gets the email using real webhook
	 */
	exports.receiveMail = function receiveMail(request, response) {

		let to_email = request.body[0]["msys"]["relay_message"]["rcpt_to"];
		let name = "";
		let subject = request.body[0]["msys"]["relay_message"]["content"]["subject"];
		let text = request.body[0]["msys"]["relay_message"]["content"]["text"];
		let recipients = "";
		let headers = request.body[0]["msys"]["relay_message"]["content"]["headers"];

		for (let i = 0; i < headers.length; i++) {

			if ("From" in headers[i]) {

				name = headers[i]["From"].split("<")[0].trim();
			}
		}

		DataAccess.getRecipientEmail(to_email, response, (rec_email) => {

			client.transmissions.send({
				"content": {
					"from": {
						"name": name,
						"email": to_email
					},
					"subject": subject,
					"text": text
				},
				"recipients": [{
					"address": rec_email
				}]
			}).then(data => {
				console.log('Congrats you can use our client library!');
				console.log(data);

				response.send({ "success": "Mail sent" });
			}).catch(err => {
				console.log('Whoops! Something went wrong');
				console.log(err);

				response.send({ "error": "Mail wasn't sent" });
			});
		});
	}

}(module.exports));