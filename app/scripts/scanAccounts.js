/*
 Copyright ~ V

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
var PREFIX_GMAIL_URL = 'https://mail.google.com/mail/u/';

function Account(email, url) {
    this.email = email;
    this.url = url;
}

for (var i = 0; i < 10; i++) {
    var htmlString = document.documentElement.innerHTML;
    var url = PREFIX_GMAIL_URL + i;
    var urlIndex = htmlString.indexOf(PREFIX_GMAIL_URL + i);
    if (urlIndex !== -1) {
        var htmlElement = htmlString.substr(urlIndex, htmlString.length);
        var email = htmlElement.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)[0];
        var account = new Account(email, url);
        accounts.push(account);
    }
}

accounts;