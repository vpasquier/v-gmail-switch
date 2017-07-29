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
 * Main popup script.
 * @since 1.0
 */

'use strict';

/* Gmail Accounts management */

const PREFIX_GMAIL_URL = 'https://mail.google.com/mail/u/';
const COMPLETE = 'complete';
const PARSER_SCRIPT = 'scripts/getPagesSource.js';

var accounts;
var isTheSameCall;


window.onload = function () {
    document.getElementById('refresh').addEventListener('click', refresh);
};

function SwitchGmailException(message) {
    this.message = message;
    this.name = 'SwitchGmailException';
}

// Loading of the accounts to display in the popup (check if its good to put that there like this)
chrome.storage.local.get('account_entries', function (entry) {
    var error = chrome.runtime.lastError;
    if (error) {
        accounts = [];
        throw new SwitchGmailException('Cannot get any data within your browser:' + error);
    }
    if (Object.keys(entry).length === 0) {
        accounts = [];
    } else {
        accounts = entry['account_entries'];
    }
});

function refresh() {
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
    updateTabURL(0);
}

chrome.tabs.onUpdated.addListener(function (tabid, info, tab) {
    if (info.status === COMPLETE) {

        // Gmail is refreshing when hitting the page. Here is the guard.
        if (isTheSameCall) {
            return;
        } else {
            isTheSameCall = true;
        }

        chrome.tabs.executeScript(null, {
            file: PARSER_SCRIPT
        }, function (result) {
            var error = chrome.runtime.lastError;
            if (!result || error) {
                throw new SwitchGmailException('Cannot parse the page content for email detection: ' + error);
            }

            // Extract email + url and create/push accounts
            accounts = result;

            // TODO
            var email = accounts[0].email;
            var message = document.querySelector('#message');
            message.innerText = email;

            // The entry still doesn't exist and has to be added to the accounts listing.
            chrome.storage.local.set({'account_entries': accounts}, function () {
                var error = chrome.runtime.lastError;
                if (error) {
                    throw new SwitchGmailException('Cannot store any data within your browser:' + error);
                }
            });
        });
    }
});

/* UTILS */

function updateTabURL(number) {
    isTheSameCall = false;
    chrome.tabs.update({'url': PREFIX_GMAIL_URL + number}, function () {
        chrome.tabs.executeScript({
            code: 'history.replaceState({}, "", " ");'
        });
    });
}

function navigate(url) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
}

function notification(idP, titleP, messageP, img) {
    chrome.runtime.sendMessage({'idP': idP, 'titleP': titleP, 'messageP': messageP, 'img': img}, function () {
    });
};