import { memo, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { getUser } from "../../api/user";

export const FollowerList = memo(() => {
  const [followers, setFollowers] = useState([]);
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
          </p>
        </div>
      ))}
      <button onClick={() => history.push(`/users/${user.id}`)}>戻る</button>
    </div>
  );
});
