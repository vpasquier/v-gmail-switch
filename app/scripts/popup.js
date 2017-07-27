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

var accounts;
var isTheSameCall;

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
    chrome.storage.local.get('accounts_keys', function (entry) {
        var error = chrome.runtime.lastError;
        if (error) {
            throw new SwitchGmailException('Cannot get any data within your browser:' + error);
        }
        if (Object.keys(entry).length === 0) {
            accounts = [];
            updateTabURL(0);
        } else {
            // chrome.storage.local.clear(function() {
            //     var error = chrome.runtime.lastError;
            //     if (error) {
            //         console.error(error);
            //     }
            // });
            accounts = entry['accounts_keys'];
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
        var alreadyExist = false;
        if (!isTheSameCall) {
            isTheSameCall = true;
        } else {
            isTheSameCall = false;
            return;
        }
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

            // If the storage contains already the same entry, stop the detection.
            chrome.storage.local.get('accounts_keys', function (entry) {
                var entries = entry['accounts_keys'];
                if (entries) {
                    for (var i = 0; i < entries.length; i++) {
                        if (entries[i].email === email) {
                            alreadyExist = true;
                            break;
                        }
                    }
                    if (alreadyExist) {
                        notification('success', 'Done', 'All your accounts have been added', '../images/v-128.png');
                        return;
                    }
                }

                // The entry still doesn't exist and has to be added to the accounts listing.
                var account = new Account(email, tab.url);
                accounts.push(account);
                chrome.storage.local.set({'accounts_keys': accounts}, function () {
                    var error = chrome.runtime.lastError;
                    if (error) {
                        throw new SwitchGmailException('Cannot store any data within your browser:' + error);
                    }
                });
                // Let's continue the search/parse for new accounts.
                setTimeout(function () {
                    refresh();
                }, 2000);
            });
        });
    }
});

/* UTILS */

function updateTabURL(number) {
    isTheSameCall = false;
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
    chrome.runtime.sendMessage({'idP': idP, 'titleP': titleP, 'messageP': messageP, 'img': img}, function () {
    });
};