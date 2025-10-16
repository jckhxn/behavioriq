import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="px-6 py-20 md:py-32 bg-gradient-to-b from-primary/5 to-primary/10">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-bold mb-6 text-balance text-foreground md:text-5xl">
          Get Answers in Hours — Not Weeks.
        </h2>
        <p className="text-xl text-muted-foreground mb-10 text-pretty leading-relaxed">
          Start your free AI behavioral screening today and take the first step
          toward understanding your child better.
        </p>
        <a href="/trial-assessment">
          <Button
            size="lg"
            className="text-lg font-semibold px-8 py-6 shadow-2xl hover:shadow-xl transition-shadow"
          >
            Start Free Assessment
            <ArrowRight className="ml-2 h-6 w-6" />
          </Button>
        </a>
      </div>
    </section>
  );
}
