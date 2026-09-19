"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CalendarDays, Camera, Check, Compass, Edit3, Film, Heart, Home, Image as ImageIcon, Link2, MapPin, MessageCircle, MoreHorizontal, Paperclip, Plus, RotateCw, Search, Send, Settings2, Share2, SlidersHorizontal, Sparkles, Users, Video, WandSparkles, X } from "lucide-react";
import { readActivity, writeActivity } from "@/lib/activity";
import { filterPosts, safeLink } from "@/lib/feed.mjs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type View = "home" | "communities" | "nearby" | "dating" | "messages";
type ComposerType = "text" | "photo" | "video" | "link";
type FilterName = "Original" | "Glow" | "Mono" | "Noir" | "Warm";
type Post = { id: string; author: string; handle: string; avatar: string; community: string; time: string; text: string; image?: string; video?: string; link?: string; likes: number; comments: number; liked?: boolean; filter?: FilterName; rotation?: number; brightness?: number; saved?: boolean; replies?: { id: string; text: string }[] };

const starterPosts: Post[] = [
  { id: "p1", author: "Maya Chen", handle: "@mayamakes", avatar: "MC", community: "Fort Worth Social", time: "18m", text: "The rooftop supper club finally happened. Twelve strangers, one long table, and no one checked the time. Next one is already on the calendar.", image: "/rooftop-supper.webp", likes: 428, comments: 37 },
  { id: "p2", author: "Jordan Wells", handle: "@jordanshift", avatar: "JW", community: "r/BuildInPublic", time: "1h", text: "What is one feature you removed that made your product noticeably better? We cut the activity dashboard and replaced it with one useful weekly signal.", likes: 192, comments: 84 },
  { id: "p3", author: "Nina Patel", handle: "@ninaoutside", avatar: "NP", community: "DFW Weekends", time: "3h", text: "A practical guide to the Trinity trail loop: where to park, the quietest section, and the coffee stop worth taking the detour for.", link: "https://example.com/trinity-trail-guide", likes: 316, comments: 29 },
];
const communities = [
  { name: "Fort Worth Social", members: "24.8k", note: "Local plans, food, art and people", color: "#ef6b4a" },
  { name: "Build In Public", members: "184k", note: "Share the work, not just the launch", color: "#8b5cf6" },
  { name: "Weekend Trails", members: "61.2k", note: "Routes, reviews and trail meetups", color: "#2f8f68" },
  { name: "Home Cooks DFW", members: "38.4k", note: "Recipes, tables and neighborhood dinners", color: "#db9f3a" },
];
const events = [
  { id: 1, day: "24", month: "SEP", title: "Rooftop supper: fall table", place: "Near Southside · 7:00 PM", going: 38, tone: "coral" },
  { id: 2, day: "27", month: "SEP", title: "Trinity trail morning walk", place: "Panther Island · 8:30 AM", going: 64, tone: "green" },
  { id: 3, day: "02", month: "OCT", title: "Creators without the pitch", place: "Foundry District · 6:00 PM", going: 27, tone: "violet" },
];
const datingProfiles = [
  { name: "Elena", age: 34, distance: "2 miles away", initials: "ER", job: "Architect", bio: "I collect neighborhood restaurants, plan ambitious road trips, and will always order one thing for the table.", interests: ["Live music", "Design", "Hiking"], gradient: "from-[#d8694d] via-[#bd7b66] to-[#463632]" },
  { name: "Marcus", age: 37, distance: "5 miles away", initials: "MJ", job: "Teacher & photographer", bio: "Weekend cyclist, documentary nerd, and firm believer that breakfast is a dinner food.", interests: ["Film", "Cycling", "Coffee"], gradient: "from-[#34666f] via-[#4d7d77] to-[#20383a]" },
  { name: "Samira", age: 32, distance: "7 miles away", initials: "SK", job: "Product designer", bio: "Looking for someone who likes small concerts, big ideas, and wandering into bookstores without a plan.", interests: ["Books", "Concerts", "Travel"], gradient: "from-[#7253a4] via-[#9f668e] to-[#3b2d50]" },
];
const conversations = [
  { id: "c1", name: "Maya Chen", initials: "MC", preview: "I saved you a seat for Friday.", time: "9:42", unread: 2 },
  { id: "c2", name: "DFW Trail Crew", initials: "TC", preview: "Jordan shared a route", time: "8:16", unread: 0 },
  { id: "c3", name: "Elena R.", initials: "ER", preview: "That sounds like a great spot.", time: "Tue", unread: 0 },
];
const initialMessages = [
  { from: "them", text: "Hey! Are you still thinking about the supper club on Friday?", time: "9:39" },
  { from: "me", text: "Definitely. I was going to RSVP after work.", time: "9:40" },
  { from: "them", text: "Perfect — I saved you a seat for Friday.", time: "9:42" },
];
const filters: Record<FilterName, string> = { Original: "none", Glow: "saturate(1.18) contrast(1.04) brightness(1.06)", Mono: "grayscale(1) contrast(1.06)", Noir: "grayscale(1) contrast(1.45) brightness(.82)", Warm: "sepia(.2) saturate(1.25) hue-rotate(-8deg)" };

type PostActions = { save: (id: string) => void; reply: (id: string, text: string) => void };
const PostContext = createContext<PostActions>({ save: () => {}, reply: () => {} });

function Avatar({ initials, size = "md", accent = false }: { initials: string; size?: "sm" | "md" | "lg"; accent?: boolean }) { return <span className={`avatar avatar-${size} ${accent ? "avatar-accent" : ""}`}>{initials}</span> }
function Logo() { return <div className="brand"><span className="brand-mark"><span /><span /><span /></span><span>Threadline</span></div> }

export default function HomePage() {
  const [view, setView] = useState<View>("home");
  const [feedMode, setFeedMode] = useState("for-you");
  const [posts, setPosts] = useState<Post[]>(starterPosts);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerType, setComposerType] = useState<ComposerType>("text");
  const [draft, setDraft] = useState("");
  const [link, setLink] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [filter, setFilter] = useState<FilterName>("Original");
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState([100]);
  const [videoTrim, setVideoTrim] = useState([0, 100]);
  const [videoMuted, setVideoMuted] = useState(false);
  const [joined, setJoined] = useState<string[]>(["Fort Worth Social"]);
  const [rsvps, setRsvps] = useState<number[]>([]);
  const [datingIndex, setDatingIndex] = useState(0);
  const [match, setMatch] = useState(false);
  const [activeConversation, setActiveConversation] = useState("c1");
  const [threads, setThreads] = useState<Record<string, typeof initialMessages>>({ c1: initialMessages, c2: [], c3: [] });
  const messages = threads[activeConversation] ?? [];
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [toast, setToast] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void readActivity<{ joined: string[]; rsvps: number[]; posts: Post[]; threads: Record<string, typeof initialMessages> }>().then(state => {
      if (cancelled) return;
      if (state) {
        if (Array.isArray(state.joined)) setJoined(state.joined);
        if (Array.isArray(state.rsvps)) setRsvps(state.rsvps);
        if (Array.isArray(state.posts)) setPosts(state.posts);
        if (state.threads) setThreads(state.threads);
      }
      setLoaded(true);
    }).catch(() => {
      if (!cancelled) { setStorageError("Device storage is unavailable. Changes will last only for this session."); setLoaded(true); }
    });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(() => {
      void writeActivity({ joined, rsvps, posts, threads }).then(() => setStorageError("")).catch(() => setStorageError("Could not save changes on this device. Storage may be full."));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [loaded, joined, rsvps, posts, threads]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2400); return () => clearTimeout(t) }, [toast]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return; const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({ name: "open_threadline_section", title: "Open Threadline section", description: "Navigate to a primary section of Threadline.", inputSchema: { type: "object", properties: { section: { type: "string", enum: ["home", "communities", "nearby", "dating", "messages"] } }, required: ["section"], additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute: (input: unknown) => { const section = (input as { section: View }).section; setView(section); return { section } } }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  const currentProfile = datingProfiles[datingIndex % datingProfiles.length];
  const currentConversation = conversations.find(c => c.id === activeConversation) ?? conversations[0];
  const recommendations = useMemo(() => filterPosts(posts, feedMode, joined), [feedMode, posts, joined]);
  const notify = (text: string) => setToast(text);
  const toggleLike = (id: string) => setPosts(current => current.map(post => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post));
  const openComposer = (type: ComposerType) => { setComposerType(type); setComposerOpen(true); setMediaUrl(""); setLink(""); setFilter("Original"); setRotation(0); setBrightness([100]) };
  const handleFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return notify("Choose an image or video file.");
    if (file.size > 10 * 1024 * 1024) return notify("Choose a file smaller than 10 MB for device storage.");
    setComposerType(file.type.startsWith("video/") ? "video" : "photo");
    const reader = new FileReader();
    reader.onload = () => setMediaUrl(String(reader.result));
    reader.onerror = () => notify("Could not read that file. Please try another.");
    reader.readAsDataURL(file);
  };
  const publishPost = () => { if (composerType === "link" && !safeLink(link)) return notify("Enter a valid https:// or http:// link."); if (!draft.trim() && !mediaUrl && !link.trim()) return notify("Add something before publishing."); const post: Post = { id: crypto.randomUUID(), author: "Dwayne", handle: "@dwayne", avatar: "DE", community: "Your profile", time: "now", text: draft.trim(), likes: 0, comments: 0, ...(composerType === "photo" && mediaUrl ? { image: mediaUrl, filter, rotation, brightness: brightness[0] } : {}), ...(composerType === "video" && mediaUrl ? { video: mediaUrl } : {}), ...(composerType === "link" && link ? { link: safeLink(link)! } : {}) }; setPosts(current => [post, ...current]); setView("home"); setFeedMode("for-you"); setComposerOpen(false); setDraft(""); setMediaUrl(""); setLink(""); notify("Post added on this device.") };
  const sendMessage = () => { if (!messageDraft.trim()) return; setThreads(current => ({ ...current, [activeConversation]: [...(current[activeConversation] ?? []), { from: "me", text: messageDraft.trim().slice(0, 4000), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }] })); setMessageDraft("") };
  const nextDate = (liked: boolean) => { if (liked && datingIndex === 0) setMatch(true); else { setDatingIndex(i => i + 1); notify(liked ? "Added to your likes." : "Profile passed.") } };
  const mediaFilter = `${filter === "Original" ? "" : filters[filter]} brightness(${brightness[0]}%)`;

  if (!loaded) return <main className="page-frame"><p role="status">Loading your activity…</p></main>;
  return <PostContext.Provider value={{
    save: id => setPosts(current => current.map(post => post.id === id ? { ...post, saved: !post.saved } : post)),
    reply: (id, text) => setPosts(current => current.map(post => post.id === id ? { ...post, comments: post.comments + 1, replies: [...(post.replies ?? []), { id: crypto.randomUUID(), text: text.slice(0, 2000) }] } : post)),
  }}><div className="app-shell">
    <aside className="left-rail"><Logo /><nav aria-label="Primary navigation"><NavButton icon={<Home />} label="Home" active={view === "home"} onClick={() => setView("home")} /><NavButton icon={<Users />} label="Communities" active={view === "communities"} onClick={() => setView("communities")} /><NavButton icon={<MapPin />} label="Nearby" active={view === "nearby"} onClick={() => setView("nearby")} /><NavButton icon={<Heart />} label="Dating" active={view === "dating"} onClick={() => setView("dating")} /><NavButton icon={<MessageCircle />} label="Messages" badge="2" active={view === "messages"} onClick={() => setView("messages")} /></nav><Button className="create-button" onClick={() => openComposer("text")}><Plus /> Create</Button><div className="rail-profile"><Avatar initials="DE" /><div><strong>Dwayne</strong><span>@dwayne</span></div><MoreHorizontal /></div></aside>
    <main className="main-surface"><p className="device-notice">Demo profiles · activity saved on this device · messages are not delivered to other people.</p>{storageError && <p role="alert" className="device-notice">{storageError}</p>}<header className="mobile-header"><Logo /><button aria-label="Notifications"><Bell /></button></header>{view === "home" && <FeedView feedMode={feedMode} setFeedMode={setFeedMode} posts={recommendations} openComposer={openComposer} toggleLike={toggleLike} notify={notify} />}{view === "communities" && <CommunitiesView joined={joined} setJoined={setJoined} notify={notify} />}{view === "nearby" && <NearbyView rsvps={rsvps} setRsvps={setRsvps} notify={notify} />}{view === "dating" && <DatingView profile={currentProfile} nextDate={nextDate} match={match} setMatch={setMatch} onMessage={() => { setView("messages"); setMatch(false) }} />}{view === "messages" && <MessagesView activeConversation={activeConversation} setActiveConversation={setActiveConversation} currentConversation={currentConversation} messages={messages} messageDraft={messageDraft} setMessageDraft={setMessageDraft} sendMessage={sendMessage} />}</main>
    {view === "home" && <RightRail setView={setView} joined={joined} setJoined={setJoined} notify={notify} />}
    <nav className="bottom-nav" aria-label="Mobile navigation"><button className={view === "home" ? "active" : ""} onClick={() => setView("home")}><Home /><span>Home</span></button><button className={view === "communities" ? "active" : ""} onClick={() => setView("communities")}><Users /><span>Groups</span></button><button className="mobile-create" onClick={() => openComposer("text")} aria-label="Create post"><Plus /></button><button className={view === "dating" ? "active" : ""} onClick={() => setView("dating")}><Heart /><span>Dating</span></button><button className={view === "messages" ? "active" : ""} onClick={() => setView("messages")}><MessageCircle /><span>Inbox</span></button></nav>
    <ComposerDialog open={composerOpen} onOpenChange={setComposerOpen} type={composerType} setType={setComposerType} draft={draft} setDraft={setDraft} link={link} setLink={setLink} mediaUrl={mediaUrl} fileRef={fileRef} handleFile={handleFile} filter={filter} setFilter={setFilter} rotation={rotation} setRotation={setRotation} brightness={brightness} setBrightness={setBrightness} videoTrim={videoTrim} setVideoTrim={setVideoTrim} videoMuted={videoMuted} setVideoMuted={setVideoMuted} mediaFilter={mediaFilter} publishPost={publishPost} />
    {toast && <div className="toast" role="status"><Check />{toast}</div>}
  </div></PostContext.Provider>
}

function NavButton({ icon, label, active, badge, onClick }: { icon: React.ReactNode; label: string; active: boolean; badge?: string; onClick: () => void }) { return <button className={`nav-button ${active ? "active" : ""}`} onClick={onClick}>{icon}<span>{label}</span>{badge && <b>{badge}</b>}</button> }

function FeedView({ feedMode, setFeedMode, posts, openComposer, toggleLike, notify }: { feedMode: string; setFeedMode: (mode: string) => void; posts: Post[]; openComposer: (type: ComposerType) => void; toggleLike: (id: string) => void; notify: (text: string) => void }) {
  const [query, setQuery] = useState("");
  const visible = filterPosts(posts, "all", [], query);
  return <div className="feed-page page-frame"><div className="feed-head"><Tabs value={feedMode} onValueChange={setFeedMode}><TabsList variant="line"><TabsTrigger value="for-you">For you</TabsTrigger><TabsTrigger value="following">My groups</TabsTrigger><TabsTrigger value="local">Local</TabsTrigger><TabsTrigger value="saved">Saved</TabsTrigger></TabsList></Tabs><button className="icon-button" aria-label="Feed settings"><SlidersHorizontal /></button></div>
    <label className="wide-search feed-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search posts, people, or communities" aria-label="Search feed" /></label><section className="composer-card"><div className="composer-row"><Avatar initials="DE" accent /><button className="composer-prompt" onClick={() => openComposer("text")}>Share something with your people…</button></div><div className="composer-actions"><button onClick={() => openComposer("photo")}><ImageIcon /> Photo</button><button onClick={() => openComposer("video")}><Video /> Video</button><button onClick={() => openComposer("link")}><Link2 /> Link</button><button onClick={() => openComposer("text")}><Edit3 /> Post</button></div></section>
    <div className="context-line"><Sparkles /> Recommended from your circles and interests</div><div className="post-stack">{visible.length === 0 && <p role="status">No posts found. Try another search or feed.</p>}{visible.map((post: Post) => <PostCard key={post.id} post={post} toggleLike={toggleLike} notify={notify} />)}</div></div>
}

function PostCard({ post, toggleLike, notify }: { post: Post; toggleLike: (id: string) => void; notify: (text: string) => void }) {
  const actions = useContext(PostContext);
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const share = async () => {
    try {
      await navigator.clipboard.writeText([post.text, post.link].filter(Boolean).join("\n"));
      notify("Post text copied.");
    } catch { notify("Clipboard unavailable. Select and copy the post text."); }
  };
  return <article className="post-card"><header className="post-header"><Avatar initials={post.avatar} /><div><div className="post-author"><strong>{post.author}</strong><span>{post.handle}</span></div><div className="post-meta"><span>{post.community}</span><i>·</i><span>{post.time}</span></div></div><button className="icon-button subtle" aria-label="Post options"><MoreHorizontal /></button></header>{post.text && <p className="post-copy">{post.text}</p>}{post.image && <div className="post-media"><img src={post.image} alt={`Photo shared by ${post.author}`} style={{ filter: `${!post.filter || post.filter === "Original" ? "" : filters[post.filter]} brightness(${post.brightness ?? 100}%)`, transform: `rotate(${post.rotation ?? 0}deg)` }} /></div>}{post.video && <div className="post-media"><video src={post.video} controls playsInline /></div>}{post.link && <a className="link-preview" href={safeLink(post.link) ?? "#"} target="_blank" rel="noreferrer"><div><span>SHARED LINK</span><strong>{safeLink(post.link) ? new URL(post.link).hostname : "Invalid link"}</strong><p>{post.link}</p></div><Link2 /></a>}<div className="post-actions"><button className={post.liked ? "liked" : ""} onClick={() => toggleLike(post.id)}><Heart fill={post.liked ? "currentColor" : "none"} />{post.likes}</button><button aria-expanded={expanded} onClick={() => setExpanded(!expanded)}><MessageCircle />{post.comments}</button><button onClick={share}><Share2 />Share</button><button className="save-action" aria-pressed={Boolean(post.saved)} onClick={() => actions.save(post.id)}><Paperclip />{post.saved ? "Saved" : "Save"}</button></div>{expanded && <section className="replies" aria-label="Comments"><p>Comments added on this device</p>{(post.replies ?? []).map(item => <p key={item.id}><strong>You: </strong>{item.text}</p>)}<form onSubmit={event => { event.preventDefault(); if (!reply.trim()) return; actions.reply(post.id, reply.trim()); setReply(""); }}><Input aria-label="Write a comment" value={reply} maxLength={2000} onChange={e => setReply(e.target.value)} placeholder="Add your comment…" /><Button type="submit" disabled={!reply.trim()}>Reply</Button></form></section>}</article>
}

function RightRail({ setView, joined, setJoined, notify }: { setView: (view: View) => void; joined: string[]; setJoined: React.Dispatch<React.SetStateAction<string[]>>; notify: (text: string) => void }) {
  return <aside className="right-rail"><label className="search-box"><Search /><input placeholder="Search Threadline" aria-label="Search Threadline" /></label>
    <section className="side-card"><div className="side-title"><div><span>PEOPLE TO KNOW</span><h2>Good additions</h2></div><Sparkles /></div>{[{ name: "Avery Lane", role: "Food · 3 mutual", i: "AL" }, { name: "Theo Brooks", role: "Design · 7 mutual", i: "TB" }, { name: "Ren Okafor", role: "Outdoors · nearby", i: "RO" }].map(person => <div className="recommend-row" key={person.name}><Avatar initials={person.i} size="sm" /><div><strong>{person.name}</strong><span>{person.role}</span></div><button onClick={() => notify(`Following ${person.name}.`)}>Follow</button></div>)}</section>
    <section className="side-card event-mini"><div className="side-title"><div><span>NEAR YOU</span><h2>This week</h2></div><button onClick={() => setView("nearby")}>View all</button></div><div className="mini-date"><b>24</b><span>SEP</span></div><div><strong>Rooftop supper</strong><span>Near Southside · 7 PM</span><small>38 people going</small></div></section>
    <section className="side-card"><div className="side-title"><div><span>COMMUNITIES</span><h2>Worth a look</h2></div></div>{communities.slice(0, 2).map(group => <div className="recommend-row" key={group.name}><span className="community-dot" style={{ background: group.color }} /><div><strong>{group.name}</strong><span>{group.members} members</span></div><button onClick={() => { setJoined(current => current.includes(group.name) ? current.filter(item => item !== group.name) : [...current, group.name]); notify(joined.includes(group.name) ? "Community left." : "Community joined.") }}>{joined.includes(group.name) ? "Joined" : "Join"}</button></div>)}</section><footer className="tiny-footer">About · Safety · Privacy · Community rules<br />Threadline © 2026</footer></aside>
}

function CommunitiesView({ joined, setJoined, notify }: { joined: string[]; setJoined: React.Dispatch<React.SetStateAction<string[]>>; notify: (text: string) => void }) {
  return <div className="page-frame discovery-page"><PageHeading eyebrow="Find your people" title="Communities" copy="Topic-led spaces with the people and context you care about." /><label className="wide-search"><Search /><input placeholder="Search communities" /></label>
    <div className="feature-community"><div><span className="eyebrow">FEATURED NEAR YOU</span><h2>Fort Worth Social</h2><p>A useful local feed: openings, weekend plans, honest recommendations and neighbor-made events.</p><div className="member-stack"><Avatar initials="MC" size="sm" /><Avatar initials="AL" size="sm" /><Avatar initials="JW" size="sm" /><span>24.8k members</span></div></div><button onClick={() => { setJoined(current => current.includes("Fort Worth Social") ? current.filter(x => x !== "Fort Worth Social") : [...current, "Fort Worth Social"]); notify(joined.includes("Fort Worth Social") ? "Community left." : "Welcome to Fort Worth Social.") }}>{joined.includes("Fort Worth Social") ? "Joined" : "Join community"}</button></div>
    <h2 className="section-heading">Recommended for you</h2><div className="community-grid">{communities.map(group => <article className="community-card" key={group.name}><span className="community-symbol" style={{ background: group.color }}>{group.name.slice(0, 2).toUpperCase()}</span><div><h3>{group.name}</h3><p>{group.note}</p><span>{group.members} members</span></div><button className={joined.includes(group.name) ? "joined" : ""} onClick={() => setJoined(current => current.includes(group.name) ? current.filter(x => x !== group.name) : [...current, group.name])}>{joined.includes(group.name) ? <><Check /> Joined</> : "Join"}</button></article>)}</div></div>
}

function NearbyView({ rsvps, setRsvps, notify }: { rsvps: number[]; setRsvps: React.Dispatch<React.SetStateAction<number[]>>; notify: (text: string) => void }) {
  return <div className="page-frame discovery-page"><PageHeading eyebrow="Fort Worth · within 15 miles" title="Plans near you" copy="Meet in public, bring a friend, and use the community check-in when you arrive." /><div className="nearby-toolbar"><label className="wide-search"><Search /><input placeholder="Search local meetups" /></label><button><CalendarDays /> This week</button><button><MapPin /> 15 miles</button></div>
    <div className="map-panel"><div className="map-grid" /><div className="map-copy"><span>NEAR SOUTHSIDE</span><strong>6 things happening tonight</strong><button onClick={() => notify("Map filters updated.")}>Explore the area <Compass /></button></div><span className="map-pin one"><Users /></span><span className="map-pin two"><Heart /></span><span className="map-pin three"><CalendarDays /></span></div>
    <h2 className="section-heading">Upcoming meetups</h2><div className="event-list">{events.map(event => <article className="event-card" key={event.id}><div className={`event-date ${event.tone}`}><b>{event.day}</b><span>{event.month}</span></div><div className="event-details"><span>COMMUNITY MEETUP</span><h3>{event.title}</h3><p><MapPin /> {event.place}</p><small>{event.going + (rsvps.includes(event.id) ? 1 : 0)} people going</small></div><button className={rsvps.includes(event.id) ? "joined" : ""} onClick={() => { setRsvps(current => current.includes(event.id) ? current.filter(x => x !== event.id) : [...current, event.id]); notify(rsvps.includes(event.id) ? "RSVP removed." : "You’re on the list.") }}>{rsvps.includes(event.id) ? <><Check /> Going</> : "RSVP"}</button></article>)}</div></div>
}

function DatingView({ profile, nextDate, match, setMatch, onMessage }: { profile: typeof datingProfiles[number]; nextDate: (liked: boolean) => void; match: boolean; setMatch: (value: boolean) => void; onMessage: () => void }) {
  return <div className="dating-page"><div className="dating-top"><div><span className="eyebrow">THREADLINE DATING · 18+</span><h1>Meet with context</h1></div><button className="icon-button"><Settings2 /></button></div><div className="dating-layout"><section className="dating-card"><div className={`dating-photo bg-gradient-to-br ${profile.gradient}`}><span>{profile.initials}</span><div className="profile-fade"><div><h2>{profile.name}, {profile.age}</h2><p>{profile.job}</p></div><span><MapPin /> {profile.distance}</span></div></div><div className="dating-info"><p>{profile.bio}</p><div className="interest-row">{profile.interests.map(item => <span key={item}>{item}</span>)}</div></div><div className="dating-actions"><button className="pass" onClick={() => nextDate(false)} aria-label="Pass"><X /></button><button className="super" onClick={() => nextDate(true)} aria-label="Super like"><Sparkles /></button><button className="like" onClick={() => nextDate(true)} aria-label="Like"><Heart /></button></div></section><aside className="dating-context"><div><span className="eyebrow">WHY YOU’RE SEEING THIS</span><h2>Shared context, not random swipes.</h2><p>You both follow <strong>DFW Weekends</strong>, saved local live music, and prefer plans within 10 miles.</p></div><div className="safety-note"><Users /><div><strong>Meet safer</strong><span>Public-place reminders and friend check-ins are built into local dates.</span></div></div></aside></div>
    {match && <div className="match-overlay"><div className="match-card"><button onClick={() => { setMatch(false); nextDate(false) }}><X /></button><Sparkles /><span>IT’S A MATCH</span><h2>You and Elena liked each other.</h2><p>Start with the rooftop supper you both saved.</p><Button onClick={onMessage}><MessageCircle /> Send a message</Button><button className="keep-browsing" onClick={() => { setMatch(false); nextDate(false) }}>Keep browsing</button></div></div>}</div>
}

function MessagesView({ activeConversation, setActiveConversation, currentConversation, messages, messageDraft, setMessageDraft, sendMessage }: { activeConversation: string; setActiveConversation: (id: string) => void; currentConversation: typeof conversations[number]; messages: typeof initialMessages; messageDraft: string; setMessageDraft: (value: string) => void; sendMessage: () => void }) {
  return <div className="messages-page"><aside className="conversation-list"><div className="inbox-title"><h1>Messages</h1><button className="icon-button"><Edit3 /></button></div><label className="wide-search compact"><Search /><input placeholder="Search messages" /></label>{conversations.map(conversation => <button key={conversation.id} className={`conversation ${activeConversation === conversation.id ? "active" : ""}`} onClick={() => setActiveConversation(conversation.id)}><Avatar initials={conversation.initials} /><div><strong>{conversation.name}</strong><span>{conversation.preview}</span></div><small>{conversation.time}</small>{conversation.unread > 0 && <b>{conversation.unread}</b>}</button>)}</aside><section className="chat-panel"><header><Avatar initials={currentConversation.initials} /><div><strong>{currentConversation.name}</strong><span>Active now</span></div><button className="icon-button"><Video /></button><button className="icon-button"><MoreHorizontal /></button></header><div className="message-thread"><div className="thread-date">TODAY</div>{messages.map((message, index) => <div key={`${message.time}-${index}`} className={`message ${message.from}`}><p>{message.text}</p><span>{message.time}</span></div>)}</div><form className="message-composer" onSubmit={event => { event.preventDefault(); sendMessage() }}><button type="button" className="icon-button"><Plus /></button><input value={messageDraft} onChange={event => setMessageDraft(event.target.value)} placeholder="Write a message…" aria-label="Message" /><button type="submit" className="send-button" aria-label="Send"><Send /></button></form></section></div>
}

function PageHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) { return <header className="page-heading"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{copy}</p></header> }

type ComposerProps = { open: boolean; onOpenChange: (value: boolean) => void; type: ComposerType; setType: (type: ComposerType) => void; draft: string; setDraft: (value: string) => void; link: string; setLink: (value: string) => void; mediaUrl: string; fileRef: React.RefObject<HTMLInputElement | null>; handleFile: (file?: File) => void; filter: FilterName; setFilter: (filter: FilterName) => void; rotation: number; setRotation: React.Dispatch<React.SetStateAction<number>>; brightness: number[]; setBrightness: (value: number[]) => void; videoTrim: number[]; setVideoTrim: (value: number[]) => void; videoMuted: boolean; setVideoMuted: (value: boolean) => void; mediaFilter: string; publishPost: () => void };

function ComposerDialog({ open, onOpenChange, type, setType, draft, setDraft, link, setLink, mediaUrl, fileRef, handleFile, filter, setFilter, rotation, setRotation, brightness, setBrightness, videoTrim, setVideoTrim, videoMuted, setVideoMuted, mediaFilter, publishPost }: ComposerProps) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="composer-dialog"><DialogHeader><DialogTitle>Create a post</DialogTitle><DialogDescription>Share with your followers and recommended circles.</DialogDescription></DialogHeader><div className="compose-tabs">{(["text", "photo", "video", "link"] as ComposerType[]).map(item => <button key={item} className={type === item ? "active" : ""} onClick={() => setType(item)}>{item === "text" ? <Edit3 /> : item === "photo" ? <ImageIcon /> : item === "video" ? <Video /> : <Link2 />}{item}</button>)}</div><div className="compose-author"><Avatar initials="DE" /><div><strong>Dwayne</strong><span>Posting to your profile</span></div></div><Textarea value={draft} onChange={event => setDraft(event.target.value)} placeholder={type === "link" ? "What should people know about this link?" : "What’s happening?"} className="compose-textarea" />{type === "link" && <Input value={link} onChange={event => setLink(event.target.value)} placeholder="https://" type="url" />}
    {(type === "photo" || type === "video") && !mediaUrl && <button className="upload-zone" onClick={() => fileRef.current?.click()}><span><Camera /></span><strong>Add {type}</strong><small>Choose a file from your device</small></button>}<input ref={fileRef} hidden type="file" accept={type === "video" ? "video/*" : "image/*"} onChange={event => handleFile(event.target.files?.[0])} />
    {mediaUrl && type === "photo" && <div className="media-editor"><div className="editor-preview"><img src={mediaUrl} alt="Upload preview" style={{ filter: mediaFilter, transform: `rotate(${rotation}deg)` }} /></div><div className="editor-tools"><div className="filter-strip">{(Object.keys(filters) as FilterName[]).map(name => <button key={name} className={filter === name ? "active" : ""} onClick={() => setFilter(name)}><span style={{ filter: filters[name], backgroundImage: `url(${mediaUrl})` }} />{name}</button>)}</div><div className="adjust-row"><label><WandSparkles /> Brightness</label><Slider value={brightness} min={60} max={140} step={1} onValueChange={setBrightness} /><button onClick={() => setRotation(value => (value + 90) % 360)}><RotateCw /> Rotate</button></div></div></div>}
    {mediaUrl && type === "video" && <div className="media-editor"><div className="editor-preview video-preview"><video src={mediaUrl} controls muted={videoMuted} /></div><div className="video-controls"><div><label><Film /> Trim clip</label><span>{videoTrim[0]}% — {videoTrim[1]}%</span></div><Slider value={videoTrim} min={0} max={100} minStepsBetweenThumbs={5} onValueChange={setVideoTrim} /><button className={videoMuted ? "active" : ""} onClick={() => setVideoMuted(!videoMuted)}>{videoMuted ? "Audio off" : "Keep audio"}</button></div></div>}
    <div className="compose-footer"><span><Users /> Anyone can reply</span><Button onClick={publishPost}>Publish</Button></div></DialogContent></Dialog>
}
