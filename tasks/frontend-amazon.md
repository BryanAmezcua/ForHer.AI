# Frontend Task: Amazon Badge and Social Proof Display

Read `memory-banks/api-contract.md` first — it defines two new fields the backend will now send: `sourceTag` and `socialProof`.

---

## 1. Add Amazon category color to `src/components/ProfilePill.jsx`

Add a new entry to `CATEGORY_STYLES`:
```js
amazon: { bg: 'rgba(255,153,0,0.12)', text: '#FF9900' },
```
This uses Amazon's brand orange for instant recognition.

---

## 2. Add Amazon badge to `src/components/GiftCard.jsx`

When a product has `sourceTag === 'amazon'`, show an Amazon-branded pill alongside the existing merchant badges. Add it in the pills section:

```jsx
{gift.sourceTag === 'amazon' && (
  <ProfilePill label="Amazon" category="amazon" />
)}
```

---

## 3. Add social proof display to `src/components/GiftCard.jsx`

When `gift.socialProof` exists (e.g., "50+ bought in past month"), render it as subtle text. Place it after the rating and before the pills:

```jsx
{gift.socialProof && (
  <p className="text-[11px] text-warm-gray-light/70 mb-2">
    {gift.socialProof}
  </p>
)}
```

---

## New API fields to consume

| Field | Type | Description |
|-------|------|-------------|
| `sourceTag` | `String\|null` | `"amazon"` or absent. Show Amazon pill when present. |
| `socialProof` | `String\|null` | e.g., `"50+ bought in past month"`. Render as secondary text. |

`merchantBadges` may now include `"Prime"`, `"Best Seller"`, `"Amazon's Choice"` — these render through the existing ProfilePill `merchant` category automatically, no extra work needed.
