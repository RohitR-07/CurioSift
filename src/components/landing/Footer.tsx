import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
             <div className="flex items-center gap-3 mb-6">
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#paint0_linear_footer)" />
                  <path d="M12 21H21C21.5523 21 22 20.5523 22 20V10C22 9.44772 21.5523 9 21 9H12C10.3431 9 9 10.3431 9 12V21H12ZM12 21V19M12 21C10.8954 21 10 20.1046 10 19V12C10 10.8954 10.8954 10 12 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.5 13.5L16.5 11.5L17.5 13.5L19.5 14.5L17.5 15.5L16.5 17.5L15.5 15.5L13.5 14.5L15.5 13.5Z" fill="white" />
                  <defs>
                    <linearGradient id="paint0_linear_footer" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563EB" />
                      <stop offset="1" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-bold tracking-tight text-xl text-text">CurioSift</span>
             </div>
             <p className="text-text-secondary max-w-sm mb-6 font-medium">
               Turn dense textbooks into instant study guides. Upload materials, generate notes, and learn faster.
             </p>
             <div className="flex gap-4">
               <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                 <Twitter className="w-5 h-5" />
               </a>
               <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                 <Github className="w-5 h-5" />
               </a>
               <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                 <Linkedin className="w-5 h-5" />
               </a>
             </div>
          </div>

          <div>
            <h4 className="font-bold text-text mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#features" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Features</a></li>
              <li><a href="#how-it-works" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">How it works</a></li>
              <li><a href="#faq" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">FAQ</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-text mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Privacy Policy</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Terms of Service</a></li>
              <li><a href="#" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary font-medium">
            © {new Date().getFullYear()} CurioSift. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
