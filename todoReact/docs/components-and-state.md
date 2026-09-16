# Components, Props and State

The core React building blocks: reusable components, the props that configure them, and the `useState` hook that makes them interactive.

## useState — storing data in a component

`useState` is a React Hook that stores and tracks data (state) inside a functional component. When this data changes, React automatically re-renders the component to show the updated information on the screen.

Calling `useState` returns an array with two items, extracted by destructuring:

1. **The current state value** (to display or use in your logic).
2. **A setter function** (to update the value).

```jsx
import { useState } from "react";

export default function Counter() {
  // 'count' is the value, 'setCount' is the updater, 0 is the initial value
  const [count, setCount] = useState(0);

  function handleIncrement() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={handleIncrement}>Click me</button>
    </div>
  );
}
```

**Use the setter — always.** Never change the state variable directly (`count = 1` is bad). Only the setter (`setCount(1)`) tells React to re-render the screen. The same rule extends to arrays and objects: build a **new** one (`[...list, item]`, `list.filter(...)`) instead of mutating with `push`/`splice`.

## Building a reusable component

A strong reusable component accepts standard properties (props). By destructuring specific props like `placeholder`, `value`, and `onChange`, we control the core behavior. Default values (`type = "text"`) make the common case zero-config.

### The component (`Input.jsx`)

```jsx
import "./Input.css";

export default function Input({ placeholder, value, onChange, type = "text" }) {
  return (
    <input
      className="input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      type={type}
    />
  );
}
```

> Tip: adding a rest operator (`...props`) forwards any extra HTML attributes (`required`, `disabled`, `id`) to the native element — powerful but less readable.

### Using it from a parent (`Login.jsx`)

The parent owns the data and provides a way to update it — this is the **controlled input** pattern:

- **useState** holds the value (`email`) and its updater (`setEmail`).
- **The handler** receives the browser event (`e`) and extracts the new text with `e.target.value`.
- **Binding**: the state and the handler are passed into `<Input/>` via props.

```jsx
import { useState } from "react";
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
    </div>
  );
}
```

## Layout and styling

Handle inner element **sizing** on the component itself; handle **layout and spacing** in the parent container.

- **The Input**: avoid `display: flex` directly on an HTML `<input>`. Use box model properties — `padding`, `width: 100%`, `box-sizing: border-box` — so the input fills its space reliably.
- **The Container**: the parent wrapper uses Flexbox to align elements. The `gap` property gives clean, even spacing between all children without manual margins.

```css
/* Input.css - the component sizes itself */
.input {
  width: 100%;
  max-width: 180px;
  padding: 12px;
  border-radius: 8px;
  border: 3px solid rgb(209, 196, 196);
}
```

```css
/* Login.css - the parent lays things out */
.divi {
  padding-top: 5%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 20px;
}
```
