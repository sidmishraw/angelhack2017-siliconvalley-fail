/**
* handler.js
* @author sidmishraw
* @description js handler
* @created Sat Jul 29 2017 21:50:56 GMT-0700 (PDT)
*/
(function () {
	"use strict";

	let count = 0;
	let contacts = [];

	$.noConflict();

	jQuery("document").ready(function () {

		console.log("jquery loaded");

		jQuery("#actualEmailId").unbind("change").bind("change", function (event) {

			event.preventDefault();

			let emailId = jQuery("#actualEmailId").val();
			let userId = emailId.split("@")[0];
			let domain = emailId.split("@")[1].split(".")[0];
			let bouncingEmailId = userId + "_" + domain;

			jQuery("#bouncingEmail").val(bouncingEmailId);
		});

		jQuery("#addContact").unbind("click").bind("click", function (event) {

			event.preventDefault();

			let nickname = jQuery("#nickname").val();
			let email = jQuery("#newContactEmail").val();

			jQuery("#contactList").append(
				"<li>" +
				"<label>" + nickname + "</label>&nbsp;" +
				"<label> " + email + "</label>" +
				"</li>"
			);

			contacts.push(
				{
					"nickname": nickname,
					"email": email
				}
			);

			jQuery("#nickname").val("");
			jQuery("#newContactEmail").val("");

			jQuery("#contacts").val(JSON.stringify(contacts));

			count++;
		});
	});
}());