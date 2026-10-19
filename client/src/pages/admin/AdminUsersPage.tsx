import { useState } from "react";
import { Ban, KeyRound, Pencil, RotateCcw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/ui/PageHeader";
import { Sheet } from "../../components/ui/Sheet";
import { IconButton } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState, ErrorNote, LoadingLines } from "../../components/ui/Bits";
import { Pagination } from "../../components/ui/Pagination";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EditMemberModal, ResetPasswordModal } from "../../components/admin/MemberModals";
import { useRemote } from "../../hooks/useRemote";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { adminApi } from "../../api/services";
import { errorMessage } from "../../api/client";
import { formatDate, formatMoney, formatNumber, timeAgo } from "../../utils/format";
import type { AdminUser } from "../../types/api";

type StatusFilter = "all" | "active" | "suspended";
type Action = { kind: "edit" | "password" | "suspend" | "delete"; member: AdminUser } | null;

export function AdminUsersPage() {
  const [searchDraft, setSearchDraft] = useState("");
  const search = useDebouncedValue(searchDraft.trim());
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [action, setAction] = useState<Action>(null);
  const [working, setWorking] = useState(false);

  const params = { search, status: status === "all" ? undefined : status, page, limit };
  const { data, loading, error, reload } = useRemote(() => adminApi.users(params), JSON.stringify(params));

  const [lastSearch, setLastSearch] = useState(search);
  if (search !== lastSearch) {
    setLastSearch(search);
    setPage(1);
  }

  const close = () => setAction(null);

  const toggleSuspend = async () => {
    if (!action) return;
    const next = action.member.status === "suspended" ? "active" : "suspended";
    setWorking(true);
    try {
      await adminApi.updateUser(action.member.id, { status: next });
      toast.success(
        next === "suspended" ? `${action.member.name} is suspended` : `${action.member.name} is active again`,
      );
      close();
      reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setWorking(false);
    }
  };

  const remove = async () => {
    if (!action) return;
    setWorking(true);
    try {
      const { message } = await adminApi.deleteUser(action.member.id);
      toast.success(message);
      close();
      if (data && data.items.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (caught) {
      toast.error(errorMessage(caught));
    } finally {
      setWorking(false);
    }
  };

  const filters: { value: StatusFilter; label: string; count?: number }[] = [
    { value: "all", label: "Everyone", count: data?.counts.all },
    { value: "active", label: "Active", count: data?.counts.active },
    { value: "suspended", label: "Suspended", count: data?.counts.suspended },
  ];

  return (
    <>
      <PageHeader
        title="Members"
        subtitle="Look after the people using Retain: fix their details, reset a forgotten password, or pause an account."
      />

      <div className="filters">
        <div className="filters__top">
          <label className="filters__search">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search members</span>
            <input
              type="search"
              placeholder="Search by name or email"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
            {searchDraft && (
              <button type="button" aria-label="Clear search" onClick={() => setSearchDraft("")}>
                <X size={16} />
              </button>
            )}
          </label>
        </div>
        <div className="chips member-filters">
          {filters.map((filter) => (
            <button
              type="button"
              key={filter.value}
              className={`chip chip--plain ${status === filter.value ? "is-active" : ""}`}
              aria-pressed={status === filter.value}
              onClick={() => {
                setStatus(filter.value);
                setPage(1);
              }}
            >
              {filter.label}
              {filter.count !== undefined && <span className="num member-filters__count">{filter.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <Sheet flush className={loading && data ? "is-refreshing" : undefined}>
        {error && (
          <div className="sheet__notice">
            <ErrorNote message={error} onRetry={reload} />
          </div>
        )}
        {!data && loading && (
          <div className="sheet__notice">
            <LoadingLines rows={6} />
          </div>
        )}
        {data && data.items.length === 0 && (
          <EmptyState title="Nobody here" message="No members match this search or filter." />
        )}
        {data && data.items.length > 0 && (
          <>
            <div className="ledger-wrap">
              <table className="ledger ledger--members">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Joined</th>
                    <th>Activity</th>
                    <th>Status</th>
                    <th className="ledger__actions-head">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((member) => {
                    const isAdmin = member.role === "admin";
                    return (
                      <tr key={member.id}>
                        <td data-label="Member">
                          <span className="member">
                            <Avatar name={member.name} src={member.avatar} size={36} />
                            <span className="member__who">
                              <strong>
                                {member.name}
                                {isAdmin && <span className="people__badge">admin</span>}
                              </strong>
                              <small>{member.email}</small>
                            </span>
                          </span>
                        </td>
                        <td data-label="Joined" className="member__muted">
                          {formatDate(member.createdAt, "long")}
                        </td>
                        <td data-label="Activity" className="member__muted">
                          {isAdmin ? (
                            "Manages the platform"
                          ) : (
                            <>
                              <span className="num">
                                {formatNumber(member.expenseCount)} expenses,{" "}
                                {formatMoney(member.expenseTotal, "RWF", true)}
                              </span>
                              <small>
                                {formatNumber(member.goalCount)} savings {member.goalCount === 1 ? "goal" : "goals"}
                                {member.lastActive ? `, last active ${timeAgo(member.lastActive)}` : ""}
                              </small>
                            </>
                          )}
                        </td>
                        <td data-label="Status">
                          <span className={`account-pill account-pill--${member.status}`}>
                            {member.status === "suspended" ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td className="ledger__actions">
                          {!isAdmin && (
                            <>
                              <IconButton
                                label={`Edit ${member.name}`}
                                onClick={() => setAction({ kind: "edit", member })}
                              >
                                <Pencil size={16} />
                              </IconButton>
                              <IconButton
                                label={`Reset password for ${member.name}`}
                                onClick={() => setAction({ kind: "password", member })}
                              >
                                <KeyRound size={16} />
                              </IconButton>
                              <IconButton
                                label={
                                  member.status === "suspended" ? `Reactivate ${member.name}` : `Suspend ${member.name}`
                                }
                                onClick={() => setAction({ kind: "suspend", member })}
                              >
                                {member.status === "suspended" ? <RotateCcw size={16} /> : <Ban size={16} />}
                              </IconButton>
                              <IconButton
                                label={`Delete ${member.name}`}
                                tone="danger"
                                onClick={() => setAction({ kind: "delete", member })}
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              pagination={data.pagination}
              onPageChange={setPage}
              limit={limit}
              onLimitChange={(next) => {
                setLimit(next);
                setPage(1);
              }}
            />
          </>
        )}
      </Sheet>

      {action?.kind === "edit" && <EditMemberModal member={action.member} onClose={close} onSaved={reload} />}
      {action?.kind === "password" && <ResetPasswordModal member={action.member} onClose={close} onSaved={reload} />}

      <ConfirmDialog
        open={action?.kind === "suspend"}
        title={action?.member.status === "suspended" ? "Reactivate account?" : "Suspend account?"}
        message={
          action && (
            <p>
              {action.member.status === "suspended" ? (
                <>
                  <strong>{action.member.name}</strong> will be able to sign in again and everything they recorded is
                  still there.
                </>
              ) : (
                <>
                  <strong>{action.member.name}</strong> will be signed out and cannot sign in until you reactivate the
                  account. Nothing they recorded is deleted.
                </>
              )}
            </p>
          )
        }
        confirmLabel={action?.member.status === "suspended" ? "Reactivate" : "Suspend"}
        loading={working}
        onCancel={close}
        onConfirm={toggleSuspend}
      />

      <ConfirmDialog
        open={action?.kind === "delete"}
        title="Delete member?"
        message={
          action && (
            <p>
              <strong>{action.member.name}</strong> and every expense, budget, savings goal and note they recorded will
              be removed for good. This cannot be undone.
            </p>
          )
        }
        confirmLabel="Delete member"
        loading={working}
        onCancel={close}
        onConfirm={remove}
      />
    </>
  );
}