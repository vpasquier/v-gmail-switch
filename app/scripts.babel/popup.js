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
const SUFFIX_GMAIL_URL = '/#inbox';
const COMPLETE = 'complete';
const PARSER_SCRIPT = 'scripts/getPagesSource.js';
const ACCOUNTS_KEY = 'vAccounts';

var accounts = [];

function Account(email, url) {
    this.email = email;
    this.url = url;
}

window.onload = function () {
    document.getElementById('refresh').addEventListener('click', refresh);
};

function SwitchGmailException(message) {
    this.message = message;
    this.name = 'SwitchGmailException';
}

function refresh() {
    chrome.storage.local.get(ACCOUNTS_KEY, function (entry) {
        var error = chrome.runtime.lastError;
        if (error) {
            throw new SwitchGmailException("Cannot get any data within your browser:" + error);
        }
        if (Object.keys(entry).length === 0) {
            accounts = [];
            updateTabURL(0);
        } else {
            accounts = entry.accounts;
            var accountNumbers = [];
            for (var i = 0; i < accounts.length; i++) {
                accountNumbers.push(getAccountNumber(accounts[i].url));
            }
            var max = Math.max.apply(Math, accountNumbers);
            updateTabURL(max + 1);
        }
    });
}

chrome.tabs.onUpdated.addListener(function (tabid, info, tab) {
    if (info.status === COMPLETE) {
        chrome.tabs.executeScript(null, {
            file: PARSER_SCRIPT
        }, function (result) {
            var error = chrome.runtime.lastError;
            if (!result || error) {
                throw new SwitchGmailException('Cannot parse the page content for email detection: ' + error);
            }
            var email = result[0];
            //TODO TEMPLATE POLYMER
            var message = document.querySelector('#message');
            message.innerText = email;

            var account = new Account(email, tab.url);
            accounts.push(account);
            chrome.storage.local.set({ACCOUNTS_KEY: accounts}, function () {
                var error = chrome.runtime.lastError;
                if (error) {
                    throw new SwitchGmailException("Cannot store any data within your browser:" + error);
                }
            });
            notification('success', 'Success!', 'Your account has been added.', '../images/v-128.png');
        });
    }
});

/* UTILS */

function updateTabURL(number) {
    chrome.tabs.update({'url': PREFIX_GMAIL_URL + number + SUFFIX_GMAIL_URL}, function () {
        chrome.tabs.executeScript({
            code: 'history.replaceState({}, "", " ");'
        });
    });
}

function getAccountNumber(url) {
    return url.replace(/(^.+\D)(\d+)(\D.+$)/i, '$2');
}

function navigate(url) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
}

function notification(idP, titleP, messageP, img) {
    chrome.notifications.create(idP, {
        type: 'basic',
        title: titleP,
        message: messageP,
        iconUrl: img
    }, function () {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        }
    });
};