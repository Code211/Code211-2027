import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateRegistration, useGetDashboardSummary, useListAnnouncements } from '@workspace/api-client-react';
import type { Announcement, RegistrationInput } from '@workspace/api-client-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { ArrowRight, Bell, CalendarDays, Check, ChevronDown, Clock3, Code2, Instagram, Mail, MapPin, Menu as MenuIcon, Network, Search, Sparkles, Trophy, Users, X, Zap } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const EVENT_DATE = new Date('2027-01-23T08:00:00-06:00');
const REGISTRATION_CLOSE = new Date('2027-01-20T23:59:59-06:00');
const EVENT_LOCATION = 'Hoffman Estates High School / Media Center';
const CONTACT_EMAIL = 'hackathon.d211@gmail.com';
const DISCORD_URL = 'https://discord.com/invite/ZEvmePbwHZ';
const INSTAGRAM_URL = 'https://www.instagram.com/official_code211/';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/faq', label: 'FAQ' },
  { href: '/dashboard', label: 'Live board' },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5" data-testid="link-logo">
      <span className="relative flex size-9 items-center justify-center rounded-xl bg-foreground text-primary shadow-[4px_4px_0_hsl(var(--secondary))] transition-transform group-hover:-translate-y-0.5">
        <Code2 className="size-5" strokeWidth={2.4} />
      </span>
      {!compact && <span className="display text-lg font-bold tracking-[-.04em]">code<span className="text-primary">211</span></span>}
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  return (
    <header className="relative z-40 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replace(' ', '-')}`} className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted ${location === item.href ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <span className="mono hidden text-[10px] uppercase tracking-[.18em] text-muted-foreground lg:inline">Jan 23, 2027 / Hoffman Estates HS</span>
          <Link href="/register" data-testid="link-nav-register" className="group flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-all hover:-translate-y-0.5 hover:bg-primary">
            Join the build <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <button type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Close navigation' : 'Open navigation'} data-testid="button-mobile-menu" className="rounded-lg p-2 md:hidden">
          {open ? <X className="size-5" /> : <MenuIcon className="size-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-foreground/10 bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} data-testid={`link-mobile-${item.label.toLowerCase().replace(' ', '-')}`} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted">{item.label}</Link>)}
            <Link href="/register" onClick={() => setOpen(false)} data-testid="link-mobile-register" className="mt-2 rounded-xl bg-foreground px-3 py-3 text-center text-sm font-bold text-background">Join the build</Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-foreground/10 bg-foreground px-5 py-12 text-background lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div><Logo /><p className="mt-5 max-w-xs text-sm leading-6 text-background/60">One day. One idea. A room full of student builders making something real.</p></div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
            <span className="mono col-span-2 mb-2 text-[10px] uppercase tracking-[.2em] text-primary">Explore</span>
            {navItems.slice(1).map((item) => <Link key={item.href} href={item.href} data-testid={`link-footer-${item.label.toLowerCase().replace(' ', '-')}`} className="text-background/65 transition-colors hover:text-primary">{item.label}</Link>)}
          </div>
          <div className="flex items-start gap-3">
            <a href={`mailto:${CONTACT_EMAIL}`} data-testid="link-footer-email" className="rounded-full border border-background/20 p-2.5 transition-colors hover:border-primary hover:text-primary"><Mail className="size-4" /></a>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" data-testid="link-footer-discord" className="rounded-full border border-background/20 p-2.5 transition-colors hover:border-primary hover:text-primary"><Users className="size-4" /></a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" data-testid="link-footer-instagram" className="rounded-full border border-background/20 p-2.5 transition-colors hover:border-primary hover:text-primary"><Instagram className="size-4" /></a>
          </div>
        </div>
        <div className="mono mt-14 flex flex-col justify-between gap-2 border-t border-background/15 pt-5 text-[10px] uppercase tracking-[.16em] text-background/40 sm:flex-row"><span>District 211 / student-run / 2027</span><span>Hoffman Estates / Media Center</span></div>
      </div>
    </footer>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="noise min-h-[100dvh] overflow-hidden"><Navbar />{children}<Footer /></div>;
}

function Eyebrow({ children, color = 'text-primary' }: { children: React.ReactNode; color?: string }) {
  return <div className={`mono mb-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.2em] ${color}`}><span className="size-1.5 rounded-full bg-current" />{children}</div>;
}

function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <section className="grid-paper border-b border-foreground/10 px-5 pb-16 pt-16 lg:px-8 lg:pb-20 lg:pt-24"><div className="mx-auto max-w-7xl"><Eyebrow>{eyebrow}</Eyebrow><h1 className="display max-w-3xl text-5xl font-bold leading-[.98] tracking-[-.065em] sm:text-6xl lg:text-8xl">{title}</h1>{children && <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground">{children}</p>}</div></section>;
}

function LoadingCards({ count = 3 }: { count?: number }) {
  return <div className="grid gap-4">{Array.from({ length: count }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}</div>;
}

function ErrorState({ retry }: { retry?: () => void }) {
  return <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6"><p className="font-semibold">The signal dropped.</p><p className="mt-1 text-sm text-muted-foreground">We could not load this right now. Try again in a moment.</p>{retry && <button type="button" onClick={retry} data-testid="button-retry" className="mt-4 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background">Retry</button>}</div>;
}

function Countdown() {
  const getRemaining = () => Math.max(0, EVENT_DATE.getTime() - Date.now());
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(getRemaining()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining / 3600000) % 24);
  const minutes = Math.floor((remaining / 60000) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  return <div className="mt-7 grid max-w-md grid-cols-4 gap-2" aria-label="Countdown to Code211">
    {[['Days', days], ['Hours', hours], ['Mins', minutes], ['Secs', seconds]].map(([label, value]) => (
      <div key={label} className="rounded-xl border border-background/15 bg-background/[.06] px-2 py-3 text-center">
        <div className="display text-2xl font-bold text-primary sm:text-3xl">{String(value).padStart(2, '0')}</div>
        <div className="mono mt-1 text-[9px] uppercase tracking-[.16em] text-background/45">{label}</div>
      </div>
    ))}
  </div>;
}

function ThemeBar() {
  return <section className="border-b border-foreground/10 bg-secondary px-5 py-5 text-secondary-foreground lg:px-8">
    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div><p className="mono text-[10px] uppercase tracking-[.2em] text-secondary-foreground/65">This year's theme</p><p className="display mt-1 text-2xl font-bold">TBD</p></div>
      <p className="text-sm text-secondary-foreground/75">Last year's theme: <span className="font-bold text-secondary-foreground">Level Up</span></p>
    </div>
  </section>;
}

function Home() {
  const { data: summary } = useGetDashboardSummary();
  return <Shell>
    <main>
      <section className="relative overflow-hidden bg-foreground px-5 pb-16 pt-14 text-background lg:px-8 lg:pb-24 lg:pt-20">
        <div className="absolute -right-24 -top-20 size-[430px] rounded-full border border-primary/20 bg-primary/10 blur-[1px]" /><div className="absolute -right-8 top-8 size-[275px] rounded-full border border-secondary/30" /><div className="absolute right-24 top-24 size-28 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between"><Eyebrow color="text-primary">District 211 / student-run hackathon</Eyebrow><span className="mono hidden text-[10px] uppercase tracking-[.18em] text-background/40 sm:block">01 day / 01 idea / real software</span></div>
          <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
            <div className="rise-in"><h1 className="display max-w-4xl text-[4.2rem] font-bold leading-[.85] tracking-[-.085em] sm:text-[7rem] lg:text-[9.2rem]">Make<br /><span className="text-primary">something</span><br /><span className="text-background/35">matter.</span></h1><p className="mt-9 max-w-md text-base leading-7 text-background/65 sm:text-lg">A one-day build sprint for District 211 high school students who have an idea, a laptop, and the nerve to ship it.</p><Countdown /><div className="mt-8 flex flex-wrap gap-3"><Link href="/register" data-testid="link-hero-register" className="group flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-1">Save your seat <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link><Link href="/about" data-testid="link-hero-about" className="rounded-full border border-background/25 px-5 py-3 text-sm font-semibold text-background transition-colors hover:border-primary hover:text-primary">How it works</Link></div></div>
            <div className="lg:pb-2"><div className="float rounded-[1.5rem] border border-background/15 bg-background/[.06] p-5 backdrop-blur"><div className="flex items-center justify-between border-b border-background/10 pb-4"><span className="mono text-[10px] uppercase tracking-[.18em] text-primary">Next up</span><span className="size-2 rounded-full bg-primary blink" /></div><p className="mt-5 text-2xl font-bold leading-tight">Schedule: TBD</p><p className="mt-3 text-sm text-background/55">Workshops and the full run of show will be announced soon.</p><div className="mono mt-6 flex items-center gap-2 text-xs text-primary"><Clock3 className="size-4" />Details coming soon</div></div><div className="mono mt-5 flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-background/40"><MapPin className="size-3 text-secondary" /> {EVENT_LOCATION}</div><Countdown /></div>
          </div>
        </div>
      </section>
      <ThemeBar />
      <section className="border-b border-foreground/10 bg-primary px-5 py-5 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 sm:flex-row sm:items-center"><p className="font-bold tracking-[-.02em]">Registration closes January 20, 2027.</p><Link href="/register" data-testid="link-banner-register" className="flex items-center gap-2 text-sm font-bold underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground">Get in the room <ArrowRight className="size-4" /></Link></div></section>
      <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto max-w-7xl"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><Eyebrow>Why code211</Eyebrow><h2 className="display max-w-md text-4xl font-bold leading-[.98] tracking-[-.06em] sm:text-5xl">Not a lecture.<br />A launchpad.</h2></div><div className="grid gap-x-8 gap-y-10 sm:grid-cols-2"><Feature icon={<Zap />} number="01" title="Start scrappy" text="No experience required. Come with a thought, or borrow one from the room." /><Feature icon={<Network />} number="02" title="Find your people" text="Build solo, bring a crew, or meet the teammate who makes your idea click." /><Feature icon={<Trophy />} number="03" title="Ship something real" text="A focused deadline, mentors, and a room full of builders keep the momentum moving." /><Feature icon={<Sparkles />} number="04" title="Leave with proof" text="You leave with a demo, a story, and a new line on your future application." /></div></div></div></section>
      <section className="bg-muted px-5 py-20 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><Eyebrow>Field notes</Eyebrow><h2 className="display text-4xl font-bold tracking-[-.06em] sm:text-5xl">A few reasons to show up.</h2></div><Link href="/about" data-testid="link-home-about" className="flex items-center gap-2 text-sm font-bold underline underline-offset-4">The full brief <ArrowRight className="size-4" /></Link></div><div className="mt-12 grid gap-4 md:grid-cols-3"><QuoteCard label="THE ROOM" quote="Everyone is figuring it out. That makes it easy to ask the first question." mark="01" /><QuoteCard label="THE PACE" quote="A day is short enough to focus and long enough to surprise yourself." mark="02" dark /><QuoteCard label="THE RECEIPT" quote="You leave with a demo, a story, and people who get why you made it." mark="03" /></div></div></section>
      <section className="px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl rounded-[2rem] bg-secondary p-8 text-secondary-foreground sm:p-12 lg:flex lg:items-end lg:justify-between"><div><Eyebrow color="text-secondary-foreground/70">Your next tab</Eyebrow><h2 className="display max-w-xl text-4xl font-bold leading-[.95] tracking-[-.06em] sm:text-6xl">Bring the idea<br />you keep saving.</h2></div><Link href="/register" data-testid="link-cta-register" className="group mt-8 flex w-fit items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-bold text-foreground lg:mt-0">Register now <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></div></section>
    </main>
  </Shell>;
}

function Feature({ icon, number, title, text }: { icon: React.ReactNode; number: string; title: string; text: string }) {
  return <div className="relative border-t border-foreground/15 pt-5"><div className="flex items-center justify-between"><span className="text-primary [&>svg]:size-5">{icon}</span><span className="mono text-[10px] text-muted-foreground">{number}</span></div><h3 className="mt-8 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

function QuoteCard({ label, quote, mark, dark = false }: { label: string; quote: string; mark: string; dark?: boolean }) {
  return <div className={`min-h-64 rounded-[1.5rem] p-6 ${dark ? 'bg-foreground text-background' : 'bg-background'}`}><div className="flex justify-between"><span className="mono text-[10px] uppercase tracking-[.18em] text-primary">{label}</span><span className="mono text-xs opacity-35">{mark}</span></div><p className="mt-16 max-w-sm text-lg font-semibold leading-6 tracking-[-.02em]">“{quote}”</p></div>;
}

function About() {
  return <Shell><PageIntro eyebrow="The brief / 01" title="A day to make your idea undeniable.">Code211 is a student-run hackathon for District 211 high school students, happening January 23, 2027 at Hoffman Estates High School in the Media Center. No gatekeeping, no pitch-deck theater — just a focused day of building, learning, and showing what you can do.</PageIntro><main>
    <section className="px-5 py-20 lg:px-8 lg:py-28"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.75fr_1.25fr]"><div><Eyebrow>How the day moves</Eyebrow><h2 className="display text-4xl font-bold leading-none tracking-[-.06em] sm:text-5xl">Structure for<br />maximum momentum.</h2></div><div className="space-y-0"><Step number="01" title="Arrive with a question" text="Kick off with a quick orientation, idea prompts, and the freedom to work on whatever pulls you in." /><Step number="02" title="Turn the spark into a build" text="Form a team or fly solo. Workshops and mentors are there when you need a new tool or a second pair of eyes." /><Step number="03" title="Demo the thing" text="At the finish line, share your project with judges and the room. Finished is better than perfect." /></div></div></section>
    <section className="bg-foreground px-5 py-20 text-background lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="grid gap-12 md:grid-cols-2"><div><Eyebrow color="text-primary">What is on the table</Eyebrow><h2 className="display max-w-md text-4xl font-bold leading-none tracking-[-.06em] sm:text-5xl">The good kind<br />of pressure.</h2></div><div className="grid gap-8 sm:grid-cols-2"><InfoBlock title="Prizes" text="Judged on creativity, usefulness, technical ambition, and the story behind the build. Details announced at kickoff." /><InfoBlock title="Who can attend" text="Any District 211 high school student, regardless of experience level. Bring your curiosity — we will handle the rest." /><InfoBlock title="What to bring" text="A laptop, charger, and water bottle. Food, internet, and the workspace are on us." /><InfoBlock title="This year's theme" text="TBD for now. Last year's theme was Level Up — the new challenge will be announced soon." /></div></div></div></section>
    <section className="px-5 py-20 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-[2rem] border border-foreground/10 bg-muted p-8 sm:p-12 md:flex-row md:items-center md:justify-between"><div><Eyebrow>Ready when you are</Eyebrow><h2 className="display text-4xl font-bold tracking-[-.06em]">Your idea does not<br />need permission.</h2></div><Link href="/register" data-testid="link-about-register" className="group flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background">Take a seat <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link></div></section>
  </main></Shell>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="grid grid-cols-[64px_1fr] gap-5 border-t border-foreground/15 py-7"><span className="mono text-xs text-secondary">{number}</span><div><h3 className="text-xl font-bold">{title}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">{text}</p></div></div>;
}
function InfoBlock({ title, text }: { title: string; text: string }) {
  return <div className="border-t border-background/15 pt-4"><h3 className="font-bold text-primary">{title}</h3><p className="mt-2 text-sm leading-6 text-background/60">{text}</p></div>;
}

function Schedule() {
  return <Shell><PageIntro eyebrow="The run of show / 02" title="The day is still taking shape.">Schedule and workshops will be announced here as soon as they are finalized. Check back for the latest details.</PageIntro><main className="px-5 py-16 lg:px-8 lg:py-24"><div className="mx-auto max-w-5xl"><div className="mb-10 flex flex-wrap items-center justify-between gap-4"><span className="mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{EVENT_LOCATION}</span><span className="rounded-full bg-secondary/15 px-3 py-1.5 text-xs font-bold text-secondary">Updates coming soon</span></div><div className="rounded-[1.5rem] border border-dashed border-foreground/20 bg-muted p-12 text-center"><CalendarDays className="mx-auto size-8 text-primary" /><p className="mt-4 font-bold">Schedule: TBD</p><p className="mt-1 text-sm text-muted-foreground">Workshops: TBD. We will post the full run of show here once it is finalized.</p></div></div></main></Shell>;
}

const faqs = [
  ['Do I need coding experience?', 'Not at all. Code211 is for curious people first. You can bring design, storytelling, research, organization, or a half-formed idea — every team needs more than code.'],
  ['Can I come without a team?', 'Absolutely. Solo projects are welcome, and the kickoff includes time to find teammates with complementary skills.'],
  ['What will this year’s theme be?', 'The 2027 theme is still TBD. Last year’s theme was Level Up, and this year’s challenge will be announced before the event.'],
  ['How much does it cost?', 'Nothing. Registration, meals, workshops, mentors, and the event itself are free for District 211 students.'],
  ['What if I cannot stay the entire day?', 'Let the organizers know when you register. We would rather have you for part of the day than not have you in the room.'],
  ['What should I bring?', 'Bring a laptop, charger, and any notes or sketches you want to start from. We provide the workspace, internet, food, and good company.'],
];

function FAQ() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const visible = faqs.filter(([q, a]) => `${q} ${a}`.toLowerCase().includes(search.toLowerCase()));
  return <Shell><PageIntro eyebrow="The small print / 03" title="Questions are part of the build.">If you are wondering it, someone else probably is too. Search the notes below, or send the team a message when you still need a human answer.</PageIntro><main className="px-5 py-16 lg:px-8 lg:py-24"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[.7fr_1.3fr]"><div className="lg:sticky lg:top-8 lg:self-start"><Eyebrow>Find your answer</Eyebrow><div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-faq-search" placeholder="Search the FAQ" className="h-12 w-full rounded-xl border border-foreground/15 bg-card pl-11 pr-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-primary/30" /></div><p className="mt-5 text-sm leading-6 text-muted-foreground">Still stuck? <a href={`mailto:${CONTACT_EMAIL}`} data-testid="link-faq-email" className="font-bold text-foreground underline underline-offset-4">Email the organizers.</a></p></div><div>{visible.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center"><p className="font-bold">No match yet.</p><p className="mt-1 text-sm text-muted-foreground">Try a different phrase or email the team.</p></div> : visible.map(([question, answer], index) => <div key={question} className="border-t border-foreground/15"><button type="button" onClick={() => setOpen(open === index ? null : index)} data-testid={`button-faq-${index}`} className="flex w-full items-center justify-between gap-5 py-6 text-left text-lg font-bold tracking-[-.02em]"><span>{question}</span><ChevronDown className={`size-5 shrink-0 text-primary transition-transform ${open === index ? 'rotate-180' : ''}`} /></button><div className={`grid transition-[grid-template-rows] duration-300 ${open === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}><div className="overflow-hidden"><p className="max-w-2xl pb-6 text-sm leading-7 text-muted-foreground">{answer}</p></div></div></div>)}</div></div></main></Shell>;
}

type FormState = Omit<RegistrationInput, 'teamSize'> & { teamSize: string };
const defaultForm: FormState = { name: '', email: '', school: '', teamName: '', teamSize: '1', experience: 'Just getting started', tShirtSize: 'Adult M', dietaryNeeds: '' };

function Register() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const create = useCreateRegistration();
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.name || !form.email || !form.school || !form.tShirtSize) { setError('Fill in the required fields so we know who to expect.'); return; }
    if (new Date() > REGISTRATION_CLOSE) { setError('Registration is closed for this event.'); return; }
    create.mutate({ data: { ...form, teamSize: Number(form.teamSize), teamName: form.teamName || null, dietaryNeeds: form.dietaryNeeds || null } }, { onSuccess: () => { setSubmitted(true); }, onError: () => setError('We could not send your registration to the organizers. Please check your details and try again.') });
  };
  if (submitted) return <Shell><main className="grid min-h-[70dvh] place-items-center px-5 py-20"><div className="rise-in max-w-xl text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[5px_5px_0_hsl(var(--secondary))]"><Check className="size-8" /></div><Eyebrow>Registration received</Eyebrow><h1 className="display text-5xl font-bold leading-none tracking-[-.07em] sm:text-7xl">You are<br /><span className="text-primary">in the room.</span></h1><p className="mx-auto mt-6 max-w-md text-muted-foreground">Your registration was sent to the event organizers. Keep Saturday, January 23 open and watch the live board for updates.</p><div className="mt-8 flex justify-center gap-3"><Link href="/dashboard" data-testid="link-success-dashboard" className="rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background">See the live board</Link><Link href="/" data-testid="link-success-home" className="rounded-full border px-5 py-3 text-sm font-bold">Back home</Link></div></div></main></Shell>;
  return <Shell><PageIntro eyebrow="Claim your spot / 04" title="Put your name on the build.">Registration closes Wednesday, January 20, 2027. It takes about two minutes, and you do not need a project idea to sign up.</PageIntro><main className="px-5 py-16 lg:px-8 lg:py-24"><form onSubmit={submit} className="mx-auto max-w-4xl"><div className="grid gap-10 lg:grid-cols-[1fr_.7fr]"><div className="space-y-8"><FormSection label="About you"><div className="grid gap-5 sm:grid-cols-2"><Field label="Name" required value={form.name} onChange={(v) => update('name', v)} placeholder="Your full name" id="name" /><Field label="Email" required type="email" value={form.email} onChange={(v) => update('email', v)} placeholder="you@school.edu" id="email" /><Field label="School" required value={form.school} onChange={(v) => update('school', v)} placeholder="e.g. Hoffman Estates High School" id="school" /></div></FormSection><FormSection label="Your crew"><div className="grid gap-5 sm:grid-cols-2"><Field label="Team name" value={form.teamName || ''} onChange={(v) => update('teamName', v)} placeholder="Optional — name it later" id="teamName" /><SelectField label="Team size" value={form.teamSize} onChange={(v) => update('teamSize', v)} id="teamSize" options={['1', '2', '3', '4']} /></div></FormSection><FormSection label="Event details"><div className="grid gap-5 sm:grid-cols-2"><SelectField label="Experience level" value={form.experience} onChange={(v) => update('experience', v)} id="experience" options={['Just getting started', 'I have tried a few things', 'I build regularly', 'I am here to go further']} /><SelectField label="T-shirt size" required value={form.tShirtSize} onChange={(v) => update('tShirtSize', v)} id="tShirtSize" options={['Youth S', 'Youth M', 'Youth L', 'Adult S', 'Adult M', 'Adult L', 'Adult XL']} /></div></FormSection><FormSection label="Make yourself comfortable"><TextAreaField label="Dietary needs" value={form.dietaryNeeds || ''} onChange={(v) => update('dietaryNeeds', v)} placeholder="Let us know how to feed you well." id="dietaryNeeds" /></FormSection></div><aside className="lg:pl-8"><div className="sticky top-8 rounded-[1.5rem] bg-foreground p-6 text-background"><Eyebrow color="text-primary">Before you hit send</Eyebrow><ul className="space-y-5 text-sm leading-6 text-background/65"><li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-primary" />Registration is free for District 211 students.</li><li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-background/65" />No experience or project idea is required.</li><li className="flex gap-3"><Check className="mt-1 size-4 shrink-0 text-primary" />Your shirt size helps us prepare your event swag.</li></ul>{error && <p className="mt-6 rounded-xl bg-destructive/20 p-3 text-sm text-red-200" data-testid="status-registration-error">{error}</p>}<button type="submit" disabled={create.isPending} data-testid="button-submit-registration" className="group mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{create.isPending ? 'Sending registration…' : 'Submit registration'}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></button></div></aside></div></form></main></Shell>;
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) { return <section><h2 className="mono mb-5 text-[11px] uppercase tracking-[.18em] text-secondary">{label}</h2>{children}</section>; }
function Field({ label, value, onChange, placeholder, id, type = 'text', required = false }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; id: string; type?: string; required?: boolean }) { return <label className="block"><span className="mb-2 block text-sm font-bold">{label}{required && <span className="ml-1 text-primary">*</span>}</span><input required={required} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} id={id} data-testid={`input-${id}`} className="h-12 w-full rounded-xl border border-foreground/15 bg-card px-4 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>; }
function SelectField({ label, value, onChange, id, options, required = false }: { label: string; value: string; onChange: (value: string) => void; id: string; options: string[]; required?: boolean }) { return <label className="block"><span className="mb-2 block text-sm font-bold">{label}{required && <span className="ml-1 text-primary">*</span>}</span><select required={required} value={value} onChange={(e) => onChange(e.target.value)} id={id} data-testid={`select-${id}`} className="h-12 w-full rounded-xl border border-foreground/15 bg-card px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="" disabled>Select one</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function TextAreaField({ label, value, onChange, placeholder, id }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; id: string }) { return <label className="block"><span className="mb-2 block text-sm font-bold">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} id={id} data-testid={`textarea-${id}`} rows={4} className="w-full resize-none rounded-xl border border-foreground/15 bg-card px-4 py-3 text-sm leading-6 outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>; }

function Dashboard() {
  const summary = useGetDashboardSummary();
  const announcements = useListAnnouncements();
  const [tab, setTab] = useState<'all' | 'pinned'>('all');
  const news = useMemo(() => (announcements.data || []).filter((item) => tab === 'all' || item.isPinned), [announcements.data, tab]);
  return <Shell><PageIntro eyebrow="Public signal / 05" title="The room, in real time.">The latest word from organizers and the event details that are ready to share — all in one place.</PageIntro><main className="px-5 py-16 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><div className="grid gap-4 sm:grid-cols-3"><Stat icon={<Users />} label="Registration status" value="OPEN" test="stat-registrations" /><Stat icon={<Network />} label="Event date" value="JAN 23" test="stat-teams" /><Stat icon={<Bell />} label="Live updates" value={summary.isLoading ? '—' : String(summary.data?.announcementCount ?? 0)} test="stat-announcements" /></div><div className="mt-14 grid gap-12 lg:grid-cols-[1.1fr_.9fr]"><section><div className="mb-6 flex items-end justify-between"><div><Eyebrow>From the organizers</Eyebrow><h2 className="display text-3xl font-bold tracking-[-.05em]">Fresh from the room.</h2></div><div className="flex rounded-full border border-foreground/10 p-1"><button type="button" onClick={() => setTab('all')} data-testid="button-news-all" className={`rounded-full px-3 py-1.5 text-xs font-bold ${tab === 'all' ? 'bg-foreground text-background' : ''}`}>All</button><button type="button" onClick={() => setTab('pinned')} data-testid="button-news-pinned" className={`rounded-full px-3 py-1.5 text-xs font-bold ${tab === 'pinned' ? 'bg-foreground text-background' : ''}`}>Pinned</button></div></div>{announcements.isLoading ? <LoadingCards /> : announcements.isError ? <ErrorState retry={() => announcements.refetch()} /> : news.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No announcements yet. The first update will land here.</div> : <div className="space-y-3">{news.map((item) => <AnnouncementCard key={item.id} item={item} />)}</div>}</section><aside><div className="rounded-[1.5rem] bg-foreground p-6 text-background"><div className="flex items-center justify-between"><Eyebrow color="text-primary">Next event</Eyebrow><CalendarDays className="size-5 text-primary" /></div><h2 className="mt-6 text-2xl font-bold leading-tight">Saturday, January 23, 2027</h2><p className="mt-3 text-sm leading-6 text-background/60">Hoffman Estates High School, Media Center</p><div className="mono mt-7 flex items-center gap-2 text-xs text-primary"><MapPin className="size-4" />Schedule: TBD</div></div><div className="mt-5 rounded-2xl border border-foreground/10 bg-muted p-5"><div className="flex items-center gap-2 text-sm font-bold"><span className="size-2 rounded-full bg-primary blink" />Live board</div><p className="mt-2 text-sm leading-6 text-muted-foreground">Keep this page open during the build day for changes and announcements.</p><Link href="/schedule" data-testid="link-dashboard-schedule" className="mt-4 flex items-center gap-2 text-sm font-bold underline underline-offset-4">View schedule <ArrowRight className="size-4" /></Link></div></aside></div></div></main></Shell>;
}

function Stat({ icon, label, value, test }: { icon: React.ReactNode; label: string; value: string; test: string }) { return <div className="rounded-2xl border border-foreground/10 bg-card p-5"><div className="flex items-center justify-between text-primary [&>svg]:size-5">{icon}<span className="mono text-[10px] text-muted-foreground">LIVE</span></div><p className="display mt-8 text-4xl font-bold tracking-[-.06em]" data-testid={test}>{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p></div>; }
function AnnouncementCard({ item }: { item: Announcement }) { return <article className={`rounded-2xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)] ${item.isPinned ? 'border-secondary/35 bg-secondary/5' : 'border-foreground/10 bg-card'}`} data-testid={`card-announcement-${item.id}`}><div className="flex items-center justify-between gap-4"><span className="mono text-[10px] font-medium uppercase tracking-[.18em] text-secondary">{item.label}</span><time className="mono text-[10px] text-muted-foreground">{new Date(item.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time></div><h3 className="mt-4 text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p></article>; }

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/schedule" component={Schedule} />
    <Route path="/faq" component={FAQ} />
    <Route path="/register" component={Register} />
    <Route path="/dashboard" component={Dashboard} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  useEffect(() => { document.documentElement.classList.remove('dark'); }, []);
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;