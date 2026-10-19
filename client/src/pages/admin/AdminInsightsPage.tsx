import { Link } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { Sheet } from "../../components/ui/Sheet";
import { Button } from "../../components/ui/Button";
import { CategoryTag, ErrorNote, LoadingLines } from "../../components/ui/Bits";
import { CategoryDonut } from "../../components/charts/CategoryDonut";
import { MeterBars } from "../../components/charts/MeterBars";
import { TrendBars } from "../../components/charts/TrendBars";
import { useRemote } from "../../hooks/useRemote";
import { adminApi } from "../../api/services";
import { formatDate, formatMoney, formatNumber, initials, monthName, timeAgo } from "../../utils/format";
import type { CategoryBreakdown } from "../../types/models";

function usageItems(list: CategoryBreakdown[]) {
  return list.map((item) => ({
    key: item.category.id,
    label: item.category.name,
    value: item.count,
    color: item.category.color,
    meta: formatMoney(item.total, "RWF", true),
  }));
}

export function AdminInsightsPage() {
  const { data, loading, error, reload } = useRemote(() => adminApi.insights(), "insights");

  return (
    <>
      <PageHeader
        title="Platform Insights"
        subtitle={
          data
            ? `Everything happening across Retain, with ${monthName(data.month)} highlighted.`
            : "Everything happening across Retain."
        }
        aside={
          <Button variant="soft" onClick={reload} loading={loading && Boolean(data)}>
            Refresh
          </Button>
        }
      />

      {error && <ErrorNote message={error} onRetry={reload} />}
      {!data && loading && (
        <Sheet>
          <LoadingLines rows={8} />
        </Sheet>
      )}

      {data && (
        <div className="dash">
          <section className="figures" aria-label="Platform totals">
            <div className="figure">
              <span className="figure__label">Registered users</span>
              <strong className="figure__value num">{formatNumber(data.totals.users)}</strong>
              <span className="figure__meta num">
                {data.totals.admins} admin{data.totals.admins === 1 ? "" : "s"} included
              </span>
            </div>
            <div className="figure">
              <span className="figure__label">Expenses recorded</span>
              <strong className="figure__value num">{formatNumber(data.totals.expenses)}</strong>
              <span className="figure__meta">all time</span>
            </div>
            <div className="figure">
              <span className="figure__label">Total value recorded</span>
              <strong className="figure__value num">
                {formatMoney(data.totals.value, "RWF", data.totals.value >= 10_000_000)}
              </strong>
              <span className="figure__meta">all time</span>
            </div>
            <div className="figure">
              <span className="figure__label">Expenses this month</span>
              <strong className="figure__value num">{formatNumber(data.totals.expensesThisMonth)}</strong>
              <span className="figure__meta num">worth {formatMoney(data.totals.valueThisMonth)}</span>
            </div>
          </section>

          <div className="admin-grid">
            <Sheet
              title="Spending by Category"
              caption="All recorded expenses, every user"
              className="admin-grid__donut"
            >
              <CategoryDonut
                data={data.spendingByCategory.filter((item) => item.total > 0)}
                total={data.totals.value}
                caption="recorded"
              />
            </Sheet>

            <Sheet title="Six Month Trend" caption="Value of expenses recorded per month" className="admin-grid__trend">
              <TrendBars data={data.monthlyTrend} />
            </Sheet>
            <Sheet title="Most Used" caption="Top 5 categories by number of expenses" className="admin-grid__top">
              <MeterBars
                items={usageItems(data.topCategories)}
                valueFormatter={(value) => `${formatNumber(value)} uses`}
              />
            </Sheet>

            <Sheet
              title="Least Used"
              caption="Bottom 5, a hint at what could be merged or renamed"
              className="admin-grid__bottom"
            >
              <MeterBars
                items={usageItems(data.bottomCategories)}
                valueFormatter={(value) => `${formatNumber(value)} uses`}
              />
              <Link to="/admin/categories" className="link-btn admin-grid__manage">
                Manage categories
              </Link>
            </Sheet>

            <Sheet title="New Members" className="admin-grid__users">
              <ul className="people">
                {data.recentUsers.map((member) => (
                  <li key={member.id}>
                    <span className={`avatar ${member.role === "admin" ? "avatar--admin" : ""}`} aria-hidden="true">
                      {initials(member.name)}
                    </span>
                    <div className="people__who">
                      <p>
                        {member.name}
                        {member.role === "admin" && <span className="people__badge">admin</span>}
                      </p>
                      <small>{member.email}</small>
                    </div>
                    <small className="people__when">{timeAgo(member.createdAt)}</small>
                  </li>
                ))}
              </ul>
            </Sheet>
            <Sheet title="Recently Added" flush className="admin-grid__recent">
              <div className="ledger-wrap">
                <table className="ledger">
                  <thead>
                    <tr>
                      <th>Added</th>
                      <th>Expense</th>
                      <th>By</th>
                      <th>Category</th>
                      <th className="is-number">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentExpenses.map((expense) => (
                      <tr key={expense.id}>
                        <td data-label="Added" className="ledger__date">
                          {timeAgo(expense.createdAt)}
                        </td>
                        <td data-label="Expense" className="ledger__title">
                          <span>{expense.title}</span>
                          <small>Dated {formatDate(expense.date)}</small>
                        </td>
                        <td data-label="By">{expense.owner?.name ?? "Deleted user"}</td>
                        <td data-label="Category">
                          <CategoryTag category={expense.category} />
                        </td>
                        <td data-label="Amount" className="is-number">
                          {formatMoney(expense.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Sheet>
          </div>
        </div>
      )}
    </>
  );
}