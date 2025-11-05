"use client";
import { AuthContext } from "@/auth";
import { usePayment } from "@/payment/hooks/usePayment";
import { usePromocode } from "@/payment/hooks/usePromocode";
import { TSubscribePeriod } from "@/subscribe/types";
import { Button, Checkbox, Input } from "@nextui-org/react";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import InputMask from "react-input-mask";

type TProps = {
  type: TSubscribePeriod;
};

type TFieldList = {
  name: string;
  login: string;
  phone: string;
  promocode: string;
  privacy: string;
};

export const PaymentForm = (props: TProps) => {
  const { type } = props;
  const { profile } = useContext(AuthContext);

  const [price, setPrice] = useState(
    type === "month" ? 790 : type === "3month" ? 1890 : 6990
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
    trigger,
  } = useForm<TFieldList>({
    defaultValues: {
      login: profile?.login || "",
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  });

  const { checkPromo, promocodeValue, promocodeStatus } = usePromocode();
  const { paymentIsLoading, paymentStatus, createPayment, createPayTodayBill } =
    usePayment();

  const isRF = useRef(true);

  const onSubmit = useCallback(
    async (_data) => {
      const response = await createPayment(
        type,
        getValues().phone,
        getValues().promocode,
        getValues().login
      );
      if (!response.success) {
        // error
        return;
      }

      if (!isRF.current) {
        const isIphone = navigator.userAgent.toLowerCase()?.includes("iphone");
        const isSafari =
          navigator.userAgent.search("Safari") >= 0 &&
          navigator.userAgent.search("Chrome") < 0;
        const payTodayBillData = await createPayTodayBill(response.id);
        if (!payTodayBillData?.payment_link) {
          return;
        }
        if (isIphone || isSafari) {
          window.location.href = payTodayBillData?.payment_link;
          return;
        }
        window?.open(payTodayBillData?.payment_link, "_blank")?.focus();
        return false;
      }

      window?.ym(103955671, "reachGoal", "create-payment");
      const cp = new window.cp.CloudPayments();

      let reccurentData;

      if (type === "month") {
        reccurentData = {
          period: 1,
          interval: "Month",
          amount: Number(price),
          // startDate: new Date(),
        };
      }

      if (type === "year") {
        reccurentData = {
          period: 12,
          interval: "Month",
          amount: Number(price),
          // startDate: new Date()
        };
      }

      if (type === "3month") {
        reccurentData = {
          period: 3,
          interval: "Month",
          amount: Number(price),
          // startDate: new Date()
        };
      }

      const intentData = {
        publicId: response?.publicId,
        publicTerminalId: response?.publicId,
        description: "Оплата подписки 2EASY",
        amount: Number(response?.amount),
        currency: "RUB",
        email: response.email || profile?.login,
        Email: response.email || profile?.login,
        receiptEmail: response.email || profile?.login,
        emailBehavior: "Required",
        externalId: response.id.toString(),
        userInfo: {
          accountId: response.user_id,
          email: response?.email || profile?.login,
          phone: response.paymentModel.phone,
          name: profile?.name,
          surname: profile?.surname || "",
        },
        metadata: { response, type },
        paymentSchema: "Single",
        type,
        recurrent: reccurentData,
      };

      cp.start(intentData).then((startResult) => {
        console.log("startResult", startResult);
        if (startResult?.status === "success") {
          window?.ym(103955671, "reachGoal", "buy-subscribe-success");
        }
        setTimeout(() => {
          window.location.reload();
        }, 300);
      });
    },
    [
      createPayTodayBill,
      createPayment,
      getValues,
      isRF,
      price,
      profile?.login,
      profile?.name,
      profile?.surname,
      type,
    ]
  );

  const priceWithPromo = useMemo(() => {
    if (!!promocodeValue) {
      return price * (promocodeValue / 100);
    }
    return 0;
  }, [price, promocodeValue]);

  return (
    <>
      <p className="text-primary font-bold text-3xl text-center">
        Подписка 2EASY {type}
      </p>
      <p className="text-center font-bold text-xl">{`${price}₽`}</p>
      <div className="h-3" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="name"
          control={control}
          rules={{ required: "Имя обязательное поле" }}
          render={({ field }) => (
            <Input
              {...field}
              label="Имя"
              className="mb-5"
              radius="sm"
              errorMessage={errors?.name?.message}
              isInvalid={!!errors.name?.message}
            />
          )}
        />
        <Controller
          name="login"
          control={control}
          rules={{
            required: "E-mail обязательное поле",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Некорректный e-mail",
            },
          }}
          render={({ field }) => (
            <Input
              {...field}
              radius="sm"
              label="E-mail"
              className="mb-5"
              errorMessage={errors?.login?.message}
              isInvalid={!!errors.login?.message}
            />
          )}
        />
        <Controller
          name="phone"
          control={control}
          rules={{
            required: "Номер телефона обязательное поле",
          }}
          render={({ field }) => (
            <InputMask
              mask="+9 (999) 999-99-999999"
              alwaysShowMask={false}
              maskChar=" "
              value={getValues().phone}
              onChange={(e) => field.onChange(e.target.value)}
            >
              {(inputProps) => (
                <Input
                  {...inputProps}
                  // {...field}
                  radius="sm"
                  label="Номер телефона"
                  className="mb-5"
                  errorMessage={errors?.phone?.message}
                  isInvalid={!!errors.phone?.message}
                />
              )}
            </InputMask>
          )}
        />
        <Controller
          name="promocode"
          control={control}
          render={({ field }) => (
            <div>
              <div className="flex items-center justify-between">
                <Input {...field} label="Промокод" radius="sm" />
                {!!getValues().promocode?.length && (
                  <div className="ml-2">
                    <Button
                      radius="sm"
                      type="button"
                      variant="faded"
                      color="primary"
                      isLoading={promocodeStatus === "loading"}
                      onClick={() => checkPromo(getValues().promocode, type)}
                    >
                      Применить
                    </Button>
                  </div>
                )}
              </div>
              <div>
                {promocodeStatus === "error" && (
                  <p className="text-small text-red-500">
                    Промокод не действителен или не существует
                  </p>
                )}
                {promocodeStatus === "success" && (
                  <p className="text-green-500 text-small">Промокод применен</p>
                )}
              </div>
            </div>
          )}
        />
        <div className="h-3"></div>
        <Controller
          name="privacy"
          control={control}
          rules={{
            required: "Обязательное поле",
          }}
          render={({ field }) => (
            <Checkbox
              {...field}
              radius="sm"
              className="mb-5"
              errorMessage={errors?.privacy?.message}
              isInvalid={!!errors.privacy?.message}
            >
              <p className="text-small">
                Я принимаю условия{" "}
                <a
                  className="text-primary"
                  href="/public_offer"
                  target="_blank"
                >
                  публичной оферты
                </a>{" "}
                и{" "}
                <a
                  className="text-primary"
                  href="/privacy_policy"
                  target="_blank"
                >
                  политики конфиденциальности
                </a>{" "}
                и даю свое{" "}
                <a
                  className="text-primary"
                  href="/personal_agreement"
                  target="_blank"
                >
                  согласие на обработку персональных данных
                </a>
              </p>
            </Checkbox>
          )}
        />
        <div className="h-5" />
        {!!promocodeValue && (
          <div className="flex items-center justify-between">
            <p>Скидка</p>
            <p className="text-success-600 font-bold">
              -{Number((price - (price - priceWithPromo)).toFixed(1))}₽
            </p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <p>Итого</p>
          <p className="font-bold">
            {Number((price - priceWithPromo).toFixed(1))}₽
          </p>
        </div>
        <div className="h-5" />
        <div className="">
          <Button
            size="lg"
            fullWidth
            radius="sm"
            type="button"
            color="primary"
            isLoading={paymentIsLoading}
            onClick={async () => {
              isRF.current = true;
              const isValid = await trigger();
              if (isValid) {
                handleSubmit(onSubmit)();
              } else {
                console.log("Validation failed. Please fix the errors.");
              }
            }}
          >
            Оплатить картой РФ
          </Button>
          <div
            className="flex justify-center my-4 uppercase text-center"
            style={{}}
          >
            <p
              className="px-4"
              style={{
                color: "rgb(177 176 176)",
                fontWeight: "800",
                fontSize: 14,
                background: "#fff",
              }}
            >
              или
            </p>
          </div>
          <hr
            style={{ height: 4, position: "relative", top: -26, zIndex: -1 }}
          />
          <Button
            size="lg"
            fullWidth
            radius="sm"
            type="button"
            color="secondary"
            variant="bordered"
            isLoading={paymentIsLoading}
            onClick={async () => {
              isRF.current = false;
              const isValid = await trigger();
              setTimeout(async () => {
                if (isValid) {
                  handleSubmit(onSubmit)();
                } else {
                  console.log("Validation failed. Please fix the errors.");
                }
              }, 300);
            }}
          >
            Оплатить картой не РФ
          </Button>
        </div>
        {paymentStatus === "error" && (
          <p className="text-sm text-red-400">
            Внутренняя ошибка сервера. Попробуйте позже, или свяжитесь с
            техподдержкой
          </p>
        )}
      </form>
    </>
  );
};
