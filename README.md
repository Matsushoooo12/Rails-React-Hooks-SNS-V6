# Rails API + React Hooks [SNS 編]

# このリポジトリからクローンした際にサーバーを起動するための手順

Rails プロジェクトディレクトリ上

```
$ rails db:migrate
```

React プロジェクトディレクトリ上

```
$ rm -rf node_modules
$ npm install
```

# 投稿機能

## Rails プロジェクト作成

```
$ rails new プロジェクト名 --api
$ cd プロジェクト名
```

## HTTP 通信の許可

```
gem 'rack-cors'
```

```
$ bundle install
```

config/initializers/cors.rb

```
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Front(React)側は3000ポートで繋ぐのでoriginsは3000を許可します
    origins 'localhost:3000'

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## ポート番号変更

config/puma.rb

```
port ENV.fetch("PORT") { 3001 }
```

## model 作成

```
$ rails g model Post title:string content:text
$ rails db:migrate
```

## posts コントローラー作成

```
$ rails g controller api/v1/posts
```

controllers/api/v1/posts_controller.rb

```
class Api::V1::PostsController < ApplicationController
    def index
        posts = Post.all.order(created_at: :desc)
        render json: posts
    end

    def show
        post = Post.find(params[:id])
        render json: post
    end

    def create
        post = Post.new(post_params)
        if post.save
            render json: post
        else
            render json: post.errors, status: 422
        end
    end

    def update
        post = Post.find(params[:id])
        if post.update(post_params)
            render json: post
        else
            render json: post.errors, status: 422
        end
    end

    def destroy
        post = Post.find(params[:id])
        post.destroy
        render json: post
    end

    private
    def post_params
        params.require(:post).permit(:title, :content)
    end
end
```

## posts ルーティング設定

routes.rb

```
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :posts
    end
  end
end
```

## API 動作確認

postman を使って確認

<img width="1299" alt="スクリーンショット 2021-09-11 8 31 06" src="https://user-images.githubusercontent.com/66903388/132927925-43fee764-d021-4f36-985b-85d79985dfb7.png">

### Get all posts

---

GET `http://localhost:3001/api/v1/posts`

### Get a post

---

GET `http://localhost:3001/api/v1/posts/1`

### Create a post

---

POST `http://localhost:3001/api/v1/posts`

ContentType: JSON

```
{
    "title": "test1",
    "content": "testtesttesttesttest"
}
```

### Update a post

---

UPDATE `http://localhost:3001/api/v1/posts/1`

ContentType: JSON

```
{
    "title": "test2",
    "content": "testtesttesttesttest"
}
```

### Delete a post

---

`http://localhost:3001/api/v1/posts/1`

## React プロジェクト作成

Rails アプリのルートディレクトリで React プロジェクトを作成。

```
$ npx create-react-app frontend
$ cd frontend
```

## npm パッケージのインストール

```
$ npm i axios axios-case-converter react-router-dom
```

## API Client を作成

```
mkdir src/api
touch src/api/client.js
touch src/api/post.js
```

client.js

```
import applyCaseMiddleware from 'axios-case-converter'
import axios from 'axios'

const options = {
    ignoreHeaders: true,
}

const client = applyCaseMiddleware(
    axios.create({
        baseURL: 'http://localhost:3001/api/v1',
    }),
    options
);

export default client;
```

post.js

```
import client from "./client";

export const getList = () => {
    return client.get('/posts');
}

export const getDetail = (id) => {
    return client.get(`/posts/${id}`);
}

export const createPost = (params) => {
    return client.post('/posts', params);
}

export const updatePost = (id, params) => {
    return client.patch(`/posts/${id}`, params);
}

export const deletePost = (id) => {
    return client.delete(`/posts/${id}`);
}
```

## Post 画面

App.js

```
import React from 'react'
import {
  BrowserRouter,
  Switch,
  Route,
} from 'react-router-dom'
import Detail from './components/Detail';
import Edit from './components/Edit';
import List from './components/List';
import New from './components/New';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={List} />
        <Route path="/post/:id" component={Detail} />
        <Route exact path='/new' component={New} />
        <Route path="/edit/:id" component={Edit} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
```

src/components/List.js

```
import React, { useEffect, useState } from 'react'
import { deletePost, getList } from '../api/post';
import { useHistory, Link } from 'react-router-dom';

const List = () => {
    const [dataList, setDataList] = useState([]);

    const history = useHistory();

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

    // 削除用の関数
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
            <h1>Home</h1>
            <button onClick={() => history.push('/new')}>新規作成</button>
            <table>
                <thead>
                    <tr>
                        <th>タイトル</th>
                        <th>内容</th>
                        <th colSpan="1"></th>
                        <th colSpan="1"></th>
                        <th colSpan="1"></th>
                    </tr>
                </thead>
                {dataList.map((item, index) => (
                    <tbody key={index}>
                        <tr>
                            <td>{item.title}</td>
                            <td>{item.content}</td>
                            <td>
                                <Link to={`/edit/${item.id}`}>更新</Link>
                            </td>
                            <td>
                                <Link to={`/post/${item.id}`}>詳細へ</Link>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(item)}>削除</button>
                            </td>
                        </tr>
                    </tbody>
                ))}
            </table>
        </div>
    )
}

export default List;
```

components/Detail.js

```
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getDetail } from '../api/post';

const Detail = () => {
    const [data, setData] = useState({});

    const query = useParams();
    const history = useHistory();

    const handleGetDetail = async (query) => {
        try {
            const res = await getDetail(query.id);
            console.log(res.data)
            setData(res.data)
        } catch (e) {
            console.log(e)
        }
    };

    useEffect(() => {
        handleGetDetail(query)
    }, [query]);
    return (
        <>
            <h1>Detail</h1>
            <div>ID:{data.id}</div>
            <div>タイトル：{data.title}</div>
            <div>内容：{data.content}</div>
            <button onClick={() => history.push('/')}>戻る</button>
        </>
    )
}

export default Detail
```

components/Form.js

```
import React from 'react'

const Form = (props) => {
    const { handleChange, handleSubmit, value, buttonType } = props;
    return (
        <>
            <form>
                <div>
                    <label htmlFor="title">タイトル：</label>
                    <input type="text" name="title" id="title" onChange={e => handleChange(e)} value={value.title} />
                </div>
                <div>
                    <label htmlFor="content">内容：</label>
                    <input type="text" name="content" id="content" onChange={(e) => handleChange(e)} value={value.content} />
                </div>
                <input type="submit" value={buttonType} onClick={(e) => handleSubmit(e)} />
            </form>
        </>
    )
}

export default Form
```

components/New.js

```
import React, { useState } from 'react'
import FormBody from './Form'
import { useHistory } from 'react-router-dom'
import { createPost } from '../api/post'

const New = () => {
    const [value, setValue] = useState({
        title: "",
        content: ""
    })
    const history = useHistory();

    const handleChange = (e) => {
        setValue({
            ...value,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await createPost(value);
            console.log(res)
            history.push('/')
        } catch (e) {
            console.log(e)
        }
    }
    return (
        <>
            <h1>New</h1>
            <FormBody
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                value={value}
                buttonType="登録"
            />
        </>
    )
}

export default New
```

components/Edit.js

```
import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { getDetail, updatePost } from '../api/post';
import FormBody from './Form'

const Edit = () => {
    const [value, setValue] = useState({
        title: "",
        content: ""
    })

    const query = useParams();
    const history = useHistory();

    const handleGetData = async (query) => {
        try {
            const res = await getDetail(query.id)
            console.log(res.data)
            setValue({
                title: res.data.title,
                content: res.data.content
            })
        } catch (e) {
            console.log(e)
        }
    }

    const handleChange = (e) => {
        setValue({
            ...value,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await updatePost(query.id, value)
            console.log(res)

            history.push('/')
        } catch (e) {
            console.log(e)
        }
    }

    useEffect(() => {
        handleGetData(query);
    }, [query])
    return (
        <>
            <h1>Edit</h1>
            <FormBody
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                value={value}
                buttonType="更新"
            />
        </>
    )
}

export default Edit
```

# ログイン機能

## devise-token-auth を導入

```
gem 'devise'
gem 'devise_token_auth'
```

```
$ bundle install
```

```
$ rails g devise:install
$ rails g devise_token_auth:install User auth
$ rails db:migrate
```

## devise-token-auth の設定

```
DeviseTokenAuth.setup do |config|
  config.change_headers_on_each_request = false
  config.token_lifespan = 2.weeks
  config.token_cost = Rails.env.test? ? 4 : 10

  config.headers_names = {:'access-token' => 'access-token',
                         :'client' => 'client',
                         :'expiry' => 'expiry',
                         :'uid' => 'uid',
                         :'token-type' => 'token-type' }
end
```

## HTTP 通信設定の修正

./config/initializers/cors.rb

```
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "localhost:3000" # React側はポート番号3000で作るので「localhost:3000」を指定

    resource "*",
      headers: :any,
      expose: ["access-token", "expiry", "token-type", "uid", "client"], # 追記
      methods: [:get, :post, :put, :patch, :delete, :options, :head]
  end
end
```

## コントローラー作成

```
$ rails g controller api/v1/auth/registrations
$ rails g controller api/v1/auth/sessions
```

./app/controllers/api/v1/auth/registrations_controller.rb

```
class Api::V1::Auth::RegistrationsController < DeviseTokenAuth::RegistrationsController
    private
    def sign_up_params
        params.permit(:email, :password, :password_confirmation)
    end
end
```

./app/controllers/api/v1/auth/sessions_controller.rb

```
class Api::V1::Auth::SessionsController < ApplicationController
    def index
        if current_api_v1_user
            render json: {is_login: true, data: current_api_v1_user }
        else
            render json: {is_login: false, message: "ユーザーが存在しません"}
        end
    end
end
```

./app/controllers/application_controller.rb

```
class ApplicationController < ActionController::Base
  include DeviseTokenAuth::Concerns::SetUserByToken

  skip_before_action :verify_authenticity_token
  helper_method :current_user, :user_signed_in?
end
```

## ルーティング設定

./app/config/routes.rb

```
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :posts
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations'
      }

      namespace :auth do
        resources :sessions, only: %i[index]
      end
    end
  end
end
```

## 動作確認 →postman

---

**_サインアップ_**

POST `http://localhost:3001/api/v1/auth`

値

```
{
    "email": "example@gmail.com",
    "password": "password"
}
```

<img width="1301" alt="スクリーンショット 2021-09-12 17 19 03" src="https://user-images.githubusercontent.com/66903388/132979343-b2872067-3795-4325-a0c5-2dc3314e92bf.png">

ヘッダー情報には設定した'uid'、'access-token'、'client'情報が含まれています。

<img width="1301" alt="スクリーンショット 2021-09-12 17 24 31" src="https://user-images.githubusercontent.com/66903388/132979483-bf2947d5-04ab-45e9-8ad8-2940718b61c7.png">

**_サインイン_**

POST `http://localhost:3001/api/v1/auth/sign_in`

値

```
{
    "email": "example@gmail.com",
    "password": "password"
}
```

<img width="1301" alt="スクリーンショット 2021-09-12 17 22 01" src="https://user-images.githubusercontent.com/66903388/132979409-2450359b-7e37-4906-8d5c-93828d6c97e5.png">

こちらのヘッダー情報にも設定した'uid'、'access-token'、'client'情報が含まれています。

<img width="1301" alt="スクリーンショット 2021-09-12 17 25 16" src="https://user-images.githubusercontent.com/66903388/132979499-66e94890-57df-470e-be75-a291d71c4203.png">

**_サインアウト_**

DELETE `http://localhost:3001/api/v1/auth/sign_out`

サインアウト API に、サインイン情報に含まれた'uid'、'access-token'、'client'の ID を含めて送ることでサインアウトが完了します。

```
{
    "uid": "shogo@example.com",
    "access-token": "O6naQEOPRlt558FI9oEKXA",
    "client": "ZstUQu3TGkXzCZ4JAsBAGw"
}
```

↓

## ログイン機能のための npm パッケージをインストール

---

```
$ npm i js-cookie
```

- js-cookie

JS で Cookie を操作するためのライブラリ。

## ログイン用の API 通信関数を定義

---

/src/api/auth.js

```
import client from "./client";
import Cookies from 'js-cookie';

// サインアップ
export const signUp = (params) => {
    return client.post('/auth', params);
}

// サインイン
export const signIn = (params) => {
    return client.post('/auth/sign_in', params);
}

// サインアウト
export const signOut = () => {
    return client.delete('/auth/sign_out', {
        headers: {
            'access-token': Cookies.get('_access_token'),
            client: Cookies.get('_client'),
            uid: Cookies.get('_uid'),
        },
    });
};

// ログインユーザーの取得
export const getCurrentUser = () => {
    if(
        !Cookies.get('_access_token') ||
        !Cookies.get('_client') ||
        !Cookies.get('_uid')
    ) return;

    return client.get('/auth/sessions', {
        headers: {
            'access-token': Cookies.get('_access_token'),
            client: Cookies.get('_client'),
            uid: Cookies.get('_uid'),
        },
    });
};
```

## App.jsx で表示するコンポーネントを修正

```
import React, { useState, useEffect, createContext } from 'react'
import {
    BrowserRouter,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import Detail from './components/Detail';
import Edit from './components/Edit';
import List from './components/List';
import New from './components/New';
import SignIn from './components/users/SignIn';
import SignUp from './components/users/SignUp';
import { getCurrentUser } from './api/auth';

export const AuthContext = createContext();

function App() {
  const [loading, setLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState();

  const handleGetCurrentUser = async () => {
    try{
      const res = await getCurrentUser();

      if(res?.data.isLogin === true){
        setIsSignedIn(true);
        setCurrentUser(res?.data.data);
        console.log(res?.data.data);
      } else {
        console.log('no current user')
      }
    } catch(e){
      console.log(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    handleGetCurrentUser();
  }, [setCurrentUser]);

  const Private = ({children}) => {
    if(!loading){
      if(isSignedIn){
        return children;
      } else {
        return <Redirect to="/signin" />
      }
    } else {
      return <></>;
    }
  }
  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        isSignedIn,
        setIsSignedIn,
        currentUser,
        setCurrentUser,
      }}
    >
      <BrowserRouter>
        <Switch>
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/signin" component={SignIn} />
          <Private>
            <Route exact path='/' component={List} />
            <Route path="/post/:id" component={Detail} />
            <Route exact path='/new' component={New} />
            <Route path="/edit/:id" component={Edit} />
          </Private>
        </Switch>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
```

## ログイン用のコンポーネントを作成

---

- /src/components

コンポーネントをまとめておくディレクトリ

- /components/List.jsx

ログインが成功した時に遷移するページ

- /components/users

ログイン機能のコンポーネントをまとめておくディレクトリ

- /users/SignForm.jsx

ログインフォーム用のコンポーネント

- /users/SignIn.jsx

サインイン用のコンポーネント

- /users/SignUp.jsx

サインアップ用のコンポーネント

```
frontend
    |---src
        |---api
            |---client.js
            |---auth.js
            |---post.js
        |---components
            |---List.jsx
            |---users
                |---SignForm.jsx
                |---SignIn.jsx
                |---SignUp.jsx
```

↓

## ログイン機能のフォーム作成

---

/src/users/SignForm.jsx

```
import React from 'react'
import { Link } from 'react-router-dom'

const SignForm = (props) => {
    const {
        email,
        setEmail,
        password,
        setPassword,
        handleSubmit,
        signType,
        passwordConfirmation,
        setPasswordConfirmation,
    } = props;

    return (
        <>
            <form>
                <h1>{signType}</h1>
                <div>
                    <label htmlFor="email">メールアドレス</label>
                    <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                    <label htmlFor="password">パスワード</label>
                    <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {signType === 'signUp' && (
                    <div>
                        <label htmlFor="password_confirmation">パスワード確認</label>
                        <input type="password" id="password_confirmation" name="password_confirmation" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
                    </div>
                )}
                <button
                    type="submit"
                    disabled={!email || !password ? true : false}
                    onClick={handleSubmit}
                >
                    Submit
                </button>
                {signType === 'signIn' && (
                    <Link to="/signup">
                        Sign Up now!
                    </Link>
                )}
                {signType === 'signUp' && (
                    <Link to="/signin">
                        Sign In now!
                    </Link>
                )}
            </form>
        </>
    )
}

export default SignForm
```

↓

## サインイン用のコンポーネント

---

/src/components/users/SignIn.jsx

```
import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import Cookies from 'js-cookie'
import { AuthContext } from '../../App'
import { signIn } from '../../api/auth'
import SignForm from './SignForm'

const SignIn = () => {
    const history = useHistory();

    const {setIsSignedIn, setCurrentUser} = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const generateParams = () => {
        const signInParams = {
            email: email,
            password: password,
        }
        return signInParams;
    }

    const signInHandleSubmit = async (e) => {
        e.preventDefault();
        const params = generateParams();
        try{
            const res = await signIn(params);

            if(res.status === 200){
                Cookies.set('_access_token', res.headers['access-token']);
                Cookies.set('_client', res.headers['client']);
                Cookies.set('_uid', res.headers['uid']);

                setIsSignedIn(true);
                setCurrentUser(res.data.data);

                history.push('/');
            }
        } catch(e){
            console.log(e);
        }
    }

    return (
        <SignForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            handleSubmit={signInHandleSubmit}
            signType="signIn"
        />
    )
}

export default SignIn
```

↓

## サインアップ用のコンポーネント

---

/src/components/users/SignUp.jsx

```
import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import Cookies from 'js-cookie'
import { AuthContext } from '../../App'
import { signUp } from '../../api/auth'
import SignForm from './SignForm'

const SignUp = () => {
    const history = useHistory();
    const {setIsSignedIn, setCurrentUser} = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const generateParams = () => {
        const signUpParams = {
            email: email,
            password: password,
            passwordConfirmation: passwordConfirmation,
        }
        return signUpParams;
    }

    const signUpHandleSubmit = async (e) => {
        e.preventDefault();

        const params = generateParams();
        try{
            const res = await signUp(params);
            console.log(res);

            if(res.status === 200){
                Cookies.set('_access_token', res.headers['access-token']);
                Cookies.set('_client', res.headers['client']);
                Cookies.set('_uid', res.headers['uid']);

                setIsSignedIn(true)
                setCurrentUser(res.data.data);

                history.push('/');
                console.log('signed in successfully');
            }
        } catch(e){
            console.log(e);
        }
    }
    return (
        <SignForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            passwordConfirmation={passwordConfirmation}
            setPasswordConfirmation={setPasswordConfirmation}
            handleSubmit={signUpHandleSubmit}
            signType="signUp"
        />
    )
}

export default SignUp
```

### ログインした後のページにログイン状態とサインアウトボタンを配置

ホームページの修正

/src/components/List.jsx

```
import React, { useEffect, useState, useContext } from 'react'
import { deletePost, getList } from '../api/post';
import { useHistory, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { AuthContext } from '../App';
import { signOut } from '../api/auth';

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

    // 削除用の関数
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
            <h1>Home</h1>
            <button onClick={() => history.push('/new')}>新規作成</button>
            <table>
                <thead>
                    <tr>
                        <th>タイトル</th>
                        <th>内容</th>
                        <th colSpan="1"></th>
                        <th colSpan="1"></th>
                        <th colSpan="1"></th>
                    </tr>
                </thead>
                {dataList.map((item, index) => (
                    <tbody key={index}>
                        <tr>
                            <td>{item.title}</td>
                            <td>{item.content}</td>
                            <td>
                                <Link to={`/edit/${item.id}`}>更新</Link>
                            </td>
                            <td>
                                <Link to={`/post/${item.id}`}>詳細へ</Link>
                            </td>
                            <td>
                                <button onClick={() => handleDelete(item)}>削除</button>
                            </td>
                        </tr>
                    </tbody>
                ))}
            </table>
        </div>
    )
}

export default List;
```

# User モデルと Post モデルを 1 対多で関連付け

## posts テーブルに外部キーの user_id を追加する

```
$ rails g migration AddColumnsToPosts
```

日付\_add_columns_to_posts.rb

```
class AddColumnsToPosts < ActiveRecord::Migration[6.1]
  def change
    add_reference :posts, :user, foreign_key: true, after: :content
  end
end
```

```
$ rails db:migrate
```

これで user_id カラムが追加されました。

schema.rb

```
create_table "posts", force: :cascade do |t|
    t.string "title"
    t.text "content"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.integer "user_id"
    t.index ["user_id"], name: "index_posts_on_user_id"
end
```

## アソシエーション設定

user.rb

```
class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  include DeviseTokenAuth::Concerns::User

  has_many :posts, dependent: :destroy # 追加
end
```

post.rb

```
class Post < ApplicationRecord
    belongs_to :user # 追加
end
```

## ルーティング設定

routes.rb

```
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :posts
      resources :users # 追加
      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations'
      }

      namespace :auth do
        resources :sessions, only: %i[index]
      end
    end
  end
end
```

## コントローラ作成

```
rails g controller api/v1/users
```

users_controller.rb

```
class Api::V1::UsersController < ApplicationController
    def show
        render json: Post.where(user_id: params[:id])
    end
end
```

## ダミーデータ作成

seeds.rb

```
User.create!(email: "test1@test.com", password: "password", password_confirmation: "password")
User.create!(email: "test2@test.com", password: "password", password_confirmation: "password")

user1 = User.find(1)
Post.create!(title: "test1", content: "testtesttest", user: user1)
Post.create!(title: "test2", content: "testtesttest", user: user1)

user2 = User.find(2)
Post.create!(title: "test3", content: "testtesttest", user: user2)
Post.create!(title: "test4", content: "testtesttest", user: user2)
```

```
$ rails db:migrate:reset
$ rails db:seed
```

## コントローラの修正

application_controller.rb

```
class ApplicationController < ActionController::Base
        include DeviseTokenAuth::Concerns::SetUserByToken

        skip_before_action :verify_authenticity_token
        helper_method :current_user, :user_signed_in?, :authenticate_user! # 追加
end
```

posts_controller.rb

```
class Api::V1::PostsController < ApplicationController
    before_action :authenticate_api_v1_user!, only: [:create, :update, :destroy] # 追加
    def index
        posts = Post.all.order(created_at: :desc)
        render json: posts
    end

    def show
        post = Post.find(params[:id])
        render json: post
    end

    def create
        post = Post.new(post_params)
        if post.save
            render json: post
        else
            render json: post.errors, status: 422
        end
    end

    def update # 修正
        post = Post.find(params[:id])
        if current_api_v1_user.id == post.user_id
            if post.update(post_params)
                render json: post
            else
                render json: post.errors, status: 422
            end
        else
            render json: {message: 'can not update data'}, status: 422
        end
    end

    def destroy # 修正
        post = Post.find(params[:id])
        if current_api_v1_user.id == post.user_id
            post.destroy
            render json: post
        else
            render json: {message: 'can not delete data'}, status: 422
        end
    end

    private
    def post_params
        params.require(:post).permit(:title, :content).merge(user_id: current_api_v1_user.id) # 追加
    end
end
```

## React user の APIClient を作成

/src/api/user.js

```
import client from "./client";
import Cookies from "js-cookie";

export const getUserPosts = (id) => {
    return client.get(`/users/${id}`, {
        headers: {
            'access-token': Cookies.get('_access_token'),
            client: Cookies.get('_client'),
            uid: Cookies.get('_uid'),
        },
    });
};
```

## 投稿一覧の画面を切り出す

/src/commons/ListTable.jsx

```
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
```

## List.jsx を修正

List.jsx

```
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

    // 削除用の関数
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
```

## 自分の投稿一覧ページ作成

/src/components/users/UserPost.jsx

```
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
```

## ログインユーザーの投稿一覧ページへのルーティング配置

/src/App.jsx

```
import React, { useState, useEffect, createContext } from 'react'
import {
    BrowserRouter,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import Detail from './components/Detail';
import Edit from './components/Edit';
import List from './components/List';
import New from './components/New';
import SignIn from './components/users/SignIn';
import SignUp from './components/users/SignUp';
import { getCurrentUser } from './api/auth';
import Cookies from 'js-cookie';
import UserPost from './components/users/UserPost';

export const AuthContext = createContext();

function App() {
  const [loading, setLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState({});

  const handleGetCurrentUser = async () => {
    try{
      const res = await getCurrentUser();

      if(res?.data.isLogin === true){
        setIsSignedIn(true);
        setCurrentUser(res?.data.data);
        console.log(res?.data.data);
      } else {
        console.log('no current user')
        // token有効期限が切れている場合、古いCookieを全て削除
        Cookies.remove('_access_token');
        Cookies.remove('_client');
        Cookies.remove('_uid');
      }
    } catch(e){
      console.log(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    handleGetCurrentUser();
  }, [setCurrentUser]);

  const Private = ({children}) => {
    if(!loading){
      if(isSignedIn){
        return children;
      } else {
        return <Redirect to="/signin" />
      }
    } else {
      return <></>;
    }
  }
  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        isSignedIn,
        setIsSignedIn,
        currentUser,
        setCurrentUser,
      }}
    >
      <BrowserRouter>
        <Switch>
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/signin" component={SignIn} />
          <Private>
            <Route exact path='/' component={List} />
            <Route path="/post/:id" component={Detail} />
            <Route exact path='/new' component={New} />
            <Route path="/edit/:id" component={Edit} />
            {/* 追加 */}
            <Route exact path="/user/posts" component={UserPost} />
          </Private>
        </Switch>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
```

List.jsx

```
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

    // 削除用の関数
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
            <Link to="/user/posts">自分の投稿一覧</Link> # 追加
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
```

## API クライアントに header を追加

/src/api/post.js

```
// /src/lib/api/post.js
import client from './client';
import Cookies from 'js-cookie';

// 一覧
export const getList = () => {
  return client.get('/posts');
};

// 詳細
export const getDetail = (id) => {
  return client.get(`/posts/${id}`);
};

// 新規作成
// header情報を追加
export const createPost = (params) => {
  return client.post('/posts', params, {
    headers: {
      'access-token': Cookies.get('_access_token'),
      client: Cookies.get('_client'),
      uid: Cookies.get('_uid'),
    },
  });
};

// 更新
// header情報を追加
export const updatePost = (id, params) => {
  return client.patch(`/posts/${id}`, params, {
    headers: {
      'access-token': Cookies.get('_access_token'),
      client: Cookies.get('_client'),
      uid: Cookies.get('_uid'),
    },
  });
};

// 削除
// header情報を追加
export const deletePost = (id) => {
  return client.delete(`/posts/${id}`, {
    headers: {
      'access-token': Cookies.get('_access_token'),
      client: Cookies.get('_client'),
      uid: Cookies.get('_uid'),
    },
  });
};
```

# いいね機能作成

## Like モデル作成(Backend)

```
$ rails g model Like user:references post:references
```

マイグレーションファイル

```
class CreateMessages < ActiveRecord::Migration[6.1]
  def change
    create_table :messages do |t|
      t.references :user
      t.references :post
      t.timestamps
    end
  end
end
```

```
$ rails db:migrate
```

## Like アソシエーション追加

model/user.rb

```
# 追加
has_many :likes
```

model/post.rb

```
# 追加
has_many :likes
```

model/like.rb

```
belongs_to :user
belongs_to :post
```

## likes コントローラー作成

```
$ rails g controller api/v1/likes
```

controllers/api/v1/likes

```
class Api::V1::LikesController < ApplicationController
    before_action :authenticate_api_v1_user!, only: ['create']

    def create
        like = Like.new(post_id: params[:id], user_id: current_api_v1_user.id)

        if like.save
            render json: like
        else
            render json: like.errors, status: 422
        end
    end

    def destroy
        like = Like.find_by(user_id: current_api_v1_user.id, post_id: params[:id])
        if like.destroy
            render json: like
        else
            render json: like.errors, status: 422
        end
    end
end
```

## like ルーティング設定

```
# 追加
resources :posts do
    member do
        resources :likes, only: ["create"]
    end
end
resources :likes, only: ["destroy"]
```

ルーティング確認

```
$ rails routes | grep likes

api_v1_likes POST   /api/v1/posts/:id/likes(.:format)    api/v1/likes#create
api_v1_like DELETE  /api/v1/likes/:id(.:format)   api/v1/likes#destroy
```

## Postman でテスト

サインイン情報に含まれる以下の情報を likes のエンドポイント API に入れる

- access-token
- client
- uid

いいね作成

http://localhost:3001/api/v1/posts/1/likes

ヘッダー情報にログイン情報で得た`access-token, client, uid`を入れて send ボタンを押す

成功したら以下のような response が返ってくる

```
{
    "id": 2,
    "user_id": 3,
    "post_id": 2,
    "created_at": "2021-12-15T17:54:00.684Z",
    "updated_at": "2021-12-15T17:54:00.684Z"
}
```

いいね削除

http://localhost:3001/api/v1/likes/1

ヘッダー情報にログイン情報で得た`access-token, client, uid`を入れて send ボタンを押す

成功したら以下のような response が返ってくる

```
{
    "id": 1,
    "user_id": 3,
    "post_id": 1,
    "created_at": "2021-12-15T18:22:09.657Z",
    "updated_at": "2021-12-15T18:22:09.657Z"
}
```

## いいね機能表示(Frontend)

### API エンドポイント作成

src/api/like.js

```
import Cookies from "js-cookie";
import client from "./client";

export const createLike = (id) => {
  return client.post(
    `/posts/${id}/likes`,
    {}, // createにはデータ追加の箱が必要
    {
      headers: {
        "access-token": Cookies.get("_access_token"),
        client: Cookies.get("_client"),
        uid: Cookies.get("_uid"),
      },
    }
  );
};

export const deleteLike = (id) => {
  return client.delete(`/likes/${id}`, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};

```

ちゃんとヘッダーに`"access-token", client, uid`を入れるのを忘れない。

### いいね機能の API 関数作成

posts 一覧を表示しているページでいいね機能の関数を作成して、map で回した id をその関数に入れる。

src/commons/ListTable.jsx

```
import React, { memo } from "react";
import { Link } from "react-router-dom";
import { createLike, deleteLike } from "../api/like";

const ListTable = memo((props) => {
  const { dataList, handleDelete, currentUser, handleGetList // 追加 } = props;

　// ここから追加
  const handleCreateLike = async (item) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetList(); // posts一覧を取得
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetList(); // posts一覧を取得
    } catch (e) {
      console.log(e);
    }
  };
  // ここまで追加

  return (
    <table>
      <thead>
        <tr>
          <th>メールアドレス</th>
          <th>タイトル</th>
          <th>内容</th>
          // 追加
          <th>いいね</th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {dataList.map((item) => (
          <tr key={item.id}>
            <td>{item.email}</td>
            <td>{item.title}</td>
            <td>{item.content}</td>
            // ここから追加
            <td>
              {item.likes.find((like) => like.userId === currentUser.id) ? (
                <p onClick={() => handleDeleteLike(item)}>
                  ♡{item.likes.length}
                </p>
              ) : (
                <p onClick={() => handleCreateLike(item)}>
                  ♡{item.likes.length}
                </p>
              )}
            </td>
            // ここまで追加
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
      </tbody>
    </table>
  );
});

export default ListTable;

```

いいね機能の条件分岐は find メソッドを使い、likes 配列の中の userId の中に
currentUser.id が入っているかを調べ、入っていたら削除、無かったら作成するような作りにする。

いいね機能の関数の中に、成功した場合、最後に posts データ一覧の更新をすることで非同期で表示がされるようになる。
そのため、List コンポーネントから handleGetList 関数を props で渡している。

```
const handleCreateLike = async (item) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetList(); // posts一覧を再取得
    } catch (e) {
      console.log(e);
    }
  };
```

## プロフィールページ作成

一旦、UserPost コンポーネントを削除しておきましょう。

プロフィールページには、ユーザー情報、ユーザー投稿情報が入ります。

### プロフィールページに表示するための JSON データを作成(Backend)

app/controllers/api/v1/users_controller.rb

```
# 追加
def show
    user = User.find(params[:id])
    posts = Post.where(user_id: user.id)
    user_list = {
        id: user.id,
        email: user.email,
        # ユーザーが投稿した情報をmapで回し、情報を入れている。
        posts: posts.map {|post| {id: post.id, title: post.title, content: post.content, likes: post.likes}},
    }
    render json: user_list
end
```

### API 設定(Frontend)

src/api/user.js

```
export const getUser = (id) => {
  return client.get(`/users/${id}`, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};
```

### ルーティング作成

src/App.jsx

```
# 追加
<Route path="/users/:id" component={Profile} />
```

### Profile コンポーネント作成

src/components/users/Profile.jsx

```
import { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getUser } from "../../api/user";

export const Profile = () => {
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      console.log(res.data);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
  }, [query]);
  return (
    <>
      <h1>ユーザー</h1>
      <div>メールアドレス：{user.email}</div>
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            <p>いいね{post.likes.length}</p>
          </div>
        ))}
      </div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};
```

### 投稿一覧画面のユーザーメールアドレスを Profile に遷移するリンクにする

src/commons/ListTable.jsx

```
# 追加
<td>
    <Link to={`/users/${item.userId}`}>{item.email}</Link>
</td>
```

## プロフィールページをログインユーザーとそれ以外で切り分ける

src/components/users/Profile.jsx

```
import { useState, useEffect, useContext # 追加 } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getUser } from "../../api/user";
# 追加
import { AuthContext } from "../../App";

export const Profile = () => {
    # 追加
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      console.log(res.data);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
  }, [query]);
  return (
    <>
      <h1>ユーザー</h1>
      <div>メールアドレス：{user.email}</div>
      # 追加
      {user.id === currentUser.id && <p>現在のユーザーです</p>}
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            <p>いいね{post.likes.length}</p>
          </div>
        ))}
      </div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};

```

## ホーム画面にログインユーザーのプロフィールリンクを配置

src/components/List.jsx

```
# 追加
<p>
    <Link to={`/users/${currentUser.id}`}>マイページ</Link>
</p>
```

## 投稿詳細にユーザー情報を入れる

app/controllers/api/v1/posts_controller.rb

```
# 修正
def show
    post = Post.find(params[:id])
    post_list = {
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        user: post.user
    }
    render json: post_list
end
```

src/components/Detail.jsx

```
return (
    <>
      <h1>Detail</h1>
      # 追加
      <div>{data.user?.email}</div>
      <div>ID:{data.id}</div>
      <div>タイトル：{data.title}</div>
      <div>内容：{data.content}</div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
);
```

`TypeError: Cannot read properties of undefined`というエラーが出たときはそのプロパティがあるかどうかを判定する`?`をつければ大抵解決する。

## 投稿詳細画面のユーザーメールアドレスをクリックするとそのユーザーのページに遷移するリンクを配置

src/components/Detail.jsx

```
return (
    <>
      <h1>Detail</h1>
      # 追加
      <div>
        <Link to={`/users/${data.user?.id}`}>{data.user?.email}</Link>
      </div>
      <div>ID:{data.id}</div>
      <div>タイトル：{data.title}</div>
      <div>内容：{data.content}</div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
);
```

## 投稿詳細画面にいいね機能をつける

app/controllers/api/v1/posts_controller.rb

```
def show
    post = Post.find(params[:id])
    post_list = {
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        user: post.user,
        # 追加
        likes: post.likes
    }
    render json: post_list
end
```

src/components/Detail.jsx

```
import React, { useContext // 追加, useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { createLike, deleteLike } from "../api/like";
import { getDetail } from "../api/post";
// 追加
import { AuthContext } from "../App";

const Detail = () => {
　// 追加
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});

  const query = useParams();
  const history = useHistory();

  // ここから追加
  // いいね機能関数
  const handleCreateLike = async (item) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetDetail(item);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetDetail(item);
    } catch (e) {
      console.log(e);
    }
  };
  // ここまで追加

  const handleGetDetail = async (query) => {
    try {
      const res = await getDetail(query.id);
      console.log(res.data);
      setData(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetDetail(query);
  }, [query]);
  return (
    <>
      <h1>Detail</h1>
      <div>
        <Link to={`/users/${data.user?.id}`}>{data.user?.email}</Link>
      </div>
      <div>ID:{data.id}</div>
      <div>タイトル：{data.title}</div>
      <div>内容：{data.content}</div>
      // ここから追加
      <div>
        {data.likes?.find((like) => like.userId === currentUser.id) ? (
          <p onClick={() => handleDeleteLike(data)}>♡{data.likes?.length}</p>
        ) : (
          <p onClick={() => handleCreateLike(data)}>♡{data.likes?.length}</p>
        )}
      </div>
      // ここまで追加
      {currentUser.id === data.user?.id && (
      <div>
        <Link to={`/edit/${data.id}`}>更新</Link>
      </div>
      )}
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};

export default Detail;

```

## プロフィール画面のユーザーの投稿のいいね機能

src/components/users/Profile.jsx

```
import { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
// 追加
import { createLike, deleteLike } from "../../api/like";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

　// ここから追加
　// 表示するにはユーザー情報も更新する必要があるので、第二引数にユーザーを入れて、handleGetUserを更新できるようにしている。
  // いいね機能関数
  const handleCreateLike = async (item, user) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item, user) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };
  // ここまで追加

  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      console.log(res.data);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  return (
    <>
      <h1>ユーザー</h1>
      <div>メールアドレス：{user.email}</div>
      {user.id === currentUser.id && <p>現在のユーザーです</p>}
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            // ここから修正
            <div>
              {post.likes?.find((like) => like.userId === currentUser.id) ? (
                <p onClick={() => handleDeleteLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              ) : (
                <p onClick={() => handleCreateLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              )}
            </div>
            // ここまで修正
          </div>
        ))}
      </div>
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};

```

## プロフィール画面上にいいねした投稿一覧表示

app/controllers/api/v1/users_controller.rb

```
class Api::V1::UsersController < ApplicationController
    def show
        user = User.find(params[:id])
        posts = Post.where(user_id: user.id)
        user_likes = Like.where(user_id: user.id)
        user_list = {
            id: user.id,
            email: user.email,
            posts: posts.map {|post| {id: post.id, title: post.title, content: post.content, likes: post.likes}},
            # 追加
            like_posts: user_likes.map {|like| {id: like.id, post_id: like.post_id, user_id: like.user_id, post: Post.where(id: like.post_id), post_user: Post.where(id: like.post_id)[0].user, likes_count: Post.where(id: like.post_id)[0].likes}}
        }
        render json: user_list
    end
end
```

src/components/users/Profile.jsx

```
import { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { createLike, deleteLike } from "../../api/like";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

  // いいね機能関数
  const handleCreateLike = async (item, user) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item, user) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      console.log(res.data);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  return (
    <>
      <h1>ユーザー</h1>
      <button onClick={() => history.push("/")}>戻る</button>
      <div>メールアドレス：{user.email}</div>
      {user.id === currentUser.id && <p>現在のユーザーです</p>}
      <h2>ユーザーの投稿</h2>
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            <div>
              {post.likes?.find((like) => like.userId === currentUser.id) ? (
                <p onClick={() => handleDeleteLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              ) : (
                <p onClick={() => handleCreateLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      // ここから追加
      <h2>ユーザーがいいねした投稿</h2>
      <div>
        {user.likePosts?.map((likePost) => (
          <div key={likePost.id}>
            <p>{likePost.postUser?.email}</p>
            <p>{likePost.post[0]?.title}</p>
            <p>{likePost.post[0]?.content}</p>
            <p>♡{likePost.likesCount.length}</p>
            // 単純にいいね機能をつけてしまうと、いいねを外した段階でここから消えてしまうため、お気に入りから削除するというUIにした。
            <p onClick={() => handleDeleteLike(likePost.post[0], user)}>
              お気に入りから削除
            </p>
          </div>
        ))}
      </div>
      # ここまで追加
    </>
  );
};

```

## フォロー機能作成

作成手順

1. Relationship モデルを作る
2. Relationship のマイグレーションファイルを編集&実行
3. user モデルと Relationship モデルにアソシエーションを書く
4. relationships コントローラで API を作成
5. ルーティング設定
6. フロントエンドで API 設定
7. 表示実装

### 1. Relationship モデルを作る

user テーブル同士で「多対多」の関係を作ります。

何故ならフォロワーもまた user だからです。イメージとしては user テーブル同士を relationships という中間テーブルでアソシエーションを組むイメージ

```
$ rails g model Relationship
```

### 2. Relationship のマイグレーションファイルを編集&実行

db/migrate/年月日時\_create_relationships.rb

```
class CreateRelationships < ActiveRecord::Migration[5.0]
  def change
    create_table :relationships do |t|
      t.references :user, foreign_key: true
      t.references :follow, foreign_key: { to_table: :users }

      t.timestamps

      t.index [:user_id, :follow_id], unique: true
    end
  end
end
```

```
$ rails db:migrate
```

### 3. user モデルと Relationship モデルにアソシエーションを書く

app/models/relationship.rb

```
class Relationship < ApplicationRecord
  belongs_to :user
  belongs_to :follow, class_name: 'User'

  validates :user_id, presence: true
  validates :follow_id, presence: true
end
```

class_name: ‘User’ と補足設定することで、Follow クラスという存在しないクラスを参照することを防ぎ、User クラスであることを明示しています。

app/models/user.rb

```
class User < ApplicationRecord
  has_many :relationships
  has_many :followings, through: :relationships, source: :follow
  has_many :reverse_of_relationships, class_name: 'Relationship', foreign_key: 'follow_id'
  has_many :followers, through: :reverse_of_relationships, source: :user
end
```

- foregin_key = 入口
- source = 出口
- through: :relationships は「中間テーブルは relationships だよ」って設定してあげてるだけ
- user.followings と打つだけで、user が中間テーブル relationships を取得し、その 1 つ 1 つの relationship の follow_id から、「フォローしている User 達」を取得

### 4. relationships コントローラで API を作成

```
$　rails g controller api/v1/relationships
```

app/controllers/api/v1/relationships_controller.rb

```
class Api::V1::RelationshipsController < ApplicationController

    def index
        relationships = Relationship.all.order(created_at: :desc)
        render json: relationships
    end

    def create
        relationship = Relationship.new(follow_id: params[:id], user_id: current_api_v1_user.id)
        if relationship.save
            render json: relationship
        else
            render json: relationship.errors, status: 422
        end
    end

    def destroy
        relationship = Relationship.find_by(follow_id: params[:id], user_id: current_api_v1_user.id)
        if relationship.destroy
            render json: relationship
        else
            render json: relationship.errors, status: 422
        end
    end
end

```

### 5. ルーティング設定

config/routes.rb

```
# 追加
resources :relationships, only: [:index, :destroy]
# 編集＆追加
resources :users do
  member do
    resources :relationships, only: [:create]
  end
end
```

### 6. フロントエンドで API 設定

src/api/follow.js

```
import client from "./client";
import Cookies from "js-cookie";

export const createFollow = (id) => {
  return client.post(
    `/users/${id}/relationships`,
    {},
    {
      headers: {
        "access-token": Cookies.get("_access_token"),
        client: Cookies.get("_client"),
        uid: Cookies.get("_uid"),
      },
    }
  );
};

export const deleteFollow = (id) => {
  return client.delete(`/relationships/${id}`, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};

```

### 7. 表示実装

src/components/users/Profile.jsx

```
import { useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import { createFollow, deleteFollow } from "../../api/follow";
import { createLike, deleteLike } from "../../api/like";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const Profile = () => {
  const { currentUser, handleGetCurrentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

  // いいね機能関数
  const handleCreateLike = async (item, user) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item, user) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  // ここから追加
  // フォロー機能関数
  const handleCreateFollow = async (item) => {
    try {
      await createFollow(item.id);
      handleGetCurrentUser();
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
  // ここまで追加

  // ユーザーを取得
  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <>
      <h1>ユーザー</h1>
      <button onClick={() => history.push("/")}>戻る</button>
      <div>メールアドレス：{user.email}</div>
      // ここから編集＆追加
      {user.id === currentUser.id ? (
        <div>現在のユーザーです</div>
      ) : (
        <div>
          {currentUser.followings?.find(
            (following) => user.id === following.id
          ) ? (
            <div onClick={() => handleDeleteFollow(user)}>フォローを外す</div>
          ) : (
            <div onClick={() => handleCreateFollow(user)}>フォローをする</div>
          )}
        </div>
      )}
      <p>
        フォロー数{user.followings?.length} フォロワー数{user.followers?.length}
      </p>
      // ここまで編集＆追加
      <h2>ユーザーの投稿</h2>
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            <div>
              {post.likes?.find((like) => like.userId === currentUser.id) ? (
                <p onClick={() => handleDeleteLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              ) : (
                <p onClick={() => handleCreateLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <h2>ユーザーがいいねした投稿</h2>
      <div>
        {user.likePosts?.map((likePost) => (
          <div key={likePost.id}>
            <p>{likePost.postUser?.email}</p>
            <p>{likePost.post[0]?.title}</p>
            <p>{likePost.post[0]?.content}</p>
            <p>♡{likePost.likesCount.length}</p>
            <p onClick={() => handleDeleteLike(likePost.post[0], user)}>
              お気に入りから削除
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

```

### フォロー、フォロワー一覧ページ作成

**一覧ページ**
src/components/Friends.jsx

```
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
```

**フォロー一覧**

src/components/follow/FollowingList.jsx

```
import { memo, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { deleteFollow } from "../../api/follow";
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
```

**フォロワー一覧**

src/components/follow/FollowerList.jsx

```
import { memo, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import { createFollow, deleteFollow } from "../../api/follow";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const FollowerList = memo(() => {
  const [followers, setFollowers] = useState([]);
  const { currentUser, handleGetCurrentUser } = useContext(AuthContext);
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

  // フォロー機能関数
  const handleCreateFollow = async (item) => {
    try {
      await createFollow(item.id);
      handleGetCurrentUser();
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
    handleGetFollowers(query);
  }, [query]);
  return (
    <div>
      <h1>フォロワー</h1>
      {followers?.map((follower) => (
        <div key={follower.id}>
          <p>
            <Link to={`/users/${follower.id}`}>{follower.email}</Link>
            {currentUser.id === user.id && (
              <>
                {currentUser.followings?.find(
                  (follow) => follow.id === follower.id
                ) ? (
                  <span onClick={() => handleDeleteFollow(follower)}>
                    フォローを外す
                  </span>
                ) : (
                  <span onClick={() => handleCreateFollow(follower)}>
                    フォローをする
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      ))}
      <button onClick={() => history.push(`/users/${user.id}`)}>戻る</button>
    </div>
  );
});
```

**ルーティング設定**

src/App.jsx

```
import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Detail from "./components/Detail";
import Edit from "./components/Edit";
import List from "./components/List";
import New from "./components/New";
import SignIn from "./components/users/SignIn";
import SignUp from "./components/users/SignUp";
import { getCurrentUser } from "./api/auth";
import Cookies from "js-cookie";
import { Profile } from "./components/users/Profile";
import { Friends } from "./components/Friends";

export const AuthContext = createContext();

function App() {
  const [loading, setLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({});

  const handleGetCurrentUser = async () => {
    try {
      const res = await getCurrentUser();

      if (res?.data.isLogin === true) {
        setIsSignedIn(true);
        setCurrentUser(res?.data.data);
        console.log(res?.data.data);
      } else {
        console.log("no current user");
        Cookies.remove("_access_token");
        Cookies.remove("_client");
        Cookies.remove("_uid");
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    handleGetCurrentUser();
  }, [setCurrentUser]);

  const Private = ({ children }) => {
    if (!loading) {
      if (isSignedIn) {
        return children;
      } else {
        return <Redirect to="/signin" />;
      }
    } else {
      return <></>;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        isSignedIn,
        setIsSignedIn,
        currentUser,
        setCurrentUser,
        handleGetCurrentUser,
      }}
    >
      <BrowserRouter>
        <Switch>
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/signin" component={SignIn} />
          <Private>
            <Route exact path="/" component={List} />
            <Route path="/post/:id" component={Detail} />
            <Route exact path="/new" component={New} />
            <Route path="/edit/:id" component={Edit} />
            <Route path="/users/:id" component={Profile} />
            // ここから追加
            <Route path="/follower/:id">
              <Friends showFollower />
            </Route>
            <Route path="/following/:id">
              <Friends />
            </Route>
            // ここまで追加
          </Private>
        </Switch>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
```

**フォロー、フォロワー一覧に遷移するリンク配置**

src/components/users/Profile.jsx

```
import { useState, useEffect, useContext } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { createFollow, deleteFollow } from "../../api/follow";
import { createLike, deleteLike } from "../../api/like";
import { getUser } from "../../api/user";
import { AuthContext } from "../../App";

export const Profile = () => {
  const { currentUser, handleGetCurrentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});
  const history = useHistory();
  const query = useParams();

  // いいね機能関数
  const handleCreateLike = async (item, user) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item, user) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetUser(user);
    } catch (e) {
      console.log(e);
    }
  };

  // フォロー機能関数
  const handleCreateFollow = async (item) => {
    try {
      await createFollow(item.id);
      handleGetCurrentUser();
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

  // ユーザーを取得
  const handleGetUser = async (query) => {
    try {
      const res = await getUser(query.id);
      setUser(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetUser(query);
  }, [query]);

  return (
    <>
      <h1>ユーザー</h1>
      <button onClick={() => history.push("/")}>戻る</button>
      <div>メールアドレス：{user.email}</div>
      {user.id === currentUser.id ? (
        <div>現在のユーザーです</div>
      ) : (
        <div>
          {currentUser.followings?.find(
            (following) => user.id === following.id
          ) ? (
            <div onClick={() => handleDeleteFollow(user)}>フォローを外す</div>
          ) : (
            <div onClick={() => handleCreateFollow(user)}>フォローをする</div>
          )}
        </div>
      )}
      // ここから修正
      <p>
        <Link to={`/following/${user.id}`}>
          フォロー数{user.followings?.length}
        </Link>
        <Link to={`/follower/${user.id}`}>
          フォロワー数{user.followers?.length}
        </Link>
      </p>
      // ここまで修正
      <h2>ユーザーの投稿</h2>
      <div>
        {user.posts?.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
            <p>{post.content}</p>
            <div>
              {post.likes?.find((like) => like.userId === currentUser.id) ? (
                <p onClick={() => handleDeleteLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              ) : (
                <p onClick={() => handleCreateLike(post, user)}>
                  ♡{post.likes?.length}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      <h2>ユーザーがいいねした投稿</h2>
      <div>
        {user.likePosts?.map((likePost) => (
          <div key={likePost.id}>
            <p>{likePost.postUser?.email}</p>
            <p>{likePost.post[0]?.title}</p>
            <p>{likePost.post[0]?.content}</p>
            <p>♡{likePost.likesCount.length}</p>
            <p onClick={() => handleDeleteLike(likePost.post[0], user)}>
              お気に入りから削除
            </p>
          </div>
        ))}
      </div>
    </>
  );
};
```

## コメント機能作成

### Comment モデル作成

```
$ rails g model Comment
```

### マイグレーション設定＆実行

db/migrate/年月日時\_create_relationships.rb

```
class CreateComments < ActiveRecord::Migration[6.1]
  def change
    create_table :comments do |t|
      t.text :content
      t.references :user, null: false, foreign_key: true
      t.references :post, null: false, foreign_key: true

      t.timestamps
    end
  end
end
```

```
$ rails db:migrate
```

### モデルアソシエーション設定

app/models/comment.rb

```
class Comment < ApplicationRecord
  belongs_to :user
  belongs_to :post
end
```

app/models/user.rb

```
# 追加
has_many :comments, dependent: :destroy
```

app/models/post.rb

```
# 追加
has_many :comments, dependent: :destroy
```

### comments コントローラー作成

app/controllers/api/v1/comments_controller.rb

```
class Api::V1::CommentsController < ApplicationController

    def create
        comment = current_api_v1_user.comments.new(post_id: params[:post_id], user_id: current_api_v1_user.id, content: params[:content])
        if comment.save
            render json: comment
        else
            render json: comment.errors, status: 422
        end
    end
end
```

### ルーティング設定

```
resources :posts do
  # 追加
  resources :comments, only: [:create]
  member do
    resources :likes, only: [:create]
  end
end
```

### フロントエンド API 設定

src/api/comment.js

```
import client from "./client";
import Cookies from "js-cookie";

export const createComment = (id, params) => {
  return client.post(`/posts/${id}/comments`, params, {
    headers: {
      "access-token": Cookies.get("_access_token"),
      client: Cookies.get("_client"),
      uid: Cookies.get("_uid"),
    },
  });
};
```

### 表示作成

src/components/Detail.jsx

```
import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams, Link } from "react-router-dom";
import { createComment } from "../api/comment";
import { createLike, deleteLike } from "../api/like";
import { getDetail } from "../api/post";
import { AuthContext } from "../App";

const Detail = () => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState({});

  // commentValue
  const [commentValue, setCommentValue] = useState({
    content: "",
  });

  const query = useParams();
  const history = useHistory();

  // いいね機能関数
  const handleCreateLike = async (item) => {
    try {
      const res = await createLike(item.id);
      console.log(res.data);
      handleGetDetail(item);
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteLike = async (item) => {
    try {
      const res = await deleteLike(item.id);
      console.log(res.data);
      handleGetDetail(item);
    } catch (e) {
      console.log(e);
    }
  };

  // ここから追加
  // コメント機能関数
  const handleChange = (e) => {
    setCommentValue({
      ...commentValue,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    try {
      const res = await createComment(id, commentValue);
      console.log(res.data);
      history.push(`/post/${data.id}`);
    } catch (e) {
      console.log(e);
    }
    setCommentValue({
      content: "",
    });
  };
  // ここまで追加

  const handleGetDetail = async (query) => {
    try {
      const res = await getDetail(query.id);
      console.log(res.data);
      setData(res.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetDetail(query);
  }, [query]);
  return (
    <>
      <h1>Detail</h1>
      <div>
        <Link to={`/users/${data.user?.id}`}>{data.user?.email}</Link>
      </div>
      <div>ID:{data.id}</div>
      <div>タイトル：{data.title}</div>
      <div>内容：{data.content}</div>
      <div>
        {data.likes?.find((like) => like.userId === currentUser.id) ? (
          <p onClick={() => handleDeleteLike(data)}>♡{data.likes?.length}</p>
        ) : (
          <p onClick={() => handleCreateLike(data)}>♡{data.likes?.length}</p>
        )}
      </div>
      {currentUser.id === data.user?.id && (
        <div>
          <Link to={`/edit/${data.id}`}>更新</Link>
        </div>
      )}
      // ここから追加
      <form>
        <div>
          <label htmlFor="content">コメント</label>
          <input
            type="text"
            id="content"
            name="content"
            onChange={(e) => handleChange(e)}
            value={commentValue.content}
          />
        </div>
        <input
          type="submit"
          value="コメントする"
          onClick={(e) => handleSubmit(e, data.id)}
        />
      </form>
      {data.comments?.map((comment) => (
        <div key={comment.id}>
          <p>{comment.user[0].email}</p>
          <p>{comment.id}</p>
          <p>{comment.content}</p>
        </div>
      ))}
      // ここまで追加
      <button onClick={() => history.push("/")}>戻る</button>
    </>
  );
};

export default Detail;
```
