'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, BarChart3, Home, BookOpen, History, GraduationCap, Compass, GitCommit } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      active: pathname === '/',
    },
    {
      href: '/catalog',
      label: 'Catalog',
      icon: Network,
      active: pathname === '/catalog' || pathname.startsWith('/models/'),
    },
    {
      href: '/compare',
      label: 'Compare',
      icon: BarChart3,
      active: pathname === '/compare',
    },
    {
      href: '/evolution',
      label: 'Evolution',
      icon: History,
      active: pathname === '/evolution',
    },
    {
      href: '/research-map',
      label: 'Research Map',
      icon: Compass,
      active: pathname === '/research-map',
    },
    {
      href: '/architecture-patterns',
      label: 'Patterns',
      icon: GitCommit,
      active: pathname === '/architecture-patterns',
    },
    {
      href: '/papers',
      label: 'Papers',
      icon: GraduationCap,
      active: pathname === '/papers',
    },
    {
      href: '/learn',
      label: 'Learn',
      icon: BookOpen,
      active: pathname === '/learn',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1f2937] bg-[#020617]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22d3ee]/10 border border-[#22d3ee]/20 text-[#22d3ee] group-hover:bg-[#22d3ee]/20 group-hover:scale-105 transition-all duration-300">
            <Network className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-[#22d3ee] via-[#67e8f9] to-[#a5f3fc] bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
            NeuralExplorer
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs xl:px-4 xl:py-2 xl:text-sm font-medium transition-all duration-300",
                  link.active
                    ? "text-[#020617] bg-[#22d3ee] border border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                    : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617] border border-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex lg:hidden items-center justify-center h-10 w-10 rounded-xl border border-[#1f2937] text-[#9ca3af] hover:text-white hover:bg-slate-900 focus:outline-none transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <div className="flex flex-col gap-1.5 justify-center items-center w-5 h-5">
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out origin-center",
                isOpen ? "rotate-45 translate-y-[8px]" : ""
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out",
                isOpen ? "opacity-0 scale-x-0" : ""
              )}
            />
            <span
              className={cn(
                "block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ease-out origin-center",
                isOpen ? "-rotate-45 -translate-y-[8px]" : ""
              )}
            />
          </div>
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-16 left-0 w-full lg:hidden overflow-hidden border-b border-[#1f2937] bg-[#020617]/95 backdrop-blur-lg px-4 py-3 shadow-xl z-50"
          >
            <nav className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all duration-300 border border-slate-900/60 bg-slate-950/20",
                      link.active
                        ? "text-[#020617] bg-[#22d3ee] border-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                        : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617]/50 hover:border-slate-800"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
