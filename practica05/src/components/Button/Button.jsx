export const Button = ({ color = "#1a1a1a", ...props }) => {
  return (
    <button {...props} style={{ backgroundColor: color, color: "black" }}>
      {props.children}
    </button>
  );
};
