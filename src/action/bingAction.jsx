import Hyperbeam from "@hyperbeam/web";
import axios from "axios";

export const getBingSearch = async (query) => {
	try {
		const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(
			query
		)}&count=10`;

		const headers = {
			"Ocp-Apim-Subscription-Key": "e9304f36e5a74402a883041088cf3429",
		};
		const res = await axios.get(url, { headers });
		return res.data.webPages.value;
	} catch (err) {
		console.log(err);
	}
};

export const bingAutoSuggest = async (query) => {
	try {
		const url = `https://api.bing.microsoft.com/v7.0/Suggestions?q=${query}`;
		const headers = {
			"Ocp-Apim-Subscription-Key": "e9304f36e5a74402a883041088cf3429",
		};
		const res = await axios.get(url, { headers });
		return res.data.suggestionGroups[0].searchSuggestions;
	} catch (err) {
		console.log(err);
	}
};
export const renderPage = async (hb, data, windowId) => {
	try {
		console.log("intializing tab");
		if (windowId) {
			const query = await hb.tabs.query({ windowId });
			query.map(async (tab) => {
				await hb.tabs.remove(tab.id);
			});
		}

		const tabs = await data.map(async (item, index) => {
			return await hb.tabs.create({
				index: index,
				url: item.url || item.domain,
				active: false,
			});
		});
		return Promise.all(tabs);
	} catch (err) {
		console.log(err);
	}
};

export const updateTab = async (hb, id) => {
	await hb.tabs.update(id, { active: true });
};

export async function loadHyperBeam(container) {
	try {
		const res = await axios.get("https://sirch-api-rajesh-vishwa.vercel.app");
		return await Hyperbeam(container, res.data.embed_url, {
			adminToken: res.data.admin_token,
		});
	} catch (error) {
		console.log(error);
	}
}
export const openNewTab = (id, index, url) => {
	window.open(`https://${url}`, "__blank");
};
