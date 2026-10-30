// ✏️ Edit this file to personalise the page.
window.LOVE_CONFIG = {
  title: "Our 3 Months",
  subtitle: "Every piece of this heart is one of our days. Tap one to open it.",
  // The day you got together (YYYY-MM-DD) – drives "Day X together", the live counter and the moon. "" hides them.
  startDate: "2026-08-01",
  // Optional gate so only she sees it, e.g. her birthday "0412". "" = no gate.
  // (Fun, not real security: anyone with the photo URLs can still fetch them.)
  passcode: "",
  passcodeHint: "Hint: a date that matters to us",
  finalTitle: "Happy 3 months, my love ❤️",
  finalMessage:
    "You opened every single day. Thank you for every “love you”, every goodnight and every ordinary day that felt special because of you. Here's to the next 3 months, and the 3 after that.",
  signature: "— Yours",

  // ---- sections under the heart (delete a block to hide that section) ----
  togetherNote: "Since the day we started",             // small line under the live counter

  scratch: {
    tag: "Scratch to reveal",
    title: "Scratch to see my favourite day",
    hint: "Use your finger",
    text: "Replace me with the day you remember best, and why. Keep it short and a little silly.",
  },

  reasons: {
    title: "Things I love about you",
    sub: "The short version. The long one would not fit.",
    list: [
      "Replace me with something only she would recognise.",
      "How you remember the small stuff.",
      "Your real laugh, the loud one.",
      "That you tell me the truth, even when it is hard.",
      "How every ordinary day feels better with you in it.",
      "The way you say goodnight.",
    ],
  },

  wheel: {
    title: "Spin for your gift",
    sub: "Seven things could happen next",
    gifts: ["Breakfast in bed", "Movie night, you pick", "Massage coupon", "Picnic date", "I cook dinner", "Weekend away", "A new book"],
  },

  loveTest: { title: "Love test", sub: "How compatible are we?", names: ["Ye Pyae", "May Thu"], result: "A perfect match. 100%, no doubt." },

  songs: {
    title: "Songs that remind me of you",
    sub: "Our playlist, in order",
    list: [
      // { title: "Song name", artist: "Artist", url: "https://www.youtube.com/watch?v=..." }  (url is optional)
      { title: "Perfect", artist: "Ed Sheeran" },
      { title: "All of Me", artist: "John Legend" },
      { title: "Can't Help Falling in Love", artist: "Elvis Presley" },
    ],
  },

  moon: { title: "The moon the day we started", sub: "" },     // computed from startDate

  note: {
    title: "Happy 3 months",
    text: "I love you more than I did yesterday.",
  },
};
