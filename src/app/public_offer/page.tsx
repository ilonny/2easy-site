"use client";

import { ContentWrapper } from "@/components";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useRouter } from "next/navigation";

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
          <p
            className="ConsPlusNormal"
            align="center"
            style={{ textAlign: "center" }}
          >
            <b>
              <span
                lang="RU"
                style={{
                  fontSize: "12.0pt",
                }}
              >
                Публичная оферта
              </span>
            </b>
          </p>
          <p align="center" style={{ margin: "0in", textAlign: "center" }}>
            <span lang="RU">
              о заключении договора на предоставление доступа к цифровым
              образовательным материалам по подписке
            </span>
          </p>
          <p className="ConsPlusNormal" style={{ textAlign: "justify" }}>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            align="center"
            style={{ textAlign: "center" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Вводные положения
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            style={{
              marginTop: "12.0pt",
              marginRight: "0in",
              marginBottom: "12.0pt",
              marginLeft: "0in",
              textAlign: "justify",
            }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Настоящий документ является официальным предложением (публичной
              офертой)
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            style={{
              marginTop: "12.0pt",
              marginRight: "0in",
              marginBottom: "12.0pt",
              marginLeft: "0in",
              textAlign: "justify",
            }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Индивидуального предпринимателя Лобасенко Екатерины Борисовны, ИНН
              420553023451, ОГРНИП 324547600006209 (далее — «Исполнитель»),
              адресованным любому дееспособному физическому лицу (далее —
              «Клиент»), действующему в собственных интересах, заключить договор
              на получение доступа к цифровым материалам и функционалу Платформы
              для использования материалов Исполнителя и/или самостоятельного
              создания Клиентом собственных уроков и занятий на условиях
              подписки.
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            style={{
              marginTop: "12.0pt",
              marginRight: "0in",
              marginBottom: "12.0pt",
              marginLeft: "0in",
              textAlign: "justify",
            }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Полный перечень доступных материалов, тарифов подписки, условий
              предоставления доступа, а также правила использования Платформы и
              размещения материалов Клиентами размещены в сети Интернет по
              адресу: https://www.2easyeng.com и являются неотъемлемой частью
              настоящей Оферты.
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            style={{
              marginTop: "12.0pt",
              marginRight: "0in",
              marginBottom: "12.0pt",
              marginLeft: "0in",
              textAlign: "justify",
            }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Текст настоящей публичной оферты размещён в сети Интернет по
              вышеуказанному адресу и является официальным предложением
              заключить договор возмездного оказания услуг в порядке,
              предусмотренном пунктом 2 статьи 437 Гражданского кодекса
              Российской Федерации.
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            style={{
              marginTop: "12.0pt",
              marginRight: "0in",
              marginBottom: "12.0pt",
              marginLeft: "0in",
              textAlign: "justify",
            }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Принятие (акцепт) настоящей Оферты осуществляется путём оформления
              и оплаты подписки. С момента акцепта Оферта считается заключённой
              между Клиентом и Исполнителем в письменной форме.
            </span>
          </p>
          <p
            className="ConsPlusNonformat"
            align="center"
            style={{
              marginTop: "12.0pt",
              marginRight: "0in",
              marginBottom: "12.0pt",
              marginLeft: "0in",
              textAlign: "center",
            }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Определения, используемые в настоящей оферте
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Акцепт Оферты — полное и безоговорочное принятие условий настоящей
              Оферты Клиентом, выраженное путем оформления и оплаты подписки на
              сайте Исполнителя.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Доступ — возможность использования Клиентом цифровых материалов,
              размещенных на Платформе 2easyeng.com, в пределах выбранного
              тарифного плана и в течение оплаченного периода, а также
              использование функционала для самостоятельного создания и
              проведения уроков.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Исполнитель — Индивидуальный предприниматель Лобасенко Екатерина
              Борисовна (ИНН 420553023451, ОГРНИП 324547600006209), оказывающий
              информационные и консультационные услуги в виде предоставления
              доступа к цифровым материалам и функционалу Платформы.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Клиент — дееспособное физическое лицо, оформившее подписку и
              оплатившее её стоимость, тем самым заключившее договор с
              Исполнителем. Клиенты могут использовать Платформу как для доступа
              к материалам Исполнителя, так и для самостоятельного создания
              уроков и размещения собственных материалов.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Личный доступ — индивидуальный логин и пароль, направляемые
              Клиенту после оплаты на указанный им электронный адрес,
              обеспечивающие возможность использования Платформы.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Материалы — цифровые образовательные ресурсы, включая, но не
              ограничиваясь: готовыми уроками, разговорными играми, карточками,
              грамматическими упражнениями и иными материалами, предназначенными
              для преподавания английского языка.
            </span>
          </p>
          <p style={{ marginBottom: "0in", textAlign: "justify" }}>
            <span lang="RU">К Материалам относятся:</span>
          </p>
          <p
            style={{
              marginTop: "0in",
              marginRight: "0in",
              marginBottom: "5.0pt",
              marginLeft: ".5in",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span lang="RU" style={{ fontFamily: "Symbol" }}>
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span lang="RU">
              Материалы Исполнителя — ресурсы, созданные и размещённые
              Исполнителем;
            </span>
          </p>
          <p
            style={{
              marginLeft: ".5in",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span lang="RU" style={{ fontFamily: "Symbol" }}>
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span lang="RU">
              Пользовательский контент — уроки, задания и иные материалы,
              созданные и размещённые Клиентами самостоятельно.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Оферта — настоящий документ, размещённый на сайте Исполнителя,
              содержащий условия предоставления доступа к Платформе и
              Материалам, и являющийся предложением заключить договор в порядке
              статьи 437 Гражданского кодекса РФ.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Платформа — сайт Исполнителя, расположенный по адресу
              https://www.2easyeng.com, через который осуществляется доступ к
              Материалам, функционалу и оформляется подписка.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Подписка — форма договорных отношений, при которой Клиент получает
              доступ к Платформе и Материалам на определённый срок и за
              установленную плату, с возможностью автоматического продления.
            </span>
          </p>
          <p style={{ textAlign: "justify" }}>
            <span lang="RU">
              Рекуррентный платёж — автоматическое списание средств с платёжного
              средства Клиента по окончании оплаченного периода подписки на
              условиях, согласованных при оформлении подписки.
              <a name="Par22" />
            </span>
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
                  fontSize: "12.0pt",
                }}
              >
                1. Предмет оферты
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.1. Исполнитель обязуется предоставить Клиенту доступ к цифровым
              образовательным Материалам, размещённым на Платформе, а также к
              функционалу Платформы, позволяющему Клиенту самостоятельно
              создавать и проводить уроки, размещать собственные материалы и
              использовать их в преподавательской деятельности. Объем и условия
              предоставления доступа определяются выбранной Подпиской (Тарифом),
              размещённой на официальном сайте Исполнителя:
              https://www.2easyeng.com. Клиент, в свою очередь, обязуется
              оплатить Подписку и соблюдать условия настоящего Договора-оферты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.2. Настоящая Оферта является типовой и применяется ко всем
              Клиентам, желающим получить доступ к Материалам и функционалу
              Платформы на условиях, указанных в ней. Полный текст Оферты
              размещён в свободном доступе на Платформе.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.3. Заключение настоящего Договора осуществляется путём Акцепта
              условий Оферты, что в соответствии с пунктом 2 статьи 437 и
              статьёй 428 Гражданского кодекса Российской Федерации признаётся
              присоединением к изложенным условиям. Акцептом признаются действия
              Клиента, свидетельствующие о согласии с условиями Оферты, в том
              числе:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – оформление и оплата Подписки;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – указание платёжной карты при подключении Рекуррентного платежа;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – получение логина и пароля по электронной почте;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – регистрация или авторизация на Платформе.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.4. Датой заключения Договора считается дата первой оплаты
              Подписки.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.5. Материалы, предоставляемые Исполнителем в рамках Подписки,
              являются авторскими и включают, в том числе, готовые уроки,
              разговорные игры, карточки и грамматические задания.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.6. Клиент имеет право создавать и размещать на Платформе
              собственные материалы и уроки, несёт полную ответственность за их
              содержание, соответствие законодательству и права третьих лиц.
              Исполнитель не проверяет и не подтверждает такие материалы, не
              несёт ответственности за их качество и содержание, но вправе
              удалять или ограничивать доступ к материалам, нарушающим
              законодательство, авторские права или условия настоящей Оферты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.6.1. Клиенту предоставляется право один раз воспользоваться
              бесплатным пробным периодом продолжительностью 7 (семь) календарных
              дней. Для активации пробного периода Клиент указывает адрес
              электронной почты, на который направляется временный логин и
              пароль для доступа к Платформе. В течение пробного периода Клиент
              получает полный доступ к Материалам и функционалу Платформы.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.6.2. По окончании пробного периода доступ прекращается
              автоматически, если Клиент не оформил и не оплатил Подписку.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.7. Срок действия Подписки определяется выбранным Тарифом: 30
              (тридцать) календарных дней, 3 (три) календарных месяца или 12
              (двенадцать) календарных месяцев с момента активации. Активация
              Подписки происходит автоматически после поступления оплаты от
              Клиента.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.8. Предоставление доступа осуществляется индивидуально. На
              указанный Клиентом при оформлении Подписки адрес электронной почты
              направляется сообщение с данными для входа (логин и пароль).
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.9. Исполнитель использует систему Рекуррентных платежей. При
              оформлении Подписки Клиент предоставляет своё согласие на
              регулярное списание средств по окончании оплаченного периода.
              Информация о порядке отключения Рекуррентного платежа размещена на
              Платформе и доступна по ссылке: https://my.cloudpayments.ru.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.10. Клиент вправе приобрести Подписку в подарок третьему лицу,
              указав при оформлении соответствующий адрес электронной почты. В
              этом случае доступ будет направлен на email, указанный в качестве
              получателя подарка.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.11. Исполнитель вправе в одностороннем порядке ограничить или
              прекратить доступ к Материалам или функционалу Платформы в случае
              нарушения Клиентом условий настоящей Оферты, в том числе при
              установлении факта передачи доступа третьим лицам, публикации
              Материалов в открытом доступе или их коммерческого использования
              без разрешения.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              1.12. Услуги, полученные в подарок, по акциям или специальным
              предложениям, возврату не подлежат и не обмениваются на денежные
              средства.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
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
                  fontSize: "12.0pt",
                }}
              >
                2. Права и обязанности Сторон
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1. Обязанности Исполнителя:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.1. Предоставить Клиенту доступ к Материалам Исполнителя и
              функционалу Платформы в соответствии с условиями выбранного
              Тарифа.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.2. Обеспечить надлежащее функционирование Платформы, включая
              бесперебойный доступ к Материалам и функционалу в течение
              оплаченного периода Подписки, за исключением времени, необходимого
              для проведения плановых технических работ.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.3. Оказывать Клиенту информационную поддержку по вопросам,
              связанным с оформлением Подписки, доступом к Платформе, работой
              сервисов, а также порядком списания Рекуррентных платежей — через
              электронную почту или мессенджер WhatsApp.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.4. Обеспечить Клиенту доступ к условиям настоящей Оферты,
              Политике конфиденциальности, описанию Тарифов, правилам размещения
              Пользовательского контента и другой юридически значимой
              информации, размещённой на Платформе.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.5. Сохранять конфиденциальность персональных данных Клиента,
              полученных при заключении и исполнении настоящего Договора, за
              исключением случаев, прямо предусмотренных действующим
              законодательством.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.6. Обеспечить Клиенту возможность отключения Рекуррентного
              платежа и продления Подписки через личный кабинет на Платформе, а
              также через сервис платёжной системы по ссылке
              https://my.cloudpayments.ru.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.7. В случае выявления неисправностей в работе Платформы,
              влияющих на возможность доступа к Материалам или функционалу,
              принять разумные и своевременные меры по их устранению.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.1.8. Вправе удалять или ограничивать доступ к Пользовательскому
              контенту, нарушающему законодательство, права третьих лиц, нормы
              морали, условия настоящей Оферты или правила использования
              Платформы.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2. Обязанности Клиента:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.1. Ознакомиться с условиями настоящей Оферты, Политикой
              конфиденциальности, условиями Тарифов и другой информацией,
              размещённой на Платформе, до момента оформления Подписки.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.2. Своевременно и в полном объёме оплачивать Подписку, включая
              обеспечение наличия денежных средств на платёжной карте при
              использовании Рекуррентной системы оплаты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.3. Использовать Материалы Исполнителя исключительно в рамках
              личной профессиональной деятельности, без права передачи третьим
              лицам, перепродажи, публикации или иного коммерческого
              использования, за исключением использования в рамках собственных
              групповых занятий.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.4. Не передавать логин и пароль третьим лицам, не создавать
              копии Платформы или её элементов, не нарушать авторские права
              Исполнителя и его партнёров.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.5. Самостоятельно следить за актуальностью указанных при
              оформлении Подписки контактных данных (включая адрес электронной
              почты), необходимых для предоставления доступа.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.6. При желании прекратить использование Подписки и
              Рекуррентных платежей — выполнить действия по отключению в личном
              кабинете на Платформе либо через сервис платёжной системы по
              ссылке https://my.cloudpayments.ru.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.7. При создании и размещении Пользовательского контента:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – обеспечивать его соответствие законодательству Российской
              Федерации, авторским и иным правам третьих лиц;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – не размещать материалы, содержащие запрещённую информацию
              (экстремизм, порнографию, рекламу без согласия Исполнителя и т.
              д.);
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – не использовать Платформу для распространения спама, рекламы или
              иной деятельности, не соответствующей целям сервиса.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.2.8. Нести полную ответственность за содержание и качество
              собственных материалов и уроков, размещённых на Платформе, а также
              за последствия их использования третьими лицами.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3. Права Исполнителя:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.1. Вносить изменения в структуру и содержание Платформы,
              обновлять или удалять отдельные Материалы, а также изменять или
              дополнять функционал, при этом обеспечивая Клиенту доступ к ранее
              оплаченной Подписке в пределах её срока действия.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.2. В одностороннем порядке изменять условия настоящей Оферты,
              включая Тарифы, порядок оказания услуг и иные положения. Новая
              редакция Оферты вступает в силу с момента её размещения на
              Платформе и применяется ко всем Подпискам, оформленным после её
              публикации.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.3. Привлекать третьих лиц для технической и организационной
              поддержки Платформы, а также для обработки платежей,
              предоставления Материалов и иной сопутствующей деятельности.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.4. Временно ограничивать или приостанавливать доступ к
              Платформе, Материалам или Пользовательскому контенту в случае
              проведения технических работ, действий провайдеров, неполадок
              программного обеспечения, предписаний государственных органов и
              иных обстоятельств, не зависящих от Исполнителя.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.5. Ограничить или заблокировать доступ Клиента к Платформе в
              случае нарушения Клиентом условий настоящей Оферты, в том числе
              при выявлении:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – передачи Личного доступа третьим лицам;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – публикации или коммерческого использования Материалов без
              разрешения;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – размещения Пользовательского контента, нарушающего
              законодательство, права третьих лиц, нормы морали или правила
              использования Платформы;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              – иных неправомерных действий.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.6. Требовать от Клиента своевременной оплаты Подписки, а при
              наличии Рекуррентных платежей — обеспечения актуальности платёжных
              данных.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.7. Расторгнуть настоящий Договор в одностороннем порядке без
              возврата денежных средств в случае грубого нарушения Клиентом
              условий Оферты, включая распространение платных Материалов,
              незаконное использование Пользовательского контента, попытки
              взлома или дестабилизации Платформы.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.3.8. Удалять или блокировать Пользовательский контент, если он
              нарушает законодательство, авторские права, условия настоящей
              Оферты или может нанести ущерб репутации Платформы.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4. Права Клиента:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.1. Получать доступ к Материалам и функционалу Платформы в
              объёме и на условиях, соответствующих выбранной Подписке, с
              момента активации Подписки и в течение всего оплаченного периода.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.2. Получать от Исполнителя достоверную информацию о сроках
              действия Подписки, порядке оплаты, условиях использования
              Платформы и способах отключения Рекуррентного платежа.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.3. Использовать Материалы Исполнителя в рамках своей
              преподавательской практики, включая групповые занятия, при условии
              соблюдения ограничений, установленных настоящей Офертой.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.4. Создавать и размещать на Платформе собственные уроки и
              материалы в пределах предоставленного функционала, при условии
              соблюдения законодательства и условий настоящей Оферты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.5. Участвовать в акциях, бонусных программах и специальных
              предложениях, проводимых Исполнителем, при наличии таковых.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.6. Расторгнуть настоящий Договор путём отказа от продления
              Подписки, в том числе посредством отключения Рекуррентного платежа
              в порядке, установленном настоящей Офертой.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              2.4.7. Требовать от Исполнителя удаления или ограничения доступа к
              контенту других пользователей, нарушающему его авторские или иные
              законные права, путём направления соответствующего уведомления
              Исполнителю.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <b>
              <span
                lang="RU"
                style={{
                  fontSize: "12.0pt",
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
                  fontSize: "12.0pt",
                }}
              >
                3. Стоимость услуг и Порядок расчетов
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.1. Стоимость Подписки, её виды, срок действия и условия
              использования определяются выбранным Клиентом Тарифом и
              указываются на Платформе по адресу: https://www.2easyeng.com.
              Оплата производится за доступ к Платформе, её функционалу и
              Материалам Исполнителя. Стоимость Подписки не включает оплату за
              качество, проверку или модерацию Пользовательского контента,
              создаваемого другими Клиентами.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.1.1. Предоставление бесплатного пробного периода не требует
              внесения оплаты или указания платёжных данных. Использование
              пробного периода осуществляется исключительно по адресу
              электронной почты, указанному Клиентом при регистрации.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.2. Оплата Подписки производится в безналичной форме с
              использованием платёжных систем, подключённых к Платформе, включая
              оплату банковской картой, через СБП, а также посредством
              Рекуррентных платежей (при выборе соответствующего Тарифа).
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.3. При выборе Тарифа с Рекуррентной системой оплаты первый
              платёж осуществляется Клиентом в момент оформления Подписки.
              Оплата за последующие периоды осуществляется посредством
              автоматического безакцептного списания денежных средств с
              платёжной карты Клиента в первый день нового расчётного периода, в
              соответствии с условиями выбранного Тарифа.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.4. В случае окончания оплаченного периода Подписки, доступ к
              Платформе и Материалам прекращается автоматически, если иное не
              предусмотрено условиями Тарифа. Средства за неиспользованный
              период доступа не возвращаются, если иное не предусмотрено
              настоящей Офертой или законодательством.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.5. В случае невозможности списания денежных средств по
              Рекуррентному платёжному поручению (в том числе из-за недостатка
              средств, истечения срока действия карты и пр.), Исполнитель вправе
              приостановить доступ к Платформе до момента успешного списания
              либо самостоятельной оплаты Клиентом.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.6. Обязательства Исполнителя считаются исполненными в полном
              объёме с момента предоставления Клиенту доступа к Платформе.
              Невостребованный Клиентом доступ (например, при отсутствии входа в
              личный кабинет, создании или использовании уроков) не является
              основанием для возврата оплаты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.7. Клиент вправе отказаться от дальнейшего использования
              Подписки и отключить Рекуррентные платежи в порядке,
              предусмотренном настоящей Офертой. Возврат денежных средств
              осуществляется только в случаях, прямо предусмотренных Офертой и в
              пределах оплаченного, но не использованного доступа.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.8. Исполнитель вправе изменять стоимость Подписки и условия
              Тарифов. Новые условия вступают в силу с момента их публикации на
              Платформе и применяются ко всем новым Подпискам, а также к
              продлению ранее оформленных Подписок при условии предварительного
              уведомления Клиента не менее чем за 3 (три) календарных дня до
              очередного Рекуррентного списания.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.9. Уведомление Клиента об изменении стоимости осуществляется
              путём размещения информации на Платформе, а также посредством
              электронных каналов связи (email или мессенджеры), указанных
              Клиентом при оформлении Подписки.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              3.10. Если Клиент не отключил Рекуррентный платёж до даты
              следующего списания, это считается согласием Клиента с новой
              стоимостью Подписки.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
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
                  fontSize: "12.0pt",
                }}
              >
                4. Расторжение договора. Возврат денежных средств. Порядок
                разрешения споров
              </span>
            </b>
          </p>
          <p className="ConsPlusNormal">
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.1. Исполнитель вправе расторгнуть настоящий Договор в
              одностороннем порядке в случае нарушения Клиентом условий
              настоящей Оферты, включая, но не ограничиваясь: распространением
              или публикацией закрытых Материалов, передачей доступа третьим
              лицам, размещением Пользовательского контента, нарушающего
              законодательство или права третьих лиц, попытками вмешательства в
              работу Платформы либо нарушением авторских прав.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.2. Исполнитель вправе ограничить или прекратить доступ Клиента к
              Материалам, функционалу Платформы или Пользовательскому контенту,
              а также заблокировать возможность оформления новой Подписки в
              случае грубого или систематического нарушения Клиентом условий
              настоящей Оферты, включая агрессивное или оскорбительное поведение
              при обращении в службу поддержки.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.3. Все споры и разногласия, возникающие между Сторонами по
              вопросам, не урегулированным настоящей Офертой, подлежат
              разрешению путём переговоров.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.4. В случае невозможности урегулирования спора путём
              переговоров, спор подлежит рассмотрению в судебном порядке по
              месту нахождения Исполнителя в соответствии с действующим
              законодательством Российской Федерации.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.5. Подписка (за исключением бесплатного пробного периода)
              предоставляется на определённый срок, и в случае её
              неиспользования по вине Клиента, возврат денежных средств не
              осуществляется. Услуга считается оказанной в полном объёме после
              активации доступа, если иное не предусмотрено условиями Оферты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.6. Клиент вправе отказаться от Подписки и потребовать возврата
              денежных средств только в течение 24 (двадцати четырёх) часов с
              момента её оплаты, при условии, что Клиент не начал использовать
              доступ к Платформе. Под использованием понимается вход в личный
              кабинет, открытие или скачивание любого из предоставленных
              Материалов, а также создание или размещение Пользовательского
              контента. По истечении указанного срока услуга считается оказанной
              в полном объёме, возврат денежных средств не производится.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.6.1. Клиент вправе в любой момент отказаться от продления
              Подписки, отключив её через личный кабинет на Платформе. В этом
              случае Подписка действует до окончания уже оплаченного периода,
              после чего доступ автоматически прекращается.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.7. Исполнитель не несёт ответственности и возврат денежных
              средств не производится в случаях, если Клиент выражает
              неудовлетворённость качеством или содержанием Пользовательского
              контента, созданного другими Клиентами.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              4.8. Возврат денежных средств, при наличии оснований,
              осуществляется в течение 10 (десяти) календарных дней с момента
              прекращения действия Подписки и получения надлежащим образом
              оформленного письменного заявления Клиента.
            </span>
          </p>
          <p className="ConsPlusNormal" style={{ textAlign: "justify" }}>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
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
                  fontSize: "12.0pt",
                }}
              >
                5. Срок действия договора
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              5.1. Настоящий Договор вступает в силу с момента Акцепта Клиентом
              условий настоящей Оферты, что подтверждается фактом оплаты
              Подписки, и действует в течение всего оплаченного периода доступа
              к Материалам и функционалу Платформы. При оплате Клиентом новой
              Подписки настоящий Договор считается автоматически продлённым на
              срок действия новой Подписки.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              5.2. Оплата Подписки признаётся полным и безоговорочным Акцептом
              условий Оферты, в результате чего Клиент приобретает статус
              Стороны по настоящему Договору.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              5.3. Клиент, надлежащим образом исполнивший свои обязательства по
              настоящему Договору, имеет право оформить новую Подписку на
              условиях, действующих на момент её приобретения.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              5.4. Исполнитель вправе досрочно расторгнуть настоящий Договор в
              случаях, прямо предусмотренных настоящей Офертой, включая, но не
              ограничиваясь, нарушением Клиентом установленных ограничений на
              использование Материалов, размещением Пользовательского контента,
              нарушающего законодательство или права третьих лиц,
              несанкционированной передачей доступа третьим лицам и иными
              нарушениями условий настоящей Оферты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            align="center"
            style={{ marginBottom: "12.0pt", textAlign: "center" }}
          >
            <b>
              <span
                lang="RU"
                style={{
                  fontSize: "12.0pt",
                }}
              >
                6. Интеллектуальная собственность
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.1. Все Материалы, размещённые на Платформе и предоставляемые
              Клиенту в рамках Подписки, включая тексты, изображения, карточки,
              игры, графику, видео, аудиофайлы и иные элементы, являются
              объектами интеллектуальной собственности и охраняются в
              соответствии с законодательством Российской Федерации и
              международными соглашениями.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.2. Исключительные права на все Материалы Исполнителя,
              размещённые на Платформе, принадлежат Исполнителю либо
              используются на законных основаниях (включая по лицензионным
              договорам с правообладателями).
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.3. Пользовательский контент (уроки, задания и иные материалы,
              созданные Клиентами с использованием функционала Платформы)
              является интеллектуальной собственностью соответствующих Клиентов,
              его разместивших. Размещая Пользовательский контент, Клиент
              подтверждает, что обладает всеми необходимыми правами и несёт
              полную ответственность за его соответствие законодательству и
              правам третьих лиц.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.4. Размещая Пользовательский контент, Клиент предоставляет
              Исполнителю неисключительную, безвозмездную, ограниченную лицензию
              на использование такого контента исключительно для целей хранения,
              отображения на Платформе, обеспечения его функционирования и
              доступа для других Клиентов (если это предусмотрено функционалом).
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.5. Оформление Подписки предоставляет Клиенту неисключительное,
              ограниченное, непередаваемое право использовать Материалы
              Исполнителя исключительно в личных образовательных целях, в рамках
              преподавательской деятельности Клиента.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.6. Клиенту запрещается:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              публиковать, размещать или распространять Материалы Исполнителя,
              полученные в рамках Подписки, в открытом доступе (в том числе на
              сторонних сайтах, в социальных сетях и мессенджерах);
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              передавать Личный доступ (логин и пароль) третьим лицам;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              продавать, копировать, сдавать в аренду доступ к Личному кабинету,
              копировать или иным способом использовать Материалы Исполнителя в
              коммерческих целях;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              создавать производные продукты на основе Материалов Исполнителя
              без письменного разрешения Исполнителя;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              публиковать или распространять отредактированные версии Материалов
              Исполнителя, а также выдавать их за собственный авторский продукт.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              6.7. Нарушение Клиентом положений настоящего раздела может
              повлечь:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              немедленное прекращение доступа к Платформе без возврата
              оплаченных средств;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              обращение Исполнителя в суд для защиты исключительных прав;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              взыскание убытков и/или компенсации за незаконное использование
              интеллектуальной собственности.
            </span>
          </p>
          <p className="ConsPlusNormal" style={{ textAlign: "justify" }}>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            align="center"
            style={{ marginBottom: "12.0pt", textAlign: "center" }}
          >
            <b>
              <span
                lang="RU"
                style={{
                  fontSize: "12.0pt",
                }}
              >
                7. Ответственность Сторон и Форс-мажор
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1. Ответственность Сторон
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.1. Стороны несут ответственность за неисполнение или
              ненадлежащее исполнение обязательств по настоящему Договору в
              соответствии с законодательством Российской Федерации и условиями
              настоящей Оферты.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.2. Исполнитель не несёт ответственности за невозможность
              доступа к Платформе, Материалам или Пользовательскому контенту по
              причинам, не зависящим от него, включая, но не ограничиваясь:
              сбоями в работе сети Интернет, действиями платёжных систем, сбоем
              почтовых сервисов, техническими неисправностями оборудования
              Клиента, действиями хостинг-провайдера или платформ третьих лиц.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.3. Исполнитель не несёт ответственности за любой косвенный или
              упущенный доход, возможные убытки или упущенные возможности
              Клиента, связанные с использованием или невозможностью
              использования Платформы, Материалов или Пользовательского
              контента.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.4. Исполнитель не несёт ответственности за содержание,
              законность, актуальность, качество и соответствие правам третьих
              лиц Пользовательского контента, размещённого Клиентами. Вся
              ответственность за такой контент и последствия его использования
              возлагается исключительно на Клиента, разместившего
              соответствующие материалы.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.5. Клиент несёт полную ответственность за соблюдение условий
              настоящей Оферты, включая недопущение публикации, распространения,
              передачи, перепродажи и коммерческого использования Материалов
              Исполнителя, а также за сохранность логина и пароля доступа. В
              случае нарушения данных условий Клиент обязуется возместить
              причинённый Исполнителю ущерб в полном объёме.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.6. В случае установления факта нарушения Клиентом положений
              раздела 6 настоящей Оферты, Исполнитель вправе заблокировать
              доступ к Платформе без возврата оплаченных средств и обратиться в
              суд с требованием защиты исключительных прав, в том числе
              взыскания компенсации.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.1.7. Клиент несёт ответственность за достоверность и
              актуальность предоставленных при оформлении Подписки данных (в том
              числе адреса электронной почты), необходимых для предоставления
              доступа.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.2. Форс-мажор
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.2.1. Стороны освобождаются от ответственности за полное или
              частичное неисполнение обязательств по настоящему Договору, если
              такое неисполнение стало следствием обстоятельств непреодолимой
              силы (форс-мажора), возникших после заключения Договора, которые
              Стороны не могли предвидеть или предотвратить разумными мерами.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.2.2. К таким обстоятельствам, в частности, относятся: стихийные
              бедствия, пожары, наводнения, военные действия, террористические
              акты, массовые беспорядки, введение чрезвычайного или военного
              положения, акты государственных органов, перебои в работе
              телекоммуникационных сетей или хостинг-провайдеров, сбои платёжных
              систем, эпидемии, забастовки, блокировки сервисов третьих лиц и
              иные аналогичные события.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              7.2.3. Сторона, для которой стало невозможным исполнение
              обязательств вследствие обстоятельств непреодолимой силы, обязана
              незамедлительно уведомить другую Сторону об их наступлении с
              предоставлением подтверждающих документов (при наличии). В случае
              если такие обстоятельства продолжаются более 30 календарных дней,
              любая из Сторон вправе расторгнуть настоящий Договор в
              одностороннем порядке.
            </span>
          </p>
          <p className="ConsPlusNormal" style={{ textAlign: "justify" }}>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
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
                  fontSize: "12.0pt",
                }}
              >
                8. Заключительные положения
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            align="center"
            style={{ textAlign: "center" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.1. Настоящая Оферта, размещённая в сети Интернет по адресу
              https://www.2easyeng.com, действует в редакции, актуальной на
              момент Акцепта Клиентом. Исполнитель вправе в одностороннем
              порядке вносить изменения в условия настоящей Оферты, размещая
              новую редакцию на Платформе. Изменения вступают в силу с момента
              их публикации, если иное не указано в новой редакции Оферты.
              Продолжение использования Подписки или функционала Платформы
              признаётся согласием Клиента с новой редакцией.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.2. Во всём, что не урегулировано настоящей Офертой, Стороны
              руководствуются действующим законодательством Российской
              Федерации.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.3. Признание недействительным какого-либо положения настоящей
              Оферты не влечёт за собой недействительность остальных её
              положений и Оферты в целом.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.4. Все уведомления и обращения в рамках исполнения настоящей
              Оферты осуществляются Сторонами по адресу электронной почты,
              указанному при оформлении Подписки (со стороны Клиента), и на
              контактные данные, размещённые на Платформе (со стороны
              Исполнителя), если иное не предусмотрено дополнительными
              соглашениями.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.5. Клиент, оформляя Подписку, подтверждает, что:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              ознакомлен с условиями настоящей Оферты в полном объёме;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              принимает их добровольно, осознанно и без оговорок;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              понимает объём предоставляемых прав и установленных ограничений;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              соглашается на обработку своих персональных данных в порядке,
              установленном Политикой конфиденциальности, размещённой на
              Платформе;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              соглашается с правилами размещения и использования
              Пользовательского контента, установленными настоящей Офертой и
              (при наличии) отдельными документами Исполнителя, опубликованными
              на Платформе.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.6. Персональные данные Клиента обрабатываются исключительно в
              целях исполнения настоящей Оферты, предоставления доступа к
              Материалам и функционалу Платформы, ведения бухгалтерского и
              налогового учёта, связи с Клиентом и предоставления технической
              поддержки. Подробный порядок обработки персональных данных
              приведён в Политике конфиденциальности.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.7. Исполнитель оказывает техническую поддержку Клиентам по
              вопросам, связанным с доступом к Материалам, функционалу
              Платформы, оплатой Подписки и использованием сервисов, через:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{
              marginLeft: "62.95pt",
              textAlign: "justify",
              textIndent: "-.25in",
            }}
          >
            <span
              lang="RU"
              style={{ fontSize: "12.0pt", fontFamily: "Symbol" }}
            >
              -
              <span style={{ font: '7.0pt "Times New Roman"' }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              электронную почту: double2easy@gmail.com
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Ответ на обращения предоставляется в течение 24 (двадцати четырёх)
              часов с момента получения.
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              8.8. Настоящая Оферта является договором, заключённым в письменной
              форме, не требует подписания и имеет полную юридическую силу в
              соответствии со статьями 434 и 438 Гражданского кодекса Российской
              Федерации.
            </span>
          </p>
          <p className="ConsPlusNormal">
            <b>
              <span
                lang="RU"
                style={{
                  fontSize: "12.0pt",
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
                  fontSize: "12.0pt",
                }}
              >
                9. Реквизиты Исполнителя
              </span>
            </b>
          </p>
          <p
            className="ConsPlusNormal"
            align="center"
            style={{ textAlign: "center" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Индивидуальный предприниматель
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Лобасенко Екатерина Борисовна
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              ИНН: 420553023451
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              ОГРНИП: 324547600006209
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Юридический адрес:
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              197022, Россия, г. Санкт-Петербург,
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              ул. Академика Павлова, д. 6, корп.{" "}
            </span>
            <span
              style={{
                fontSize: "12.0pt",
              }}
            >
              3,{" "}
            </span>
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              кв
            </span>
            <span
              style={{
                fontSize: "12.0pt",
              }}
            >
              . 80
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              style={{
                fontSize: "12.0pt",
              }}
            >
              Email: double2easy@gmail.com
            </span>
          </p>
          <p
            className="ConsPlusNormal"
            style={{ textAlign: "justify", textIndent: "26.95pt" }}
          >
            <span
              lang="RU"
              style={{
                fontSize: "12.0pt",
              }}
            >
              Телефон
            </span>
            <span
              style={{
                fontSize: "12.0pt",
              }}
            >
              : +7 911 189-86-37
            </span>
          </p>
          <p className="ConsPlusNormal" style={{ textAlign: "justify" }}>
            <span
              style={{
                fontSize: "12.0pt",
              }}
            >
              &nbsp;
            </span>
          </p>
        </>
      </ContentWrapper>
    </main>
  );
}
