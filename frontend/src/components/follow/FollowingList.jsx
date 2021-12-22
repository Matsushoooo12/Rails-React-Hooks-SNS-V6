import { memo, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { createFollow, deleteFollow } from "../../api/follow";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const FollowingList = memo(() => {
  const [followings, setFollowings] = useState([]);
  const { currentUser, handleGetCurrentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const query = useParams();
  const history = useHistory();

  const handleGetFollowings = async (query) => {
    try {
      const res = await getUser(query.id);
      setFollowings(res.data.followings);
      setUser(res.data);
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
    handleGetFollowings(query);
  }, [query]);
  return (
    <div>
      <h1>フォロー中</h1>
      {followings?.map((following) => (
        <div key={following.id}>
          <p>
            <Link to={`/users/${following.id}`}>{following.email}</Link>
            {currentUser.id === user.id && (
              <span onClick={() => handleDeleteFollow(following)}>
                フォローを外す
              </span>
            )}
          </p>
        </div>
      ))}
      <button onClick={() => history.push(`/users/${user.id}`)}>戻る</button>
    </div>
  );
});
