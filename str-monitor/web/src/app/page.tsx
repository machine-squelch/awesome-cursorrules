import Link from "next/link";

function Header() {
  return (
    <header className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <span className="font-semibold text-lg">STR Monitor</span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#rules" className="text-sm text-gray-600 hover:text-gray-900">
            Current Rules
          </a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
            Pricing
          </a>
          <Link
            href="/login"
            className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-block mb-6 px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-full border border-amber-200">
          Pleasanton &amp; Alameda County
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Never miss a regulation change
          <span className="block text-brand-600">for your short-term rental</span>
        </h1>
        <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          We monitor official Pleasanton and Alameda County STR rules daily. When
          anything changes, you get an alert with the exact language that changed
          and what it means for your property.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-lg"
          >
            Protect Your Rental &mdash; $59/mo
          </a>
          <a
            href="#rules"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-lg"
          >
            See Current Rules (Free)
          </a>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">
          The city updated their STR noise ordinance on March 3rd.
          <span className="block text-brand-600 mt-2">Did you know?</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-red-600 text-lg">!</span>
            </div>
            <h3 className="font-semibold mb-2">Fines up to $1,000/day</h3>
            <p className="text-sm text-gray-600">
              Pleasanton enforces STR violations aggressively. Non-compliant
              hosts face daily fines and permit revocation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-amber-600 text-lg">?</span>
            </div>
            <h3 className="font-semibold mb-2">Rules change quietly</h3>
            <p className="text-sm text-gray-600">
              City council updates get buried in meeting minutes. County
              ordinance amendments happen without fanfare. You only find out
              when it&apos;s too late.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-lg">&check;</span>
            </div>
            <h3 className="font-semibold mb-2">We watch so you don&apos;t have to</h3>
            <p className="text-sm text-gray-600">
              We check 9+ official sources twice daily. When language changes,
              you get an alert with the exact before-and-after text.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "We monitor official sources",
      desc: "Municipal code, city council agendas, planning commission minutes, TOT rates, permit pages — 9+ sources checked twice daily.",
    },
    {
      num: "2",
      title: "We detect changes instantly",
      desc: "Our system compares every version of every page. When text changes, we flag it and a human expert reviews it for relevance.",
    },
    {
      num: "3",
      title: "You get a clear alert",
      desc: "Plain-English summary of what changed, why it matters, and what action you should take. Plus the exact before/after language as evidence.",
    },
    {
      num: "4",
      title: "Everything is archived",
      desc: "Every version of every rule is timestamped and stored. If you ever need to prove what the rules said on a specific date, we have it.",
    },
  ];

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="space-y-8">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-6 items-start">
              <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CurrentRules() {
  return (
    <section id="rules" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-4">
          Current Pleasanton STR Rules
        </h2>
        <p className="text-center text-gray-600 mb-10">
          Free reference for all hosts. Last verified: February 2026.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <RuleItem
            title="STR Permit Required"
            detail="All short-term rentals in Pleasanton require a valid STR permit from the Community Development Department. Both hosted and un-hosted rentals need separate permit types."
          />
          <RuleItem
            title="Transient Occupancy Tax (TOT)"
            detail="Hosts must collect and remit TOT at the current city rate. Airbnb and VRBO collect TOT automatically in most cases, but hosts are ultimately responsible for ensuring correct remittance."
          />
          <RuleItem
            title="Business License"
            detail="A Pleasanton business license is required for all STR operations. Renew annually through the Finance Department."
          />
          <RuleItem
            title="Maximum Occupancy"
            detail="Occupancy limits are tied to the number of bedrooms and available parking. Check your specific permit for your property's limit."
          />
          <RuleItem
            title="Noise & Nuisance Rules"
            detail="Quiet hours and nuisance provisions apply. Hosts are responsible for guest behavior. Repeated complaints can result in permit revocation."
          />
          <RuleItem
            title="Insurance"
            detail="Hosts should maintain adequate liability insurance. Some permit types require proof of insurance at renewal."
          />
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          This is a summary for reference only. Always verify with official
          city sources. Want to know the moment these rules change?{" "}
          <a href="#pricing" className="text-brand-600 font-medium hover:underline">
            Subscribe to alerts.
          </a>
        </p>
      </div>
    </section>
  );
}

function RuleItem({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="p-6">
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{detail}</p>
    </div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-4">
          Less than one night&apos;s cleaning fee
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Peace of mind that your rental stays compliant. Cancel anytime.
        </p>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {/* Founding */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="inline-block mb-3 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
              Limited — 12 spots left
            </div>
            <h3 className="font-semibold text-lg">Founding Member</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold">$39</span>
              <span className="text-gray-500">/month</span>
              <p className="text-sm text-gray-500 mt-1">Locked forever</p>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>All Pleasanton + Alameda County sources</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Email alerts within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Full change history &amp; evidence archive</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Plain-English summaries</span>
              </li>
            </ul>
            <a
              href="/login?plan=founding_monthly"
              className="block text-center py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Get Founding Rate
            </a>
          </div>

          {/* Monthly */}
          <div className="bg-white border-2 border-gray-900 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gray-900 text-white text-xs font-medium rounded-full">
              Most Popular
            </div>
            <h3 className="font-semibold text-lg mt-2">Monthly</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold">$59</span>
              <span className="text-gray-500">/month</span>
              <p className="text-sm text-gray-500 mt-1">Cancel anytime</p>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Everything in Founding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Priority email support</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>California state legislation tracking</span>
              </li>
            </ul>
            <a
              href="/login?plan=monthly"
              className="block text-center py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Start Monitoring
            </a>
          </div>

          {/* Annual */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="inline-block mb-3 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
              Save $209/year
            </div>
            <h3 className="font-semibold text-lg">Annual</h3>
            <div className="mt-4 mb-6">
              <span className="text-3xl font-bold">$499</span>
              <span className="text-gray-500">/year</span>
              <p className="text-sm text-gray-500 mt-1">$41.58/month effective</p>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Everything in Monthly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>2 months free</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">&check;</span>
                <span>Annual compliance summary report</span>
              </li>
            </ul>
            <a
              href="/login?plan=annual"
              className="block text-center py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Get Annual Plan
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What sources do you monitor?",
      a: "We monitor 9+ official government sources including Pleasanton Municipal Code, City Council and Planning Commission agendas, business license and TOT pages, Alameda County ordinances, Board of Supervisors agendas, and county tax pages. We also track relevant California state legislation.",
    },
    {
      q: "How quickly will I be notified?",
      a: "We check all sources twice daily. When a change is detected, a human expert reviews it for accuracy and relevance before sending you a plain-English alert. Most alerts go out within 24 hours of the change appearing on official sources.",
    },
    {
      q: "What does an alert look like?",
      a: "You'll get an email with: a plain-English summary of what changed, why it matters for your rental, what action (if any) you should take, and a link to view the exact before-and-after text with timestamps.",
    },
    {
      q: "Can I see previous versions of the rules?",
      a: "Yes. Every version of every monitored page is timestamped and archived. Your dashboard includes a complete change history with evidence of what the rules said on any given date.",
    },
    {
      q: "Do I still need a lawyer?",
      a: "STR Monitor is a monitoring and alerting service, not legal advice. We help you stay aware of changes. For complex compliance questions, we recommend consulting a local attorney who specializes in short-term rentals.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-12">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500">
          &copy; 2026 STR Monitor. Built for Pleasanton &amp; Alameda County
          short-term rental hosts.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Not legal advice. Always verify with official government sources.
        </p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <CurrentRules />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
