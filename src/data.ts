import { ServiceItem, MetricCard, HowItWorksStep, EngagementModel } from "./types";

export const HERO_CONTENT = {
  headline: "Every great property developer has an assistant.",
  subheadline: "Property development is demanding. Dev Mate provides hands-on, practical support to help you keep projects moving, stay organised, and get your time back.",
  callout: "You don't have to carry the whole project on your own",
  ctaText: "Let's Talk",
};

export const METRICS_CONTENT = {
  cards: [
    { value: "10+", label: "Development Projects", category: "Track Record" },
    { value: "$35M+", label: "Project Value", category: "Capital Value" },
    { value: "$150K", label: "Business Savings", category: "Negotiation" }
  ] as MetricCard[],
  focusAreas: [
    "Feasibility Studies",
    "Project Coordination",
    "Design & Consultant Coordination",
    "Project & Budget Reports",
    "Procurement Tendering",
    "Documentation Management"
  ],
  supportStatement: "I know how quickly development projects can become overwhelming. My role is simple, I help take the pressure off and keep things moving."
};

export const SERVICES_CONTENT = {
  heading: "How I Can Help",
  services: [
    {
      id: "feasibility",
      title: "Feasibility & Development Support",
      description: "Development feasibility modelling, market research, and development assumptions to support project decision-making.",
      longDescription: "Before you commit to a site or a scheme, I help you stress-test the numbers. This includes building feasibility models, researching comparable sales and market conditions, and pulling together realistic assumptions around costs, timelines, and yield so you can make confident, informed decisions before you're locked in."
    },
    {
      id: "coordination",
      title: "Project Coordination & Delivery",
      description: "Consultant management, programme tracking, project administration, and keeping developments moving.",
      longDescription: "Once a project is underway, I help keep everything on track. That means coordinating consultants and contractors, maintaining your project programme, managing administration and documentation, and following up on the day-to-day items that can otherwise stall progress so your development keeps moving without you having to chase every detail yourself."
    },
    {
      id: "management",
      title: "Development Management Support",
      description: "Flexible, part-time assistance for developers who need an extra pair of hands throughout the whole development process.",
      longDescription: "Some projects just need an extra pair of capable hands, not a full-time hire. I work flexibly, part-time, contract, or one-off across any stage of your development, stepping in wherever the workload is heaviest. Whether that's a few hours a week or support through a specific phase, I adapt to what you actually need."
    }
  ] as ServiceItem[]
};

export const ABOUT_CONTENT = {
  heading: "Support for Property Developers",
  paragraphs: [
    "I'm Johnny Li, an Assistant Development Manager with hands-on experience delivering multi-million dollar residential developments across New Zealand and Australia.",
    "My experience spans due diligence, consultant management, project planning, risk management, and design coordination, helping move developments from concept through to delivery.",
    "I previously worked within New Zealand's largest housing provider, as part of their Housing Delivery System (HDS), a fast-paced delivery model that takes concept designs through to procurement-ready building packages in as little as eight weeks. Working alongside in-house architects, civil and structural engineers, and planners, I helped deliver residential housing projects across New Zealand.",
    "I'm currently working with a not-for-profit organisation here in Melbourne on multiple apartment developments with a combined potential asset value of over $100M.",
    "Development management comes down to the same fundamentals everywhere clear planning, the right people coordinated, and nothing falling through the cracks. I bring that experience from residential projects in New Zealand, and I'm now putting it to work here in Melbourne."
  ],
  ctaText: "Let's Connect",
  portraitPath: "/src/assets/images/johnny_line_art_1781971936676.jpg",
};

export const HOW_IT_WORKS_CONTENT = {
  heading: "How It Works",
  steps: [
    {
      stepNumber: "1",
      title: "Reach Out",
      description: "Tell me about your project and what support you need."
    },
    {
      stepNumber: "2",
      title: "Quick Conversation",
      description: "We'll discuss your objectives and determine whether we're a good fit."
    },
    {
      stepNumber: "3",
      title: "Get to Work",
      description: "Agree on scope, timeline, and deliverables and start moving your project forward."
    }
  ] as HowItWorksStep[]
};

export const ENGAGEMENT_CONTENT = {
  heading: "Flexible Support That Fits Your Project",
  headline: "Flexible Support That Fits Your Project",
  models: [
    {
      title: "Hourly Support",
      price: "$70/hr",
      description: "For one-off tasks, short term or ongoing support, Support across the full development lifecycle"
    }
  ] as EngagementModel[],
  callout: "Not sure what you need? Let's have a conversation and find an arrangement that works for your project.",
  ctaText: "Let's Talk"
};

export const CONTACT_CONTENT = {
  location: "Melbourne, Victoria",
  availability: "Currently taking on development projects. Remote and Melbourne physical assistant available",
  email: "Johnny@devmate.com.au",
  linkedin: "https://www.linkedin.com/in/johnny-li-development/"
};

export const FOOTER_CONTENT = {
  navigation: [
    { label: "Home", href: "#home" },
    { label: "About Me", href: "#about-me" },
    { label: "Services", href: "#services" },
    { label: "Experience", href: "#experience" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" }
  ],
  statement: "Helping property developers through every stage of development from early feasibility through to delivery with hands-on support."
};
