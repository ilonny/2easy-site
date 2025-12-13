import React, { FC } from "react";

type Props = {
  title: string;
  subtitle: string;
  description?: string;
  titleColor?: string;
};

const Header: FC<Props> = ({ title, subtitle, description, titleColor }) => {
  return (
    <div className="py-8 w-full max-w-[766px] mx-auto">
      <p
        className="text-[38px] text-center font-extrabold uppercase"
        style={titleColor ? { color: titleColor } : undefined}
      >
        {title}
      </p>
      <p className="text-2xl text-center font-extrabold uppercase">{subtitle}</p>
      {!!description && (
        <p className="text-xl text-center whitespace-pre-line">{description}</p>
      )}
    </div>
  );
};

export default Header;
