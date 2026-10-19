import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthLayout } from "./AuthLayout";
import { TextField } from "../../components/ui/Field";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../hooks/useAuth";
import { homePathFor } from "../../context/authContextValue";
import { ApiError, errorMessage } from "../../api/client";

interface LocationState {
  from?: string;
}

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!email.trim()) nextErrors.email = "Enter your email";
    if (!password) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const user = await signIn({ email, password });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      const from = (location.state as LocationState | null)?.from;
      navigate(from ?? homePathFor(user), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      setFormError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      intro="Sign in to pick up your planner where you left it."
      footer={
        <p>
          New to Retain? <Link to="/register">Create an account</Link>
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
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Button type="submit" block loading={submitting}>
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}