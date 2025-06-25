type TProps = {
  title: string;
  content: JSX.Element;
};

export const PageLeftBlock = (props: TProps) => {
  const { title, content } = props;
  return (
    <div className="bg-white p-10 radius-4 max-w-[645px]">
      <h1
        color="primary"
        style={{
          fontSize: 44,
          color: "#3f28c6",
          fontWeight: 700,
          textTransform: "uppercase",
          lineHeight: '44px'
        }}
      >
        {title}
      </h1>
      {content}
    </div>
  );
};
