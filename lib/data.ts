export type Anime = {
  slug: string; title: string; titleEn: string; year: number; status: "يعرض الآن" | "مكتمل" | "قريبًا";
  genres: string[]; rating: string; episodes: string; description: string; accent: string; cover: string; featured?: boolean;
};

export const anime: Anime[] = [
  { slug:"blue-ember", title:"جمر أزرق", titleEn:"Blue Ember", year:2026, status:"يعرض الآن", genres:["أكشن","مغامرة","خيال"], rating:"8.8", episodes:"12 حلقة", description:"في مدينة تتوهج فيها السماء بعد الغروب، يكتشف شاب قدرة غامضة تربطه بسرّ قديم يهدد توازن العالم.", accent:"#ed3b53", cover:"linear-gradient(145deg,#25122c,#a62c51 55%,#f2a25c)", featured:true },
  { slug:"paper-moon", title:"قمر من ورق", titleEn:"Paper Moon", year:2025, status:"مكتمل", genres:["دراما","شريحة من الحياة"], rating:"8.4", episodes:"24 حلقة", description:"رسائل لا تصل، ومدينة هادئة، ومجموعة أصدقاء يتعلمون كيف يبدؤون من جديد.", accent:"#d7a6c7", cover:"linear-gradient(145deg,#172a47,#8d91bf 58%,#e8b6a6)" },
  { slug:"zero-hour", title:"ساعة الصفر", titleEn:"Zero Hour", year:2026, status:"يعرض الآن", genres:["خيال علمي","غموض","أكشن"], rating:"9.1", episodes:"10 حلقات", description:"عندما تتوقف الساعات في حي واحد، تبدأ محققة شابة سباقًا لكشف ما حدث قبل أن يختفي الغد.", accent:"#67c6d7", cover:"linear-gradient(145deg,#071d32,#126b83 56%,#b3e2df)" },
  { slug:"garden-of-echoes", title:"حديقة الأصداء", titleEn:"Garden of Echoes", year:2024, status:"مكتمل", genres:["فانتازيا","مغامرة"], rating:"8.6", episodes:"13 حلقة", description:"رحلة عبر حديقة تظهر مرة كل مئة عام، حيث لكل زهرة ذكرى ولكل ذكرى ثمن.", accent:"#8ed6a5", cover:"linear-gradient(145deg,#102c2b,#367b67 55%,#d2c88d)" },
  { slug:"neon-drift", title:"انجراف نيون", titleEn:"Neon Drift", year:2026, status:"قريبًا", genres:["خيال علمي","أكشن"], rating:"—", episodes:"قريبًا", description:"في مدينة مستقبلية لا تنام، يتحدى سائق مبتدئ قوانين السباق والنظام معًا.", accent:"#f08b51", cover:"linear-gradient(145deg,#1a1734,#7b286e 52%,#ff9a55)" },
  { slug:"winter-letter", title:"رسالة الشتاء", titleEn:"Winter Letter", year:2025, status:"مكتمل", genres:["رومانسي","دراما"], rating:"8.2", episodes:"11 حلقة", description:"رسالة مجهولة تغيّر حياة طالبة جامعية وتعيدها إلى حكاية ظنت أنها انتهت.", accent:"#9cc7e8", cover:"linear-gradient(145deg,#182d48,#6c91b6 58%,#d9dce8)" },
  { slug:"iron-orchid", title:"السحلبية الحديدية", titleEn:"Iron Orchid", year:2026, status:"يعرض الآن", genres:["أكشن","فانتازيا"], rating:"8.7", episodes:"8 حلقات", description:"حارسة شابة تحمل سيفًا من معدن نادر تحاول حماية مملكتها من حرب لا يفهمها أحد.", accent:"#dd7779", cover:"linear-gradient(145deg,#2d171e,#9a3949 58%,#d7a16c)" },
  { slug:"tiny-universe", title:"كون صغير", titleEn:"Tiny Universe", year:2025, status:"مكتمل", genres:["كوميديا","شريحة من الحياة"], rating:"8.0", episodes:"20 حلقة", description:"أصدقاء غريبو الأطوار يكتشفون أن أصغر تفاصيل الحياة قد تكون أكبر مغامراتها.", accent:"#f3ce79", cover:"linear-gradient(145deg,#343051,#8274b8 58%,#f2c982)" }
];
export const genres = ["أكشن","مغامرة","دراما","خيال علمي","فانتازيا","غموض","رومانسي","كوميديا"];
export const schedule = [
  {day:"السبت", items:[{time:"18:30",title:"جمر أزرق",episode:"الحلقة 08"},{time:"21:00",title:"ساعة الصفر",episode:"الحلقة 06"}]},
  {day:"الأحد", items:[{time:"19:00",title:"السحلبية الحديدية",episode:"الحلقة 09"}]},
  {day:"الإثنين", items:[{time:"20:30",title:"جمر أزرق",episode:"الحلقة 09"}]},
  {day:"الثلاثاء", items:[{time:"18:00",title:"ساعة الصفر",episode:"الحلقة 07"}]},
  {day:"الأربعاء", items:[{time:"21:30",title:"السحلبية الحديدية",episode:"الحلقة 10"}]}
];
