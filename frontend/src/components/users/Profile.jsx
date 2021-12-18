import { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { createFollow, deleteFollow } from "../../api/follow";
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

  // フォロー機能関数
  const handleCreateFollow = async (item, user) => {
    try {
      const res = await createFollow(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteFollow = async (item) => {
    try {
      const res = await deleteFollow(item.id);
      console.log(res);
      handleGetUser(item);
    } catch (e) {
      console.log(e);
    }
  };

  // ユーザーを取得
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

  console.log(currentUser);
  return (
    <>
      <h1>ユーザー</h1>
      <button onClick={() => history.push("/")}>戻る</button>
      <div>メールアドレス：{user.email}</div>
      {user.id === currentUser.id ? (
        <div>現在のユーザーです</div>
      ) : (
        <div>
          {currentUser.followings?.find(
            (following) => user.id === following.id
          ) ? (
            <div onClick={() => handleDeleteFollow(user, user)}>
              フォローを外す
            </div>
          ) : (
            <div onClick={() => handleCreateFollow(user, user)}>
              フォローをする
            </div>
          )}
        </div>
      )}
      <p>
        フォロー数{user.followings?.length} フォロワー数{user.followers?.length}
      </p>
      <h2>ユーザーの投稿</h2>
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
      <h2>ユーザーがいいねした投稿</h2>
      <div>
        {user.likePosts?.map((likePost) => (
          <div key={likePost.id}>
            <p>{likePost.postUser?.email}</p>
            <p>{likePost.post[0]?.title}</p>
            <p>{likePost.post[0]?.content}</p>
            <p>♡{likePost.likesCount.length}</p>
            <p onClick={() => handleDeleteLike(likePost.post[0], user)}>
              お気に入りから削除
            </p>
          </div>
        ))}
      </div>
    </>
  );
};
