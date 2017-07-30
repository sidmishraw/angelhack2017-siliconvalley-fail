/**
* dataaccess.js
* @author sidmishraw
* @description the data-access layer of the tellem webapp
* @created Sat Jul 29 2017 18:48:54 GMT-0700 (PDT)
*/
(function (exports) {
	"use strict";

	// imports
	const NeDB = require("nedb");
	const fs = require("fs");
	const path = require("path");

	// Datastore filepath
	const currentDir = __dirname;

	// Datastore folder name
	const dataStoreBaseDir = path.join("/"
		+ __dirname.split(path.sep)
			.filter(x => x.length > 0).slice(0, -1).join(path.sep), "datastore");

	/**
	 * Persists the tellemObject -- user details to the NeDB
	 * 
	 * @param {any} tellemObject the incoming tellemobject containing all the 
	 * user details to be persisted into the NeDB
	 * @param {any} response the outgoing response
	 */
	exports.createUser = function createUser(tellemObject, response) {

		console.log(`Using datastore:: ${dataStoreBaseDir}`);

		let db = new NeDB(path.join(dataStoreBaseDir, "users.db"));

		db.loadDatabase(function (error) {

			if (error) {

				console.log(`ERROR:: Error while creating user -- persisting:: ${JSON.stringify(error)}`);

				response.render(
					"error",
					{
						"message": "Failed to create user, try again after some time"
					}
				);
			} else {

				db.insert(tellemObject, (innerError, newDocument) => {

					if (innerError) {

						console.log(`ERROR:: Error while creating user -- persisting:: ${JSON.stringify(error)}`);

						response.render(
							"error",
							{
								"message": "Failed to create user, try again after some time"
							}
						);
					} else {

						console.log(`Success:: passphrase = ${newDocument["passphrase"]}`);

						response.render(
							"registered",
							{
								"passphrase": newDocument["passphrase"].toLowerCase()
							}
						);
					}
				});
			}
		});
	};

	/**
	 * Activates the user by updating their amazonId and brings the passphrase queue to be reused
	 * 
	 * @param {string} amazonUserId the amazon userId of the Alexa user
	 * @param {string} passphrase the passphrase
	 * @param {any} response the outgoing response
	 * @param {any} callback the callback to be executed after a successful update
	 */
	exports.activateUser = function activateUser(amazonUserId, passphrase, response, callback) {

		console.log(`Using datastore:: ${dataStoreBaseDir}`);

		console.log(`Activate user:: amazonId:: ${amazonUserId}`);

		let db = new NeDB(path.join(dataStoreBaseDir, "users.db"));

		db.loadDatabase(function (error) {

			if (error) {

				console.log(`ERROR:: Error occurred:: ${JSON.stringify(error)}`);

				response.send(JSON.stringify(
					{
						"error": "OOPS! Unable to activate user!"
					}
				));
			} else {

				db.update(
					{
						"passphrase": passphrase.toLowerCase()
					},
					{
						$set: {
							"passphrase": "",
							"amazonId": amazonUserId
						}
					},
					{},
					(innerError, numReplaced) => {

						if (innerError || numReplaced == 0) {

							console.log(`ERROR:: Failed while retrieving something.`);

							response.send(JSON.stringify(
								{
									"error": "OOPS! Unable to activate user!"
								}
							));
						} else {

							console.log(`ERROR:: Docs replaced = ${numReplaced}`);

							callback(passphrase, response);
						}
					}
				)
			}
		});
	};

	/**
	 * Finds the user from the amazonId
	 * 
	 * @param {string} amazonId the amazonId
	 * @param {any} response the outgoing response
	 */
	exports.findUser = function findUser(amazonId, response) {

		console.log(`Using datastore:: ${dataStoreBaseDir}`);

		console.log(`AmazonId:: ${amazonId}`);

		let db = new NeDB(path.join(dataStoreBaseDir, "users.db"));

		db.loadDatabase(function (error) {

			if (error) {

				console.log(`ERROR:: Error while creating user -- persisting:: ${JSON.stringify(error)}`);

				response.send(JSON.stringify(
					{
						"error": "DB error"
					}
				));
			} else {

				db.find({ "amazonId": amazonId }, (innerError, docs) => {

					if (innerError) {

						console.log(`ERROR:: ${innerError}`);

						response.send(JSON.stringify({
							"error": "DB error"
						}));
					} else {

						if (docs.length > 0) {

							response.send(
								JSON.stringify({
									"success": "user active",
									"user": docs[0]
								})
							);
						} else {

							response.send(JSON.stringify({
								"error": "DB error"
							}));
						}
					}
				});
			}
		});
	}

	/**
	 * 
	 */
	exports.getRecipientEmail = function getRecipientEmail(to_email, response, callback) {

		console.log(`Using datastore:: ${dataStoreBaseDir}`);

		let db = new NeDB(path.join(dataStoreBaseDir, "users.db"));

		db.loadDatabase(function (error) {

			if (error) {

				console.log(`ERROR:: Error while accessing DB :: ${JSON.stringify(error)}`);

				response.send(JSON.stringify(
					{
						"error": "DB error"
					}
				));
			} else {

				db.find({ "bouncingEmail": to_email }, (innerError, docs) => {

					if (innerError) {

						console.log(`ERROR:: ${innerError}`);

						response.send(JSON.stringify({

							"error": "DB error"
						}));
					} else {

						if (docs.length > 0) {

							callback(docs[0]["actualEmailId"]);
						} else {

							response.send(JSON.stringify({

								"error": "DB error"
							}));
						}
					}
				});
			}
		});
	}
}(module.exports));

