import React from "react";

function Form(props) {
  return (
    <form className="form">
      <h1> {props.isNewUser ? "register" : "login"} </h1>
      <input type="text" placeholder="username" />
      <input type="text" placeholder="password" />

      <button type="submit"> submit </button>
    </form>
  );
}
export default Form;
