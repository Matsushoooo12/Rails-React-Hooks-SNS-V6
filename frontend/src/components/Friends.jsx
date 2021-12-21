import { useContext, useState } from "react";
import { AuthContext } from "../App";
import { FollowerList } from "./follow/FollowerList";
import { FollowingList } from "./follow/FollowingList";

export const Friends = (props) => {
  const [showFollower, setShowFollower] = useState(props.showFollower);
  const { currentUser, handleGetCurrentUser } = useContext(AuthContext);
  return (
    <div>
      <button onClick={() => setShowFollower(true)} disabled={showFollower}>
        フォロワー
      </button>
      <button onClick={() => setShowFollower(false)} disabled={!showFollower}>
        フォロー中
      </button>
      <hr />
      {showFollower ? <FollowerList /> : <FollowingList />}
    </div>
  );
};
