import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { TextField } from "../ui/Field";
import { adminApi } from "../../api/services";
import { ApiError, errorMessage } from "../../api/client";
import type { AdminUser } from "../../types/api";

interface MemberModalProps {
  member: AdminUser;
  onClose: () => void;
  onSaved: () => void;
}

export function EditMemberModal({ member, onClose, onSaved }: MemberModalProps) {
  const [name, setName] = useState(member.name);
  const [email, setEmail] = useState(member.email);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Name should be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email address";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await adminApi.updateUser(member.id, { name: name.trim(), email: email.trim() });
      toast.success(`Updated ${name.trim()}`);
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Edit member"
      onClose={onClose}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="member-form" loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="member-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <TextField label="Full name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          hint="They will sign in with this address from now on."
        />
      </form>
    </Modal>
  );
}

export function ResetPasswordModal({ member, onClose, onSaved }: MemberModalProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (password.length < 8) nextErrors.newPassword = "Use at least 8 characters";
    else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))
      nextErrors.newPassword = "Mix in at least one letter and one number";
    if (confirm !== password) nextErrors.confirm = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const { message } = await adminApi.resetPassword(member.id, password);
      toast.success(message);
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title="Reset password"
      onClose={onClose}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="reset-form" loading={saving}>
            Set new password
          </Button>
        </>
      }
    >
      <form id="reset-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <p className="confirm__message">
          Give <strong>{member.name}</strong> a temporary password and share it with them privately. They can change it
          in Settings after signing in.
        </p>
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.newPassword}
          hint="8+ characters with a number"
        />
        <TextField
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={errors.confirm}
        />
      </form>
    </Modal>
  );
}