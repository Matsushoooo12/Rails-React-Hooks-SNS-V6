import { memo, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { createFollow, deleteFollow } from "../../api/follow";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const FollowerList = memo(() => {
  const [followers, setFollowers] = useState([]);
  const { currentUser, handleGetCurrentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const query = useParams();
  const history = useHistory();

  const handleGetFollowers = async (query) => {
    try {
      const res = await getUser(query.id);
      setFollowers(res.data.followers);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  // フォロー機能関数
  const handleCreateFollow = async (item) => {
    try {
      await createFollow(item.id);
      handleGetCurrentUser();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteFollow = async (item) => {
    try {
      await deleteFollow(item.id);
      handleGetCurrentUser();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetFollowers(query);
  }, [query]);
  return (
    <div>
      <h1>フォロワー</h1>
      {followers?.map((follower) => (
        <div key={follower.id}>
          <p>
            <Link to={`/users/${follower.id}`}>{follower.email}</Link>
            {currentUser.id === user.id && (
              <>
                {currentUser.followings?.find(
                  (follow) => follow.id === follower.id
                ) ? (
                  <span onClick={() => handleDeleteFollow(follower)}>
                    フォローを外す
                  </span>
                ) : (
                  <span onClick={() => handleCreateFollow(follower)}>
                    フォローをする
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      ))}
      <button onClick={() => history.push(`/users/${user.id}`)}>戻る</button>
    </div>
  );
});
