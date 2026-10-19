import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { TextField } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { ApiError, errorMessage } from "../../api/client";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.name.trim().length < 2) errors.name = "Tell us your name";
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = "Enter a valid email address";
  if (form.password.length < 8) errors.password = "Use at least 8 characters";
  else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
    errors.password = "Mix in at least one letter and one number";
  if (form.confirm !== form.password) errors.confirm = "Passwords do not match";
  return errors;
}

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof FormState) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await signUp({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast.success(`Your planner is ready, ${user.name.split(" ")[0]}`);
      navigate("/budget", { replace: true, state: { firstVisit: true } });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Start your planner"
      intro="Create an account to track what you spend and keep your month on budget."
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="form-alert" role="alert">
            {formError}
          </p>
        )}
        <TextField
          label="Full name"
          autoComplete="name"
          value={form.name}
          onChange={(event) => update("name")(event.target.value)}
          error={errors.name}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => update("email")(event.target.value)}
          error={errors.email}
        />
        <div className="form-row">
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(event) => update("password")(event.target.value)}
            error={errors.password}
            hint="8+ characters with a number"
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => update("confirm")(event.target.value)}
            error={errors.confirm}
          />
        </div>
        <Button type="submit" block loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}