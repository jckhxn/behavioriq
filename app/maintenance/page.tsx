import { Wrench, Clock, Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Wrench className="h-10 w-10 text-primary animate-pulse" />
          </div>
          <CardTitle className="text-3xl font-bold">
            Under Maintenance
          </CardTitle>
          <CardDescription className="text-lg">
            We're currently performing scheduled maintenance to improve your
            experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Expected Duration</h3>
                <p className="text-sm text-muted-foreground">
                  We expect to be back shortly. Please check back soon.
                </p>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Your Data is Safe</h3>
                <p className="text-sm text-muted-foreground">
                  All your data is secure and will be available once we're back
                  online.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Thank you for your patience. We'll be back online as soon as
              possible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
