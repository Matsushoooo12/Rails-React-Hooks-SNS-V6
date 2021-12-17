import React, { useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { getDetail } from "../api/post";

const Detail = () => {
  const [data, setData] = useState({});

  const query = useParams();
  const history = useHistory();

  const handleGetDetail = async (query) => {
    try {
      const res = await getDetail(query.id);
      console.log(res.data);
      setData(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetDetail(query);
  }, [query]);
  return (
    <>
      <h1>Detail</h1>
      <div>
        <Link to={`/users/${data.user?.id}`}>{data.user?.email}</Link>
      </div>
      <div>ID:{data.id}</div>
      <div>タイトル：{data.title}</div>
      <div>内容：{data.content}</div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};

export default Detail;
