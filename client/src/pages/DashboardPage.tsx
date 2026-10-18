import { useLocation } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { MonthTag } from "../components/ui/MonthTag";
import { useAuth } from "../hooks/useAuth";
import { useMonthParam } from "../hooks/useMonthParam";
import { currentMonthKey, monthName } from "../utils/format";

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [month, setMonth] = useMonthParam();
  const denied = (location.state as { denied?: boolean } | null)?.denied;
  const firstName = user?.name.split(" ")[0] ?? "there";
  const isCurrent = month === currentMonthKey();

  return (
    <>
      <PageHeader
        title="Monthly Budget"
        subtitle={
          isCurrent
            ? `Hi ${firstName}, here is how ${monthName(month)} is going so far.`
            : `Hi ${firstName}, this is how ${monthName(month)} turned out.`
        }
        aside={<MonthTag month={month} onChange={setMonth} allowFuture={false} />}
      />
      {denied && (
        <p className="form-alert page-alert">That area is only for admins, so we brought you back to your planner.</p>
      )}
    </>
  );
}