import { Category } from "../models/Category.js";
import { serializeCategory, type PublicCategory } from "../utils/serializers.js";
import { round } from "./budgetService.js";

export interface CategoryGroupRow {
  _id: unknown;
  total: number;
  count: number;
}

export interface CategoryBreakdown {
  category: PublicCategory;
  total: number;
  count: number;
  share: number;
}

export async function attachCategories(rows: CategoryGroupRow[], includeEmpty = false): Promise<CategoryBreakdown[]> {
  const categories = await Category.find();
  const byId = new Map(rows.map((row) => [String(row._id), row]));
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  const result: CategoryBreakdown[] = [];
  for (const category of categories) {
    const row = byId.get(category._id.toString());
    if (!row && !includeEmpty) continue;
    const total = row?.total ?? 0;
    result.push({
      category: serializeCategory(category),
      total: round(total),
      count: row?.count ?? 0,
      share: grandTotal > 0 ? round((total / grandTotal) * 100) : 0,
    });
  }

  return result.sort((a, b) => b.total - a.total);
}