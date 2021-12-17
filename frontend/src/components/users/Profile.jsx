import { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { createLike, deleteLike } from "../../api/like";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

  // いいね機能関数
  const handleCreateLike = async (item, user) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item, user) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      console.log(res.data);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  return (
    <>
      <h1>ユーザー</h1>
      <div>メールアドレス：{user.email}</div>
      {user.id === currentUser.id && <p>現在のユーザーです</p>}
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            <div>
              {post.likes?.find((like) => like.userId === currentUser.id) ? (
                <p onClick={() => handleDeleteLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              ) : (
                <p onClick={() => handleCreateLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};
