import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { createComment } from "../api/comment";
import { createLike, deleteLike } from "../api/like";
import { getDetail } from "../api/post";
import { AuthContext } from "../App";

const Detail = () => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});

  // commentValue
  const [commentValue, setCommentValue] = useState({
    content: "",
  });

  const query = useParams();
  const history = useHistory();

  // いいね機能関数
  const handleCreateLike = async (item) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetDetail(item);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetDetail(item);
    } catch (e) {
      console.log(e);
    }
  };

  // コメント機能関数
  const handleChange = (e) => {
    setCommentValue({
      ...commentValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    try {
      const res = await createComment(id, commentValue);
      console.log(res.data);
      history.push(`/post/${data.id}`);
    } catch (e) {
      console.log(e);
    }
    setCommentValue({
      content: "",
    });
  };

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
      <div>
        {data.likes?.find((like) => like.userId === currentUser.id) ? (
          <p onClick={() => handleDeleteLike(data)}>♡{data.likes?.length}</p>
        ) : (
          <p onClick={() => handleCreateLike(data)}>♡{data.likes?.length}</p>
        )}
      </div>
      {currentUser.id === data.user?.id && (
        <div>
          <Link to={`/edit/${data.id}`}>更新</Link>
        </div>
      )}
      <form>
        <div>
          <label htmlFor="content">コメント</label>
          <input
            type="text"
            id="content"
            name="content"
            onChange={(e) => handleChange(e)}
            value={commentValue.content}
          />
        </div>
        <input
          type="submit"
          value="コメントする"
          onClick={(e) => handleSubmit(e, data.id)}
        />
      </form>
      {data.comments?.map((comment) => (
        <div key={comment.id}>
          <p>{comment.user[0].email}</p>
          <p>{comment.id}</p>
          <p>{comment.content}</p>
        </div>
      ))}
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};

export default Detail;
