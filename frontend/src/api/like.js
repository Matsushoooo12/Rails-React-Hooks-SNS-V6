import Cookies from "js-cookie";
import client from "./client";

export const createLike = (id) => {
  return client.post(
    `/posts/${id}/likes`,
    {},
    {
      headers: {
        "access-token": Cookies.get("_access_token"),
        client: Cookies.get("_client"),
        uid: Cookies.get("_uid"),
      },
    }
  );
};

export const deleteLike = (id) => {
  return client.delete(`/likes/${id}`, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};
