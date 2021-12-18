import client from "./client";
import Cookies from "js-cookie";

export const createFollow = (id) => {
  return client.post(
    `/users/${id}/relationships`,
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

export const deleteFollow = (id) => {
  return client.delete(`/relationships/${id}`, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};
