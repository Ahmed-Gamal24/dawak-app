import { loadDownloadCount } from "./counter.js";

const screens = {
  today: {
    kicker: "خطوة واحدة في كل مرة",
    title: ["افتح يومك.", "اعرف جرعتك الجاية."],
    description:
      "موعد الدواء واضح، وتسجيل التناول بنقرة. مفيش داعي تراجع كل الروشتات عشان تعرف عليك إيه النهارده.",
    points: [
      "عرض مواعيد جرعاتك",
      "تسجيل أخذ الدواء بسهولة",
      "تذكيرات تختارها بنفسك",
    ],
    alt: "شاشة النهارده في دواك ببيانات توضيحية",
  },
  prescriptions: {
    kicker: "ارجع لروشتتك، مش لذاكرتك",
    title: ["روشتاتك مترتبة.", "وتفاصيلها واضحة."],
    description:
      "اسم الطبيب وتخصصه وتاريخ الروشتة والتشخيص والأدوية. كل روشتة لها تفاصيلها، وخيارات تذكير ومشاركة تختارها بنفسك.",
    points: [
      "اسم الطبيب وتخصصه على الروشتة",
      "تحويل الأدوية لتذكيرات باختيارك",
      "تصدير الروشتة ومشاركتها PDF",
    ],
    alt: "شاشة الروشتات مع اسم الطبيب وتخصصه وتشخيص توضيحي",
  },
  discover: {
    kicker: "ابدأ بالتخصص، واختار المكان",
    title: ["طبيب قريب.", "ومعلومات قبل الزيارة."],
    description:
      "ابحث بين العيادات المنشورة على المنصة، من غير ما تحتاج مشاركة سجلك مع الطبيب الأول. شوف التخصص والمكان، واختار الأنسب لك.",
    points: [
      "قائمة تخصصات ومحافظات مصر",
      "عرض العيادات في قائمة أو خريطة",
      "موقع العيادة ومواعيدها",
    ],
    alt: "نتائج البحث عن طبيب تعرض تخصص الطبيب وبيانات عيادته التجريبية",
  },
  doctor: {
    kicker: "للطبيب: التفاصيل وقت ما تحتاجها",
    title: ["افهم الصورة.", "وركّز مع مريضك."],
    description:
      "من ملف المريض، راجع الأدوية والسجل العلاجي وتقارير الجرعات المسجّلة. واكتب الدواء ومواعيده في نفس الخطوة.",
    points: [
      "سجل علاجي بعد موافقة المريض",
      "روشتة بأدوية ومواعيد منظمة",
      "ملخص للجرعات وتفاصيل عند الطلب",
    ],
    alt: "ملف المريض للطبيب يعرض ملخص تسجيل الجرعات والأدوية الحالية ببيانات توضيحية",
  },
  caregiver: {
    kicker: "اطمئنان يبدأ بالموافقة",
    title: ["خليك موجود.", "حتى وأنت بعيد."],
    description:
      "اطلب متابعة شخص يهمك، وبعد قبوله هتلاقي ملفه في قائمة مرضاك. افتح الملف عشان تراجع أدويته وروشتاته والجرعات اللي سجّلها.",
    points: [
      "طلب متابعة بموافقة المريض",
      "وصول منظم لملف كل شخص",
      "اطلاع على تقارير الجرعات المسجّلة",
    ],
    alt: "قائمة المرضى في حساب المرافق، تعرض مريضة توضيحية وافقت على المشاركة",
  },
};

const tabs = [...document.querySelectorAll("[data-screen]")];
function selectScreen(tab, focus = false) {
  const key = tab.dataset.screen;
  const screen = screens[key];
  if (!screen) return;
  for (const item of tabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
  }
  document
    .querySelector("#screen-panel")
    .setAttribute("aria-labelledby", tab.id);
  document.querySelector("#screen-kicker").textContent = screen.kicker;
  const title = document.querySelector("#screen-title");
  title.replaceChildren(
    document.createTextNode(screen.title[0]),
    document.createElement("br"),
    document.createTextNode(screen.title[1]),
  );
  document.querySelector("#screen-description").textContent =
    screen.description;
  document.querySelector("#screen-points").replaceChildren(
    ...screen.points.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );
  const image = document.querySelector("#screen-image");
  image.src = `assets/screens/${key}.png`;
  image.alt = screen.alt;
  if (focus) tab.focus({ preventScroll: true });
  tab.scrollIntoView({
    block: "nearest",
    inline: "nearest",
    behavior: "instant",
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectScreen(tab));
  tab.addEventListener("keydown", (event) => {
    // In RTL the next tab is visually to the left.
    const offsets = { ArrowLeft: 1, ArrowRight: -1 };
    let next;
    if (event.key in offsets)
      next = (index + offsets[event.key] + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectScreen(tabs[next], true);
  });
});

document.querySelector("#year").textContent = String(new Date().getFullYear());
let storage;
try {
  storage = window.localStorage;
} catch {
  /* Privacy mode. */
}
const result = await loadDownloadCount({
  storage,
  signal: AbortSignal.timeout(7000),
});
const countElement = document.querySelector("#download-count");
countElement.textContent =
  result.count === null
    ? "—"
    : new Intl.NumberFormat("ar-EG").format(result.count);
const status = document.querySelector("#counter-status");
status.textContent =
  result.state === "unavailable"
    ? "العداد غير متاح مؤقتًا؛ التنزيل متاح كالمعتاد."
    : result.state === "stale"
      ? "آخر عدد محفوظ. مرات تنزيل الملف، وليس عدد التثبيتات."
      : "مرات تنزيل الملف من GitHub؛ ليست عدد أشخاص أو تثبيتات.";
