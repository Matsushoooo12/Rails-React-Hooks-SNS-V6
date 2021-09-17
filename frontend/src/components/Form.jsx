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
