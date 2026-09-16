# Icons and Conditional Rendering

Using the `react-icons` library, and swapping icons based on state — as implemented in the TaskItem component.

## The react-icons library

One package bundles many icon sets (Material Design, Font Awesome, and more):

```bash
npm install react-icons
```

Every icon is just a **React component**. Import from the sub-package of the icon set — the prefix tells you which set it belongs to:

```jsx
import { MdDone, MdDoneAll } from "react-icons/md"; // Material Design
import { FaDeleteLeft } from "react-icons/fa6"; // Font Awesome 6
```

Finding icons: browse [react-icons.github.io/react-icons](https://react-icons.github.io/react-icons), search by name, copy the import.

Because icons are components, they take props like any element — `onClick`, `className`, `size`, `color`:

```jsx
<FaDeleteLeft className="delete-icon" onClick={onDelete} />
```

Style them via `className` in CSS (they inherit `color` and `font-size` from their parent, or set them directly).

## Conditional rendering — toggling between two icons

TaskItem shows a different "done" icon depending on the task's state: `MdDone` (single check) when still open, `MdDoneAll` (double check) when completed.

The tool is a **ternary inside JSX**: `{condition ? <A /> : <B />}`.

```jsx
import { FaDeleteLeft } from "react-icons/fa6";
import { MdDone, MdDoneAll } from "react-icons/md";
import "./TaskItem.css";

export default function TaskItem({ task, onDelete, onUpdate, completed }) {
  return (
    <li className="task-item">
      <span>{task}</span>
      <div className="task-icons">
        {completed ? (
          <MdDoneAll onClick={onUpdate} />
        ) : (
          <MdDone onClick={onUpdate} />
        )}
        <FaDeleteLeft className="delete-icon" onClick={onDelete} />
      </div>
    </li>
  );
}
```

How the toggle actually happens:

1. The parent passes `completed={task.completed}` from the task object in state.
2. Clicking either icon calls `onUpdate` → PATCH to the server → the updated task replaces the old one in the parent's state.
3. The state change re-renders TaskItem with the new `completed` value, and the ternary picks the other icon.

The component never stores anything itself — it just renders whatever `completed` says. State lives in the parent; the child is a pure function of its props.

## The conditional-rendering toolbox

| Goal                            | Pattern                          | Example                                    |
| ------------------------------- | -------------------------------- | ------------------------------------------ |
| Either A or B                   | ternary `{cond ? <A /> : <B />}` | the done icons above                       |
| Show or nothing                 | `&&` — `{cond && <A />}`         | `{error && <p>{error}</p>}`                |
| Conditional class (not element) | ternary in `className`           | `className={completed ? "task-done" : ""}` |

## Key rules

- **Icons are components** — import from the right sub-package (`react-icons/md`, `react-icons/fa6`) and use them like elements.
- **Both branches of the ternary can share props** (`onClick={onUpdate}` on both icons) — the same handler toggles in both directions.
- **Don't store `completed` in the child** — pass it down as a prop so there's a single source of truth in the parent's task list.
- **Ternary for either/or, `&&` for maybe** — using `&&` with a non-boolean left side (like `0`) can render the value itself, so prefer ternaries when in doubt.
