import { LegalLayout } from "./LegalLayout";

export function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      updated="19 October 2026"
      intro={
        <p>
          Money is personal, so I want to be clear about what Retain keeps, why it keeps it, and who can see it. The
          short version: Retain only collects what it needs to work, never sells anything, and lets you delete it all.
        </p>
      }
    >
      <section>
        <h2>What Retain collects</h2>
        <ul>
          <li>
            <strong>Account details:</strong> your name, email address and password. The password is scrambled with
            bcrypt before it is saved, so nobody can read it, including me.
          </li>
          <li>
            <strong>Profile picture:</strong> only if you upload one. It is shrunk to a small square before it leaves
            your device.
          </li>
          <li>
            <strong>What you record:</strong> expenses (title, amount, category, date, payment method and notes),
            monthly budgets and savings goals with their history.
          </li>
          <li>
            <strong>Preferences:</strong> your budget warning level and the page you like to open first.
          </li>
          <li>
            <strong>Dates:</strong> when you joined, when you accepted these policies, and when records were created or
            changed.
          </li>
        </ul>
        <p>Retain does not collect your location, contacts, bank details or mobile money PIN, and it never asks for them.</p>
      </section>

      <section>
        <h2>Why it is used</h2>
        <p>
          Only to run the app for you: signing you in, showing your planner, working out totals, warnings and charts,
          and keeping your account secure. There is no advertising and no tracking for marketing.
        </p>
      </section>

      <section>
        <h2>Who can see it</h2>
        <ul>
          <li>
            <strong>You.</strong> Every expense, budget and goal is tied to your account, and the server checks this on
            every request.
          </li>
          <li>
            <strong>Admins.</strong> To look after the platform, admins see totals across all users, spending per
            category, the names and emails of recently joined members, and a short list of recently added expenses
            (title, amount, category and who added it). They cannot see your password and cannot change your records.
          </li>
          <li>
            <strong>Nobody else.</strong> Your data is not sold, rented or shared with anyone.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where it lives</h2>
        <p>
          Data is stored in a MongoDB Atlas database. The app itself is hosted on Render and Vercel. Information travels
          between your browser and the server over HTTPS.
        </p>
      </section>

      <section>
        <h2>Cookies and storage</h2>
        <p>
          Retain does not use cookies. It saves one sign in token in your browser's local storage so you stay signed in.
          Signing out removes it.
        </p>
      </section>

      <section>
        <h2>Keeping or deleting it</h2>
        <p>
          Your data stays for as long as your account exists. You can change your details in Settings at any time. If
          you delete your account, your profile, expenses, budgets and savings goals are removed straight away and
          cannot be recovered.
        </p>
      </section>

      <section>
        <h2>Changes and contact</h2>
        <p>
          If this policy changes, the date at the top will change too. For any privacy question or request, write to{" "}
          <a href="mailto:i.winnie@alustudent.com">i.winnie@alustudent.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}