// CraftlyAI — mock data for the prototype.

window.MockData = {
  user: {
    name: "Lena Marchetti",
    email: "lena@studiomarchetti.com",
    initials: "LM",
    plan: "Pro",
  },

  kpis: {
    revenue:    { label: "Revenue this month",     value: "AED 42,180", delta: "+18.4%", trend: "up",   sub: "vs. last month" },
    outstanding:{ label: "Outstanding",            value: "AED 12,640", delta: "3 invoices", trend: "flat", sub: "expected in 14d" },
    overdue:    { label: "Overdue",                value: "AED 2,850",  delta: "1 invoice",  trend: "down", sub: "from Atlas Studio" },
    avgPay:     { label: "Avg. pay time",          value: "11.2 days",  delta: "−2.1d",      trend: "up",   sub: "faster than Q1" },
  },

  attention: [
    { id: "a1", kind: "overdue",    title: "Invoice INV-2049 is 4 days overdue", who: "Atlas Studio · AED 2,850", action: "Send reminder" },
    { id: "a2", kind: "deadline",   title: "Hawthorn rebrand deadline tomorrow", who: "Hawthorn & Co · 2 tasks open", action: "Open project" },
    { id: "a3", kind: "approval",   title: "Quote Q-0418 awaiting approval",     who: "Northwind Labs · 6 days",    action: "Nudge client" },
  ],

  activity: [
    { id: "v1", type: "payment",   who: "Hawthorn & Co",   text: "paid invoice INV-2051",   meta: "AED 8,400",  when: "12m ago" },
    { id: "v2", type: "view",      who: "Northwind Labs",  text: "viewed Quote Q-0418",     meta: "",           when: "1h ago"  },
    { id: "v3", type: "doc",       who: "You",             text: "sent Proposal P-0091",    meta: "Maple Co.",  when: "3h ago"  },
    { id: "v4", type: "approved",  who: "Atlas Studio",    text: "approved Quote Q-0414",   meta: "AED 14,200", when: "Yesterday" },
    { id: "v5", type: "time",      who: "You",             text: "logged 3h 40m",           meta: "Hawthorn rebrand", when: "Yesterday" },
    { id: "v6", type: "doc",       who: "You",             text: "sent Invoice INV-2050",   meta: "Maple Co.",  when: "Mon"     },
    { id: "v7", type: "comment",   who: "Sara at Maple",   text: "commented on P-0090",     meta: "\"Love the timeline.\"", when: "Mon" },
  ],

  pipeline: [
    { id: "p1", title: "Hawthorn rebrand",     client: "Hawthorn & Co",  status: "active",   value: "AED 22,000", progress: 0.68, deadline: "May 21", risk: "high" },
    { id: "p2", title: "Northwind landing v3", client: "Northwind Labs", status: "active",   value: "AED 9,400",  progress: 0.42, deadline: "Jun 02", risk: "low" },
    { id: "p3", title: "Maple seasonal site",  client: "Maple Co.",      status: "planning", value: "AED 14,500", progress: 0.12, deadline: "Jun 18", risk: "med" },
    { id: "p4", title: "Atlas brand guide",    client: "Atlas Studio",   status: "on hold",  value: "AED 6,800",  progress: 0.30, deadline: "—",      risk: "low" },
  ],

  clients: [
    { id: "c1", name: "Hawthorn & Co",      contact: "Theo Bramwell",   email: "theo@hawthorn.co",     country: "UK",  health: 92, projects: 3, revenue: 38400, last: "2d ago"   },
    { id: "c2", name: "Northwind Labs",     contact: "Priya Anand",     email: "priya@northwind.io",   country: "IN",  health: 78, projects: 2, revenue: 21800, last: "5d ago"   },
    { id: "c3", name: "Maple Co.",          contact: "Sara Berger",     email: "sara@maple.studio",    country: "US",  health: 88, projects: 4, revenue: 52900, last: "1d ago"   },
    { id: "c4", name: "Atlas Studio",       contact: "Reza Khalil",     email: "reza@atlasstudio.ae",  country: "AE",  health: 41, projects: 1, revenue: 8650,  last: "12d ago"  },
    { id: "c5", name: "Field Notes Co",     contact: "Mira Aoki",       email: "mira@fieldnotes.co",   country: "JP",  health: 84, projects: 2, revenue: 17200, last: "1w ago"   },
    { id: "c6", name: "Coastline Build",    contact: "James Holloway",  email: "james@coastline.build",country: "UK",  health: 67, projects: 1, revenue: 11400, last: "3d ago"   },
    { id: "c7", name: "Onyx Ventures",      contact: "Dana Cole",       email: "dana@onyx.vc",         country: "US",  health: 90, projects: 2, revenue: 29900, last: "4h ago"   },
    { id: "c8", name: "Lumen Health",       contact: "Ari Saleh",       email: "ari@lumen.health",     country: "AE",  health: 73, projects: 1, revenue: 6200,  last: "2w ago"   },
  ],

  invoices: [
    { id: "INV-2052", client: "Onyx Ventures",    issued: "May 14", due: "May 28", amount: 9200,  status: "sent"          },
    { id: "INV-2051", client: "Hawthorn & Co",    issued: "May 12", due: "May 26", amount: 8400,  status: "paid"          },
    { id: "INV-2050", client: "Maple Co.",        issued: "May 10", due: "May 24", amount: 14500, status: "paid"          },
    { id: "INV-2049", client: "Atlas Studio",     issued: "Apr 28", due: "May 12", amount: 2850,  status: "overdue"       },
    { id: "INV-2048", client: "Northwind Labs",   issued: "May 02", due: "May 16", amount: 4200,  status: "partially_paid"},
    { id: "INV-2047", client: "Field Notes Co",   issued: "Apr 24", due: "May 08", amount: 6800,  status: "paid"          },
    { id: "INV-2046", client: "Coastline Build",  issued: "Apr 18", due: "May 02", amount: 11400, status: "paid"          },
    { id: "INV-2045", client: "Lumen Health",     issued: "Apr 12", due: "Apr 26", amount: 3100,  status: "draft"         },
  ],

  tasks: [
    { id: "t1", title: "Polish hero animation",                 project: "Hawthorn rebrand",     client: "Hawthorn & Co",  status: "in_progress", priority: "high",   due: "Today",    overdue: false },
    { id: "t2", title: "Export final logo lockups",             project: "Hawthorn rebrand",     client: "Hawthorn & Co",  status: "todo",        priority: "high",   due: "Tomorrow", overdue: false },
    { id: "t3", title: "Write proposal — phase 2",              project: "Northwind landing v3", client: "Northwind Labs", status: "todo",        priority: "med",    due: "May 19",   overdue: false },
    { id: "t4", title: "Client review — moodboard",             project: "Maple seasonal site",  client: "Maple Co.",      status: "in_progress", priority: "med",    due: "May 20",   overdue: false },
    { id: "t5", title: "Update site copy for case study",       project: "Maple seasonal site",  client: "Maple Co.",      status: "todo",        priority: "low",    due: "May 24",   overdue: false },
    { id: "t6", title: "Send invoice for sprint 4",             project: "Hawthorn rebrand",     client: "Hawthorn & Co",  status: "done",        priority: "med",    due: "May 12",   overdue: false },
    { id: "t7", title: "Migrate Notion docs to portal",         project: "Atlas brand guide",    client: "Atlas Studio",   status: "todo",        priority: "low",    due: "May 09",   overdue: true  },
    { id: "t8", title: "Final QA — mobile breakpoints",         project: "Northwind landing v3", client: "Northwind Labs", status: "in_progress", priority: "high",   due: "May 26",   overdue: false },
    { id: "t9", title: "Schedule brand workshop",               project: "Atlas brand guide",    client: "Atlas Studio",   status: "todo",        priority: "low",    due: "—",        overdue: false },
    { id: "t10", title: "Archive old invoice PDFs",             project: "—",                    client: "—",              status: "done",        priority: "low",    due: "—",        overdue: false },
  ],

  expenses: [
    { id: "e1", date: "May 14", vendor: "Figma",           category: "Software",   project: "—",                    amount: 180,  hasReceipt: true  },
    { id: "e2", date: "May 12", vendor: "Awwwards",        category: "Subscriptions", project: "—",                 amount: 89,   hasReceipt: true  },
    { id: "e3", date: "May 10", vendor: "Le Pain Quotidien", category: "Meals",    project: "Hawthorn rebrand",     amount: 142,  hasReceipt: true  },
    { id: "e4", date: "May 08", vendor: "Uber",            category: "Travel",     project: "Maple seasonal site",  amount: 64,   hasReceipt: false },
    { id: "e5", date: "May 04", vendor: "Adobe",           category: "Software",   project: "—",                    amount: 220,  hasReceipt: true  },
    { id: "e6", date: "Apr 29", vendor: "Notion",          category: "Software",   project: "—",                    amount: 50,   hasReceipt: true  },
    { id: "e7", date: "Apr 26", vendor: "Eames Coffee",    category: "Meals",      project: "Northwind landing v3", amount: 38,   hasReceipt: true  },
  ],

  // Monthly revenue for chart (Jan..May)
  revenueByMonth: [
    { m: "Dec", v: 22400 },
    { m: "Jan", v: 28600 },
    { m: "Feb", v: 31200 },
    { m: "Mar", v: 26800 },
    { m: "Apr", v: 38400 },
    { m: "May", v: 42180 },
  ],

  // Kanban tasks for projects view
  kanban: {
    todo: [
      { id: "k1", title: "Export final logo lockups",       priority: "high", assignee: "LM", due: "May 18", labels: ["design"] },
      { id: "k2", title: "Write proposal — phase 2",        priority: "med",  assignee: "LM", due: "May 19", labels: ["copy"] },
      { id: "k3", title: "Schedule brand workshop",         priority: "low",  assignee: "LM", due: "—",      labels: ["client"] },
    ],
    in_progress: [
      { id: "k4", title: "Polish hero animation",           priority: "high", assignee: "LM", due: "Today",  labels: ["design", "motion"] },
      { id: "k5", title: "Client review — moodboard",       priority: "med",  assignee: "LM", due: "May 20", labels: ["design"] },
    ],
    done: [
      { id: "k6", title: "Send invoice for sprint 4",       priority: "med",  assignee: "LM", due: "May 12", labels: ["finance"] },
      { id: "k7", title: "Wireframes — home v3",            priority: "med",  assignee: "LM", due: "May 09", labels: ["design"] },
      { id: "k8", title: "Setup repo + CI",                 priority: "low",  assignee: "LM", due: "May 06", labels: ["dev"] },
    ],
    cancelled: [
      { id: "k9", title: "Custom illustration set",         priority: "low",  assignee: "LM", due: "—",      labels: ["design"] },
    ],
  },

  // Cmd+K palette items
  cmdk: {
    quick: [
      { id: "q1", icon: "Sparkles",   label: "Draft an invoice for Hawthorn rebrand",  sub: "AI · Document Writer",   meta: "↵" },
      { id: "q2", icon: "Sparkles",   label: "Summarize this month's revenue",         sub: "AI · Finance Analyst",   meta: "↵" },
      { id: "q3", icon: "Sparkles",   label: "Draft follow-up to Atlas Studio",        sub: "AI · Communication",     meta: "↵" },
    ],
    navigate: [
      { id: "n1", icon: "Home",       label: "Dashboard",          meta: "G then D" },
      { id: "n2", icon: "Users",      label: "Clients",            meta: "G then C" },
      { id: "n3", icon: "Folder",     label: "Projects",           meta: "G then P" },
      { id: "n4", icon: "FileText",   label: "Documents",          meta: "G then O" },
      { id: "n5", icon: "Wallet",     label: "Finance",            meta: "G then F" },
    ],
    create: [
      { id: "x1", icon: "Plus",       label: "New invoice",        meta: "⌘ + I" },
      { id: "x2", icon: "Plus",       label: "New client",         meta: "⌘ + ⇧ + C" },
      { id: "x3", icon: "Plus",       label: "Start timer",        meta: "⌘ + ⇧ + T" },
    ],
  },
};
