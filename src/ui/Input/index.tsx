import { forwardRef } from "react";

type Ref = HTMLInputElement;
import { Input as NextInput, InputProps } from "@nextui-org/react";

export const Input = (props: InputProps) => {
  return <NextInput {...props} />;
};

// export const Input = forwardRef<Ref, InputProps>(function InputComponent(
//   props,
//   ref
// ) {
//   return <NextInput {...props} ref={ref} />;
// });
