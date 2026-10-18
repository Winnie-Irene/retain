import { PageHeader } from "../components/ui/PageHeader";
import { MonthTag } from "../components/ui/MonthTag";
import { useMonthParam } from "../hooks/useMonthParam";

export function BudgetPage() {
  const [month, setMonth] = useMonthParam();

  return (
    <PageHeader
      title="Budget"
      subtitle="Decide what this month can carry, then let Retain tell you when you are getting close."
      aside={<MonthTag month={month} onChange={setMonth} />}
    />
  );
}