/**
 * Privacy Policy page for RITO — adapted from old site, updated for current branding.
 */
export default function PrivacyPolicyPage({ onBack }) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-6 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-600 mb-6">Last updated: March 2026</p>

      <div className="space-y-6 text-sm text-gray-400 leading-relaxed">
        <p>
          RITO operates <span className="text-gray-300">rito.co.in</span>. This page informs website visitors about
          our policies regarding the collection, use, and disclosure of Personal Information. If you choose to use our
          Service, then you agree to the collection and use of information in relation with this policy. The Personal
          Information that we collect is used for providing and improving the Service. We will not use or share your
          information with anyone except as described in this Privacy Policy.
        </p>

        <Section title="Information Collection and Use">
          <p>
            For a better experience while using our Service, we may require you to provide us with certain personally
            identifiable information, including but not limited to your name, phone number, and email address. The
            information that we collect will be used to contact or identify you, and to deliver personalized market
            alerts and insights via WhatsApp and our platform.
          </p>
        </Section>

        <Section title="Log Data">
          <p>
            We want to inform you that whenever you visit our Service, we collect information that your browser sends
            to us that is called Log Data. This Log Data may include information such as your computer's Internet
            Protocol ("IP") address, browser version, pages of our Service that you visit, the time and date of your
            visit, the time spent on those pages, and other statistics.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These
            are sent to your browser from the website that you visit and are stored on your computer's hard drive.
          </p>
          <p className="mt-2">
            Our website uses these "cookies" to collect information and to improve our Service. You have the option to
            either accept or refuse these cookies, and know when a cookie is being sent to your computer. If you choose
            to refuse our cookies, you may not be able to use some portions of our Service.
          </p>
        </Section>

        <Section title="Children's Privacy">
          <p>
            Our Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable
            information from children under 13. In the case we discover that a child under 13 has provided us with
            personal information, we immediately delete this from our servers. If you are a parent or guardian and you
            are aware that your child has provided us with personal information, please contact us so that we will be
            able to take the necessary actions.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We value your trust in providing us your Personal Information, thus we are striving to use commercially
            acceptable means of protecting it. But remember that no method of transmission over the internet, or method
            of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
          </p>
        </Section>

        <Section title="Service Providers">
          <p>
            We may employ third-party companies and individuals for the following reasons: to facilitate our Service, to
            provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our
            Service is used. We want to inform our Service users that these third parties have access to your Personal
            Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated
            not to disclose or use the information for any other purpose.
          </p>
        </Section>

        <Section title="Changes to This Privacy Policy">
          <p>
            We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically
            for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These
            changes are effective immediately after they are posted on this page.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at{' '}
            <a href="mailto:elrond389@gmail.com" className="text-blue-400 hover:underline">
              elrond389@gmail.com
            </a>.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-200 mb-2">{title}</h2>
      {children}
    </div>
  );
}
