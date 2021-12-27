import { useEffect, useState } from "react";
import { getAllRooms } from "../api/dm";
import "../App.css";
import { Message } from "./Message";

export const Dm = () => {
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);

  console.log(rooms);

  const handleGetRooms = async () => {
    try {
      const res = await getAllRooms();
      setRooms(res.data);
      setMessages(res.data.messages);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetRooms();
  }, []);
  return (
    <div className="flex">
      <div className="left">
        {rooms.map((room) => (
          <div key={room.id}>
            <p>roomID:{room.id}</p>
            <div>
              {room.users?.map((user) => (
                <p>{user.email}</p>
              ))}
            </div>
            {/* <div>
              {room.messages?.map((message) => (
                <p>{message.content}</p>
              ))}
            </div> */}
            <hr />
          </div>
        ))}
      </div>
      <Message />
    </div>
  );
};
