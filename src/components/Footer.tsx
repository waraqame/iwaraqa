import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/support" className="text-gray-600 hover:text-primary flex items-center gap-2">
              <MessageCircle size={18} />
              <span>الدعم الفني</span>
            </Link>
            <a 
              href="mailto:support@waraqa.me" 
              className="text-gray-600 hover:text-primary"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}