import { Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
             <div className="flex items-center gap-2.5 mb-6">
                <img 
                  src="/curiosift-mark.png" 
                  alt="CurioSift" 
                  className="w-7 h-7 object-contain shrink-0 drop-shadow-sm" 
                />
                <span className="font-extrabold tracking-tight text-xl text-text">
                  Curio<span className="text-primary">Sift</span>
                </span>
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
