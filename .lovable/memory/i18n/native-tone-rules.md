---
name: Native Tone Rules per Language
description: Per-language tone rules for UI copy. RU = mystical & poetic; AR = warm poetic MSA; EN = high-converting US copy. Never literal translation between languages.
type: preference
---
UI strings (translation files) are written natively per language, NOT translated literally. Each language has its own rhythm.

- **RU (`ru.ts`)**: Mystical & poetic. Imagery of звёзды/судьба/душа/Вселенная. Use "вы" warmly. Em-dashes and ellipses for breath. Avoid bureaucratic/literal phrasing ("Получите...", "Введите ваше имя"). Prefer evocative verbs: открыть, услышать, прикоснуться, заглянуть.
- **AR (`ar.ts`)**: Warm poetic MSA (فصحى). Singular address ("اكتشف"), not plural commands ("اكتشفوا"). Use rhythmic em-dashes (—) and ellipses (…). Imagery: النجوم تهمس / الكون يحدّثك / كيمياء خفيّة / بوابة. Avoid stiff translation patterns.
- **EN (`en.ts`)**: Base. High-converting, conversational US copy. Already strong — only polish if specific keys feel translated.
- **HE (`he.ts`)**: Source/reference for product semantics — never translate from HE literally into other languages.

When adding new keys, write each language independently from intent — not from EN/HE source.
