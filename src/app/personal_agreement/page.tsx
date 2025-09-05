"use client";

import { ContentWrapper } from "@/components";
import { SquareList } from "@/components/SquareList";
import { BreadcrumbItem, Breadcrumbs, Tab, Tabs } from "@nextui-org/react";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PageLeftBlock } from "@/components/PageLeftBlock";
import { ProfileLessons } from "../lessons/components/ProfileLessons";

export default function GrammarPage() {
  const { checkSubscription } = useCheckSubscription();
  const router = useRouter();
  // useEffect(() => {
  //   if (!checkSubscription()) {
  //     router.push("/subscription");
  //   }
  // }, [checkSubscription, router]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <>
          <br />
          <br />
          <br />
          <br />
          <>
            <p
              className="ConsPlusNormal"
              align="center"
              style={{ textAlign: "center" }}
            >
              <b>
                <span
                  lang="RU"
                  style={{
                    fontSize: "11.0pt",
                  }}
                >
                  СОГЛАСИЕ
                </span>
              </b>
            </p>
            <p
              className="ConsPlusNormal"
              align="center"
              style={{ textAlign: "center" }}
            >
              <b>
                <span
                  lang="RU"
                  style={{
                    fontSize: "11.0pt",
                  }}
                >
                  на обработку персональных данных
                </span>
              </b>
            </p>
            <p
              className="ConsPlusNormal"
              align="center"
              style={{ textAlign: "center" }}
            >
              <b>
                <span
                  lang="RU"
                  style={{
                    fontSize: "11.0pt",
                  }}
                >
                  &nbsp;
                </span>
              </b>
            </p>
            <p
              className="ConsPlusNormal"
              align="center"
              style={{ textAlign: "center" }}
            >
              <b>
                <span
                  lang="RU"
                  style={{
                    fontSize: "11.0pt",
                  }}
                >
                  &nbsp;
                </span>
              </b>
            </p>
            <p
              className="MsoNormal"
              style={{
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Настоящим я, в соответствии с Федеральным законом от 27.07.2006
                № 152-ФЗ «О персональных данных» свободно, своей волей и в своём
                интересе выражаю согласие индивидуальному предпринимателю
                Лобасенко Екатерине Борисовне (ИНН 420553023451, ОГРНИП
                324547600006209, адрес электронной почты: lobasenko1994@mail.ru)
                на обработку моих персональных данных.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Согласие даётся на обработку следующих персональных данных,
                указываемых мной при регистрации и в ходе использования
                Платформы:
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">фамилия, имя, отчество;</span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">адрес электронной почты;</span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">номер телефона;</span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">
                платёжные данные (в обезличенном виде, при оформлении подписки);
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">
                иные данные, которые я добровольно указываю при регистрации на
                сайте https://www.2easyeng.com или в личном кабинете.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Оператор ПДн вправе осуществить автоматизированную обработку
                персональных данных, включая сбор, запись, систематизацию,
                накопление, хранение, уточнение (обновление, изменение),
                извлечение, использование, обезличивание, блокирование,
                удаление, уничтожение персональных данных.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">Цель обработки: </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">
                предоставление доступа к платформе 2easyeng, включая материалы
                Исполнителя и функционал для самостоятельного создания уроков;
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">
                предоставление бесплатного пробного периода (без указания
                платёжных данных);
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">оформление и сопровождение подписки;</span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">обработка запросов и обращений;</span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginLeft: ".5in",
                textAlign: "justify",
                textIndent: "-.25in",
                lineHeight: "normal",
              }}
            >
              <span lang="RU" style={{ fontFamily: "Symbol" }}>
                -
                <span style={{ font: '7.0pt "Times New Roman"' }}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </span>
              </span>
              <span lang="RU">предоставление технической поддержки;</span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Я выражаю согласие на осуществление Оператором ПДн любых
                действий в отношении моих персональных данных, которые
                необходимы или желаемы для достижения указанных целей.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Оператор ПДн обязан гарантировать обработку моих персональных
                данных в соответствии C действующим законодательством о
                персональных данных.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Согласие действует до момента его отзыва. Я уведомлён(а), что
                могу отозвать согласие в любой момент, направив уведомление на
                электронную почту: lobasenko1994@mail.ru.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Проставляя отметку в чекбоксе, я подтверждаю, что ознакомлен(а)
                и принимаю условия Пользовательского соглашения и Политики
                конфиденциальности, а также даю согласие на обработку моих
                персональных данных в соответствии с Федеральным законом от
                27.07.2006 № 152-ФЗ «О персональных данных».
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Настоящим я уведомлён Оператором ПДн, что предполагаемыми
                пользователями моих персональных данных являются сам Оператор
                ПДн, а также иные лица, привлекаемые им на основании договорных
                или гражданско-правовых отношений (в том числе помощники и
                технические исполнители), исключительно в объёме, необходимом
                для исполнения договорных обязательств.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Я подтверждаю, что предоставляю только собственные персональные
                данные. В случае передачи персональных данных третьих лиц, я
                подтверждаю наличие соответствующих полномочий на их передачу и
                принимаю на себя обязательства возместить Оператору ПДн
                возможные убытки, включая санкции проверяющих органов, в случае
                отсутствия таких полномочий.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Настоящее Согласие вступает в силу с момента предоставления
                персональных данных Пользователем путём заполнения
                регистрационной формы на Платформе 2easyeng.
              </span>
            </p>
            <p
              className="MsoNormal"
              style={{
                marginBottom: "0in",
                textAlign: "justify",
                textIndent: "28.35pt",
                lineHeight: "normal",
              }}
            >
              <span lang="RU">
                Я также проинформирован, что в случае отзыва согласия Оператор
                ПДн вправе продолжить обработку персональных данных без моего
                согласия при наличии оснований, предусмотренных пунктами 2–11
                части 1 статьи 6, частью 2 статьи 10 и частью 2 статьи 11
                Федерального закона от 27.07.2006 № 152-ФЗ «О персональных
                данных».
              </span>
            </p>
          </>

          <br />
          <br />
          <br />
          <br />
        </>
      </ContentWrapper>
    </main>
  );
}
