import LeadForm from "@/components/LeadForm";
import logo from "@/assets/logo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <img src={logo} alt="Aishnar Digital" className="h-10 w-10" />
          <div>
            <h1 className="text-lg font-bold font-heading">Aishnar Digital</h1>
            <p className="text-xs text-muted-foreground">Business Intelligence & Digital Strategy</p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight">
            Free Business <span className="gradient-text">Analysis Request</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get a comprehensive analysis of your business operations, identify inefficiencies, and discover growth opportunities — completely free.
          </p>
        </div>
      </section>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <LeadForm />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Aishnar Digital. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
