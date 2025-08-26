"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("dark", !isDarkMode);
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800 dark:text-white">
          Conform-Edu
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>
          <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Features
          </Link>
          <Link href="#introduction" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Introduction
          </Link>
          <Link href="#login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Login
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleTheme}
            className={cn("bg-gray-200 dark:bg-gray-700")}
          />
          <Button variant="outline" className="hidden md:block">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;