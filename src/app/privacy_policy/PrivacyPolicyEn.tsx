const textStyle = { fontSize: "12pt", lineHeight: 1.6 };
const sectionStyle = { marginTop: "24pt", marginBottom: "12pt", textAlign: "center" as const };
const paragraphStyle = { marginTop: "12pt", marginBottom: "12pt", textAlign: "justify" as const };
const indentStyle = { ...paragraphStyle, textIndent: "26.95pt" };

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...sectionStyle, fontWeight: 700 }}>
      <span style={textStyle}>{children}</span>
    </p>
  );
}

function P({ children, indent }: { children: React.ReactNode; indent?: boolean }) {
  return (
    <p style={indent ? indentStyle : paragraphStyle}>
      <span style={textStyle}>{children}</span>
    </p>
  );
}

export function PrivacyPolicyEn() {
  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <p style={{ textAlign: "center" }}>
        <b>
          <span style={textStyle}>Personal Data Processing Policy</span>
        </b>
      </p>
      <P indent>Effective Date: July 7, 2026</P>

      <SectionTitle>1. General Provisions</SectionTitle>
      <P indent>
        This Personal Data Processing Policy has been prepared in accordance with the requirements of
        Federal Law No. 152-FZ of 27 July 2006 &ldquo;On Personal Data&rdquo; (the &ldquo;Personal
        Data Law&rdquo;) and defines the procedure for processing personal data and the security
        measures taken by Individual Entrepreneur Ekaterina Borisovna Lobasenko (INN: 420553023451,
        OGRNIP: 324547600006209), hereinafter referred to as the &ldquo;Operator&rdquo;.
      </P>
      <P indent>
        1.1. The Operator&rsquo;s primary objective is to respect the rights and freedoms of
        individuals when processing personal data, including the protection of the right to privacy,
        personal and family confidentiality.
      </P>
      <P indent>
        1.2. This Policy applies to all information that the Operator may receive from users in the
        course of providing access to digital materials by subscription, as well as when using the
        website https://www.2easyeng.com, subscribing, paying for services, or contacting the
        Operator via email, messengers, or other communication channels.
      </P>

      <SectionTitle>2. Key Terms Used in the Policy</SectionTitle>
      <P indent>
        2.1. Automated processing of personal data — processing of personal data using computer
        technology.
      </P>
      <P indent>
        2.2. Blocking of personal data — temporary suspension of personal data processing (except
        where processing is necessary to clarify personal data).
      </P>
      <P indent>
        2.3. Website — a collection of graphic and informational materials, as well as computer
        programs and databases that make them available on the Internet at{" "}
        <a href="https://www.2easyeng.com">https://www.2easyeng.com</a>.
      </P>
      <P indent>
        2.4. Personal data information system — a set of personal data contained in databases and the
        information technologies and technical means that ensure their processing.
      </P>
      <P indent>
        2.5. Depersonalization of personal data — actions as a result of which it is impossible to
        determine, without the use of additional information, which User or other data subject the
        personal data belongs to.
      </P>
      <P indent>
        2.6. Processing of personal data — any action (operation) or set of actions (operations)
        performed with or without the use of automation tools with personal data, including
        collection, recording, systematization, accumulation, storage, clarification (updating,
        modification), extraction, use, transfer (distribution, provision, access), depersonalization,
        blocking, deletion, and destruction of personal data.
      </P>
      <P indent>
        2.7. Operator — Individual Entrepreneur Ekaterina Borisovna Lobasenko (INN: 420553023451,
        OGRNIP: 324547600006209), who independently processes personal data and also determines the
        purposes of processing, the composition of data processed, and the actions performed with
        personal data.
      </P>
      <P indent>
        2.8. Personal data — any information relating directly or indirectly to an identified or
        identifiable User of the website https://www.2easyeng.com.
      </P>
      <P indent>
        2.9. Personal data permitted by the data subject for distribution — personal data to which
        access is granted to an unlimited number of persons with the consent of the data subject in
        the manner established by the Personal Data Law.
      </P>
      <P indent>
        2.10. User — any person visiting the website https://www.2easyeng.com and/or subscribing to
        services provided by the Operator.
      </P>
      <P indent>
        2.11. Provision of personal data — actions aimed at disclosing personal data to a specific
        person or a specific group of persons.
      </P>
      <P indent>
        2.12. Distribution of personal data — any actions aimed at disclosing personal data to an
        indefinite number of persons or providing access to them to an unlimited number of persons.
      </P>
      <P indent>
        2.13. Cross-border transfer of personal data — transfer of personal data to the territory of
        a foreign state to foreign authorities, individuals, or legal entities.
      </P>
      <P indent>
        2.14. Destruction of personal data — actions as a result of which personal data are
        irrevocably destroyed with no possibility of subsequent recovery, or their material carriers
        are destroyed.
      </P>

      <SectionTitle>3. Basic Rights and Obligations of the Operator</SectionTitle>
      <P indent>3.1. The Operator has the right to:</P>
      <P indent>
        – receive reliable information and/or documents containing personal data from the data
        subject;
      </P>
      <P indent>
        – if the data subject withdraws consent to the processing of personal data, continue
        processing without consent where grounds are provided by the Personal Data Law;
      </P>
      <P indent>
        – independently determine the composition and list of measures necessary and sufficient to
        fulfill obligations under the Personal Data Law and other regulations, unless otherwise
        established by law.
      </P>
      <P indent>3.2. The Operator is obliged to:</P>
      <P indent>
        – provide the data subject, upon request, with information relating to the processing of their
        personal data;
      </P>
      <P indent>
        – organize the processing of personal data in accordance with the applicable legislation of
        the Russian Federation;
      </P>
      <P indent>
        – consider appeals and requests from data subjects or their representatives within the period
        established by law;
      </P>
      <P indent>
        – provide the information requested by the authorized body for the protection of data
        subjects&rsquo; rights within 30 calendar days from the date of receipt of the request;
      </P>
      <P indent>
        – publish or otherwise ensure unrestricted access to this Policy;
      </P>
      <P indent>
        – take legal, organizational, and technical measures to protect personal data from unlawful or
        accidental access, destruction, modification, blocking, copying, provision, distribution, and
        other unlawful actions;
      </P>
      <P indent>
        – stop transfer (distribution, provision, access), as well as stop processing and destroy
        personal data in cases provided by the Personal Data Law;
      </P>
      <P indent>
        – fulfill other obligations established by the legislation of the Russian Federation in the
        field of personal data processing.
      </P>

      <SectionTitle>4. Basic Rights and Obligations of Data Subjects</SectionTitle>
      <P indent>4.1. Data subjects have the right to:</P>
      <P indent>
        – receive information relating to the processing of their personal data, except in cases
        provided by federal legislation. Information is provided by the Operator in an accessible
        form and without including personal data of other subjects, except in cases provided by law;
      </P>
      <P indent>
        – require the Operator to clarify, block, or destroy their personal data if the data are
        incomplete, outdated, inaccurate, unlawfully obtained, or not necessary for the stated
        purpose of processing;
      </P>
      <P indent>
        – set prior consent to the processing of personal data for the purpose of promoting goods,
        works, and services on the market;
      </P>
      <P indent>– withdraw consent to the processing of personal data at any time;</P>
      <P indent>
        – appeal against the Operator&rsquo;s actions or inaction that violate their rights to the
        authorized body for the protection of data subjects&rsquo; rights or in court;
      </P>
      <P indent>
        – exercise other rights provided by the legislation of the Russian Federation.
      </P>
      <P indent>4.2. Data subjects are obliged to:</P>
      <P indent>– provide the Operator with only accurate personal data;</P>
      <P indent>
        – promptly inform the Operator of any changes, updates, or clarifications to their personal
        data.
      </P>
      <P indent>
        4.3. Persons who provide the Operator with inaccurate information about themselves, or
        information about other persons without proper authority (including without the consent of
        the data subject), shall be liable in accordance with the legislation of the Russian
        Federation.
      </P>

      <SectionTitle>5. User Data Processed by the Operator</SectionTitle>
      <P indent>
        5.1. The Operator processes the following personal data provided by the User in connection
        with booking and receiving services:
      </P>
      <P indent>5.1.1. Last name, first name, patronymic;</P>
      <P indent>5.1.2. Email address;</P>
      <P indent>5.1.3. Phone number;</P>
      <P indent>
        5.1.4. Payment data (in depersonalized form, through payment aggregators: CloudPayments,
        Patdy);
      </P>
      <P indent>
        5.1.5. Other information that the User voluntarily provides when filling out forms on the
        Website or when communicating with the Operator.
      </P>
      <P indent>
        5.2. Depersonalized data about visitors to the website https://www.2easyeng.com may also be
        collected and processed, including cookies and technical data, using web analytics tools such
        as Yandex.Metrica or similar services.
      </P>
      <P indent>
        5.3. The information listed in this section is hereinafter referred to as &ldquo;personal
        data&rdquo;.
      </P>
      <P indent>
        5.4. The Operator does not process special categories of personal data relating to racial or
        ethnic origin, political views, religious or philosophical beliefs, health status, or intimate
        life.
      </P>
      <P indent>
        5.5. Processing of personal data permitted by the data subject for distribution is carried
        out only in compliance with the conditions and restrictions established by Article 10.1 of
        the Personal Data Law.
      </P>
      <P indent>
        5.6. The User&rsquo;s consent to the processing of personal data permitted for distribution
        must be executed separately and comply with the requirements established by the authorized
        body for the protection of data subjects&rsquo; rights.
      </P>
      <P indent>5.6.1. Such consent is provided directly to the Operator.</P>
      <P indent>
        5.6.2. The Operator is obliged within three business days from receipt of consent to publish
        information on the conditions of processing and the restrictions provided by law.
      </P>
      <P indent>
        5.6.3. The User may withdraw consent to the distribution of personal data at any time by
        sending a written request indicating their full name, contact information, and the list of
        data whose processing is to be stopped.
      </P>
      <P indent>
        5.6.4. Consent to the processing of personal data permitted for distribution ceases to be
        effective from the moment the Operator receives the specified request.
      </P>

      <SectionTitle>6. Principles of Personal Data Processing</SectionTitle>
      <P indent>6.1. Personal data are processed on a lawful and fair basis.</P>
      <P indent>
        6.2. Processing of personal data is limited to the achievement of specific, predetermined,
        and lawful purposes. Processing of personal data incompatible with the purposes of data
        collection is not permitted.
      </P>
      <P indent>
        6.3. Combining databases containing personal data processed for incompatible purposes is not
        permitted.
      </P>
      <P indent>
        6.4. Only personal data that meet the purposes of their processing are subject to processing.
      </P>
      <P indent>
        6.5. The content and volume of processed personal data correspond to the stated purposes of
        processing. Excessive processing of personal data in relation to the stated purposes is not
        permitted.
      </P>
      <P indent>
        6.6. When processing personal data, the accuracy of personal data, their sufficiency, and,
        where necessary, relevance in relation to the purposes of processing are ensured. The
        Operator takes necessary measures and/or ensures their adoption to delete or clarify
        incomplete or inaccurate data.
      </P>
      <P indent>
        6.7. Personal data are stored in a form that makes it possible to identify the data subject
        no longer than required by the purposes of processing, unless a storage period is established
        by federal law, contract, or the data subject is a party, beneficiary, or guarantor under such
        contract. Processed personal data are destroyed or depersonalized upon achievement of
        processing purposes or when there is no longer a need to achieve them, unless otherwise
        provided by federal law.
      </P>

      <SectionTitle>7. Purposes of Personal Data Processing</SectionTitle>
      <P indent>7.1. The purposes of processing the User&rsquo;s personal data are:</P>
      <P indent>
        – processing and administration of a Subscription to digital educational materials provided
        by the Operator;
      </P>
      <P indent>
        – processing requests, appeals, and messages received through the website and messengers;
      </P>
      <P indent>
        – providing technical support and feedback, including access recovery and responses to User
        questions;
      </P>
      <P indent>
        – sending informational and promotional messages with the User&rsquo;s consent (including via
        email and messengers);
      </P>
      <P indent>
        – maintaining internal records and statistics, as well as complying with the requirements of
        the legislation of the Russian Federation, including tax and accounting obligations.
      </P>
      <P indent>
        7.2. The Operator may send the User informational and promotional messages about new
        services, special offers, promotions, and events. The User may opt out of receiving such
        messages at any time by sending a notice to the Operator&rsquo;s email address:
        tatianaanenko@gmail.com with the subject line &ldquo;Opt-out from informational
        messages&rdquo;.
      </P>
      <P indent>
        7.3. Depersonalized data collected using web analytics services are used to analyze User
        behavior, improve the structure and content of the website, and enhance the quality of
        services provided.
      </P>

      <SectionTitle>8. Legal Grounds for Personal Data Processing</SectionTitle>
      <P indent>8.1. The legal grounds for processing personal data by the Operator are:</P>
      <P indent>– the applicable civil legislation of the Russian Federation;</P>
      <P indent>
        – the provisions of Federal Law No. 152-FZ of 27 July 2006 &ldquo;On Personal Data&rdquo; and
        other regulations in the field of personal data protection;
      </P>
      <P indent>
        – contracts concluded between the Operator and the data subject, including a contract based
        on acceptance of the public offer;
      </P>
      <P indent>
        – consents voluntarily provided by the data subject (including when contacting via
        aggregators, email, phone, or messengers).
      </P>
      <P indent>
        8.2. The Operator processes the User&rsquo;s personal data only if voluntarily provided when
        subscribing through the Operator&rsquo;s website, as well as when contacting via messengers or
        email. Providing personal data constitutes the User&rsquo;s consent to this Policy. Consent to
        the processing of personal data also includes User actions expressing an intention to use the
        Operator&rsquo;s services, including subscribing and paying for a Subscription, sending
        messages, filling out forms, or other active actions.
      </P>
      <P indent>
        8.3. Depersonalized User data (including cookies and information transmitted through web
        analytics) are processed if permitted in the User&rsquo;s browser settings.
      </P>
      <P indent>
        8.4. The data subject independently and voluntarily decides to provide their personal data to
        the Operator, thereby expressing consent to their processing in their own interests.
      </P>

      <SectionTitle>9. Conditions for Personal Data Processing</SectionTitle>
      <P indent>
        9.1. Personal data are processed with the consent of the data subject to the processing of
        their personal data.
      </P>
      <P indent>
        9.2. Processing of personal data is necessary to achieve purposes provided by an
        international treaty of the Russian Federation or by law, or to perform functions, powers, and
        duties imposed on the operator by the legislation of the Russian Federation.
      </P>
      <P indent>
        9.3. Processing of personal data is necessary for the administration of justice, execution
        of a judicial act, or an act of another body or official subject to execution under the
        legislation of the Russian Federation on enforcement proceedings.
      </P>
      <P indent>
        9.4. Processing of personal data is necessary for the performance of a contract to which the
        data subject is a party, beneficiary, or guarantor, as well as for concluding a contract at
        the initiative of the data subject or a contract under which the data subject will be a
        beneficiary or guarantor.
      </P>
      <P indent>
        9.5. Processing of personal data is necessary to exercise the rights and legitimate interests
        of the operator or third parties, or to achieve socially significant purposes, provided that
        the rights and freedoms of the data subject are not violated.
      </P>
      <P indent>
        9.6. Processing of personal data to which an unlimited number of persons have been granted
        access by the data subject or at their request (publicly available personal data) is carried
        out.
      </P>
      <P indent>
        9.7. Processing of personal data subject to publication or mandatory disclosure under
        federal law is carried out.
      </P>

      <SectionTitle>
        10. Procedure for Collection, Storage, Transfer, and Other Types of Personal Data Processing
      </SectionTitle>
      <P indent>
        10.1. The Operator ensures the security of personal data and takes all possible measures to
        prevent unauthorized access to personal data.
      </P>
      <P indent>
        10.2. The User&rsquo;s personal data shall not be transferred to third parties, except in the
        following cases:
      </P>
      <P indent>– the data subject has consented to such transfer;</P>
      <P indent>– compliance with the requirements of the legislation of the Russian Federation;</P>
      <P indent>
        – transfer is necessary to fulfill the Operator&rsquo;s obligations to the Customer under a
        concluded contract (including when booking through third-party platforms).
      </P>
      <P indent>
        10.3. If inaccuracies in personal data are identified, the User may update them by sending a
        notice to the Operator&rsquo;s email address: lobasenko1994@mail.ru with the subject line
        &ldquo;Personal data update&rdquo;.
      </P>
      <P indent>
        10.4. The period of personal data processing is determined by the purposes for which such data
        were obtained, unless otherwise established by contract, the legislation of the Russian
        Federation, or other mandatory requirements. The User may withdraw consent to the processing of
        personal data at any time by sending a notice to lobasenko1994@mail.ru with the subject line
        &ldquo;Withdrawal of consent to personal data processing&rdquo;.
      </P>
      <P indent>
        10.5. All information collected by third-party services, including payment systems,
        communication tools, and other service providers, is stored and processed by those parties
        (Operators) in accordance with their User Agreement and Privacy Policy. The data subject
        and/or User must independently familiarize themselves with those documents in a timely manner.
        The Operator is not responsible for the actions of third parties, including the service
        providers specified in this clause.
      </P>
      <P indent>
        10.6. Prohibitions established by the data subject on transfer (except for granting access),
        as well as on processing or conditions of processing (except for obtaining access) of
        personal data permitted for distribution, do not apply in cases of processing personal data in
        state, public, and other public interests defined by the legislation of the Russian
        Federation.
      </P>
      <P indent>
        10.7. The Operator ensures the confidentiality of personal data when processing them.
      </P>
      <P indent>
        10.8. The Operator stores personal data in a form that makes it possible to identify the data
        subject no longer than required by the purposes of processing, unless another storage period
        is established by federal law or contract. Personal data are stored in automated systems used
        by the Operator, as well as in payment aggregator systems (CloudPayments, Patdy) and cloud
        services used for correspondence and request processing (including email and messengers).
        Personal data are stored until the User withdraws consent, unless otherwise provided by the
        legislation of the Russian Federation.
      </P>
      <P indent>
        10.9. Grounds for termination of personal data processing may include achievement of the
        purposes of processing, expiration of the data subject&rsquo;s consent or withdrawal of
        consent, or identification of unlawful processing of personal data.
      </P>
      <P indent>
        10.10. The security of personal data processed by the Operator is ensured through the
        implementation of legal, organizational, and technical measures necessary to fully comply with
        the requirements of applicable legislation in the field of personal data protection.
      </P>

      <SectionTitle>
        11. List of Actions Performed by the Operator with Personal Data Received
      </SectionTitle>
      <P indent>
        11.1. The Operator carries out collection, recording, systematization, accumulation, storage,
        clarification (updating, modification), extraction, use, transfer (distribution, provision,
        access), depersonalization, blocking, deletion, and destruction of personal data.
      </P>
      <P indent>
        11.2. The Operator carries out automated processing of personal data with or without
        transmission of the received information via information and telecommunication networks.
      </P>

      <SectionTitle>12. Cross-Border Transfer of Personal Data</SectionTitle>
      <P indent>
        12.1. Before commencing cross-border transfer of personal data, the Operator must ensure that
        the foreign state to whose territory the transfer is intended provides reliable protection of
        data subjects&rsquo; rights.
      </P>
      <P indent>
        12.2. Cross-border transfer of personal data to the territories of foreign states that do not
        meet the above requirements may be carried out only with the written consent of the data
        subject to cross-border transfer of their personal data and/or for the performance of a
        contract to which the data subject is a party.
      </P>

      <SectionTitle>13. Confidentiality of Personal Data</SectionTitle>
      <P indent>
        13.1. The Operator and other persons who have gained access to personal data are obliged not
        to disclose them to third parties or distribute them without the consent of the data subject,
        unless otherwise provided by federal law.
      </P>

      <SectionTitle>14. Final Provisions</SectionTitle>
      <P indent>
        14.1. The User may obtain clarifications regarding the processing of their personal data by
        sending a request to the Operator&rsquo;s email address: lobasenko1994@mail.ru.
      </P>
      <P indent>
        14.2. This Policy may be amended by the Operator at any time. All amendments take effect
        from the moment the new version of the Policy is published, unless otherwise provided by the
        Policy itself. The Policy is valid indefinitely until replaced by a new version.
      </P>
      <P indent>
        14.3. The current version of the Policy is freely available on the Operator&rsquo;s official
        website: https://www.2easyeng.com.
      </P>
      <br />
      <br />
      <br />
      <br />
    </>
  );
}
