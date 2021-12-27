import React, { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createLike, deleteLike } from "../api/like";

const ListTable = memo((props) => {
  const { dataList, handleDelete, currentUser, handleGetList } = props;
  const [filteredItems, setFilteredItems] = useState([]);
  const [value, setValue] = useState("");

  const handleSearch = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    const newItems = dataList.filter((item) => {
      return (
        item.title.toLowerCase().indexOf(value) !== -1 ||
        item.content.toLowerCase().indexOf(value) !== -1 ||
        item.email.toLowerCase().indexOf(value) !== -1
      );
    });
    setFilteredItems(newItems);
  }, [value, dataList]);

  const handleCreateLike = async (item) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetList();
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetList();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <form action="">
        <label htmlFor="search">検索</label>
        <input type="text" id="search" onChange={handleSearch} />
      </form>
      <table>
        <thead>
          <tr>
            <th>メールアドレス</th>
            <th>タイトル</th>
            <th>内容</th>
            <th>いいね</th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {!filteredItems ? (
            <>
              {dataList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/users/${item.userId}`}>{item.email}</Link>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.content}</td>
                  <td>
                    {item.likes.find(
                      (like) => like.userId === currentUser.id
                    ) ? (
                      <p onClick={() => handleDeleteLike(item)}>
                        ♡{item.likes.length}
                      </p>
                    ) : (
                      <p onClick={() => handleCreateLike(item)}>
                        ♡{item.likes.length}
                      </p>
                    )}
                  </td>
                  {currentUser.id === item.userId ? (
                    <td>
                      <Link to={`/edit/${item.id}`}>更新</Link>
                    </td>
                  ) : (
                    <td></td>
                  )}
                  <td>
                    <Link to={`/post/${item.id}`}>詳細へ</Link>
                  </td>
                  {currentUser.id === item.userId ? (
                    <td>
                      <button onClick={() => handleDelete(item)}>削除</button>
                    </td>
                  ) : (
                    <td></td>
                  )}
                </tr>
              ))}
            </>
          ) : (
            <>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link to={`/users/${item.userId}`}>{item.email}</Link>
                  </td>
                  <td>{item.title}</td>
                  <td>{item.content}</td>
                  <td>
                    {item.likes.find(
                      (like) => like.userId === currentUser.id
                    ) ? (
                      <p onClick={() => handleDeleteLike(item)}>
                        ♡{item.likes.length}
                      </p>
                    ) : (
                      <p onClick={() => handleCreateLike(item)}>
                        ♡{item.likes.length}
                      </p>
                    )}
                  </td>
                  {currentUser.id === item.userId ? (
                    <td>
                      <Link to={`/edit/${item.id}`}>更新</Link>
                    </td>
                  ) : (
                    <td></td>
                  )}
                  <td>
                    <Link to={`/post/${item.id}`}>詳細へ</Link>
                  </td>
                  {currentUser.id === item.userId ? (
                    <td>
                      <button onClick={() => handleDelete(item)}>削除</button>
                    </td>
                  ) : (
                    <td></td>
                  )}
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </>
  );
});

export default ListTable;
