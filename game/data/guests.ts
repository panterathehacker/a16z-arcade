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
    id: 'fei-fei-li',
    name: 'Dr. Fei-Fei Li',
    title: 'AI Researcher & Stanford Professor',
    color: 0x8B2FC9,
    px: 528,  py: 560,
    x: 16,   y: 17,
    questions: [
      {
        text: "What critical aspect of intelligence does Dr. Fei-Fei Li emphasize as being integral to AI development?",
        options: ["Linguistic intelligence", "Mathematical intelligence", "Spatial intelligence", "Emotional intelligence"],
        correct: 2,
      },
      {
        text: "According to Dr. Fei-Fei Li, what is a fundamental limitation of language in representing the world?",
        options: ["Language is too complex", "Language is lossy and not generative", "Language cannot encode visual and spatial information accurately", "Language is purely visual"],
        correct: 2,
      },
      {
        text: "Why does Dr. Fei-Fei Li believe that 3D spatial intelligence is essential for AI?",
        options: ["It allows AI to process linguistic data more efficiently", "It enables AI to navigate and interact with the physical world", "It helps AI generate better music", "It improves AI's emotional response capabilities"],
        correct: 1,
      },
      {
        text: "What was a significant milestone in 3D computer vision mentioned in the podcast?",
        options: ["The development of GANs", "The creation of neural radiance fields (NeRF)", "The invention of LLMs", "The introduction of blockchain technology"],
        correct: 1,
      },
      {
        text: "What does Dr. Fei-Fei Li envision as a potential application of advanced spatial intelligence in AI?",
        options: ["Creating 2D cartoons", "Enabling AI to understand human emotions", "Generating infinite virtual worlds for various purposes", "Improving text translation accuracy"],
        correct: 2,
      },
    ],
  },
  {
    id: 'michael-truell',
    name: 'Michael Truell',
    title: 'CEO, Cursor',
    color: 0x00A8E0,
    px: 880,  py: 1072,
    x: 27,   y: 33,
    questions: [
      {
        text: "What was one of the key reasons Michael Truell and his co-founders decided to start Cursor?",
        options: ["The success and usefulness of AI products like GitHub Copilot", "A desire to create a new social networking platform", "The failure of their previous startup attempt", "The opportunity to collaborate with a large tech company"],
        correct: 0,
      },
      {
        text: "Why did Cursor initially decide to focus on building an IDE instead of a model from scratch?",
        options: ["They wanted to avoid the complexities of large-scale model training initially", "They lacked the funding to build models", "They believed IDEs were a less competitive market", "They had no experience in model development"],
        correct: 0,
      },
      {
        text: "What strategy did Cursor employ to manage their scaling issues with cloud services?",
        options: ["Switching to a single cloud provider for better support", "Building their own data centers", "Using a multi-cloud approach and spreading API tokens across providers", "Hiring a large team to manage infrastructure"],
        correct: 2,
      },
      {
        text: "How did Cursor's recruitment process differ for their engineering team?",
        options: ["Candidates were required to work on a two-day project in-office", "They focused solely on traditional interview questions", "They had a remote interview process only", "They hired based on resumes only"],
        correct: 0,
      },
      {
        text: "What was one challenge mentioned that Cursor faces in the rapidly evolving AI market?",
        options: ["Competing against established tech giants like Microsoft", "Lack of interest in AI from investors", "Inability to attract skilled talent", "The market having only one major innovation moment"],
        correct: 0,
      },
    ],
  },
  {
    id: 'mati-sheetrit',
    name: 'Mati Sheetrit',
    title: 'CEO & Co-Founder, ElevenLabs',
    color: 0xFF5733,
    px: 176,  py: 1008,
    x: 5,   y: 31,
    questions: [
      {
        text: "According to Mati Sheetrit, which aspect of AI technology is poised to become a fundamental interface for human-computer interaction?",
        options: ["Voice", "Text", "Touch screens", "Keyboards"],
        correct: 0,
      },
      {
        text: "What unique approach did ElevenLabs take when building their initial team?",
        options: ["Hiring only experienced professionals from tech giants", "Recruiting people exclusively from traditional businesses", "Hiring from non-traditional backgrounds and looking for proof of excellence", "Focusing solely on candidates from Ivy League universities"],
        correct: 2,
      },
      {
        text: "What challenge has ElevenLabs set for itself in the development of AI voice technology?",
        options: ["Creating a voice that can sing in multiple languages", "Crossing the threshold of the vocal Turing test", "Developing the world's fastest text-to-speech engine", "Building an AI that can compose music"],
        correct: 1,
      },
      {
        text: "How does ElevenLabs ensure a cultural fit when scaling their team?",
        options: ["Offering high salaries and bonuses", "Applying a rigorous screening process for cultural fit", "Requiring employees to work in their headquarters", "Hiring only from within the company's network"],
        correct: 1,
      },
      {
        text: "What is a major advantage of using voice as an AI modality, according to Mati Sheetrit?",
        options: ["It is easier to program than other modalities", "Voice can convey emotions and make people feel something", "Voice technology is cheaper to develop", "It requires less data to train models"],
        correct: 1,
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
    id: 'vlad-tenev',
    name: 'Vlad Tenev',
    title: 'CEO, Robinhood',
    color: 0x00C805,
    px: 528,  py: 944,
    x: 16,   y: 29,
    questions: [
      {
        text: "What significant advantage did Robinhood have in the market when it first launched its trading platform?",
        options: ["It offered cryptocurrency trading.", "It charged zero commissions for stock trades.", "It provided stock trading only on desktop computers.", "It required high account minimums."],
        correct: 1,
      },
      {
        text: "Why did Vlad Tenev see prediction markets as valuable?",
        options: ["They provide entertainment for traders.", "They are highly regulated by the government.", "They can be considered 'truth machines' that help sift through information and predict outcomes.", "They are easier to manipulate than traditional markets."],
        correct: 2,
      },
      {
        text: "What was one of the key criticisms Vlad Tenev faced about the Robinhood platform during the GameStop incident?",
        options: ["The platform did not offer cryptocurrency trading.", "Robinhood was accused of colluding with hedge funds against retail investors.", "It was too difficult to navigate for new users.", "It had high trading fees compared to competitors."],
        correct: 1,
      },
      {
        text: "What is a significant concern people have about AI that Vlad Tenev mentioned?",
        options: ["AI's potential to replace social media platforms.", "AI's rapid product adoption rate.", "AI's potential to automate jobs, leading to job insecurity.", "AI's slow development in financial sectors."],
        correct: 2,
      },
      {
        text: "According to the podcast, what financial concept is becoming increasingly important in how assets are managed?",
        options: ["The use of prediction markets for personal budgeting.", "The decentralization of asset ownership through tokenization.", "The application of AI in traditional banks.", "The reliance on traditional stockbrokers for investment advice."],
        correct: 1,
      },
    ],
  },
  {
    id: 'mark-zuckerberg',
    name: 'Mark Zuckerberg',
    title: 'CEO, Meta',
    color: 0x1877F2,
    px: 240,  py: 848,
    x: 7,   y: 26,
    questions: [
      {
        text: "What is the main strategy of the Chan Zuckerberg Initiative (CZI) to accelerate the pace of scientific discovery?",
        options: ["Funding every lab with small grants", "Building shared tools and resources", "Focusing solely on rare diseases", "Investing in pharmaceutical companies"],
        correct: 1,
      },
      {
        text: "What is one of the primary goals of creating virtual cell models according to the podcast?",
        options: ["To replace traditional wet lab experiments entirely", "To simulate how cells behave and generate hypotheses", "To ensure all diseases are cured by 2030", "To provide a cheaper alternative to AI development"],
        correct: 1,
      },
      {
        text: "Why does the Chan Zuckerberg Initiative focus on both frontier biology and frontier AI?",
        options: ["To maximize profits in the biotech industry", "To build the most advanced AI models only", "To accelerate the development of new scientific tools", "To compete with other philanthropic organizations"],
        correct: 2,
      },
      {
        text: "According to the podcast, what was an unexpected result of creating the Cell by Gene tool?",
        options: ["It failed to gain traction among scientists", "It standardized data formats, leading to a collaborative community", "It was only used by a small number of labs", "It was abandoned in favor of a better tool"],
        correct: 1,
      },
      {
        text: "How does the Chan Zuckerberg Biohub aim to achieve its scientific goals?",
        options: ["By focusing solely on decentralized research", "By partnering with pharmaceutical companies", "By combining centralized AI models with decentralized scientific efforts", "By relying solely on university partnerships"],
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
    id: 'andrew-huberman',
    name: 'Andrew Huberman',
    title: 'Neuroscientist & Podcaster',
    color: 0xA0522D,
    px: 400,  py: 1008,
    x: 12,   y: 31,
    questions: [
      {
        text: "What is the primary concern with stimulating the sympathetic nervous system too much and too often, according to Andrew Huberman?",
        options: ["It can lead to enhanced cognitive abilities.", "It can probably shorten your life.", "It can improve muscle growth.", "It can increase creativity."],
        correct: 1,
      },
      {
        text: "What breakthrough supplement mentioned by Andrew Huberman became popular during the COVID-19 pandemic for improving the immune system?",
        options: ["Melanotan", "Creatine", "Vitamin D", "BPC-157"],
        correct: 2,
      },
      {
        text: "What is a significant future potential application of GLP-1 drugs, as discussed by Andrew Huberman?",
        options: ["Eradication of cancer", "Eradication of obesity", "Eradication of diabetes", "Eradication of heart disease"],
        correct: 1,
      },
      {
        text: "What does Huberman suggest as a simple way to control momentary anxiety?",
        options: ["Long exhale breathing", "Listening to music", "Taking a cold shower", "Drinking herbal tea"],
        correct: 0,
      },
      {
        text: "What potential risk does Andrew Huberman mention about the use of peptides like BPC-157?",
        options: ["They can cause hallucinations.", "They can lead to muscle atrophy.", "They can cause vascular growth in tumors.", "They can lead to immediate weight gain."],
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
    id: 'emmett-shear',
    name: 'Emmett Shear',
    title: 'Former CEO, Twitch & OpenAI',
    color: 0x6441A4,
    px: 112,  py: 432,
    x: 3,   y: 13,
    questions: [
      {
        text: "What is the main concept that Emmett Shear emphasizes regarding AI alignment?",
        options: ["Alignment is a fixed state that can be achieved once and for all.", "Alignment is a process that requires constant rebuilding and learning.", "Alignment is only about making AI follow human instructions.", "Alignment is best achieved by programming strict moral codes into AI."],
        correct: 1,
      },
      {
        text: "According to the podcast, what is one key difference between treating AI as a tool versus a being?",
        options: ["Tools require more complex programming than beings.", "Beings can reciprocate control, while tools cannot.", "Tools have subjective experiences similar to humans.", "Beings are easier to control than tools."],
        correct: 1,
      },
      {
        text: "What analogy does Emmett Shear use to explain the concept of alignment in relation to families?",
        options: ["Alignment is like programming a computer.", "Alignment is like a constant reknitting of fabric that keeps a family together.", "Alignment is like setting a fixed goal for a team.", "Alignment is like painting a permanent picture."],
        correct: 1,
      },
      {
        text: "What is Emmett Shear's stance on the moral progression of society?",
        options: ["Society has reached its peak moral understanding.", "Moral progress is a static achievement that doesn't require further learning.", "Moral progress is a process of constant learning and growth.", "Once moral codes are established, they should not be questioned."],
        correct: 2,
      },
      {
        text: "Why does Emmett Shear argue against the notion of an AI that only follows rules?",
        options: ["Such an AI would be too intelligent.", "It would lack true moral agency and could be dangerous.", "It would be unable to perform complex tasks.", "Rule-following AIs are too expensive to develop."],
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
    id: 'keith-rabois',
    name: 'Keith Rabois',
    title: 'Investor, Founders Fund',
    color: 0x2C3E50,
    px: 592,  py: 336,
    x: 18,   y: 10,
    questions: [
      {
        text: "What is Keith Rabois's perspective on the role of AI in the future of nations?",
        options: ["AI is not relevant to national development.", "AI should be dominated by a single American company.", "AI's importance necessitates diverse national development.", "AI will only benefit the technology sector."],
        correct: 2,
      },
      {
        text: "According to Keith Rabois, what is the primary historical precedent for GDP growth that AI could disrupt?",
        options: ["GDP growth is solely driven by wage increases.", "GDP growth is primarily fueled by resource extraction.", "GDP growth depends on international trade.", "GDP growth is limited by physical infrastructure."],
        correct: 0,
      },
      {
        text: "What did Keith Rabois indicate as a potential outcome of implementing AI in the Middle East?",
        options: ["An increase in military conflicts.", "A transformation towards technological innovation and peace.", "A decline in economic development.", "A shift towards traditional agricultural practices."],
        correct: 1,
      },
      {
        text: "What was highlighted as a key factor in disrupting industries according to the discussions in the podcast?",
        options: ["Hiring domain experts with extensive experience.", "Following traditional business models.", "Asking the right questions and leveraging new perspectives.", "Relying solely on technological advancements."],
        correct: 2,
      },
      {
        text: "In the podcast, what is mentioned as a critical mistake made by OpenDoor's previous leadership?",
        options: ["Over-investing in marketing and advertising campaigns.", "Ignoring the cyclical nature of the real estate market.", "Focusing too much on international expansion.", "Developing too many new product lines simultaneously."],
        correct: 1,
      },
    ],
  },
  {
    id: 'benedict-evans',
    name: 'Benedict Evans',
    title: 'Tech Analyst',
    color: 0x34495E,
    px: 176,  py: 1136,
    x: 5,   y: 35,
    questions: [
      {
        text: "According to Benedict Evans, what is a common pattern observed when new, exciting, world-changing technologies emerge?",
        options: ["They tend to lead bubbles.", "They are always immediately successful.", "They replace all existing technologies.", "They are always misunderstood at first."],
        correct: 0,
      },
      {
        text: "What does Benedict Evans suggest is a major challenge in predicting the future capabilities of AI technologies?",
        options: ["Lack of funding for AI research", "Inability to model the physical limits of AI technologies", "Resistance from tech industry leaders", "Incompatibility with existing infrastructure"],
        correct: 1,
      },
      {
        text: "What comparison does Benedict Evans make to illustrate how AI might become integrated into daily life, similar to past technologies?",
        options: ["The invention of the smartphone", "The automatic elevator", "The rise of social media", "The development of quantum computing"],
        correct: 1,
      },
      {
        text: "Which of the following does Benedict Evans NOT mention as a factor that has historically transformed industries during platform shifts?",
        options: ["Creation of new trillion-dollar companies", "The complete eradication of traditional industries", "Winners and losers within the tech industry", "New use cases and behaviors outside the tech industry"],
        correct: 1,
      },
      {
        text: "What is Benedict Evans' stance on the current state of AI, according to the podcast?",
        options: ["AI is overhyped and will not have significant impact", "AI is as transformative as the internet or smartphones", "AI is already at its peak potential", "AI will only benefit large tech companies like Google and Microsoft"],
        correct: 1,
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
