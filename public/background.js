/* eslint-disable no-undef */
// chrome.commands.onCommand.addListener((command) => {
// 	console.log(command);
// 	if (command === "open-popup") {
// 		const queryInfo = {
// 			active: true,
// 			currentWindow: true,
// 		};
// 		chrome.action.onCommand
// 		chrome.tabs.query(queryInfo, (tabs) => {
// 			chrome.tabs.update(tabs[0].id, {
// 				url: chrome.runtime.getURL("index.html"),
// 			});
// 			// chrome.scripting.executeScript({
// 			// 	target: { tabId: tabs[0].id },
// 			// 	func: open_popup,
// 			// });
// 		});
// 	}
// });

// const open_popup = () => {
// 	const iframe = document.createElement("div");
// 	iframe.src = chrome.runtime.getURL("index.html");
// 	iframe.style =
// 		"position: fixed; top: 50%; left: 50%; width: 800px; height: 100%; -webkit-transform: translate(-50%, -50%); transform: translate(-50%, -50%); background: transparent;";
// 	document.body.appendChild(iframe);
// };

chrome.action.onClicked.addListener((tab) => {
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		func: contentScriptFunc(tab.id)
	});
});

function contentScriptFunc(id) {
	chrome.tabs.update(id, {
		url: chrome.runtime.getURL("index.html"),
	});
}
