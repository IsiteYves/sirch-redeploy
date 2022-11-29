import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uzupevopaqowfsfifequ.supabase.co";
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabaseClient;

export const getSavedDomains = async () => {
  return await supabaseClient.from("sirch-domain").select();
};

export const getSingleDomainByDomainName = async (domain) => {
  return await supabaseClient
    .from("sirch-domain")
    .select()
    .eq("domain_name", domain)
    .single();
};

export const getSingleDomainByDomainId = async (id) => {
  return await supabaseClient
    .from("sirch-domain")
    .select()
    .eq("id", id)
    .single();
};

export const addDomain = async (domain) => {
  const { data, error } = await getSingleDomainByDomainName(domain);

  if (error) {
    // no record found then add new record
    return await supabaseClient
      .from("sirch-domain")
      .insert([{ domain_name: domain, count: 1 }])
      .select();
  }

  if (data) {
    // record exists then update
    //return await updateDomain(data.domain_name, data.count);
    return await supabaseClient
      .from("sirch-domain")
      .update([{ domain_name: data.domain_name, count: data.count + 1 }])
      .eq("id", data.id)
      .select();
  }
};

export const updateDomain = async (data) => {
  return await supabaseClient
    .from("sirch-domain")
    .update([{ domain_name: data.domain_name, count: data.count + 1 }])
    .eq("id", data.id);
};
