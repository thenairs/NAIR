import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type PageRoute = 'home' | 'about' | 'services' | 'industries' | 'resources' | 'case-studies' | 'faq' | 'contact' | 'artificial-intelligence' | 'data-and-ai' | 'terms' | 'privacy';
export type IndustrySector = 'healthcare' | 'finance' | 'legal';

export interface IndustrySubPage {
  id: IndustrySector;
  name: string;
}

export const industrySubPages: IndustrySubPage[] = [
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'finance', name: 'Finance' },
  { id: 'legal', name: 'Legal' },
];

interface NavbarProps {
  onBookCall: () => void;
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, sector?: IndustrySector) => void;
  onOpenAssessment?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onBookCall,
  currentPage,
  onNavigate,
  onOpenAssessment,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [mobileIndustriesOpen, setMobileIndustriesOpen] = useState(false);

  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mobileResourcesOpen, setMobileResourcesOpen] = useState(false);

  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const servicesDropdownRef = useRef<HTMLDivElement | null>(null);

  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const resourcesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Scroll Detection for Seamless Top-Transparency & Scrolled Transition
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Exact Requested Navbar Setup: About > Services > Industries > Resources > Case Studies > Contact Us
  const navLinks: { name: string; page: PageRoute; dropdownType?: 'services' | 'industries' | 'resources' }[] = [
    { name: 'About', page: 'about' },
    { name: 'Services', page: 'services', dropdownType: 'services' },
    { name: 'Industries', page: 'industries', dropdownType: 'industries' },
    { name: 'Resources', page: 'resources', dropdownType: 'resources' },
    { name: 'Case Studies', page: 'case-studies' },
    { name: 'Contact Us', page: 'contact' },
  ];

  // Mouse hover handlers for Services dropdown
  const handleServicesMouseEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    setServicesOpen(true);
  };

  const handleServicesMouseLeave = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
    }
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesOpen(false);
    }, 180);
  };

  // Mouse hover handlers for Industries dropdown
  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIndustriesOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIndustriesOpen(false);
    }, 180);
  };

  // Mouse hover handlers for Resources dropdown
  const handleResourcesMouseEnter = () => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
      resourcesTimeoutRef.current = null;
    }
    setResourcesOpen(true);
  };

  const handleResourcesMouseLeave = () => {
    if (resourcesTimeoutRef.current) {
      clearTimeout(resourcesTimeoutRef.current);
    }
    resourcesTimeoutRef.current = setTimeout(() => {
      setResourcesOpen(false);
    }, 180);
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setServicesOpen(false);
        setIndustriesOpen(false);
        setResourcesOpen(false);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target as Node)) {
        setServicesOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIndustriesOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    };
  }, []);

  const handleLinkClick = (page: PageRoute) => {
    setMobileMenuOpen(false);
    setServicesOpen(false);
    setIndustriesOpen(false);
    setResourcesOpen(false);
    onNavigate(page);
  };

  const handleSubSectorClick = (sector: IndustrySector) => {
    setMobileMenuOpen(false);
    setIndustriesOpen(false);
    onNavigate('industries', sector);
  };

  const isDarkHeroTop = currentPage === 'home' && !isScrolled && !mobileMenuOpen;

  const getNavLinkClasses = (isActive: boolean, isOpen = false) => {
    if (isDarkHeroTop) {
      if (isActive || isOpen) {
        return 'text-[#1D4ED8] font-bold';
      }
      return 'text-slate-800 hover:text-[#1D4ED8] font-semibold transition-colors';
    }
    if (isActive || isOpen) {
      return 'text-[#1D4ED8] font-bold';
    }
    return 'text-slate-700 hover:text-[#1D4ED8] font-semibold';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out ${
        mobileMenuOpen
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-md py-0'
          : isScrolled
            ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] py-0'
            : currentPage === 'home'
              ? 'bg-transparent border-none border-b-0 shadow-none py-1 sm:py-1.5'
              : 'bg-white/95 backdrop-blur-md border-b border-slate-200/50 shadow-none py-0'
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ease-in-out ${
          isScrolled ? 'h-14 sm:h-15' : 'h-15 sm:h-16'
        }`}
      >
        
        {/* Brand Logo & Desktop Navigation Links in unified glass capsule till Contact Us */}
        <div
          className={`flex items-center transition-all duration-300 ${
            isDarkHeroTop
              ? 'p-1.5 pr-4 sm:pr-5 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/90 shadow-[0_4px_20px_-2px_rgba(15,23,42,0.08)] gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-5'
              : 'gap-5 lg:gap-8'
          }`}
        >
          {/* Brand: Official Logo with Better Bright Gradient Shade Background */}
          <div
            onClick={() => handleLinkClick('home')}
            className={`flex items-center cursor-pointer select-none group transition-all duration-300 ${
              isDarkHeroTop
                ? 'px-3 py-1 sm:px-3.5 sm:py-1 rounded-full bg-gradient-to-r from-white via-[#F0F7FF] to-[#E0EFFF] border border-white/90 shadow-[0_2px_10px_rgba(37,99,235,0.18),inset_0_1px_1px_rgba(255,255,255,1)] hover:brightness-105 hover:scale-102'
                : 'py-0.5 hover:opacity-90'
            }`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleLinkClick('home')}
            aria-label="NAIR.AI Homepage"
          >
            <img
              src="/images/logo.png"
              alt="NAIR.AI"
              className="h-6 sm:h-6.5 md:h-7 w-auto object-contain transition-transform duration-300 group-hover:scale-102"
            />
          </div>

          {/* Vertical Divider inside glass capsule at Hero Top */}
          {isDarkHeroTop && (
            <div className="hidden md:block h-4 w-px bg-slate-300/80 shrink-0" aria-hidden="true" />
          )}

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-3.5 lg:gap-6">
          {navLinks.map((link) => {
            const isActive =
              currentPage === link.page ||
              (link.page === 'services' && (currentPage === 'services' || currentPage === 'artificial-intelligence' || currentPage === 'data-and-ai')) ||
              (link.page === 'resources' && (currentPage === 'resources' || currentPage === 'faq')) ||
              (link.page === 'contact' && currentPage === 'contact');

            // Services Dropdown
            if (link.dropdownType === 'services') {
              return (
                <div
                  key={link.name}
                  ref={servicesDropdownRef}
                  className="relative py-2"
                  onMouseEnter={handleServicesMouseEnter}
                  onMouseLeave={handleServicesMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => handleLinkClick('services')}
                    className={`inline-flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer py-1 relative group ${getNavLinkClasses(
                      isActive,
                      servicesOpen
                    )}`}
                    aria-expanded={servicesOpen}
                    aria-haspopup="true"
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-250 ease-out ${
                        servicesOpen
                          ? 'rotate-180 text-[#1D4ED8]'
                          : 'text-slate-500 group-hover:text-[#1D4ED8]'
                      }`}
                    />
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1D4ED8]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 pointer-events-auto"
                      >
                        <div className="w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              handleLinkClick('services');
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] hover:bg-blue-50/75 transition-all duration-150 cursor-pointer block"
                          >
                            <span className="block font-bold">All Services</span>
                            <span className="block text-[11px] text-slate-400 font-normal">Platform OS &amp; Capabilities</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              handleLinkClick('artificial-intelligence');
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] hover:bg-blue-50/75 transition-all duration-150 cursor-pointer block"
                          >
                            <span className="block font-bold">Artificial Intelligence</span>
                            <span className="block text-[11px] text-slate-400 font-normal">Development &amp; Automation</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setServicesOpen(false);
                              handleLinkClick('data-and-ai');
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#0284C7] hover:bg-sky-50/75 transition-all duration-150 cursor-pointer block"
                          >
                            <span className="block font-bold">Data &amp; AI Foundation</span>
                            <span className="block text-[11px] text-slate-400 font-normal">Context &amp; Retrieval Infra</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Industries Dropdown
            if (link.dropdownType === 'industries') {
              return (
                <div
                  key={link.name}
                  ref={dropdownRef}
                  className="relative py-2"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => handleLinkClick('industries')}
                    className={`inline-flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer py-1 relative group ${getNavLinkClasses(
                      isActive,
                      industriesOpen
                    )}`}
                    aria-expanded={industriesOpen}
                    aria-haspopup="true"
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-250 ease-out ${
                        industriesOpen
                          ? isDarkHeroTop
                            ? 'rotate-180 text-[#38BDF8]'
                            : 'rotate-180 text-[#1D4ED8]'
                          : isDarkHeroTop
                            ? 'text-slate-300 group-hover:text-white'
                            : 'text-slate-400 group-hover:text-[#1D4ED8]'
                      }`}
                    />
                    {isActive && (
                      <span
                        className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${
                          isDarkHeroTop
                            ? 'bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]'
                            : 'bg-[#1D4ED8]'
                        }`}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {industriesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 pointer-events-auto"
                      >
                        <div className="w-44 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 text-left">
                          {industrySubPages.map((sub) => (
                            <button
                              key={sub.id}
                              type="button"
                              onClick={() => handleSubSectorClick(sub.id)}
                              className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] hover:bg-blue-50/75 transition-all duration-150 cursor-pointer"
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Resources Dropdown
            if (link.dropdownType === 'resources') {
              return (
                <div
                  key={link.name}
                  ref={resourcesDropdownRef}
                  className="relative py-2"
                  onMouseEnter={handleResourcesMouseEnter}
                  onMouseLeave={handleResourcesMouseLeave}
                >
                  <button
                    type="button"
                    onClick={() => handleLinkClick('resources')}
                    className={`inline-flex items-center gap-1.5 text-sm transition-all duration-200 cursor-pointer py-1 relative group ${getNavLinkClasses(
                      isActive,
                      resourcesOpen
                    )}`}
                    aria-expanded={resourcesOpen}
                    aria-haspopup="true"
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-250 ease-out ${
                        resourcesOpen
                          ? 'rotate-180 text-[#1D4ED8]'
                          : 'text-slate-500 group-hover:text-[#1D4ED8]'
                      }`}
                    />
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1D4ED8]" />
                    )}
                  </button>

                  <AnimatePresence>
                    {resourcesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50 pointer-events-auto"
                      >
                        <div className="w-56 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl p-1.5 space-y-0.5 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              setResourcesOpen(false);
                              handleLinkClick('resources');
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] hover:bg-blue-50/75 transition-all duration-150 cursor-pointer flex items-center justify-between"
                          >
                            <span>FAQ &amp; Knowledge Base</span>
                            <span className="font-mono text-[10px] text-slate-400 font-bold">25 FAQs</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResourcesOpen(false);
                              if (onOpenAssessment) {
                                onOpenAssessment();
                              } else {
                                handleLinkClick('home');
                              }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] hover:bg-blue-50/75 transition-all duration-150 cursor-pointer flex items-center justify-between"
                          >
                            <span>AI Readiness Diagnostic</span>
                            <span className="font-mono text-[10px] text-[#1D4ED8] font-bold">Launch</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResourcesOpen(false);
                              handleLinkClick('home');
                              setTimeout(() => {
                                const el = document.getElementById('calculator');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }, 150);
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-semibold text-slate-700 hover:text-[#1D4ED8] hover:bg-blue-50/75 transition-all duration-150 cursor-pointer flex items-center justify-between"
                          >
                            <span>ROI Impact Calculator</span>
                            <span className="font-mono text-[10px] text-emerald-600 font-bold">Estimator</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // Standard navigation link
            return (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.page)}
                className={`text-sm transition-all duration-200 cursor-pointer py-1 relative ${getNavLinkClasses(
                  isActive
                )}`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1D4ED8]" />
                )}
              </button>
            );
          })}
          </nav>
        </div>

        {/* Right Action CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onBookCall();
            }}
            className={`px-4 sm:px-4.5 py-2 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer hover:scale-102 active:scale-98 whitespace-nowrap ${
              isDarkHeroTop
                ? 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-[0_4px_20px_rgba(29,78,216,0.4)] hover:shadow-[0_6px_25px_rgba(29,78,216,0.6)] border border-blue-400/35'
                : 'bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30'
            }`}
          >
            <span>Book an AI strategy call</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`md:hidden p-2 rounded-xl focus:outline-hidden cursor-pointer transition-colors ${
            isDarkHeroTop && !mobileMenuOpen
              ? 'bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-800 hover:text-[#1D4ED8] shadow-sm'
              : 'text-slate-700 hover:text-black'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const isActive =
              currentPage === link.page ||
              (link.page === 'services' && (currentPage === 'services' || currentPage === 'artificial-intelligence' || currentPage === 'data-and-ai')) ||
              (link.page === 'resources' && (currentPage === 'resources' || currentPage === 'faq')) ||
              (link.page === 'contact' && currentPage === 'contact');

            // Services Accordion on Mobile
            if (link.dropdownType === 'services') {
              return (
                <div key={link.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#1D4ED8] font-bold'
                        : 'text-slate-800 hover:text-[#1D4ED8]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        mobileServicesOpen ? 'rotate-180 text-[#1D4ED8]' : ''
                      }`}
                    />
                  </button>

                  {mobileServicesOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleLinkClick('services')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] hover:bg-blue-50/60 transition-colors cursor-pointer block"
                      >
                        All Services
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('artificial-intelligence')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] hover:bg-blue-50/60 transition-colors cursor-pointer block"
                      >
                        Artificial Intelligence
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLinkClick('data-and-ai')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#0284C7] hover:bg-sky-50/60 transition-colors cursor-pointer block"
                      >
                        Data &amp; AI Foundation
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            // Industries Accordion on Mobile
            if (link.dropdownType === 'industries') {
              return (
                <div key={link.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setMobileIndustriesOpen(!mobileIndustriesOpen)}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#1D4ED8] font-bold'
                        : 'text-slate-800 hover:text-[#1D4ED8]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        mobileIndustriesOpen ? 'rotate-180 text-[#1D4ED8]' : ''
                      }`}
                    />
                  </button>

                  {mobileIndustriesOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1">
                      {industrySubPages.map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => handleSubSectorClick(sub.id)}
                          className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] hover:bg-blue-50/60 transition-colors cursor-pointer"
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Resources Accordion on Mobile
            if (link.dropdownType === 'resources') {
              return (
                <div key={link.name} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setMobileResourcesOpen(!mobileResourcesOpen)}
                    className={`w-full flex items-center justify-between py-2.5 px-3 rounded-xl text-base font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-[#1D4ED8] font-bold'
                        : 'text-slate-800 hover:text-[#1D4ED8]'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                        mobileResourcesOpen ? 'rotate-180 text-[#1D4ED8]' : ''
                      }`}
                    />
                  </button>

                  {mobileResourcesOpen && (
                    <div className="pl-4 pr-1 py-1 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleLinkClick('resources')}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] hover:bg-blue-50/60 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>FAQ &amp; Knowledge Base</span>
                        <span className="font-mono text-xs text-slate-400">25 FAQs</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          if (onOpenAssessment) {
                            onOpenAssessment();
                          } else {
                            handleLinkClick('home');
                          }
                        }}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] hover:bg-blue-50/60 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>AI Readiness Diagnostic</span>
                        <span className="font-mono text-xs text-[#1D4ED8]">Launch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleLinkClick('home');
                          setTimeout(() => {
                            const el = document.getElementById('calculator');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }, 150);
                        }}
                        className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 hover:text-[#1D4ED8] hover:bg-blue-50/60 transition-colors cursor-pointer flex items-center justify-between"
                      >
                        <span>ROI Impact Calculator</span>
                        <span className="font-mono text-xs text-emerald-600">Estimator</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.page)}
                className={`block w-full text-left py-2.5 px-3 rounded-xl text-base font-semibold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-[#1D4ED8] font-bold'
                    : 'text-slate-800 hover:text-[#1D4ED8]'
                }`}
              >
                {link.name}
              </button>
            );
          })}

          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen(false);
                onBookCall();
              }}
              className="w-full py-3 rounded-full bg-[#1D4ED8] text-white text-sm font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Book an AI strategy call</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
