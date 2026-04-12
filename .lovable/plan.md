

## הבעיה

בשינוי קודם שנעשה כ-"cache busting", הווידאו של הכדור הבדולח בהירו (`cosmic-ball-loop.mp4`) הוחלף בטעות בווידאו של הסצנה האסטרלית (`new-astral-scene-proof.mp4`). זה גורם לאפקט של מפת הלידה להופיע בתוך הכדור בהירו.

## תיקון

החזרת מקור הווידאו בהירו לקובץ המקורי `cosmic-ball-loop.mp4` — בשתי הנקודות ב-`HeroSection.tsx` (מובייל ודסקטופ):

- שורה 367: `src="/videos/new-astral-scene-proof.mp4"` → `src="/videos/cosmic-ball-loop.mp4"`
- שורה 407: `src="/videos/new-astral-scene-proof.mp4"` → `src="/videos/cosmic-ball-loop.mp4"`

שינוי של שורה אחת בכל מקום. אין צורך לגעת בשום קובץ אחר.

