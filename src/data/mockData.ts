import type { ArchiveEntry, Category, Expense, Person } from "@/data/types";

export const CURRENT_USER_ID = "ayush";

export const people: Person[] = [
  { id: "ayush", name: "AYUSH" },
  { id: "rohan", name: "ROHAN" },
  { id: "priya", name: "PRIYA" },
];

export const categories: Category[] = [
  { id: "food", name: "FOOD & DINING" },
  { id: "transport", name: "TRANSPORT" },
  { id: "bills", name: "BILLS & UTILITIES" },
  { id: "entertainment", name: "ENTERTAINMENT" },
  { id: "health", name: "HEALTH" },
  { id: "shopping", name: "SHOPPING" },
];

// TEMP: generated filler expenses to verify scroll/sticky-header behaviour
// on a long list. Remove this block (and its spread below) once done testing.
const TEST_ITEM_NAMES = [
  "SNACKS",
  "TAXI",
  "BOOKS",
  "LAUNDRY",
  "GYM",
  "STATIONERY",
  "TEA",
  "PARKING",
  "GAMING",
  "MUSIC APP",
  "VEGETABLES",
  "BAKERY",
  "HAIRCUT",
  "CAR WASH",
  "STREAMING",
  "MAGAZINE",
  "CANDLES",
  "FLOWERS",
  "HARDWARE",
  "PET FOOD",
];

function buildTestExpenses(count: number): Expense[] {
  return Array.from({ length: count }, (_, i) => {
    const payer = people[i % people.length].id;
    const day = String((i % 28) + 1).padStart(2, "0");
    const amount = 50 + ((i * 37) % 950);
    return {
      id: `test-${i + 1}`,
      date: `2026-08-${day}`,
      item: `${TEST_ITEM_NAMES[i % TEST_ITEM_NAMES.length]} ${i + 1}`,
      amount,
      paidBy: payer,
      splitType: "none",
      splits: [{ personId: payer, amount }],
    };
  });
}

export const expensesByMonth: Record<string, Expense[]> = {
  "2026-08": [
    {
      id: "e1",
      date: "2026-08-01",
      item: "GROCERIES",
      amount: 280,
      paidBy: "ayush",
      categoryId: "food",
      splitType: "none",
      splits: [{ personId: "ayush", amount: 280 }],
    },
    {
      id: "e2",
      date: "2026-08-02",
      item: "DINNER",
      amount: 600,
      paidBy: "ayush",
      categoryId: "food",
      splitType: "equal",
      splits: [
        { personId: "ayush", amount: 200 },
        { personId: "rohan", amount: 200 },
        { personId: "priya", amount: 200 },
      ],
    },
    {
      id: "e3",
      date: "2026-08-04",
      item: "NETFLIX",
      amount: 649,
      paidBy: "ayush",
      categoryId: "entertainment",
      splitType: "none",
      splits: [{ personId: "ayush", amount: 649 }],
    },
    {
      id: "e4",
      date: "2026-08-05",
      item: "UBER",
      amount: 280,
      paidBy: "rohan",
      categoryId: "transport",
      splitType: "none",
      splits: [{ personId: "rohan", amount: 280 }],
    },
    {
      id: "e5",
      date: "2026-08-06",
      item: "COFFEE",
      amount: 120,
      paidBy: "priya",
      categoryId: "food",
      splitType: "none",
      splits: [{ personId: "priya", amount: 120 }],
    },
    {
      id: "e6",
      date: "2026-08-07",
      item: "ELECTRICITY BILL PAYMENT",
      amount: 1600,
      paidBy: "ayush",
      categoryId: "bills",
      splitType: "custom",
      splits: [
        { personId: "rohan", amount: 920 },
        { personId: "priya", amount: 680 },
      ],
    },
    {
      id: "e7",
      date: "2026-08-08",
      item: "LUNCH",
      amount: 300,
      paidBy: "rohan",
      categoryId: "food",
      splitType: "none",
      splits: [{ personId: "rohan", amount: 300 }],
    },
    {
      id: "e8",
      date: "2026-08-10",
      item: "PHARMACY",
      amount: 180,
      paidBy: "priya",
      categoryId: "health",
      splitType: "none",
      splits: [{ personId: "priya", amount: 180 }],
    },
    {
      id: "e9",
      date: "2026-08-11",
      item: "WEEKEND MOVIE NIGHT TICKETS FOR GROUP",
      amount: 620,
      paidBy: "rohan",
      categoryId: "entertainment",
      splitType: "none",
      splits: [{ personId: "rohan", amount: 620 }],
    },
    {
      id: "e10",
      date: "2026-08-14",
      item: "SHOPPING",
      amount: 500,
      paidBy: "priya",
      categoryId: "shopping",
      splitType: "none",
      splits: [{ personId: "priya", amount: 500 }],
    },
    ...buildTestExpenses(50),
  ],
};

export const archiveEntries: ArchiveEntry[] = [
  { monthKey: "2026-03", shortLabel: "MAR 2026", total: 16820 },
  { monthKey: "2026-04", shortLabel: "APR 2026", total: 19240 },
  { monthKey: "2026-05", shortLabel: "MAY 2026", total: 22100 },
  { monthKey: "2026-06", shortLabel: "JUN 2026", total: 17850 },
  { monthKey: "2026-07", shortLabel: "JUL 2026", total: 24120 },
];

export const availableMonthKeys = [
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
  "2026-07",
  "2026-08",
];
