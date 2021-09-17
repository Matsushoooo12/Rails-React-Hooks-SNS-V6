import React from 'react'
import { Link } from 'react-router-dom'

const ListTable = (props) => {
    const { dataList, handleDelete, currentUser } = props;
    return (
        <table>
            <thead>
                <tr>
                    <th>タイトル</th>
                    <th>内容</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {dataList.map((item, index) => (
                    <tr key={index}>
                        <td>{item.title}</td>
                        <td>{item.content}</td>
                        {currentUser.id === item.userId ? (
                            <td>
                                <Link to={`/edit/${item.id}`}>更新</Link>
                            </td>
                        ):(
                            <td></td>
                        )}
                        <td>
                            <Link to={`/post/${item.id}`}>詳細へ</Link>
                        </td>
                        {currentUser.id === item.userId ? (
                            <td>
                                <button onClick={() => handleDelete(item)}>
                                    削除
                                </button>
                            </td>
                        ):(
                            <td></td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default ListTable
