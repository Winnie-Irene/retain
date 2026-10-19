import { useRef, useState, type FormEvent } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../components/ui/PageHeader";
import { Sheet } from "../components/ui/Sheet";
import { Button } from "../components/ui/Button";
import { SelectField, TextField } from "../components/ui/Field";
import { Avatar } from "../components/ui/Avatar";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../hooks/useAuth";
import { profileApi } from "../api/services";
import { ApiError, errorMessage } from "../api/client";
import { ALERT_OPTIONS, LANDING_OPTIONS } from "../utils/constants";
import { formatDate } from "../utils/format";
import { toAvatarDataUrl } from "../utils/image";
import type { LandingPage, User } from "../types/models";

function ProfileSection({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState(user.avatar);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email || avatar !== user.avatar;

  const pickPicture = async (file: File | undefined) => {
    if (!file) return;
    try {
      setAvatar(await toAvatarDataUrl(file));
      setErrors((current) => ({ ...current, avatar: "" }));
    } catch (error) {
      setErrors((current) => ({ ...current, avatar: errorMessage(error) }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (name.trim().length < 2) nextErrors.name = "Name should be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Enter a valid email address";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const { user: updated } = await profileApi.update({ name: name.trim(), email: email.trim(), avatar });
      onSaved(updated);
      toast.success("Profile updated");
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet title="Profile" caption="How you appear in Retain">
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <div className="profile-photo">
          <Avatar name={name || user.name} src={avatar} size={88} className="profile-photo__avatar" />
          <div className="profile-photo__actions">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => {
                void pickPicture(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
            <Button type="button" variant="soft" icon={<Camera size={16} />} onClick={() => fileRef.current?.click()}>
              {avatar ? "Change photo" : "Upload photo"}
            </Button>
            {avatar && (
              <button type="button" className="link-btn" onClick={() => setAvatar("")}>
                Remove photo
              </button>
            )}
            <p className="field__message">
              {errors.avatar ? (
                <span className="field__message--error">{errors.avatar}</span>
              ) : (
                "PNG, JPG or WEBP. We crop it into a circle."
              )}
            </p>
          </div>
        </div>

        <div className="form-row">
          <TextField
            label="Full name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            error={errors.name}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={errors.email}
          />
        </div>

        <div className="settings-actions">
          <Button type="submit" loading={saving} disabled={!changed}>
            Save profile
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function PreferencesSection({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const [alertAt, setAlertAt] = useState(String(user.preferences.alertAt));
  const [landingPage, setLandingPage] = useState<LandingPage>(user.preferences.landingPage);
  const [saving, setSaving] = useState(false);
  const isAdmin = user.role === "admin";

  const changed = Number(alertAt) !== user.preferences.alertAt || landingPage !== user.preferences.landingPage;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await profileApi.preferences({ alertAt: Number(alertAt), landingPage });
      onSaved(updated);
      toast.success("Preferences saved");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet title="Preferences" caption="Small things that make Retain feel like yours">
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <SelectField
          label="Warn me that I am close to my budget"
          value={alertAt}
          onChange={(event) => setAlertAt(event.target.value)}
          options={ALERT_OPTIONS}
          hint="The budget meter turns amber and the status changes to approaching at this point."
        />
        <SelectField
          label="Open Retain on"
          value={landingPage}
          onChange={(event) => setLandingPage(event.target.value as LandingPage)}
          options={LANDING_OPTIONS}
          disabled={isAdmin}
          hint={isAdmin ? "Admins always start on Insights." : "The page you land on after signing in."}
        />
        <div className="settings-actions">
          <Button type="submit" loading={saving} disabled={!changed}>
            Save preferences
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function PasswordSection() {
  const empty = { currentPassword: "", newPassword: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const update = (field: keyof typeof empty) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!form.currentPassword) nextErrors.currentPassword = "Enter your current password";
    if (form.newPassword.length < 8) nextErrors.newPassword = "Use at least 8 characters";
    else if (!/[A-Za-z]/.test(form.newPassword) || !/[0-9]/.test(form.newPassword))
      nextErrors.newPassword = "Mix in at least one letter and one number";
    if (form.confirm !== form.newPassword) nextErrors.confirm = "Passwords do not match";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await profileApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      setForm(empty);
      toast.success("Password changed. Use the new one next time you sign in.");
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors);
      toast.error(errorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet title="Password" caption="Change it any time you like">
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={form.currentPassword}
          onChange={(event) => update("currentPassword")(event.target.value)}
          error={errors.currentPassword}
        />
        <div className="form-row">
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={(event) => update("newPassword")(event.target.value)}
            error={errors.newPassword}
            hint="8+ characters with a number"
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => update("confirm")(event.target.value)}
            error={errors.confirm}
          />
        </div>
        <div className="settings-actions">
          <Button type="submit" loading={saving}>
            Change password
          </Button>
        </div>
      </form>
    </Sheet>
  );
}

function DangerSection({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setOpen(false);
    setPassword("");
    setError(undefined);
  };

  const confirm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password) {
      setError("Enter your password to confirm");
      return;
    }
    setDeleting(true);
    try {
      await profileApi.remove(password);
      toast.success("Your account and everything in it has been deleted");
      onDeleted();
    } catch (caught) {
      setError(caught instanceof ApiError ? (caught.fieldErrors.password ?? caught.message) : errorMessage(caught));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Sheet title="Delete Account" className="danger-zone">
      <p className="muted">
        This removes your profile, every expense, every budget and every savings goal. It cannot be undone.
      </p>
      <div className="settings-actions settings-actions--start">
        <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => setOpen(true)}>
          Delete my account
        </Button>
      </div>

      <Modal
        open={open}
        title="Delete account?"
        onClose={close}
        width="sm"
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={deleting}>
              Keep my account
            </Button>
            <Button type="submit" form="delete-account-form" variant="danger" loading={deleting}>
              Delete for good
            </Button>
          </>
        }
      >
        <form id="delete-account-form" className="form-grid" onSubmit={confirm} noValidate>
          <p className="confirm__message">
            Everything you have recorded in Retain will be <strong>permanently deleted</strong>. Enter your password to
            confirm it is really you.
          </p>
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
          />
        </form>
      </Modal>
    </Sheet>
  );
}

export function SettingsPage() {
  const { user, updateUser, signOut } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle={
          <>
            Signed in as <strong>{user.email}</strong>. Member since {formatDate(user.createdAt, "long")}.
          </>
        }
      />
      <div className="settings-grid">
        <div className="settings-column">
          <ProfileSection key={`${user.name}-${user.email}-${user.avatar.length}`} user={user} onSaved={updateUser} />
          <PreferencesSection
            key={`${user.preferences.alertAt}-${user.preferences.landingPage}`}
            user={user}
            onSaved={updateUser}
          />
        </div>
        <div className="settings-column">
          <PasswordSection />
          {user.role !== "admin" && <DangerSection onDeleted={signOut} />}
        </div>
      </div>
    </>
  );
}