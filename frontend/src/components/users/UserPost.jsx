import React, {useContext, useState, useEffect} from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import { deletePost } from '../../api/post';
import { getUserPosts } from '../../api/user';
import { AuthContext } from '../../App'
import ListTable from '../../commons/ListTable';

const UserPost = () => {
    const {loading, isSignedIn, currentUser} = useContext(AuthContext);
    const [userPosts, setUserPosts] = useState({});
    const history = useHistory();

    const handleGetUserPosts = async () => {
        if (!loading) {
          if (isSignedIn) {
            const res = await getUserPosts(currentUser.id);
            console.log(res.data);
            setUserPosts(res.data);
          } else {
            <Redirect to='/signin' />;
          }
        }
    };

    useEffect(() => {
        handleGetUserPosts();
    }, [currentUser]);

    const handleDelete = async (item) => {
        console.log('click', item.id);
        try{
            const res = await deletePost(item.id);
            console.log(res.data)
            handleGetUserPosts();
        } catch(e){
            console.log(e)
        }
    }

    const UserTable = () => {
        if(userPosts.length >= 1){
            return(
                <ListTable
                    dataList={userPosts}
                    handleDelete={handleDelete}
                    currentUser={currentUser}
                />
            )
        } else {
            return <h2>投稿はありません</h2>
        }
    }
    return (
        <>
            <h1>{currentUser.email}の投稿一覧</h1>
            <button
                onClick={() => history.push('/')}
            >
                戻る
            </button>
            <UserTable/>
        </>
    )
}

export default UserPost
