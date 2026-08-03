export default function Div({ className = "", children, ...rest }) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}
