"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDemoModal } from "@/components/landing/demo-modal";
import {
  FileText,
  Clock,
  Shield,
  Users,
  ArrowRight,
  ArrowLeft,
  Info,
  Sparkles,
  Copy,
  Check,
  Building2,
  MessageSquare,
  AlertCircle,
  PhoneCall,
  Mail,
  Headphones,
  ShoppingCart,
  Monitor,
  Briefcase,
  Store,
  GraduationCap,
  CheckCircle2,
  Loader2,
  Wand2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { usePolicyGenerator } from "@/lib/hooks/free-tools/use-policy-generator";
import { toast } from "sonner";
import {
  GeneratePolicyInput,
  GeneratePolicyOutput,
} from "@/app/api/free-tools/generate-policy/schema";
import { cn } from "@/lib/utils";

type BusinessType = "ecommerce" | "saas" | "services" | "retail" | "edtech";
type SupportHours = "24/7" | "business" | "limited";
type EscalationLevels = 2 | 3 | 4;
type Tone = "formal" | "friendly" | "professional";

const BUSINESS_TYPES: { value: BusinessType; label: string; icon: any }[] = [
  { value: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { value: "saas", label: "SaaS", icon: Monitor },
  { value: "services", label: "Services", icon: Briefcase },
  { value: "retail", label: "Retail", icon: Store },
  { value: "edtech", label: "EdTech", icon: GraduationCap },
];

const SUPPORT_HOURS_OPTIONS: {
  value: SupportHours;
  label: string;
  description: string;
}[] = [
    { value: "24/7", label: "24/7", description: "Round the clock" },
    { value: "business", label: "Business Hours", description: "9 AM - 6 PM" },
    { value: "limited", label: "Limited", description: "Specific days only" },
  ];

const ESCALATION_OPTIONS: {
  value: EscalationLevels;
  label: string;
  description: string;
}[] = [
    { value: 2, label: "2 Tiers", description: "Agent, Manager" },
    { value: 3, label: "3 Tiers", description: "Agent, Senior, Manager" },
    { value: 4, label: "4 Tiers", description: "Full escalation chain" },
  ];

const TONE_OPTIONS: {
  value: Tone;
  label: string;
  description: string;
}[] = [
    { value: "formal", label: "Formal", description: "Corporate style" },
    { value: "friendly", label: "Friendly", description: "Warm & casual" },
    {
      value: "professional",
      label: "Professional",
      description: "Balanced tone",
    },
  ];

// Policy templates by business type and tone
const generateSupportPolicy = (
  businessType: BusinessType,
  companyName: string,
  supportEmail: string,
  supportHours: SupportHours,
  tone: Tone,
): string => {
  const name = companyName || "[Your Company]";

  const hoursText = {
    "24/7": "24 hours a day, 7 days a week",
    business: "Monday through Friday, 9:00 AM to 6:00 PM (local time)",
    limited: "Monday through Friday, 10:00 AM to 4:00 PM (local time)",
  }[supportHours];

  const responseTime = {
    "24/7": "within 1 hour",
    business: "within 4 business hours",
    limited: "within 24 business hours",
  }[supportHours];

  const channelsByType = {
    ecommerce: "email, live chat, and phone",
    saas: "email, in-app chat, and scheduled calls",
    services: "email, phone, and scheduled consultations",
    retail: "email, phone, and in-store support",
    edtech: "email, live chat, and video calls",
  }[businessType];

  const intro = {
    formal: `${name} is committed to providing exceptional customer support services.`,
    friendly: `At ${name}, we're here to help you every step of the way!`,
    professional: `${name} provides dedicated support to ensure your success.`,
  }[tone];

  return `CUSTOMER SUPPORT POLICY

${intro}

SUPPORT HOURS
Our support team is available ${hoursText}. During these hours, you can expect a response ${responseTime}.

CONTACT CHANNELS
We offer support through ${channelsByType}. Choose the channel that works best for you.

RESPONSE TIMES
• Priority Issues: ${supportHours === "24/7" ? "15 minutes" : "1 hour"}
• General Inquiries: ${responseTime}
• Feature Requests: 2-3 business days

SUPPORT SCOPE
Our team can assist with:
• Product questions and guidance
• Technical troubleshooting
• Account and billing inquiries
• Feature requests and feedback

CONTACT US
For support inquiries, please reach out to us at: ${supportEmail || "[support@company.com]"}`;
};

const generateRefundLanguage = (
  businessType: BusinessType,
  companyName: string,
  supportEmail: string,
  refundWindow: number,
  tone: Tone,
): string => {
  const name = companyName || "[Your Company]";

  const conditionsByType = {
    ecommerce:
      "Items must be unused, in original packaging, with all tags attached.",
    saas: "Refunds are available for annual subscriptions only. Monthly plans are not eligible.",
    services:
      "Refunds are available for services not yet rendered or partially completed.",
    retail: "Products must be in resalable condition with original receipt.",
    edtech:
      "Refunds are available if less than 25% of course content has been accessed.",
  }[businessType];

  const processByType = {
    ecommerce:
      "Return shipping label will be provided. Refund processed within 5-7 business days of receipt.",
    saas: "Refund processed to original payment method within 5-10 business days.",
    services:
      "Prorated refund calculated based on services rendered. Processed within 10 business days.",
    retail:
      "Bring item to any store location or ship with prepaid label. Refund issued immediately in-store.",
    edtech:
      "Refund processed to original payment method within 7 business days.",
  }[businessType];

  const intro = {
    formal: `${name} maintains a clear and fair refund policy to protect both our customers and business interests.`,
    friendly: `We want you to be completely happy with your ${businessType === "saas" ? "subscription" : "purchase"}! If something isn't right, here's how we can help.`,
    professional: `${name} offers a straightforward refund process to ensure customer satisfaction.`,
  }[tone];

  return `REFUND POLICY

${intro}

REFUND WINDOW
You may request a refund within ${refundWindow} days of your ${businessType === "saas" ? "subscription start date" : "purchase date"}.

ELIGIBILITY CONDITIONS
${conditionsByType}

REFUND PROCESS
${processByType}

EXCEPTIONS
The following are not eligible for refund:
• ${businessType === "saas" ? "Monthly subscriptions after 7 days" : "Items marked as final sale"}
• ${businessType === "edtech" ? "Completed courses or certifications" : "Customized or personalized items"}
• Gift cards and promotional credits

HOW TO REQUEST
Contact our support team at ${supportEmail || "[support@company.com]"} with your order number and reason for the refund request. We'll process your request promptly.`;
};

const generateEscalationRules = (
  companyName: string,
  escalationLevels: EscalationLevels,
  supportHours: SupportHours,
  tone: Tone,
): string => {
  const name = companyName || "[Your Company]";

  const slaByHours = {
    "24/7": {
      tier1: "15 min",
      tier2: "30 min",
      tier3: "1 hour",
      tier4: "2 hours",
    },
    business: {
      tier1: "1 hour",
      tier2: "2 hours",
      tier3: "4 hours",
      tier4: "1 business day",
    },
    limited: {
      tier1: "4 hours",
      tier2: "8 hours",
      tier3: "1 business day",
      tier4: "2 business days",
    },
  }[supportHours];

  const intro = {
    formal: `${name} has established a structured escalation framework to ensure timely resolution of all customer concerns.`,
    friendly: `We never want you to feel stuck! Here's how we make sure your concerns reach the right person quickly.`,
    professional: `${name} uses a tiered escalation process to resolve issues efficiently.`,
  }[tone];

  let tiers = `TIER 1: FRONTLINE SUPPORT
• First point of contact for all inquiries
• Response SLA: ${slaByHours.tier1}
• Handles: General questions, basic troubleshooting, account inquiries
• Escalation trigger: Issue unresolved after 2 attempts or customer request

TIER 2: ${escalationLevels >= 3 ? "SENIOR SUPPORT" : "MANAGEMENT"}
• ${escalationLevels >= 3 ? "Experienced agents with advanced access" : "Team leads and supervisors"}
• Response SLA: ${slaByHours.tier2}
• Handles: Complex technical issues, billing disputes, policy exceptions
• Escalation trigger: Issue requires special authorization or remains unresolved`;

  if (escalationLevels >= 3) {
    tiers += `

TIER 3: MANAGEMENT
• Support managers and department heads
• Response SLA: ${slaByHours.tier3}
• Handles: Service recovery, significant compensation, policy decisions
• Escalation trigger: Customer dissatisfaction or high-value account`;
  }

  if (escalationLevels >= 4) {
    tiers += `

TIER 4: EXECUTIVE
• Directors and C-level executives
• Response SLA: ${slaByHours.tier4}
• Handles: Critical incidents, legal concerns, VIP customers
• Escalation trigger: Reputational risk or regulatory issues`;
  }

  return `ESCALATION POLICY

${intro}

ESCALATION TIERS

${tiers}

AUTOMATIC ESCALATION TRIGGERS
• No response within SLA timeframe
• Customer explicitly requests escalation
• Issue involves safety or security concerns
• Multiple contacts for same unresolved issue

CUSTOMER COMMUNICATION
Customers will be notified when their case is escalated, including the new point of contact and expected resolution timeframe.`;
};

// Copy button component
const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 px-3 text-xs gap-1.5 text-white/60 hover:text-white hover:bg-white/10"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          {label}
        </>
      )}
    </Button>
  );
};

// Policy section component
const PolicySection = ({
  title,
  icon: Icon,
  content,
  iconColor,
}: {
  title: string;
  icon: LucideIcon;
  content: string;
  iconColor: string;
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/50 uppercase tracking-wider flex items-center gap-2">
          <Icon className={cn("w-4 h-4", iconColor)} />
          {title}
        </h3>
        <CopyButton text={content} label="Copy" />
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
};

export const SupportPolicyGenerator = () => {
  const { openDemoModal } = useDemoModal();
  const [businessType, setBusinessType] = useState<BusinessType>("saas");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyNameTouched, setCompanyNameTouched] = useState(false);
  const [supportEmail, setSupportEmail] = useState<string>("");
  const [supportEmailTouched, setSupportEmailTouched] = useState(false);
  const [supportHours, setSupportHours] = useState<SupportHours>("business");
  const [refundWindow, setRefundWindow] = useState<number>(30);
  const [escalationLevels, setEscalationLevels] = useState<EscalationLevels>(3);
  const [tone, setTone] = useState<Tone>("professional");
  const [activeTab, setActiveTab] = useState<
    "support" | "refund" | "escalation"
  >("support");
  const [aiContent, setAiContent] = useState<GeneratePolicyOutput | null>(null);
  const [showResults, setShowResults] = useState(false);

  const { mutate: generatePolicy, isPending } = usePolicyGenerator();

  const isCompanyNameValid = companyName.trim().length > 0;
  const showCompanyNameError = companyNameTouched && !isCompanyNameValid;
  const isEmailValid = supportEmail.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail.trim());
  const showEmailError = supportEmailTouched && !isEmailValid;
  const canGenerate = isCompanyNameValid && isEmailValid && !isPending;

  const handleGenerate = () => {
    if (!isCompanyNameValid) {
      setCompanyNameTouched(true);
      toast.error("Please enter your company name");
      return;
    }

    if (!isEmailValid) {
      setSupportEmailTouched(true);
      toast.error("Please enter a valid support email");
      return;
    }

    generatePolicy(
      {
        businessType,
        companyName: companyName.trim(),
        supportEmail: supportEmail.trim(),
        supportHours,
        refundWindow,
        escalationLevels,
        tone,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.data) {
            setAiContent(data.data);
            setShowResults(true);
            toast.success("Policies generated successfully!");
          }
        },
        onError: () => {
          toast.error("Failed to generate policies. Please try again.");
        },
      },
    );
  };

  const supportPolicy =
    aiContent?.supportPolicy ||
    generateSupportPolicy(businessType, companyName, supportEmail, supportHours, tone);
  const refundLanguage =
    aiContent?.refundPolicy ||
    generateRefundLanguage(businessType, companyName, supportEmail, refundWindow, tone);
  const escalationRules =
    aiContent?.escalationRules ||
    generateEscalationRules(companyName, escalationLevels, supportHours, tone);

  const allPolicies = `${supportPolicy}\n\n---\n\n${refundLanguage}\n\n---\n\n${escalationRules}`;

  return (
    <div className="mx-auto">
      {!showResults ? (
        /* Input View */
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            {/* Left Column - Company Identity */}
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm border rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-4 md:p-6 border-b border-border/50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Company Identity
                  </h3>
                </div>

                <div className="p-6 md:p-8 space-y-8 flex-1">
                  {/* Company Details */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        Company Name
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="e.g., Acme Inc."
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        onBlur={() => setCompanyNameTouched(true)}
                        className={cn(
                          "h-12 text-base transition-all duration-200",
                          showCompanyNameError
                            ? "border-destructive ring-destructive/20"
                            : isCompanyNameValid && companyNameTouched
                              ? "border-green-500 ring-green-500/20"
                              : "",
                        )}
                        aria-invalid={showCompanyNameError}
                      />
                      {showCompanyNameError && (
                        <p className="text-sm text-destructive flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Required
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        Support Email
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="email"
                        placeholder="e.g., support@company.com"
                        required
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        onBlur={() => setSupportEmailTouched(true)}
                        className={cn(
                          "h-12 text-base transition-all duration-200",
                          showEmailError
                            ? "border-destructive ring-destructive/20"
                            : isEmailValid && supportEmailTouched
                              ? "border-green-500 ring-green-500/20"
                              : "",
                        )}
                        aria-invalid={showEmailError}
                      />
                      {showEmailError && (
                        <p className="text-sm text-destructive flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {supportEmail.trim().length === 0 ? "Required" : "Please enter a valid email address"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Business Type */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Business Type
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {BUSINESS_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setBusinessType(type.value)}
                          className={cn(
                            "group relative flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
                            businessType === type.value
                              ? "border-primary bg-primary/5 text-primary shadow-sm"
                              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
                          )}
                        >
                          <type.icon className={cn("w-5 h-5", businessType === type.value ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Tone */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Brand Tone
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {TONE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTone(option.value)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 hover:shadow-md cursor-pointer",
                            tone === option.value
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border bg-card hover:border-primary/50 hover:bg-muted/50",
                          )}
                        >
                          <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center", tone === option.value ? "border-primary" : "border-muted-foreground")}>
                            {tone === option.value && <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <span className={cn("block text-sm font-medium", tone === option.value ? "text-primary" : "text-foreground")}>
                              {option.label}
                            </span>
                            <span className="text-xs text-muted-foreground">{option.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Operations */}
            <div className="space-y-6">
              <div className="bg-card/50 backdrop-blur-sm border rounded-2xl overflow-hidden h-full flex flex-col">
                <div className="bg-gradient-to-r from-blue-500/10 to-transparent p-4 md:p-6 border-b border-border/50">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-500" />
                    Operational Details
                  </h3>
                </div>

                <div className="p-6 md:p-8 space-y-8 flex-1">
                  {/* Support Hours */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      Support Availability
                    </Label>
                    <div className="grid grid-cols-1 gap-3">
                      {SUPPORT_HOURS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setSupportHours(option.value)}
                          className={cn(
                            "group p-4 rounded-xl border text-left transition-all duration-200 hover:shadow-md cursor-pointer",
                            supportHours === option.value
                              ? "border-blue-500 bg-blue-500/5 shadow-sm"
                              : "border-border bg-card hover:border-blue-500/50 hover:bg-muted/50",
                          )}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className={cn("font-medium text-sm", supportHours === option.value ? "text-blue-500" : "text-foreground")}>
                              {option.label}
                            </span>
                            {supportHours === option.value && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                          </div>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Refund Window */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Refund Policy
                      </Label>
                      <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-semibold border border-green-500/20">
                        {refundWindow} days
                      </div>
                    </div>
                    <Slider
                      value={[refundWindow]}
                      min={7}
                      max={90}
                      step={1}
                      onValueChange={(vals) => setRefundWindow(vals[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Strict (7d)</span>
                      <span>Generous (90d)</span>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  {/* Escalation */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      Escalation Structure
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {ESCALATION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setEscalationLevels(option.value)}
                          className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 hover:shadow-md cursor-pointer",
                            escalationLevels === option.value
                              ? "border-orange-500 bg-orange-500/5 text-orange-500 shadow-sm"
                              : "border-border bg-card hover:border-orange-500/50 hover:bg-muted/50",
                          )}
                        >
                          <span className="text-lg font-bold">{option.value}</span>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Tiers</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-center bg-muted/50 p-2 rounded-lg">
                      {ESCALATION_OPTIONS.find(o => o.value === escalationLevels)?.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="lg"
            className={cn(
              "w-full h-14 rounded-xl text-base font-semibold shadow-lg transition-all duration-300",
              canGenerate
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/30 hover:shadow-xl hover:-translate-y-0.5"
                : "bg-muted text-muted-foreground cursor-not-allowed shadow-none disabled:opacity-100 border border-border",
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Policies
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate Policies
              </>
            )}
          </Button>

          {(!isCompanyNameValid || !isEmailValid) && (
            <p className="text-center text-sm text-muted-foreground">
              {!isCompanyNameValid && !isEmailValid
                ? "Enter your company name and support email above to generate policies"
                : !isCompanyNameValid
                  ? "Enter your company name above to generate policies"
                  : "Enter a valid support email above to generate policies"}
            </p>
          )}
        </div>
      ) : (
        /* Result View */
        <div className="flex flex-col gap-6 relative">
          <Button
            variant="ghost"
            onClick={() => setShowResults(false)}
            className="self-start -ml-2 mb-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Edit
          </Button>
          {isPending && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl border border-white/10">
              <div className="bg-card p-6 rounded-2xl shadow-xl border flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="font-medium text-foreground">
                  Drafting your policies...
                </p>
              </div>
            </div>
          )}
          <div className="bg-foreground text-background rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 flex-1 flex flex-col transition-opacity duration-300">
            {/* Header with Tabs */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-white/10 to-transparent border-b border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Generated Policies
                </div>
                <CopyButton text={allPolicies} label="Copy All" />
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("support")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activeTab === "support"
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Headphones className="w-4 h-4" />
                  Support
                </button>
                <button
                  onClick={() => setActiveTab("refund")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activeTab === "refund"
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Shield className="w-4 h-4" />
                  Refund
                </button>
                <button
                  onClick={() => setActiveTab("escalation")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activeTab === "escalation"
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  )}
                >
                  <AlertCircle className="w-4 h-4" />
                  Escalation
                </button>
              </div>
            </div>

            {/* Policy Content */}
            <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto">
              {activeTab === "support" && (
                <PolicySection
                  title="Support Policy"
                  icon={Headphones}
                  content={supportPolicy}
                  iconColor="text-blue-400"
                />
              )}
              {activeTab === "refund" && (
                <PolicySection
                  title="Refund Language"
                  icon={Shield}
                  content={refundLanguage}
                  iconColor="text-green-400"
                />
              )}
              {activeTab === "escalation" && (
                <PolicySection
                  title="Escalation Rules"
                  icon={AlertCircle}
                  content={escalationRules}
                  iconColor="text-orange-400"
                />
              )}

              {/* Quick Stats */}
              <div className={cn("grid gap-3 pt-4", supportEmail ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <PhoneCall className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Support Hours</p>
                  <p className="text-sm font-medium text-white">
                    {supportHours === "24/7"
                      ? "24/7"
                      : supportHours === "business"
                        ? "9-6"
                        : "Limited"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <Shield className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Refund Window</p>
                  <p className="text-sm font-medium text-white">
                    {refundWindow} days
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <Users className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <p className="text-xs text-white/50">Escalation</p>
                  <p className="text-sm font-medium text-white">
                    {escalationLevels} Tiers
                  </p>
                </div>
                {supportEmail && (
                  <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                    <Mail className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                    <p className="text-xs text-white/50">Contact</p>
                    <p className="text-sm font-medium text-white truncate" title={supportEmail}>
                      {supportEmail}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
