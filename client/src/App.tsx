import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import DemoHub from "@/pages/DemoHub";
import TradeDemo from "@/pages/TradeDemo";
import Dashboard from "@/pages/Dashboard";
import QuotePackage from "@/pages/QuotePackage";
import AiReceptionistDemo from "@/pages/AiReceptionistDemo";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/demo" component={DemoHub} />
      <Route path="/demo/ai-receptionist" component={AiReceptionistDemo} />
      <Route path="/demo/:tradeId" component={TradeDemo} />
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/quote/:id" component={QuotePackage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppRouter />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
