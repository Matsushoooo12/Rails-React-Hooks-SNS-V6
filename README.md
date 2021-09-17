# Rails API + React Hooks [SNS 編]

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
        if current_api_v1_user.id === post.user_id
            ActiveRecord::Base.transaction do
                if post.update(post_params)
                    render json: post
                else
                    render json: post.errors, status: 422
                end
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
