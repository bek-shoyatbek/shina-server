import axios from "axios";

export async function getCurrency(API_URL) {
  const res = await axios.get(API_URL + "/api/currency");
  const currency = res.data.data.val;
  return currency;
}
