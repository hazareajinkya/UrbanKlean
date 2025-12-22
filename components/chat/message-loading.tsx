export function MessageLoading({ style }: { style?: React.CSSProperties }) {
  return (
    <div className="spinner space-x-[6px]">
      <div className="bounce1" style={style}></div>
      <div className="bounce2" style={style}></div>
      <div className="bounce3" style={style}></div>
    </div>
  );
}
