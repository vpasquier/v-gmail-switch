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
 * Main popup script.
 * @since 1.0
 */

'use strict';

/* Gmail Accounts management */

var PREFIX_GMAIL_URL = 'https://mail.google.com/mail/u/';
var COMPLETE = 'complete';
var PARSER_SCRIPT = 'scripts/scanAccounts.js';

var accounts;
var isTheSameCall;
var isFromHere = false;

window.onload = function () {
    document.getElementById('refresh').addEventListener('click', refresh);
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
            fillTemplate(accounts);
        }
    });
};

function SwitchGmailException(message) {
    this.message = message;
    this.name = 'SwitchGmailException';
}

function refresh() {
    var accountContainer = document.getElementById('accounts');
    accountContainer.innerHTML = '';
    chrome.storage.local.clear(function () {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
    updateTabURL(0);
}

function fillTemplate(accounts) {
    var accountItems = [];
    for (var i = 0; i < accounts.length; i++) {
        var email = accounts[i].email;
        var url = accounts[i].url;
        var accountItem = '<div class=pure-u-1-1><h3><a class=pure-button href=' + url + ' target=_blank rel=noreferrer>';
        accountItem = accountItem + email + '</a></h3></div>';
        accountItems.push(accountItem);
    }
    if (accountItems.length !== 0) {
        accountItems.push('<div class=pure-u-1-1><h3><a id=openAll class=pure-button href=#>Open All</a></h3></div>');
    }
    var accountContainer = document.getElementById('accounts');
    if (accountItems.length !== 0) {
        accountContainer.insertAdjacentHTML('afterBegin', accountItems.toString().replace(',', ''));
        document.getElementById('openAll').addEventListener('click', openTabs);
    }
    if (accountItems.length === 0) {
        accountContainer.insertAdjacentHTML('afterBegin', '<div class=pure-u-1-1><h3>Login into your Account(s)</h3></div>');
    }
}
chrome.tabs.onUpdated.addListener(function (tabid, info, tab) {
    if (info.status === COMPLETE) {

        // Gmail is refreshing when hitting the page. Here is the guard.
        if (isTheSameCall || !isFromHere) {
            return;
        } else {
            isFromHere = false;
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
            accounts = result[0];

            // Fill template
            fillTemplate(accounts);

            // The entry still doesn't exist and has to be added to the accounts listing.
            chrome.storage.local.set({ 'account_entries': accounts }, function () {
                var error = chrome.runtime.lastError;
                if (error) {
                    throw new SwitchGmailException('Cannot store any data within your browser:' + error);
                }
            });
            if (accounts.length !== 0) {
                notification('notif1', 'Done!', 'Accounts Added.');
            } else {
                notification('notif2', 'Please', 'Login into your Account(s)');
            }
        });
    }
});

/* UTILS */

function updateTabURL(number) {
    isTheSameCall = false;
    isFromHere = true;
    chrome.tabs.update({ 'url': PREFIX_GMAIL_URL + number }, function () {
        chrome.tabs.executeScript({
            code: 'history.replaceState({}, "", " ");'
        });
    });
}

function openTabs() {
    chrome.storage.local.get('account_entries', function (entry) {
        var error = chrome.runtime.lastError;
        if (error) {
            accounts = [];
            throw new SwitchGmailException('Cannot get any data within your browser:' + error);
        }
        accounts = entry['account_entries'];
        if (!accounts) {
            refresh();
        }
        for (var i = 0; i < accounts.length; i++) {
            chrome.tabs.create({ url: accounts[i].url });
        }
    });
}

function notification(idP, titleP, messageP) {
    chrome.runtime.sendMessage({
        'idP': idP,
        'titleP': titleP,
        'messageP': messageP,
        'img': '../images/v-128.png'
    }, function () {});
};