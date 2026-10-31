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
  signature: "— Yours Nerdy",

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
      "You're always yourself. I love that about you.",
      "You appreciate whatever I do for you, even the small things.",
      "Your real laugh, the loud one.",
      "Your feedback is honest, in black and white, even when the truth is hard.",
      "You're my vitamin. One \"love you\" or \"my man\" from you makes my whole day.",
      "You let me rest on your chest when I'm down.",
    ],
  },

  loveTest: { title: "Love test", sub: "How compatible are we?", names: ["Ye Pyae", "May Thu"], result: "A perfect match. 100%, no doubt.",
    // shown as scattered chips under the result
    common: ["Black color", "Spicy sour steamed fish", "Green papaya salad", "Hotpot", "Mala Xiang Guo", "Talking straight", "Quality time", "and so much more"] },

  // Background music, starts on her first tap. Put a file in public/audio/ (audio: "audio/winter.mp3") or use a YouTube link.

  bgm: { audio: "", youtube: "tQpbXAmRMqA", title: "Winter music", volume: 0.35 },


  songs: {
    title: "Songs that remind me of you",
    sub: "Our playlist, in order",
    list: [
      // { title: "Song name", artist: "Artist", youtube: "VIDEO_ID_OR_LINK" }  or  audio: "songs/file.mp3"  (tap to play)
      { title: "Perfect", artist: "Ed Sheeran", youtube: "2Vv-BfVoq4g" },
      { title: "All of Me", artist: "John Legend", youtube: "450p7goxZqg" },
      { title: "Can't Help Falling in Love", artist: "Elvis Presley", youtube: "vGJTaP6anOU" },
    ],
  },

  moon: { title: "The moon on our first day", sub: "National Girlfriend Day, the day we got together." },

  // Hidden surprises. Edit the texts freely.
  eggs: {
    moonText: "You were under this one.",                                  // tap the moon on the skyline
    billboard: "Famous on the Yangon skyline.",                            // tap the billboard
    cats: "I love you more than my life ❤️",                               // tap 5 different cats
    heart: "Every piece of this heart is a day with you.",                 // press and hold the heart
    nerdy: "You found it. Still yours, still nerdy ❤️",                    // type "nerdy" or tap the signature 3 times
    days: "Day 1 was National Girlfriend Day. Every day since has been better.",   // tap "N days together" 3 times  (PLACEHOLDER: write your own)
    night: "It's late. Sleep well, I'm thinking of you.",                  // opened between midnight and 5am
    month: "Another month with you. Thank you.",                           // opened on the 1st of a month
    confess: "The day I told you how I felt. Scratch the card to remember it.",   // opened on 21 February
  },

  note: {
    title: "Happy 3 months",
    text: "It started on National Girlfriend Day. I would pick it again, every time.",
  },
};
