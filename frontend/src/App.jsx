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
            <Route path="/follower/:id">
              <Friends showFollower />
            </Route>
            <Route path="/following/:id">
              <Friends />
            </Route>
          </Private>
        </Switch>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
