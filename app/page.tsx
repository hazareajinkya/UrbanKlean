import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CheckCircle,
  ArrowRight,
  Play,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Star,
  Clock,
  Target,
  Heart,
  DollarSign,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-100 to-lime-100">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium"
            >
              "Done‑For‑You High‑EQ AI"
            </Badge>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl leading-20 font-bold tracking-tight text-gray-900 mb-6">
              Turn customer questions{" "}
              <span className="bg-gradient-to-r from-neutral-900 to-green-700 bg-clip-text text-transparent">
                into profit
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              The world's first and only Done‑For‑You High‑EQ AI for customer
              experience. Live in minutes. Kind, on‑brand, and action‑ready.
            </p>

            {/* Support line */}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r transition-colors duration-500 from-neutral-900 to-green-700 hover:from-neutral-900 hover:to-green-500"
              >
                Start your 30‑day pilot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch a 5‑minute demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              Powered by EFRO (Empathy‑First Revenue Orchestration) and CXE
              (Customer Experience Enhancement) tools. White‑Glove Service
              available for premium clients.
            </p>

            {/* Proof strip */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
              <p className="text-sm text-gray-500 mb-3 font-medium">
                Works with
              </p>
              <div className="flex flex-wrap justify-center items-center gap-6 text-gray-700 font-medium">
                <span>Shopify</span>
                <span>•</span>
                <span>Gorgias</span>
                <span>•</span>
                <span>Shippo/AfterShip</span>
                <span>•</span>
                <span>Email</span>
                <span>•</span>
                <span>WhatsApp</span>
                <span>•</span>
                <span>SMS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick FAB Wins Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl tracking-tight font-medium  text-gray-900 mb-4">
                {/* Superior customer experience */}
                Why teams choose Delightfulcx
                {/* Why teams choose Delightfulcx over other tools */}
              </h2>
              <p className="text-2xl mx-auto font-medium trackingtight text-muted-foreground -600 max-w-3xl ">
                Superior customer experience that feels human and helpful
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* FAB 1 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    AI that understands, acts, and proves ROI
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Advantage:
                      </h4>
                      <p className="text-gray-600">
                        Answers with empathy and solves the task on the spot
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefit:
                      </h4>
                      <p className="text-gray-600">
                        Fewer tickets, faster fixes, happier customers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAB 2 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Approve‑first safety with full logs
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Advantage:
                      </h4>
                      <p className="text-gray-600">
                        You stay in control from day one
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefit:
                      </h4>
                      <p className="text-gray-600">
                        Confident automation without surprises
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAB 3 */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Done‑For‑You setup and optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Advantage:
                      </h4>
                      <p className="text-gray-600">
                        Zero technical lift, no coding
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefit:
                      </h4>
                      <p className="text-gray-600">
                        Launch fast and get results right away
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Benefits Summary */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why teams switch to Delightfulcx
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Superior customer experience that feels human and helpful
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Clear profit lift: more exchanges, fewer refunds, lower
                    costs
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Stronger brand recall and mindshare through consistent,
                    caring conversations
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Higher loyalty and repeat business, plus more
                    referrals—because great service spreads
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Built Delightfulcx Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Answers are good. Solved problems are better.
            </h2>

            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200 mb-12">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
                We built Delightfulcx because "just another chatbot" doesn't
                move the needle. You need AI that's kind, accurate, and
                action‑ready—set up for you, tuned to your voice, and measured
                in profit. That's why we created the world's first Done‑For‑You
                High‑EQ AI, powered by EFRO (Empathy‑First Revenue
                Orchestration) and our CXE (Customer Experience Enhancement)
                tools. It's the brand‑edge that turns support into a growth
                engine.
              </p>

              <div className="grid md:grid-cols-2 gap-8 text-left">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      AI that does real work
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Looks up orders, creates return labels, books
                      appointments, fixes addresses, sends updates
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → Faster solutions, fewer escalations, happier customers
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Live in minutes
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Connect your tools, choose ready‑made workflows, launch in
                      approve‑first
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → First approved answers in under 30 minutes
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Empathy and brand‑matched tone
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Learns your voice from a few examples; reads customer mood
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → Conversations that calm, clarify, and convert
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Safety first, auto when ready
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Approve‑first mode, allowlisted actions, full audit trail
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → Sleep‑well control with real savings
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Profit‑aware decisions (EFRO)
                    </h4>
                    <p className="text-gray-600 mb-2">
                      Exchange‑first, cancel saves, payment recovery—without
                      sounding salesy
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → Higher margins and LTV, customers who return
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      Done‑For‑You implementation (CXE + White‑Glove)
                    </h4>
                    <p className="text-gray-600 mb-2">
                      We configure, monitor, and improve everything for you
                    </p>
                    <p className="text-sm text-green-600 font-medium">
                      → Enterprise‑grade results with near‑zero effort
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              See how it works
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Benefits Summary */}
            <div className="mt-16 grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Better experience that customers remember and share
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Lower operating costs, higher margins, and clear ROI
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Stronger brand voice across every interaction
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">
                  Loyalty that grows repeat sales and referrals
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About Us
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Meet the team behind Delightfulcx—the problem-solvers who design
                how your customer experience feels in every interaction.
              </p>
            </div>

            {/* Hrushikesh Kuklare Profile */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200 mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Profile Image Placeholder */}
                <div className="flex justify-center md:justify-start">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-6xl font-bold shadow-lg">
                    HK
                  </div>
                </div>

                {/* Profile Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                      About the Co‑founder — Hrushikesh Kuklare
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Hrushikesh Kuklare is the problem‑solver who designs how
                      Delightfulcx feels in your customer's hands. He brings the
                      energy of a technologist and the eye of a designer—equal
                      parts engineering depth and user‑experience craft—so every
                      interaction is fast, intuitive, and remarkably human.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      The spark
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      The story is delightfully unexpected. While tinkering with
                      ways technology might help him "bulk up" despite an
                      overactive metabolism, his phone rang—Manish was ready to
                      launch Delightfulcx. The clarity of that vision, paired
                      with a track record of building and shipping, turned
                      curiosity into conviction: together, they would create a
                      SaaS product that makes every customer touchpoint
                      intentional, elegant, and measurably superior.
                    </p>
                  </div>
                </div>
              </div>

              {/* What he builds */}
              <div className="mt-12">
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  What he builds
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">
                          Flutter and web, end‑to‑end
                        </h5>
                        <p className="text-gray-600 text-sm">
                          From Flutter apps to modern web experiences,
                          Hrushikesh engineers smooth, reliable products that
                          load quickly and feel effortless.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">
                          Backend integration and development
                        </h5>
                        <p className="text-gray-600 text-sm">
                          Clean interfaces meet robust backends—so actions like
                          order lookups, returns, and scheduling just work.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">
                          UI/UX, React.js, Next.js
                        </h5>
                        <p className="text-gray-600 text-sm">
                          Minimal, strategic interfaces that guide users without
                          friction, with front‑end performance that keeps pace
                          with real‑time CX.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">
                          Architecture for the long run
                        </h5>
                        <p className="text-gray-600 text-sm">
                          Clean patterns, future‑proof foundations, and
                          animations that serve clarity, not just motion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Philosophy */}
              <div className="mt-12">
                <h4 className="text-xl font-bold text-gray-900 mb-6">
                  His product philosophy
                </h4>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">
                      Minimal beats messy
                    </h5>
                    <p className="text-gray-600 text-sm">
                      Do less, but do it with intention. Every screen, state,
                      and message earns its place.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">
                      Strategy over noise
                    </h5>
                    <p className="text-gray-600 text-sm">
                      Design choices tie directly to business outcomes—faster
                      resolutions, fewer tickets, higher satisfaction.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-2">
                      Quality as a habit
                    </h5>
                    <p className="text-gray-600 text-sm">
                      Robust, optimized, and maintainable builds that make
                      scaling calm and predictable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Why Delightfulcx */}
              <div className="mt-12">
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  Why Delightfulcx
                </h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Inspired by Manish's vision—and the momentum of a builder who
                  consistently turns ideas into operating companies—Hrushikesh
                  set out to craft a High‑EQ AI experience that feels human
                  while delivering measurable business results. He codes empathy
                  into the seams: tone that adapts to mood, flows that prefer
                  exchanges over refunds, and interfaces that surface the right
                  action at the right moment. The bar he sets is simple:
                  five‑star service, every time.
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <h5 className="font-bold text-gray-900 mb-4">
                    What this means for you
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-gray-700 text-sm font-medium">
                        Superior, intentional UX that customers trust and
                        remember
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-gray-700 text-sm font-medium">
                        Faster, cleaner paths to resolution that lower costs and
                        lift margins
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-gray-700 text-sm font-medium">
                        A product you can scale confidently—feature by feature,
                        channel by channel
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <div className="mt-12 text-center">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200">
                  <blockquote className="text-lg md:text-xl text-gray-700 italic leading-relaxed mb-4">
                    "I believe in minimal, strategic, and quality work rather
                    than quantity. I build products with a smooth user
                    experience, animations, and clean architecture to ensure
                    they're robust, optimized, highly maintainable, and
                    future‑proof for adding new features."
                  </blockquote>
                  <cite className="text-gray-600 font-medium">
                    — Hrushikesh Kuklare, Co‑founder & CTO
                  </cite>
                </div>
                <p className="text-gray-700 mt-6 leading-relaxed">
                  At Delightfulcx, Hrushikesh turns that belief into your
                  advantage—transforming complex workflows into calm,
                  empathetic, brand‑true experiences that keep customers coming
                  back.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who Delightfulcx Is For Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                If you serve customers, we serve you.
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto">
                Delightfulcx is a 24/7 teammate that answers with empathy and
                takes the right actions. Whether you're a solo founder or a
                global enterprise, our Done‑For‑You High‑EQ AI (with optional
                White‑Glove Service) fits your stack and your standards.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {/* Solopreneurs and SMBs */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Solopreneurs and SMBs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Ready‑made workflows and approve‑first launch
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        No complex setup; we do it for you
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        More time for your craft, better service for your
                        customers
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Professional services */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Professional services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Smart intake and scheduling
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Fewer back‑and‑forth emails, respectful tone
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Clients feel cared for from the first hello
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Healthcare practices */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Healthcare practices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Bookings, reminders, prep instructions, aftercare
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Clear, calm guidance that fits your policies
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Fewer no‑shows, better patient outcomes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Local services */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Local services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Triage with photos, job scheduling, ETA updates
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        The right tech at the right time
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        5‑star reviews and repeat business
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Restaurants & hospitality */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Restaurants & hospitality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Reservations, special requests, event inquiries
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Smooth changes and instant confirmations
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        More regulars, fewer no‑shows
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Travel */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Travel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Quotes, date changes, document checklists
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Calm help in tricky moments
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Loyal travelers who book again
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real estate & builders */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Real estate & builders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Lead qualification, showings, status updates
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Always‑on, always‑clear communication
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Faster deals, fewer drop‑offs
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ecommerce & high‑AOV brands */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Ecommerce & high‑AOV brands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        WISMO, returns/exchanges, pre‑ship fixes, warranties
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        White‑glove care at scale with EFRO profit‑smart choices
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Higher margins, delighted customers who return
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* SaaS & subscriptions */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    SaaS & subscriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Billing, plan changes, usage tips, churn saves
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Helpful, not pushy
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Lower churn, higher LTV
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Banks, financial institutions, and large enterprises */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Banks, financial institutions, and large enterprises
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Approve‑first controls, allowlisted actions, full logs,
                        brand‑safe tone
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Enterprise control with day‑one speed
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Consistency, compliance, and better NPS at scale
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property managers and building owners */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">
                    Property managers and building owners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Feature:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Tenant inquiries, maintenance tickets, vendor
                        coordination
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Advantage:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Clear updates, fewer follow‑ups
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-sm">
                        Benefit:
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Happier tenants, smoother operations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Start your 30‑day pilot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Benefits Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why teams choose Delightfulcx
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Superior customer experience, by design
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Profits protected: fewer refunds, more exchanges, lower
                    handling costs
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Stronger brand recall from consistent, caring conversations
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Higher loyalty and referrals across every customer
                    touchpoint
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Priced to win, not to wonder.
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Simple tiers based on volume. Clear value from day one.
                Done‑For‑You setup included; White‑Glove Service available for
                premium clients.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* Starter */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Starter
                  </CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mt-4">
                    From $299/mo
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Feature:
                      </h4>
                      <p className="text-gray-600">
                        Core workflows, approve‑first mode, tone matching
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Advantage:
                      </h4>
                      <p className="text-gray-600">
                        Safe automation for small teams without extra lift
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefit:
                      </h4>
                      <p className="text-gray-600">
                        Real savings fast; happier customers from day one
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Growth */}
              <Card className="border-2 border-blue-500 shadow-xl hover:shadow-2xl transition-shadow duration-300 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Growth
                  </CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mt-4">
                    From $799/mo
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Feature:
                      </h4>
                      <p className="text-gray-600">
                        Auto‑mode, proactive playbooks, SMS/WhatsApp, EFRO
                        profit‑smart flows
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Advantage:
                      </h4>
                      <p className="text-gray-600">
                        Scale service without scaling headcount
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefit:
                      </h4>
                      <p className="text-gray-600">
                        Lower costs, higher margins, stronger loyalty
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plus */}
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Plus
                  </CardTitle>
                  <div className="text-3xl font-bold text-blue-600 mt-4">
                    Custom
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Feature:
                      </h4>
                      <p className="text-gray-600">
                        High volumes, SSO, deployment options, CXE tuning,
                        premium support
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Advantage:
                      </h4>
                      <p className="text-gray-600">
                        Enterprise control with day‑one speed; White‑Glove
                        Service
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Benefit:
                      </h4>
                      <p className="text-gray-600">
                        Consistent excellence at scale, with full oversight
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Guarantee */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                30‑day ROI promise
              </h3>
              <p className="text-lg text-gray-600">
                We agree on targets; if we don't hit them, you don't pay.
              </p>
            </div>

            {/* Benefits Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why our pricing works
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">Clear ROI, quickly</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Zero‑stress setup (we do it for you)
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Profit‑smart automation that customers love
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Confidence to scale with safety and control
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about Delightfulcx
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {/* General Questions */}
              <AccordionItem
                value="item-1"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  What is Delightfulcx, in simple words?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Delightfulcx is a smart helper for your business. It answers
                  customers kindly, solves common problems on the spot, and
                  shows you how much time and money it saves. It's the world's
                  first Done‑For‑You High‑EQ AI—so we set it up for you, in your
                  voice. Result: happier customers, lower costs, and more repeat
                  sales.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  How is this different from "just a chatbot"?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Most chat tools only talk. Delightfulcx talks and does. It
                  looks up orders, creates return labels, changes appointments,
                  and sends updates—safely. Fewer back‑and‑forths means quicker
                  solutions, lower costs, and better profits.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Will this really help my profits?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes—by design. EFRO (Empathy‑First Revenue Orchestration)
                  nudges toward profit‑smart choices (like exchanges over
                  refunds) while staying kind and on‑brand. You'll see fewer
                  tickets for your team, happier customers who come back, and
                  clear savings on your dashboard.
                </AccordionContent>
              </AccordionItem>

              {/* Getting Started */}
              <AccordionItem
                value="item-4"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  How long does setup take?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Minutes. Connect your tools, pick a few ready‑made workflows,
                  and go live in approve‑first mode. We handle the setup for
                  you. Most teams send their first approved answers in under 30
                  minutes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Do I need any technical skills?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  No. Our Done‑For‑You approach means no coding, no complex
                  settings. We configure everything and keep it tuned with our
                  CXE (Customer Experience Enhancement) tools.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Can I try it without risk?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. We run a 30‑day pilot with agreed targets. If we don't
                  hit them, you don't pay. You keep the improvements; we earn
                  your trust.
                </AccordionContent>
              </AccordionItem>

              {/* Safety and Control */}
              <AccordionItem
                value="item-7"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Is it safe to let AI talk to my customers?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes, because you stay in control. Start in approve‑first mode:
                  you see every draft, every source, and every action. Turn on
                  auto only when you're ready. Everything is logged.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-8"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  How do you prevent mistakes?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Answers come from your content and policies.</li>
                    <li>
                      Actions are strictly allowlisted (only what you permit).
                    </li>
                    <li>Sensitive cases can stay human‑only.</li>
                  </ul>
                  <p className="mt-3">
                    This keeps automation safe while saving time and money.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Customer Experience */}
              <AccordionItem
                value="item-9"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Will it sound like us—or like a robot?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  It will sound like you. We learn your voice from a few
                  examples, then use CXE tuning to match tone and adjust for
                  mood. Customers feel understood and taken care of.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-10"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Can it handle upset or stressed customers?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. It reads the mood and adapts—calm when people are
                  worried, concise when they're in a hurry, warm for VIPs. This
                  protective empathy prevents churn and builds loyalty.
                </AccordionContent>
              </AccordionItem>

              {/* Real Actions */}
              <AccordionItem
                value="item-11"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  What can it do on day one?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="list-disc list-inside space-y-2">
                    <li>"Where is my order?" Clear status and next steps.</li>
                    <li>
                      Returns/exchanges: Policy‑aware, label creation,
                      exchange‑first.
                    </li>
                    <li>
                      Pre‑ship fixes: Address corrections and intercepts where
                      possible.
                    </li>
                    <li>Bookings: Schedule, reschedule, and send reminders.</li>
                  </ul>
                  <p className="mt-3">
                    Faster answers + helpful actions = happier customers and
                    lower costs.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-12"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Can it grow with us?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. Add channels, workflows, and proactive playbooks over
                  time. We handle tuning so the experience stays consistently
                  excellent as you scale.
                </AccordionContent>
              </AccordionItem>

              {/* Done-For-You Service */}
              <AccordionItem
                value="item-13"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Is it really "done for you"?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. We do the heavy lifting—tone setup, policy mapping,
                  workflow design, and ongoing improvements. You focus on your
                  business; we make the AI your best teammate.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-14"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  What is EFRO and CXE in plain English?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="list-disc list-inside space-y-2">
                    <li>
                      <strong>
                        EFRO (Empathy‑First Revenue Orchestration):
                      </strong>{" "}
                      Our method to turn conversations into profit without
                      losing kindness. Think exchange‑first returns, gentle save
                      options, and friendly payment recovery.
                    </li>
                    <li>
                      <strong>CXE (Customer Experience Enhancement):</strong>{" "}
                      Our toolset for training tone, mood, and clarity so
                      replies feel human, helpful, and on‑brand.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-15"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  What is White‑Glove Service?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  It's our premium option: a dedicated team that configures,
                  monitors, and improves your AI weekly. We iterate on tone,
                  policies, and edge cases to keep results rising. You get
                  enterprise‑grade outcomes with minimal effort.
                </AccordionContent>
              </AccordionItem>

              {/* Money and ROI */}
              <AccordionItem
                value="item-16"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  How do I see the value?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Your live dashboard shows:
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Tickets handled automatically</li>
                    <li>Time and cost saved</li>
                    <li>Exchanges vs. refunds</li>
                    <li>Cancellations saved</li>
                    <li>CSAT and repeat signals</li>
                  </ul>
                  <p className="mt-3">No guessing—just proof.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-17"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  What results should we expect early on?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Faster answers to common questions</li>
                    <li>More exchanges than refunds where it fits</li>
                    <li>Fewer no‑shows and fewer failed payments</li>
                  </ul>
                  <p className="mt-3">
                    You'll notice happier customers and a calmer team—usually
                    within days.
                  </p>
                </AccordionContent>
              </AccordionItem>

              {/* Daily Use */}
              <AccordionItem
                value="item-18"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Will this replace my team?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  No. It takes the repetitive work so your team can focus on
                  special cases and personal touches. Most teams feel relief,
                  not replacement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-19"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Can my team and the AI work together?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. The AI handles the easy tasks, drafts replies for
                  approval, and passes tricky cases with clean summaries.
                  Everyone sees the same customer timeline.
                </AccordionContent>
              </AccordionItem>

              {/* Trust and Transparency */}
              <AccordionItem
                value="item-20"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Will I know what the AI said and did?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  Yes. Every message and action is logged. You can review,
                  learn, and improve confidently.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-21"
                className="border border-gray-200 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                  Can customers tell they're chatting with AI?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pt-2">
                  That's your choice. Many teams simply call it a "virtual
                  assistant." What matters most is that it's kind, clear, and
                  gets things done.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Benefits Summary */}
            <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Why Delightfulcx delivers results
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    World‑first Done‑For‑You High‑EQ AI that feels human
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Lower costs, higher margins, and clear ROI
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    A superior customer experience that boosts loyalty and
                    referrals
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                  <p className="text-gray-700">
                    Stronger brand recall and mindshare through consistent,
                    caring service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Make every interaction count.
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              Launch in minutes. Start safe. Let empathy do the selling. Watch
              profits grow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
              >
                Start your 30‑day pilot
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch a 5‑minute demo
              </Button>
            </div>

            {/* Global Benefits Recap */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">
                Why teams choose Delightfulcx
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-white/90">
                    Superior customer experience that delights—consistently
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-white/90">
                    Better profits through faster resolutions and profit‑smart
                    choices
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-white/90">
                    Stronger brand recall and mindshare with every conversation
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <p className="text-white/90">
                    Higher loyalty and repeat purchases, plus referrals that
                    compound over time
                  </p>
                </div>
              </div>
            </div>

            {/* Done-For-You Promise */}
            <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="text-lg font-semibold mb-4">
                The Done‑For‑You Promise
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <p>
                  • The world's first and only Done‑For‑You High‑EQ AI for
                  customer experience
                </p>
                <p>
                  • Powered by EFRO (Empathy‑First Revenue Orchestration) and
                  CXE (Customer Experience Enhancement)
                </p>
                <p>• White‑Glove Service available for premium clients</p>
                <p>
                  • Live in minutes. Measured in profit. Kind in every message.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
