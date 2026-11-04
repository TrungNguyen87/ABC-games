import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Github, Sparkles, BookOpen } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GitHubPagesModal({ isOpen, onClose }: GitHubPagesModalProps) {
  const [copied, setCopied] = useState(false);
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState<number | null>(null);

  if (!isOpen) return null;

  const sampleWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleWorkflow);
    setCopied(true);
    sounds.playChime();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border-4 border-yellow-400 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playPop();
            onClose();
          }}
          className="absolute top-5 right-5 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Parent Gate: keeps toddlers in the game */}
        {!parentUnlocked ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Grown-Ups Zone</h3>
            <p className="text-slate-600 mb-6">
              To view the GitHub Pages deployment guide, please tap the correct answer:
            </p>
            <div className="text-xl font-bold text-slate-800 mb-4">What is 2 + 3 = ?</div>
            <div className="flex justify-center gap-4">
              {[4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (num === 5) {
                      setParentUnlocked(true);
                      sounds.playChime();
                    } else {
                      sounds.playBoing();
                    }
                  }}
                  className="w-16 h-16 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-2xl rounded-2xl shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none cursor-pointer"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center">
                <Github className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Deploy to GitHub Pages
                </h3>
                <p className="text-sm text-slate-500">
                  This game is 100% client-side with relative asset paths ready for static hosting!
                </p>
              </div>
            </div>

            {/* Step 1: Configured relative paths */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>Base Path Already Configured!</span>
              </div>
              <p className="text-xs text-emerald-700">
                In <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">vite.config.ts</code>, we set <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">base: './'</code> so assets load seamlessly whether deployed at the root or under <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono">username.github.io/repo-name/</code>.
              </p>
            </div>

            {/* Quick deployment methods */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-800">Choose your favorite deploy method:</h4>

              {/* Method A: Automatic GitHub Actions (Recommended) */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">
                    Option 1: GitHub Actions (Automatic, Recommended)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shadow-sm transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Workflow!' : 'Copy Workflow'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  Create a file in your GitHub repository at <code className="bg-slate-200 px-1 rounded font-mono">.github/workflows/deploy.yml</code> and paste the copied workflow. Then in GitHub repo <strong>Settings → Pages → Source</strong>, select <strong>GitHub Actions</strong>.
                </p>
              </div>

              {/* Method B: Fast Build & gh-pages */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="font-bold text-slate-900 text-sm block mb-1">
                  Option 2: Build & Push `dist` folder
                </span>
                <p className="text-xs text-slate-600 mb-2">
                  Run <code className="bg-slate-200 px-1 rounded font-mono">npm run build</code> locally. Then publish the created <code className="bg-slate-200 px-1 rounded font-mono">dist</code> folder to the <code className="bg-slate-200 px-1 rounded font-mono">gh-pages</code> branch:
                </p>
                <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-xl font-mono text-xs overflow-x-auto">
                  npm run build<br />
                  npx gh-pages -d dist
                </div>
              </div>
            </div>

            {/* Game Features note */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Created with 💖 for 3-4 year old toddlers. Works on iPad, tablet, phone & laptop.
              </span>
              <button
                onClick={() => {
                  sounds.playPop();
                  onClose();
                }}
                className="px-5 py-2 bg-yellow-400 text-yellow-950 font-black rounded-full shadow-[0_4px_0_#ca8a04] active:translate-y-1 cursor-pointer"
              >
                Back to Game!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
