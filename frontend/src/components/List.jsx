import React, { useEffect, useState, useContext } from 'react'
import { deletePost, getList } from '../api/post';
import { useHistory, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../App';
import { signOut } from '../api/auth';
import ListTable from '../commons/ListTable';

const List = () => {
    const {loading, isSignedIn, setIsSignedIn, currentUser} = useContext(AuthContext);
    const [dataList, setDataList] = useState([]);

    const history = useHistory();

    // サインアウト
    const handleSignOut = async (e) => {
        try{
            const res = await signOut();

            // eslint-disable-next-line no-cond-assign
            if(res.data.success = true){
                Cookies.remove('_access_token');
                Cookies.remove('_client');
                Cookies.remove('_uid');

                setIsSignedIn(false);
                history.push('/signin');
                console.log('succeeded in sign out');
            } else {
                console.log('failed in sign out');
            }
        } catch (e){
            console.log(e);
        }
    }

    const AuthButtons = () => {
        if(!loading){
            if(isSignedIn){
                return(
                    <button
                        onClick={handleSignOut}
                    >
                        Sign out
                    </button>
                );
            } else {
                return(
                    <>
                        <Link
                            to="/signin"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/signup"
                        >
                            Sign up
                        </Link>
                    </>
                )
            }
        } else {
            return <></>;
        }
    };

    // 投稿一覧取得
    const handleGetList = async () => {
        try {
            const res = await getList();
            console.log(res.data);
            setDataList(res.data);
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        handleGetList();
    }, [])

    // 削除用の関数を追加
    const handleDelete = async (item) => {
        console.log('click', item.id)
        try {
            const res = await deletePost(item.id)
            console.log(res.data)
            handleGetList()
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <div>
            {isSignedIn && currentUser && (
                <p>ログイン状態です</p>
            )}
            <AuthButtons />
            <Link to="/user/posts">自分の投稿一覧</Link>
            <h1>Home</h1>
            <button onClick={() => history.push('/new')}>新規作成</button>
            <ListTable
                dataList={dataList}
                handleDelete={handleDelete}
                currentUser={currentUser}
            />
        </div>
    )
}

export default List;
