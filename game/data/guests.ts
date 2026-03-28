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
    px: 256,  py: 416,   // tile ~8,13 — left side path
    x: 8,     y: 13,
    questions: [
      {
        text: 'Marc co-founded a16z with whom?',
        options: ['Ben Horowitz', 'Peter Thiel', 'Reid Hoffman', 'Sam Altman'],
        correct: 0,
      },
      {
        text: 'What famous software did Marc co-create at 22?',
        options: ['Internet Explorer', 'Netscape Navigator', 'Firefox', 'Safari'],
        correct: 1,
      },
      {
        text: 'Marc wrote "Why Software Is Eating the World" for which publication?',
        options: ['New York Times', 'TechCrunch', 'Wall Street Journal', 'Wired'],
        correct: 2,
      },
      {
        text: 'Which university did Marc attend for his CS degree?',
        options: ['MIT', 'Stanford', 'University of Illinois', 'Carnegie Mellon'],
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
    px: 992,  py: 416,   // tile ~31,13 — right side path
    x: 31,    y: 13,
    questions: [
      {
        text: 'Ben Horowitz wrote which best-selling book?',
        options: ['Zero to One', 'The Hard Thing About Hard Things', 'Shoe Dog', 'No Rules Rules'],
        correct: 1,
      },
      {
        text: 'Ben was CEO of which cloud company before a16z?',
        options: ['Salesforce', 'Opsware', 'VMware', 'Citrix'],
        correct: 1,
      },
      {
        text: 'Ben is known for using lyrics from which genre in his blog posts?',
        options: ['Country', 'Jazz', 'Hip-Hop', 'Rock'],
        correct: 2,
      },
      {
        text: 'Ben served in the US military in which branch?',
        options: ['Army', 'Navy', 'Air Force', 'He did not serve'],
        correct: 3,
      },
      {
        text: 'Ben attended Columbia University for which degree?',
        options: ['MBA', 'Law', 'Computer Science', 'Economics'],
        correct: 2,
      },
    ],
  },
  {
    id: 'lisa',
    name: 'Lisa Su',
    title: 'CEO, AMD',
    color: 0xFF6B00,
    px: 480,  py: 288,   // tile ~15,9 — upper center path
    x: 15,    y: 9,
    questions: [
      {
        text: 'Lisa Su became CEO of AMD in which year?',
        options: ['2012', '2014', '2016', '2018'],
        correct: 1,
      },
      {
        text: 'AMD\'s Ryzen and EPYC chips use which architecture?',
        options: ['ARM', 'RISC-V', 'x86', 'MIPS'],
        correct: 2,
      },
      {
        text: 'Lisa Su earned her PhD from which university?',
        options: ['Stanford', 'MIT', 'Caltech', 'Harvard'],
        correct: 1,
      },
      {
        text: 'Before AMD, Lisa Su worked at which company?',
        options: ['Intel', 'IBM', 'Qualcomm', 'Texas Instruments'],
        correct: 1,
      },
      {
        text: 'AMD\'s GPU brand for consumers is called?',
        options: ['GeForce', 'Radeon', 'Quadro', 'Arc'],
        correct: 1,
      },
    ],
  },
  {
    id: 'alexandr',
    name: 'Alexandr Wang',
    title: 'CEO, Scale AI',
    color: 0x00CED1,
    px: 224,  py: 288,   // tile ~7,9 — upper left path
    x: 7,     y: 9,
    questions: [
      {
        text: 'Alexandr Wang founded Scale AI at what age?',
        options: ['17', '19', '21', '23'],
        correct: 1,
      },
      {
        text: 'Scale AI primarily provides which service to AI companies?',
        options: ['Cloud compute', 'Data labeling', 'Model training', 'LLM APIs'],
        correct: 1,
      },
      {
        text: 'Alexandr dropped out of which university to start Scale AI?',
        options: ['Stanford', 'Harvard', 'MIT', 'Princeton'],
        correct: 2,
      },
      {
        text: 'Scale AI\'s valuation reached $7B in which year?',
        options: ['2019', '2020', '2021', '2022'],
        correct: 2,
      },
      {
        text: 'Before founding Scale AI, Alexandr worked at which company as an intern?',
        options: ['Google', 'Facebook', 'Quora', 'Stripe'],
        correct: 2,
      },
    ],
  },
  {
    id: 'jensen',
    name: 'Jensen Huang',
    title: 'CEO, NVIDIA',
    color: 0x76B900,
    px: 1024, py: 288,   // tile ~32,9 — upper right path
    x: 32,    y: 9,
    questions: [
      {
        text: 'Jensen Huang co-founded NVIDIA in which year?',
        options: ['1990', '1993', '1995', '1998'],
        correct: 1,
      },
      {
        text: 'Jensen Huang is known for wearing what distinctive clothing item?',
        options: ['Top hat', 'Leather jacket', 'Turtleneck', 'Cowboy boots'],
        correct: 1,
      },
      {
        text: 'NVIDIA\'s GPU architecture for AI is called?',
        options: ['Ampere', 'Lovelace', 'Hopper', 'All of the above'],
        correct: 3,
      },
      {
        text: 'Jensen studied at which university for his BS in Electrical Engineering?',
        options: ['MIT', 'Caltech', 'Oregon State', 'Stanford'],
        correct: 2,
      },
      {
        text: 'NVIDIA\'s market cap first exceeded $1 trillion in which year?',
        options: ['2021', '2022', '2023', '2024'],
        correct: 2,
      },
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah Guo',
    title: 'Founder, Conviction',
    color: 0xFF69B4,
    px: 544,  py: 512,   // tile ~17,16 — center plaza area
    x: 17,    y: 16,
    questions: [
      {
        text: 'Sarah Guo founded which AI-focused VC firm?',
        options: ['Elad Gil Fund', 'Conviction', 'Basis Set', 'AI2 Incubator'],
        correct: 1,
      },
      {
        text: 'Before founding her firm, Sarah was a partner at which VC?',
        options: ['Sequoia', 'a16z', 'Greylock', 'Benchmark'],
        correct: 2,
      },
      {
        text: 'Sarah is known for her newsletter/podcast about which topic?',
        options: ['Crypto', 'AI/ML', 'Consumer apps', 'Fintech'],
        correct: 1,
      },
      {
        text: 'Sarah studied at which university?',
        options: ['MIT', 'Harvard', 'Princeton', 'Yale'],
        correct: 0,
      },
      {
        text: 'What is the name of Sarah Guo\'s podcast?',
        options: ['No Priors', 'Invest Like the Best', 'All-In', 'My First Million'],
        correct: 0,
      },
    ],
  },
  {
    id: 'elad',
    name: 'Elad Gil',
    title: 'Investor & Advisor',
    color: 0x9370DB,
    px: 704,  py: 416,   // tile ~22,13 — central path
    x: 22,    y: 13,
    questions: [
      {
        text: 'Elad Gil co-founded which mobile company acquired by Twitter?',
        options: ['Color', 'Mixer Labs', 'Summize', 'Posterous'],
        correct: 1,
      },
      {
        text: 'Elad wrote which popular book for startup founders?',
        options: ['The Lean Startup', 'High Growth Handbook', 'Zero to One', 'Blitzscaling'],
        correct: 1,
      },
      {
        text: 'Elad Gil was VP of Corporate Strategy at which company?',
        options: ['Google', 'Twitter', 'Facebook', 'Airbnb'],
        correct: 1,
      },
      {
        text: 'Elad is known as a prolific angel investor in which sector?',
        options: ['Fintech', 'AI startups', 'Biotech', 'Real estate'],
        correct: 1,
      },
      {
        text: 'Elad Gil earned his PhD from which institution?',
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
    px: 1056, py: 608,   // tile ~33,19 — lower right
    x: 33,    y: 19,
    questions: [
      {
        text: 'Andrew Chen is a General Partner at a16z focused on which area?',
        options: ['Bio', 'Consumer', 'Crypto', 'Enterprise'],
        correct: 1,
      },
      {
        text: 'Andrew wrote extensively about which growth concept popularized by Uber?',
        options: ['Virality', 'The Cold Start Problem', 'Network effects', 'Growth hacking'],
        correct: 1,
      },
      {
        text: 'Before a16z, Andrew led growth at which company?',
        options: ['Airbnb', 'Lyft', 'Uber', 'DoorDash'],
        correct: 2,
      },
      {
        text: 'Andrew studied at which university?',
        options: ['Stanford', 'MIT', 'University of Washington', 'Caltech'],
        correct: 2,
      },
      {
        text: 'Andrew\'s book "The Cold Start Problem" is about?',
        options: ['Climate tech', 'Network effects & marketplaces', 'Crypto cold wallets', 'Bootstrapping'],
        correct: 1,
      },
    ],
  },
  {
    id: 'sonal',
    name: 'Sonal Chokshi',
    title: 'Host, a16z Podcast',
    color: 0x20B2AA,
    px: 480,  py: 608,   // tile ~15,19 — lower center path
    x: 15,    y: 19,
    questions: [
      {
        text: 'Sonal Chokshi was editor-in-chief of which publication before a16z?',
        options: ['TechCrunch', 'Wired', 'The Verge', 'Fast Company'],
        correct: 1,
      },
      {
        text: 'Sonal hosted and produced the a16z Podcast for how many years (approx)?',
        options: ['3', '5', '7', '10'],
        correct: 2,
      },
      {
        text: 'What role did Sonal hold at a16z?',
        options: ['General Partner', 'Editor in Chief & Head of Content', 'CFO', 'Chief of Staff'],
        correct: 1,
      },
      {
        text: 'Sonal is known for her expertise in which area of media?',
        options: ['Video production', 'Long-form journalism', 'Tech podcasting', 'Newsletter writing'],
        correct: 2,
      },
      {
        text: 'Sonal studied at which university?',
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
    px: 192,  py: 640,   // tile ~6,20 — lower left
    x: 6,     y: 20,
    questions: [
      {
        text: 'David George leads which fund at a16z?',
        options: ['Bio Fund', 'Crypto Fund', 'Growth Fund', 'Seed Fund'],
        correct: 2,
      },
      {
        text: 'The a16z Growth fund typically invests at what stage?',
        options: ['Pre-seed', 'Series A', 'Late-stage / Growth', 'Public markets'],
        correct: 2,
      },
      {
        text: 'Before a16z, David George worked at which firm?',
        options: ['Sequoia', 'General Atlantic', 'Tiger Global', 'KKR'],
        correct: 1,
      },
      {
        text: 'a16z Growth focuses on companies with what characteristic?',
        options: ['Pre-revenue startups', 'Proven business models scaling fast', 'Crypto protocols', 'Public companies'],
        correct: 1,
      },
      {
        text: 'David George studied at which university?',
        options: ['Yale', 'Harvard', 'Dartmouth', 'Princeton'],
        correct: 0,
      },
    ],
  },
];
