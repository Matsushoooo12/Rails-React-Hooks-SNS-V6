import { memo, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { getUser } from "../../api/user";

export const FollowingList = memo(() => {
  const [followings, setFollowings] = useState([]);
  const query = useParams();
  const history = useHistory();

  const handleGetFollowings = async (query) => {
    try {
      const res = await getUser(query.id);
      setFollowings(res.data.followings);
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
          </p>
        </div>
      ))}
      <button onClick={() => history.push("/")}>戻る</button>
    </div>
  );
});
