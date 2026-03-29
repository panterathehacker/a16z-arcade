export interface Question {
  text: string;
  options: [string, string, string, string];
  correct: number; // 0-3
}

export interface Guest {
  id: string;
  name: string;
  title: string;
  color: number; // sprite color
  // Pixel positions on the Tuxemon town map (40x40 tiles, 32px each = 1280x1280)
  px: number;
  py: number;
  // Keep x/y for legacy compatibility (tile coords approximated)
  x: number;
  y: number;
  questions: Question[];
}

// NPC pixel positions spread across walkable areas of the Tuxemon town map
// The town has open paths and a central plaza area
export const GUESTS: Guest[] = [
  {
    id: 'marc',
    name: 'Marc Andreessen',
    title: 'Co-Founder, a16z',
    color: 0x4169E1,
    px: 480,  py: 240,   // tile ~6,21 — open area
    x: 15,   y: 7,
    questions: [
      {
        text: 'Marc co-founded a16z with whom?',
        options: ['Ben Horowitz', 'Peter Thiel', 'Reid Hoffman', 'Sam Altman'],
        correct: 0,
      },
      {
        text: 'What famous browser did Marc co-create while at the University of Illinois?',
        options: ['Internet Explorer', 'Netscape Navigator', 'Firefox', 'Safari'],
        correct: 1,
      },
      {
        text: 'Marc wrote "Why Software Is Eating the World" for which publication?',
        options: ['New York Times', 'TechCrunch', 'Wall Street Journal', 'Wired'],
        correct: 2,
      },
      {
        text: 'Marc co-created Mosaic while working at which research center?',
        options: ['Bell Labs', 'PARC', 'NCSA', 'MIT Media Lab'],
        correct: 2,
      },
      {
        text: 'a16z was founded in which year?',
        options: ['2007', '2008', '2009', '2010'],
        correct: 2,
      },
    ],
  },
  {
    id: 'ben',
    name: 'Ben Horowitz',
    title: 'Co-Founder, a16z',
    color: 0x8B0000,
    px: 800,  py: 280,   // tile ~33,22 — open area
    x: 25,   y: 8,
    questions: [
      {
        text: 'Ben Horowitz wrote which best-selling book for startup CEOs?',
        options: ['Zero to One', 'The Hard Thing About Hard Things', 'Shoe Dog', 'No Rules Rules'],
        correct: 1,
      },
      {
        text: 'Ben was CEO of which cloud software company before co-founding a16z?',
        options: ['Salesforce', 'Opsware', 'VMware', 'Citrix'],
        correct: 1,
      },
      {
        text: 'Ben is known for opening his blog posts with lyrics from which genre?',
        options: ['Country', 'Jazz', 'Hip-Hop', 'Rock'],
        correct: 2,
      },
      {
        text: 'Ben\'s framework distinguishes between two CEO archetypes — "peacetime CEO" and what?',
        options: ['Crisis CEO', 'Wartime CEO', 'Growth CEO', 'Founder CEO'],
        correct: 1,
      },
      {
        text: 'Ben Horowitz attended which university for his computer science degree?',
        options: ['MIT', 'Yale', 'UCLA', 'Columbia'],
        correct: 2,
      },
    ],
  },
  {
    id: 'jensen',
    name: 'Jensen Huang',
    title: 'CEO, NVIDIA',
    color: 0x76B900,
    px: 300,  py: 340,   // tile ~12,25 — open area
    x: 9,   y: 10,
    questions: [
      {
        text: 'Jensen Huang co-founded NVIDIA in which year?',
        options: ['1990', '1993', '1995', '1998'],
        correct: 1,
      },
      {
        text: 'Jensen Huang is iconic for wearing what at product launches and conferences?',
        options: ['Top hat', 'Leather jacket', 'Turtleneck', 'Cowboy boots'],
        correct: 1,
      },
      {
        text: 'NVIDIA\'s CUDA platform, which enabled GPU computing for AI, launched in which year?',
        options: ['2003', '2007', '2010', '2012'],
        correct: 1,
      },
      {
        text: 'NVIDIA\'s H100 chip is named after which pioneering computer scientist?',
        options: ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'John von Neumann'],
        correct: 1,
      },
      {
        text: 'NVIDIA\'s market cap first exceeded $1 trillion in which year?',
        options: ['2021', '2022', '2023', '2024'],
        correct: 2,
      },
    ],
  },
  {
    id: 'lisa',
    name: 'Lisa Su',
    title: 'CEO, AMD',
    color: 0xFF6B00,
    px: 650,  py: 220,   // tile ~22,21 — open area
    x: 20,   y: 6,
    questions: [
      {
        text: 'Lisa Su became CEO of AMD in which year?',
        options: ['2012', '2014', '2016', '2018'],
        correct: 1,
      },
      {
        text: 'AMD\'s comeback processor architecture, introduced under Lisa Su, is called?',
        options: ['Bulldozer', 'Piledriver', 'Zen', 'Bobcat'],
        correct: 2,
      },
      {
        text: 'Lisa Su earned her PhD in electrical engineering from which university?',
        options: ['Stanford', 'MIT', 'Caltech', 'Harvard'],
        correct: 1,
      },
      {
        text: 'AMD acquired which FPGA and data center chipmaker in 2022 for $49B?',
        options: ['Qualcomm', 'Intel', 'Xilinx', 'Marvell'],
        correct: 2,
      },
      {
        text: 'Before AMD, Lisa Su held senior engineering roles at which company?',
        options: ['Intel', 'IBM', 'Qualcomm', 'Texas Instruments'],
        correct: 1,
      },
    ],
  },
  {
    id: 'alexandr',
    name: 'Alexandr Wang',
    title: 'CEO, Scale AI',
    color: 0x00CED1,
    px: 950,  py: 320,   // tile ~30,24 — open area
    x: 29,   y: 10,
    questions: [
      {
        text: 'Alexandr Wang founded Scale AI at what age?',
        options: ['17', '19', '21', '23'],
        correct: 1,
      },
      {
        text: 'Scale AI\'s core business is providing what to AI companies?',
        options: ['Cloud GPU compute', 'High-quality data labeling', 'Model training runs', 'LLM API access'],
        correct: 1,
      },
      {
        text: 'Alexandr Wang dropped out of which university to found Scale AI?',
        options: ['Stanford', 'Harvard', 'MIT', 'Princeton'],
        correct: 2,
      },
      {
        text: 'Scale AI has significant contracts with which sector beyond commercial AI?',
        options: ['Hollywood studios', 'US Department of Defense', 'Global central banks', 'Major sports leagues'],
        correct: 1,
      },
      {
        text: 'Scale AI\'s valuation reached approximately $14B by which year?',
        options: ['2021', '2022', '2023', '2024'],
        correct: 2,
      },
    ],
  },
  {
    id: 'sam-altman',
    name: 'Sam Altman',
    title: 'CEO, OpenAI',
    color: 0x1A1A2E,
    px: 200,  py: 420,   // tile ~6,28 — open area
    x: 6,   y: 13,
    questions: [
      {
        text: 'Before becoming CEO of OpenAI, Sam Altman was president of which startup accelerator?',
        options: ['Techstars', 'Y Combinator', '500 Startups', 'First Round Capital'],
        correct: 1,
      },
      {
        text: 'ChatGPT launched publicly in which month and year?',
        options: ['March 2022', 'June 2022', 'November 2022', 'January 2023'],
        correct: 2,
      },
      {
        text: 'In November 2023, Sam Altman was briefly removed as OpenAI CEO and reinstated after roughly how many days?',
        options: ['2 days', '5 days', '2 weeks', '1 month'],
        correct: 1,
      },
      {
        text: 'OpenAI\'s stated mission is to ensure that AGI benefits whom?',
        options: ['OpenAI investors', 'Silicon Valley founders', 'All of humanity', 'The US government'],
        correct: 2,
      },
      {
        text: 'Sam Altman invested early in which nuclear fusion startup?',
        options: ['Commonwealth Fusion', 'Helion Energy', 'TAE Technologies', 'General Fusion'],
        correct: 1,
      },
    ],
  },
  {
    id: 'satya',
    name: 'Satya Nadella',
    title: 'CEO, Microsoft',
    color: 0x00A4EF,
    px: 550,  py: 480,   // tile ~16,26 — open area
    x: 17,   y: 15,
    questions: [
      {
        text: 'Satya Nadella became Microsoft\'s CEO in which year?',
        options: ['2012', '2013', '2014', '2016'],
        correct: 2,
      },
      {
        text: 'Under Satya\'s leadership, Microsoft made a landmark multi-billion dollar investment in which AI company?',
        options: ['Google DeepMind', 'Anthropic', 'OpenAI', 'Cohere'],
        correct: 2,
      },
      {
        text: 'Microsoft\'s acquisition of Activision Blizzard was valued at approximately how much?',
        options: ['$26B', '$44B', '$69B', '$95B'],
        correct: 2,
      },
      {
        text: 'Satya Nadella wrote which book about his leadership philosophy and Microsoft\'s reinvention?',
        options: ['Growth Mindset', 'Hit Refresh', 'Cloud First', 'The New Microsoft'],
        correct: 1,
      },
      {
        text: 'Before becoming CEO, Satya Nadella led which division at Microsoft?',
        options: ['Windows', 'Office 365', 'Cloud and Enterprise', 'Xbox'],
        correct: 2,
      },
    ],
  },
  {
    id: 'brian-chesky',
    name: 'Brian Chesky',
    title: 'CEO & Co-Founder, Airbnb',
    color: 0xFF5A5F,
    px: 900,  py: 400,   // tile ~26,28 — open area
    x: 28,   y: 12,
    questions: [
      {
        text: 'Brian Chesky co-founded Airbnb with Joe Gebbia and whom?',
        options: ['Nathan Blecharczyk', 'Drew Houston', 'Travis Kalanick', 'Kevin Systrom'],
        correct: 0,
      },
      {
        text: 'What was Airbnb originally called when it launched in 2008?',
        options: ['CouchSurf', 'AirBed & Breakfast', 'StayShare', 'HomeLet'],
        correct: 1,
      },
      {
        text: 'Brian Chesky studied industrial design at which school?',
        options: ['Parsons', 'Rhode Island School of Design', 'Art Center', 'SVA'],
        correct: 1,
      },
      {
        text: 'Brian Chesky famously described what level of guest experience as the ideal to design towards?',
        options: ['5-star', '7-star', '10-star', '11-star'],
        correct: 3,
      },
      {
        text: 'Airbnb went public — and had one of the biggest IPO days of the year — in which year?',
        options: ['2018', '2019', '2020', '2021'],
        correct: 2,
      },
    ],
  },
  {
    id: 'patrick-collison',
    name: 'Patrick Collison',
    title: 'CEO & Co-Founder, Stripe',
    color: 0x6772E5,
    px: 280,  py: 560,   // tile ~33,26 — open area
    x: 8,   y: 17,
    questions: [
      {
        text: 'Patrick Collison co-founded Stripe with his brother whose name is?',
        options: ['James Collison', 'John Collison', 'Michael Collison', 'Peter Collison'],
        correct: 1,
      },
      {
        text: 'Patrick Collison is originally from which country?',
        options: ['Canada', 'Australia', 'Ireland', 'UK'],
        correct: 2,
      },
      {
        text: 'Stripe\'s core product is best described as what?',
        options: ['A consumer bank account', 'Payment processing infrastructure for the internet', 'A cryptocurrency exchange', 'A business expense card'],
        correct: 1,
      },
      {
        text: 'Patrick co-wrote the essay "Fast" with which economist, arguing the world has slowed down at building things?',
        options: ['Paul Krugman', 'Tyler Cowen', 'Alex Tabarrok', 'Russ Roberts'],
        correct: 1,
      },
      {
        text: 'Patrick Collison is a champion of "progress studies" — the field studying why some eras and places produce far more what?',
        options: ['Billionaires', 'Scientific and technological breakthroughs', 'GDP growth', 'Venture capital returns'],
        correct: 1,
      },
    ],
  },
  {
    id: 'dario-amodei',
    name: 'Dario Amodei',
    title: 'CEO & Co-Founder, Anthropic',
    color: 0xCC785C,
    px: 600,  py: 620,   // tile ~9,31 — open area
    x: 18,   y: 19,
    questions: [
      {
        text: 'Dario Amodei left which company as VP of Research to co-found Anthropic?',
        options: ['Google DeepMind', 'OpenAI', 'Meta AI', 'Microsoft Research'],
        correct: 1,
      },
      {
        text: 'Anthropic\'s AI safety training approach — using a set of written principles — is called?',
        options: ['RLHF', 'Constitutional AI', 'Chain-of-Thought Prompting', 'Instruction Tuning'],
        correct: 1,
      },
      {
        text: 'What is the name of Anthropic\'s AI assistant?',
        options: ['Sage', 'Claude', 'Nova', 'Aria'],
        correct: 1,
      },
      {
        text: 'Who is Anthropic\'s President and Dario\'s co-founding sibling?',
        options: ['Daniela Amodei', 'Tom Brown', 'Ilya Sutskever', 'Sam McCandlish'],
        correct: 0,
      },
      {
        text: 'Dario Amodei earned his PhD in computational neuroscience from which university?',
        options: ['MIT', 'Stanford', 'Princeton', 'Caltech'],
        correct: 2,
      },
    ],
  },
  {
    id: 'chris-dixon',
    name: 'Chris Dixon',
    title: 'General Partner, a16z Crypto',
    color: 0xF7931A,
    px: 900,  py: 580,   // tile ~19,29 — open area
    x: 28,   y: 18,
    questions: [
      {
        text: 'Chris Dixon leads which fund at a16z?',
        options: ['Bio Fund', 'Consumer Fund', 'Crypto Fund', 'Growth Fund'],
        correct: 2,
      },
      {
        text: 'Chris Dixon\'s book arguing for a user-owned internet era is titled?',
        options: ['The Sovereign Individual', 'Read Write Own', 'The Infinite Machine', 'Digital Gold'],
        correct: 1,
      },
      {
        text: 'In Chris Dixon\'s internet history framework, what comes after the "read/write" era?',
        options: ['Read/write/own', 'Read/write/create', 'Read/write/earn', 'Read/write/build'],
        correct: 0,
      },
      {
        text: 'Before joining a16z, Chris Dixon co-founded which startup that was acquired by McAfee?',
        options: ['SiteAdvisor', 'Hunch', 'Codebutler', 'Shyp'],
        correct: 0,
      },
      {
        text: 'Chris Dixon often says the next big platform first appears as what?',
        options: ['A financial instrument', 'A toy', 'An academic paper', 'A government project'],
        correct: 1,
      },
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah Guo',
    title: 'Founder, Conviction',
    color: 0xFF69B4,
    px: 200,  py: 700,   // tile ~29,30 — open area
    x: 6,   y: 21,
    questions: [
      {
        text: 'Sarah Guo founded which AI-focused venture firm?',
        options: ['Elad Gil Fund', 'Conviction', 'Basis Set', 'AI2 Incubator'],
        correct: 1,
      },
      {
        text: 'Before founding Conviction, Sarah was a General Partner at which firm?',
        options: ['Sequoia', 'a16z', 'Greylock', 'Benchmark'],
        correct: 2,
      },
      {
        text: 'Sarah Guo co-hosts the "No Priors" podcast about AI with whom?',
        options: ['Sam Altman', 'Elad Gil', 'Andrew Ng', 'Emad Mostaque'],
        correct: 1,
      },
      {
        text: 'Sarah Guo studied computer science at which university?',
        options: ['MIT', 'Harvard', 'Princeton', 'Stanford'],
        correct: 3,
      },
      {
        text: 'Conviction is focused on investing in companies building in which space?',
        options: ['Crypto and DeFi', 'AI applications and infrastructure', 'Consumer social', 'Climate tech'],
        correct: 1,
      },
    ],
  },
  {
    id: 'elad',
    name: 'Elad Gil',
    title: 'Investor & Advisor',
    color: 0x9370DB,
    px: 500,  py: 740,   // tile ~6,34 — open area
    x: 15,   y: 23,
    questions: [
      {
        text: 'Elad Gil co-founded which mobile/geo startup that was acquired by Twitter?',
        options: ['Color', 'Mixer Labs', 'Summize', 'Posterous'],
        correct: 1,
      },
      {
        text: 'Elad wrote which popular handbook for founders of high-growth startups?',
        options: ['The Lean Startup', 'High Growth Handbook', 'Zero to One', 'Blitzscaling'],
        correct: 1,
      },
      {
        text: 'After the Twitter acquisition, Elad Gil served as VP of Corporate Strategy at which company?',
        options: ['Google', 'Twitter', 'Facebook', 'Airbnb'],
        correct: 1,
      },
      {
        text: 'Elad Gil is known as a prolific angel investor, with early bets in companies such as which AI lab?',
        options: ['Stable Diffusion', 'Anthropic', 'Midjourney', 'Mistral'],
        correct: 1,
      },
      {
        text: 'Elad Gil earned his PhD in biology from which institution?',
        options: ['Stanford', 'MIT', 'Harvard', 'Berkeley'],
        correct: 1,
      },
    ],
  },
  {
    id: 'andrew',
    name: 'Andrew Chen',
    title: 'General Partner, a16z',
    color: 0xFF8C00,
    px: 800,  py: 680,   // tile ~15,32 — open area
    x: 25,   y: 21,
    questions: [
      {
        text: 'Andrew Chen is a General Partner at a16z focused on which stage and area?',
        options: ['Bio & health', 'Consumer & games', 'Crypto & web3', 'Enterprise SaaS'],
        correct: 1,
      },
      {
        text: 'Andrew Chen\'s book about network effects and marketplace growth is called?',
        options: ['The Lean Marketplace', 'The Cold Start Problem', 'Network Effects Handbook', 'Growth Loops'],
        correct: 1,
      },
      {
        text: 'Before a16z, Andrew Chen led growth at which ridesharing company?',
        options: ['Airbnb', 'Lyft', 'Uber', 'DoorDash'],
        correct: 2,
      },
      {
        text: 'Andrew Chen studied computer science at which university?',
        options: ['Stanford', 'MIT', 'University of Washington', 'Caltech'],
        correct: 2,
      },
      {
        text: 'The "Cold Start Problem" Andrew Chen wrote about refers to what challenge?',
        options: ['Getting your first users when network value is low', 'Cold outreach email open rates', 'Product-market fit in winter', 'Database query optimization'], 
        correct: 0,
      },
    ],
  },
  {
    id: 'sonal',
    name: 'Sonal Chokshi',
    title: 'Former Editor-in-Chief, a16z',
    color: 0x20B2AA,
    px: 1050,  py: 620,   // tile ~24,32 — open area
    x: 32,   y: 19,
    questions: [
      {
        text: 'Before a16z, Sonal Chokshi was a senior editor at which iconic tech publication?',
        options: ['TechCrunch', 'Wired', 'The Verge', 'Fast Company'],
        correct: 1,
      },
      {
        text: 'Sonal hosted and produced the a16z Podcast for approximately how many years?',
        options: ['3 years', '5 years', '7 years', '10 years'],
        correct: 2,
      },
      {
        text: 'What official title did Sonal hold at a16z?',
        options: ['General Partner', 'Editor in Chief & Head of Content', 'CFO', 'Chief of Staff'],
        correct: 1,
      },
      {
        text: 'Sonal is known for a distinctive interview style on the a16z podcast best described as?',
        options: ['Confrontational and skeptical', 'Deeply prepared and idea-focused', 'Short and rapid-fire', 'Primarily storytelling-based'],
        correct: 1,
      },
      {
        text: 'Sonal Chokshi studied at which university?',
        options: ['Harvard', 'Stanford', 'Yale', 'Princeton'],
        correct: 1,
      },
    ],
  },
  {
    id: 'david',
    name: 'David George',
    title: 'General Partner, a16z Growth',
    color: 0xDC143C,
    px: 350,  py: 760,   // tile ~33,31 — open area
    x: 10,   y: 23,
    questions: [
      {
        text: 'David George leads which fund at a16z?',
        options: ['Bio Fund', 'Crypto Fund', 'Growth Fund', 'Seed Fund'],
        correct: 2,
      },
      {
        text: 'The a16z Growth fund typically invests at what stage?',
        options: ['Pre-seed', 'Series A', 'Late-stage growth rounds', 'Public markets only'],
        correct: 2,
      },
      {
        text: 'Before a16z, David George worked at which global growth equity firm?',
        options: ['Sequoia', 'General Atlantic', 'Tiger Global', 'KKR'],
        correct: 1,
      },
      {
        text: 'The "Rule of 40" — a metric David\'s fund uses to evaluate SaaS companies — states that growth rate plus what should exceed 40%?',
        options: ['Gross margin', 'Profit margin', 'Net revenue retention', 'Customer satisfaction score'],
        correct: 1,
      },
      {
        text: 'David George studied at which university?',
        options: ['Yale', 'Harvard', 'Dartmouth', 'Princeton'],
        correct: 0,
      },
    ],
  },
  {
    id: 'wade-foster',
    name: 'Wade Foster',
    title: 'CEO & Co-Founder, Zapier',
    color: 0xFF4A00,
    px: 700,  py: 820,   // tile ~9,36 — open area
    x: 21,   y: 25,
    questions: [
      {
        text: 'Zapier automates workflows by connecting which type of tools?',
        options: ['Physical hardware devices', 'Web apps and SaaS services', 'Databases and warehouses', 'Mobile operating systems'],
        correct: 1,
      },
      {
        text: 'Zapier is notable in the startup world for achieving a ~$5B valuation while being what?',
        options: ['Publicly traded', 'Profitable without heavy VC funding', 'Venture-backed with 10+ rounds', 'PE-owned'],
        correct: 1,
      },
      {
        text: 'Wade Foster co-founded Zapier with Bryan Helmig and whom?',
        options: ['Mike Knoop', 'Josh Kopelman', 'Aaron Levie', 'Hiten Shah'],
        correct: 0,
      },
      {
        text: 'In Zapier, automated workflows are called what?',
        options: ['Flows', 'Bots', 'Zaps', 'Chains'],
        correct: 2,
      },
      {
        text: 'Zapier was originally started at which startup accelerator?',
        options: ['500 Startups', 'Y Combinator', 'Techstars', 'AngelPad'],
        correct: 1,
      },
    ],
  },
  {
    id: 'tomer-london',
    name: 'Tomer London',
    title: 'Co-Founder & CPO, Gusto',
    color: 0xF45D48,
    px: 200,  py: 900,   // tile ~19,35 — open area
    x: 6,   y: 28,
    questions: [
      {
        text: 'Tomer London co-founded which payroll and HR platform?',
        options: ['Rippling', 'Gusto', 'Workday', 'BambooHR'],
        correct: 1,
      },
      {
        text: 'Gusto was originally launched under what name?',
        options: ['ZenPayroll', 'SimpleHR', 'PaySimple', 'FlexPay'],
        correct: 0,
      },
      {
        text: 'Tomer London\'s role at Gusto is?',
        options: ['CEO', 'CTO', 'CPO', 'COO'],
        correct: 2,
      },
      {
        text: 'Gusto primarily serves which type of business customer?',
        options: ['Fortune 500 enterprises', 'Small and medium-sized businesses', 'Government agencies', 'Gig workers only'],
        correct: 1,
      },
      {
        text: 'Gusto\'s growth is often cited as driven by strong customer love — which approach best describes this?',
        options: ['Aggressive paid acquisition', 'Customer-led growth and word-of-mouth', 'Enterprise sales team', 'Viral social media'],
        correct: 1,
      },
    ],
  },
  {
    id: 'balaji',
    name: 'Balaji Srinivasan',
    title: 'Investor & Author',
    color: 0xF7A800,
    px: 550,  py: 880,   // tile ~29,36 — open area
    x: 17,   y: 27,
    questions: [
      {
        text: 'Balaji Srinivasan wrote which book proposing internet-native governance structures?',
        options: ['The Sovereign Individual', 'The Network State', 'Exit and Voice', 'The Startup City'],
        correct: 1,
      },
      {
        text: 'Balaji served as CTO of which major cryptocurrency exchange?',
        options: ['Binance', 'Kraken', 'Coinbase', 'Gemini'],
        correct: 2,
      },
      {
        text: 'Before Coinbase, Balaji co-founded which genomics startup focused on genetic testing?',
        options: ['23andMe', 'Counsyl', 'Color Genomics', 'Genomic Health'],
        correct: 1,
      },
      {
        text: 'A "network state" as Balaji defines it is best described as?',
        options: ['A VPN-based private internet', 'A highly aligned online community that crowdfunds physical territory', 'A blockchain voting system', 'A decentralized autonomous organization'],
        correct: 1,
      },
      {
        text: 'Balaji completed his BS, MS, and PhD in electrical engineering and computer science at which university?',
        options: ['MIT', 'Harvard', 'Stanford', 'Caltech'],
        correct: 2,
      },
    ],
  },
  {
    id: 'naval',
    name: 'Naval Ravikant',
    title: 'Founder, AngelList',
    color: 0x2D2D2D,
    px: 900,  py: 960,   // tile ~6,38 — open area
    x: 28,   y: 30,
    questions: [
      {
        text: 'Naval Ravikant co-founded which platform that transformed early-stage startup investing?',
        options: ['Product Hunt', 'AngelList', 'Crunchbase', 'Republic'],
        correct: 1,
      },
      {
        text: 'Naval\'s famous 2018 tweetstorm was titled what?',
        options: ['How to Build a Startup', 'How to Get Rich (without getting lucky)', 'The Path to Financial Freedom', 'Wealth Creation for Founders'],
        correct: 1,
      },
      {
        text: '"The Almanack of Naval Ravikant" was compiled and published by whom?',
        options: ['Naval himself', 'Tim Ferriss', 'Eric Jorgenson', 'Shane Parrish'],
        correct: 2,
      },
      {
        text: 'Naval defines "specific knowledge" — a key wealth-building concept — as knowledge that is?',
        options: ['Learned in elite universities', 'Found in best-selling books', 'Cannot be taught or outsourced', 'Gained from decades of experience'],
        correct: 2,
      },
      {
        text: 'Naval co-founded which early Web 2.0 consumer review site that was later acquired by eBay?',
        options: ['Yelp', 'Epinions', 'Angie\'s List', 'Citysearch'],
        correct: 1,
      },
    ],
  },
  {
    id: 'reid-hoffman',
    name: 'Reid Hoffman',
    title: 'Co-Founder, LinkedIn',
    color: 0x0077B5,
    px: 250,  py: 1020,   // tile ~16,37 — open area
    x: 7,   y: 31,
    questions: [
      {
        text: 'Reid Hoffman co-founded which professional social network?',
        options: ['AngelList', 'LinkedIn', 'Xing', 'Viadeo'],
        correct: 1,
      },
      {
        text: 'LinkedIn was acquired by which company in 2016 for $26.2 billion?',
        options: ['Salesforce', 'Google', 'Microsoft', 'Oracle'],
        correct: 2,
      },
      {
        text: 'Reid Hoffman co-authored which book about rapidly scaling companies?',
        options: ['Blitzscaling', 'The Alliance', 'The Startup of You', 'Masters of Scale'],
        correct: 0,
      },
      {
        text: 'Before founding LinkedIn, Reid Hoffman was EVP at which internet company?',
        options: ['eBay', 'PayPal', 'Yahoo', 'Amazon'],
        correct: 1,
      },
      {
        text: 'Reid Hoffman is a partner at which venture capital firm?',
        options: ['Sequoia Capital', 'Benchmark', 'Greylock Partners', 'KPCB'],
        correct: 2,
      },
    ],
  },
  {
    id: 'wozniak',
    name: 'Steve Wozniak',
    title: 'Co-Founder, Apple',
    color: 0xA2AAAD,
    px: 650,  py: 1000,   // tile ~25,38 — open area
    x: 20,   y: 31,
    questions: [
      {
        text: 'Steve Wozniak co-founded Apple alongside Steve Jobs and whom?',
        options: ['Ronald Wayne', 'Mike Markkula', 'Bill Fernandez', 'Rod Holt'],
        correct: 0,
      },
      {
        text: 'Woz designed the Apple II, which was groundbreaking for what capability?',
        options: ['Color graphics and sound on a personal computer', 'Built-in Wi-Fi', 'A touchscreen interface', 'A built-in hard drive'],
        correct: 0,
      },
      {
        text: 'After leaving Apple, Woz organized a series of massive rock concerts in California called?',
        options: ['AppleFest', 'The US Festival', 'WozStock', 'SiliconFest'],
        correct: 1,
      },
      {
        text: 'Woz eventually completed his computer science degree at which university — using the alias Rocky Clark?',
        options: ['Stanford', 'MIT', 'UC Berkeley', 'Caltech'],
        correct: 2,
      },
      {
        text: 'Woz famously described himself relative to Steve Jobs as being the what, not the businessman?',
        options: ['Visionary', 'Engineer', 'Designer', 'Salesperson'],
        correct: 1,
      },
    ],
  },
  {
    id: 'nicole-brichtova',
    name: 'Nicole Brichtova',
    title: 'Group PM, Google DeepMind',
    color: 0x4285F4,
    px: 1000,  py: 1060,   // tile ~33,37 — open area
    x: 31,   y: 33,
    questions: [
      {
        text: 'Nicole Brichtova holds what role at Google DeepMind?',
        options: ['Principal Scientist', 'Group Product Manager', 'VP of Engineering', 'Research Director'],
        correct: 1,
      },
      {
        text: 'The a16z podcast episode featuring Nicole was about which DeepMind AI model?',
        options: ['Imagen 3', 'Nano Banana', 'Gemini Flash', 'MusicLM'],
        correct: 1,
      },
      {
        text: 'Nano Banana is primarily designed for what type of AI task?',
        options: ['Text summarization', 'Speech recognition', 'Image editing and generation', 'Video transcription'],
        correct: 2,
      },
      {
        text: 'Who was the Principal Scientist who appeared alongside Nicole on the a16z podcast episode about Nano Banana?',
        options: ['David Ha', 'Oliver Wang', 'Sander Dieleman', 'Jeff Dean'],
        correct: 1,
      },
      {
        text: 'What made Nano Banana stand out after its release in late 2025?',
        options: ['Being the largest image model ever trained', 'Going viral while being a surprisingly small, efficient model', 'Winning every academic image benchmark', 'Being the first open-source DeepMind model'],
        correct: 1,
      },
    ],
  },
  {
    id: 'tomer-cohen',
    name: 'Tomer Cohen',
    title: 'CPO, LinkedIn',
    color: 0x0A66C2,
    px: 400,  py: 1140,   // tile ~11,39 — open area
    x: 12,   y: 35,
    questions: [
      {
        text: 'Tomer Cohen serves as Chief Product Officer of which company?',
        options: ['Microsoft', 'LinkedIn', 'Salesforce', 'HubSpot'],
        correct: 1,
      },
      {
        text: 'As CPO, Tomer Cohen oversees product for a platform with approximately how many members?',
        options: ['250 million', '500 million', 'Over 1 billion', '2 billion'],
        correct: 2,
      },
      {
        text: 'LinkedIn was originally founded in which year?',
        options: ['1999', '2001', '2003', '2005'],
        correct: 2,
      },
      {
        text: 'Tomer Cohen joined LinkedIn after it was acquired by which parent company?',
        options: ['Google', 'Salesforce', 'Microsoft', 'Oracle'],
        correct: 2,
      },
      {
        text: 'Tomer Cohen has championed which capability as central to LinkedIn\'s product evolution?',
        options: ['AI-powered job matching and career coaching', 'Cryptocurrency payments for freelancers', 'AR virtual meeting rooms', 'Blockchain credential verification'],
        correct: 0,
      },
    ],
  },
  {
    id: 'alex-karp',
    name: 'Alex Karp',
    title: 'CEO, Palantir',
    color: 0x1C1C1E,
    px: 750,  py: 1160,   // tile ~22,39 — open area
    x: 23,   y: 36,
    questions: [
      {
        text: 'Alex Karp is CEO of which data analytics company?',
        options: ['Snowflake', 'Databricks', 'Palantir Technologies', 'C3.ai'],
        correct: 2,
      },
      {
        text: 'Palantir was co-founded by Alex Karp and which PayPal co-founder?',
        options: ['Elon Musk', 'Peter Thiel', 'Max Levchin', 'Reid Hoffman'],
        correct: 1,
      },
      {
        text: 'Palantir\'s platforms — Gotham and Foundry — primarily serve which customers?',
        options: ['Healthcare and pharma', 'Retail and e-commerce', 'Government and defense intelligence agencies', 'Financial services only'],
        correct: 2,
      },
      {
        text: 'Alex Karp earned his doctorate in which field from Goethe University Frankfurt?',
        options: ['Computer Science', 'Economics', 'Neoclassical social theory', 'Philosophy of law'],
        correct: 2,
      },
      {
        text: 'Palantir went public in September 2020 through which non-traditional method?',
        options: ['Traditional underwritten IPO', 'SPAC merger', 'Direct listing on the NYSE', 'Reverse merger'],
        correct: 2,
      },
    ],
  },
  {
    id: 'player',
    name: 'You',
    title: 'Tech Trivia Challenger',
    color: 0xFFD700,
    px: 640,  py: 640,   // tile ~20,20 — center of map
    x: 20,    y: 20,
    questions: [
      {
        text: '"a16z" is shorthand for Andreessen Horowitz — what does the "16" represent?',
        options: ['The year it was founded', 'The 16 letters between the A and Z in "Andreessen"', 'The number of founding partners', 'The fund number'],
        correct: 1,
      },
      {
        text: 'What type of firm is Andreessen Horowitz?',
        options: ['Hedge fund', 'Private equity buyout firm', 'Venture capital firm', 'Investment bank'],
        correct: 2,
      },
      {
        text: 'a16z is headquartered in which city?',
        options: ['San Francisco', 'Menlo Park', 'New York City', 'Austin'],
        correct: 1,
      },
      {
        text: 'Which of these is NOT a major investment focus area of a16z?',
        options: ['AI and machine learning', 'Bio and health tech', 'Real estate flipping', 'Crypto and web3'],
        correct: 2,
      },
      {
        text: 'a16z launched its first fund in 2009 with how much capital?',
        options: ['$50 million', '$150 million', '$300 million', '$1 billion'],
        correct: 2,
      },
    ],
  },
];
