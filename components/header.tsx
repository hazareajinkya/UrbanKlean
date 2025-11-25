// app/components/Header.tsx
export default function Header() {
  return (
    <header className="w-full bg-[#fafafa]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-black rounded-sm" />
          <span className="font-bold text-xl text-black select-none">
            MagicalCX
          </span>
        </div>
        {/* Navigation and Actions */}
        <div className="flex items-center space-x-2">
          <nav className="hidden md:flex space-x-6">
            <a
              href="#"
              className="text-gray-500 text-sm font-medium hover:text-black"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-gray-500 text-sm font-medium hover:text-black"
            >
              Resources
            </a>
            <a
              href="#"
              className="text-gray-500 text-sm font-medium hover:text-black"
            >
              Partnerships
            </a>
            <a
              href="#"
              className="text-gray-500 text-sm font-medium hover:text-black"
            >
              Careers
            </a>
          </nav>
          <button className="hidden md:block px-4 py-1 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
            Log in
          </button>
          <button className="px-4 py-1 rounded-md bg-black text-white text-sm font-semibold hover:bg-gray-800 transition">
            Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
