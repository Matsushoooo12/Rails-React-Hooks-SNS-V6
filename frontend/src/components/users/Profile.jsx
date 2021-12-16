import { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

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
            <p>いいね{post.likes.length}</p>
          </div>
        ))}
      </div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};
