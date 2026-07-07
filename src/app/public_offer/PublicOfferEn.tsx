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

export function PublicOfferEn() {
  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <p style={{ textAlign: "center" }}>
        <b>
          <span style={textStyle}>TERMS OF SERVICE</span>
        </b>
      </p>
      <P indent>Effective Date: July 7, 2026</P>
      <P indent>
        These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you
        (&ldquo;User&rdquo;, &ldquo;Customer&rdquo;, &ldquo;you&rdquo;) and Individual Entrepreneur
        Ekaterina Borisovna Lobasenko, Tax Identification Number (INN): 420553023451, Primary State
        Registration Number (OGRNIP): 324547600006209 (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
        &ldquo;our&rdquo;, &ldquo;us&rdquo;).
      </P>
      <P indent>
        These Terms govern your access to and use of the website located at https://www.2easyeng.com
        (the &ldquo;Platform&rdquo;), together with all educational materials, subscriptions,
        downloadable resources, content, and related services made available through the Platform.
      </P>
      <P indent>
        By accessing the Platform, creating an account, purchasing a Subscription, receiving access to
        the Services, or otherwise using any part of the Platform, you acknowledge that you have
        read, understood, and agree to be bound by these Terms.
      </P>
      <P indent>
        If you do not agree to these Terms, you must not access or use the Platform or any Services
        provided through it.
      </P>
      <P indent>
        The Company provides digital educational resources intended primarily for English language
        teachers and educational professionals. Access to the Materials is provided on a subscription
        basis and is subject to these Terms.
      </P>

      <SectionTitle>1. INTRODUCTION</SectionTitle>
      <P indent>
        <b>1.1. Purpose of the Terms</b>
        <br />
        These Terms establish the rights, obligations, restrictions, and conditions governing the
        provision and use of the Services offered through the Platform.
        <br />
        These Terms apply to all visitors, registered users, customers, subscribers, recipients of
        Gift Subscriptions, and any other individuals accessing or using the Platform.
      </P>
      <P indent>
        <b>1.2. Operator Information</b>
        <br />
        The Services are provided by:
        <br />
        Individual Entrepreneur Ekaterina Borisovna Lobasenko
        <br />
        INN: 420553023451
        <br />
        OGRNIP: 324547600006209
        <br />
        Email: double2easy@gmail.com
      </P>
      <P indent>
        <b>1.3. Acceptance of the Terms</b>
        <br />
        By purchasing a Subscription, registering an Account, accessing the Materials, using the
        Platform, or otherwise using the Services, you enter into a legally binding agreement with
        the Company and accept these Terms in their entirety.
        <br />
        If you do not agree with any provision of these Terms, you must discontinue use of the
        Services immediately.
      </P>
      <P indent>
        <b>1.4. Eligibility</b>
        <br />
        The Services are intended for individuals who have the legal capacity to enter into binding
        agreements under the laws applicable to them.
        <br />
        By using the Services, you represent and warrant that:
        <br />
        (a) you are at least eighteen (18) years old or have reached the age of legal majority in
        your country of residence;
        <br />
        (b) you possess the legal capacity required to enter into binding agreements;
        <br />
        (c) all information provided to the Company is accurate, complete, and up to date.
        <br />
        The Company reserves the right to refuse access to the Services if it reasonably believes that
        a user does not satisfy these requirements.
      </P>
      <P indent>
        <b>1.5. Scope of the Services</b>
        <br />
        The Platform provides access to digital educational materials and related resources, including
        but not limited to lesson plans, worksheets, conversation activities, educational games,
        grammar resources, downloadable files, and other teaching materials.
        <br />
        The Company does not provide accredited educational programs, state-recognized
        qualifications, professional licensing, employment services, or guarantees regarding
        educational, professional, financial, or business outcomes resulting from the use of the
        Services.
      </P>

      <SectionTitle>2. DEFINITIONS</SectionTitle>
      <P indent>
        For the purposes of these Terms, the following terms shall have the meanings assigned to them
        below:
        <br />
        &ldquo;Account&rdquo; means a user profile created for access to the Platform and the
        Services.
        <br />
        &ldquo;Company&rdquo; means Individual Entrepreneur Ekaterina Borisovna Lobasenko, acting as
        the provider of the Services under these Terms.
        <br />
        &ldquo;Content&rdquo; means any information, text, graphics, images, videos, audio materials,
        downloadable files, lessons, exercises, worksheets, games, presentations, PDFs, educational
        resources, and other materials available through the Platform.
        <br />
        &ldquo;Customer&rdquo; means any individual who purchases a Subscription, receives access to
        the Services, or otherwise enters into a contractual relationship with the Company under
        these Terms.
        <br />
        &ldquo;Gift Subscription&rdquo; means a Subscription purchased by one individual for the
        benefit of another recipient designated during the purchase process.
        <br />
        &ldquo;Materials&rdquo; means the digital educational resources made available through the
        Platform, including but not limited to lesson plans, conversation games, flashcards, grammar
        exercises, worksheets, presentations, PDFs, downloadable files, and other teaching materials
        created, owned, or lawfully licensed by the Company.
        <br />
        &ldquo;Personal Access Credentials&rdquo; means the login credentials assigned to a Customer,
        including usernames, email addresses, passwords, authentication information, or any other
        means used to access the Platform.
        <br />
        &ldquo;Platform&rdquo; means the website located at https://www.2easyeng.com, together with
        all associated webpages, systems, databases, applications, features, content repositories, and
        related digital infrastructure operated by or on behalf of the Company.
        <br />
        &ldquo;Recurring Payment&rdquo; means an authorization granted by the Customer allowing
        automatic charges to the selected payment method for the renewal of a Subscription at the end
        of each Subscription Period unless cancelled by the Customer.
        <br />
        &ldquo;Services&rdquo; means the provision of access to the Platform, Materials, downloadable
        resources, educational content, technical support, and all related digital services offered by
        the Company.
        <br />
        &ldquo;Subscription&rdquo; means a limited-duration right to access and use the Services and
        Materials in accordance with the selected subscription plan and these Terms.
        <br />
        &ldquo;Subscription Period&rdquo; means the duration of access purchased by the Customer,
        including monthly, quarterly, annual, or any other subscription plan offered by the Company
        from time to time.
        <br />
        &ldquo;User&rdquo; means any visitor, Customer, account holder, recipient of a Gift
        Subscription, or other individual accessing or using the Platform.
        <br />
        References to the singular include the plural and vice versa. References to any gender include
        all genders. Headings are included for convenience only and shall not affect the interpretation
        of these Terms.
      </P>

      <SectionTitle>3. DESCRIPTION OF SERVICES</SectionTitle>
      <P indent>3.1. The Company provides access to digital educational materials and related resources through the Platform on a subscription basis.</P>
      <P indent>3.2. The Materials available through the Platform may include lesson plans, conversation activities, speaking games, flashcards, grammar exercises, worksheets, presentations, downloadable PDF files, educational templates, teaching resources, and other educational materials made available by the Company from time to time.</P>
      <P indent>3.3. Access to the Materials is provided for a limited Subscription Period selected and purchased by the Customer.</P>
      <P indent>3.4. Access to the Services is activated following successful payment and completion of the registration process, where applicable.</P>
      <P indent>3.5. Each Subscription is personal, limited, non-transferable, and non-exclusive.</P>
      <P indent>3.6. The Company may permit the purchase of Gift Subscriptions for third-party recipients.</P>
      <P indent>3.7. The Company does not guarantee uninterrupted, error-free, or continuous availability of the Platform.</P>
      <P indent>3.8. The Materials are provided for educational and informational purposes only and do not guarantee any specific learning, professional, business, or financial outcome.</P>
      <P indent>3.9. The Services do not constitute accredited educational programs and do not provide officially recognized academic qualifications, licenses, certifications, degrees, or professional credentials unless expressly stated otherwise on the Platform.</P>

      <SectionTitle>4. USER ACCOUNT</SectionTitle>
      <P indent>4.1. Access to certain Services may require the creation of an Account. The Customer shall provide accurate, complete, and up-to-date information during registration and shall promptly update such information if it changes.</P>
      <P indent>4.2. The Customer is solely responsible for maintaining the confidentiality and security of their Personal Access Credentials and for all activities conducted through their Account.</P>
      <P indent>4.3. The Customer shall not share, disclose, transfer, sell, rent, sublicense, or otherwise make Personal Access Credentials available to any third party.</P>
      <P indent>4.4. The Customer shall immediately notify the Company if they become aware of any unauthorized access to their Account, loss of credentials, suspected security breach, or any other unauthorized use of the Services.</P>
      <P indent>4.5. The Company may rely on any action performed through an Account as having been authorized by the Customer unless the Company has received prior notice of unauthorized access.</P>
      <P indent>4.6. The Customer remains responsible for all activity occurring under their Account, whether or not such activity was personally performed by the Customer, except to the extent resulting from the Company&rsquo;s own fault.</P>
      <P indent>4.7. The Company reserves the right to suspend, restrict, or terminate access to an Account where it reasonably believes that: (a) the Account is being used in violation of these Terms; (b) Personal Access Credentials have been shared with third parties; (c) the Services or Materials are being misused; (d) fraudulent, unlawful, abusive, or unauthorized activity has occurred; or (e) suspension is reasonably necessary to protect the Platform, the Company, other users, or third parties.</P>
      <P indent>4.8. The Company may request reasonable information or verification from the Customer where necessary to confirm ownership of an Account, investigate suspected misuse, or protect the security and integrity of the Services.</P>
      <P indent>4.9. The Company shall not be responsible for any loss, damage, unauthorized access, or inability to access the Services resulting from the Customer&rsquo;s failure to maintain the confidentiality of Personal Access Credentials.</P>
      <P indent>4.10. The Customer may stop using the Services and close their Account at any time. Closure of an Account shall not affect any payment obligations, intellectual property restrictions, or other provisions of these Terms that are intended to survive termination.</P>
      <P indent>4.11. The Company reserves the right to deactivate or remove Accounts that remain inactive for an extended period of time, provided that any active Subscription Period purchased by the Customer shall not be affected.</P>

      <SectionTitle>5. SUBSCRIPTIONS, PURCHASES AND PAYMENTS</SectionTitle>
      <P indent>5.1. Access to the Services is provided on a paid subscription basis. Available Subscription plans, Subscription Periods, pricing, features, and access conditions are displayed on the Platform at the time of purchase.</P>
      <P indent>5.2. The Customer may purchase a Subscription for the period offered on the Platform, including monthly, quarterly, annual, or other Subscription Periods made available by the Company from time to time.</P>
      <P indent>5.3. The Subscription becomes active upon successful receipt of payment by the Company or its authorized payment service provider.</P>
      <P indent>5.4. The Customer agrees to pay all fees, charges, and applicable taxes associated with the selected Subscription plan.</P>
      <P indent>5.5. Payments may be processed through third-party payment service providers selected by the Company. The Company does not collect or store full payment card information unless expressly stated otherwise.</P>
      <P indent>5.6. Where a Subscription includes automatic renewal, the Customer expressly authorizes the Company and its payment service providers to charge the selected payment method for each subsequent Subscription Period until cancellation.</P>
      <P indent>5.7. Unless cancelled before the end of the current Subscription Period, an automatically renewing Subscription shall renew for successive periods of the same duration as the originally purchased Subscription Period.</P>
      <P indent>5.8. The Customer may cancel automatic renewal at any time through the available account settings, payment management tools, or other cancellation methods provided by the Company. Cancellation shall prevent future charges but shall not affect the current active Subscription Period.</P>
      <P indent>5.9. Failure to cancel a Subscription before the next billing date shall be deemed authorization for the renewal charge applicable to the next Subscription Period.</P>
      <P indent>5.10. If a recurring payment cannot be successfully processed for any reason, including insufficient funds, expired payment methods, banking restrictions, or payment processor errors, the Company may suspend or restrict access to the Services until payment is successfully completed.</P>
      <P indent>5.11. The Company reserves the right to modify Subscription prices, features, or available plans at any time. Any such changes shall not affect the remaining portion of a Subscription Period already paid for by the Customer.</P>
      <P indent>5.12. Where a Subscription is subject to automatic renewal, the Company shall provide reasonable notice of any price increase before such increase becomes effective for future renewals.</P>
      <P indent>5.13. If the Customer does not cancel the Subscription before the effective date of a notified price increase, continued use of the Subscription shall constitute acceptance of the updated pricing.</P>
      <P indent>5.14. The Company may offer promotional pricing, discounts, free trials, special offers, or bonus access periods. Unless expressly stated otherwise, such promotions are temporary, may be modified or withdrawn at any time, and do not create any entitlement to future discounts or preferential pricing.</P>
      <P indent>5.15. Access to the Services automatically expires at the end of the applicable Subscription Period unless renewed through a new purchase or an active automatic renewal arrangement.</P>
      <P indent>5.16. The Customer acknowledges that failure to actively use the Services, access the Platform, download Materials, or otherwise utilize the Subscription during the Subscription Period shall not relieve the Customer of payment obligations and shall not, by itself, create any entitlement to a refund, credit, extension, or compensation.</P>
      <P indent>5.17. The Company&rsquo;s obligation to provide the Services shall be deemed fulfilled when access to the purchased Subscription is made available to the Customer through the Platform.</P>

      <SectionTitle>6. CONSUMER WITHDRAWAL RIGHTS AND REFUND POLICY</SectionTitle>
      <P indent>6.1. If the Customer is a consumer residing in the European Economic Area, the Customer may have a statutory right to withdraw from a distance contract within fourteen (14) days from the date of purchase without providing any reason, subject to the provisions of this Section and applicable law.</P>
      <P indent>6.2. By purchasing a Subscription and requesting immediate access to the Services, the Customer expressly requests and consents to the immediate commencement of the digital Services before the expiration of the applicable withdrawal period.</P>
      <P indent>6.3. The Customer acknowledges and agrees that, where permitted by applicable law, once access to the digital Services or Materials has been provided and performance of the contract has begun at the Customer&rsquo;s request, the Customer may lose the statutory right of withdrawal.</P>
      <P indent>6.4. During the purchase process, the Customer may be required to provide an express acknowledgement that the Services will commence immediately and that the applicable withdrawal right may be lost once access to the digital content has been granted.</P>
      <P indent>6.5. Where the Customer has not accessed the Platform, activated the Subscription, logged into the Account, viewed Materials, downloaded Materials, or otherwise used the Services, the Company may consider refund requests submitted during the applicable withdrawal period in accordance with mandatory consumer protection laws.</P>
      <P indent>6.6. Except where required by applicable law, Subscription fees are non-refundable after access to the Services has been provided.</P>
      <P indent>6.7. The Customer shall not be entitled to a refund solely because the Customer: (a) did not use the Services; (b) did not access the Platform; (c) failed to download available Materials; (d) changed personal preferences; (e) no longer requires the Services; or (f) failed to cancel an automatically renewing Subscription before the next billing date.</P>
      <P indent>6.8. The Company may, at its sole discretion and without creating any legal obligation to do so, provide refunds, credits, discounts, or other goodwill remedies in individual cases.</P>
      <P indent>6.9. Refund requests must be submitted to the Company through the contact details specified in these Terms and must contain sufficient information to identify the relevant purchase and the grounds for the request.</P>
      <P indent>6.10. Approved refunds, where applicable, shall be processed using the original payment method whenever reasonably possible and within the period required by applicable law or payment processing procedures.</P>
      <P indent>6.11. Gift Subscriptions, promotional offers, complimentary access periods, bonus content, discounted campaigns, and other special offers may be excluded from refund eligibility to the fullest extent permitted by applicable law.</P>
      <P indent>6.12. Nothing in this Section limits, excludes, or affects any mandatory consumer rights that cannot be waived or restricted under applicable law.</P>

      <SectionTitle>7. ACCEPTABLE USE AND USER RESPONSIBILITIES</SectionTitle>
      <P indent>7.1. The Customer shall use the Services, Platform, and Materials only in accordance with these Terms and all applicable laws and regulations.</P>
      <P indent>7.2. The Customer may use the Materials for personal educational purposes and within the Customer&rsquo;s own teaching, tutoring, training, or educational activities, subject to the restrictions set forth in these Terms.</P>
      <P indent>7.3. The Customer shall not share, transfer, distribute, disclose, sell, rent, sublicense, lend, assign, or otherwise provide access to the Platform, Account, Subscription, or Personal Access Credentials to any third party.</P>
      <P indent>7.4. The Customer shall not reproduce, republish, publicly display, publicly perform, distribute, transmit, sell, license, commercialize, exploit, or otherwise make the Materials available to third parties except as expressly permitted under these Terms.</P>
      <P indent>7.5. The Customer shall not upload, publish, post, distribute, or otherwise make the Materials available through websites, marketplaces, social media platforms, messaging applications, file-sharing services, cloud storage repositories, or any other public or private distribution channels.</P>
      <P indent>7.6. The Customer shall not use the Materials to create, develop, market, distribute, or sell competing educational products, databases, libraries, repositories, subscription services, or similar commercial offerings.</P>
      <P indent>7.7. The Customer may adapt, edit, customize, translate, or modify Materials solely for use within the Customer&rsquo;s own educational or teaching activities. Any modified version of the Materials shall remain subject to the intellectual property rights of the Company and may not be distributed, sold, licensed, published, or represented as the Customer&rsquo;s original work.</P>
      <P indent>7.8. The Customer shall not copy, scrape, harvest, extract, download in bulk, systematically collect, reverse engineer, decompile, disassemble, or otherwise attempt to obtain source materials, databases, systems, or proprietary information underlying the Platform.</P>
      <P indent>7.9. The Customer shall not interfere with, disrupt, damage, overload, impair, or compromise the security, integrity, operation, or availability of the Platform or any related systems.</P>
      <P indent>7.10. The Customer shall not use the Services for any unlawful, fraudulent, misleading, abusive, defamatory, harmful, or unauthorized purpose.</P>
      <P indent>7.11. The Customer shall not circumvent, disable, remove, modify, or otherwise interfere with any security measures, technical protections, access controls, or usage limitations implemented by the Company.</P>
      <P indent>7.12. The Customer is responsible for maintaining accurate account information, safeguarding Personal Access Credentials, and ensuring that all use of the Services associated with the Customer&rsquo;s Account complies with these Terms.</P>
      <P indent>7.13. The Company reserves the right to investigate suspected violations of these Terms and to suspend, restrict, or terminate access to the Services where the Company reasonably believes that a violation has occurred.</P>
      <P indent>7.14. Any use of the Services or Materials in violation of this Section may result in immediate suspension or termination of access without prejudice to any other rights or remedies available to the Company under applicable law.</P>

      <SectionTitle>8. INTELLECTUAL PROPERTY RIGHTS</SectionTitle>
      <P indent>8.1. The Platform, the Materials, and all Content made available through the Services, including without limitation lesson plans, worksheets, flashcards, games, presentations, graphics, text, videos, audio recordings, downloadable files, databases, designs, trademarks, logos, software, and other materials, are protected by intellectual property laws and international treaties.</P>
      <P indent>8.2. Unless otherwise expressly stated, all intellectual property rights, including copyrights, database rights, trademark rights, trade secrets, and other proprietary rights in the Platform and Materials, are owned by or licensed to the Company.</P>
      <P indent>8.3. Subject to compliance with these Terms and payment of all applicable fees, the Company grants the Customer a limited, personal, non-exclusive, non-transferable, non-sublicensable, and revocable license to access and use the Materials during the applicable Subscription Period solely for the purposes expressly permitted under these Terms.</P>
      <P indent>8.4. No ownership rights, title, intellectual property rights, or other proprietary interests in the Platform or Materials are transferred to the Customer under these Terms.</P>
      <P indent>8.5. Except as expressly permitted by these Terms, the Customer shall not copy, reproduce, distribute, publish, display, transmit, sell, license, rent, sublicense, modify, commercialize, exploit, or otherwise use the Materials in any manner without the prior written consent of the Company.</P>
      <P indent>8.6. The Customer shall not remove, alter, obscure, or modify any copyright notices, trademarks, branding elements, attribution notices, proprietary legends, or other intellectual property notices appearing on or within the Materials.</P>
      <P indent>8.7. Any unauthorized use of the Platform or Materials may constitute an infringement of intellectual property rights and may result in suspension or termination of access to the Services, in addition to any other legal remedies available to the Company.</P>
      <P indent>8.8. The Company reserves all rights not expressly granted to the Customer under these Terms.</P>
      <P indent>8.9. The Company may make certain Materials available free of charge from time to time. Unless expressly stated otherwise, such Materials remain protected by intellectual property laws and may only be used in accordance with the conditions specified by the Company.</P>
      <P indent>8.10. If the Customer believes that any Content available through the Platform infringes intellectual property rights, the Customer may notify the Company using the contact details provided in these Terms. The Company reserves the right to investigate such notices and take any action it deems appropriate.</P>
      <P indent>8.11. The Customer acknowledges that unauthorized distribution, publication, sharing, reproduction, resale, or commercial exploitation of the Materials may cause substantial harm to the Company and may entitle the Company to seek injunctive relief, damages, compensation, and any other remedies available under applicable law.</P>

      <SectionTitle>9. SERVICE AVAILABILITY AND MODIFICATIONS</SectionTitle>
      <P indent>9.1. The Company continuously develops, updates, and improves the Platform and reserves the right to modify, update, replace, suspend, discontinue, reorganize, or remove any part of the Services, Materials, features, functionality, design, structure, or content at any time.</P>
      <P indent>9.2. The Company may add new Materials, remove existing Materials, update educational resources, revise content, or modify the organization of the Platform without prior notice, provided that such changes do not materially deprive Customers of the core benefits of an active Subscription.</P>
      <P indent>9.3. The Company does not guarantee that any particular Material, feature, resource, tool, functionality, or section of the Platform will remain available for any specific period of time.</P>
      <P indent>9.4. The Company may perform scheduled maintenance, emergency maintenance, security updates, software upgrades, infrastructure changes, and other technical operations that may temporarily affect the availability of the Services.</P>
      <P indent>9.5. Access to the Platform may be interrupted, delayed, limited, degraded, or unavailable due to maintenance activities, technical failures, software defects, hardware failures, internet disruptions, cybersecurity incidents, actions of third-party providers, governmental measures, force majeure events, or other circumstances beyond the Company&rsquo;s reasonable control.</P>
      <P indent>9.6. The Company does not guarantee uninterrupted, error-free, secure, continuous, or permanent availability of the Platform or Services.</P>
      <P indent>9.7. The Customer acknowledges that temporary interruptions, maintenance periods, software updates, content modifications, technical issues, and reasonable operational changes are inherent aspects of online digital services and shall not, by themselves, constitute a breach of these Terms.</P>
      <P indent>9.8. Except where required by applicable law, temporary interruptions, maintenance activities, technical issues, content updates, feature modifications, or service availability issues shall not entitle the Customer to refunds, credits, compensation, damages, extensions of Subscription Periods, or other remedies.</P>
      <P indent>9.9. The Company may suspend access to all or part of the Services where reasonably necessary to protect the security, integrity, stability, functionality, or lawful operation of the Platform.</P>
      <P indent>9.10. The Company may rely on third-party providers, including hosting providers, cloud infrastructure providers, payment processors, communication services, content delivery networks, analytics services, and other service providers for the operation of the Platform. The Company shall not be responsible for interruptions, delays, failures, or limitations caused by such third-party providers beyond the Company&rsquo;s reasonable control.</P>
      <P indent>9.11. The Company reserves the right to discontinue the Services or any part thereof at any time. In the event of permanent discontinuation of the Services, the Company shall honor any mandatory obligations imposed by applicable law with respect to active Subscription Periods.</P>
      <P indent>9.12. Nothing in this Section shall limit any non-waivable consumer rights that may apply under applicable law.</P>

      <SectionTitle>10. DISCLAIMERS AND LIMITATION OF LIABILITY</SectionTitle>
      <P indent>10.1. The Services, Platform, Materials, and all Content are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the fullest extent permitted by applicable law.</P>
      <P indent>10.2. The Company makes no representations, warranties, guarantees, or promises, whether express, implied, statutory, or otherwise, regarding the availability, reliability, accuracy, completeness, suitability, fitness for a particular purpose, merchantability, or performance of the Services or Materials.</P>
      <P indent>10.3. The Company does not guarantee that the Platform will operate uninterrupted, error-free, secure, free from defects, or free from harmful components.</P>
      <P indent>10.4. The Company does not guarantee any particular educational, professional, academic, business, financial, or personal outcome arising from the use of the Services or Materials.</P>
      <P indent>10.5. The Company does not guarantee improvements in language proficiency, teaching effectiveness, examination performance, student outcomes, professional success, or any other specific result resulting from the use of the Services.</P>
      <P indent>10.6. The Customer acknowledges that educational results depend on numerous factors beyond the Company&rsquo;s control, including individual abilities, experience, effort, teaching methods, learning environments, and external circumstances.</P>
      <P indent>10.7. The Company is not responsible for decisions, actions, omissions, teaching methods, educational activities, business activities, or other conduct undertaken by the Customer based on the Materials or Services.</P>
      <P indent>10.8. To the fullest extent permitted by applicable law, the Company shall not be liable for any indirect, incidental, consequential, special, punitive, exemplary, or similar damages, including loss of profits, loss of revenue, loss of business opportunities, loss of data, loss of goodwill, business interruption, or anticipated savings.</P>
      <P indent>10.9. The Company shall not be liable for any loss, damage, delay, interruption, or inability to access the Services resulting from internet failures, telecommunications issues, software defects, hardware failures, cybersecurity incidents, actions of third-party service providers, payment processors, hosting providers, governmental actions, or circumstances beyond the Company&rsquo;s reasonable control.</P>
      <P indent>10.10. The Company shall not be liable for unauthorized access to the Customer&rsquo;s Account resulting from the Customer&rsquo;s failure to maintain the confidentiality of Personal Access Credentials.</P>
      <P indent>10.11. The Company shall not be liable for the acts, omissions, products, services, content, or conduct of third parties, including payment processors, hosting providers, software vendors, communication providers, and other external service providers.</P>
      <P indent>10.12. To the fullest extent permitted by applicable law, the Company&rsquo;s total aggregate liability arising out of or relating to the Services, the Platform, the Materials, or these Terms shall not exceed the total amount actually paid by the Customer to the Company during the twelve (12) months immediately preceding the event giving rise to the claim.</P>
      <P indent>10.13. If the applicable law does not permit the limitation described in Clause 10.12, the Company&rsquo;s liability shall be limited to the maximum extent permitted under such law.</P>
      <P indent>10.14. Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law, including liability for fraud, fraudulent misrepresentation, wilful misconduct, or any other liability that must be preserved under mandatory consumer protection legislation.</P>
      <P indent>10.15. The Customer acknowledges that the pricing of the Services reflects the allocation of risks set forth in these Terms and that the limitations of liability contained herein constitute an essential basis of the agreement between the parties.</P>

      <SectionTitle>11. SUSPENSION AND TERMINATION</SectionTitle>
      <P indent>11.1. The Customer may stop using the Services at any time and may cancel any automatically renewing Subscription in accordance with the procedures made available through the Platform or payment management tools.</P>
      <P indent>11.2. Cancellation of a Subscription shall prevent future renewal charges but shall not affect the Customer&rsquo;s right to access the Services during any already paid Subscription Period unless otherwise provided in these Terms.</P>
      <P indent>11.3. The Company may suspend access immediately where it reasonably believes that continued access may result in harm to the Platform, the Services, the Company&rsquo;s intellectual property rights, other users, or third parties.</P>
      <P indent>11.4. In cases of material or repeated violations of these Terms, the Company may permanently terminate the Customer&rsquo;s access to the Services without prior notice.</P>
      <P indent>11.5. Where access is suspended or terminated due to the Customer&rsquo;s violation of these Terms, the Customer shall not be entitled to any refund, compensation, credit, extension of Subscription Period, or other remedy, except where required by applicable law.</P>
      <P indent>11.6. Upon termination or expiration of a Subscription, the Customer&rsquo;s right to access and use the Services and Materials shall automatically cease, except to the extent access is otherwise required by applicable law.</P>
      <P indent>11.7. Termination of these Terms shall not affect any rights, obligations, liabilities, claims, remedies, or causes of action that accrued prior to the date of termination.</P>
      <P indent>11.8. The Company reserves the right to discontinue providing the Services to any Customer where continued provision would create legal, regulatory, operational, security, reputational, or commercial risks for the Company.</P>
      <P indent>11.9. Any provisions of these Terms which by their nature should survive termination, including without limitation provisions relating to intellectual property rights, payment obligations, disclaimers, limitations of liability, dispute resolution, governing law, and enforcement rights, shall remain in full force and effect following termination.</P>

      <SectionTitle>12. PRIVACY AND DATA PROTECTION</SectionTitle>
      <P indent>12.1. The Company processes personal data in accordance with its Privacy Policy, which forms an integral part of these Terms and is available on the Platform.</P>
      <P indent>12.2. By accessing or using the Services, the Customer acknowledges that the Company may collect, use, store, disclose, and otherwise process personal data as described in the Privacy Policy and as necessary for the provision of the Services.</P>
      <P indent>12.3. The Company may process personal data for purposes including account administration, subscription management, payment processing, customer support, service delivery, security monitoring, fraud prevention, legal compliance, and other legitimate business purposes described in the Privacy Policy.</P>
      <P indent>12.4. The Customer is responsible for ensuring that any personal data provided to the Company is accurate, complete, and up to date.</P>
      <P indent>12.5. The Company may engage third-party service providers, including payment processors, hosting providers, cloud service providers, communication providers, analytics providers, and other contractors, where reasonably necessary for the operation of the Services.</P>
      <P indent>12.6. Where personal data is transferred to third-party service providers or across jurisdictions, the Company shall implement measures required by applicable data protection laws to the extent such measures are legally required.</P>
      <P indent>12.7. Customers located in jurisdictions that provide statutory privacy rights may exercise such rights in accordance with applicable law and the procedures described in the Privacy Policy.</P>
      <P indent>12.8. The Customer may contact the Company regarding privacy-related matters using the contact information provided in these Terms or in the Privacy Policy.</P>
      <P indent>12.9. Nothing in these Terms shall be interpreted as limiting, excluding, or restricting any rights granted to data subjects under mandatory data protection laws applicable to the processing of personal data.</P>
      <P indent>12.10. In the event of any inconsistency between these Terms and the Privacy Policy with respect to the processing of personal data, the Privacy Policy shall prevail to the extent of such inconsistency.</P>

      <SectionTitle>13. GOVERNING LAW, COMPLAINTS AND DISPUTE RESOLUTION</SectionTitle>
      <P indent>13.1. The Customer may submit questions, complaints, requests, or other communications regarding the Services using the contact details provided in these Terms.</P>
      <P indent>13.2. The Company shall use reasonable efforts to review and respond to customer inquiries within a reasonable period of time, taking into account the nature and complexity of the request.</P>
      <P indent>13.3. Before initiating formal legal proceedings, the parties agree to attempt to resolve any dispute, claim, or disagreement through good-faith negotiations.</P>
      <P indent>13.4. Any complaint should contain sufficient information to identify the Customer, the relevant Subscription or transaction, and the nature of the issue being raised.</P>
      <P indent>13.5. These Terms and any non-contractual obligations arising out of or relating to them shall be governed by and interpreted in accordance with the laws of the Russian Federation, without regard to conflict of law principles.</P>
      <P indent>13.6. If the Customer is a consumer residing in a jurisdiction whose mandatory consumer protection laws provide a higher level of protection than the law specified in Clause 13.5, nothing in these Terms shall deprive the Customer of such mandatory rights and protections.</P>
      <P indent>13.7. To the fullest extent permitted by applicable law, any dispute arising out of or relating to the Services, the Platform, the Materials, or these Terms shall be subject to the exclusive jurisdiction of the competent courts of the Russian Federation.</P>
      <P indent>13.8. Where mandatory consumer protection laws grant the Customer the right to bring claims before the courts of the Customer&rsquo;s place of residence, nothing in these Terms shall restrict or exclude such rights.</P>
      <P indent>13.9. The Company and the Customer agree that any claim shall be brought only in the individual capacity of the claimant and not as a plaintiff, claimant, representative, or member of any collective, representative, or class action to the extent such limitation is permitted under applicable law.</P>
      <P indent>13.10. If any provision of this Section is found unenforceable under applicable law, the remaining provisions shall remain in full force and effect to the maximum extent permitted by law.</P>

      <SectionTitle>14. GENERAL PROVISIONS</SectionTitle>
      <P indent>14.1. The Company reserves the right to modify, update, amend, or replace these Terms at any time. The updated version shall become effective upon publication on the Platform unless a later effective date is specified.</P>
      <P indent>14.2. Continued access to or use of the Services following the publication of updated Terms constitutes acceptance of the revised Terms.</P>
      <P indent>14.3. If any provision of these Terms is determined by a court or competent authority to be invalid, illegal, unenforceable, or contrary to applicable law, such provision shall be deemed modified to the minimum extent necessary to make it enforceable, and the remaining provisions shall remain in full force and effect.</P>
      <P indent>14.4. These Terms, together with the Privacy Policy, Cookie Policy, and any other documents expressly incorporated by reference, constitute the entire agreement between the Customer and the Company regarding the Services and supersede all prior communications, understandings, negotiations, and agreements relating to the same subject matter.</P>
      <P indent>14.5. The failure or delay of the Company to exercise any right, remedy, power, or privilege under these Terms shall not constitute a waiver of such right, remedy, power, or privilege.</P>
      <P indent>14.6. The Customer may not assign, transfer, delegate, sublicense, or otherwise dispose of any rights or obligations under these Terms without the prior written consent of the Company.</P>
      <P indent>14.7. The Company may assign, transfer, delegate, subcontract, or otherwise dispose of its rights and obligations under these Terms without the Customer&rsquo;s consent, provided that such transfer does not materially reduce the Customer&rsquo;s rights under these Terms.</P>
      <P indent>14.8. The Company shall not be liable for any delay or failure to perform its obligations under these Terms where such delay or failure results from circumstances beyond its reasonable control, including natural disasters, acts of government, war, terrorism, civil unrest, labor disputes, epidemics, pandemics, interruptions of telecommunications networks, failures of hosting providers, cybersecurity incidents, or other force majeure events.</P>
      <P indent>14.9. The Customer and the Company are independent contracting parties. Nothing in these Terms shall be construed as creating a partnership, joint venture, agency, employment relationship, fiduciary relationship, or other similar legal relationship between the parties.</P>
      <P indent>14.10. Headings are included for convenience only and shall not affect the interpretation of these Terms.</P>
      <P indent>14.11. These Terms may be executed, accepted, and maintained in electronic form and shall have the same legal force and effect as a written agreement.</P>
      <P indent>14.12. These Terms are drafted in the English language. Any translation provided for convenience only shall not have legal effect unless expressly stated otherwise by the Company.</P>

      <SectionTitle>15. CONTACT INFORMATION</SectionTitle>
      <P indent>15.1. The Services are provided by:</P>
      <P indent>
        Individual Entrepreneur Ekaterina Borisovna Lobasenko
        <br />
        INN: 420553023451
        <br />
        OGRNIP: 324547600006209
      </P>
      <P indent>15.2. Customers may contact the Company regarding the Services, Subscriptions, payments, technical support, complaints, legal notices, privacy matters, or other inquiries using the following contact details:</P>
      <P indent>
        Email: double2easy@gmail.com
        <br />
        Website: https://www.2easyeng.com
      </P>
      <P indent>15.3. Unless otherwise required by applicable law, electronic communications sent to the contact details provided by the Customer shall be deemed received on the date of transmission.</P>
      <P indent>15.4. The Customer is responsible for ensuring that the contact information associated with their Account remains accurate, complete, and up to date.</P>
      <P indent>15.5. The Company may use email, in-platform notifications, or other electronic means to communicate information relating to the Services, Subscriptions, payments, security matters, legal notices, amendments to these Terms, and other matters related to the contractual relationship between the parties.</P>
      <P indent>15.6. The Customer agrees that electronic communications satisfy any legal requirement that such communications be made in writing, to the extent permitted by applicable law.</P>
    </>
  );
}
