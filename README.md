# todoReact

## React routing

install the library with the command:

```bash
npm install react-router-dom
```

in main.jsx wrap the App component with a browser router:

```jsx
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

in App.jsx, define the routes with a path and an element for each page:

```jsx
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
```

use the Link component to navigate between screens:

```jsx
<Link to="/Login">Login</Link>
```

of navigating inside a function, use native react navigation:

```jsx
import { Link, useNavigate } from "react-router-dom";
// . . .
function handleOnClick(e) {
  navigate("/Home");
}
// . . .
<Button onClick={handleOnClick} text="Log In" />;
```

## Input Component

### Part 1: Creating and Using the Component

A strong reusable component accepts standard properties (props). By destructuring specific props like `placeholder`, `value`, and `onChange`, we control the core behavior. Adding the rest operator (`...props`) ensures that any standard HTML attributes passed from the parent (like `required`, `disabled`, or `id`) are automatically forwarded to the native input element - but not very readable.

#### 1. The Reusable Component (`Input.jsx`)

```jsx
import "./Input.css";

export default function Input({ placeholder, value, onChange, type = "text" }) {
  return (
    <>
      <input
        className="input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        type={type}
      />
    </>
  );
}
```

#### 2. Managing State in the Parent (`Login.jsx`)

To make the input functional, the parent component must store the data and provide a way to update it.

- **useState**: Initializes a state variable (`email`) and a function to update it (`setEmail`).
- **Handler Function**: `handleOnChange` receives the browser event (`e`) and extracts the new text string via `e.target.value`, passing it to `setEmail`.
- **Binding**: The state and the handler are passed into our custom `<Input/>` component via props.

```jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input/Input";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");

  function handleOnChange(e) {
    setEmail(e.target.value);
  }
  return (
    <div className="divi">
      <p className="text">please log in already</p>
      <Input
        placeholder="email.com"
        value={email}
        onChange={handleOnChange}
        type="email"
      />
      <Link to="/">Landing</Link>
      <Link to="/Home">Home</Link>
    </div>
  );
}
```

### Part 2: Component Layout and Styling

When styling components, it is best practice to handle inner element sizing on the component itself, while handling the layout and spacing in the parent container.

- **The Input**: Avoid using `display: flex` directly on an HTML `<input>`. Instead, use standard box model properties like `padding`, `width: 100%`, and `box-sizing: border-box`. This guarantees the input fills its space reliably.
- **The Container**: The parent wrapper uses Flexbox to align elements. Applying the `gap` property ensures clean, even spacing between all children (text, input, and links) without needing to apply manual margins to each element.

#### Styles (`Input.css` and `Login.css`)

```css
.input {
  width: 100%;
  max-width: 180px;
  padding: 12px;
  border-radius: 8px;
  border: 3px solid rgb(209, 196, 196);
}
```

and in login.css:

```css
.divi {
  padding-top: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 20px;
}
```

## useState

### What is `useState`?

`useState` is a React Hook that allows you to store and track data (state) inside a functional component. When this data changes, React automatically re-renders the component to show the updated information on the screen.

### How it works

When you call `useState`, it returns an array containing two items, which you extract using destructuring:

1. **The current state value** (to display or use in your logic).
2. **A setter function** (to update the value).

### Code Example

important note - **Use the setter:** Never change the state variable directly (e.g., `count = 1` is bad). Always use the updater function (e.g., `setCount(1)`) so React knows to update the screen

Here is how to use it to create a simple counter:

```jsx
import { useState } from "react";

export default function Counter() {
  // 1. Initialize state: 'count' is the value, 'setCount' is the updater.
  // The '0' inside useState(0) is the initial starting value.
  const [count, setCount] = useState(0);

  // 2. Create a function that uses the setter to update the state.
  function handleIncrement() {
    setCount(count + 1);
  }

  return (
    <div>
      {/* 3. Display the current state value */}
      <p>You clicked {count} times</p>

      {/* 4. Trigger the update function on click */}
      <button onClick={handleIncrement}>Click me</button>
    </div>
  );
}
```

### Rendering a list in React

**Pattern:** keep the items in state, then `map` them to components inside JSX.

```jsx
const [listi, setList] = useState([]); // array of tasks

<ul>
  {listi.map((task, index) => (
    <TaskItem key={index} task={task} />
  ))}
</ul>;
```

- To add an item, never mutate the array — create a new one: `setList([...listi, task])`. React only re-renders when it gets a new array reference.
- The input has its own `task` state ("controlled input" via `value` + `onChange`); the button click moves it into the list and clears it.

#### extracting TaskItem

**component extraction with props**:

```jsx
export default function TaskItem({ task }) {
  return <li>{task}</li>;
}
```

- Props arrive as **one object**, so you destructure: `({ task })`, not `(index, task)`.
- The parent (`Home`) owns the state; `TaskItem` is a "dumb" presentational component that just receives data. This makes it easy to later add a checkbox/delete button in one place, styled by its own TaskItem.css.
