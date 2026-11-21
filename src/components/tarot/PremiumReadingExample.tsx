import { useLanguage } from "@/i18n";
import { SUBSCRIPTION_PLANS } from "@/lib/pricingConfig";

const copy = {
  he: {
    offer: "₪ לחודש · 3 פתיחות טארוט ביום · 5 התאמות זוגיות מלאות בחודש",
    benefit: "שאלת המשך אחת על אותם קלפים בכל פתיחה.",
    link: "דוגמה לקריאת טארוט מלאה", question: "איך לקדם השבוע פרויקט יצירתי משותף?",
    sections: [
      ["תשובה קצרה", "כדאי לבחור רעיון אחד וליצור יחד דוגמה קטנה עד סוף השבוע. לפני שמתחילים, תנו לכל אחד לבחור איזה חלק ירצה להוביל."],
      ["שלושת הקלפים", "שלושה מטבעות, בעמדת ההשפעה הנסתרת, מזכיר שיש בקבוצה כישורים שעוד לא קיבלו מקום. שני מטות, בעמדת ההווה, מצביע על רגע הבחירה בין שני כיוונים מסקרנים. אס המטות, בעמדת הכיוון האפשרי, מזמין אתכם לנסות אחד מהם בקנה מידה קטן."],
      ["הקשר בין הקלפים", "שלושה מטבעות מתחיל במפגש בין אנשים, ושני מטות מכניס למפגש הזה החלטה. אס המטות נותן לה מבחן פשוט. אם מדובר בסרטון, למשל, צילום של סצנה אחת ילמד אתכם על העבודה המשותפת יותר מעוד ערב של תכנון."],
      ["המסר הרגשי", "ייתכן שההתלבטות נובעת מהרצון שכל קול יישמע. הזמינו גם את מי ששותק להגיד איזה רעיון היה רוצה לנסות. לפעמים דווקא שם נמצאת ההצעה שחסרה לשאר הקבוצה."],
      ["המסר הרוחני", "בפריסה הזאת יצירה היא דרך להיפגש. המקום שתפנו לרעיון של אדם אחר עשוי לשנות גם את האופן שבו אתם רואים את הרעיון שלכם."],
      ["צעד מעשי", "קבעו פגישה קצרה, בחרו תוצר שאפשר לסיים בשעה וחלקו תפקידים. בסופה שאלו איזה חלק עורר סקרנות ומה הייתם רוצים לנסות בפעם הבאה."],
      ["מסר לסיום", "מותר לניסיון הראשון להיות קטן וקצת מחוספס. אם בסוף השבוע יש משהו שאפשר להראות זה לזה, כבר יש לכם בסיס להמשיך ממנו."]
    ]
  },
  en: {
    offer: "₪ per month · 3 tarot readings a day · 5 full compatibility readings a month",
    benefit: "One follow-up question about the same cards with each spread.",
    link: "See a complete sample reading", question: "How can we move our creative project forward this week?",
    sections: [
      ["Short answer", "Choose one idea and make a small prototype together by Friday. First, let each person choose a part to lead."],
      ["Your three cards", "The Three of Pentacles reveals a skill the group has overlooked. The Two of Wands places you between two promising directions. The Ace of Wands suggests testing one while your enthusiasm is fresh."],
      ["How they connect", "Collaboration leads to a choice and then to an experiment. If you are making a film, shooting one scene will tell you how you work together."],
      ["Emotional insight", "The hesitation may come from wanting everyone to feel heard. Invite the quietest person to choose something to try."],
      ["Spiritual insight", "Creating together is a way of listening. Someone else’s idea might change what you see in your own."],
      ["Practical guidance", "Choose something you can finish in an hour, divide the roles, and agree on when to look at it together."],
      ["Closing thought", "The prototype can be rough. By Friday you will have something real to discuss."]
    ]
  },
  ru: {
    offer: "₪ в месяц · 3 расклада Таро в день · 5 полных разборов совместимости в месяц",
    benefit: "Один дополнительный вопрос по тем же картам в каждом раскладе.",
    link: "Посмотреть полный пример расклада", question: "Как продвинуть общий творческий проект на этой неделе?",
    sections: [
      ["Короткий ответ", "Выберите одну идею и сделайте небольшой эскиз к пятнице. Пусть каждый возьмёт на себя ту часть, которая ему интересна."],
      ["Три карты", "Тройка пентаклей указывает на незамеченное умение одного из участников. Двойка жезлов отражает выбор между двумя направлениями. Туз жезлов советует испытать одно из них, пока идея увлекает всех."],
      ["Связь карт", "Совместная работа подводит к выбору, а выбор ведёт к опыту. Если вы снимаете фильм, начните с одной сцены."],
      ["Чувства", "Возможно, решение откладывается из желания услышать каждого. Спросите человека, который пока молчит, что ему хотелось бы попробовать."],
      ["Внутренний смысл", "Общее творчество учит слушать. Чужая мысль может открыть новую сторону вашей собственной идеи."],
      ["Практический шаг", "Выберите задачу на час, распределите роли и договоритесь, когда посмотрите на результат вместе."],
      ["Напутствие", "Первому эскизу позволено быть несовершенным. К пятнице появится конкретная основа для разговора."]
    ]
  },
  ar: {
    offer: "₪ شهريًا · ٣ قراءات تاروت يوميًا · ٥ قراءات توافق كاملة شهريًا",
    benefit: "سؤال متابعة واحد عن البطاقات نفسها مع كل قراءة.",
    link: "اطّلع على مثال لقراءة كاملة", question: "كيف ندفع مشروعنا الإبداعي المشترك إلى الأمام هذا الأسبوع؟",
    sections: [
      ["الجواب المختصر", "اختاروا فكرة واحدة واصنعوا نموذجًا صغيرًا معًا قبل نهاية الأسبوع. دعوا كل شخص يختار الجزء الذي يودّ أن يتولاه."],
      ["البطاقات الثلاث", "تشير ثلاثة الدنانير إلى مهارة في الفريق لم تأخذ حقها. وتعكس عصوان الحيرة بين اتجاهين واعدين. أما آس العصي فيدعوكم إلى تجربة أحدهما ما دام الحماس حاضرًا."],
      ["الصلة بين البطاقات", "يقود التعاون إلى اختيار، والاختيار إلى تجربة. إن كان مشروعكم فيلمًا، فإن تصوير مشهد واحد سيكشف الكثير عن طريقتكم في العمل معًا."],
      ["الجانب العاطفي", "قد يأتي التردد من حرصكم على سماع الجميع. اسألوا الشخص الأقل كلامًا عن الفكرة التي يود تجربتها."],
      ["المعنى الروحي", "الإبداع المشترك فرصة للإنصات. حين تفسحون المجال لفكرة شخص آخر قد ترون فكرتكم من زاوية جديدة."],
      ["خطوة عملية", "اختاروا مهمة تنتهي في ساعة، ووزعوا الأدوار، وحددوا موعدًا لمشاهدة النتيجة معًا."],
      ["كلمة أخيرة", "يمكن أن يكون النموذج الأول بسيطًا. حين ترونه أمامكم، يصبح الحديث عن الخطوة التالية أسهل."]
    ]
  }
};

export default function PremiumReadingExample() {
  const { language } = useLanguage();
  const c = copy[language];
  return <section className="mb-5 rounded-xl border border-gold/30 bg-background p-4 text-start text-foreground">
    <p className="font-heading text-gold">{SUBSCRIPTION_PLANS.pro.monthlyPriceILS} {c.offer}</p>
    <p className="mt-2 text-sm">{c.benefit}</p>
    <details className="mt-3">
      <summary className="cursor-pointer py-2 font-medium text-gold underline underline-offset-4">{c.link}</summary>
      <article className="space-y-4 pt-3 leading-relaxed">
        <p className="font-heading text-lg">{c.question}</p>
        {c.sections.map(([title, body]) => <section key={title}><h4 className="font-heading text-gold">{title}</h4><p>{body}</p></section>)}
      </article>
    </details>
  </section>;
}

