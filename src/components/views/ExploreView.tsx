import { useState } from "react";
import {
  Play, FileText, Presentation, Map, Mic,
  Star, Eye, Heart, Clock, TrendingUp,
  BookOpen, Zap, Search, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────
type ContentType = "all" | "video" | "pdf" | "slides" | "map" | "podcast";

interface Creator {
  name: string;
  avatar: string; // initials
  color: string;
}

interface ExploreItem {
  id: string;
  title: string;
  description: string;
  type: Exclude<ContentType, "all">;
  subject: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  rating: number;
  creator: Creator;
  tags: string[];
  featured?: boolean;
}

// ── Sample data ────────────────────────────────────────────
const ITEMS: ExploreItem[] = [
  {
    id: "1",
    title: "Calculus Made Easy — Limits & Derivatives",
    description: "Master the foundations of calculus with step-by-step visual explanations and interactive examples.",
    type: "video",
    subject: "Mathematics",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=340&fit=crop",
    duration: "42 min",
    views: 12400,
    likes: 980,
    rating: 4.9,
    creator: { name: "Dr. Anaya Patel", avatar: "AP", color: "#8b5cf6" },
    tags: ["Calculus", "Derivatives", "Math"],
    featured: true,
  },
  {
    id: "2",
    title: "World War II — Complete Visual Timeline",
    description: "An illustrated PDF covering every major campaign, battle, and turning point of WWII.",
    type: "pdf",
    subject: "History",
    thumbnail: "https://images.unsplash.com/photo-1461360370896-922624d12a74?w=600&h=340&fit=crop",
    duration: "68 pages",
    views: 8720,
    likes: 743,
    rating: 4.7,
    creator: { name: "HistoryBuff", avatar: "HB", color: "#ef4444" },
    tags: ["History", "WWII", "Timeline"],
    featured: true,
  },
  {
    id: "3",
    title: "Cell Division: Mitosis & Meiosis Explained",
    description: "Animated walkthrough of cell division phases with 3D diagrams and quiz checkpoints.",
    type: "video",
    subject: "Biology",
    thumbnail: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600&h=340&fit=crop",
    duration: "28 min",
    views: 19300,
    likes: 1540,
    rating: 4.8,
    creator: { name: "SciSimplified", avatar: "SS", color: "#10b981" },
    tags: ["Biology", "Cells", "Science"],
  },
  {
    id: "4",
    title: "Physics Formulas — Complete Cheat Sheet Deck",
    description: "50 slide presentation covering all essential physics formulas for NEET, JEE, and AP Physics.",
    type: "slides",
    subject: "Physics",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=340&fit=crop",
    duration: "50 slides",
    views: 22100,
    likes: 2100,
    rating: 4.9,
    creator: { name: "PhysicsGeek", avatar: "PG", color: "#f59e0b" },
    tags: ["Physics", "Formulas", "JEE"],
  },
  {
    id: "5",
    title: "Psychology 101 — Mind & Behaviour",
    description: "Comprehensive mind map covering core psychology theories, researchers, and experiments.",
    type: "map",
    subject: "Psychology",
    thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop",
    duration: "Mind Map",
    views: 6890,
    likes: 571,
    rating: 4.6,
    creator: { name: "MindMatters", avatar: "MM", color: "#ec4899" },
    tags: ["Psychology", "Mind Map", "Behaviour"],
  },
  {
    id: "6",
    title: "Organic Chemistry Reactions Podcast Series",
    description: "A 10-episode audio series breaking down functional groups, reaction mechanisms, and lab tips.",
    type: "podcast",
    subject: "Chemistry",
    thumbnail: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=340&fit=crop",
    duration: "10 episodes",
    views: 4320,
    likes: 389,
    rating: 4.5,
    creator: { name: "ChemKing", avatar: "CK", color: "#3b82f6" },
    tags: ["Chemistry", "Organic", "Audio"],
  },
  {
    id: "7",
    title: "Indian Constitution — Article-by-Article Notes",
    description: "Structured PDF notes on every Article of the Indian Constitution — ideal for UPSC prep.",
    type: "pdf",
    subject: "Civics",
    thumbnail: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=340&fit=crop",
    duration: "120 pages",
    views: 9450,
    likes: 880,
    rating: 4.8,
    creator: { name: "CivilsAce", avatar: "CA", color: "#f97316" },
    tags: ["UPSC", "Civics", "Law"],
  },
  {
    id: "8",
    title: "Machine Learning — Concept Map",
    description: "A beautifully structured visual map of all core ML algorithms, from regression to neural nets.",
    type: "map",
    subject: "Computer Science",
    thumbnail: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&h=340&fit=crop",
    duration: "Mind Map",
    views: 31200,
    likes: 3400,
    rating: 5.0,
    creator: { name: "MLNerd", avatar: "ML", color: "#6366f1" },
    tags: ["ML", "AI", "CS"],
    featured: true,
  },
  {
    id: "9",
    title: "Shakespeare's Hamlet — Act-by-Act Breakdown",
    description: "Video lecture series on Hamlet — themes, characters, and literary devices explained clearly.",
    type: "video",
    subject: "Literature",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop",
    duration: "55 min",
    views: 5670,
    likes: 441,
    rating: 4.6,
    creator: { name: "LitLover", avatar: "LL", color: "#84cc16" },
    tags: ["Literature", "Shakespeare", "English"],
  },
  {
    id: "10",
    title: "Macroeconomics — Slide Deck for Beginners",
    description: "60-slide beginner-friendly introduction to GDP, inflation, monetary policy, and trade.",
    type: "slides",
    subject: "Economics",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=340&fit=crop",
    duration: "60 slides",
    views: 7800,
    likes: 612,
    rating: 4.7,
    creator: { name: "EconWiz", avatar: "EW", color: "#0ea5e9" },
    tags: ["Economics", "Macroeconomics", "Finance"],
  },
  {
    id: "11",
    title: "Human Anatomy Podcast — Systems Deep Dive",
    description: "12 episodes exploring the skeletal, muscular, nervous, and cardiovascular systems.",
    type: "podcast",
    subject: "Biology",
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=340&fit=crop",
    duration: "12 episodes",
    views: 3910,
    likes: 287,
    rating: 4.4,
    creator: { name: "BodyWorks", avatar: "BW", color: "#14b8a6" },
    tags: ["Anatomy", "Biology", "Health"],
  },
  {
    id: "12",
    title: "Linear Algebra — Vectors, Matrices & Transforms",
    description: "Clean, concise slides on linear algebra for engineering, data science, and math students.",
    type: "slides",
    subject: "Mathematics",
    thumbnail: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=600&h=340&fit=crop",
    duration: "45 slides",
    views: 11300,
    likes: 1020,
    rating: 4.8,
    creator: { name: "MathPro", avatar: "MP", color: "#a855f7" },
    tags: ["Math", "Linear Algebra", "Engineering"],
  },
];

// ── Helpers ────────────────────────────────────────────────
const TYPE_META: Record<Exclude<ContentType, "all">, { icon: typeof Play; label: string; color: string; bg: string }> = {
  video:   { icon: Play,         label: "Video",   color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
  pdf:     { icon: FileText,     label: "PDF",     color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  slides:  { icon: Presentation, label: "Slides",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)"  },
  map:     { icon: Map,          label: "Map",     color: "#6366f1", bg: "rgba(99,102,241,0.12)"  },
  podcast: { icon: Mic,          label: "Podcast", color: "#ec4899", bg: "rgba(236,72,153,0.12)"  },
};

const FILTERS: { id: ContentType; label: string; icon?: typeof Play }[] = [
  { id: "all",     label: "All"      },
  { id: "video",   label: "Videos",   icon: Play         },
  { id: "pdf",     label: "PDFs",     icon: FileText     },
  { id: "slides",  label: "Slides",   icon: Presentation },
  { id: "map",     label: "Maps",     icon: Map          },
  { id: "podcast", label: "Podcasts", icon: Mic          },
];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

const NEU_BG  = "hsl(var(--neu-bg))";
const CARD_SH = "8px 8px 18px hsl(var(--neu-shadow-dark)), -6px -6px 14px hsl(var(--neu-shadow-light))";
const PILL_SH = "4px 4px 8px hsl(var(--neu-shadow-dark)), -4px -4px 8px hsl(var(--neu-shadow-light))";

// ── Sub-components ────────────────────────────────────────

function TypeBadge({ type }: { type: Exclude<ContentType, "all"> }) {
  const { icon: Icon, label, color, bg } = TYPE_META[type];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ color, background: bg }}
    >
      <Icon className="h-2.5 w-2.5" />
      {label}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
      {rating.toFixed(1)}
    </span>
  );
}

function CreatorAvatar({ creator }: { creator: Creator }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: creator.color }}
    >
      {creator.avatar}
    </span>
  );
}

// Featured hero card (big landscape)
function FeaturedCard({ item }: { item: ExploreItem }) {
  const [liked, setLiked]   = useState(false);
  const meta = TYPE_META[item.type];

  return (
    <div
      className="group relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1"
      style={{ background: NEU_BG, boxShadow: CARD_SH }}
    >
      <div className="relative aspect-[16/7] overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />

        {/* Top badges */}
        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">⭐ Featured</span>
          <TypeBadge type={item.type} />
        </div>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-xs font-medium text-white/70 mb-1">{item.subject}</p>
          <h3 className="text-xl font-black text-white mb-1 leading-tight">{item.title}</h3>
          <p className="text-sm text-white/70 line-clamp-1">{item.description}</p>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreatorAvatar creator={item.creator} />
              <span className="text-xs text-white/80">{item.creator.name}</span>
              <StarRating rating={item.rating} />
            </div>
            <div className="flex items-center gap-4 text-white/70 text-xs">
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{fmt(item.views)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{item.duration}</span>
              <button
                onClick={() => setLiked(v => !v)}
                className={cn("flex items-center gap-1 transition-colors", liked ? "text-red-400" : "hover:text-red-400")}
              >
                <Heart className={cn("h-3.5 w-3.5", liked && "fill-red-400")} />
                {fmt(item.likes + (liked ? 1 : 0))}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Standard card
function ContentCard({ item }: { item: ExploreItem }) {
  const [liked, setLiked] = useState(false);

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
      style={{ background: NEU_BG, boxShadow: CARD_SH }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)" }} />
        <div className="absolute left-3 top-3">
          <TypeBadge type={item.type} />
        </div>
        <div className="absolute bottom-2 right-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm font-medium">
          {item.duration}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold text-ink-faint uppercase tracking-wider mb-1">{item.subject}</p>
        <h3 className="text-sm font-bold text-ink leading-snug line-clamp-2 mb-1.5 group-hover:text-spark transition-colors">
          {item.title}
        </h3>
        <p className="text-[11px] text-ink-light line-clamp-2 mb-3">{item.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.slice(0, 3).map(tag => (
            <span key={tag} className="rounded-md bg-neu-bg-dark px-2 py-0.5 text-[10px] text-ink-faint">
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreatorAvatar creator={item.creator} />
            <div>
              <p className="text-[10px] font-semibold text-ink truncate max-w-[90px]">{item.creator.name}</p>
              <StarRating rating={item.rating} />
            </div>
          </div>
          <div className="flex items-center gap-3 text-ink-faint text-[11px]">
            <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" />{fmt(item.views)}</span>
            <button
              onClick={() => setLiked(v => !v)}
              className={cn("flex items-center gap-0.5 transition-colors", liked ? "text-red-400" : "hover:text-red-400")}
            >
              <Heart className={cn("h-3 w-3", liked && "fill-red-400")} />
              {fmt(item.likes + (liked ? 1 : 0))}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main View ──────────────────────────────────────────────
export function ExploreView() {
  const [filter,  setFilter]  = useState<ContentType>("all");
  const [search,  setSearch]  = useState("");

  const featured = ITEMS.filter(i => i.featured);
  const trending = [...ITEMS].sort((a, b) => b.views - a.views).slice(0, 4);

  const filtered = ITEMS
    .filter(i => filter === "all" || i.type === filter)
    .filter(i =>
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.subject.toLowerCase().includes(search.toLowerCase()) ||
      i.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

  return (
    <div className="h-full overflow-y-auto" style={{ background: NEU_BG }}>
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Hero header ── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-ink flex items-center gap-2">
              <Zap className="h-7 w-7 text-spark" />
              Explore
            </h1>
            <p className="mt-1 text-sm text-ink-light">Discover top-rated study materials from the community</p>
          </div>

          {/* Search */}
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-2.5 w-full sm:w-72"
            style={{ background: NEU_BG, boxShadow: "inset 3px 3px 7px hsl(var(--neu-shadow-dark)), inset -3px -3px 7px hsl(var(--neu-shadow-light))" }}
          >
            <Search className="h-4 w-4 text-ink-faint shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search topics, subjects…"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint outline-none"
            />
          </div>
        </div>

        {/* ── Filter pills ── */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {FILTERS.map(({ id, label, icon: Icon }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={{
                  background: active ? "hsl(var(--spark))" : NEU_BG,
                  color: active ? "#fff" : "hsl(var(--ink-light))",
                  boxShadow: active
                    ? "inset 2px 2px 5px rgba(0,0,0,0.15)"
                    : PILL_SH,
                }}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Featured (only when no filter / search active) ── */}
        {filter === "all" && !search && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-spark fill-spark" />
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Featured</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {featured.map(item => <FeaturedCard key={item.id} item={item} />)}
            </div>
          </section>
        )}

        {/* ── Trending strip (only without filter/search) ── */}
        {filter === "all" && !search && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-spark" />
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">Trending This Week</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trending.map((item, i) => (
                <div
                  key={item.id}
                  className="group flex items-start gap-3 rounded-2xl p-3 cursor-pointer transition-all duration-200"
                  style={{ background: NEU_BG, boxShadow: PILL_SH }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "translateY(0)"}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white"
                    style={{ background: `linear-gradient(135deg, hsl(var(--spark-glow)), hsl(var(--spark)))` }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink line-clamp-2 leading-snug group-hover:text-spark transition-colors">{item.title}</p>
                    <p className="text-[10px] text-ink-faint mt-0.5">{fmt(item.views)} views</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── All / filtered grid ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-spark" />
            <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
              {filter === "all" ? "All Materials" : FILTERS.find(f => f.id === filter)?.label}
              <span className="ml-2 text-ink-faint font-normal normal-case">({filtered.length} items)</span>
            </h2>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center gap-3 text-ink-faint">
              <Filter className="h-10 w-10 opacity-30" />
              <p className="text-sm">No items match your search or filter.</p>
              <button
                onClick={() => { setFilter("all"); setSearch(""); }}
                className="text-xs font-semibold text-spark underline-offset-2 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
