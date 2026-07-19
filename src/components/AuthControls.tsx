import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from '@clerk/clerk-react';
import { Cloud, Monitor } from 'lucide-react';
import { cn } from '../utils/cn';
import { isClerkEnabled } from '../config/clerk';
import { USE_ML_BACKEND } from '../config/backend';

function MlModeBadge({ className }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isClerkEnabled || !isLoaded) return null;

  const cloud = USE_ML_BACKEND && Boolean(isSignedIn);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide border',
        cloud
          ? 'text-brand-200 bg-brand-950/50 border-brand-500/30'
          : 'text-snapid-muted bg-snapid-bg-elevated/60 border-[#e8dcc8]/10',
        className
      )}
      title={cloud ? 'Using cloud ML backend' : 'Using local browser models'}
    >
      {cloud ? (
        <>
          <Cloud className="w-3 h-3" aria-hidden="true" />
          Cloud AI
        </>
      ) : (
        <>
          <Monitor className="w-3 h-3" aria-hidden="true" />
          {isSignedIn ? 'Local AI' : 'Local AI · sign in for cloud'}
        </>
      )}
    </span>
  );
}

export function AuthControls({ showModeBadge = true }: { showModeBadge?: boolean }) {
  if (!isClerkEnabled) return null;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {showModeBadge && <MlModeBadge className="hidden sm:inline-flex" />}
      <SignedOut>
        <SignInButton mode="modal">
          <button type="button" className="text-sm font-semibold text-snapid-muted hover:text-brand-300 transition-colors px-2 py-1.5">
            Sign in
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8 sm:h-9 sm:w-9',
            },
          }}
        />
      </SignedIn>
    </div>
  );
}
