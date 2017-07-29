/*
 Copyright ~ Verdict

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * HTML parser script to get the email.
 * @since 1.0
 */

'use strict';

var accounts = [];
const PREFIX_GMAIL_URL = 'https://mail.google.com/mail/u/';

function Account(email, url) {
    this.email = email;
    this.url = url;
}

// Detect the first current account/email
var htmlString1 = document.documentElement.innerHTML;
var midPosition1 = htmlString1.indexOf('@gmail.com');
var element1 = htmlString1.substr(midPosition1 - 64, midPosition1);
midPosition1 = element1.indexOf('@gmail.com');
element1 = element1.substr(0, midPosition1 + '@gmail.com'.length);
var email1 = element1.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];

var account1 = new Account(email1, PREFIX_GMAIL_URL + '0');
accounts.push(account1);

// Handle the other accounts
for (var i = 1; i < 10; i++) {
    var htmlString = document.documentElement.innerHTML;
    var url = PREFIX_GMAIL_URL + i;
    var urlIndex = htmlString.indexOf(PREFIX_GMAIL_URL + i);
    if (urlIndex !== -1) {
        // Select the HTML element from there
        var htmlElement = htmlString.substr(urlIndex, htmlString.length);

        // Select the email within
        var midPosition = htmlElement.indexOf('@gmail.com');
        var element = htmlElement.substr(midPosition - 64, midPosition);
        midPosition = element.indexOf('@gmail.com');
        element = element.substr(0, midPosition + '@gmail.com'.length);
        var email = element.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];

        // Create the account and store it
        var account = new Account(email, url);
        accounts.push(account);
    }
}

accounts;