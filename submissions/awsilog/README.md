# CivicPilot AI 🇵🇭

> Your ultimate AI companion for navigating Philippine government services

CivicPilot AI is a modern web application that provides intelligent guidance and assistance for Philippine government services. Built with Next.js 15 and powered by AI, it helps Filipino citizens easily access and understand various government services including passport applications, SSS, PhilHealth, and more.

## ✨ Features

- **AI Caseworker**: Large language model-powered chatbot that provides guidance on Philippine government services
- **Voice Interaction**: Interactive voice AI feature for hands-free assistance
- **Quick Service Access**: Direct links to essential government services:
  - 🛂 **DFA Passport**: Passport application and appointment
  - 🏥 **PhilHealth**: Health insurance information and services
  - 🛡️ **SSS**: Social Security System guidance
  - 📋 **PSA**: Birth, Marriage, and Death certificates
  - 🪪 **TIN ID**: Tax Identification Number registration
  - 🔍 **NBI Clearance**: Police clearance services

- **Modern UI/UX**: Clean, minimalist design with smooth animations and hover effects
- **Mobile Responsive**: Fully responsive design that works on all devices
- **Accessible**: Built with accessibility in mind using Radix UI components

## 🎨 Design System

- **Primary Color**: Soft blue (#94B3FD) - evoking trust and accessibility
- **Background**: Very light blue (#F0F4FF) - clean and light theme
- **Accent Color**: Light purple (#B894FD) - for CTAs and interactive elements
- **Typography**: 
  - Headlines: Poppins (contemporary and precise)
  - Body: PT Sans (optimized for legibility)
- **Icons**: Lucide React icon library

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd innov-main
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:9002](http://localhost:9002) in your browser

### Available Scripts

- `npm run dev` - Start development server with Turbopack on port 9002
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality
- `npm run typecheck` - Run TypeScript type checking

## 🛠️ Tech Stack

- **Framework**: [Next.js 15.3.3](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: 
  - [Tailwind CSS 3.x](https://tailwindcss.com/)
  - [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **UI Components**: 
  - [Radix UI](https://www.radix-ui.com/) primitives
  - [shadcn/ui](https://ui.shadcn.com/) component library
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Charts**: [Recharts](https://recharts.org/)
- **Date Handling**: [date-fns](https://date-fns.org/) & [react-day-picker](https://react-day-picker.js.org/)
- **Carousel**: [Embla Carousel](https://www.embla-carousel.com/)
- **Deployment**: Firebase App Hosting

## 📁 Project Structure

```
innov-main/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── civic-pilot/          # Custom CivicPilot components
│   │   │   ├── header.tsx        # Site header
│   │   │   ├── footer.tsx        # Site footer
│   │   │   └── service-card.tsx  # Service card component
│   │   └── ui/                   # shadcn/ui components
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   └── lib/                      # Utility functions
│       ├── utils.ts
│       └── placeholder-images.ts
├── public/                       # Static assets
├── docs/
│   └── blueprint.md              # Design specifications
├── components.json               # shadcn/ui configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
└── apphosting.yaml               # Firebase App Hosting config
```

## 🎯 Core Components

### Service Card
Reusable component for displaying government service links with hover animations and icons.

### Header & Footer
Branded navigation components maintaining consistent design across the application.

### AI Voice Button
Interactive circular button with expand animation and shake effect to encourage user engagement.

## 🌐 Deployment

This project is configured for deployment on Firebase App Hosting. See `apphosting.yaml` for configuration details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👥 Authors

Built with ❤️ for the Filipino community

---

**Kamusta, Ano Ang Maitutulong Ko?** (Hello, How can I help you?)
