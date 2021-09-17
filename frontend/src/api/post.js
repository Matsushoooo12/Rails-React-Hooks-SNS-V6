import Cookies from "js-cookie";
import client from "./client";

export const getList = () => {
    return client.get('/posts');
}

export const getDetail = (id) => {
    return client.get(`/posts/${id}`);
}

export const createPost = (params) => {
    return client.post('/posts', params, {
        headers: {
            'access-token': Cookies.get('_access_token'),
            client: Cookies.get('_client'),
            uid: Cookies.get('_uid'),
        },
    });
};

export const updatePost = (id, params) => {
    return client.patch(`/posts/${id}`, params, {
        headers: {
            'access-token': Cookies.get('_access_token'),
            client: Cookies.get('_client'),
            uid: Cookies.get('_uid'),
        },
    });
}

export const deletePost = (id) => {
    return client.delete(`/posts/${id}`, {
        headers: {
            'access-token': Cookies.get('_access_token'),
            client: Cookies.get('_client'),
            uid: Cookies.get('_uid'),
        },
    });
}
