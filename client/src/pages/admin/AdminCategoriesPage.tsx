import { useState, type FormEvent } from "react";
import { Lock, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { Sheet } from "../../components/ui/Sheet";
import { Button, IconButton } from "../../components/ui/Button";
import { TextField } from "../../components/ui/Field";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState, ErrorNote, LoadingLines } from "../../components/ui/Bits";
import { useCategories } from "../../hooks/useCategories";
import { useRemote } from "../../hooks/useRemote";
import { adminApi, categoryApi } from "../../api/services";
import { ApiError, errorMessage } from "../../api/client";
import { CATEGORY_SWATCHES } from "../../utils/constants";
import { formatMoney, formatNumber } from "../../utils/format";
import type { Category } from "../../types/models";

interface EditorProps {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

function CategoryEditor({ category, onClose, onSaved }: EditorProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState(category?.color ?? CATEGORY_SWATCHES[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const locked = Boolean(category?.isDefault);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!locked && name.trim().length < 2) {
      setErrors({ name: "Category name should be at least 2 characters" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      if (category) {
        await categoryApi.update(category.id, locked ? { color } : { name: name.trim(), color });
        toast.success(`Updated ${locked ? category.name : name.trim()}`);
      } else {
        await categoryApi.create({ name: name.trim(), color });
        toast.success(`Created ${name.trim()}`);
      }
      onSaved();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(Object.keys(error.fieldErrors).length > 0 ? error.fieldErrors : { name: error.message });
      } else {
        toast.error(errorMessage(error));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={category ? "Edit category" : "New category"}
      onClose={onClose}
      width="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={saving}>
            {category ? "Save changes" : "Create category"}
          </Button>
        </>
      }
    >
      <form id="category-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <TextField
          label="Name"
          value={name}
          maxLength={40}
          placeholder="e.g. Airtime & Data"
          disabled={locked}
          hint={locked ? "The default category keeps its name so reassigned expenses always have a home." : undefined}
          onChange={(event) => setName(event.target.value)}
          error={errors.name}
        />
        <fieldset className="swatches">
          <legend className="field__label">Colour</legend>
          <div className="swatches__grid">
            {CATEGORY_SWATCHES.map((swatch) => (
              <button
                type="button"
                key={swatch}
                className={`swatch ${swatch.toLowerCase() === color.toLowerCase() ? "is-active" : ""}`}
                style={{ background: swatch }}
                aria-label={`Use colour ${swatch}`}
                aria-pressed={swatch.toLowerCase() === color.toLowerCase()}
                onClick={() => setColor(swatch)}
              />
            ))}
            <label className="swatch swatch--custom" style={{ background: color }} title="Pick a custom colour">
              <span className="sr-only">Pick a custom colour</span>
              <input type="color" value={color} onChange={(event) => setColor(event.target.value.toUpperCase())} />
            </label>
          </div>
          {errors.color && <p className="field__message field__message--error">{errors.color}</p>}
        </fieldset>
        <div className="category-preview">
          <span className="cat-tag__dot" style={{ background: color }} aria-hidden="true" />
          <span>{(locked ? category?.name : name.trim()) || "Your category"}</span>
        </div>
      </form>
    </Modal>
  );
}

export function AdminCategoriesPage() {
  const { categories, refresh, error, loading } = useCategories();
  const usage = useRemote(() => adminApi.insights(), "usage");
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [removing, setRemoving] = useState(false);

  const stats = new Map((usage.data?.spendingByCategory ?? []).map((item) => [item.category.id, item]));
  const defaultCategory = categories.find((category) => category.isDefault);

  const afterChange = () => {
    void refresh();
    usage.reload();
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setRemoving(true);
    try {
      const result = await categoryApi.remove(deleting.id);
      toast.success(result.message);
      setDeleting(null);
      afterChange();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setRemoving(false);
    }
  };

  const deletingCount = deleting ? (stats.get(deleting.id)?.count ?? 0) : 0;

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="The labels everyone picks from when they record an expense."
        aside={
          <Button icon={<Plus size={18} />} onClick={() => setEditing(null)}>
            New category
          </Button>
        }
      />

      <Sheet flush>
        {error && (
          <div className="sheet__notice">
            <ErrorNote message={error} onRetry={() => void refresh()} />
          </div>
        )}
        {loading && categories.length === 0 && (
          <div className="sheet__notice">
            <LoadingLines rows={6} />
          </div>
        )}
        {!loading && categories.length === 0 && !error && (
          <EmptyState
            title="No categories"
            message="Create the first category so people can start sorting their expenses."
          />
        )}
        {categories.length > 0 && (
          <div className="ledger-wrap">
            <table className="ledger ledger--categories">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="is-number">Expenses</th>
                  <th className="is-number">Total value</th>
                  <th className="ledger__actions-head">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const stat = stats.get(category.id);
                  return (
                    <tr key={category.id}>
                      <td data-label="Category">
                        <span className="cat-row">
                          <span className="cat-row__swatch" style={{ background: category.color }} aria-hidden="true" />
                          <span>
                            {category.name}
                            {category.isDefault && (
                              <small className="cat-row__note">
                                <Lock size={12} /> default fallback
                              </small>
                            )}
                          </span>
                        </span>
                      </td>
                      <td data-label="Expenses" className="is-number">
                        {stat ? formatNumber(stat.count) : usage.loading ? "..." : "0"}
                      </td>
                      <td data-label="Total value" className="is-number">
                        {stat ? formatMoney(stat.total) : usage.loading ? "..." : formatMoney(0)}
                      </td>
                      <td className="ledger__actions">
                        <IconButton label={`Edit ${category.name}`} onClick={() => setEditing(category)}>
                          <Pencil size={16} />
                        </IconButton>
                        {!category.isDefault && (
                          <IconButton
                            label={`Delete ${category.name}`}
                            tone="danger"
                            onClick={() => setDeleting(category)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Sheet>

      {editing !== undefined && (
        <CategoryEditor category={editing} onClose={() => setEditing(undefined)} onSaved={afterChange} />
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete category?"
        message={
          deleting && (
            <p>
              <strong>{deleting.name}</strong> will be removed.{" "}
              {deletingCount > 0
                ? `Its ${formatNumber(deletingCount)} expense${deletingCount === 1 ? "" : "s"} will move to ${defaultCategory?.name ?? "Uncategorized"}, so nobody loses their records.`
                : "No expenses use it yet."}
            </p>
          )
        }
        confirmLabel="Delete category"
        loading={removing}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}