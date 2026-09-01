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
