import { Link } from "react-router-dom";
import { LegalLayout } from "./LegalLayout";

export function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Use"
      updated="19 October 2026"
      intro={
        <p>
          Retain is a small personal budgeting planner that I built as a student project. These terms are written in
          plain words on purpose. By creating an account you agree to them, so please give them a quick read.
        </p>
      }
    >
      <section>
        <h2>1. What Retain is</h2>
        <p>
          Retain helps you record what you spend, set a budget for each month, and save towards goals. It is a planning
          tool. It does not hold, move or invest any real money, and it is not financial advice. Every number you see
          comes from what you type in.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <ul>
          <li>You need to be at least 16 years old to create an account.</li>
          <li>Use your real name and an email address you can reach.</li>
          <li>Keep your password to yourself. You are responsible for anything done with your account.</li>
          <li>One person per account, please. Sharing logins makes your numbers less useful.</li>
        </ul>
      </section>

      <section>
        <h2>3. Your data stays yours</h2>
        <p>
          The expenses, budgets, savings goals and profile picture you add belong to you. You give Retain permission to
          store them and show them back to you so the app can work. You can edit or delete any record at any time, and
          you can delete your whole account from Settings. How your data is handled is explained in the{" "}
          <Link to="/privacy">Privacy Policy</Link>.
        </p>
      </section>

      <section>
        <h2>4. Fair use</h2>
        <p>Please do not:</p>
        <ul>
          <li>try to get into another person's account or data,</li>
          <li>upload pictures that are offensive, hateful or not yours to share,</li>
          <li>flood the service with automated requests or try to break it on purpose,</li>
          <li>use Retain for anything illegal.</li>
        </ul>
        <p>Accounts that do these things may be suspended or removed.</p>
      </section>

      <section>
        <h2>5. Admins</h2>
        <p>
          A small number of admin accounts look after the shared expense categories and see platform totals so they
          can keep things tidy. If an admin removes a category you used, your expenses move to Uncategorized. Nothing
          of yours is deleted.
        </p>
      </section>

      <section>
        <h2>6. Availability</h2>
        <p>
          Retain runs on free hosting. It can be slow to wake up after a quiet spell, and it may sometimes be down for
          maintenance. I do my best to keep it running and your data safe, but I cannot promise it will always be
          available, so keep your own copy of anything important.
        </p>
      </section>

      <section>
        <h2>7. No guarantees</h2>
        <p>
          Retain is provided as it is. The totals, warnings and suggestions are only as accurate as the information you
          enter, and they are there to help you think, not to decide for you. As far as the law allows, I am not
          responsible for decisions made using the app.
        </p>
      </section>

      <section>
        <h2>8. Changes to these terms</h2>
        <p>
          If these terms change in a way that matters, the date at the top will change and the new version will be
          posted here. Using Retain after that means you accept the update.
        </p>
      </section>

      <section>
        <h2>9. Contact</h2>
        <p>
          Questions, worries or ideas are always welcome at{" "}
          <a href="mailto:i.winnie@alustudent.com">i.winnie@alustudent.com</a>.
        </p>
      </section>
    </LegalLayout>
  );
}