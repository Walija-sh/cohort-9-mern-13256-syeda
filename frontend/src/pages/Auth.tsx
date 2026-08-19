import { useEffect } from "react";
import { FileText } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Card, CardContent } from "../components/ui/card";
import LoginForm from "../components/auth/LoginForm";
import SignupForm from "../components/auth/SignupForm";

import { useAppDispatch } from "../store/hooks";
import { clearError } from "../store/authSlice";

function Auth() {
  const location = useLocation();
  const dispatch = useAppDispatch();

  const isSignup = location.pathname === "/signup";

  useEffect(() => {
    dispatch(clearError());
  }, [location.pathname, dispatch]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-8 text-center">
           <div className="relative mx-auto mb-4 flex size-12 items-center justify-center">
    <div className="absolute bottom-0.5 right-1 size-5 rotate-12 rounded-md bg-primary/30" />

    <FileText className="relative size-7 text-primary" strokeWidth={2} />
  </div>

            <h1 className="text-2xl font-bold tracking-tight">
              NotesHub
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              {isSignup
                ? "Create your workspace"
                : "Productivity Workspace"}
            </p>
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold">
              {isSignup ? "Create an account" : "Welcome back"}
            </h2>
          </div>

          {isSignup ? <SignupForm /> : <LoginForm />}
        </CardContent>
      </Card>
    </main>
  );
}

export default Auth;