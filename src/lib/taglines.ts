const TAGLINES = [
  "Retail therapy: no refunds issued.",
  "Money talks. Yours just said goodbye.",
  "A receipt is just a diary with less feelings.",
  "You didn't lose money. You bought memories.",
  "Impulse control is a myth. Ask your wallet.",
  "Budgets are just wishes with math.",
  "Your bank account called. It's tired.",
  "Spending money is easy. Watching it leave hurts.",
  "This receipt brought to you by regret.",
  "Save more, they said. Then Fridays happened.",
  "Every rupee spent was a choice. Mostly bad ones.",
  "Wealth is a state of mind. So is denial.",
  "You can't take it with you, so why not now.",
  "Financial discipline: coming soon, probably.",
  "This month's theme: creative accounting.",
  "Not all who wander are lost. Some just overspent.",
  "The best things in life are free. This wasn't one.",
  "Money can't buy happiness, but it bought this.",
  "Frugality is a myth told by rich people.",
  "Somewhere, a savings goal is crying.",
  "You are what you spend. Choose wisely.",
  "A fool and his money are soon shopping.",
  "Rich in spirit, poor in receipts.",
  "The wallet giveth, and the wallet taketh away.",
  "Small purchases, big regrets.",
  "This is fine. The spending is fine.",
  "Future you called. They're not happy.",
  "Every expense tells a story. Most are tragedies.",
  "Money is temporary. So is self-control.",
  "Living paycheck to paycheck, one receipt at a time.",
  "Debt is just future money on a coffee break.",
  "Treat yourself, they said. Repeatedly, apparently.",
  "Your budget has left the chat.",
  "Splurge now, panic later.",
  "This receipt is a cry for help.",
  "Financial freedom starts tomorrow. Definitely.",
  "You spent it. Now it's a memory. Cherish it.",
  "One man's expense is another man's dinner.",
  "The math ain't mathing, but the food was good.",
  "Some call it spending. We call it living.",
  "A rupee saved is a rupee you forgot to spend.",
  "This purchase brought to you by 'why not'.",
  "Money well spent, allegedly.",
  "Behind every receipt is a questionable decision.",
  "Your future self is filing a complaint.",
  "Buy now, regret at leisure.",
  "The wallet remembers everything.",
  "This is not a phase. This is a lifestyle.",
  "Currency is fake. The joy was real, though.",
  "Another day, another dent in the savings.",
];

// Deterministic per calendar day (local time): everyone sees the same line all
// day, and it rotates to the next one at local midnight — no repeats until the
// whole list cycles through.
export function getReceiptTagline(): string {
  const now = new Date();
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber = Math.floor(localMidnight.getTime() / 86_400_000);
  const index = ((dayNumber % TAGLINES.length) + TAGLINES.length) % TAGLINES.length;
  return TAGLINES[index];
}
