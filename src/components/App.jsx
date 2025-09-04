import React from "react";
import Form from "./Form";

var isNewUser = true;

function App() {
  return (
    <div className="container">
      <Form isNewUser={isNewUser} />
    </div>
  );
}
export default App;
