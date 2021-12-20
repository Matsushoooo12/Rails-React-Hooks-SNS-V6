import client from "./client";
import Cookies from "js-cookie";

export const createComment = (id, params) => {
  return client.post(`/posts/${id}/comments`, params, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};
