import React, { FC } from "react";

type Props = {
  title: string;
  subtitle: string;
  description?: string;
  titleColor?: string;
};

const Header: FC<Props> = ({ title, subtitle, description, titleColor }) => {
  return (
    <div className={`py-8 w-[100%] max-w-[766px] m-auto`}>
      <p
        style={{
          color: titleColor,
          fontSize: 38,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {title}
      </p>
      <p
        style={{
          fontSize: 24,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {subtitle}
      </p>
      {!!description && (
        <p
          style={{
            fontSize: 20,
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default Header;
