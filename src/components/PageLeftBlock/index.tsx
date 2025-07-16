type TProps = {
  title: string;
  content: JSX.Element;
  isOrange?: boolean;
};

export const PageLeftBlock = (props: TProps) => {
  const { title, content, isOrange } = props;
  return (
    <div className="bg-white p-5 lg:p-10 radius-4 w-[100%] max-w-[645px]">
      <h1
        color="primary"
        style={{
          fontSize: 44,
          color: isOrange ? "#f85c50" : "#3f28c6",
          fontWeight: 700,
          textTransform: "uppercase",
          lineHeight: "44px",
        }}
      >
        {title}
      </h1>
      {content}
    </div>
  );
};
