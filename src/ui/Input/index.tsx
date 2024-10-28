import { forwardRef } from "react";

type Ref = HTMLInputElement;
type TInputProps = React.HTMLProps<HTMLInputElement>;

export const Input = forwardRef<Ref, TInputProps>(function InputComponent(
  props,
  ref
) {
  return <input {...props} ref={ref} />;
});
