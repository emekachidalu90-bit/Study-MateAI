/**
 * Centralized streak logic. Every place that logs the user in
 * (email/password login, OAuth login, even just opening the app
 * if you want) MUST call this instead of re-implementing the
 * date math inline — that's what caused the "stuck at day 1" bug:
 * three different copies of similar-but-subtly-wrong logic in
 * auth.js (login) and passport.js (OAuth), which disagreed on
 * date formats and edge cases.
 *
 * Uses calendar-day comparison in UTC (not toDateString(), which
 * is locale/timezone dependent and was part of the original bug —
 * a user logging in at 11pm one timezone and 1am the next in
 * another could get inconsistent "yesterday" comparisons).
 */

function todayUTC() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA + "T00:00:00Z");
  const b = new Date(dateStrB + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

/**
 * Call this every time a user successfully logs in (any method).
 * Mutates the user object in place and returns it.
 *
 * Rules:
 *  - First ever login: streak = 1
 *  - Same day as last login: streak unchanged (no double-counting)
 *  - Exactly 1 day after last login: streak + 1
 *  - More than 1 day gap: streak resets to 1
 */
function applyLoginStreak(user) {
  const today = todayUTC();

  if (!user.last_login_date) {
    // Very first login ever
    user.streak = 1;
    user.last_login_date = today;
    return user;
  }

  if (user.last_login_date === today) {
    // Already logged in today — don't change anything
    return user;
  }

  const gap = daysBetween(user.last_login_date, today);

  if (gap === 1) {
    user.streak = (user.streak || 0) + 1;
  } else if (gap > 1) {
    user.streak = 1;
  }
  // gap < 1 shouldn't happen (clock skew) — leave streak untouched

  user.last_login_date = today;
  return user;
}

module.exports = { applyLoginStreak, todayUTC, daysBetween };
