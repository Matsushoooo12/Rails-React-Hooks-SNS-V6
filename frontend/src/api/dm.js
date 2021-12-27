import client from "./client";
import Cookies from "js-cookie";

export const createRoom = (id) => {
  return client.post(
    `/users/${id}/rooms`,
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

export const getAllRooms = () => {
  return client.get("/rooms", {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};

export const createMessage = (id, params) => {
  return client.post(`/rooms/${id}/messages`, params, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};
