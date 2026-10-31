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
  togetherNote: "Since National Girlfriend Day, 1 August 2026",             // small line under the live counter

  scratch: {
    tag: "21 February 2026",
    title: "Scratch to see the day I confessed",
    hint: "Use your finger",
    text: "After dance training, you gave me a tour of your university, YTU. We were not a couple yet. That was the day I told you how I felt, and it became my favourite day.",
  },

  reasons: {
    title: "Top 6 reasons I love you",
    sub: "Just the top 6. There are far more than I can list.",
    list: [
      "You are always yourself.",
      "You appreciate whatever I do for you, big or small.",
      "Your real laugh, the loud one.",
      "That you tell me the truth, even when it is hard.",
      "How every ordinary day feels better with you in it.",
      "Letting me rest against your chest when I'm down.",
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

  moon: { title: "The moon on National Girlfriend Day", sub: "" },     // computed from startDate

  note: {
    title: "Happy 3 months",
    text: "It started on National Girlfriend Day. I would pick it again, every time.",
  },
};
