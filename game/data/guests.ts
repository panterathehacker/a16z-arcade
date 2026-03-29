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
    px: 784,  py: 656,
    x: 24,   y: 20,
    questions: [
      {
        text: "What is one of the main differences between old media and new media as discussed in the podcast?",
        options: ["Old media focuses on being interesting while new media tries to avoid controversy.", "Old media prioritizes speed over accuracy, unlike new media.", "Old media is defense-oriented, trying to please every audience, while new media focuses on being interesting.", "Old media relies on viral content, whereas new media relies on traditional reporting."],
        correct: 2,
      },
      {
        text: "According to the podcast, what is a key characteristic of the 'flood the zone' concept?",
        options: ["Releasing information slowly to avoid overwhelming the audience.", "Focusing on a single media channel to maximize impact.", "Producing a high volume of content to dominate the conversation.", "Using traditional media outlets to ensure credibility."],
        correct: 2,
      },
      {
        text: "How does the podcast describe the impact of the internet on traditional media cycles?",
        options: ["The internet has slowed down the media cycle by requiring more verification.", "The internet has accelerated the media cycle, making it difficult for traditional media to keep up.", "The internet has had no significant impact on traditional media cycles.", "The internet has harmonized media cycles by aligning with traditional print schedules."],
        correct: 1,
      },
      {
        text: "What does the 'OODA loop' stand for in the context of decision-making?",
        options: ["Observe, Orient, Decide, Act", "Organize, Order, Develop, Assemble", "Oversee, Operate, Direct, Adapt", "Open, Offer, Deliver, Analyze"],
        correct: 0,
      },
      {
        text: "In the podcast, what is mentioned as a reason why founder CEOs are more suited for the new media landscape?",
        options: ["Founder CEOs generally avoid using social media.", "Founder CEOs have original ideas that are naturally interesting.", "Founder CEOs are trained in traditional media practices.", "Founder CEOs often have less public visibility."],
        correct: 1,
      },

    ],
  },
  {
    id: 'ben',
    name: 'Ben Horowitz',
    title: 'Co-Founder, a16z',
    color: 0x8B0000,
    px: 688,  py: 432,
    x: 21,   y: 13,
    questions: [
      {
        text: "What is one key difference between old media and new media according to Ben Horowitz?",
        options: ["Old media is more focused on creating emotional content.", "Old media is often more defensive and tries to please every audience, while new media focuses on being interesting and offensive.", "New media uses only traditional news outlets to disseminate information.", "New media avoids controversial topics to maintain a positive corporate image."],
        correct: 1,
      },
      {
        text: "What is the 'flood the zone' concept discussed in the podcast?",
        options: ["A strategy to focus on a single media channel.", "A tactic to release information in a controlled manner.", "A method where an organization releases a large amount of content across various platforms to drown out negative narratives.", "A way to prioritize traditional media outlets over new media channels."],
        correct: 2,
      },
      {
        text: "According to the podcast, what is the advantage of new media over old media when a company faces a PR crisis?",
        options: ["New media allows for faster dissemination of information to counteract negative news.", "Old media provides more credibility, making it easier to manage a crisis.", "New media has a more limited audience, reducing the spread of negative information.", "Old media's structured format helps in better crisis management."],
        correct: 0,
      },
      {
        text: "What is the 'OODA loop' and why is it important in a business context?",
        options: ["A method for improving product design by iterating quickly.", "A decision-making cycle that emphasizes speed and adaptation, allowing businesses to outpace competitors.", "A process for developing long-term strategic plans in a stable business environment.", "A strategy for minimizing risks by slowing down the decision-making process."],
        correct: 1,
      },
      {
        text: "What role do platforms like X (formerly Twitter) play in the tech world according to the podcast?",
        options: ["They are primarily used for customer service and support.", "They are used by tech companies mainly for advertising products.", "They serve as a central hub for discussion and idea formation among industry leaders and influencers.", "They are a secondary platform compared to traditional media outlets for tech announcements."],
        correct: 2,
      },

    ],
  },
  {
    id: 'jensen',
    name: 'Jensen Huang',
    title: 'CEO, NVIDIA',
    color: 0x76B900,
    px: 208,  py: 560,
    x: 6,   y: 17,
    questions: [
      {
        text: "According to Jensen Huang, why is AI considered a general purpose technology?",
        options: ["Because AI can only be used in specific industries such as healthcare and finance.", "Because AI revisits entirely the way software is built and machines are used, allowing it to be applied across any industry.", "Because AI focuses primarily on computing infrastructure.", "Because AI is only developed by a few companies worldwide."],
        correct: 1,
      },
      {
        text: "What does Jensen Huang mean by 'digital Workforce' in the context of AI?",
        options: ["AI systems that are exclusively developed and managed by technology companies.", "AI systems that can replace traditional human labor entirely.", "AI systems that need to be integrated and managed similarly to human employees, contributing to national economy and culture.", "AI systems that are only used in the telecommunications industry."],
        correct: 2,
      },
      {
        text: "Why does the podcast emphasize the importance of open source models in AI development?",
        options: ["Open source models are cheaper to develop than proprietary models.", "Open source models allow for greater collaboration and accelerate progress, particularly in niche markets.", "Open source models are more secure because they are less scrutinized.", "Open source models prevent countries from developing their own AI strategies."],
        correct: 1,
      },
      {
        text: "What challenge does Arthur encounter in running a deep tech software company like Mistral?",
        options: ["Balancing product development timelines with the unpredictable nature of scientific research.", "Finding enough skilled software engineers to work on simple coding tasks.", "Competing with larger companies in unrelated industries.", "Managing a large number of business units within the company."],
        correct: 0,
      },
      {
        text: "How does Jensen Huang suggest small and large nations should approach AI development differently?",
        options: ["Small nations should develop everything in-house, while large nations should rely on outsourcing.", "Small nations should focus on building their own chip manufacturing capabilities.", "Both should focus on establishing the right infrastructure and talent, but they should determine what to buy and what to build based on their capabilities.", "Large nations should ignore AI development as it will not impact their GDP significantly."],
        correct: 2,
      },

    ],
  },
  {
    id: 'lisa',
    name: 'Lisa Su',
    title: 'CEO, AMD',
    color: 0xFF6B00,
    px: 496,  py: 1104,
    x: 15,   y: 34,
    questions: [
      {
        text: "What is one of the key strategies Lisa Su mentions for AMD in the context of AI development?",
        options: ["Focusing solely on mobile computing technologies", "Developing closed ecosystem products to gain a competitive edge", "Creating an open ecosystem that allows developers to build AI tools", "Relying entirely on in-house manufacturing for all chip production"],
        correct: 2,
      },
      {
        text: "How does Lisa Su describe the role of semiconductors in today's technology landscape?",
        options: ["Semiconductors have limited impact on modern technology", "Semiconductors are crucial as they power everything in our lives", "Semiconductors are becoming obsolete due to new AI models", "Semiconductors are only important for mobile devices"],
        correct: 1,
      },
      {
        text: "According to the podcast, what was a significant benefit of the chips act for the semiconductor industry?",
        options: ["It reduced the cost of semiconductor components globally", "It increased the focus on semiconductor research and development in the US", "It diverted resources away from semiconductor manufacturing", "It eliminated international competition in semiconductor production"],
        correct: 1,
      },
      {
        text: "What does Lisa Su highlight as a crucial factor in AMD's product development strategy?",
        options: ["Ignoring customer feedback to focus on internal innovation", "Solely focusing on short-term market trends", "Balancing long-term development with customer insights and needs", "Developing a single product line for all market needs"],
        correct: 2,
      },
      {
        text: "What challenge does Lisa Su describe regarding the semiconductor supply chain during the pandemic?",
        options: ["A decrease in the demand for semiconductor products", "An unexpected simultaneous increase in demand across all market sectors", "A rapid decline in semiconductor workforce availability", "An oversupply of semiconductor components leading to waste"],
        correct: 1,
      },

    ],
  },
  {
    id: 'alexandr',
    name: 'Alexandr Wang',
    title: 'CEO, Scale AI',
    color: 0x00CED1,
    px: 464,  py: 688,
    x: 14,   y: 21,
    questions: [
      {
        text: "What are the three pillars of AI that Alexandr Wang discusses as crucial for AI development?",
        options: ["Compute, Data, Algorithms", "Data, Networks, Hardware", "Algorithms, Software, Infrastructure", "Marketing, Sales, Leadership"],
        correct: 0,
      },
      {
        text: "According to Alexandr Wang, what is a major challenge faced by AI labs in the current phase of AI development?",
        options: ["Lack of advanced algorithms", "Abundance of publicly available data", "Regulatory issues with data usage", "Shortage of computing power"],
        correct: 2,
      },
      {
        text: "Why does Alexandr Wang believe that the 'pure model renting business' may not be highly profitable in the long term?",
        options: ["Models are too complex to rent", "Open source models cap the pricing power", "The market for AI models is too small", "AI technology is advancing too slowly"],
        correct: 1,
      },
      {
        text: "What critical advice does Wang offer about hiring executives in a startup?",
        options: ["Hire as many executives as possible to scale quickly", "Executives should be given complete freedom immediately", "Executives should start by understanding the company culture and operations", "Avoid hiring external executives at all costs"],
        correct: 2,
      },
      {
        text: "What is the concept of 'data foundries' as explained by Alexandr Wang?",
        options: ["Data centers for storing large amounts of data", "Facilities for producing synthetic and hybrid data", "Platforms for analyzing big data", "Companies that sell AI models"],
        correct: 1,
      },

    ],
  },
  {
    id: 'sam-altman',
    name: 'Sam Altman',
    title: 'CEO, OpenAI',
    color: 0x1A1A2E,
    px: 944,  py: 1072,
    x: 29,   y: 33,
    questions: [
      {
        text: "What does Sam Altman describe as the core mission of OpenAI?",
        options: ["To build an AGI and make it very useful to people", "To become the leading consumer technology company", "To create the largest data center in the world", "To focus solely on creating hardware devices"],
        correct: 0,
      },
      {
        text: "According to Sam Altman, what has been a surprising aspect of deep learning?",
        options: ["Its reliance on extensive hardware development", "The consistent breakthroughs and progress it has enabled", "The lack of need for infrastructure support", "Its failure to integrate with consumer products"],
        correct: 1,
      },
      {
        text: "What does Sam Altman believe about the future development of AI capabilities?",
        options: ["AI will become stagnant without new breakthroughs", "Current technologies will suffice to discover the next breakthroughs", "AI development will slow down due to regulatory challenges", "A shift to new architectures is imminent and necessary"],
        correct: 1,
      },
      {
        text: "Why does Sam Altman believe vertical integration is important for OpenAI?",
        options: ["It reduces competition in the AI market", "It leads to better economic efficiency", "It ensures coherence between research, products, and infrastructure", "It allows for easier regulatory compliance"],
        correct: 2,
      },
      {
        text: "What is Sam Altman's view on the potential impact of AI on scientific progress?",
        options: ["AI will have minimal impact and is overhyped", "AI will primarily focus on consumer technology advancements", "AI will significantly accelerate scientific discoveries", "AI will replace human scientists entirely in the near future"],
        correct: 2,
      },

    ],
  },
  {
    id: 'satya',
    name: 'Satya Nadella',
    title: 'CEO, Microsoft',
    color: 0x00A4EF,
    px: 528,  py: 560,
    x: 16,   y: 17,
    questions: [
      {
        text: "Satya Nadella is known for emphasizing a 'growth mindset' at Microsoft. Which of the following best describes this concept?",
        options: ["Believing that abilities and intelligence are fixed traits", "Focusing solely on competition and market share", "Emphasizing continuous learning and adaptability", "Prioritizing short-term profits over long-term innovation"],
        correct: 2,
      },
      {
        text: "Under Satya Nadella's leadership, Microsoft has shifted its focus heavily towards cloud computing. What is the name of Microsoft's cloud platform?",
        options: ["Amazon Web Services", "Azure", "Google Cloud", "IBM Cloud"],
        correct: 1,
      },
      {
        text: "Satya Nadella has often spoken about the importance of 'tech intensity.' What does this term refer to?",
        options: ["The amount of time developers spend coding", "The rate at which a company adopts latest technologies and builds its own digital capabilities", "The pressure on tech companies to innovate rapidly", "The intensity of competition in the tech industry"],
        correct: 1,
      },
      {
        text: "Satya Nadella has highlighted the role of artificial intelligence in transforming industries. Which of the following is a key principle he advocates for AI development?",
        options: ["Prioritizing AI development over ethical concerns", "Focusing exclusively on AI's potential to replace human jobs", "Ensuring AI systems are transparent and accountable", "Using AI primarily for entertainment purposes"],
        correct: 2,
      },
      {
        text: "In relation to digital transformation, Satya Nadella has stressed the importance of which of the following strategies for businesses?",
        options: ["Maintaining traditional business models at all costs", "Adopting a 'wait and see' approach to new technologies", "Integrating digital technology into all areas of business to fundamentally change how they operate", "Focusing only on hardware advancements"],
        correct: 2,
      },

    ],
  },
  {
    id: 'brian-chesky',
    name: 'Brian Chesky',
    title: 'CEO & Co-Founder, Airbnb',
    color: 0xFF5A5F,
    px: 880,  py: 1072,
    x: 27,   y: 33,
    questions: [
      {
        text: "Brian Chesky is known for emphasizing the importance of creating a unique, personalized experience for customers. Which of the following strategies best aligns with this principle?",
        options: ["Offering standardized, identical services across all locations.", "Focusing solely on price competitiveness.", "Customizing services to reflect local culture and individual guest preferences.", "Implementing a strict, uniform policy for all customer interactions."],
        correct: 2,
      },
      {
        text: "In the early days of Airbnb, Brian Chesky and his co-founders used an innovative growth hacking technique to increase listings. What was this technique?",
        options: ["Offering massive discounts to early adopters.", "Running a targeted social media campaign.", "Leveraging the Craigslist platform to cross-post listings.", "Engaging in traditional TV advertising."],
        correct: 2,
      },
      {
        text: "Brian Chesky has often spoken about the importance of 'design thinking' in business. Which of the following best describes this concept?",
        options: ["Prioritizing aesthetics over functionality in product development.", "Applying a user-centered approach to solve complex problems.", "Focusing on marketing strategies before product design.", "Delegating design decisions exclusively to a specialized team."],
        correct: 1,
      },
      {
        text: "Chesky emphasizes the concept of 'belonging' in the Airbnb brand. What business practice does this idea primarily influence?",
        options: ["Developing a strong internal corporate hierarchy.", "Fostering inclusivity and community among users.", "Maximizing short-term profits over long-term goals.", "Centralizing business operations."],
        correct: 1,
      },
      {
        text: "Brian Chesky predicted a shift in travel behavior, particularly accelerated by the COVID-19 pandemic. What is one key aspect of this prediction?",
        options: ["An increase in long-term stays as remote work becomes more common.", "A significant decline in international travel interest.", "A move towards traditional hotel stays over home-sharing.", "A decrease in the use of technology in travel planning."],
        correct: 0,
      },

    ],
  },
  {
    id: 'patrick-collison',
    name: 'Patrick Collison',
    title: 'CEO & Co-Founder, Stripe',
    color: 0x6772E5,
    px: 176,  py: 1008,
    x: 5,   y: 31,
    questions: [
      {
        text: "Patrick Collison, CEO of Stripe, is known for advocating which of the following approaches to improve innovation speed in organizations?",
        options: ["Emphasizing a bureaucratic hierarchy", "Promoting a culture of experimentation and iteration", "Focusing solely on short-term profits", "Encouraging a strict adherence to traditional business models"],
        correct: 1,
      },
      {
        text: "What is one of the key insights Patrick Collison has shared about the future of financial technology (fintech)?",
        options: ["Fintech will likely slow down due to regulatory pressures", "Collaboration between traditional banks and fintech companies is essential", "Cryptocurrencies will completely replace traditional currencies in the near future", "Fintech innovation should primarily focus on developing new physical bank branches"],
        correct: 1,
      },
      {
        text: "Patrick Collison has emphasized the importance of which practice for entrepreneurs to effectively scale their startups?",
        options: ["Avoiding all forms of risk", "Investing in extensive initial market research before any product launch", "Building a strong and adaptable company culture", "Focusing only on local markets and ignoring global expansion"],
        correct: 2,
      },
      {
        text: "Which prediction has Patrick Collison made regarding the role of artificial intelligence in business?",
        options: ["AI will have a minimal impact on business practices", "AI will only be beneficial in the tech industry", "AI will transform various industries and increase productivity", "AI will mainly replace human workers without adding value"],
        correct: 2,
      },
      {
        text: "According to Patrick Collison, what is a crucial factor for a startup to succeed in the competitive tech industry?",
        options: ["Having the largest marketing budget", "Copying successful business models from established companies", "Understanding and solving real customer problems", "Focusing on short-term gains rather than long-term vision"],
        correct: 2,
      },

    ],
  },
  {
    id: 'dario-amodei',
    name: 'Dario Amodei',
    title: 'CEO & Co-Founder, Anthropic',
    color: 0xCC785C,
    px: 592,  py: 720,
    x: 18,   y: 22,
    questions: [
      {
        text: "What was the significant moment for Dario Amodei that led to the belief in the potential of scaling laws in AI?",
        options: ["The development of GPT-2 in 2019", "The creation of support vector machines", "The initial success of neural networks", "The launch of OpenAI's first project"],
        correct: 0,
      },
      {
        text: "According to Dario Amodei, what is the primary factor that will allow AI models to continue improving significantly?",
        options: ["Increased investment in AI", "Better human feedback mechanisms", "Advancements in neuroscience", "Deployment of new AI algorithms"],
        correct: 0,
      },
      {
        text: "What approach does Anthropic propose for steering AI values and outputs, as an alternative to RL from human feedback?",
        options: ["Constitutional AI", "Machine learning from scratch", "Unsupervised deep learning", "Community-based feedback"],
        correct: 0,
      },
      {
        text: "Why does Dario Amodei believe physicists have an advantage in the fast-moving field of AI?",
        options: ["They have a strong background in biology", "Their generalist skills outperform specialists in rapidly evolving fields", "They have extensive experience in AI and machine learning", "They understand AI algorithms better than computer scientists"],
        correct: 1,
      },
      {
        text: "What is a significant challenge for Anthropic as it scales its operations and team?",
        options: ["Maintaining high talent density while growing", "Finding new sources of funding", "Developing new AI algorithms", "Expanding into international markets"],
        correct: 0,
      },

    ],
  },
  {
    id: 'chris-dixon',
    name: 'Chris Dixon',
    title: 'General Partner, a16z Crypto',
    color: 0xF7931A,
    px: 1200,  py: 1008,
    x: 37,   y: 31,
    questions: [
      {
        text: "What is one of the exponential forces mentioned by Chris Dixon that has significantly impacted the tech industry?",
        options: ["Composability", "Linear growth", "Market saturation", "Brand loyalty"],
        correct: 0,
      },
      {
        text: "According to Chris Dixon, what is the crucial aspect for a founder to consider when building a tool?",
        options: ["Prioritizing network effects from the beginning", "Focusing solely on product aesthetics", "Avoiding any form of competition", "Ensuring the product is priced competitively"],
        correct: 0,
      },
      {
        text: "What tactic did Instagram initially use to gain traction, according to Chris Dixon?",
        options: ["Offering cool filters for free and piggybacking off other networks", "Launching a massive marketing campaign", "Developing an advanced AI algorithm", "Partnering with major celebrities for endorsements"],
        correct: 0,
      },
      {
        text: "What does Chris Dixon identify as a major challenge for companies leveraging AI tools?",
        options: ["The high cost of entry into the market", "The difficulty in building a brand", "The challenge of transitioning from tools to networks", "The lack of consumer interest in AI"],
        correct: 2,
      },
      {
        text: "What does Chris Dixon mean by the term 'skuomorphic' in the context of technology and design?",
        options: ["Creating new designs that resemble older forms", "Developing entirely new user interfaces", "Designing software with a focus on minimalism", "Using only text-based command interfaces"],
        correct: 0,
      },

    ],
  },
  {
    id: 'sarah',
    name: 'Sarah Guo',
    title: 'Founder, Conviction',
    color: 0xFF69B4,
    px: 528,  py: 944,
    x: 16,   y: 29,
    questions: [
      {
        text: "Sarah Guo emphasizes the importance of which approach when investing in early-stage technology startups?",
        options: ["Focusing solely on financial metrics", "Prioritizing the product-market fit", "Investing only in established markets", "Avoiding risk at all costs"],
        correct: 1,
      },
      {
        text: "What is a key insight Sarah Guo shares about artificial intelligence's impact on business?",
        options: ["AI will only benefit the tech industry", "AI will replace all human jobs", "AI has the potential to create entirely new markets", "AI is a temporary trend with limited impact"],
        correct: 2,
      },
      {
        text: "According to Sarah Guo, what is a crucial factor for entrepreneurs to succeed in the tech industry?",
        options: ["Having a large initial investment", "Building a diverse and adaptable team", "Relying on traditional business models", "Focusing only on short-term gains"],
        correct: 1,
      },
      {
        text: "How does Sarah Guo view the role of conviction in entrepreneurship and investment?",
        options: ["As a minor factor in decision-making", "As something that should be avoided", "As an essential driver for making bold decisions", "As irrelevant in the face of market data"],
        correct: 2,
      },
      {
        text: "Sarah Guo has highlighted the importance of which of the following in the evolution of AI technologies?",
        options: ["Keeping AI developments secret", "Fostering open collaboration and sharing", "Limiting AI to academic settings", "Focusing only on software improvements"],
        correct: 1,
      },

    ],
  },
  {
    id: 'elad',
    name: 'Elad Gil',
    title: 'Investor & Advisor',
    color: 0x9370DB,
    px: 240,  py: 848,
    x: 7,   y: 26,
    questions: [
      {
        text: "Elad Gil is known for his insights on 'product-market fit.' According to him, what is a critical sign that a startup has achieved product-market fit?",
        options: ["Consistent customer growth without significant marketing effort", "High initial profit margins", "A robust, scalable business model", "A diverse product line catering to multiple market segments"],
        correct: 0,
      },
      {
        text: "Elad Gil often discusses the importance of market size in startups. What is his advice regarding market selection?",
        options: ["Always enter a market with no competition", "Focus on a niche market to avoid competitors", "Choose a large and growing market to increase chances of success", "Prioritize markets with the highest potential profit margins"],
        correct: 2,
      },
      {
        text: "Which of the following is a key concept from Elad Gil's perspective on scaling startups?",
        options: ["Focus only on horizontal scaling from the start", "Prioritize building a strong company culture as you scale", "Delay scaling until the product is perfect", "Outsource all non-core functions to maximize efficiency"],
        correct: 1,
      },
      {
        text: "Elad Gil has made predictions about the future of artificial intelligence. What is one of his predictions regarding AI's impact on the job market?",
        options: ["AI will completely replace all human jobs within the next decade", "AI will primarily impact low-skill jobs with minimal effect on high-skill jobs", "AI will lead to the creation of new job categories and opportunities", "AI will have little to no impact on the job market"],
        correct: 2,
      },
      {
        text: "Elad Gil emphasizes the importance of network effects in tech startups. What best describes a network effect?",
        options: ["The company's value decreases as more users join", "The company's value remains constant regardless of user growth", "The company's value increases as more users join, enhancing the product's value", "The company's value is unaffected by the number of users"],
        correct: 2,
      },

    ],
  },
  {
    id: 'andrew',
    name: 'Andrew Chen',
    title: 'General Partner, a16z',
    color: 0xFF8C00,
    px: 816,  py: 592,
    x: 25,   y: 18,
    questions: [
      {
        text: "According to Andrew Chen, what is a recurring phenomenon when new technologies emerge?",
        options: ["They are immediately accepted and integrated into society", "They face a moral panic where they are considered evil or dangerous", "They are initially ignored and then rapidly adopted", "They are always developed by governments before the private sector"],
        correct: 1,
      },
      {
        text: "What does Andrew Chen suggest is a major reason why large government-led projects like the Manhattan Project are less feasible today?",
        options: ["Government funding has decreased significantly", "The private sector now attracts the type of talent needed for such projects", "There is less interest in large-scale innovations", "Technological advancements have plateaued"],
        correct: 1,
      },
      {
        text: "How does Andrew Chen view the potential for AI in the realm of gaming?",
        options: ["AI will mostly automate existing gaming processes", "AI presents an opportunity to create a new form of immersive entertainment", "AI will only be used for backend processes", "AI will replace human game developers entirely"],
        correct: 1,
      },
      {
        text: "What is one argument Andrew Chen gives for why open-source AI is important?",
        options: ["It allows large companies to maintain control over AI development", "It reduces the cost of AI development significantly", "It enables widespread implementation of AI in various use cases", "It is easier to regulate than proprietary AI"],
        correct: 2,
      },
      {
        text: "What does Andrew Chen identify as a potential new medium emerging from AI, distinct from traditional games or movies?",
        options: ["Interactive documentaries", "Virtual reality novels", "Dream-like experiences tailored to the user", "Augmented reality puzzles"],
        correct: 2,
      },

    ],
  },
  {
    id: 'sonal',
    name: 'Sonal Chokshi',
    title: 'Former Editor-in-Chief, a16z',
    color: 0x20B2AA,
    px: 400,  py: 1008,
    x: 12,   y: 31,
    questions: [
      {
        text: "What is a key insight Sonal Chokshi emphasizes about the role of technology in modern business?",
        options: ["Technology should be used solely for cost-cutting measures.", "Technology acts as a powerful enabler for new business models and innovation.", "Technology is a replacement for traditional business practices.", "Technology should be restricted to IT departments only."],
        correct: 1,
      },
      {
        text: "According to Sonal Chokshi, what is a crucial factor for entrepreneurs when considering scaling their business?",
        options: ["Focusing exclusively on acquiring venture capital.", "Prioritizing short-term profits over long-term growth.", "Understanding and leveraging network effects to enhance scalability.", "Avoiding risks and maintaining status quo."],
        correct: 2,
      },
      {
        text: "Sonal Chokshi is known for discussing the importance of the 'flywheel effect' in business. What does this concept refer to?",
        options: ["A mechanism where businesses rely on a single product for success.", "A strategy where constant promotions drive short-term sales.", "A self-reinforcing cycle of growth where each success builds momentum for the next.", "A financial model focusing on high debt and leverage."],
        correct: 2,
      },
      {
        text: "What prediction has Sonal Chokshi made about the future impact of artificial intelligence (AI) on industries?",
        options: ["AI will replace all human jobs by 2030.", "AI will primarily benefit only the tech sector.", "AI will increasingly augment human capabilities, leading to enhanced productivity across various industries.", "AI will lead to a decrease in the need for skilled labor."],
        correct: 2,
      },
      {
        text: "According to Sonal Chokshi, how should businesses approach the integration of new technologies?",
        options: ["Adopt new technologies rapidly without assessment.", "Wait for competitors to adopt technologies first before considering integration.", "Evaluate how new technologies align with business goals and can drive value.", "Implement every new technology to stay ahead in the industry."],
        correct: 2,
      },

    ],
  },
  {
    id: 'david',
    name: 'David George',
    title: 'General Partner, a16z Growth',
    color: 0xDC143C,
    px: 720,  py: 1136,
    x: 22,   y: 35,
    questions: [
      {
        text: "What is one of the reasons why AI companies are growing faster than their SaaS counterparts?",
        options: ["They spend more on sales and marketing.", "They have higher gross margins.", "End customer demand for AI products is very strong.", "They use more traditional business models."],
        correct: 2,
      },
      {
        text: "According to the podcast, how should pre-AI companies adapt to remain competitive?",
        options: ["Focus solely on increasing their marketing budgets.", "Incorporate AI into their products and reimagine product workflows.", "Avoid AI and double down on their core offerings.", "Merge with AI-native companies."],
        correct: 1,
      },
      {
        text: "What is meant by 'ARR per FTE' as discussed in the podcast?",
        options: ["Average Revenue Rate per Full-Time Employee", "Annual Recurring Revenue per Full-Time Employee", "Accumulative Revenue Rank per Financial Transaction", "Annual Resource Requirement per Financial Expense"],
        correct: 1,
      },
      {
        text: "How has the lifespan of companies on the S&P 500 changed over the last 50 years?",
        options: ["It has increased by 40%.", "It has remained stable.", "It has declined by 40%.", "It has declined by 10%."],
        correct: 2,
      },
      {
        text: "What is a key factor for the successful transformation of companies into AI-native organizations?",
        options: ["Increasing the number of employees.", "Having leadership that deeply understands and prioritizes AI.", "Cutting costs in all departments.", "Switching entirely to consumption-based business models."],
        correct: 1,
      },

    ],
  },
  {
    id: 'wade-foster',
    name: 'Wade Foster',
    title: 'CEO & Co-Founder, Zapier',
    color: 0xFF4A00,
    px: 496,  py: 336,
    x: 15,   y: 10,
    questions: [
      {
        text: "What was one of the key strategies Wade Foster used to acquire early customers for Zapier?",
        options: ["Advertising on social media platforms", "Commenting on community forums of SaaS vendors", "Partnering with large enterprises", "Offering free trials to university students"],
        correct: 1,
      },
      {
        text: "How did Zapier's team decide on their initial pricing strategy?",
        options: ["They hired a pricing expert consultant", "They chose random prices based on competitor pricing", "They used the Fibonacci sequence for pricing tiers", "They conducted a comprehensive market analysis"],
        correct: 2,
      },
      {
        text: "What is one reason Wade Foster believed Zapier's PLG (product-led growth) strategy worked effectively?",
        options: ["They focused solely on enterprise customers", "They had a repeatable engine for acquiring customers", "They avoided direct customer interaction", "They invested heavily in traditional marketing"],
        correct: 1,
      },
      {
        text: "According to Wade Foster, what is crucial for ensuring a successful product-led growth strategy?",
        options: ["Avoiding customer feedback to prevent negative impact on the product", "Prioritizing the ease of onboarding and user experience", "Offering the lowest price in the market", "Focusing exclusively on technical users"],
        correct: 1,
      },
      {
        text: "What unique aspect did Zapier incorporate into their initial pricing plan names?",
        options: ["Names of famous entrepreneurs", "Names of their founding team members", "Names related to electrical terms like amps, volts, and ohms", "Names of popular tech companies"],
        correct: 2,
      },

    ],
  },
  {
    id: 'tomer-london',
    name: 'Tomer London',
    title: 'Co-Founder & CPO, Gusto',
    color: 0xF45D48,
    px: 1008,  py: 624,
    x: 31,   y: 19,
    questions: [
      {
        text: "What was the initial target customer segment for Gusto when they first launched?",
        options: ["California companies with salaried employees only", "Small businesses with hourly employees nationwide", "Large enterprises with complex HR needs", "Startups in the tech industry with remote employees"],
        correct: 0,
      },
      {
        text: "According to Tomer London, what is one key factor in choosing early customers that contributed to Gusto's success?",
        options: ["Customers who are willing to pay a premium price", "Customers who provide valuable and specific feedback", "Customers who require minimal customer support", "Customers who have a large number of employees"],
        correct: 1,
      },
      {
        text: "How did Gusto initially gain the trust of small businesses despite being a new startup?",
        options: ["By offering the lowest prices in the market", "By showcasing customer testimonials and funding details", "By initially partnering with only large corporations", "By providing 24/7 customer support from day one"],
        correct: 1,
      },
      {
        text: "What strategy did Gusto use to improve their product based on early customer interactions?",
        options: ["They focused solely on digital marketing campaigns", "They hired a large team of sales representatives", "They spent time physically observing customers using the product", "They outsourced customer support to a third-party"],
        correct: 2,
      },
      {
        text: "What unexpected customer group did Gusto find to be a valuable advocate for their service?",
        options: ["Marketing agencies", "Accountants", "Software developers", "Retail store managers"],
        correct: 1,
      },

    ],
  },
  {
    id: 'balaji',
    name: 'Balaji Srinivasan',
    title: 'Investor & Author',
    color: 0xF7A800,
    px: 432,  py: 912,
    x: 13,   y: 28,
    questions: [
      {
        text: "What is the primary reason Balaji Srinivasan mentions for the decline in the number of IPOs in the tech industry?",
        options: ["The rise of private equity models", "The impact of the Sarbanes-Oxley Act", "Increased competition from international markets", "A shift in consumer technology preferences"],
        correct: 1,
      },
      {
        text: "How does Balaji Srinivasan describe the internet's role in the modern economy?",
        options: ["As a primary actor that is invisible", "As a regulated industry", "As a supporting tool for government operations", "As a declining factor in economic growth"],
        correct: 0,
      },
      {
        text: "According to the podcast, what was a significant outcome of the FTC and DOJ's actions on tech mergers and acquisitions?",
        options: ["They increased the number of successful IPOs", "They caused a market consolidation among smaller tech firms", "They led to the emergence of new deal structures like 'aquifier'", "They improved the competitive landscape for startups"],
        correct: 2,
      },
      {
        text: "What does the 'aquifier' deal structure entail, as discussed in the podcast?",
        options: ["A complete acquisition of a company including its brand", "A focus on acquiring only the top talent of a company", "A merger of two startups of similar size", "An acquisition that involves no transfer of staff"],
        correct: 1,
      },
      {
        text: "What analogy does Balaji Srinivasan use to describe the ultimate impact of the internet on traditional governance systems?",
        options: ["Like a new competitor in a well-established market", "Like a peaceful, invisible expansion taking regulatory power", "Like a temporary trend that will fade away", "Like a supportive partner to government initiatives"],
        correct: 1,
      },

    ],
  },
  {
    id: 'naval',
    name: 'Naval Ravikant',
    title: 'Founder, AngelList',
    color: 0x2D2D2D,
    px: 112,  py: 432,
    x: 3,   y: 13,
    questions: [
      {
        text: "Naval Ravikant emphasizes the importance of 'specific knowledge' in achieving personal success. What does 'specific knowledge' refer to?",
        options: ["Knowledge that is widely available and can be learned through formal education", "Highly technical skills that are only relevant in the tech industry", "Unique skills and insights that are difficult to automate and cannot be taught in a standardized way", "General understanding of multiple subjects to adapt to any industry"],
        correct: 2,
      },
      {
        text: "Naval Ravikant often speaks about the concept of 'leverage' in business. Which of the following is NOT a form of leverage according to him?",
        options: ["Capital", "Labor", "Code", "Luck"],
        correct: 3,
      },
      {
        text: "Naval Ravikant has expressed views on wealth and happiness. According to him, what is one key to achieving happiness?",
        options: ["Accumulating as much wealth as possible", "Constantly seeking new experiences", "Understanding and controlling your own desires", "Building a large social network"],
        correct: 2,
      },
      {
        text: "Naval Ravikant discusses the role of reading in personal growth. What type of reading does he advocate for?",
        options: ["Reading every book that comes your way", "Reading only bestsellers and acclaimed works", "Reading what genuinely interests you and sparks curiosity", "Focusing on reading to gain technical skills"],
        correct: 2,
      },
      {
        text: "Naval Ravikant highlights the importance of 'compound interest' in which aspect of life?",
        options: ["Only in financial investments", "In both financial investments and personal relationships", "Exclusively in career development", "Only in educational pursuits"],
        correct: 1,
      },

    ],
  },
  {
    id: 'reid-hoffman',
    name: 'Reid Hoffman',
    title: 'Co-Founder, LinkedIn',
    color: 0x0077B5,
    px: 144,  py: 624,
    x: 4,   y: 19,
    questions: [
      {
        text: "What is one of the fundamental 'religions' of Silicon Valley, according to Reid Hoffman?",
        options: ["Starting with an amazing product even without a clear business model", "Focusing solely on immediate profitability", "Avoiding disruption at all costs", "Prioritizing credentialism over innovation"],
        correct: 0,
      },
      {
        text: "According to Reid Hoffman, what is a classic blind spot of Silicon Valley?",
        options: ["Overestimating the impact of hardware", "Believing everything should be done in software and bits", "Ignoring the potential of traditional industries", "Underestimating the cost of technological disruption"],
        correct: 1,
      },
      {
        text: "In the context of AI, what does Reid Hoffman suggest is a mistake when thinking about disruptive changes?",
        options: ["Assuming everything changes instead of significant things changing", "Focusing only on productivity benefits", "Investing solely in existing successful platforms", "Relying entirely on expert opinions"],
        correct: 0,
      },
      {
        text: "What is a key reason why LinkedIn has remained durable according to the podcast?",
        options: ["Its ability to constantly change its core purpose", "The difficulty in replicating its professional network", "Its focus on social media trends", "Its reliance on advertising revenue"],
        correct: 1,
      },
      {
        text: "What is Hoffman's perspective on the potential impact of AI on professions like medicine?",
        options: ["AI will completely replace doctors in a few years", "Doctors will become expert users of AI knowledge stores", "AI has no place in medical professions due to ethical concerns", "AI will only assist in administrative tasks within medicine"],
        correct: 1,
      },

    ],
  },
  {
    id: 'wozniak',
    name: 'Steve Wozniak',
    title: 'Co-Founder, Apple',
    color: 0xA2AAAD,
    px: 976,  py: 1136,
    x: 30,   y: 35,
    questions: [
      {
        text: "What was Steve Wozniak's primary motivation for starting Apple?",
        options: ["To become one of the biggest businesses in the world", "To create a computer for himself and others", "To compete with government technology", "To design music devices"],
        correct: 1,
      },
      {
        text: "According to Steve Wozniak, what is more important than just speaking facts and knowledge?",
        options: ["Having a PhD", "Motivating students to learn", "Building the most advanced technology", "Winning awards"],
        correct: 1,
      },
      {
        text: "What distinguishes an inventor from an engineer, according to Wozniak?",
        options: ["Inventors work strictly with existing technologies", "Inventors often have a long-term vision without immediate action", "Inventors want to create new things and run experiments quickly", "Inventors need to follow strict guidelines"],
        correct: 2,
      },
      {
        text: "How does Steve Wozniak view the difference between government and private technology development?",
        options: ["Government is more innovative and flexible", "Private industry has more resources and is more stable", "Government approaches are often stale, while private industry fosters creativity", "Private industry cannot compete with government resources"],
        correct: 2,
      },
      {
        text: "What was a turning point for Apple's success after the Apple II, as mentioned by Wozniak?",
        options: ["The release of the Macintosh", "The introduction of the Apple Watch", "The success of the iPod", "The partnership with Microsoft"],
        correct: 2,
      },

    ],
  },
  {
    id: 'nicole-brichtova',
    name: 'Nicole Brichtova',
    title: 'Group PM, Google DeepMind',
    color: 0x4285F4,
    px: 368,  py: 592,
    x: 11,   y: 18,
    questions: [
      {
        text: "What was a significant challenge that the Nano Banana model aimed to address in image generation?",
        options: ["Increasing the speed of image generation", "Improving character consistency in generated images", "Reducing the cost of model training", "Simplifying the user interface for non-technical users"],
        correct: 1,
      },
      {
        text: "According to the podcast, how are AI models expected to change the field of creative arts?",
        options: ["By replacing artists entirely with automated generation", "By shifting the focus from creativity to technical skills", "By allowing artists to spend more time on creative tasks rather than tedious manual operations", "By making traditional art education obsolete"],
        correct: 2,
      },
      {
        text: "What was a notable 'wow moment' mentioned in the podcast about the Nano Banana model's performance?",
        options: ["The model could generate a perfect 3D representation from a single image", "The model's release on Ellarina led to unexpectedly high user engagement and demand", "The model could autonomously create entire novels", "The model's ability to understand multiple languages without additional training"],
        correct: 1,
      },
      {
        text: "What role do the podcast guests see AI models playing in education in the future?",
        options: ["Replacing teachers entirely in the classroom", "Providing personalized and visual learning aids to enhance understanding", "Creating standardized tests for global educational systems", "Focusing solely on STEM subjects, ignoring the arts"],
        correct: 1,
      },
      {
        text: "What is the primary reason the guests believe artists might initially react negatively to AI-generated art?",
        options: ["AI models have no sense of style or taste", "AI models are too expensive to use", "AI-generated art lacks the human intent and control over the creative process", "AI models are unable to generate realistic images"],
        correct: 2,
      },

    ],
  },
  {
    id: 'tomer-cohen',
    name: 'Tomer Cohen',
    title: 'CPO, LinkedIn',
    color: 0x0A66C2,
    px: 592,  py: 336,
    x: 18,   y: 10,
    questions: [
      {
        text: "What is a key focus of Tomer Cohen's approach to product development at LinkedIn?",
        options: ["Prioritizing user engagement over user growth", "Focusing on building a skill-first platform to enhance professional development", "Increasing advertisement revenue through targeted ads", "Developing standalone applications for niche professional sectors"],
        correct: 1,
      },
      {
        text: "Tomer Cohen emphasizes the importance of which factor in driving innovation within a tech company?",
        options: ["Strict hierarchical management", "A high-risk, high-reward approach", "A collaborative culture that encourages diverse perspectives", "Focusing solely on short-term financial gains"],
        correct: 2,
      },
      {
        text: "According to Tomer Cohen, what is crucial for creating a successful AI-driven feature on a platform like LinkedIn?",
        options: ["Using AI to replace human decision-making entirely", "Ensuring data privacy and ethical use of AI", "Developing AI without user feedback", "Focusing solely on increasing automation"],
        correct: 1,
      },
      {
        text: "Which strategy does Tomer Cohen advocate for to support continuous learning and skill development on LinkedIn?",
        options: ["Offering only premium courses behind a paywall", "Creating partnerships with educational institutions for course content", "Using gamification to increase user engagement without focusing on learning", "Providing a one-size-fits-all learning solution for all users"],
        correct: 1,
      },
      {
        text: "What is one of Tomer Cohen's predictions about the future of work that influences LinkedIn's platform strategy?",
        options: ["Remote work will decline as companies push for in-office presence", "Gig economy jobs will vanish due to automation", "Networking and skill-building will become more crucial in a hybrid work environment", "AI will replace most human jobs, reducing the need for professional networking"],
        correct: 2,
      },

    ],
  },
  {
    id: 'alex-karp',
    name: 'Alex Karp',
    title: 'CEO, Palantir',
    color: 0x1C1C1E,
    px: 176,  py: 1136,
    x: 5,   y: 35,
    questions: [
      {
        text: "Alex Karp has emphasized the importance of 'forward-deployed engineers' in Palantir's business model. What is the primary role of these engineers?",
        options: ["To work closely with clients to tailor software solutions to their specific needs", "To develop marketing strategies for Palantir's software products", "To oversee the financial operations and budgeting within Palantir", "To conduct research and development for new technological innovations"],
        correct: 0,
      },
      {
        text: "What key belief about data privacy does Alex Karp hold, which influences Palantir's approach to data analytics?",
        options: ["Data privacy is a fundamental right and should be prioritized in all software solutions", "Data should be freely accessible to all businesses for innovation", "Data privacy is less important than national security", "Data should be owned and controlled entirely by governmental agencies"],
        correct: 0,
      },
      {
        text: "Alex Karp has spoken about the necessity of 'creative friction' in teams. What does this concept entail?",
        options: ["Encouraging diverse viewpoints and debates to foster innovation", "Hiring only individuals with similar backgrounds to ensure smooth operations", "Limiting communication within teams to avoid conflicts", "Prioritizing consensus and harmony over individual ideas"],
        correct: 0,
      },
      {
        text: "Alex Karp has highlighted the significance of adaptability in business. Which approach does he advocate for ensuring a company's resilience?",
        options: ["Constantly adjusting business models and strategies in response to changing environments", "Focusing on a single long-term strategy regardless of market changes", "Avoiding technological advancements to maintain stability", "Relying solely on historical data to predict future trends"],
        correct: 0,
      },
      {
        text: "Palantir, under Alex Karp's leadership, has a unique stance on going public. What was one of the reasons Alex Karp delayed Palantir's IPO?",
        options: ["To ensure the company was culturally and operationally ready for the transparency required by public markets", "To avoid the regulatory scrutiny that comes with being a public company", "Because the company was experiencing financial instability", "Due to a lack of interest from potential investors"],
        correct: 0,
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
