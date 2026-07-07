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

export function CookiePolicyEn() {
  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <p style={{ textAlign: "center" }}>
        <b>
          <span style={textStyle}>COOKIE POLICY</span>
        </b>
      </p>
      <P indent>Effective Date: July 7, 2026</P>
      <P indent>
        This Cookie Policy (&ldquo;Policy&rdquo;) explains how Individual Entrepreneur Ekaterina
        Borisovna Lobasenko, Tax Identification Number (INN): 420553023451, Primary State
        Registration Number (OGRNIP): 324547600006209 (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
        &ldquo;our&rdquo;, &ldquo;us&rdquo;) uses cookies and similar technologies on the website
        located at https://www.2easyeng.com (the &ldquo;Platform&rdquo;).
      </P>

      <SectionTitle>1. What are Cookies?</SectionTitle>
      <P indent>
        1.1. Cookies are small text files that are stored on your computer or mobile device when you
        visit a website. They are widely used to make websites work more efficiently, as well as to
        provide information to the owners of the site.
      </P>

      <SectionTitle>2. How We Use Cookies</SectionTitle>
      <P indent>2.1. We use cookies to:</P>
      <P indent>2.1.1. Ensure the proper functioning of the Platform;</P>
      <P indent>2.1.2. Remember your preferences and settings;</P>
      <P indent>2.1.3. Analyze how you use the Platform to improve our services;</P>
      <P indent>2.1.4. Provide you with personalized content and advertisements.</P>

      <SectionTitle>3. Types of Cookies We Use</SectionTitle>
      <P indent>
        3.1. <b>Essential Cookies:</b> These are necessary for the Platform to function and cannot be
        switched off in our systems.
      </P>
      <P indent>
        3.2. <b>Performance and Analytics Cookies:</b> These allow us to count visits and traffic
        sources so we can measure and improve the performance of our site.
      </P>
      <P indent>
        3.3. <b>Functional Cookies:</b> These enable the Platform to provide enhanced functionality
        and personalization.
      </P>
      <P indent>
        3.4. <b>Targeting and Advertising Cookies:</b> These may be set through our site by our
        advertising partners to build a profile of your interests and show you relevant adverts on
        other sites.
      </P>

      <SectionTitle>4. Managing Cookies</SectionTitle>
      <P indent>
        4.1. You can manage your cookie preferences through your browser settings. Most browsers allow
        you to refuse to accept cookies and to delete cookies. The methods for doing so vary from
        browser to browser, and from version to version.
      </P>
      <P indent>
        4.2. Please note that blocking all cookies will have a negative impact upon the usability of
        many websites. If you block cookies, you may not be able to use all the features on our
        Platform.
      </P>

      <SectionTitle>5. Changes to This Policy</SectionTitle>
      <P indent>
        5.1. We may update this Policy from time to time to reflect changes in our practices or for
        other operational, legal, or regulatory reasons.
      </P>

      <SectionTitle>6. Contact Us</SectionTitle>
      <P indent>
        6.1. If you have any questions about our use of cookies, please contact us at:
        info@2easyeng.com.
      </P>
      <br />
      <br />
      <br />
      <br />
    </>
  );
}
