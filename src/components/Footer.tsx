const Footer = () => {
  return (
    <footer className="flex flex-col items-center justify-center p-4 bg-gray-800 text-white">
      <div className="text-center">
        <p className="mb-2">© {new Date().getFullYear()} Conform-Edu. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;