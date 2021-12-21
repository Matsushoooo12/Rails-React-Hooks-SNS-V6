import { useState } from "react";
import { FollowerList } from "./follow/FollowerList";
import { FollowingList } from "./follow/FollowingList";

export const Friends = (props) => {
  const [showFollower, setShowFollower] = useState(props.showFollower);
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
