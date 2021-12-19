import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { getDetail, updatePost } from "../api/post";
import FormBody from "./Form";

const Edit = () => {
  const [value, setValue] = useState({
    title: "",
    content: "",
  });

  const query = useParams();
  const history = useHistory();

  const handleGetData = async (query) => {
    try {
      const res = await getDetail(query.id);
      console.log(res.data);
      setValue({
        title: res.data.title,
        content: res.data.content,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleChange = (e) => {
    setValue({
      ...value,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updatePost(query.id, value);
      console.log(res);
      history.push("/");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    handleGetData(query);
  }, [query]);
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
  );
};

export default Edit;
