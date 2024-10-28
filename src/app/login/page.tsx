"use client";
import { Input } from "@/ui";
import { useForm, SubmitHandler } from "react-hook-form";

type TLoginInputs = {
  login: string;
  password: string;
};
type Inputs = {
  example: string;
  exampleRequired: string;
};

export default function LoginPage() {
  // const {
  //   register,
  //   handleSubmit,
  //   watch,
  //   formState: { errors },
  // } = useForm<Inputs>()
  // const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  // console.log(watch("example")) // watch input value by passing the name of it

  // return (
  //   /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
  //   <form onSubmit={handleSubmit(onSubmit)}>
  //     {/* register your input into the hook by invoking the "register" function */}
  //     <input  {...register("example")} />

  //     {/* include validation with required or other standard HTML validation rules */}
  //     <input {...register("exampleRequired", { required: true })} />
  //     {/* errors will return when field validation fails  */}
  //     {errors.exampleRequired && <span>This field is required</span>}

  //     <input type="submit" />
  //   </form>
  // )

  const { register, handleSubmit } = useForm<TLoginInputs>();

  const onSubmit: SubmitHandler<TLoginInputs> = (data) => {
    console.log(data);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input {...register("login")} />
          <br />
          <br />
          <Input {...register("password")}  />
          <br />
          <br />
          <input type="submit" />
        </form>
      </main>
    </div>
  );
}
