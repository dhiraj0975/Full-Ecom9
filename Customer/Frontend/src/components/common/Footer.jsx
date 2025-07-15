import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, HelpCircle, Gift, UserPlus, ShoppingBag, CreditCard, Star } from 'lucide-react';

const columns = [
  {
    heading: 'ABOUT',
    links: [
      { label: 'Contact Us', url: '/contact' },
      { label: 'About Us', url: '/about' },
      { label: 'Careers', url: '/careers' },
      { label: 'Stories', url: '/stories' },
      { label: 'Press', url: '/press' },
      { label: 'Corporate Information', url: '/corporate' },
    ],
  },
  {
    heading: 'GROUP COMPANIES',
    links: [
      { label: 'Myntra', url: 'https://www.myntra.com/' },
      { label: 'Cleartrip', url: 'https://www.cleartrip.com/' },
      { label: 'Shopsy', url: 'https://www.shopsy.in/' },
    ],
  },
  {
    heading: 'HELP',
    links: [
      { label: 'Payments', url: '/payments' },
      { label: 'Shipping', url: '/shipping' },
      { label: 'Cancellation & Returns', url: '/returns' },
      { label: 'FAQ', url: '/faq' },
    ],
  },
  {
    heading: 'CONSUMER POLICY',
    links: [
      { label: 'Cancellation & Returns', url: '/returns' },
      { label: 'Terms Of Use', url: '/terms' },
      { label: 'Security', url: '/security' },
      { label: 'Privacy', url: '/privacy' },
      { label: 'Sitemap', url: '/sitemap' },
      { label: 'Grievance Redressal', url: '/grievance' },
      { label: 'EPR Compliance', url: '/epr' },
    ],
  },
];

const address = [
  "CustomerStore Pvt. Ltd.",
  "123, E-Commerce Park,",
  "Tech City, India - 560103",
  "CIN : U12345IN2024PTC000001",
  "Telephone: 0120-1234567"
];

const socialLinks = [
  { icon: <Facebook />, url: 'https://facebook.com' },
  { icon: <Twitter />, url: 'https://twitter.com' },
  { icon: <Instagram />, url: 'https://instagram.com' },
  { icon: <Youtube />, url: 'https://youtube.com' },
];

const bottomLinks = [
  { icon: <UserPlus className="h-5 w-5" />, label: 'Become a Seller', url: '/become-seller' },
  { icon: <Star className="h-5 w-5" />, label: 'Advertise', url: '/advertise' },
  { icon: <Gift className="h-5 w-5" />, label: 'Gift Cards', url: '/gift-cards' },
  { icon: <HelpCircle className="h-5 w-5" />, label: 'Help Center', url: '/help' },
];

const paymentIcons = [
  '/images/visa.png', '/images/mastercard.png', '/images/rupay.png', '/images/netbanking.png', '/images/cod.png'
];

const Footer = () => (
  <footer className="bg-gradient-to-r from-[#0a174e] via-[#3a0ca3] to-[#720026] text-white pt-12">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-white/20">
      {columns.map((col, idx) => (
        <div key={idx}>
          <h4 className="text-xs font-bold text-white/70 mb-4 tracking-widest">{col.heading}</h4>
          <ul className="space-y-2">
            {col.links.map((link, i) => (
              <li key={i}>
                {link.url.startsWith('http') ? (
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-100 text-sm">{link.label}</a>
                ) : (
                  <Link to={link.url} className="hover:underline hover:text-blue-100 text-sm">{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      {/* Address & Social */}
      <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
        <h4 className="text-xs font-bold text-white/70 mb-4 tracking-widest">Mail Us:</h4>
        <address className="not-italic text-sm leading-6 text-white/90">
          {address.map((line, i) => <div key={i}>{line}</div>)}
        </address>
        <div className="mt-4">
          <h4 className="text-xs font-bold text-white/70 mb-2 tracking-widest">Social</h4>
          <div className="flex gap-4">
            {socialLinks.map((s, i) => (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-200 transition">{s.icon}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
    {/* Bottom Bar */}
    <div className="bg-gradient-to-r from-[#06102a] via-[#1a0841] to-[#3d002e] py-4 px-4 mt-0 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex flex-wrap gap-6 items-center">
        {bottomLinks.map((b, i) => (
          <Link key={i} to={b.url} className="flex items-center gap-2 text-yellow-200 font-semibold hover:underline">
            {b.icon} {b.label}
          </Link>
        ))}
      </div>
      <div className="text-white/80 text-xs">© {new Date().getFullYear()} CustomerStore.com</div>
      <div className="flex gap-2 items-center">
        {paymentIcons.map((src, i) => (
          <img key={i} src={src} alt="Payment" className="h-6 w-auto" />
        ))}
      </div>
    </div>
  </footer>
);

export default Footer; 