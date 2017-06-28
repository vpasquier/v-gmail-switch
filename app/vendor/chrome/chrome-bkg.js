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
var tabUrl;

function pageActionOnGES(tabInfo) {
    chrome.pageAction.show(tabInfo.id);
    return;
}

function getInfoForTab(tabs) {
    if (tabs.length > 0) {
        chrome.tabs.get(tabs[0].id, pageActionOnGES);
    }
}

function onChange(tabInfo) {
    chrome.tabs.query({lastFocusedWindow: true, active: true}, getInfoForTab);
};

var target = '<all_urls>';
chrome.webRequest.onCompleted.addListener(onChange, {urls: [target]});
chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, pageActionOnGES);
});
