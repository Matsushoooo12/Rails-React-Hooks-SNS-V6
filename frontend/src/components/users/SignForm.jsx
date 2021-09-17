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
