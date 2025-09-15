/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { ContentWrapper } from "@/components";
import { BreadcrumbItem, Breadcrumbs, Button } from "@nextui-org/react";
import { useContext } from "react";
import img1 from "@/assets/images/about_us_1.png";
import img2 from "@/assets/images/about_us_2.png";
import Link from "next/link";
import { SibscribeContext } from "@/subscribe/context";
import { SubscribeTariffs } from "@/subscribe";
import bg from "@/assets/images/feedback_bg.svg";

export default function GrammarPage() {
  const { subscription } = useContext(SibscribeContext);

  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/about_us">About us</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          О ПРОЕКТЕ
        </h1>
        <p
          className="max-w-[675px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          2EASY – платформа для тичеров английского, которые преподают взрослым
          ученикам (16+)
        </p>
        <div className="h-10" />
        <div className="h-10" />
        <div className="max-w-[750px] m-auto">
          <div className="flex">
            <div className="w-[50%] p-4">
              <img src={img1.src} />
              <p
                className="my-2"
                style={{ fontSize: 18, color: "#5837dc", fontWeight: 700 }}
              >
                Ekaterina Lobasenko
              </p>
              <p style={{ fontSize: 14 }}>English teacher</p>
              <p style={{ fontSize: 14 }}>Co-founder 2EASY</p>
              <div className="mt-2">
                <Link
                  href={"https://www.instagram.com/kat_lobasenko"}
                  target="_blank"
                  style={{ color: "#5837dc" }}
                >
                  @kat_lobasenko
                </Link>
              </div>
            </div>
            <div className="w-[50%] p-4">
              <img src={img2.src} />
              <p
                className="my-2"
                style={{ fontSize: 18, color: "#5837dc", fontWeight: 700 }}
              >
                Alina Kiseleva
              </p>
              <p style={{ fontSize: 14 }}>Web-designer</p>
              <p style={{ fontSize: 14 }}>Co-founder 2EASY</p>
              <div className="mt-2">
                <Link
                  href={"https://www.instagram.com/shumnox_"}
                  target="_blank"
                  style={{ color: "#5837dc" }}
                >
                  @shumnox_
                </Link>
              </div>
            </div>
          </div>
          <div className="h-10" />
          <div className="h-10" />
          <p>
            Мы верим, что главное в изучении языка – практика и разговор. Этой
            идеей и вдохновлен наш сайт. Мы создали и собрали в одном месте
            игры, разговорные материалы и готовые уроки – все то, что поможет
            разговорить учеников и вывести их на новый уровень, а преподавателям
            упростит и сократит подготовку к урокам.
          </p>
          <div className="h-10" />
          <h1
            color="primary"
            className={"text-primary font-bold text-3xl uppercase text-center"}
          >
            ЧТО ЕСТЬ НА САЙТЕ?
          </h1>
          <div className="h-10" />
          <p>
            ⚡{" "}
            <Link
              href={"/lesson_plans"}
              style={{ color: "#5837dc", fontWeight: 600 }}
            >
              Готовые уроки для разных уровней – от A1 до B2.
            </Link>
            Тему для каждого урока мы выбираем по принципу «а о чем нам было бы
            реально интересно говорить?». Например, есть уроки «Hustle culture»
            (культуру достигаторства), «Girls run the world» (о self-made
            женщинах и их проектах), «It’s a spooky time» (страшные истории и
            мистические случаи) и другие не менее интересные. Во всех уроках
            есть juicy-лексика и/или актуальная грамматика.
          </p>
          <br />
          <p>
            ⚡ Игры, которые отлично подходят для warm up и вообще любой части
            занятия. Самые популярные –{" "}
            <Link
              href={"/speaking_games/never_have_i_ever"}
              style={{ color: "#5837dc", fontWeight: 600 }}
            >
              "Never have I ever"
            </Link>
            (аналог русской «я никогда не») и &nbsp;
            <Link
              href={"/speaking_games/what_happens_next_films"}
              style={{ color: "#5837dc", fontWeight: 600 }}
            >
              "What happens next"
            </Link>
            &nbsp; по фильмам и сериалам, где ученик смотрит небольшой отрывок
            из фильма и угадывает, что будет дальше, а потом сверяет свой
            вариант с тем, что было на самом деле. Такие штуки действительно
            классно разогревают перед занятием и поднимают настроение.
          </p>
          <br />
          <p>
            ⚡{" "}
            <Link
              href={"/cards/discussion_cards"}
              style={{ color: "#5837dc", fontWeight: 600 }}
            >
              Разговорные карты на разные темы
            </Link>
            – психология, технологии, работа и бизнес и другие. Нетривиальные
            вопросы на злободневные темы. Еще есть интересный формат &nbsp;
            <Link
              href={"/cards/controversial_statements"}
              style={{ color: "#5837dc", fontWeight: 600 }}
            >
              "Controversial statements"
            </Link>
            &nbsp; – ученик зачитывает рандомное противоречивое утверждение и
            приводит аргументы за/против. Например: «a man has to pay for
            everything on a first date» или «you shouldn’t share your success
            with friends if their things are not going well».
          </p>
        </div>
        <div className="max-w-[940px] m-auto">
          <div className="h-10" />
          <div className="h-10" />
          <h3
            className={"text-primary font-bold text-3xl uppercase text-center"}
          >
            {hasTariff ? "ВАШ ТАРИФ" : "тарифы 2easy"}
          </h3>
          {!hasTariff && (
            <>
              <div className="h-3" />
              <h2 className="font-medium text-lg text-center">
                Выберите тариф, чтобы оформить подписку на сайт,
                <br />
                или{" "}
                <Link href="/login">
                  <span className="text-primary underline">
                    войдите в личный кабинет
                  </span>
                </Link>
                , если у вас уже есть подписка
              </h2>
              <div className="h-10" />
            </>
          )}
          <div className="h-10" />
          <SubscribeTariffs />
          <div className="h-10" />
          <div className="h-10" />
          <div
            className="
              w-100%
              flex
              flex-col
              p-4
              gap-4
              lg:gap-0
              lg:p-6
              lg:flex-row
              lg:items-end
              lg:justify-between
            "
            style={{
              background: `url(${bg.src}) center center no-repeat`,
              backgroundSize: "cover",
              borderRadius: 14,
            }}
          >
            <div className="">
              <p
                className=" text-[30px] lg:text-[42px]"
                style={{ fontWeight: 700 }}
              >
                МЫ ВСЕГДА НА СВЯЗИ
              </p>
              <p>Свяжитесь с нами, если у вас есть вопросы или пожелания</p>
            </div>
            <Link href="https://wa.me/+79111898637" target="_blank">
              <Button className="bg-[#0ac028]" size="lg">
                <p
                  className="uppercase"
                  style={{ fontSize: 12, color: "#fff" }}
                >
                  Написать в whatsapp
                </p>
              </Button>
            </Link>
          </div>
          <div className="h-10" />
          <div className="h-10" />
        </div>
      </ContentWrapper>
    </main>
  );
}
