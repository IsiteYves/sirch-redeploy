import Hyperbeam from "@hyperbeam/web";
import axios from "axios";

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
    console.log(res.data);
    return await Hyperbeam(container, res.data.embed_url, {
      adminToken: res.data.admin_token,
    });
  } catch (error) {
    console.log(error);
    console.log(error.response);
  }
}
