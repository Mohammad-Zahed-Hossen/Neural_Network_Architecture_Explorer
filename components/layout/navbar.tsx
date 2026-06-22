'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Network, BarChart3, Home, BookOpen, History, Award, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function Navbar() {
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 w-full border-b border-[#1f2937] bg-[#020617]/80 backdrop-blur-md">
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

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
                  link.active
                    ? "text-[#020617] bg-[#22d3ee] border border-[#22d3ee] shadow-[0_0_12px_rgba(34,211,238,0.2)]"
                    : "text-[#9ca3af] hover:text-[#e5e7eb] hover:bg-[#020617] border border-transparent"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
