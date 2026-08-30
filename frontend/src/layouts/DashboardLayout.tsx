import { FileText, LogOut, Menu, Moon, Plus, Sun, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useMatch, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import Logo from "@/components/Logo";

function DashboardLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const folderMatch = useMatch("/dashboard/folders/:folderId/*");
  const currentFolderId = folderMatch?.params.folderId;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  const asideRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const asideEl = asideRef.current;
    const menuButtonEl = menuButtonRef.current;
    if (!asideEl) return;

    const focusableSelector =
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';
    const focusableEls = Array.from(
      asideEl.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const firstEl = focusableEls[0];
    const lastEl = focusableEls.at(-1);

    firstEl?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      menuButtonEl?.focus();
    };
  }, [isMobileMenuOpen]);

  const handleThemeToggle = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark((previous) => !previous);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleCreateNote = () => {
    if (currentFolderId) {
      navigate(`/dashboard/folders/${currentFolderId}/notes/new`);
      return;
    }

    navigate("/dashboard/notes/new");
  };

  const navigation = [
    {
      label: "Notes",
      href: "/dashboard",
      icon: FileText,
    },
  ];

  const sidebarContent = (
    <>
      <div className="flex h-20 items-center gap-3 border-b px-5">
        <Logo size="sm" className="shrink-0" />

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold tracking-tight">
            NotesHub
          </h1>

          <p className=" text-xs text-muted-foreground">
            Productivity Workspace
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={closeMobileMenu}
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </Button>
      </div>
      <div className="px-4 py-5">
        <Button onClick={handleCreateNote} className="w-full gap-2">
          <Plus className="size-4" />
          New Note
        </Button>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === "/dashboard"}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="space-y-1 border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleThemeToggle}
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}

          {isDark ? "Light mode" : "Dark mode"}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card md:flex">
        {sidebarContent}
      </aside>

      {isMobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={closeMobileMenu}
          />
          <dialog
            ref={asideRef}
            aria-label="Navigation menu"
            open
            className="m-0 h-screen max-h-none w-70 max-w-[85vw] border-0 bg-card p-0 shadow-xl md:hidden fixed inset-y-0 left-0 z-50 flex flex-col"
          >
            {sidebarContent}
          </dialog>
        </>
      )}

      <div className="min-h-screen md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-4 backdrop-blur md:hidden">
          <Button
            ref={menuButtonRef}
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <div className="ml-3 flex items-center gap-2">
            <Logo size="sm" />

            <span className="text-sm font-bold">NotesHub</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={handleThemeToggle}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
        </header>

        <main className="min-w-0">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
